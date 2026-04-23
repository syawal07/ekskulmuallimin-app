import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'ekskul.muallimin.sch.id' },
      { protocol: 'https', hostname: 'api-ekskul.muallimin.sch.id' }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;