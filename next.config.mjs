/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained Node.js server for Docker/CVM deployments.
  output: "standalone",
  reactStrictMode: true,
}

export default nextConfig
