import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        https: false,
        http: false,
        path: false,
        stream: false,
        crypto: false,
        os: false,
        child_process: false,
      };
    }
    // Handle node: prefix
    config.externals = [...(config.externals || []), { "node:fs": "commonjs fs", "node:path": "commonjs path", "node:https": "commonjs https", "node:http": "commonjs http" }];
    
    return config;
  },
};

export default nextConfig;
