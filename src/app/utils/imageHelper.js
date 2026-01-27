/**
 * Get the full image URL for display
 * Handles both local development and production environments
 * Normalizes paths to handle case-sensitive servers (Linux)
 * 
 * @param {string|object} url - Image URL (string) or object with url property
 * @returns {string} Full image URL
 */
export const getImageUrl = (url) => {
    if (!url) return "";

    // If it's an object with a url property, use that
    if (typeof url === 'object' && url.url) {
        url = url.url;
    }

    if (typeof url !== 'string') return "";
    
    // Already a full URL (http/https) or data URI - return as is
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("data:")) return url;

    // Normalize path: convert "Uploads" to "uploads" for case-sensitive servers (Linux)
    // This handles existing database entries that may have "Uploads" with capital U
    let normalizedUrl = url.replace(/\/Uploads\//gi, "/uploads/");
    
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = normalizedUrl.startsWith("/") ? normalizedUrl.slice(1) : normalizedUrl;

    // Get the base URL from environment variable (set at build time)
    let baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";

    // Client-side fallback: if env var is not set, use current origin
    // This helps when NEXT_PUBLIC_IMAGE_URL is not configured in production
    if (!baseUrl && typeof window !== 'undefined') {
        baseUrl = window.location.origin;
    }

    if (baseUrl) {
        // Use the configured base URL (CDN or production domain)
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBaseUrl}/${cleanUrl}`;
    }

    // Fallback: use relative path (works if files are on same domain)
    return `/${cleanUrl}`;
};
