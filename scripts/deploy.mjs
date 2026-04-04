#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting deployment build for Cloudflare Pages...\n');

try {
  console.log('🔨 Building Next.js application...\n');
  
  // Запускаем сборку Next.js
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n📦 Generating Cloudflare Pages output with @cloudflare/next-on-pages...\n');
  
  // Запускаем @cloudflare/next-on-pages
  execSync('npx @cloudflare/next-on-pages', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Build completed successfully!');
  console.log('📁 Output directory: .vercel/output/static');
  console.log('\n💡 Deploy with: npm run cf:deploy');
} catch (error) {
  console.error('\n❌ Build failed!');
  console.error('💡 Note: On Windows, build may fail locally. Use Cloudflare Pages Git integration instead.');
  throw error;
}
