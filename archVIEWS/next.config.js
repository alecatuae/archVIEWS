/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'], // Add domains for images if needed
  },
  transpilePackages: ['react-cytoscapejs'],
  webpack: (config, { isServer }) => {
    // Fix for ES modules import issue with react-cytoscapejs
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Allow importing directly from node_modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
}

module.exports = nextConfig 