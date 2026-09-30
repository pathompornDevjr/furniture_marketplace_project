/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thumb.ac-illust.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  devIndicators: false,
  // Fast navigation & barrel file bundle optimizations
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "lodash",
      "chart.js",
      "react-chartjs-2",
      "react-select",
      "sweetalert2",
    ],
  },
};

export default nextConfig;
