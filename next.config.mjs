/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Actions (configure-pages) 自動設定対応
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
