import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * "Refer a friend" leads from the home page popup: friend's name, mobile, pincode.
 * Saved in the AppSetting table (key "referralLeads"). When that friend places the first
 * order, they join the referrer's team (welcome bonus) and the referrer earns the reward
 * after delivery — same rules as the invite link.
 */
export type ReferralLead = {
  id: string;
  at: number;
  friendName: string;
  friendMobile: string;
  pincode: string;
  referrerName: string;
  referrerMobile: string;
  referrerCode: string;
  note?: string;
};

const KEY = "referralLeads";
const MAX = 5000;

export async function readLeads(): Promise<ReferralLead[]> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === KEY);
    const v = row ? JSON.parse(String(row.value || "[]")) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function saveLeads(list: ReferralLead[]) {
  await writeSetting(KEY, JSON.stringify(list.slice(-MAX)));
}

export async function leadForPhone(mobile: string) {
  const m = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (m.length !== 10) return null;
  const list = await readLeads();
  // first person who referred this friend gets the credit
  return list.find((l) => l.friendMobile === m) || null;
}
