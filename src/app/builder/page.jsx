"use client";

// Simple drag and drop implementation without external libraries
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  Eye,
  Settings,
  GripVertical,
  Trash2,
  Edit3,
  ImageIcon,
  Type,
  Package,
  Users,
  MessageSquare,
  Gift,
} from "lucide-react";
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
const componentTemplates = {
  productImages: {
    id: "productImages",
    type: "productImages",
    name: "Product Images",
    icon: ImageIcon,
    defaultProps: {
      images: [
        "https://via.placeholder.com/600x600/3B82F6/FFFFFF?text=Product+1",
        "https://via.placeholder.com/600x600/EF4444/FFFFFF?text=Product+2",
        "https://via.placeholder.com/600x600/10B981/FFFFFF?text=Product+3",
      ],
      showThumbnails: true,
      allowZoom: true,
    },
  },
  productInfo: {
    id: "productInfo",
    type: "productInfo",
    name: "Product Info",
    icon: Type,
    defaultProps: {
      title: "Premium Wireless Headphones",
      price: 299.99,
      comparePrice: 399.99,
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      sku: "WH-1000XM4",
    },
  },
  productDescription: {
    id: "productDescription",
    type: "productDescription",
    name: "Description",
    icon: Type,
    defaultProps: {
      title: "Product Description",
      content:
        "Experience premium sound quality with our latest wireless headphones. Featuring advanced noise cancellation technology and up to 30 hours of battery life.",
    },
  },
  addToCart: {
    id: "addToCart",
    type: "addToCart",
    name: "Add to Cart",
    icon: ShoppingCart,
    defaultProps: {
      showQuantity: true,
      showBuyNow: true,
      showWishlist: true,
      buttonStyle: "primary",
    },
  },
  productVariants: {
    id: "productVariants",
    type: "productVariants",
    name: "Product Variants",
    icon: Package,
    defaultProps: {
      variants: [
        { name: "Color", options: ["Black", "White", "Silver"] },
        { name: "Size", options: ["Small", "Medium", "Large"] },
      ],
    },
  },
  customerReviews: {
    id: "customerReviews",
    type: "customerReviews",
    name: "Customer Reviews",
    icon: MessageSquare,
    defaultProps: {
      showRating: true,
      showReviewForm: true,
      reviews: [
        {
          name: "John D.",
          rating: 5,
          comment: "Excellent product quality!",
          date: "2024-01-15",
        },
        {
          name: "Sarah M.",
          rating: 4,
          comment: "Good value for money.",
          date: "2024-01-10",
        },
      ],
    },
  },
  relatedProducts: {
    id: "relatedProducts",
    type: "relatedProducts",
    name: "Related Products",
    icon: Gift,
    defaultProps: {
      title: "You might also like",
      products: [
        {
          name: "Wireless Earbuds",
          price: 149.99,
          image:
            "https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=Earbuds",
        },
        {
          name: "Phone Case",
          price: 24.99,
          image: "https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=Case",
        },
      ],
    },
  },
  specifications: {
    id: "specifications",
    type: "specifications",
    name: "Specifications",
    icon: Users,
    defaultProps: {
      title: "Technical Specifications",
      specs: [
        { label: "Brand", value: "TechBrand" },
        { label: "Model", value: "TB-WH-2024" },
        { label: "Weight", value: "250g" },
        { label: "Battery Life", value: "30 hours" },
      ],
    },
  },
};
const useDragAndDrop = (items, setItems) => {
  // Pre-built component templates
};
// Component renderers
const ComponentRenderer = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (newProps) => {
    onUpdate(component.id, newProps);
    setIsEditing(false);
  };

  switch (component.type) {
    case "productImages":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <ProductImages {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "productInfo":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <ProductInfo {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "productDescription":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <ProductDescription {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "addToCart":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <AddToCart {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "productVariants":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <ProductVariants {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "customerReviews":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <CustomerReviews {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "relatedProducts":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <RelatedProducts {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    case "specifications":
      return (
        <div
          className={`relative group ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(component.id)}
        >
          <Specifications {...component.props} />
          <ComponentControls
            onEdit={handleEdit}
            onDelete={() => onDelete(component.id)}
            isEditing={isEditing}
            onSave={handleSave}
            component={component}
          />
        </div>
      );

    default:
      return <div>Unknown component type</div>;
  }
};

// Individual component implementations
const ProductImages = ({ images, showThumbnails, allowZoom }) => {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={images[currentImage]}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-zoom-in"
        />
      </div>
      {showThumbnails && (
        <div className="flex space-x-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                currentImage === index ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductInfo = ({
  title,
  price,
  comparePrice,
  rating,
  reviewCount,
  inStock,
  sku,
}) => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            ({reviewCount} reviews)
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-gray-900">${price}</span>
          {comparePrice && (
            <span className="text-xl text-gray-500 line-through">
              ${comparePrice}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`px-2 py-1 rounded text-sm ${
              inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
          <span className="text-sm text-gray-600">SKU: {sku}</span>
        </div>
      </div>
    </div>
  );
};

const ProductDescription = ({ title, content }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
};

const AddToCart = ({ showQuantity, showBuyNow, showWishlist, buttonStyle }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-4">
      {showQuantity && (
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 border-x border-gray-300">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex space-x-3">
        <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
        {showBuyNow && (
          <button className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
            Buy Now
          </button>
        )}
        {showWishlist && (
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const ProductVariants = ({ variants }) => {
  const [selectedVariants, setSelectedVariants] = useState({});

  return (
    <div className="space-y-6">
      {variants.map((variant, index) => (
        <div key={index} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">{variant.name}:</h3>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                onClick={() =>
                  setSelectedVariants({
                    ...selectedVariants,
                    [variant.name]: option,
                  })
                }
                className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                  selectedVariants[variant.name] === option
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomerReviews = ({ showRating, showReviewForm, reviews }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      {showRating && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-lg font-medium">4.5 out of 5</span>
          </div>
          <span className="text-gray-600">
            Based on {reviews.length} reviews
          </span>
        </div>
      )}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{review.name}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RelatedProducts = ({ title, products }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-md mb-3"
            />
            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
            <p className="text-lg font-bold text-blue-600">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Specifications = ({ title, specs }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="flex justify-between py-2 border-b border-gray-200 last:border-b-0"
            >
              <span className="font-medium text-gray-900">{spec.label}:</span>
              <span className="text-gray-700">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component controls for editing
const ComponentControls = ({
  onEdit,
  onDelete,
  isEditing,
  onSave,
  component,
}) => {
  if (isEditing) {
    return <ComponentEditor component={component} onSave={onSave} />;
  }

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Simple component editor
const ComponentEditor = ({ component, onSave }) => {
  const [props, setProps] = useState(component.props);

  const handleSave = () => {
    onSave(props);
  };

  return (
    <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-lg p-4 z-10">
      <h3 className="font-bold mb-3">Edit {component.type}</h3>
      {/* Basic editor - can be expanded based on component type */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {Object.entries(props).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {key}
            </label>
            {typeof value === "string" && (
              <input
                type="text"
                value={value}
                onChange={(e) => setProps({ ...props, [key]: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            )}
            {typeof value === "number" && (
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setProps({ ...props, [key]: parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            )}
            {typeof value === "boolean" && (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setProps({ ...props, [key]: e.target.checked })
                }
                className="ml-1"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// Main page builder component
const EcommercePageBuilder = () => {
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const addComponent = (templateKey) => {
    const template = componentTemplates[templateKey];
    const newComponent = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      props: { ...template.defaultProps },
    };
    setComponents([...components, newComponent]);
  };

  const updateComponent = (id, newProps) => {
    setComponents(
      components.map((comp) =>
        comp.id === id ? { ...comp, props: newProps } : comp
      )
    );
  };

  const deleteComponent = (id) => {
    setComponents(components.filter((comp) => comp.id !== id));
    setSelectedComponentId(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              E-commerce Page Builder
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  previewMode
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                {previewMode ? "Edit Mode" : "Preview"}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Page
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Component Library Sidebar */}
        {!previewMode && (
          <div className="w-64 bg-white shadow-sm border-r min-h-screen p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Components
            </h2>
            <div className="space-y-2">
              {Object.entries(componentTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => addComponent(key)}
                  className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <template.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {template.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className={`flex-1 p-6 ${previewMode ? "max-w-4xl mx-auto" : ""}`}>
          <div className="bg-white rounded-lg shadow-sm min-h-screen">
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Start building your product page</p>
                  <p className="text-sm">
                    Add components from the sidebar to get started
                  </p>
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="components">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-6 p-6"
                    >
                      {components.map((component, index) => (
                        <Draggable
                          key={component.id}
                          draggableId={component.id}
                          index={index}
                          isDragDisabled={previewMode}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${
                                snapshot.isDragging ? "opacity-50" : ""
                              }`}
                            >
                              {!previewMode && (
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-center w-full p-2 bg-gray-100 rounded-t-lg cursor-move"
                                >
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <ComponentRenderer
                                component={component}
                                isSelected={
                                  selectedComponentId === component.id
                                }
                                onSelect={setSelectedComponentId}
                                onUpdate={updateComponent}
                                onDelete={deleteComponent}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommercePageBuilder;
