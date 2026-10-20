"use client";

import { useEffect, useState } from "react";

export default function Page() {

  const [kpi,setKpi] =
    useState<any>();

  useEffect(() => {
    fetch("/api/fleet-kpi-trends")
      .then(r => r.json())
      .then(setKpi);
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        KPI Dashboard
      </h1>

      <pre>
        {JSON.stringify(
          kpi,
          null,
          2
        )}
      </pre>

    </div>
  );
}





