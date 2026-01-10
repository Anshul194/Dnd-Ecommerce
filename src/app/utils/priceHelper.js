/**
 * Centralized utility to handle price retrieval logic consistently across listing and detail pages.
 * 
 * @param {Object} product - The product object
 * @param {string|number} selectedVariantId - Optional ID of the selected variant
 * @returns {Object} - An object containing salePrice, originalPrice, hasSale, and discount
 */
export const getDisplayPrice = (product, selectedVariantId = null) => {
    if (!product) return { salePrice: 0, originalPrice: 0, hasSale: false, discount: 0 };

    let variant = null;
    if (selectedVariantId && product.variants && product.variants.length > 0) {
        variant = product.variants.find(v => String(v._id) === String(selectedVariantId));
    }

    // Fallback to first variant if no specific variant is found but variants exist
    if (!variant && product.variants && product.variants.length > 0) {
        variant = product.variants[0];
    }

    // Determine sale and original prices
    // Priority: Variant prices -> Product top-level prices
    const salePrice = variant ? (variant.salePrice || variant.price) : (product.salePrice || product.price);
    const originalPrice = variant ? variant.price : product.price;
    const hasSale = !!(variant ? variant.salePrice : product.salePrice);

    return {
        salePrice,
        originalPrice,
        hasSale,
        discount: originalPrice > 0 ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0
    };
};
