/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure files are copied correctly during build
  async rewrites() {
    return [
      {
        source: '/Ads.txt',
        destination: '/Ads.txt',
      },
      {
        source: '/ads.txt',
        destination: '/Ads.txt',
      }
    ];
  },
}

module.exports = nextConfig
