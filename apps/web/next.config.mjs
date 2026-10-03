/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eduyug/shared-types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
