/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better developer experience
  reactStrictMode: true,
  // Disable image optimization in dev to speed up local development
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig; 