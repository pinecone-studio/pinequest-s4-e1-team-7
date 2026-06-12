import bundleAnalyzer from "@next/bundle-analyzer";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-backend-wasm",
    "@tensorflow/tfjs-core",
  ],
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public bucket
        protocol: "https",
        hostname: "pub-0b4b208083b74e5293a1ae3ed2fa6ba1.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
