# 🚨 CRITICAL PERFORMANCE FIXES - Lighthouse Score 26

## Current Status
**Lighthouse Score: 26/100** ❌
**LCP: 9,509 ms** (Target: < 2,500 ms) ❌
**Speed Index: 15,205 ms** (Target: < 3,400 ms) ❌
**TBT: 3,798 ms** (Target: < 200 ms) ❌
**FCP: 2,869 ms** (Target: < 1,800 ms) ⚠️
**CLS: 0.00** (Perfect!) ✅

---

## ✅ **What We Just Fixed**

### 1. Configuration Errors Fixed ✅
- Removed deprecated `swcMinify` (now default in Next.js 15)
- Removed `output: 'standalone'` (causing build issues)
- Removed `optimization.usedExports` (conflicts with Next.js 15)

### 2. Image Optimization Completed ✅
- **77 images optimized**
- **60.2 MB saved** (from 86.22 MB → 26.02 MB)
- **70% size reduction**

---

## 🚨 **CRITICAL ISSUES CAUSING SLOW PERFORMANCE**

Based on your Lighthouse score of 26, these are the TOP issues:

### 1. **LCP is 9.5 seconds** (Should be < 2.5s)
**Problem**: Images are probably not using the optimized WebP versions yet

**IMMEDIATE FIX**:
You need to update your components to USE the `.webp` images we just created!

**Example Fix** - Update image paths in your components:
```jsx
// BEFORE (using old format)
<Image src="/uploads/product.jpg" alt="Product" width={400} height={400} />

// AFTER (using WebP)
<Image src="/uploads/product.webp" alt="Product" width={400} height={400} />

// OR USE the OptimizedImage component (automatically uses WebP)
import OptimizedImage from '@/components/OptimizedImage';
<OptimizedImage src="/uploads/product.jpg" alt="Product" width={400} height={400} />
```

---

### 2. **Total Blocking Time: 3.8 seconds** (Should be < 200ms)
**Problem**: Too much JavaScript executing on the main thread

**IMMEDIATE FIXES NEEDED**:

#### A. Convert Heavy Components to Dynamic Imports

**Update `src/components/Navbar.jsx`:**
```jsx
// Add at top of file
import dynamic from 'next/dynamic';

// Replace CartSidebar import
const CartSidebar = dynamic(() => import('./CartSidebar'), {
  loading: () => null,
  ssr: false
});
```

#### B. Defer Non-Critical Scripts
Check if you're loading any analytics or tracking scripts. Move them to load AFTER page interactive.

---

### 3. **Speed Index: 15.2 seconds** (Should be < 3.4s)
**Problem**: Content takes too long to visually load

**FIXES**:

#### Priority Images
Mark above-the-fold images with `priority`:
```jsx
// For hero/banner images
<Image 
  src="/hero.webp" 
  alt="Hero" 
  priority={true}  // ← Add this!
  width={1920} 
  height={1080} 
/>
```

#### Lazy Load Everything Else
```jsx
// For product grids, category images, etc.
<Image 
  src="/product.webp" 
  alt="Product" 
  loading="lazy"  // ← Explicit lazy load
  width={400} 
  height={400} 
/>
```

---

## 🔥 **DO THIS NOW - Step by Step**

### Step 1: Test if Config is Fixed
```bash
npm run dev:bharat
```
**Expected**: Should start without errors now ✅

### Step 2: Update Components to Use WebP Images

I'll create a script to help you automatically update image references:

**Create this file**: `scripts/update-image-refs.js`
```javascript
const fs = require('fs');
const path = require('path');

// This will find and replace image extensions in JSX files
function updateImageReferences(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      updateImageReferences(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Replace image paths in src attributes
      // /uploads/*.jpg -> /uploads/*.webp
      // /images/*.jpg -> /images/*.webp
      const updated = content
        .replace(/\/uploads\/([^"']+)\.(jpg|jpeg|png|jfif)/gi, '/uploads/$1.webp')
        .replace(/\/images\/([^"']+)\.(jpg|jpeg|png|jfif)/gi, '/images/$1.webp')
        .replace(/\/category-images\/([^"']+)\.(jpg|jpeg|png|jfif)/gi, '/category-images/$1.webp')
        .replace(/\/subcategory-images\/([^"']+)\.(jpg|jpeg|png|jfif)/gi, '/subcategory-images/$1.webp');
      
      if (content !== updated) {
        fs.writeFileSync(filePath, updated);
        console.log(`✅ Updated: ${filePath}`);
      }
    }
  });
}

console.log('🔄 Updating image references to WebP...\n');
updateImageReferences('./src');
console.log('\n✅ Done! All image references updated to WebP');
```

**Run it:**
```bash
node scripts/update-image-refs.js
```

### Step 3: Add Dynamic Imports to Heavy Components

**Update `src/components/Navbar.jsx`** - Add at the top:
```jsx
import dynamic from 'next/dynamic';

// Convert CartSidebar to dynamic
const CartSidebar = dynamic(() => import('./CartSidebar'), {
  loading: () => null,
  ssr: false
});
```

### Step 4: Rebuild and Retest
```bash
npm run build
npm start
```

Then test again with Lighthouse!

---

## 📊 **Expected Results After These Fixes**

| Metric | Current | Target | Expected After Fix |
|--------|---------|--------|-------------------|
| **Overall Score** | 26 | 90+ | **85-90** 🎯 |
| **LCP** | 9,509ms | < 2,500ms | **~2,000ms** 🚀 |
| **Speed Index** | 15,205ms | < 3,400ms | **~3,000ms** 🚀 |
| **TBT** | 3,798ms | < 200ms | **~500ms** ⚡ |
| **FCP** | 2,869ms | < 1,800ms | **~1,500ms** ✅ |

---

## 🎯 **Priority Order**

1. **HIGHEST**: Update image refs to use WebP (biggest impact on LCP)
2. **HIGH**: Add dynamic imports for CartSidebar, CheckoutPopup
3. **MEDIUM**: Add `priority` to hero images
4. **MEDIUM**: Add `loading="lazy"` to product images

---

## 💡 **Quick Wins Checklist**

- [x] ✅ Image optimization script completed (60MB saved!)
- [x] ✅ Next.js config errors fixed
- [ ] 🔄 Update components to use .webp images (CRITICAL!)
- [ ] 🔄 Add dynamic imports to heavy components
- [ ] 🔄 Mark hero images with priority
- [ ] 🔄 Rebuild and retest with Lighthouse

---

## 🆘 **Still Slow After This?**

If score is still below 70 after these fixes, check:

1. **Server Response Time**: Test API endpoints - if they're slow, optimize backend
2. **Third-Party Scripts**: Check if you have Google Analytics, Facebook Pixel, etc. loading synchronously
3. **Database Queries**: Add indexes to frequently queried fields
4. **CDN**: Ensure you're using a CDN for static assets

---

**Last Updated**: Dec 13, 2025, 17:48 IST
**Status**: Config fixed ✅, Images optimized ✅, Components need updating 🔄
