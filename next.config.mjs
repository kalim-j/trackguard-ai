/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore TypeScript errors during production build (ideal for prototype/demo)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint checks during production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
