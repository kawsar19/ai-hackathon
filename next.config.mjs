/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable Turbopack (Next.js 16 default) with no custom config
  turbopack: {},
}

export default nextConfig
