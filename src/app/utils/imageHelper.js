export const getImageUrl = (url) => {
    if (!url) return url;

    // If it's an object with a url property, use that
    if (typeof url === 'object' && url.url) {
        url = url.url;
    }

    if (typeof url !== 'string') return url;
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("data:")) return url;

    // Remove leading slash if present to avoid double slashes if base has trailing slash
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

    // For client-side rendering, use the current origin
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/${cleanUrl}`;
    }

    // For server-side rendering, use environment variable if set, otherwise return relative path
    if (process.env.NEXT_PUBLIC_IMAGE_URL) {
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBaseUrl}/${cleanUrl}`;
    }

    return `/${cleanUrl}`;
};
