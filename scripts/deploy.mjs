#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting deployment build...\n');

console.log('🔨 Building with @cloudflare/next-on-pages...\n');

try {
  // Запускаем сборку Next.js
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n📦 Generating Cloudflare Pages output...\n');
  
  // Запускаем @cloudflare/next-on-pages
  execSync('npx @cloudflare/next-on-pages', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  throw error;
}
