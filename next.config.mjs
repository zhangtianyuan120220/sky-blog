/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 必须加上这行！确保打包输出 out 目录
  images: {
    unoptimized: true, // 静态导出下必须禁用图片优化
  },
};

module.exports = nextConfig; // 如果是 mjs 则用 export default nextConfig;