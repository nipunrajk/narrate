# Deployment Guide

This document outlines the deployment process and performance optimizations for the Narrate journaling application.

## Performance Optimizations Implemented

### 1. Bundle Optimization

- **Code Splitting**: Automatic chunk splitting for vendors, Supabase, and AI libraries
- **Tree Shaking**: Optimized imports to reduce bundle size
- **Dynamic Imports**: Lazy loading of non-critical components

### 2. Caching Strategy

- **Server-Side Caching**: Next.js `unstable_cache` for database queries (5-minute TTL)
- **Static Assets**: Long-term caching for static resources (1 year)
- **API Routes**: No-cache headers for dynamic API endpoints
- **Client-Side Caching**: Memory cache for frequently accessed data

### 3. Font Optimization

- **Next.js Font Optimization**: Using `next/font/google` for optimal loading
- **Font Display Swap**: Prevents layout shift during font loading
- **Preconnect**: DNS prefetching for Google Fonts
- **Variable Fonts**: CSS custom properties for font families

### 4. Image Optimization

- **Next.js Image Component**: Automatic WebP/AVIF conversion
- **Responsive Images**: Multiple device sizes and formats
- **Lazy Loading**: Intersection Observer API for images
- **Long-term Caching**: 1-year cache TTL for optimized images

### 5. Performance Monitoring

- **Web Vitals**: Automatic tracking of Core Web Vitals (CLS, INP/FID, FCP, LCP, TTFB)
- **Bundle Analysis**: Development-time bundle size monitoring
- **Memory Monitoring**: Memory usage tracking in development
- **Performance Timing**: Function execution time measurement

## Deployment to Vercel

### Prerequisites

1. Vercel account
2. Supabase project set up
3. Google Gemini API key
4. Environment variables configured

### Step 1: Environment Variables

Set the following environment variables in your Vercel dashboard:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key

# Generate a secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Step 2: Deploy

1. Connect your GitHub repository to Vercel
2. Configure build settings (auto-detected for Next.js)
3. Deploy

### Step 3: Verify Deployment

1. Check that all environment variables are set
2. Test authentication flow
3. Test journal entry creation
4. Test AI summary generation
5. Verify performance metrics

## Performance Targets

### Core Web Vitals Goals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **INP (Interaction to Next Paint)**: < 200ms (replaces FID)
- **CLS (Cumulative Layout Shift)**: < 0.1

### Additional Metrics

- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 600ms
- **Bundle Size**: < 250KB (gzipped)

## Monitoring and Optimization

### Built-in Monitoring

The application includes built-in performance monitoring that:

- Tracks Core Web Vitals automatically
- Logs performance metrics in development
- Monitors memory usage
- Analyzes bundle composition

### Vercel Analytics (Optional)

Enable Vercel Analytics for additional insights:

1. Install: `npm install @vercel/analytics`
2. Add to layout: `import { Analytics } from '@vercel/analytics/react'`
3. Set `VERCEL_ANALYTICS_ID` environment variable

### Performance Optimization Checklist

#### Pre-deployment

- [ ] Run `npm run build` to check for build errors
- [ ] Verify bundle size with `npm run analyze` (if configured)
- [ ] Test performance in production mode locally
- [ ] Check Core Web Vitals with Lighthouse

#### Post-deployment

- [ ] Monitor Core Web Vitals in production
- [ ] Check server response times
- [ ] Verify caching headers are working
- [ ] Test on various devices and network conditions

## Troubleshooting

### Common Issues

#### Slow Initial Load

- Check bundle size and optimize imports
- Verify font loading strategy
- Ensure proper caching headers

#### Poor LCP Score

- Optimize images and fonts
- Reduce server response time
- Minimize render-blocking resources

#### High CLS Score

- Set explicit dimensions for images
- Use font-display: swap
- Avoid inserting content above existing content

#### Memory Leaks

- Check for uncleaned event listeners
- Monitor component unmounting
- Use React DevTools Profiler

### Performance Debugging

1. Use browser DevTools Performance tab
2. Check Network tab for resource loading
3. Use Lighthouse for comprehensive analysis
4. Monitor Vercel Function logs for server issues

## Continuous Optimization

### Regular Tasks

1. **Weekly**: Review Core Web Vitals metrics
2. **Monthly**: Analyze bundle size trends
3. **Quarterly**: Performance audit with Lighthouse
4. **As needed**: Optimize based on user feedback

### Optimization Opportunities

- Implement service worker for offline functionality
- Add progressive loading for large entry lists
- Optimize database queries based on usage patterns
- Consider CDN for static assets if needed

## Security Considerations

### Headers

The application includes security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Environment Variables

- Never commit sensitive keys to version control
- Use Vercel's environment variable encryption
- Rotate API keys regularly
- Use different keys for development and production
