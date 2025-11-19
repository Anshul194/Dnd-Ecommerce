import {
  fetchFrequentlyPurchasedProducts,
  selectSelectedProduct,
} from "@/app/store/slices/productSlice";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function RenderSliderVariant() {
  const [products, setProducts] = React.useState([]);
  const selectedProducts = useSelector(selectSelectedProduct);
  const dispatch = useDispatch();
  const scrollLeft = () => {
    const container = document.getElementById("products-slider");
    if (!container) return;
    container.scrollBy({ left: -container.clientWidth, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("products-slider");
    if (!container) return;
    container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
  };

  // const products = [
  //   {
  //     id: 1,
  //     name: "Glamorous Garnets",
  //     rating: 5,
  //     reviews: 238,
  //     price: 563,
  //     outOfStock: false,
  //   },
  //   {
  //     id: 2,
  //     name: "Luxury Limelight",
  //     rating: 4,
  //     reviews: 839,
  //     price: 238,
  //     outOfStock: true,
  //   },
  //   {
  //     id: 3,
  //     name: "Sumptuous Splendor",
  //     rating: 4,
  //     reviews: 435,
  //     price: 183,
  //     outOfStock: false,
  //   },
  //   {
  //     id: 4,
  //     name: "Enchanting Ensembles",
  //     rating: 5,
  //     reviews: 954,
  //     price: 39,
  //     outOfStock: false,
  //   },
  // ];

  const fetchProducts = async () => {
    const res = await dispatch(
      fetchFrequentlyPurchasedProducts({
        frequentlyPurchased: true,
        limit: 20,
      })
    );
    console.log("frequently purchased products ====> ", res);
    if (res.meta.requestStatus === "fulfilled") {
      setProducts(res?.payload?.products || []);
    } else {
      console.error("Failed to fetch products");
    }
  };

  console.log("products is ====> ", products);

  useEffect(() => {
    fetchProducts();
  }, []);

  const StarRating = ({ rating, reviews }) => (
    <div className="flex items-center gap-1 mb-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? "fill-green-500 text-green-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">{reviews} Reviews</span>
    </div>
  );

  return (
    <div className="px-4">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl text-black mb-4 md:mb-0 text-center font-black">
          FREQUENTLY PURCHASED
        </h1>
        <p className="text-black lg:max-w-[80%] mx-auto text-center relative poppins-medium leading-tight text-lg mb-8">
          Lorem ipsum dolor sit amet,{" "}
          <span className="text font-semibold">consectetur</span> eiusmod tempor
          incididunt ut labore et dolor magna aliquaLorem ipsum dolor sit amet,
          consectetur.
        </p>
      </div>

      {/* Products Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        <div
          id="products-slider"
          className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          aria-label="Frequently purchased products"
        >
          <div className="flex gap-3 pb-4 max-w-full">
            {products?.length > 0 &&
              products?.map((product) => {
                if (product._id === selectedProducts?._id) return null;
                const imgSrc =
                  product?.thumbnail?.url || product?.images?.[0]?.url || null;
                return (
                  <Link
                    key={product._id}
                    href={`/product-detail/${product.slug}`}
                  >
                    <div className="bg-white flex-shrink-0 snap-start w-52 h-64 px-1">
                      {/* Product Image */}
                      <div className="relative bg-gray-400 rounded-lg aspect-square mb-4">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={
                              product?.thumbnail?.alt ||
                              product?.images?.[0]?.alt ||
                              "Product"
                            }
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : null}

                        {/* Heart Icon */}
                        <div className="absolute top-3 right-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Heart className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Out of Stock Badge */}
                        {product.outOfStock && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                              OUT OF STOCK
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3 className="font-medium poppins text-black mb-2">
                          {product.name}
                        </h3>
                        {product?.reviews > 0 && (
                          <StarRating
                            rating={product.rating}
                            reviews={product.reviews}
                          />
                        )}
                        <div className="text-lg poppins-medium font-bold text-black">
                          $
                          {product.variants?.[0]?.salePrice ||
                            product.variants?.[0]?.price ||
                            200}
                          {product.variants?.[0]?.salePrice && (
                            <span className="line-through ml-2 text-gray-500">
                              ${product.variants?.[0]?.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
