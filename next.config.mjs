/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 必须设置为 export 以生成静态资源
  images: {
    unoptimized: true, // 静态导出需禁用默认图片优化
  },
};

export default nextConfig;
