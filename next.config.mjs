/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 开启静态导出，生成 out 文件夹供 Tauri 加载
  images: {
    unoptimized: true, // 静态导出模式下必须禁用默认图片优化
  },
};

export default nextConfig;
