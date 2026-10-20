"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    fetch("/api/fleet-zone-performance")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Zone Performance
      </h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}





