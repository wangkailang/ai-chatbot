import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ['@ai-sdk/devtools'],
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
