import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ビルド時の型エラーを無視してデプロイを続行させる
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint（コードの書き方チェック）のエラーも無視する
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;