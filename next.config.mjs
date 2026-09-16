/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静态导出，配合 Tauri 打包
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
