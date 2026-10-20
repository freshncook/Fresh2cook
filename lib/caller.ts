/*
 * Who is calling this API? middleware.ts checks the login cookie and passes the result
 * in x-f2c-* headers (anything the browser sends with these names is removed first).
 */
export type Caller = { kind: "admin" | "staff" | "customer" | "rider" | "guest"; id: number; mobile: string; role: string };

export function callerOf(req: Request): Caller {
  const h = req.headers;
  const kind = (h.get("x-f2c-kind") || "guest") as Caller["kind"];
  return { kind, id: Number(h.get("x-f2c-id") || 0), mobile: String(h.get("x-f2c-mobile") || ""), role: String(h.get("x-f2c-role") || "") };
}

const last10 = (v: unknown) => String(v || "").replace(/\D/g, "").slice(-10);

/** Customers may only touch their own orders; staff and admin may touch any */
export function ownsOrder(req: Request, orderPhone: string | null | undefined) {
  const c = callerOf(req);
  if (c.kind === "admin" || c.kind === "staff") return true;
  return c.kind === "customer" && !!c.mobile && last10(orderPhone) === c.mobile;
}

/** Riders may only touch deliveries assigned to them; admin may touch any */
export function ownsAssignment(req: Request, deliveryBoyId: number | null | undefined) {
  const c = callerOf(req);
  if (c.kind === "admin" || c.kind === "staff") return true;
  return c.kind === "rider" && Number(deliveryBoyId) === c.id;
}
