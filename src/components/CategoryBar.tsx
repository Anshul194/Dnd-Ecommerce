export function CategoryBar() {
  const categories = [
    "Assam Tea",
    "Mizoram Tea",
    "Darjeeling Tea",
    "Green Tea",
    "Black Tea",
    "Herbal Tea",
    "White Tea",
    "Oolong Tea"
  ];

  return (
    <div className="hidden md:block bg-gradient-to-r from-[#3C950D] via-[#45a610] to-[#3C950D] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          {categories.map((category, index) => (
            <button
              key={index}
              className="px-5 py-2.5 whitespace-nowrap hover:bg-white/20 rounded-full transition-all hover:scale-105 hover:shadow-lg backdrop-blur-sm"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
