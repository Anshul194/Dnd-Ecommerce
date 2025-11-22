# Image optimization helper

## What this does

- The project contains `scripts/optimize-images.js` which scans the following public folders:
  - `public/category-images/`, `public/category-thumbnails/`, `public/subcategory-images/`, `public/subcategory-thumbnails/`, `public/uploads/`, `public/images/`
- For each image it generates responsive variants at widths [320,640,1024,1600] in both WebP and AVIF formats and writes them under `public/optimized/...`.
- Originals are not modified by default.

## How to run (local)

1. Install the native image library `sharp` (dev dependency):

```powershell
npm install --save-dev sharp
```

2. Run the optimizer:

```powershell
npm run optimize-images
```

## Output

- Optimized files are written to `public/optimized/` preserving directory structure.
- Example: `public/category-images/profile-123.jpg` -> `public/optimized/category-images/profile-123-320.webp` and `profile-123-320.avif`, etc.

## Suggested next steps (no UI changes)

- Serve the generated `public/optimized/*` assets from your CDN or public folder instead of originals.
  - Option A (server-level): set your CDN or static file server to prefer `public/optimized` variants when available.
  - Option B (build/templating): update server-side rendering or templates to reference the optimized variants for responsive images (e.g., prefer `-1024.avif`/`-1024.webp` depending on device size). This avoids client-side UI changes while reducing payload.
- Add this script to CI or deployment pipeline (run once per deploy or when images change) so production uses optimized assets.
- Consider a small middleware or rewrite rule on the server/CDN to map requests for `.../profile-123.jpg` to `.../optimized/profile-123-1024.avif` when appropriate.

## Notes

- The script requires `sharp` installed; it intentionally does not overwrite original assets so you can review results before switching references.
- The repo already uses `next/image` in many components — after deploying optimized assets, prefer pointing `next/image` `src` props to the optimized files or let a CDN rewrite handle it.

If you want, I can add a small helper that rewrites image URLs at runtime (server-side) to prefer optimized assets without touching component UI. Ask and I'll prepare it.

## Lint rule

- A local ESLint rule `local-image-rules/no-next-image-priority` has been added to warn when `priority` is used on `next/image` imports. This helps audit and prevent overuse of eager images.
- Run the image lint with:

```powershell
npm run lint:images
```

If you want, I can also offer a codemod to automatically remove `priority` attributes (or add `loading="lazy"`) — tell me if you'd like that to be conservative/auto-fix or just report-only.

## Server-imports lint

- A local ESLint rule `local-image-rules/no-server-imports` now warns when server-only packages (for example `mongoose`, `mongodb`, `googleapis`, `ioredis`, `bcrypt`, `multer`, `stripe`) are imported from client-side code areas. This helps prevent accidental bundling of server libraries into client builds.
- Run the check with:

```powershell
npm run lint:server-imports
```

- If warnings appear, move the import into a server-only module (for example under `src/app/api/`, `src/pages/api/`, or `src/server/`), or convert the usage to a server-call/endpoint.
