"use client";

import { ShoppingCart, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "@/app/store/slices/productSlice";
import Link from "next/link";
import { addToCart, toggleCart } from "@/app/store/slices/cartSlice";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function CustomerFavorites({ content }) {
  const { products } = useSelector((state) => state.product);
  console.log("products is =========>", products);
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    // if (!isAuthenticated) {
    //   setShowAuthModal(true);
    //   return;
    // }

    const price = product?.variants[0]
      ? product?.variants[0]?.salePrice || product?.variants[0]?.price
      : product?.salePrice || product?.price;
    dispatch(
      addToCart({
        product: {
          id: product._id,
          name: product.name,
          image: product.thumbnail || product.images[0],
          variant: product?.variants[0]?._id,
          slug: product.slug,
        },
        quantity: 1,
        price: price,
        variant: product?.variants[0]?._id,
      })
    );
    dispatch(toggleCart());
  };

  useEffect(() => {
    console.log("CustomerFavorites content is ===> ", content);
    dispatch(
      fetchProducts({
        page: 1,
        limit: 8,
        sortBy: "rating",
        order: "desc",
        category: content?.category || "",
        search: "",
      })
    );
  }, []);
  console.log("product slider content is ===> ", products);
  return (
    <section className="max-w-7xl mx-auto py-20 ">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
            {content?.title || "Customer Favorites"}
          </h2>
          <p className="text-gray-600">
            {content?.description ||
              "Discover our top-rated teas, loved by customers for their exceptional quality and flavor."}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products &&
            products?.products?.map((product, index) => (
              <Link href={`/productDetail/${product.slug}`} key={product._id}>
                <motion.div key={product.id} variants={itemVariants}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <ImageWithFallback
                          src={
                            product?.thumbnail?.url || product?.images[0]?.url
                          }
                          alt={
                            product?.thumbnail?.alt ||
                            product?.images[0]?.alt ||
                            product.name
                          }
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {product.rating > 3 && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#3C950D] to-[#2d7009] text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="mb-3 h-12 group-hover:text-[#3C950D] transition-colors">
                          {product.name}
                        </h3>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[#3C950D]">
                            {product.price}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] shadow-lg hover:shadow-xl transition-all"
                          >
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
