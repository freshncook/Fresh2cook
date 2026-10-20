"use client";

import { useEffect, useState } from "react";

type Transaction = {
  type: string;
  amount: number;
  date: string;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState({
    balance: 0,
    points: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const walletData = JSON.parse(
      localStorage.getItem("freshcut-wallet") ||
        '{"balance":0,"points":0}'
    );

    const txns = JSON.parse(
      localStorage.getItem(
        "freshcut-wallet-transactions"
      ) || "[]"
    );

    setWallet(walletData);
    setTransactions(txns);
  }, []);

  function saveWallet(
    data: any,
    txn?: Transaction
  ) {
    localStorage.setItem(
      "freshcut-wallet",
      JSON.stringify(data)
    );

    if (txn) {
      const updatedTxns = [
        txn,
        ...transactions,
      ];

      localStorage.setItem(
        "freshcut-wallet-transactions",
        JSON.stringify(updatedTxns)
      );

      setTransactions(updatedTxns);
    }

    setWallet(data);
  }

  function addCashback() {
    const updated = {
      ...wallet,
      balance: wallet.balance + 50,
      points: wallet.points + 50,
    };

    saveWallet(updated, {
      type: "Cashback",
      amount: 50,
      date: new Date().toLocaleDateString(),
    });

    alert("₹50 Cashback Added");
  }

  function referEarn() {
    const updated = {
      ...wallet,
      balance: wallet.balance + 100,
      points: wallet.points + 100,
    };

    saveWallet(updated, {
      type: "Referral",
      amount: 100,
      date: new Date().toLocaleDateString(),
    });

    alert("₹100 Referral Reward Added");
  }

  function redeem() {
    if (wallet.balance < 50) {
      alert("Minimum ₹50 Required");
      return;
    }

    const updated = {
      ...wallet,
      balance: wallet.balance - 50,
      points: wallet.points - 50,
    };

    saveWallet(updated, {
      type: "Redeem",
      amount: -50,
      date: new Date().toLocaleDateString(),
    });

    alert("₹50 Redeemed");
  }

  const cashbackTotal = transactions
    .filter((t) => t.type === "Cashback")
    .reduce((sum, t) => sum + t.amount, 0);

  const referralTotal = transactions
    .filter((t) => t.type === "Referral")
    .reduce((sum, t) => sum + t.amount, 0);

  const tier =
    wallet.points >= 2000
      ? "🥇 Gold"
      : wallet.points >= 500
      ? "🥈 Silver"
      : "🥉 Bronze";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Fresh2Cook Wallet
        </h1>

        <div className="grid md:grid-cols-4 gap-4">

          <div className="bg-white rounded-xl shadow p-6">
            <p>Wallet Balance</p>
            <h2 className="text-4xl font-bold text-green-600">
              ₹{wallet.balance}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p>Reward Points</p>
            <h2 className="text-4xl font-bold text-blue-600">
              {wallet.points}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p>Loyalty Tier</p>
            <h2 className="text-3xl font-bold">
              {tier}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p>Lifetime Earnings</p>
            <h2 className="text-3xl font-bold text-purple-600">
              ₹{cashbackTotal + referralTotal}
            </h2>
          </div>

        </div>

        

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              Loyalty Program
            </h2>

            <ul className="space-y-2">
              <li>🥬 Every Order Earns Points</li>
              <li>🎁 Referral = ₹100 Reward</li>
              <li>💰 Redeem Wallet Balance</li>
              <li>⭐ Premium Customers Get Extra Cashback</li>
            </ul>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              Wallet Statistics
            </h2>

            <p className="mb-2">
              Cashback Earned: ₹{cashbackTotal}
            </p>

            <p className="mb-2">
              Referral Earned: ₹{referralTotal}
            </p>

            <p>
              Total Transactions: {transactions.length}
            </p>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-2xl font-bold mb-4">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <p>No Transactions Found</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <strong>{txn.type}</strong>
                    <p className="text-sm text-gray-500">
                      {txn.date}
                    </p>
                  </div>

                  <div
                    className={
                      txn.amount > 0
                        ? "text-green-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    ₹{txn.amount}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}




