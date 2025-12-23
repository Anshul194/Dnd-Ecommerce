import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bundle analyzer (only in development/analysis mode)
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? (await import('@next/bundle-analyzer')).default({ enabled: true })
  : (config) => config;


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  reactStrictMode: false, // Disabled to prevent double API calls in dev mode
  compress: true,

  // Experimental optimizations
  experimental: {
    // optimizeCss: true, // Disabled - requires critters package
    optimizePackageImports: ['lucide-react', 'react-toastify', 'swiper'],
  },

  // Performance headers for caching
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Comprehensive fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
        assert: false,
        constants: false,
        events: false,
        dgram: false,
        net: false,
        tls: false,
        child_process: false,
        async_hooks: false,
      };

      // Specifically handle the Tailwind CSS -> fast-glob -> @nodelib/fs chain
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^fast-glob$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@nodelib\/fs/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /@nodelib\/fs/,
          contextRegExp: /node_modules/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^mongoose$/,
        })
      );

      // Replace problematic modules with empty implementations
      config.resolve.alias = {
        ...config.resolve.alias,
        "@nodelib/fs.scandir": resolve(__dirname, "./lib/empty-fs-module.js"),
        "@nodelib/fs.stat": resolve(__dirname, "./lib/empty-fs-module.js"),
        "@nodelib/fs.walk": resolve(__dirname, "./lib/empty-fs-module.js"),
        "fast-glob": resolve(__dirname, "./lib/empty-glob-module.js"),
      };

      // Optimize bundle splitting for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            },
            // Separate chunk for React and Redux
            react: {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|redux|react-redux|@reduxjs)[\\/]/,
              chunks: 'all',
              priority: 30
            }
          }
        }
      };
    }

    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      "www.sampuranswadeshi.com",
      "cdn.shopify.com",
      "cdn.sanity.io",
      "images.unsplash.com",
      "bharat.nexprism.in",
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Enable Turbopack (Next.js 16+)
  turbopack: {},
};

export default withBundleAnalyzer(nextConfig);
