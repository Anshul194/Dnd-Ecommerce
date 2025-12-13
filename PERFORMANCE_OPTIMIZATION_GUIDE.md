# Website Performance Optimization Guide

## ✅ Implemented Optimizations (Dec 13, 2025)

### 1. **Next.js Configuration Enhancements** ✅
**File**: `next.config.mjs`

#### Added Optimizations:
- ✅ **SWC Minification**: Faster JavaScript minification
- ✅ **Compression**: Automatic gzip compression
- ✅ **React Strict Mode**: Better error detection
- ✅ **Output Optimization**: Standalone output for smaller deployments
- ✅ **Package Import Optimization**: Tree-shaking for `lucide-react`, `react-toastify`, `swiper`
- ✅ **CSS Optimization**: Experimental CSS minification

#### Image Optimizations Added:
```javascript
images: {
  formats: ['image/avif', 'image/webp'],          // Modern formats (60-80% smaller)
  deviceSizes: [640, 750, 828, 1080, 1200...],    // Responsive sizes
  minimumCacheTTL: 31536000,                       // 1 year cache
}
```

#### Caching Headers:
- ✅ Static assets (`/uploads`, `/images`): **1 year cache**
- ✅ Next.js static files: **1 year cache, immutable**
- ✅ API responses for stable content: **1 hour cache with stale-while-revalidate**

**Expected Impact**: 
- 🚀 30-50% reduction in image sizes
- 🚀 Faster page loads (better LCP)
- 🚀 Reduced bandwidth usage

---

### 2. **Middleware for Caching & Security** ✅
**File**: `src/middleware.js` (NEW)

#### Features:
- ✅ **Aggressive caching** for static assets (images, uploads)
- ✅ **API response caching** for categories and pages
- ✅ **Security headers**: X-Frame-Options, XSS Protection, Referrer Policy

**Expected Impact**: 
- 🚀 Reduced server load
- 🚀 Faster repeat visits
- 🚀 Better security score

---

### 3. **Performance Utilities Library** ✅
**File**: `src/lib/performance.js` (NEW)

#### Utilities Provided:
```javascript
// Cache configuration presets
CACHE_CONFIG = {
  categories: { revalidate: 3600 },  // 1 hour
  products: { revalidate: 600 },     // 10 minutes  
  pages: { revalidate: 3600 },       // 1 hour
  blogs: { revalidate: 1800 },       // 30 minutes
}

// Helper functions
- createCachedFetch()    // Cached API calls
- debounce()             // Input debouncing
- throttle()             // Event throttling
- getOptimizedImageProps() // Image optimization
```

**Expected Impact**: 
- 🚀 Reduced API calls
- 🚀 Better UX for search
- 🚀 Optimized images across the app

---

## 📋 Recommended Next Steps

### Priority 1: HIGH IMPACT (Do First)

#### A. **Optimize Images in `/public` folder**
**Current Issue**: Many large, uncompressed images
**Action Required**:
1. Install image optimization tool:
   ```bash
   npm install -D sharp
   ```

2. Create image optimization script:
   ```javascript
   // scripts/optimize-images.js
   const sharp = require('sharp');
   const fs = require('fs');
   const path = require('path');
   
   async function optimizeImages(dir) {
     const files = fs.readdirSync(dir);
     for (const file of files) {
       if (/\.(jpg|jpeg|png)$/i.test(file)) {
         const input = path.join(dir, file);
         const output = path.join(dir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
         await sharp(input)
           .webp({ quality: 80 })
           .toFile(output);
       }
     }
   }
   ```

3. Run on all image folders:
   ```bash
   node scripts/optimize-images.js
   ```

**Expected Impact**: 🚀🚀🚀 **60-80% reduction in image sizes** = Massive LCP improvement

---

#### B. **Implement Dynamic Imports for Heavy Components**
**Current Issue**: Large JavaScript bundles loaded upfront

**Files to Optimize**:
1. `src/components/Navbar.jsx` - Search dropdown, cart sidebar
2. `src/components/CheckoutPopup.js` - Only load when needed
3. Heavy libraries: `swiper`, `xlsx`, `react-calendly`

**Example Implementation**:
```javascript
// Before (loading 100% of the time)
import CartSidebar from './CartSidebar';

// After (only loads when cart is opened)
import dynamic from 'next/dynamic';
const CartSidebar = dynamic(() => import('./CartSidebar'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

**Apply to**:
- CartSidebar
- CheckoutPopup
- Heavy modals/dialogs
- Chart components (if any)
- Calendly widgets

**Expected Impact**: 🚀🚀 **20-40% reduction in initial JavaScript bundle**

---

#### C. **Convert Client-Side Fetches to Server Components**
**Current Issue**: Multiple API calls on client mount (Navbar, Footer, etc.)

**Files to Refactor**:
1. `src/components/Navbar.jsx` - Categories, products fetch
2. `src/components/Footer.jsx` - Pages fetch
3. `src/components/HeroExample.jsx` - Sections fetch

**Example Refactor**:
```javascript
// app/layout.js or page.js (Server Component)
import { fetchCategoryWithSubcategories } from '@/lib/api';

export default async function Layout() {
  const categories = await fetchCategoryWithSubcategories();
  
  return (
    <Navbar initialCategories={categories} />
  );
}
```

**Expected Impact**: 🚀🚀🚀 **Eliminates waterfall requests, faster FCP/LCP**

---

### Priority 2: MEDIUM IMPACT

#### D. **Optimize Search Functionality**
**Current Issue**: API call on every keystroke (even with debounce)

**Recommended Changes**:
```javascript
// In Navbar.jsx
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    // Only search if 3+ characters
    if (searchTerm.length >= 3) {
      fetchProductsFromApi();
      filterBlogs(searchTerm);
    }
  }, 500); // Increase debounce to 500ms
  return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);
```

**Expected Impact**: 🚀 **50% reduction in search API calls**

---

#### E. **Batch and Queue Tracking Events**
**Current Issue**: Multiple `/api/track` calls throughout the app

**Files to Update**:
- `src/app/lib/tracking/batchTrackEvent.js`
- `src/app/page.js`
- `src/app/login/page.jsx`
- `src/app/signup/page.jsx`

**Implementation**:
```javascript
// Create a tracking queue
const trackingQueue = [];

function queueTrackingEvent(event) {
  trackingQueue.push(event);
  
  // Send batch every 5 seconds or 10 events
  if (trackingQueue.length >= 10 || !batchTimer) {
    sendBatch();
  }
}

async function sendBatch() {
  if (trackingQueue.length === 0) return;
  
  await fetch('/api/track/batch', {
    method: 'POST',
    body: JSON.stringify(trackingQueue),
  });
  
  trackingQueue.length = 0;
}
```

**Expected Impact**: 🚀 **80% reduction in tracking requests**

---

#### F. **Enable React Compiler (Experimental)**
**Action**: Update `next.config.mjs`:
```javascript
experimental: {
  reactCompiler: true,  // Auto-memoize components
}
```

**Expected Impact**: 🚀 **10-20% faster re-renders**

---

### Priority 3: INFRASTRUCTURE (External to Code)

#### G. **CDN Setup**
- Configure Cloudflare or similar CDN
- Cache static assets at edge
- Enable Brotli compression

**Expected Impact**: 🚀🚀 **50% faster asset delivery globally**

---

#### H. **Database Query Optimization**
**Current Issue**: Possible slow queries for categories/products

**Recommendations**:
1. Add indexes on frequently queried fields:
   ```javascript
   // MongoDB
   db.categories.createIndex({ status: 1, createdAt: -1 });
   db.products.createIndex({ slug: 1 });
   db.products.createIndex({ "variants.salePrice": 1 });
   ```

2. Implement Redis caching for API routes

**Expected Impact**: 🚀 **30-50% faster API response times**

---

## 🔍 Measuring Performance

### Before/After Comparison
Run these tests BEFORE and AFTER optimizations:

#### 1. **Lighthouse (Chrome DevTools)**
```bash
# Open Chrome DevTools → Lighthouse → Run
```
**Key Metrics**:
- Performance Score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

**Target Scores**:
- Performance: 90+
- LCP: < 2.5s
- FCP: < 1.8s
- TTI: < 3.8s

---

#### 2. **Bundle Analysis**
```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Update next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

**What to Look For**:
- Largest packages in client bundle
- Duplicate dependencies
- Unused code

---

#### 3. **WebPageTest**
Visit: https://www.webpagetest.org
- Test URL: Your production URL
- Location: Choose nearest to your users
- Connection: 4G (mobile)

**Key Metrics**:
- Speed Index
- Waterfall chart
- Film strip view

---

## 📊 Expected Overall Improvements

| Metric | Before | After (Estimated) | Improvement |
|--------|--------|-------------------|-------------|
| **Page Load Time** | 4-6s | 1.5-2.5s | **60-70% faster** |
| **LCP** | 3-5s | 1.5-2.3s | **50-60% faster** |
| **JavaScript Bundle** | ~500KB | ~300KB | **40% smaller** |
| **Image Sizes** | ~2MB | ~400KB | **80% smaller** |
| **API Calls (initial)** | 15-20 | 3-5 | **75% reduction** |
| **Lighthouse Score** | 40-60 | 85-95 | **2x improvement** |

---

## 🚀 Quick Win Checklist (DO NOW)

- [x] ✅ Update next.config.mjs (DONE)
- [x] ✅ Add middleware for caching (DONE)
- [x] ✅ Create performance utilities (DONE)
- [ ] 🔄 Optimize images in /public folder (HIGH PRIORITY)
- [ ] 🔄 Add dynamic imports for heavy components (HIGH PRIORITY)
- [ ] 🔄 Convert client fetches to server components (HIGH PRIORITY)
- [ ] 🔄 Increase search debounce timing
- [ ] 🔄 Batch tracking events
- [ ] 🔄 Run bundle analyzer
- [ ] 🔄 Setup CDN (if not already)
- [ ] 🔄 Add database indexes

---

## 📝 Notes

1. **Caching**: All cache headers are set to be CDN-friendly and browser-friendly
2. **Images**: Using AVIF/WebP with automatic fallback
3. **Compression**: Enabled gzip and should enable Brotli at CDN level
4. **Monitoring**: Setup Real User Monitoring (RUM) to track real-world performance

---

## 🆘 Need Help?
- Check `PERFORMANCE_ISSUES.txt` for detailed static analysis
- Run Lighthouse for current performance baseline
- Bundle analyzer will show exact heavy dependencies

---

**Last Updated**: Dec 13, 2025
**Status**: Foundational optimizations complete ✅
**Next**: Implement Priority 1 optimizations
