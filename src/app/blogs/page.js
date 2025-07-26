import Link from "next/link";

export default function BlogSection() {
  const blogPosts = [
    {
      id: 1,
      date: "February 23, 2024",
      title: "Lorem ipsum dolor sit amet consectetur",
      excerpt: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt"
    },
    {
      id: 2,
      date: "February 23, 2024",
      title: "Lorem ipsum dolor sit amet consectetur",
      excerpt: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt"
    },
    {
      id: 3,
      date: "February 23, 2024",
      title: "Lorem ipsum dolor sit amet consectetur",
      excerpt: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt"
    },
    {
      id: 4,
      date: "February 23, 2024",
      title: "Lorem ipsum dolor sit amet consectetur",
      excerpt: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt"
    },
    {
      id: 5,
      date: "February 23, 2024",
      title: "Lorem ipsum dolor sit amet consectetur",
      excerpt: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt"
    }
  ];

  return (
    <div className="py-10 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Blogs Label */}
        <div className="text-sm poppins text-gray-600 mb-2">
          Blogs
        </div>
        
        {/* Main Title */}
        <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-5">
          Find Your Interesting One
        </h1>
        
        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white overflow-hidden  hover:shadow-lg transition-shadow duration-300">
              {/* Blog Image Placeholder */}
              <div className="w-full h-56 bg-gray-300"></div>
              
              {/* Blog Content */}
              <div>
                {/* Date */}
                <div className="text-xs text-gray-500 mb-2">
                  {post.date}
                </div>
                
                {/* Title */}
                <h3 className="text-base font-bold text-gray-800 mb-2 leading-tight">
                  {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                
                {/* Read More Link */}
                <Link 
                  href="blog-detail" 
                  className="text-md bebas text-green-600  uppercase tracking-wide hover:underline"
                >
                  Read More &gt;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}