/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'api.fluencerz.com', // production API
      'staging.fluencerz.com', // staging (if needed)
      'cdn.fluencerz.com', // CDN (if any)
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4004',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.fluencerz.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'staging.fluencerz.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
