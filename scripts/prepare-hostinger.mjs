import { cp, access } from "node:fs/promises";

await access(".next/standalone/server.js");
await cp("public", ".next/standalone/public", { recursive: true });
await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
console.log("Hostinger standalone server and assets are ready.");
