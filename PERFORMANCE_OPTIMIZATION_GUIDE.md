# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the BIM-AIDED Next.js application to improve initial page load times and overall site performance through code splitting and lazy loading.

## Changes Implemented

### 1. Route-Level Code Splitting

All public-facing pages now use dynamic imports for heavy components:

#### Pages Optimized:
- ✅ `/services` - Services overview page
- ✅ `/services/bim-modeling` - BIM Modeling service details
- ✅ `/services/advanced-bim` - Advanced BIM service details
- ✅ `/services/vdc-services` - VDC services details
- ✅ `/services/global-bim` - Global BIM service details
- ✅ `/projects` - Projects showcase page
- ✅ `/about` - About us page
- ✅ `/contact` - Contact page
- ✅ `/career` - Career opportunities page

#### Components Lazy Loaded:
- **Navigation** - Header navigation component (loaded with skeleton fallback)
- **Footer** - Footer component (loaded with skeleton fallback)
- **JobApplicationDialog** - Career application dialog (loaded on demand)
- **JobDetailsDialog** - Job details dialog (loaded on demand)

### 2. Component-Level Lazy Loading

Heavy admin components are already using lazy loading:
- ✅ Admin dashboard components (AddEmployeeForm, EmployeeList, etc.)
- ✅ Employee dashboard components (EmployeeProfile, LeaveRequestForm, etc.)
- ✅ Home page components (Navigation, Footer, ParallaxHero)

### 3. Library-Level Code Splitting

Heavy third-party libraries are now loaded on demand:

#### XLSX (Excel Export):
- **Before**: Loaded on every admin page load (~600 KB)
- **After**: Loaded only when user clicks export button
- **Files Updated**:
  - `components/admin/AttendanceRecords.tsx`
  - `components/admin/TransactionManager.tsx`

### 4. Next.js Configuration Enhancements

Updated `next.config.mjs` with:

#### Package Import Optimization:
```javascript
optimizePackageImports: [
  'lucide-react',
  '@radix-ui/*', // All Radix UI components
  'recharts',
  'date-fns',
  'firebase',
  '@tanstack/react-query',
]
```

#### Advanced Webpack Splitting:
- **Vendor chunks**: Split into smaller chunks (max 244KB)
- **Firebase chunk**: Separate bundle for Firebase libraries
- **UI chunk**: Separate bundle for Radix UI and Lucide icons
- **Async chunks**: Heavy libraries (xlsx, recharts, pdf) load on demand
- **Common chunk**: Shared code across routes

### 5. Providers Optimization

The global `Providers.tsx` component already implements:
- ✅ Lazy loading for `WhatsAppWidget`
- ✅ Lazy loading for `ScrollToTop`
- ✅ Optimized QueryClient configuration with caching

## How to Verify Improvements

### 1. Build Analysis

Run the bundle analysis script:

```bash
chmod +x scripts/analyze-bundle.sh
./scripts/analyze-bundle.sh
```

Or manually:

```bash
npm run build
```

Look for:
- Reduced "First Load JS" sizes
- More route-specific chunks
- Separate async chunks for heavy libraries

### 2. Development Testing

```bash
npm run dev
```

Test navigation between routes:
- Should only load required chunks for each route
- Network tab should show progressive loading
- Navigation and Footer should appear quickly with skeleton loaders

### 3. Production Testing

```bash
npm run build
npm run start
```

Access the site and check:
- Initial page load time
- Time to Interactive (TTI)
- Lighthouse scores

### 4. Chrome DevTools Performance

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Check "Disable cache"
4. Reload the page
5. Observe:
   - Initial bundle size
   - Number of chunks loaded
   - Time to load each chunk

### 5. Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select "Performance" category
4. Click "Analyze page load"
5. Check metrics:
   - **First Contentful Paint (FCP)**: Should be < 1.8s
   - **Largest Contentful Paint (LCP)**: Should be < 2.5s
   - **Time to Interactive (TTI)**: Should be < 3.8s
   - **Total Blocking Time (TBT)**: Should be < 200ms
   - **Cumulative Layout Shift (CLS)**: Should be < 0.1

### 6. Bundle Size Comparison

Compare bundle sizes before/after:

**Expected Improvements:**
- **Home page**: ~30% reduction in initial bundle
- **Service pages**: ~40% reduction (Navigation/Footer lazy loaded)
- **Admin pages**: ~20% reduction (XLSX lazy loaded)
- **Overall**: Better route-specific chunking

## Best Practices Going Forward

### 1. Keep Using Dynamic Imports

For new pages, always use dynamic imports for heavy components:

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/HeavyComponent"), {
  loading: () => <div>Loading...</div>,
});
```

### 2. Analyze Before Adding Large Libraries

Before adding new dependencies:
1. Check bundle size impact
2. Consider if it can be lazy loaded
3. Look for lighter alternatives

### 3. Monitor Bundle Sizes

Regularly run:
```bash
npm run build
```

Watch for:
- ⚠️ Warnings about large chunks
- Increasing First Load JS sizes
- New async chunks appearing

### 4. Use Server Components When Possible

For pages that don't need client interactivity, remove `"use client"` directive to benefit from React Server Components.

### 5. Optimize Images

Continue using Next.js Image component with proper sizing:
```typescript
import Image from "next/image";

<Image 
  src="/path/to/image.jpg"
  width={800}
  height={600}
  alt="Description"
  loading="lazy" // For below-the-fold images
  priority // For above-the-fold images
/>
```

## Performance Targets

### Target Metrics (Production):

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| First Contentful Paint (FCP) | < 1.0s | < 1.8s | > 1.8s |
| Largest Contentful Paint (LCP) | < 1.5s | < 2.5s | > 2.5s |
| Time to Interactive (TTI) | < 2.5s | < 3.8s | > 3.8s |
| Total Blocking Time (TBT) | < 100ms | < 200ms | > 200ms |
| Cumulative Layout Shift (CLS) | < 0.05 | < 0.1 | > 0.1 |
| Initial JS Bundle | < 100 KB | < 200 KB | > 200 KB |

### Page-Specific Targets:

| Page | First Load JS | Notes |
|------|--------------|-------|
| Home (`/`) | < 150 KB | Hero images add weight |
| Services (`/services`) | < 120 KB | Now optimized |
| Projects (`/projects`) | < 130 KB | Image-heavy |
| About (`/about`) | < 100 KB | Now optimized |
| Contact (`/contact`) | < 100 KB | Now optimized |
| Admin (`/admin`) | < 200 KB | Heavy features OK |
| Employee (`/employee`) | < 180 KB | Heavy features OK |

## Troubleshooting

### Issue: Page loads slowly

1. Check Network tab - is a large chunk being downloaded?
2. Verify dynamic imports are working
3. Check if heavy library is being imported eagerly

### Issue: Blank screen during navigation

1. Ensure loading fallbacks are provided for dynamic imports
2. Check browser console for errors
3. Verify Suspense boundaries are in place

### Issue: Build fails with "Cannot find module"

1. Ensure all dynamic imports use correct paths
2. Check that components being imported exist
3. Verify TypeScript compilation succeeds

### Issue: Lighthouse score didn't improve

1. Run audit in Incognito mode
2. Disable browser extensions
3. Test on production build, not development
4. Check for other performance bottlenecks (API calls, large images)

## Additional Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)

## Summary

The optimizations implemented focus on:
1. ✅ **Reducing initial bundle size** through code splitting
2. ✅ **Loading components on demand** using dynamic imports
3. ✅ **Splitting heavy libraries** into separate async chunks
4. ✅ **Optimizing webpack configuration** for better chunking
5. ✅ **Maintaining functionality** while improving performance

All existing functionality is preserved while significantly improving load times and user experience.
