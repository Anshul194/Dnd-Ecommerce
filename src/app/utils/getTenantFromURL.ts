// utils/getTenantFromURL.ts
export const getTenantFromURL = () => {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }
  const hostname = window.location.hostname;
  const tenant = hostname.split(".")[0];
  return tenant;
};
