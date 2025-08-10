import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Ignore binary modules on the client side
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'discord.js': 'commonjs discord.js',
        '@discordjs/voice': 'commonjs @discordjs/voice',
      });
    }
    
    return config;
  },
  serverExternalPackages: ['discord.js', '@discordjs/voice'],
};

export default nextConfig;
