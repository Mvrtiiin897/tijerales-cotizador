import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias.xlsx = path.join(__dirname, "node_modules/xlsx/dist/xlsx.full.min.js")
    return config
  },
  turbopack: {
    resolveAlias: {
      xlsx: "./node_modules/xlsx/dist/xlsx.full.min.js",
    },
  },
}

export default nextConfig
