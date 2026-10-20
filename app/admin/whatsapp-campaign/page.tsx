"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function WhatsAppCampaignPage() {
  const [campaigns, setCampaigns] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadCampaigns();
  }, []);

  function loadCampaigns() {
    const data = JSON.parse(
      localStorage.getItem(
        "freshcut-whatsapp-campaigns"
      ) || "[]"
    );

    setCampaigns(data);
  }

  function createCampaign() {
    if (
      !title ||
      !message
    ) {
      alert(
        "Fill All Fields"
      );
      return;
    }

    const updated = [
      {
        id: Date.now(),
        title,
        message,
        status: "Draft",
        createdAt:
          new Date().toLocaleDateString(),
      },
      ...campaigns,
    ];

    localStorage.setItem(
      "freshcut-whatsapp-campaigns",
      JSON.stringify(updated)
    );

    setTitle("");
    setMessage("");

    loadCampaigns();
  }

  function sendCampaign(
    id: number
  ) {
    const updated =
      campaigns.map(
        (item: any) =>
          item.id === id
            ? {
                ...item,
                status: "Sent",
              }
            : item
      );

    localStorage.setItem(
      "freshcut-whatsapp-campaigns",
      JSON.stringify(updated)
    );

    loadCampaigns();

    alert(
      "Campaign Sent Successfully"
    );
  }

  function deleteCampaign(
    id: number
  ) {
    const updated =
      campaigns.filter(
        (item: any) =>
          item.id !== id
      );

    localStorage.setItem(
      "freshcut-whatsapp-campaigns",
      JSON.stringify(updated)
    );

    loadCampaigns();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-\[1600px\] mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          WhatsApp Campaigns
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Create Campaign
          </h2>

          <div className="space-y-6">

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Campaign Title"
              className="w-full border p-3 rounded-2xl"
            />

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="WhatsApp Message"
              rows={5}
              className="w-full border p-3 rounded-2xl"
            />

            <button
              onClick={
                createCampaign
              }
              className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold"
            >
              Create Campaign
            </button>

          </div>

        </div>

        <div className="space-y-6">

          {campaigns.map(
            (campaign: any) => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex flex-col md:flex-row md:justify-between gap-5">

                  <div>

                    <h2 className="text-xl font-bold">
                      {campaign.title}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {campaign.message}
                    </p>

                    <p className="mt-3 font-bold text-blue-600">
                      {campaign.status}
                    </p>

                  </div>

                  <div className="flex gap-2 flex-wrap">

                    <button
                      onClick={() =>
                        sendCampaign(
                          campaign.id
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-2xl"
                    >
                      Send
                    </button>

                    <button
                      onClick={() =>
                        deleteCampaign(
                          campaign.id
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-2xl"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}











