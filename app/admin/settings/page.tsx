"use client";

import { useEffect, useMemo, useState } from "react";
import { cleanPackLabel, packGrams, parsePackSizes, priceForPack, sortPackSizes, type PackSize } from "@/lib/pack-price";

/*
 * Admin > Settings — saved in the database (AppSetting table).
 * Cart, checkout, rider commission and Refer & Earn read these values.
 */

type Settings = {
  freeDeliveryTarget: number;
  deliveryCharge: number;
  handlingCharge: number;
  riderCommission: number;
  referralReward: number;
  referralWelcome: number;
  walletExpiryDays: number;
  packExtra500: number;
  packExtra250: number;
  processingReward: number;
  businessName: string;
  supportPhone: string;
  supportEmail: string;
  businessAddress: string;
  servicePincodes: string;
  serviceAreaName: string;
  packSizes: string;
};

type Field = { key: keyof Settings; label: string; hint: string; prefix?: string; suffix?: string; type?: "text" };

const SECTIONS: { title: string; icon: string; fields: Field[] }[] = [
  {
    title: "Delivery & charges",
    icon: "🚚",
    fields: [
      { key: "freeDeliveryTarget", label: "Free delivery above", hint: "Orders of this amount or more get free delivery", prefix: "₹" },
      { key: "deliveryCharge", label: "Delivery charge", hint: "For orders below the free delivery amount", prefix: "₹" },
      { key: "handlingCharge", label: "Handling charge", hint: "On every order (0 = off)", prefix: "₹" },
      {
        key: "servicePincodes",
        label: "Delivery pincodes",
        hint: "Pincodes you deliver to, separated by commas (e.g. 110078, 110075). The home page pincode check uses this list.",
        type: "text",
      },
      { key: "serviceAreaName", label: "Delivery area name", hint: "Shown to customers: \"Right now we deliver only in ___\"", type: "text" },
    ],
  },
  {
    title: "Processing staff reward",
    icon: "📦",
    fields: [
      { key: "processingReward", label: "Per packed order", hint: "Shown on the processing staff dashboard for every successfully packed order", prefix: "₹" },
    ],
  },
  {
    title: "Rider commission",
    icon: "🛵",
    fields: [
      { key: "riderCommission", label: "Per delivery", hint: "Paid to the rider per delivered order. Applies to newly assigned orders.", prefix: "₹" },
    ],
  },
  {
    title: "Refer & Earn / Wallet",
    icon: "🎁",
    fields: [
      { key: "referralReward", label: "Reward for referrer", hint: "Added to wallet when the friend's first order is delivered", prefix: "₹" },
      { key: "referralWelcome", label: "Welcome bonus for friend", hint: "Added to wallet on sign-up with a referral code", prefix: "₹" },
      { key: "walletExpiryDays", label: "Wallet credit validity", hint: "Credit expires after this many days", suffix: "days" },
    ],
  },
  {
    title: "Business details",
    icon: "🏪",
    fields: [
      { key: "businessName", label: "Business name", hint: "", type: "text" },
      { key: "supportPhone", label: "Support phone", hint: "", type: "text" },
      { key: "supportEmail", label: "Support email", hint: "", type: "text" },
      { key: "businessAddress", label: "Address", hint: "", type: "text" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState<Settings | null>(null);
  const [form, setForm] = useState<Settings | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [tableReady, setTableReady] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/store-settings?all=1", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          return;
        }
        const j = await r.json();
        if (!j.success) throw new Error(j.error);
        setSaved(j.settings);
        setForm(j.settings);
        setTableReady(j.tableReady !== false);
      })
      .catch((e) => setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load settings" }));
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  async function save() {
    if (!form) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (r.status === 401) setNeedsLogin(true);
      if (!r.ok || !j.success) throw new Error(j.error || "Save failed");
      setSaved(j.settings);
      setForm(j.settings);
      setMsg({ ok: true, text: "Settings saved. Applied to cart, checkout and rider app right away." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  }

  if (needsLogin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 text-center">
        <div className="text-2xl">🔒</div>
        <h1 className="mt-1 text-base font-bold">Admin login required</h1>
        <p className="text-[12px] text-slate-500">Log in as admin to change settings.</p>
        <a href="/admin/login?next=/admin/settings" className="mt-3 block rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white">
          Admin login
        </a>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-2">
        {msg && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{msg.text}</p>}
        <div className="h-40 animate-pulse rounded-xl bg-slate-200/60" />
      </div>
    );
  }

  const exampleSmall = Math.max(0, form.freeDeliveryTarget - 50);

  return (
    <div className="mx-auto max-w-4xl space-y-3 pb-20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Settings</h1>
          <p className="text-[11px] text-slate-500">Delivery charges, rider commission, Refer &amp; Earn</p>
        </div>
      </div>

      {!tableReady && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          The settings table is not ready in the database yet. Stop the server and run the AutoFix script again.
        </p>
      )}

      {/* Live preview of delivery rule */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-900">
        <b>Customers will see:</b> on a ₹{exampleSmall} order, delivery ₹{form.deliveryCharge} + handling ₹{form.handlingCharge} ·{" "}
        <b>FREE delivery</b> on ₹{form.freeDeliveryTarget}+ · Rider gets ₹{form.riderCommission}/order
      </div>

      <PackSizesEditor
        value={form.packSizes}
        fallback={form}
        savedValue={saved?.packSizes}
        onChange={(json) => setForm((prev) => (prev ? { ...prev, packSizes: json } : prev))}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <header className="border-b border-slate-100 px-3 py-2 text-[13px] font-semibold text-slate-800">
              {section.icon} {section.title}
            </header>
            <div className="space-y-2.5 p-3">
              {section.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] font-semibold text-slate-700">{f.label}</span>
                    {saved && String(saved[f.key]) !== String(form[f.key]) && (
                      <span className="text-[10px] text-amber-600">was {f.prefix || ""}{String(saved[f.key])}</span>
                    )}
                  </span>
                  <div className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                    {f.prefix && <span className="pl-3 text-sm text-slate-500">{f.prefix}</span>}
                    <input
                      type={f.type === "text" ? "text" : "number"}
                      inputMode={f.type === "text" ? undefined : "numeric"}
                      min={0}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev
                            ? { ...prev, [f.key]: f.type === "text" ? e.target.value : e.target.value === "" ? 0 : Number(e.target.value) }
                            : prev
                        )
                      }
                      className="w-full min-w-0 rounded-lg bg-transparent px-2 py-2 text-sm font-semibold tabular-nums text-slate-900 outline-none"
                    />
                    {f.suffix && <span className="pr-3 text-[12px] text-slate-500">{f.suffix}</span>}
                  </div>
                  {f.hint && <span className="mt-0.5 block text-[11px] text-slate-500">{f.hint}</span>}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      {msg && (
        <p className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>
      )}

      <div className="sticky bottom-0 -mx-3 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-slate-500">{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <div className="flex gap-2">
            {dirty && (
              <button onClick={() => setForm(saved)} className="rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700">
                Reset
              </button>
            )}
            <button
              onClick={() => void save()}
              disabled={!dirty || busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40"
            >
              {busy ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Pack sizes editor ---------- */

const QUICK_PACKS = ["50g", "100g", "200g", "250g", "500g", "750g", "1kg", "2kg", "5kg", "Bunch", "Pack", "Piece", "Dozen", "Box"];

function PackSizesEditor({
  value,
  fallback,
  savedValue,
  onChange,
}: {
  value: string;
  fallback: { packExtra500: number; packExtra250: number };
  savedValue?: string;
  onChange: (json: string) => void;
}) {
  const list = useMemo(() => parsePackSizes(value, fallback), [value, fallback]);
  const changed = useMemo(
    () => JSON.stringify(parsePackSizes(value, fallback)) !== JSON.stringify(parsePackSizes(savedValue ?? "", fallback)),
    [value, savedValue, fallback]
  );
  const [label, setLabel] = useState("");
  const [extra, setExtra] = useState("");
  const [err, setErr] = useState("");

  const set = (next: PackSize[]) => onChange(JSON.stringify(sortPackSizes(next)));
  const has = (l: string) => list.some((p) => p.label.toLowerCase() === cleanPackLabel(l).toLowerCase());

  function add(raw: string, ex = 0) {
    const l = cleanPackLabel(raw);
    setErr("");
    if (!l) return setErr("Write a pack name, e.g. 100g or Bunch");
    if (has(l)) return setErr(`${l} is already in the list`);
    if (list.length >= 20) return setErr("Maximum 20 pack sizes");
    set([...list, { label: l, extra: Math.max(0, Math.round(Number(ex) || 0)) }]);
    setLabel("");
    setExtra("");
  }

  // Example product: ₹100 per 1 kg
  const example = (l: string) => priceForPack({ price: 100, pack: "1kg" }, l, { packExtra500: 0, packExtra250: 0, packSizes: list }).price;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <span className="text-[13px] font-semibold text-slate-800">⚖️ Pack sizes customers can choose</span>
        {changed && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">changed · press Save</span>}
      </header>
      <div className="space-y-3 p-3">
        <p className="text-[11px] leading-snug text-slate-500">
          Product price is for its own pack (normally <b>1 kg</b>). A smaller weight costs its share of that price <b>+ extra ₹</b>. Bunch / Pack / Piece
          cost the product price + extra.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <div key={p.label} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <span className={`min-w-[48px] rounded-md px-1.5 py-0.5 text-center text-[12px] font-extrabold ${packGrams(p.label) ? "bg-emerald-100 text-emerald-800" : "bg-violet-100 text-violet-800"}`}>
                {p.label}
              </span>
              <span className="shrink-0 whitespace-nowrap text-[11px] font-bold text-slate-400">+₹</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={p.extra}
                aria-label={`Extra for ${p.label}`}
                onChange={(e) => set(list.map((x, j) => (j === i ? { ...x, extra: Math.max(0, Math.round(Number(e.target.value) || 0)) } : x)))}
                className="w-12 min-w-0 rounded border border-slate-300 bg-white px-1 py-0.5 text-[12px] font-bold tabular-nums outline-none focus:border-emerald-500"
              />
              <span className="ml-auto hidden text-[10px] text-slate-400 sm:inline" title="Price for a ₹100/kg product">₹{example(p.label)}</span>
              <button
                type="button"
                onClick={() => (list.length > 1 ? set(list.filter((_, j) => j !== i)) : setErr("Keep at least one pack size"))}
                aria-label={`Remove ${p.label}`}
                className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-slate-400 hover:bg-rose-100 hover:text-rose-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 p-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add(label, Number(extra))}
            placeholder="New pack, e.g. 100g / Bunch"
            className="w-44 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[13px] outline-none focus:border-emerald-500 sm:flex-none"
          />
          <div className="flex items-center rounded-lg border border-slate-300 bg-white">
            <span className="pl-2 text-[12px] text-slate-500">+₹</span>
            <input
              type="number"
              min={0}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="0"
              className="w-14 bg-transparent px-1 py-1.5 text-[13px] font-semibold outline-none"
            />
          </div>
          <button type="button" onClick={() => add(label, Number(extra))} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white">
            + Add
          </button>
          <div className="flex w-full flex-wrap gap-1">
            <span className="text-[10px] font-semibold text-slate-500">Quick add:</span>
            {QUICK_PACKS.filter((q) => !has(q)).map((q) => (
              <button key={q} type="button" onClick={() => add(q, 0)} className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700">
                + {q}
              </button>
            ))}
          </div>
        </div>
        {err && <p className="text-[11px] font-semibold text-rose-600">{err}</p>}
        <p className="text-[10px] text-slate-400">Grey number on each box = price for a ₹100/kg product. Customers see 250g first (if it is in the list).</p>
      </div>
    </section>
  );
}
