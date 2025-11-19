import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    domains: [
      "www.sampuranswadeshi.com",
      "cdn.shopify.com",
      "cdn.sanity.io",
      "images.unsplash.com",
      "bharat.nexprism.in",
    ],
  },
};

export default nextConfig;
