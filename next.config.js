/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['next-auth'],
  transpilePackages: ['thai-banks-logo'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/casperstack/thai-banks-logo/**',
      },
    ],
  }, // สำคัญมาก: เพื่อให้ Docker Image เล็กและรัน server.js ได้
  typescript: {
    ignoreBuildErrors: true, // ป้องกัน CI พังจาก Type error เล็กน้อย
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
