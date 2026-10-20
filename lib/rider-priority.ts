export function calculateRiderScore(
  rider: any,
  order: any
) {
  let score = 100;

  const address = String(
    order?.address || ""
  ).toLowerCase();

  const zone = String(
    rider?.zoneId || ""
  ).toLowerCase();

  const activeOrders = Number(
    rider?.activeOrders || 0
  );

  const completed = Number(
    rider?.completedDeliveries || 0
  );

  const rating = Number(
    rider?.rating || 5
  );

  // DWARKA SECTOR MATCH

  const sectorMatch =
    address.match(
      /dwarka[\s\-]*([0-9]+)/i
    );

  if (
    sectorMatch &&
    zone.includes(
      sectorMatch[1]
    )
  ) {
    score += 150;
  }

  // SOCIETY MATCH

  const societyWords = [
    "apartment",
    "apartments",
    "society",
    "residency",
    "heights",
    "homes",
    "enclave",
    "park",
    "vihar",
    "tower",
  ];

  for (const word of societyWords) {
    if (
      address.includes(word)
    ) {
      score += 80;
      break;
    }
  }

  // LOAD BALANCING

  
score -= activeOrders * 25;

  if (activeOrders >= 3) {
    score -= 100;
  }

  if (activeOrders >= 5) {
    score -= 300;
  }



  // STATUS

  if (
    rider?.status ===
    "Available"
  ) {
    score += 50;
  }

  if (
    rider?.status ===
    "Busy"
  ) {
    score -= 20;
  }

  // EXPERIENCE

  score += Math.min(
    completed,
    100
  );

  // RATING

  score += Math.round(
    rating * 10
  );

  return score;
}




