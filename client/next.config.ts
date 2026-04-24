/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" is only needed for Docker self-hosting (set via Dockerfile ARG).
  // Vercel manages its own output format, so we leave it unset there.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" } : {}),
  serverExternalPackages: ["socket.io-client"],
  images: { unoptimized: true },
};

module.exports = nextConfig;
