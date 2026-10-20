"use client";

import { useEffect, useState } from "react";

export default function WalletPage() {
  const [wallet, setWallet] =
    useState<any>({
      balance: 0,
      points: 0,
    });

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-wallet"
      ) ||
        '{"balance":0,"points":0}'
    );

    setWallet(data);
  }, []);

  function saveWallet(data: any) {
    localStorage.setItem(
      "freshcut-wallet",
      JSON.stringify(data)
    );

    setWallet(data);
  }

  function addCashback() {
    const updated = {
      ...wallet,
      balance:
        wallet.balance + 50,
      points:
        wallet.points + 50,
    };

    saveWallet(updated);

    alert(
      "â‚¹50 Cashback Added"
    );
  }

  function referEarn() {
    const updated = {
      ...wallet,
      balance:
        wallet.balance + 100,
      points:
        wallet.points + 100,
    };

    saveWallet(updated);

    alert(
      "â‚¹100 Referral Reward Added"
    );
  }

  function redeem() {
    if (
      wallet.balance < 50
    ) {
      alert(
        "Minimum â‚¹50 Required"
      );
      return;
    }

    const updated = {
      ...wallet,
      balance:
        wallet.balance - 50,
      points:
        wallet.points - 50,
    };

    saveWallet(updated);

    alert(
      "â‚¹50 Redeemed"
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Fresh2Cook Wallet
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow p-8">

            <h2 className="text-xl font-bold">
              Wallet Balance
            </h2>

            <div className="text-5xl font-bold text-green-600 mt-4">
              â‚¹{wallet.balance}
            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-8">

            <h2 className="text-xl font-bold">
              Reward Points
            </h2>

            <div className="text-5xl font-bold text-blue-600 mt-4">
              {wallet.points}
            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <button
            onClick={addCashback}
            className="bg-green-600 text-white py-4 rounded-xl font-bold"
          >
            Add Cashback
          </button>

          <button
            onClick={referEarn}
            className="bg-purple-600 text-white py-4 rounded-xl font-bold"
          >
            Refer & Earn
          </button>

          <button
            onClick={redeem}
            className="bg-blue-600 text-white py-4 rounded-xl font-bold"
          >
            Redeem â‚¹50
          </button>

        </div>

        <div className="bg-white rounded-xl shadow p-8 mt-8">

          <h2 className="text-2xl font-bold mb-4">
            Loyalty Program
          </h2>

          <ul className="space-y-2">

            <li>
              ðŸ¥¬ Every Order Earns Points
            </li>

            <li>
              ðŸŽ Referral = â‚¹100 Reward
            </li>

            <li>
              ðŸ’° Redeem Wallet Balance
            </li>

            <li>
              â­ Premium Customers Get Extra Cashback
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
}




