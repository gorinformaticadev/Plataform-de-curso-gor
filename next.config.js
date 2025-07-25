/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  // Enable standalone output for Docker
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
