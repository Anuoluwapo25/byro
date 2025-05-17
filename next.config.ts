import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure dynamic routes
  async rewrites() {
    return [
      {
        source: '/viewevent/:id',
        destination: '/viewevent/[id]', // Matches your dynamic route folder structure
      },
    ];
  },

  // Enable trailing slashes if needed (optional)
  trailingSlash: false,

  // Add any custom webpack config if needed
  webpack: (config) => {
    return config;
  },

  // Enable experimental features if needed
  experimental: {
    appDir: true, // If using App Router
    serverComponentsExternalPackages: ['your-packages'],
  }
};

export default nextConfig;