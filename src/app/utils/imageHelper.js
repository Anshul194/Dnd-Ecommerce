export const getImageUrl = (url) => {
    if (!url) return "";

    // If it's an object with a url property, use that
    if (typeof url === 'object' && url.url) {
        url = url.url;
    }

    if (typeof url !== 'string') return "";

    let originalPath = url; // Store original path for conversion

    // In development, if the URL is already a full production URL, convert it to localhost
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && (url.startsWith("http://") || url.startsWith("https://"))) {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' ||
                           hostname === '127.0.0.1' ||
                           hostname.includes('localhost') ||
                           hostname.endsWith('.localhost');

        if (isLocalhost) {
            const pathSegment = new URL(url).pathname;
            // Use current origin instead of hardcoded localhost:3000
            const convertedUrl = `${window.location.origin}${pathSegment}`;
            console.log(`[Frontend getImageUrl] Converting production URL to current origin: ${url} -> ${convertedUrl}`);
            url = convertedUrl;
        }
    }

    // Already a full URL (http/https) or data URI - return as is
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("data:")) return url;

    // Normalize path: convert "Uploads" to "uploads" for case-sensitive servers (Linux)
    // This handles existing database entries that may have "Uploads" with capital U
    let normalizedUrl = url.replace(/\/Uploads\//gi, "/uploads/");

    // Remove any duplicate /uploads/uploads/ patterns (case-insensitive)
    normalizedUrl = normalizedUrl.replace(/\/uploads\/uploads\//gi, "/uploads/");
    normalizedUrl = normalizedUrl.replace(/\/uploads\/\/uploads\//gi, "/uploads/"); // Handle double slashes
    
    // Remove leading slash if present to avoid double slashes
    let cleanUrl = normalizedUrl.startsWith("/") ? normalizedUrl.slice(1) : normalizedUrl;
    
    // Ensure cleanUrl doesn't have double slashes anywhere
    cleanUrl = cleanUrl.replace(/\/\//g, "/");

    // Get the base URL from environment variable (set at build time)
    let baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";

    // In development (localhost), use current origin for images
    // This ensures images are served from the same Next.js server (same origin, no CORS issues)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' ||
                           hostname === '127.0.0.1' ||
                           hostname.includes('localhost') ||
                           hostname.endsWith('.localhost');

        if (isLocalhost) {
            // Use current origin (same server) for images in development
            // This ensures images load from the same Next.js server running the frontend
            baseUrl = window.location.origin;
            console.log(`[Frontend getImageUrl] Using current origin (${baseUrl}) for development`);
        } else if (!baseUrl) {
            // If not localhost and no baseUrl is set, use current origin
            baseUrl = window.location.origin;
        }
    }

    // Remove /uploads/ from baseUrl if it exists (to prevent double /uploads/uploads/)
    if (baseUrl && baseUrl.endsWith('/uploads')) {
        baseUrl = baseUrl.slice(0, -7); // Remove '/uploads'
    }
    if (baseUrl && baseUrl.endsWith('/uploads/')) {
        baseUrl = baseUrl.slice(0, -8); // Remove '/uploads/'
    }

    if (baseUrl) {
        // Use the configured base URL (CDN or production domain)
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        
        // Ensure cleanUrl doesn't start with a slash (we already removed it, but double-check)
        const finalCleanUrl = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
        
        // Construct final URL and ensure no double slashes
        let finalUrl = `${cleanBaseUrl}/${finalCleanUrl}`;
        finalUrl = finalUrl.replace(/\/\//g, "/").replace(/http:\//g, "http://").replace(/https:\//g, "https://");

        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
            console.log("[Frontend getImageUrl] Constructed URL:", {
                input: originalPath,
                normalizedUrl: normalizedUrl,
                cleanUrl: finalCleanUrl,
                baseUrl: cleanBaseUrl,
                finalUrl: finalUrl,
                envUrl: process.env.NEXT_PUBLIC_IMAGE_URL || 'Not set'
            });
        }

        return finalUrl;
    }

    // Fallback: use relative path (Next.js rewrite rule will handle /uploads/ paths)
    return `/${cleanUrl}`;
};
