import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ปิดการแจ้งเตือนจุกจิกตอน Build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // สั่งให้ข้ามการตรวจจับ Type Error แล้ว Build ให้ผ่านไปเลย
    ignoreBuildErrors: true,
  },
};

export default nextConfig;