import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Izinkan gambar dari Unsplash (untuk default hero/login image)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' }
    ]
  },
  // 2. Naikkan limit upload server action (biar ga error pas upload foto besar)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
  // 3. (Opsional) Matikan indikator static/dynamic saat build biar log bersih
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;