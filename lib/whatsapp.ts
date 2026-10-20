// WhatsApp Cloud API (Meta) के जरिए Delivery OTP भेजने का helper.
//
// ज़रूरी .env variables:
//   WHATSAPP_TOKEN             -> Meta permanent access token
//   WHATSAPP_PHONE_NUMBER_ID   -> WhatsApp Business phone number ID
//   WHATSAPP_OTP_TEMPLATE      -> approved template का नाम (Authentication category)
// वैकल्पिक:
//   WHATSAPP_TEMPLATE_LANG     -> default "en_US"
//   WHATSAPP_OTP_COPY_BUTTON   -> "false" करें अगर template में Copy Code button नहीं है
//   WHATSAPP_API_VERSION       -> default "v21.0"
//   DEFAULT_COUNTRY_CODE       -> default "91"

export type WhatsAppResult =
  | { ok: true; dev?: boolean }
  | { ok: false; error: string };

// "98765 43210", "+91 98765-43210", "098765 43210" -> "919876543210"
export function normalizePhone(raw: unknown): string | null {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;

  const cc = (process.env.DEFAULT_COUNTRY_CODE || "91").replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = cc + digits.slice(1);
  } else if (digits.length === 10) {
    digits = cc + digits;
  }

  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

export function maskPhone(phone: string): string {
  return phone.length > 4 ? `${"X".repeat(phone.length - 4)}${phone.slice(-4)}` : phone;
}

export async function sendWhatsAppOtp(
  phone: string,
  otp: string
): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_OTP_TEMPLATE;

  if (!token || !phoneNumberId || !template) {
    if (process.env.NODE_ENV !== "production") {
      // Development में सिर्फ server console में OTP दिखेगा
      console.warn(`[DEV] WhatsApp configured नहीं है. OTP for ${phone}: ${otp}`);
      return { ok: true, dev: true };
    }
    return { ok: false, error: "WhatsApp OTP service configured नहीं है" };
  }

  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";
  const withCopyButton = process.env.WHATSAPP_OTP_COPY_BUTTON !== "false";

  const components: unknown[] = [
    { type: "body", parameters: [{ type: "text", text: otp }] },
  ];

  // Authentication template के Copy Code button के लिए OTP दोबारा चाहिए
  if (withCopyButton) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: otp }],
    });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: { name: template, language: { code: lang }, components },
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const reason = data?.error?.message || `HTTP ${res.status}`;
      console.error("WHATSAPP SEND ERROR:", res.status, data?.error);
      return { ok: false, error: `WhatsApp message नहीं भेजा जा सका: ${reason}` };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("WHATSAPP SEND EXCEPTION:", err?.message || err);
    return { ok: false, error: "WhatsApp service से connect नहीं हो सका" };
  }
}
