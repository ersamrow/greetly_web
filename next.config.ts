import legacyCards from './lib/legacy-cards.json';
import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects(){return Object.entries(legacyCards).flatMap(([id,card])=>{
    const collection=['birthday','anniversary','thank-you','daily','festivals'][Math.floor((Number(id.slice(1))-1)/12)];
    const destination=`/occasions/${collection}?template=${id}`;
    return [id,card.slug].map(slug=>({source:`/card/${slug}`,destination,statusCode:301 as const}));
  });},
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
