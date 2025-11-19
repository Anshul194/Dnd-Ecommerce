import { trackEvent } from "./trackEvent";

export function useTrack() {
  return {
    trackView: (productId) => trackEvent("PRODUCT_VIEW", { productId }),
    trackAddToCart: (productId) => trackEvent("ADD_TO_CART", { productId }),
    trackRemoveFromCart: (productId) => trackEvent("REMOVE_FROM_CART", { productId }),
    trackWishlist: (productId) => trackEvent("ADD_TO_WISHLIST", { productId }),
    trackRemoveWishlist: (productId) => trackEvent("REMOVE_FROM_WISHLIST", { productId }),
    trackCheckout: (cart) => trackEvent("CHECKOUT_START", { cart }),
    trackSearch: (searchQuery, productIds = []) => trackEvent("SEARCH", { searchQuery, productIds }),
    trackFilter: (filter) => trackEvent("FILTER_APPLIED", { filter }),
    trackSort: (sort) => trackEvent("SORT_APPLIED", { sort }),
    trackPageView: (url) => trackEvent("PAGE_VIEW", { url }),
  };
}
