import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/personal_finance' : '',
  assetPrefix: isProd ? '/personal_finance' : ''
};

export default nextConfig;
