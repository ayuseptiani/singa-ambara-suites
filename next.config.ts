import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // TAMBAHKAN INI AGAR GAMBAR DARI LARAVEL BISA MUNCUL
      {
        protocol: "https",
        hostname: "api.singa-ambara-suites.web.id",
      },
      // Jaga-jaga jika pakai subdomain lain atau www
      {
        protocol: "https",
        hostname: "singa-ambara-suites.web.id",
      }
    ],
  },
};

export default nextConfig;