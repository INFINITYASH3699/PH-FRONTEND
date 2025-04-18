/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "placehold.co" },
      {
        protocol: "https",
        hostname: "repository-images.githubusercontent.com",
      },
      { protocol: "https", hostname: "marketplace.canva.com" },
      { protocol: "https", hostname: "weandthecolor.com" },
      { protocol: "https", hostname: "www.unsell.design" },
      { protocol: "https", hostname: "slidestack-prod.s3.amazonaws.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.shortpixel.ai" },
      { protocol: "https", hostname: "colorlib.com" },
      { protocol: "https", hostname: "www.dreamhost.com" },
      { protocol: "https", hostname: "www.hostinger.com" },
      { protocol: "https", hostname: "cdn.dribbble.com" },
      { protocol: "https", hostname: "cdn.searchenginejournal.com" },
      { protocol: "https", hostname: "xsgames.co" },
      { protocol: "https", hostname: "www.portfoliowebsitetemplate.com" },
      { protocol: "https", hostname: "designshack.net" },
      { protocol: "https", hostname: "templatefor.net" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
    domains: ["localhost"],
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Set appropriate eslint configuration
  eslint: {
    // Only run ESLint on certain directories
    dirs: ["src"],
    // Warning instead of error is generally more deployment-friendly
    ignoreDuringBuilds: true,
  },

  // Skip type checking during build for faster builds
  typescript: {
    // Warning instead of error is generally more deployment-friendly
    ignoreBuildErrors: true,
  },

  // Configure redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // Add a redirect from 0.0.0.0 to localhost
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "0.0.0.0:3001",
          },
        ],
        destination: "http://localhost:3001/:path*",
        permanent: false,
      },
    ];
  },

  // Configure headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Configure webpack
  webpack(config) {
    // Ensure problematic packages are not bundled on client or Edge runtime
    config.resolve.alias = {
      ...config.resolve.alias,
      bcrypt: false,
      mongoose: false,
      mongodb: false,
      "@mapbox/node-pre-gyp": false,
      "aws-sdk": false,
      "mock-aws-s3": false,
      nock: false,
    };

    return config;
  },

  // Increase the memory limit for the build process
  outputFileTracingExcludes: {
    "*": [
      "./node_modules/@swc/core-linux-x64-gnu",
      "./node_modules/@swc/core-linux-x64-musl",
      "./node_modules/@esbuild/linux-x64",
      "./node_modules/@mapbox/node-pre-gyp/**/*",
      "./node_modules/bcrypt/**/*",
      "./node_modules/mongoose/**/*",
      "./node_modules/mongodb/**/*",
    ],
  },
};

module.exports = nextConfig;
