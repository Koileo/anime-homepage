import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',   // 允许所有路径
      },
      {
        protocol: 'https',
        hostname: 'q.qlogo.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ghchart.rshah.org',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;

export default nextConfig;
