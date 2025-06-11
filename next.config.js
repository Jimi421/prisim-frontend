/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Only .tsx/.ts/.jsx/.js in pages/, api/, etc.
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // If you pull images from external sources, list them here:
  images: {
    domains: [],
  },
  // Any other Next.js flags you need go here
  // experimental: { appDir: true },  // enable if you switch to /app router
}

module.exports = nextConfig

