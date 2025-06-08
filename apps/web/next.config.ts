import type { NextConfig } from "next";
import dotenv from "dotenv"
import path from "path"

dotenv.config({path: path.resolve(__dirname, "../../.env")})
dotenv.config({path: path.resolve(__dirname, "./.env")})
const nextConfig: NextConfig = {
  env: {
    HTTP_BACKEND:`${process.env.HTTP_BACKEND_URL}:${process.env.HTTP_PORT}`
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
