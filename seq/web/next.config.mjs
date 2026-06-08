/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

export default nextConfig;
