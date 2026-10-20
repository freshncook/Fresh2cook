export async function getDeliveryDashboard() {
  const res = await fetch(
    "/api/admin-delivery-dashboard",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getRiders() {
  const res = await fetch(
    "/api/admin-rider-list",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getLiveRiders() {
  const res = await fetch(
    "/api/admin-live-riders",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getOrders() {
  const res = await fetch(
    "/api/admin-delivery-orders",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getAlerts() {
  const res = await fetch(
    "/api/admin-delivery-alerts",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getPerformance() {
  const res = await fetch(
    "/api/admin-delivery-performance",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(
    "/api/admin-delivery-leaderboard",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export async function getFinance() {
  const res = await fetch(
    "/api/delivery-finance-report",
    {
      cache: "no-store",
    }
  );

  return res.json();
}


