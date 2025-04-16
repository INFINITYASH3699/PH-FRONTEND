/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: [
      'ui-avatars.com',
      'repository-images.githubusercontent.com',
      'marketplace.canva.com',
      'weandthecolor.com',
      'www.unsell.design',
      'slidestack-prod.s3.amazonaws.com',
      'placehold.co',
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Only include the bcrypt module on the server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bcrypt: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
