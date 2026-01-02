export const getTenantFromURL = () => {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }
  const hostname = window.location.hostname;

  // Specialized handling for direct domains or local dev
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("bharatgramudyogsangh.com")) {
    return "bharat";
  }

  const parts = hostname.split(".");
  if (parts.length > 2) {
    if (parts[0] === "www") return parts[1];
    return parts[0];
  }

  if (parts.length === 2 && parts[0] !== "localhost" && parts[0] !== "www") {
    return parts[0];
  }

  return "bharat"; // Fallback to 'bharat' to avoid hitting empty default DB
};
