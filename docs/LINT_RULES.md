# Project lint rules (local helpers)

## Heavy client dependencies lint

- Rule: `local-image-rules/no-heavy-client-deps`
- Purpose: Warn when known heavy client libraries (examples: `swiper`, `xlsx`, `react-calendly`) are statically imported in client files. Prefer dynamic import() or code-splitting.
- How to run:

```powershell
npm run lint:heavy-deps
```

## Server-imports lint

- Rule: `local-image-rules/no-server-imports`
- Purpose: Warn when server-side packages (e.g., `mongoose`, `mongodb`, `googleapis`, `ioredis`, `bcrypt`, `multer`) are imported from client files. Allowed in server folders like `src/app/api/`, `src/pages/api/`, `src/server/`.
- How to run:

```powershell
npm run lint:server-imports
```

## Next-image priority lint

- Rule: `local-image-rules/no-next-image-priority`
- Purpose: Warn when `priority` prop is used on `next/image`. Reserve `priority` for single above-the-fold hero image only.
- How to run:

```powershell
npm run lint:images
```

## Guidance

- These rules are warnings (non-fatal) so they can be integrated into developer workflows and CI gradually.
- Common remediations:
  - Replace static imports of heavy libs with `dynamic(() => import('lib'), { ssr: false })` or use `import()` inside event handlers / effect hooks.
  - Move server-only imports to server-only modules (API routes or `src/server/`) and call them via HTTP or server-side functions.

If you want I can:

- Run these lints across the repo and produce a short report of current warnings.
- Create a codemod or PR to convert a small set of static imports to dynamic ones automatically (conservative, review-first).
