import type { NextConfig } from "next";
import os from "os";

// Lets you open the dev website from a phone on the same Wi-Fi (Admin > Open on mobile)
const lanHosts = Object.values(os.networkInterfaces())
  .flat()
  .filter((a) => a && a.family === "IPv4" && !a.internal)
  .map((a) => a!.address);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typedRoutes: false,

  allowedDevOrigins: lanHosts,
};

export default nextConfig;
