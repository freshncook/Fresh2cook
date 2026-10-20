import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";

/*
 * Shared layout for Fresh2Cook policy pages (Privacy, Terms, Refund, FAQs …).
 * Text is a starting point — the business owner should review it before going live.
 */

export type LegalSection = { heading: string; body: (string | string[])[] };

const LINKS = [
  ["FAQs", "/faqs"],
  ["Refund Policy", "/return-policy"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms-conditions"],
  ["Policies & Compliance", "/policies-compliances"],
  ["Disclaimer", "/disclaimer"],
] as const;

export default async function LegalPage({
  title,
  intro,
  sections,
  current,
}: {
  title: string;
  intro: string;
  sections: (s: Awaited<ReturnType<typeof getStoreSettings>>) => LegalSection[];
  current: string;
}) {
  const settings = await getStoreSettings();
  const phone = settings.supportPhone.replace(/\D/g, "").slice(-10);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto grid max-w-5xl gap-4 px-3 py-4 md:grid-cols-[200px_minmax(0,1fr)] md:px-5">
        <nav className="-mx-3 flex gap-1.5 overflow-x-auto px-3 md:mx-0 md:block md:space-y-0.5 md:px-0">
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`block shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold md:text-[13px] ${
                href === current ? "bg-emerald-600 text-white md:bg-emerald-50 md:text-emerald-800" : "border border-slate-200 bg-white text-slate-600 md:border-0 md:bg-transparent hover:md:bg-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h1 className="text-[20px] font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-[13px] leading-6 text-slate-600">{intro}</p>
          <p className="mt-1 text-[11px] text-slate-400">{settings.businessName} · Last updated October 2026</p>

          <div className="mt-4 space-y-4">
            {sections(settings).map((s) => (
              <section key={s.heading}>
                <h2 className="text-[15px] font-semibold text-slate-900">{s.heading}</h2>
                {s.body.map((b, i) =>
                  Array.isArray(b) ? (
                    <ul key={i} className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] leading-6 text-slate-700">
                      {b.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className="mt-1.5 text-[13px] leading-6 text-slate-700">
                      {b}
                    </p>
                  )
                )}
              </section>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-900">
            Questions? <a href={`https://wa.me/91${phone}`} className="font-semibold underline">WhatsApp {phone}</a> ·{" "}
            <a href={`mailto:${settings.supportEmail}`} className="font-semibold underline">{settings.supportEmail}</a> · {settings.businessAddress}
          </div>
        </article>
      </div>
    </div>
  );
}
