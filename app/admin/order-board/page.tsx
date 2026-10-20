"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function OrderBoardPage() {
  const [board, setBoard] =
    useState<any>({
      pendingAcceptance: [],
      accepted: [],
      pickedUp: [],
      outForDelivery: [],
      delivered: [],
    });

  useEffect(() => {
    loadBoard();

    const interval =
      setInterval(
        loadBoard,
        10000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  async function loadBoard() {
    try {
      const res =
        await fetch(
          "/api/admin-order-board"
        );

      const data =
        await res.json();

      setBoard(data);
    } catch (error) {
      console.error(error);
    }
  }

  const columns = [
    {
      title:
        "Pending Acceptance",
      key:
        "pendingAcceptance",
      color:
        "bg-red-100",
    },
    {
      title:
        "Accepted",
      key:
        "accepted",
      color:
        "bg-blue-100",
    },
    {
      title:
        "Picked Up",
      key:
        "pickedUp",
      color:
        "bg-orange-100",
    },
    {
      title:
        "Out For Delivery",
      key:
        "outForDelivery",
      color:
        "bg-purple-100",
    },
    {
      title:
        "Delivered",
      key:
        "delivered",
      color:
        "bg-green-100",
    },
  ];

  return (
    <div className="p-5">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Live Order Board
          </h1>

          <p className="text-gray-500">
            Real Time Delivery Tracking
          </p>

        </div>

        <button
          onClick={loadBoard}
          className="bg-green-600 text-white px-5 py-3 rounded-2xl"
        >
          Refresh
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {columns.map(
          (column) => (
            <div
              key={
                column.key
              }
              className={`${column.color} rounded-2xl p-4 min-h-[600px]`}
            >

              <div className="flex justify-between items-center mb-4">

                <h2 className="font-bold text-lg">
                  {
                    column.title
                  }
                </h2>

                <span className="bg-white px-3 py-1 rounded-full text-sm font-bold">
                  {
                    board[
                      column
                        .key
                    ]?.length
                  }
                </span>

              </div>

              <div className="space-y-3">

                {board[
                  column.key
                ]?.map(
                  (
                    order: any
                  ) => (
                    <div
                      key={
                        order.id
                      }
                      className="bg-white rounded-2xl p-4 shadow-md border"
                    >

                      <h3 className="font-bold">
                        Order #
                        {
                          order.orderId
                        }
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Rider ID:
                        {" "}
                        {
                          order.deliveryBoyId
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        OTP:
                        {" "}
                        {
                          order.otp
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        ₹
                        {
                          order.earnings
                        }
                      </p>

                      <div className="mt-3">

                        <span className="text-xs bg-slate-50 px-2 py-1 rounded-full">
                          {
                            order.status
                          }
                        </span>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}










