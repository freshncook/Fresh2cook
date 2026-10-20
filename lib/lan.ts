import os from "os";

/** This computer's Wi-Fi / LAN addresses, e.g. ["192.168.1.7"] */
export function lanAddresses(): string[] {
  const out: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family !== "IPv4" || a.internal) continue;
      if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address)) out.push(a.address);
    }
  }
  return [...new Set(out)];
}
