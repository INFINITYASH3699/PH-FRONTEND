/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'repository-images.githubusercontent.com' },
      { protocol: 'https', hostname: 'marketplace.canva.com' },
      { protocol: 'https', hostname: 'weandthecolor.com' },
      { protocol: 'https', hostname: 'www.unsell.design' },
      { protocol: 'https', hostname: 'slidestack-prod.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.shortpixel.ai' },
      { protocol: 'https', hostname: 'colorlib.com' },
      { protocol: 'https', hostname: 'www.dreamhost.com' },
      { protocol: 'https', hostname: 'www.hostinger.com' },
      { protocol: 'https', hostname: 'cdn.dribbble.com' },
      { protocol: 'https', hostname: 'cdn.searchenginejournal.com' },
      { protocol: 'https', hostname: 'xsgames.co' },
      { protocol: 'https', hostname: 'www.portfoliowebsitetemplate.com' },
      { protocol: 'https', hostname: 'designshack.net' },
      { protocol: 'https', hostname: 'templatefor.net' },
    ],
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Configure redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Configure webpack
  webpack(config, { isServer }) {
    // Don't bundle bcrypt on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bcrypt: false,
        crypto: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Server external packages (moved from experimental.serverComponentsExternalPackages)
  serverExternalPackages: ['bcrypt', 'mongoose'],
};

export default nextConfig;
