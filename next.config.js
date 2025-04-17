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
      { protocol: 'https', hostname: 'via.placeholder.com' },
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
    // Don't bundle server-only packages on the client side
    if (!isServer) {
      // Replace problematic packages with empty modules
      config.resolve.alias = {
        ...config.resolve.alias,
        bcrypt: false,
        mongoose: false,
        mongodb: false,
        '@mapbox/node-pre-gyp': false,
      };
    } else {
      // For server-side code, we should still use the real modules
      // but we'll handle them properly
      config.externals = [...(config.externals || []), 'bcrypt', 'mongoose', 'mongodb'];
    }

    return config;
  },

  // Explicitly mark server-only packages
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'mongoose', 'mongodb', '@mapbox/node-pre-gyp'],
  },

  // Increase the memory limit for the build process (moved from experimental to root)
  outputFileTracingExcludes: {
    '*': [
      './node_modules/@swc/core-linux-x64-gnu',
      './node_modules/@swc/core-linux-x64-musl',
      './node_modules/@esbuild/linux-x64',
      './node_modules/@mapbox/node-pre-gyp/**/*',
      './node_modules/bcrypt/**/*',
      './node_modules/mongoose/**/*',
      './node_modules/mongodb/**/*',
    ],
  },

  // Specify server actions settings
  serverActions: {
    bodySizeLimit: '2mb',
  },
};

export default nextConfig;
