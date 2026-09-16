/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",        // 扫描 src 目录 (app/ 页面等)
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // 必须！扫描根目录 components 文件夹
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
