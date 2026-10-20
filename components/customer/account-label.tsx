"use client";

import { useEffect, useState } from "react";

/* Header label: "Login / Sign Up" or "Hi, Name" when the customer is logged in. */
export default function AccountLabel() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customer-account", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setName(j?.profile?.name ? String(j.profile.name).split(" ")[0] : null))
      .catch(() => setName(null));
  }, []);

  return <>{name ? `Hi, ${name}` : "Login / Sign Up"}</>;
}
