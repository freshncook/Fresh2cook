"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DeliveryDashboardPage() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await fetch(
        "/api/admin-delivery-dashboard"
      );

      const json =
        await res.json();

      setData(json);
    } catch (error) {
      console.error(error);
    }
  }

  if (!data) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Delivery Dashboard
        </h1>

        <Link
          href="/delivery/assignments"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Open Assignments
        </Link>

      </div>

      <div className="grid md:grid-cols-4 lg:grid-cols-8 gap-4">

        <Card
          title="Total Riders"
          value={data.totalRiders}
        />

        <Card
          title="Online Riders"
          value={data.onlineRiders}
        />

        <Card
          title="Orders"
          value={data.totalOrders}
        />

        <Card
          title="Delivered"
          value={data.deliveredOrders}
        />

        <Card
          title="Pending"
          value={data.pendingOrders}
        />

        <Card
          title="Assignments"
          value={data.assignments}
        />

        <Card
          title="Pending Accept"
          value={data.pendingAssignments}
        />

        <Card
          title="Delivered Jobs"
          value={data.deliveredAssignments}
        />

      </div>

      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-2">
          Rider Control Center
        </h2>

        <p className="text-gray-600 mb-5">
          Accept ? Pickup ?
          Send OTP ?
          Deliver
        </p>

        <Link
          href="/delivery/assignments"
          className="bg-green-600 text-white px-5 py-3 rounded-lg inline-block"
        >
          Manage Rider Assignments
        </Link>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
}: any) {
  return (
    <div className="bg-white shadow rounded-xl p-5">

      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value || 0}
      </h2>

    </div>
  );
}





