export function extractArea(address?: string) {
  if (!address) return "";

  const text = address.toLowerCase();

  const areas = [
    "dwarka 1",
    "dwarka 2",
    "dwarka 3",
    "dwarka 4",
    "dwarka 5",
    "dwarka 6",
    "dwarka 7",
    "dwarka 8",
    "dwarka 9",
    "dwarka 10",
    "dwarka 11",
    "dwarka 12",
    "dwarka 13",
    "dwarka 14",
    "dwarka 15",
    "mahavir enclave",
    "palam",
    "dabri",
    "janakpuri",
    "uttam nagar"
  ];

  const match = areas.find(
    (a) => text.includes(a)
  );

  return match || "";
}

export function extractSociety(address?: string) {
  if (!address) return "";

  const text = address.toLowerCase();

  const societies = [
    "sai apartment",
    "bharat apartment",
    "dream apartment",
    "rosewood",
    "gokul apartment",
    "manokamna apartment",
    "veena enclave",
    "shree apartment"
  ];

  const match = societies.find(
    (s) => text.includes(s)
  );

  return match || "";
}

export function zonePriorityScore(
  rider: any,
  order: any
) {
  let score = 0;

  const area =
    extractArea(order?.address);

  const society =
    extractSociety(order?.address);

  if (
    rider?.zoneName &&
    area &&
    rider.zoneName
      .toLowerCase()
      .includes(area)
  ) {
    score += 50;
  }

  if (
    rider?.preferredArea &&
    area &&
    rider.preferredArea
      .toLowerCase()
      .includes(area)
  ) {
    score += 40;
  }

  if (
    rider?.preferredSociety &&
    society &&
    rider.preferredSociety
      .toLowerCase()
      .includes(society)
  ) {
    score += 100;
  }

  return score;
}

