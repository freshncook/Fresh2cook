import { getCurrentSession } from "@/lib/auth";

/*
 * Small helpers on top of lib/auth (fresh2cook_session cookie).
 *   - Admin    = staff session with role SUPER_ADMIN
 *   - Customer = customer session (mobile + password login)
 */

export async function getAdminSession() {
  const session = await getCurrentSession();
  if (!session || session.kind !== "staff") return null;
  if (String(session.role).toUpperCase() !== "SUPER_ADMIN") return null;
  return session;
}

export async function getCustomerSession() {
  const session = await getCurrentSession();
  if (!session || session.kind !== "customer") return null;
  return session;
}

export function cleanMobile(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  // accept +91 / 0 prefixes, keep last 10 digits
  return digits.length > 10 ? digits.slice(-10) : digits;
}
