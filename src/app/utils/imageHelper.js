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

    // Get the base URL from environment variable
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";

    if (baseUrl) {
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBaseUrl}/${cleanUrl}`;
    }

    return `/${cleanUrl}`;
};
