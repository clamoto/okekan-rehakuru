/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages サブディレクトリ対応 (リポジトリ名が okekan-rehakuru の場合)
  basePath: process.env.NODE_ENV === 'production' ? '/okekan-rehakuru' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/okekan-rehakuru/' : '',
};

export default nextConfig;
