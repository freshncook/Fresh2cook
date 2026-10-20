"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function AssignOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [boys, setBoys] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  const [orderId, setOrderId] = useState("");
  const [deliveryBoyId, setDeliveryBoyId] =
    useState("");

  const [zoneId, setZoneId] =
    useState("");

  const [assignments, setAssignments] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        ordersRes,
        boysRes,
        zonesRes,
        assignmentsRes,
      ] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/delivery-boys"),
        fetch("/api/delivery-zones"),
        fetch("/api/delivery-assignments"),
      ]);

      const ordersData =
        await ordersRes.json();

      const boysData =
        await boysRes.json();

      const zonesData =
        await zonesRes.json();

      const assignmentsData =
        await assignmentsRes.json();

      setOrders(ordersData);
      setBoys(boysData);
      setZones(zonesData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error(error);
    }
  }

  async function assignOrder() {
    if (
      !orderId ||
      !deliveryBoyId ||
      !zoneId
    ) {
      alert("Select all fields");
      return;
    }

    const res = await fetch(
      "/api/delivery-assignments",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          orderId,
          deliveryBoyId,
          zoneId,
        }),
      }
    );

    if (!res.ok) {
      alert("Assignment Failed");
      return;
    }

    alert("Order Assigned");

    setOrderId("");
    setDeliveryBoyId("");
    setZoneId("");

    loadData();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Assign Orders
        </h1>

        <div className="bg-white p-6 rounded-xl shadow mb-8">

          <div className="grid md:grid-cols-3 gap-4">

            <select
              value={orderId}
              onChange={(e) =>
                setOrderId(e.target.value)
              }
              className="border p-3 rounded-xl"
            >
              <option value="">
                Select Order
              </option>

              {orders.map((o) => (
                <option
                  key={o.id}
                  value={o.id}
                >
                  Order #{o.id}
                </option>
              ))}
            </select>

            <select
              value={deliveryBoyId}
              onChange={(e) =>
                setDeliveryBoyId(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            >
              <option value="">
                Delivery Boy
              </option>

              {boys.map((boy) => (
                <option
                  key={boy.id}
                  value={boy.id}
                >
                  {boy.name}
                </option>
              ))}
            </select>

            <select
              value={zoneId}
              onChange={(e) =>
                setZoneId(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            >
              <option value="">
                Delivery Zone
              </option>

              {zones.map((zone) => (
                <option
                  key={zone.id}
                  value={zone.id}
                >
                  {zone.zoneName}
                </option>
              ))}
            </select>

          </div>

          <button
            onClick={assignOrder}
            className="mt-5 bg-green-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Assign Order
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {assignments.map(
            (item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-xl shadow"
              >
                <h2 className="font-bold text-xl">
                  Order #{item.orderId}
                </h2>

                <p className="mt-2">
                  Delivery Boy ID:
                  {" "}
                  {item.deliveryBoyId}
                </p>

                <p className="mt-2">
                  Zone ID:
                  {" "}
                  {item.zoneId}
                </p>

                <p className="mt-2 text-blue-600 font-bold">
                  OTP:
                  {" "}
                  {item.otp}
                </p>

                <p className="mt-2">
                  Status:
                  {" "}
                  {item.status}
                </p>

              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}






