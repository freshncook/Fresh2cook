"use client";

import { useEffect, useState } from "react";

export default function OrderTimelinePage(){

  const [timeline,setTimeline] =
    useState<any[]>([]);

  useEffect(()=>{

    const params =
      new URLSearchParams(
        window.location.search
      );

    const id =
      params.get("id");

    if(!id) return;

    fetch(
      `/api/order-timeline/${id}`
    )
    .then(r=>r.json())
    .then(setTimeline);

  },[]);

  return (
    <div className="max-w-3xl mx-auto p-4">

      <h1 className="text-3xl font-bold mb-6">
        Order Timeline
      </h1>

      <div className="space-y-4">

        {timeline.map((item)=>(
          <div
            key={item.step}
            className="rounded-xl border p-4 bg-white"
          >
            <div className="flex justify-between">

              <div className="font-semibold">
                {item.title}
              </div>

              <div>
                {item.completed
                  ? "✅"
                  : "⏳"}
              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}


