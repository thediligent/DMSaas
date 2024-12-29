/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "api.slingacademy.com",
        port: ""
      }
    ]
  },
  transpilePackages: ["geist"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      components: path.resolve(__dirname, "components")
    };
    return config;
  }
};

module.exports = nextConfig;
