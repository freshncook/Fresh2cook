"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DeliveryAlertsPage() {
  const [alerts, setAlerts] =
    useState<any[]>([]);

  const [showPopup, setShowPopup] =
    useState(false);

  const [latestAlert, setLatestAlert] =
    useState<any>(null);

  useEffect(() => {
    loadAlerts();

    const interval =
      setInterval(() => {
        loadAlerts();
      }, 10000);

    return () =>
      clearInterval(interval);
  }, []);

  async function playWarning() {
    try {
      const audio =
        new Audio(
          "/warning.mp3"
        );

      audio.volume = 1;

      await audio.play();
    } catch (error) {
      console.log(error);
    }
  }

  async function loadAlerts() {
    try {
      const res = await fetch(
        "/api/admin-delivery-alerts"
      );

      const data =
        await res.json();

      const list =
        Array.isArray(data)
          ? data
          : [];

      setAlerts(list);

      if (list.length > 0) {
        setLatestAlert(list[0]);

        setShowPopup(true);

        playWarning();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function openManualAssign(
    assignmentId: number
  ) {
    window.location.href =
      `/admin/manual-assign?assignmentId=${assignmentId}`;
  }

  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Delivery Alerts
        </h1>

        <p className="text-gray-500">
          Rider Missed Pickup Monitoring
        </p>
      </div>

      {showPopup &&
        latestAlert && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-8 w-[500px]">

              <div className="text-center">

                <div className="text-6xl mb-3">
                  ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â¨
                </div>

                <h2 className="text-2xl font-bold text-red-600">
                  Delivery Alert
                </h2>

                <p className="mt-4">
                  Assignment #
                  {
                    latestAlert.id
                  }
                </p>

                <p>
                  Rider did not
                  accept order in
                  time.
                </p>

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      openManualAssign(
                        latestAlert.id
                      )
                    }
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl"
                  >
                    Assign Manually
                  </button>

                  <button
                    onClick={() =>
                      setShowPopup(
                        false
                      )
                    }
                    className="flex-1 border py-3 rounded-xl"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      <div className="space-y-4">

        {alerts.map(
          (alert) => (
            <div
              key={alert.id}
              className="bg-white border rounded-2xl p-5"
            >
              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold">
                    Assignment #
                    {alert.id}
                  </h3>

                  <p>
                    Order :
                    {
                      alert.orderId
                    }
                  </p>

                  <p>
                    Rider :
                    {
                      alert.deliveryBoyId
                    }
                  </p>

                  <p>
                    Status :
                    {
                      alert.status
                    }
                  </p>

                </div>

                <button
                  onClick={() =>
                    openManualAssign(
                      alert.id
                    )
                  }
                  className="bg-red-600 text-white px-5 py-3 rounded-xl"
                >
                  Assign Now
                </button>

              </div>
            </div>
          )
        )}

        {alerts.length ===
          0 && (
          <div className="bg-white rounded-2xl p-10 text-center">
            No Alerts Found
          </div>
        )}

      </div>

    </div>
  );
}






