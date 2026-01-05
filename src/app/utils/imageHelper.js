export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("data:")) return url;

    // Remove leading slash if present to avoid double slashes if base has trailing slash
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

    // Use environment variable if set (e.g. for CDN), otherwise return relative path
    if (process.env.NEXT_PUBLIC_IMAGE_URL) {
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBaseUrl}/${cleanUrl}`;
    }

    return `/${cleanUrl}`;
};
