import legacyCards from './lib/legacy-cards.json';
import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects(){return Object.entries(legacyCards).map(([id,card])=>({source:`/card/${id}`,destination:`/card/${card.slug}`,statusCode:301 as const}));},
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
