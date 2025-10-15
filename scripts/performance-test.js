#!/usr/bin/env node

/**
 * Simple performance test script to verify optimizations
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Performance Optimization Verification\n');

// Check if build artifacts exist
const buildDir = path.join(process.cwd(), '.next');
const staticDir = path.join(buildDir, 'static');

if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run `npm run build` first.');
  process.exit(1);
}

console.log('✅ Build directory exists');

// Check for optimized static assets
if (fs.existsSync(staticDir)) {
  const staticFiles = fs.readdirSync(staticDir, { recursive: true });
  const jsFiles = staticFiles.filter((f) => f.toString().endsWith('.js'));
  const cssFiles = staticFiles.filter((f) => f.toString().endsWith('.css'));

  console.log(`✅ Static assets generated:`);
  console.log(`   - JavaScript files: ${jsFiles.length}`);
  console.log(`   - CSS files: ${cssFiles.length}`);
}

// Check for Next.js optimizations
const buildManifest = path.join(buildDir, 'build-manifest.json');
if (fs.existsSync(buildManifest)) {
  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
  console.log('✅ Build manifest exists');

  if (manifest.pages) {
    const pageCount = Object.keys(manifest.pages).length;
    console.log(`   - Pages: ${pageCount}`);
  }
}

// Check for font optimization
const appDir = path.join(process.cwd(), 'src', 'app');
const layoutFile = path.join(appDir, 'layout.tsx');
if (fs.existsSync(layoutFile)) {
  const layoutContent = fs.readFileSync(layoutFile, 'utf8');
  if (layoutContent.includes('next/font/google')) {
    console.log('✅ Font optimization enabled (next/font/google)');
  }
  if (layoutContent.includes('preconnect')) {
    console.log('✅ Font preconnect enabled');
  }
}

// Check for performance monitoring
const perfFile = path.join(
  process.cwd(),
  'src',
  'lib',
  'utils',
  'performance.ts'
);
if (fs.existsSync(perfFile)) {
  console.log('✅ Performance monitoring utilities created');
}

// Check for caching utilities
const cacheFile = path.join(process.cwd(), 'src', 'lib', 'utils', 'cache.ts');
if (fs.existsSync(cacheFile)) {
  console.log('✅ Caching utilities created');
}

// Check for Vercel configuration
const vercelConfig = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelConfig)) {
  console.log('✅ Vercel deployment configuration exists');
}

// Check for deployment documentation
const deploymentDoc = path.join(process.cwd(), 'DEPLOYMENT.md');
if (fs.existsSync(deploymentDoc)) {
  console.log('✅ Deployment documentation created');
}

console.log('\n🎉 Performance optimization verification complete!');
console.log('\nNext steps:');
console.log('1. Deploy to Vercel');
console.log('2. Test Core Web Vitals with Lighthouse');
console.log('3. Monitor performance metrics in production');
