import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

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
      };

      // Specifically handle the Tailwind CSS -> fast-glob -> @nodelib/fs chain
      config.plugins.push(
        // Ignore the entire fast-glob module on client-side
        new webpack.IgnorePlugin({
          resourceRegExp: /^fast-glob$/,
        }),
        
        // Ignore @nodelib/fs modules specifically
        new webpack.IgnorePlugin({
          resourceRegExp: /^@nodelib\/fs/,
        }),
        
        // Ignore context-specific @nodelib imports
        new webpack.IgnorePlugin({
          resourceRegExp: /@nodelib\/fs/,
          contextRegExp: /node_modules/,
        })
      );

      // Replace problematic modules with empty implementations
      config.resolve.alias = {
        ...config.resolve.alias,
        '@nodelib/fs.scandir': resolve(__dirname, './lib/empty-fs-module.js'),
        '@nodelib/fs.stat': resolve(__dirname, './lib/empty-fs-module.js'),
        '@nodelib/fs.walk': resolve(__dirname, './lib/empty-fs-module.js'),
        'fast-glob': resolve(__dirname, './lib/empty-glob-module.js'),
      };
    }
    
    return config;
  },
};

export default nextConfig;