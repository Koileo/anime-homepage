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
        hostname: 'i.pinimg.com', // 如果以后用其他图片也加进来
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
