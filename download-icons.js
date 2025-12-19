#!/usr/bin/env node

/**
 * Script to download tech stack icons for the portfolio
 * Downloads from assets.chanhdai.com and Simple Icons as fallback
 * 
 * Usage: node scripts/download-icons.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Output directory for icons
const OUTPUT_DIR = path.join(__dirname, '../public/images/tech-stack-icons');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Tech stack icons to download
// Format: { key, hasTheme, simpleIconsSlug }
const ICONS = [
  // Languages
  { key: 'typescript', hasTheme: false },
  { key: 'js', hasTheme: false },
  { key: 'python', hasTheme: false },
  { key: 'php', hasTheme: false },
  { key: 'java', hasTheme: false },
  { key: 'html5', hasTheme: false, simpleIconsSlug: 'html5' },
  { key: 'css3', hasTheme: false, simpleIconsSlug: 'css3' },
  { key: 'rust', hasTheme: false, simpleIconsSlug: 'rust' },
  { key: 'cpp', hasTheme: false, simpleIconsSlug: 'cplusplus' },
  
  // Runtime
  { key: 'nodejs', hasTheme: false },
  { key: 'bun', hasTheme: false },
  
  // Frontend
  { key: 'react', hasTheme: false },
  { key: 'nextjs2', hasTheme: true },
  { key: 'tailwindcss', hasTheme: false },
  { key: 'shadcn-ui', hasTheme: true },
  { key: 'radixui', hasTheme: true },
  { key: 'base-ui', hasTheme: true },
  { key: 'motion', hasTheme: false },
  { key: 'tanstack', hasTheme: true },
  
  // State Management
  { key: 'mobx-state-tree', hasTheme: false },
  { key: 'redux', hasTheme: false },
  
  // UI Libraries
  { key: 'antd', hasTheme: false },
  
  // Navigation
  { key: 'react-router', hasTheme: true },
  { key: 'react-navigation', hasTheme: false },
  
  // Backend
  { key: 'loopback', hasTheme: false },
  { key: 'laravel', hasTheme: false },
  { key: 'expressjs', hasTheme: true, simpleIconsSlug: 'express' },
  { key: 'honojs', hasTheme: false, simpleIconsSlug: 'hono' },
  
  // Database
  { key: 'mysql', hasTheme: false },
  { key: 'mongodb', hasTheme: false },
  { key: 'redis', hasTheme: false },
  { key: 'postgresql', hasTheme: false, simpleIconsSlug: 'postgresql' },
  
  // ORM
  { key: 'prisma', hasTheme: true, simpleIconsSlug: 'prisma' },
  { key: 'drizzle', hasTheme: false, simpleIconsSlug: 'drizzle' },
  
  // DevOps
  { key: 'git', hasTheme: false },
  { key: 'docker', hasTheme: false },
  
  // Platforms
  { key: 'vercel', hasTheme: true, simpleIconsSlug: 'vercel' },
  { key: 'aws', hasTheme: false, simpleIconsSlug: 'amazonwebservices' },
  { key: 'supabase', hasTheme: false, simpleIconsSlug: 'supabase' },
  
  // API
  { key: 'graphql', hasTheme: false, simpleIconsSlug: 'graphql' },
  
  // Auth
  { key: 'clerk', hasTheme: true, simpleIconsSlug: 'clerk' },
  
  // Payments
  { key: 'stripe', hasTheme: false, simpleIconsSlug: 'stripe' },
  
  // Design
  { key: 'figma', hasTheme: false },
  { key: 'ps', hasTheme: false },
  
  // AI
  { key: 'chatgpt', hasTheme: true },
];

// Primary source: assets.chanhdai.com
const CHANHDAI_BASE = 'https://assets.chanhdai.com/images/tech-stack-icons';

// Fallback: Simple Icons (monochrome SVGs)
const SIMPLE_ICONS_BASE = 'https://cdn.simpleicons.org';

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadIcon(key, suffix = '') {
  const filename = suffix ? `${key}${suffix}.svg` : `${key}.svg`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✓ ${filename} (exists)`);
    return true;
  }
  
  // Try chanhdai first
  try {
    const url = `${CHANHDAI_BASE}/${filename}`;
    const svg = await download(url);
    fs.writeFileSync(outputPath, svg);
    console.log(`✓ ${filename} (chanhdai)`);
    return true;
  } catch (e) {
    // Try Simple Icons as fallback
    const icon = ICONS.find(i => i.key === key);
    if (icon?.simpleIconsSlug && !suffix) {
      try {
        // Simple Icons returns monochrome SVG
        const url = `${SIMPLE_ICONS_BASE}/${icon.simpleIconsSlug}`;
        const svg = await download(url);
        fs.writeFileSync(outputPath, svg);
        console.log(`✓ ${filename} (simpleicons)`);
        return true;
      } catch (e2) {
        console.log(`✗ ${filename} (not found)`);
        return false;
      }
    }
    console.log(`✗ ${filename} (not found)`);
    return false;
  }
}

async function main() {
  console.log('Downloading tech stack icons...\n');
  console.log(`Output: ${OUTPUT_DIR}\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const icon of ICONS) {
    if (icon.hasTheme) {
      // Download light and dark variants
      const lightOk = await downloadIcon(icon.key, '-light');
      const darkOk = await downloadIcon(icon.key, '-dark');
      if (lightOk && darkOk) success++; else failed++;
    } else {
      // Download single icon
      const ok = await downloadIcon(icon.key);
      if (ok) success++; else failed++;
    }
  }
  
  console.log(`\nDone! ${success} icons downloaded, ${failed} failed.`);
  console.log(`\nNext steps:`);
  console.log(`1. For missing icons, download manually from https://simpleicons.org`);
  console.log(`2. For themed icons, create -light.svg and -dark.svg variants`);
  console.log(`3. Update tech-stack.tsx to use /images/tech-stack-icons/ instead of external CDN`);
}

main().catch(console.error);
