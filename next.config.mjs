/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 必须开启静态导出，导出 out/ 目录给 Tauri 使用
  images: {
    unoptimized: true, // 静态导出需关闭图片优化
  },
};

export default nextConfig;
