"use client";

import { useEffect, useState } from "react";

export default function Page() {

  const [analytics,setAnalytics] =
    useState<any>();

  useEffect(() => {
    fetch("/api/fleet-executive-analytics")
      .then(r => r.json())
      .then(setAnalytics);
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Executive Dashboard
      </h1>

      <pre>
        {JSON.stringify(
          analytics,
          null,
          2
        )}
      </pre>

    </div>
  );
}





