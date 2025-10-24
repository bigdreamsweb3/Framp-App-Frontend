/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Force Webpack instead of Turbopack
  experimental: {
    webpack: true,
    turbopack: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }

    return config
  },
}

export default nextConfig
