/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",   // needed for Docker / Render deployment
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost", port: "5000" },
      { protocol: "https", hostname: "*.onrender.com" },
    ],
  },
};
module.exports = nextConfig;
