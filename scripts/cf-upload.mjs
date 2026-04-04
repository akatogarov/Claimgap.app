#!/usr/bin/env node
/**
 * Custom Cloudflare Pages upload script that uploads files one at a time
 * to work around ECONNRESET issues with large files.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { homedir } from 'os';

const ACCOUNT_ID = '062bff0ad5bbfa43d7de2e8a2eaf1d95';
const PROJECT_NAME = 'claimgap';
const STATIC_DIR = join(process.cwd(), '.vercel', 'output', 'static');

function getOAuthToken() {
  const configPath = join(homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
  const content = readFileSync(configPath, 'utf8');
  const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
  if (!match) throw new Error('No oauth_token found in wrangler config');
  return match[1];
}

async function apiRequest(method, path, body, authToken, timeoutMs = 120000) {
  const bodyStr = body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://api.cloudflare.com${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Connection': 'close',
      },
      body: bodyStr,
      signal: controller.signal,
    });
    const text = await res.text();
    try {
      return { status: res.status, body: JSON.parse(text) };
    } catch {
      return { status: res.status, body: text };
    }
  } finally {
    clearTimeout(tid);
  }
}

function getAllFiles(dir, base = dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      files.push(...getAllFiles(full, base));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const oauthToken = getOAuthToken();
  
  console.log('Getting upload token...');
  const tokenRes = await apiRequest('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/upload-token`, null, oauthToken);
  if (!tokenRes.body.success) throw new Error('Failed to get upload token: ' + JSON.stringify(tokenRes.body));
  let uploadJwt = tokenRes.body.result.jwt;
  let tokenObtainedAt = Date.now();
  console.log('Got upload token');

  async function getValidJwt() {
    // Refresh token if older than 90 seconds
    if (Date.now() - tokenObtainedAt > 90000) {
      process.stdout.write('(refreshing token) ');
      const r = await apiRequest('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/upload-token`, null, oauthToken);
      if (!r.body.success) throw new Error('Failed to refresh upload token');
      uploadJwt = r.body.result.jwt;
      tokenObtainedAt = Date.now();
    }
    return uploadJwt;
  }

  console.log('Scanning files...');
  const allFiles = getAllFiles(STATIC_DIR);
  console.log(`Found ${allFiles.length} files`);

  // Files to skip (Cloudflare-managed, can't be uploaded via Pages API)
  const SKIP_PATHS = new Set(['/cdn-cgi/errors/no-nodejs_compat.html']);

  // Build file map: hash -> { path, content }
  const fileMap = new Map();
  const manifest = {};
  for (const f of allFiles) {
    const content = readFileSync(f);
    const hash = createHash('sha256').update(content).digest('hex');
    const urlPath = '/' + relative(STATIC_DIR, f).replace(/\\/g, '/');
    if (SKIP_PATHS.has(urlPath)) continue;
    if (!fileMap.has(hash)) {
      fileMap.set(hash, { path: urlPath, content });
    }
    manifest[urlPath] = hash;
  }

  const hashes = [...fileMap.keys()];
  console.log(`${hashes.length} unique file hashes`);

  // Check which files are missing (use upload JWT, not OAuth token)
  console.log('Checking which files need uploading...');
  const missingRes = await apiRequest('POST', '/client/v4/pages/assets/check-missing', { hashes }, await getValidJwt(), 120000);
  
  if (!missingRes.body.success) {
    throw new Error('check-missing failed: ' + JSON.stringify(missingRes.body));
  }
  const missing = missingRes.body.result || [];
  console.log(`${missing.length} files need uploading`);

  // Upload each missing file individually with retries
  for (let i = 0; i < missing.length; i++) {
    const hash = missing[i];
    const file = fileMap.get(hash);
    if (!file) { console.warn(`  Hash ${hash} not found, skipping`); continue; }
    
    const sizeKB = (file.content.length / 1024).toFixed(1);
    process.stdout.write(`  [${i + 1}/${missing.length}] ${file.path} (${sizeKB} KB)... `);
    
    let uploaded = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const jwt = await getValidJwt();
        const payload = JSON.stringify([{
          key: hash,
          value: file.content.toString('base64'),
          metadata: { contentType: guessContentType(file.path) },
          base64: true,
        }]);
        const res = await apiRequest('POST', '/client/v4/pages/assets/upload', payload, jwt, 180000);
        if (!res.body.success) {
          throw new Error('Upload API error: ' + JSON.stringify(res.body.errors));
        }
        process.stdout.write(`OK\n`);
        uploaded = true;
        break;
      } catch (err) {
        if (attempt < 5) {
          process.stdout.write(`retry ${attempt}... `);
          await new Promise(r => setTimeout(r, 3000 * attempt));
        } else {
          process.stdout.write(`FAILED: ${err.message}\n`);
          throw err;
        }
      }
    }
  }

  // Create the deployment
  console.log('\nCreating deployment...');
  const deployRes = await apiRequest('POST',
    `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`,
    { manifest },
    oauthToken,
    60000
  );
  
  if (!deployRes.body.success) {
    throw new Error('Deployment failed: ' + JSON.stringify(deployRes.body));
  }
  
  const deployment = deployRes.body.result;
  console.log('\n✅ Deployment created!');
  console.log('URL:', deployment.url);
  console.log('ID:', deployment.id);
}

function guessContentType(path) {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.js') || path.endsWith('.mjs')) return 'application/javascript';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.woff2')) return 'font/woff2';
  if (path.endsWith('.woff')) return 'font/woff';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
