// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { typedRoutes: true },
  output: 'standalone',
  images: { domains: [] },
};

export default config;
