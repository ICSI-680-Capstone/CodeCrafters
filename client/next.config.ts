/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["socket.io-client"],
  images: { unoptimized: true },
};

module.exports = nextConfig;
