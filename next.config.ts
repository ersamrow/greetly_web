import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mysql2"],
  webpack(config, { webpack }) {
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /^@\/lib\/runtime-env$/,
      resolve(process.cwd(), "lib/node-env.ts"),
    ));
    return config;
  },
};

export default nextConfig;
