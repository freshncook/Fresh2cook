"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa";
import { buildInvite } from "@/components/customer/invite-share";
import SitePopups, { type PopupSettings } from "@/components/site-popups";
import { thumb } from "@/lib/img-url";
import { priceForPack, shopDefaultPack, type PackSize } from "@/lib/pack-price";

/*
 * Fresh2Cook home page — compact, mobile-first.
 * All data from /api/home-data (products, categories, real reviews, settings).
 * Order: hero → categories (8 per row) → best sellers (8 per row) → refer · promise image · pincode (one row) → reviews → footer
 */

type Product = {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  pack?: string | null;
  stock?: number;
  image?: string | null;
  category?: string | null;
};

type Category = { name: string; count: number; image: string | null };
type Review = { id: number; name: string; rating: number; comment: string };
type Settings = {
  freeDeliveryTarget: number;
  deliveryCharge: number;
  referralReward: number;
  referralWelcome: number;
  supportPhone: string;
  supportEmail?: string;
  businessAddress?: string;
  pincodesConfigured?: boolean;
  serviceAreaName?: string;
  servicePincodes?: string;
  packExtra500?: number;
  packExtra250?: number;
  packSizes?: PackSize[];
  popups?: PopupSettings;
};

type CartLine = Product & { qty: number; pack: string };

const PLACEHOLDER = "/placeholder-product.png";
const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function readCart(): CartLine[] {
  try {
    const c = JSON.parse(localStorage.getItem("freshcut-cart") || "[]");
    return Array.isArray(c) ? c : [];
  } catch {
    return [];
  }
}

function writeCart(cart: CartLine[]) {
  localStorage.setItem("freshcut-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

function Img({ src, alt, className }: { src?: string | null; alt: string; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src?.trim() ? src : PLACEHOLDER}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(PLACEHOLDER)) e.currentTarget.src = PLACEHOLDER;
      }}
    />
  );
}

function SectionTitle({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2">
      <h2 className="text-[17px] font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
      {href && (
        <a href={href} className="shrink-0 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800">
          {cta || "See all"} →
        </a>
      )}
    </div>
  );
}

/* Round share icons. Logged in: personal invite link (/r/CODE). Otherwise: shop link. */
function ShareIcons({ me, welcome, reward }: { me: { name: string; code: string } | null; welcome: number; reward: number }) {
  const [note, setNote] = useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { link, message } = me
    ? buildInvite({ name: me.name, code: me.code, welcome, reward })
    : { link: origin, message: `🥬 Fresh2Cook — fresh vegetables, fruits & ready-to-cook, delivered to your door!\nOrder now 👇\n${origin}` };

  const icon = "flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white/70 transition hover:-translate-y-0.5 hover:scale-105";
  return (
    <div>
      <div className="flex items-center gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" className={`${icon} bg-[#25D366]`}>
          <FaWhatsapp size={19} />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on Facebook"
          className={`${icon} bg-[#1877F2]`}
        >
          <FaFacebookF size={15} />
        </a>
        <button
          type="button"
          aria-label="Share on Instagram"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message);
              setNote("Message copied — paste it in Instagram");
            } catch {
              setNote("");
            }
            window.setTimeout(() => setNote(""), 3500);
            window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener");
          }}
          className={`${icon} bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]`}
        >
          <FaInstagram size={18} />
        </button>
        <span className="ml-1 text-[11px] font-semibold leading-tight text-white/85">{me ? "Share your invite link" : "Share with friends"}</span>
      </div>
      {note && <p className="mt-1.5 text-[11px] font-semibold text-yellow-200">{note}</p>}
    </div>
  );
}

export default function Fresh2CookLanding() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<Settings>({
    freeDeliveryTarget: 400,
    deliveryCharge: 40,
    referralReward: 50,
    referralWelcome: 25,
    supportPhone: "9811001901",
  });
  const [loading, setLoading] = useState(true);
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [me, setMe] = useState<{ name: string; code: string } | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [refStats, setRefStats] = useState<{ friends: number; earned: number } | null>(null);
  const [referSignal, setReferSignal] = useState(0);
  const [invitedBy, setInvitedBy] = useState<{ inviter: string; code: string; welcome: number } | null>(null);

  // pincode check
  const [pin, setPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [pinResult, setPinResult] = useState<{ ok: boolean | null; pin: string; text: string; area?: string } | null>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/home-data", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j?.success) return;
        setSettings((s) => ({ ...s, ...j.settings }));
        // Category images come from Admin > Categories (database)
        setCategories(j.categories || []);
        setProducts(j.bestSellers || []);
        setReviews(j.reviews || []);
      })
      .catch(() => null)
      .finally(() => alive && setLoading(false));

    fetch("/api/customer-account", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive) return;
        if (j?.referral?.code) {
          setMe({ name: j.profile?.name || "", code: j.referral.code });
          setRefStats({ friends: (j.referral.friends || []).length, earned: Number(j.referral.totalEarned || 0) });
        }
      })
      .catch(() => null)
      .finally(() => alive && setMeLoaded(true));

    // Came from an invite link (/r/CODE)? Show who invited
    fetch("/api/referral" + (new URLSearchParams(window.location.search).get("ref") ? `?code=${new URLSearchParams(window.location.search).get("ref")}` : ""), { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => alive && j?.success && setInvitedBy({ inviter: j.inviter, code: j.code, welcome: j.welcome }))
      .catch(() => null);

    try {
      const saved = localStorage.getItem("freshcut-pincode");
      if (saved) setPin(saved);
    } catch {
      /* ignore */
    }

    const syncCart = () => {
      const q: Record<string, number> = {};
      for (const line of readCart()) q[`${line.id}|${line.pack}`] = Number(line.qty || 0);
      setCartQty(q);
    };
    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      alive = false;
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  // Home cards show the 250 g pack by default (price from the 1 kg rate + 250 g extra)
  const packRules = { packExtra500: settings.packExtra500 ?? 10, packExtra250: settings.packExtra250 ?? 15, packSizes: settings.packSizes };
  const homePack = (p: Product) => shopDefaultPack(p.pack, packRules);
  const homePrice = (p: Product) => priceForPack(p, homePack(p), packRules);

  function changeQty(p: Product, delta: number) {
    const pack = homePack(p);
    const priced = homePrice(p);
    const stock = Number(p.stock || 0);
    const cart = readCart();
    const idx = cart.findIndex((c) => Number(c.id) === p.id && c.pack === pack);
    const current = idx >= 0 ? Number(cart[idx].qty || 0) : 0;
    const next = Math.max(0, Math.min(current + delta, stock || 99));
    if (next === 0 && idx >= 0) cart.splice(idx, 1);
    else if (idx >= 0) cart[idx] = { ...cart[idx], qty: next };
    else if (next > 0)
      cart.push({
        id: p.id,
        name: p.name,
        category: p.category,
        price: priced.price,
        mrp: priced.mrp || priced.price,
        stock: p.stock,
        image: p.image && !String(p.image).startsWith("data:") ? p.image : "",
        pack,
        qty: next,
      });
    writeCart(cart);
  }

  async function checkPin(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setPinResult({ ok: false, pin, text: "Please enter a 6-digit pincode" });
      return;
    }
    setPinBusy(true);
    try {
      localStorage.setItem("freshcut-pincode", pin);
    } catch {
      /* ignore */
    }
    try {
      const r = await fetch(`/api/pincode-check?pin=${pin}`, { cache: "no-store" });
      const j = await r.json();
      const area = j.serviceArea || settings.serviceAreaName || "Dwarka";
      if (!j.success) setPinResult({ ok: false, pin, text: j.error || "Could not check", area });
      else if (j.available === true)
        setPinResult({ ok: true, pin, area, text: `Great! We deliver to ${pin}${j.zone ? ` (${j.zone})` : ""}. FREE delivery on orders of ${rupees(j.freeDeliveryTarget)}+.` });
      else setPinResult({ ok: false, pin, area, text: "" });
    } catch {
      setPinResult({ ok: null, pin, text: "Could not check, please try again" });
    } finally {
      setPinBusy(false);
    }
  }

  const supportDigits = String(settings.supportPhone || "9811001901").replace(/\D/g, "").slice(-10);

  return (
    <main className="bg-slate-50 pb-10">
      {/* ===== HERO — full width, left to right ===== */}
      {/* Fresh2Cook banner — wide picture on computer, taller one on phone */}
      <a href="/products" className="block w-full overflow-hidden bg-[#eef4dd]">
        <picture>
          <source media="(max-width: 640px)" srcSet="/hero-f2c-mobile.jpg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-f2c.jpg" alt="Fresh2Cook — fresh & cut vegetables, just a tap away" width={2400} height={480} fetchPriority="high" decoding="async" className="block h-auto w-full" />
        </picture>
      </a>

      <div className="mx-auto max-w-[1400px] space-y-5 px-3 pt-3 sm:px-4 lg:px-6">
        {/* Invited by a friend? */}
        {invitedBy && !me && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
            <span className="text-[13px] text-violet-900">
              🎉 <b>{invitedBy.inviter}</b> invited you to Fresh2Cook — sign up and get <b>{rupees(invitedBy.welcome)}</b> in your wallet
            </span>
            <a href={`/login?ref=${invitedBy.code}`} className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-bold text-white">
              Sign up · Get {rupees(invitedBy.welcome)}
            </a>
          </div>
        )}


        {/* ===== CATEGORIES — 8 per row on desktop ===== */}
        <section>
          <SectionTitle title="Shop by category" href="/products" cta="All products" />
          {loading ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[5/6] animate-pulse rounded-xl bg-slate-200/70" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white py-6 text-center text-[13px] text-slate-500">
              Categories will appear here once added.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {categories.slice(0, 16).map((c) => (
                <a
                  key={c.name}
                  href={`/products?category=${encodeURIComponent(c.name)}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-sm"
                >
                  <div className="aspect-[5/4] overflow-hidden bg-emerald-50/50 p-1">
                    <Img src={thumb(c.image, 300)} alt={c.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-110" />
                  </div>
                  <div className="px-1 py-1 text-center">
                    <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-slate-800 sm:text-[12px]">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.count ? `${c.count} items` : "Coming soon"}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ===== BEST SELLERS — 8 per row on desktop ===== */}
        <section>
          <SectionTitle title="Best sellers" href="/products" cta="View all" />
          {loading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[200px] animate-pulse rounded-xl bg-slate-200/70" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white py-6 text-center text-[13px] text-slate-500">Products coming soon.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {products.map((p) => {
                const pack = homePack(p);
                const q = cartQty[`${p.id}|${pack}`] || 0;
                const { price, mrp } = homePrice(p);
                const saving = mrp ? mrp - price : 0;
                const off = mrp ? Math.round((saving / mrp) * 100) : 0;
                const stock = Number(p.stock || 0);
                const out = stock <= 0;
                return (
                  <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                    <a href={`/products?search=${encodeURIComponent(p.name)}`} className="relative block aspect-square overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white">
                      <Img src={thumb(p.image, 400)} alt={p.name} className="h-full w-full object-contain p-1 transition duration-300 ease-out group-hover:scale-[1.18]" />
                      {!out && stock <= 5 && (
                        <span className="absolute right-1 top-1 rounded bg-white/90 px-1 text-[9px] font-bold text-amber-700 shadow-sm">Only {stock} left</span>
                      )}
                    </a>
                    <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1.5 pt-1 sm:px-2 sm:pb-2">
                      <div className="line-clamp-1 text-[12px] font-extrabold leading-tight text-slate-900 sm:text-[13px]" title={p.name}>{p.name}</div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="shrink-0 rounded bg-slate-100 px-1 font-bold text-slate-700">{pack}</span>
                        <span className="truncate text-slate-400">{p.category || "Fresh"}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-1">
                        <span className="text-[15px] font-black tabular-nums text-slate-900 sm:text-[16px]">{rupees(price)}</span>
                        {mrp > 0 && <span className="text-[15px] font-bold tabular-nums text-slate-400 line-through decoration-red-500 decoration-2 sm:text-[16px]">{rupees(mrp)}</span>}
                        {off > 0 && (
                          <span className="ml-auto inline-flex h-[18px] min-w-[52px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-1.5 text-center text-[10px] font-extrabold leading-none text-white shadow-sm shadow-orange-200">
                            {off}% OFF
                          </span>
                        )}
                      </div>
                      {saving > 0 && <div className="text-[10px] font-bold text-emerald-700">You save {rupees(saving)}</div>}

                      <div className="mt-auto pt-0.5">
                        {out ? (
                          <div className="rounded-lg bg-slate-100 py-1 text-center text-[11px] font-bold text-slate-400">Sold out</div>
                        ) : q === 0 ? (
                          <button
                            onClick={() => changeQty(p, 1)}
                            className="w-full rounded-lg border border-emerald-600 bg-emerald-50 py-1 text-[12px] font-extrabold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center justify-between overflow-hidden rounded-lg bg-emerald-600 text-white">
                            <button onClick={() => changeQty(p, -1)} className="px-2.5 py-1 text-[14px] font-extrabold" aria-label={`Remove one ${p.name}`}>
                              −
                            </button>
                            <span className="text-[12px] font-extrabold">{q}</span>
                            <button onClick={() => changeQty(p, 1)} className="px-2.5 py-1 text-[14px] font-extrabold" aria-label={`Add one ${p.name}`}>
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===== One row: Refer & Earn · Fresh2Cook promise image (center) · Pincode check ===== */}
        <section className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* 1. Refer & Earn */}
          <div className="relative isolate flex min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200/60 lg:min-h-[230px]">
            <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 -z-10 h-40 w-40 rounded-full bg-fuchsia-400/30 blur-2xl" />
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 p-3.5 sm:p-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/25">
                  🎁 Refer &amp; Earn
                </span>
                <h3 className="mt-1.5 text-[19px] font-black leading-tight sm:text-[21px]">
                  Invite friends,
                  <br />
                  earn <span className="text-yellow-300">{rupees(settings.referralReward)}</span> each
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span className="rounded-full bg-white px-2 py-0.5 text-violet-800 shadow-sm">🎉 Friend gets {rupees(settings.referralWelcome)}</span>
                  <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-slate-900 shadow-sm">💰 You get {rupees(settings.referralReward)}</span>
                </div>
                {me && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/50 bg-white/10 px-2 py-0.5 text-[11px]">
                    Your code <b className="font-mono tracking-widest">{me.code}</b>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReferSignal((n) => n + 1)}
                  className="rounded-full bg-yellow-300 px-3 py-1.5 text-[12px] font-extrabold text-slate-900 shadow-md transition hover:-translate-y-0.5"
                >
                  + Refer a friend
                </button>
                {refStats && refStats.friends > 0 && (
                  <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-bold ring-1 ring-white/25">
                    👥 {refStats.friends} joined · ₹{refStats.earned} earned
                  </span>
                )}
              </div>
              <ShareIcons me={me} welcome={settings.referralWelcome} reward={settings.referralReward} />
            </div>
            <div className="relative flex w-[30%] max-w-[140px] shrink-0 items-end justify-center pr-2">
              <div className="absolute bottom-4 h-24 w-24 rounded-full bg-white/25 blur-xl" />
              <Img src="/refer-earn-phone.webp" alt="Fresh2Cook Refer & Earn app" className="relative max-h-[150px] w-auto -rotate-6 object-contain drop-shadow-xl transition duration-300 hover:rotate-0 md:max-h-[175px]" />
            </div>
          </div>

          {/* 2. Fresh2Cook promise — three small cards (no photos of people) */}
          <div className="mx-auto grid w-full max-w-[340px] grid-rows-3 gap-1.5 md:h-[200px] md:w-[230px] lg:h-[230px] lg:w-[250px]">
            {[
              { icon: "🚚", title: `FREE delivery ${rupees(settings.freeDeliveryTarget)}+`, sub: `Below that only ${rupees(settings.deliveryCharge)}`, cls: "from-rose-600 to-orange-500" },
              { icon: "🥬", title: "Fresh, washed & cut", sub: "Cleaned and packed daily", cls: "from-emerald-700 to-lime-500" },
              { icon: "🔐", title: "OTP-safe delivery", sub: "Handed over only with your OTP", cls: "from-blue-700 to-sky-500" },
            ].map((c) => (
              <div key={c.title} className={`flex items-center gap-2.5 rounded-xl bg-gradient-to-r ${c.cls} px-3 py-2 text-white shadow-md`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl ring-2 ring-white/40">{c.icon}</span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[14px] font-black">{c.title}</span>
                  <span className="block text-[11px] font-semibold text-white/90">{c.sub}</span>
                </span>
              </div>
            ))}
          </div>

          {/* 3. Pincode check */}
          <form
            onSubmit={checkPin}
            className="relative isolate flex min-h-[200px] flex-col justify-between gap-2.5 overflow-hidden rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-lg shadow-emerald-100/60 sm:p-4 lg:min-h-[230px]"
          >
            <div className="pointer-events-none absolute -right-12 -top-14 -z-10 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-200 to-lime-100 opacity-70" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-28 w-28 rounded-full bg-emerald-50" />
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                📍 Delivery check
              </span>
              <h3 className="mt-1.5 text-[19px] font-black leading-tight text-slate-900 sm:text-[21px]">Do we deliver to you?</h3>
              <p className="text-[12px] text-slate-500">Enter your pincode — takes a second</p>
            </div>
            <div className="flex gap-2">
              <input
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setPinResult(null);
                }}
                inputMode="numeric"
                placeholder="e.g. 110078"
                aria-label="Pincode"
                className="min-w-0 flex-1 rounded-xl border-2 border-emerald-100 bg-white px-3 py-2 text-[15px] font-semibold tracking-[0.2em] text-slate-900 placeholder:font-normal placeholder:tracking-normal focus:border-emerald-500 focus:outline-none"
              />
              <button disabled={pinBusy} className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50">
                {pinBusy ? "…" : "Check"}
              </button>
            </div>
            {pinResult &&
              (pinResult.ok === true ? (
                <p className="rounded-lg bg-emerald-100 px-3 py-2 text-[13px] font-semibold text-emerald-800">✅ {pinResult.text}</p>
              ) : pinResult.text ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800">{pinResult.text}</p>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[13px] font-bold text-slate-900">😔 Sorry! We don't deliver to {pinResult.pin} yet</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-700">
                    Right now we deliver only in <b>{pinResult.area || "Dwarka"}</b>. We're expanding soon — you'll be the first to know.
                  </p>
                  <a
                    href={`https://wa.me/91${supportDigits}?text=${encodeURIComponent(
                      `Hi Fresh2Cook! My pincode is ${pinResult.pin}. Please let me know when you start delivering here.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-[12px] font-bold text-white"
                  >
                    🔔 Notify me (WhatsApp)
                  </a>
                </div>
              ))}
            {!pinResult && (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="font-semibold text-slate-600">Now in {settings.serviceAreaName || "Dwarka"}:</span>
                  {String(settings.servicePincodes || "")
                    .split(/[\s,]+/)
                    .filter((x) => /^\d{6}$/.test(x))
                    .slice(0, 5)
                    .map((x) => (
                      <button
                        key={x}
                        type="button"
                        onClick={() => setPin(x)}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                      >
                        {x}
                      </button>
                    ))}
                </div>
                <p className="text-[11px] text-slate-500">⚡ Same-day delivery · 🚚 Free above {rupees(settings.freeDeliveryTarget)}</p>
              </div>
            )}
          </form>
        </section>

        {/* ===== REAL CUSTOMER REVIEWS (hidden until there are some) ===== */}
        {reviews.length > 0 && (
          <section>
            <SectionTitle title="What customers say" />
            <div className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
              {reviews.map((r) => (
                <figure key={r.id} className="w-[78%] shrink-0 snap-start rounded-xl border border-slate-200 bg-white p-3 sm:w-auto">
                  <div className="text-[12px] text-amber-500">{"★".repeat(r.rating)}<span className="text-slate-300">{"★".repeat(5 - r.rating)}</span></div>
                  <blockquote className="mt-1 line-clamp-3 text-[13px] text-slate-700">{r.comment}</blockquote>
                  <figcaption className="mt-1.5 text-[12px] font-semibold text-slate-900">{r.name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FOOTER — same as before (only a nested-link HTML error fixed) */}

      {/* FOOTER */}

<footer className="bg-[#0f172a] text-white">

  <div className="max-w-[1500px] mx-auto px-6 py-4">

    <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 items-start">

      {/* LOGO */}

      <div>

        <img
          src="/fresh2cook-logo.png"
          alt="Fresh2Cook"
          className="h-18 mb-4"
        />

        <p className="text-gray-300 text-sm leading-7 max-w-[280px]">
          Fresh vegetables, fruits and ready-to-cook products delivered directly to your doorstep.
        </p>

      </div>

      {/* CATEGORIES */}

      <div>

        <h3 className="font-bold text-lg mb-3">
          Categories
        </h3>

        <div className="space-y-2 text-sm text-gray-300">
          <a href="/category/vegetables" className="block hover:text-white">Vegetables</a>
          <a href="/category/fruits" className="block hover:text-white">Fresh Fruits</a>
          <a href="/category/leafy-greens" className="block hover:text-white">Leafy Greens</a>
          <a href="/category/ready-to-cook" className="block hover:text-white">Ready To Cook</a>
          <a href="/category/combos" className="block hover:text-white">Combos</a>
        </div>

      </div>
      {/* QUICK LINKS */}

<div>

  <h3 className="font-bold text-lg mb-3">
    Quick Links
  </h3>

  <div className="space-y-2 text-sm text-gray-300">

    <a href="/disclaimer" className="block hover:text-white">
      Disclaimer
    </a>

    <a href="/privacy-policy" className="block hover:text-white">
      Privacy Policy
    </a>

    <a href="/terms-conditions" className="block hover:text-white">
      Terms & Conditions
    </a>

    <a href="/policies-compliances" className="block hover:text-white">
      Policies & Compliances
    </a>

    <a href="/faqs" className="block hover:text-white">
      FAQs
    </a>

    <a href="/return-policy" className="block hover:text-white">
      Refund Policy
    </a>

  </div>

</div>

      {/* CONTACT */}

      <div>

        <h3 className="font-bold text-lg mb-3">
          Contact Us
        </h3>

        <div className="space-y-3 text-gray-300">

          <div>Village Pochan Pur, Dwarka, New Delhi 110078</div>

          <div>
            <a href="tel:+919811001901">
              +91 98110 01901
            </a>
          </div>

          <div>
            <a href="mailto:support@fresh2cook.in">
              support@fresh2cook.in
            </a>
              <div className="flex gap-4 mt-4">

  <a
    href="https://wa.me/919811001901"
    target="_blank"
    rel="noreferrer"
  >
    <img
      src="/whatsapp-logo.png.png"
      className="w-8 h-8"
      alt="WhatsApp"
    />
  </a>

  <a
    href="https://www.instagram.com/fresh2cook2026"
    target="_blank"
    rel="noreferrer"
  >
    <img
      src="/instagram.png.png"
      className="w-8 h-8"
      alt="Instagram"
    />
  </a>

  <a
    href="https://facebook.com/fresh2cook2026"
    target="_blank"
    rel="noreferrer"
  >
    <img
      src="/facebook.png.png"
      className="w-8 h-8"
      alt="Facebook"
    />
  </a>

</div>
          </div>

        </div>

      </div>

      {/* DOWNLOAD APP */}

      <div>

        <h3 className="font-bold text-xl mb-4">
          Download App
        </h3>

        <img
          src="/app-download.png.png"
          alt="Download App"
          className="w-36 object-contain"
        />

      </div>

      {/* BASKET */}

      <div className="flex items-start justify-center">

        <img
          src="/basket.png.png"
          alt="Basket"
          className="h-55 object-contain"
        />

      </div>

    </div>

  </div>

  <div className="border-t border-white/10 py-5 text-center text-gray-300">
    © 2026 Fresh2Cook • Fresh • Clean • Ready To Cook
  </div>

</footer>
      <SitePopups
        popups={settings.popups || null}
        me={me}
        meLoaded={meLoaded && !loading}
        welcome={settings.referralWelcome}
        reward={settings.referralReward}
        openReferSignal={referSignal}
      />
    </main>
  );
}
