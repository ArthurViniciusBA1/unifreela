import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true }, // Ignora TS errors
  eslint: { ignoreDuringBuilds: true }, // Ignora ESLint errors
};

export default nextConfig;
