/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'q.qlogo.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ghchart.rshah.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'space.bilibili.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'count.getloli.com',
        pathname: '/**',
      },
      {
        protocol: 'http', // Bangumi 用的 http 链接
        hostname: 'lain.bgm.tv',
        pathname: '/**',
      },
    ],
    domains: ["lain.bgm.tv"], // 兼容写法（其实 remotePatterns 已经够了）
  },
};

module.exports = nextConfig;
