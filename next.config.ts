import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack, dev }) => {
    // Matikan cache saat dev mode untuk mencegah RAM leak / allocation error di Windows
    if (dev) {
      config.cache = false;
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        path: false,
        stream: false,
        https: false,
        http: false,
        zlib: false,
      };

      // Handle node:* imports used internally by pptxgenjs in browser builds
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (resource: any) => {
            resource.request = resource.request.replace(/^node:/, "");
          }
        )
      );
    }
    return config;
  },
};

export default nextConfig;
