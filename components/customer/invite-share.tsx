"use client";

import { useState } from "react";
import { FaWhatsapp, FaFacebookF, FaInstagram, FaRegCopy, FaShareAlt } from "react-icons/fa";

/*
 * Ready-to-send invite message + share buttons (WhatsApp, Facebook, Instagram, Copy).
 * The link /r/CODE puts whoever clicks it into the sender's team automatically.
 */

export function buildInvite(opts: { name: string; code: string; welcome: number; reward: number }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/r/${opts.code}`;
  const first = String(opts.name || "").split(" ")[0] || "Main";
  const message = [
    "🥬 Fresh2Cook — fresh vegetables, fruits & ready-to-cook, delivered to your door!",
    "",
    `Mera referral code: *${opts.code}*`,
    `Join with this link and get ₹${opts.welcome} in your wallet instantly 👇`,
    link,
    "",
    `I'll also get ₹${opts.reward} when you place your first order 🙏`,
    `— ${first}`,
  ].join("\n");
  return { link, message };
}

export default function InviteShare({
  name,
  code,
  welcome,
  reward,
  compact = false,
}: {
  name: string;
  code: string;
  welcome: number;
  reward: number;
  compact?: boolean;
}) {
  const { link, message } = buildInvite({ name, code, welcome, reward });
  const [note, setNote] = useState("");

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNote(msg);
    } catch {
      setNote("Couldn't copy — please select the message and copy it");
    }
    window.setTimeout(() => setNote(""), 3000);
  }

  const btn = "flex h-10 items-center justify-center gap-1.5 rounded-lg text-[12px] font-bold text-white shadow-sm";

  return (
    <div className="space-y-2">
      {!compact && (
        <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-lg border border-violet-200 bg-white p-2.5 font-sans text-[12px] leading-5 text-slate-700">
          {message}
        </pre>
      )}

      <div className="grid grid-cols-4 gap-1.5">
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className={`${btn} bg-[#25D366]`} aria-label="Share on WhatsApp">
          <FaWhatsapp size={18} /> <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className={`${btn} bg-[#1877F2]`}
          aria-label="Share on Facebook"
        >
          <FaFacebookF size={15} /> <span className="hidden sm:inline">Facebook</span>
        </a>
        <button
          type="button"
          onClick={async () => {
            await copy(message, "Message copied — paste it in Instagram");
            window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener");
          }}
          className={`${btn} bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]`}
          aria-label="Share on Instagram"
        >
          <FaInstagram size={17} /> <span className="hidden sm:inline">Instagram</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            if (typeof navigator !== "undefined" && navigator.share) {
              try {
                await navigator.share({ title: "Fresh2Cook", text: message, url: link });
                return;
              } catch {
                /* user closed the share sheet */
              }
            }
            await copy(message, "Message + link copied");
          }}
          className={`${btn} border border-slate-300 bg-white !text-slate-700`}
          aria-label="Copy or more apps"
        >
          {typeof navigator !== "undefined" && "share" in navigator ? <FaShareAlt size={14} /> : <FaRegCopy size={14} />}
          <span className="hidden sm:inline">More</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="truncate">
          Link: <span className="font-mono text-slate-700">{link.replace(/^https?:\/\//, "")}</span>
        </span>
        <button type="button" onClick={() => void copy(link, "Link copied")} className="shrink-0 font-semibold text-violet-700">
          Copy link
        </button>
      </div>
      {note && <p className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">{note}</p>}
    </div>
  );
}
