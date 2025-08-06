const backendUrl = process.env.BACKEND_API_URL;

if (!backendUrl) {
  throw new Error('❌ A variável de ambiente BACKEND_API_URL não está definida.');
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.pexels.com'],
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
  