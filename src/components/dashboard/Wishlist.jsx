import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2, Star, Eye } from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      _id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 199.99,
      originalPrice: 249.99,
      image: '/images/headphones.jpg',
      rating: 4.5,
      reviews: 128,
      inStock: true,
      category: 'Electronics',
      addedDate: new Date('2025-07-15')
    },
    {
      _id: '2',
      name: 'Premium Coffee Maker',
      price: 299.99,
      originalPrice: 299.99,
      image: '/images/coffee-maker.jpg',
      rating: 4.8,
      reviews: 85,
      inStock: true,
      category: 'Kitchen',
      addedDate: new Date('2025-07-20')
    },
    {
      _id: '3',
      name: 'Smart Fitness Watch',
      price: 399.99,
      originalPrice: 499.99,
      image: '/images/smart-watch.jpg',
      rating: 4.3,
      reviews: 245,
      inStock: false,
      category: 'Wearables',
      addedDate: new Date('2025-07-10')
    },
    {
      _id: '4',
      name: 'Leather Office Chair',
      price: 599.99,
      originalPrice: 799.99,
      image: '/images/office-chair.jpg',
      rating: 4.6,
      reviews: 92,
      inStock: true,
      category: 'Furniture',
      addedDate: new Date('2025-07-05')
    },
    {
      _id: '5',
      name: 'Gaming Mechanical Keyboard',
      price: 149.99,
      originalPrice: 179.99,
      image: '/images/keyboard.jpg',
      rating: 4.7,
      reviews: 156,
      inStock: true,
      category: 'Gaming',
      addedDate: new Date('2025-06-28')
    }
  ]);

  const removeFromWishlist = (itemId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== itemId));
  };

  const addToCart = (item) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', item);
    alert(`${item.name} added to cart!`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const calculateSavings = (originalPrice, currentPrice) => {
    return ((originalPrice - currentPrice) / originalPrice * 100).toFixed(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-4">Start adding items you love to your wishlist</p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Product Image */}
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Product Image</span>
                </div>
                
                {/* Discount Badge */}
                {item.originalPrice > item.price && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
                    {calculateSavings(item.originalPrice, item.price)}% OFF
                  </div>
                )}

                {/* Stock Status */}
                {!item.inStock && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
                    Out of Stock
                  </div>
                )}

                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow group"
                >
                  <Heart className="text-red-500 fill-current group-hover:scale-110 transition-transform" size={16} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{item.category}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center justify-between mb-3">
                  {renderStars(item.rating)}
                  <span className="text-xs text-gray-500">{item.reviews} reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">${item.price}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                  )}
                </div>

                {/* Added Date */}
                <p className="text-xs text-gray-500 mb-4">
                  Added on {item.addedDate.toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                    className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 ${
                      item.inStock
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    <span>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm">
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist Actions */}
      {wishlistItems.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage your entire wishlist</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Share Wishlist
              </button>
              <button
                onClick={() => {
                  const inStockItems = wishlistItems.filter(item => item.inStock);
                  if (inStockItems.length > 0) {
                    alert(`Adding ${inStockItems.length} items to cart!`);
                  } else {
                    alert('No items in stock to add to cart.');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Add All to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
