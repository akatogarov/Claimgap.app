#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), ".vercel", "output", "static");

console.log("Starting Cloudflare Pages build (Next.js + @cloudflare/next-on-pages)\n");

try {
  execSync("npm run build", {
    stdio: "inherit",
    env: { ...process.env },
  });

  console.log("\nGenerating Cloudflare Pages output with @cloudflare/next-on-pages...\n");

  execSync("npx @cloudflare/next-on-pages", {
    stdio: "inherit",
    env: { ...process.env },
  });

  if (!existsSync(OUT)) {
    console.error("\nBuild failed: missing output directory:", OUT);
    process.exit(1);
  }

  console.log("\nBuild completed successfully.");
  console.log("Output directory:", OUT);
  console.log("Deploy: npm run cf:deploy   or   wrangler pages deploy .vercel/output/static/");
} catch {
  console.error("\nBuild failed.");
  console.error("On Windows, next-on-pages may fail locally; use GitHub Actions or WSL.");
  process.exit(1);
}
