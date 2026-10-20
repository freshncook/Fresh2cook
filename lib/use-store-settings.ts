"use client";

import { useEffect, useState } from "react";
import { defaultPackSizes, parsePackSizes, type PackSize } from "@/lib/pack-price";

/*
 * Cart / checkout read delivery rules from /api/store-settings,
 * so the admin can change them at /admin/settings without code changes.
 */

export type ShopSettings = {
  freeDeliveryTarget: number;
  deliveryCharge: number;
  handlingCharge: number;
  referralReward: number;
  referralWelcome: number;
  packExtra500: number;
  packExtra250: number;
  packSizes: PackSize[];
  ready?: boolean; // true once loaded from the server
};

const FALLBACK: ShopSettings = {
  freeDeliveryTarget: 400,
  deliveryCharge: 40,
  handlingCharge: 10,
  referralReward: 50,
  referralWelcome: 25,
  packExtra500: 10,
  packExtra250: 15,
  packSizes: defaultPackSizes(),
};

let cache: ShopSettings | null = null;

export function useStoreSettings(): ShopSettings {
  const [settings, setSettings] = useState<ShopSettings>(cache || FALLBACK);

  useEffect(() => {
    let alive = true;
    fetch("/api/store-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!alive || !json?.settings) return;
        const s = json.settings;
        cache = {
          freeDeliveryTarget: Number(s.freeDeliveryTarget ?? FALLBACK.freeDeliveryTarget),
          deliveryCharge: Number(s.deliveryCharge ?? FALLBACK.deliveryCharge),
          handlingCharge: Number(s.handlingCharge ?? FALLBACK.handlingCharge),
          referralReward: Number(s.referralReward ?? FALLBACK.referralReward),
          referralWelcome: Number(s.referralWelcome ?? FALLBACK.referralWelcome),
          packExtra500: Number(s.packExtra500 ?? FALLBACK.packExtra500),
          packExtra250: Number(s.packExtra250 ?? FALLBACK.packExtra250),
          packSizes: parsePackSizes(s.packSizes, s),
          ready: true,
        };
        setSettings(cache);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}
