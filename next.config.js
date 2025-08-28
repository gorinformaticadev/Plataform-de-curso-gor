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
    domains: [
      'images.pexels.com',
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      }
    ]
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Correção para problemas de barrel optimization do Lucide React
  experimental: {
    // optimizePackageImports: false // Desabilitado para evitar conflitos com Lucide React
  },

  // Configuração webpack para resolver importações do Lucide React
  webpack: (config, { isServer }) => {
    // Resolver alias para Lucide React
    config.resolve.alias = {
      ...config.resolve.alias,
      'lucide-react': require.resolve('lucide-react'),
    };
    
    return config;
  },

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
  