import React from 'react';
import { ArrowLeft, Calendar, User, Share2, Heart, MessageCircle, Eye } from 'lucide-react';

export default function BlogDetailPage() {
  const relatedPosts = [
    {
      id: 1,
      date: "February 20, 2024",
      title: "The Art of Tea Brewing: A Beginner's Guide",
      excerpt: "Learn the fundamental techniques and secrets behind brewing the perfect cup of tea, from water temperature to steeping times",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=250&fit=crop&crop=entropy&cs=tinysrgb"
    },
    {
      id: 2,
      date: "February 18, 2024",
      title: "Exploring Premium Ceylon Tea Gardens",
      excerpt: "Journey through the misty highlands of Sri Lanka and discover the rich heritage behind some of the world's finest teas",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=250&fit=crop&crop=entropy&cs=tinysrgb"
    },
    {
      id: 3,
      date: "February 15, 2024",
      title: "Health Benefits of Green Tea",
      excerpt: "Discover the scientifically-backed health benefits of green tea and why it should be part of your daily routine",
      image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=250&fit=crop&crop=entropy&cs=tinysrgb"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm">Back to Tea Blog</span>
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-br from-green-100 to-amber-50 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=1200&h=600&fit=crop&crop=entropy&cs=tinysrgb" 
            alt="Traditional tea ceremony"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>February 23, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>By Chen Wei</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>3.2k views</span>
              </div>
            </div>
            
            <h1 className="bebas text-6xl md:text-7xl font-bold leading-tight mb-4 text-gray-900">
              The Ancient Wisdom of Traditional Tea Ceremonies
            </h1>
            
            <p className="text-xl text-gray-700 max-w-3xl">
              Discover the profound beauty and mindful practices behind traditional tea ceremonies, where every gesture carries meaning and every sip connects us to centuries of cultural heritage.
            </p>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Article Stats */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <Heart size={18} />
              <span>156 likes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle size={18} />
              <span>23 comments</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            6 min read
          </div>
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-gray-700 mb-8">
            In a world that moves at breakneck speed, the traditional tea ceremony offers a sanctuary of mindfulness and connection. This ancient practice, rooted in centuries of cultural wisdom, transforms the simple act of drinking tea into a profound meditation on presence, respect, and harmony with nature.
          </p>

          <h2 className="bebas text-4xl font-bold text-gray-900 mt-12 mb-6">
            The Philosophy Behind the Ritual
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Traditional tea ceremonies, whether Chinese Gongfu Cha or Japanese Chanoyu, are built upon fundamental principles that extend far beyond the mere preparation of tea. These ceremonies embody concepts of harmony (wa), respect (kei), purity (sei), and tranquility (jaku). Each movement is deliberate, each moment savored, creating a space where participants can escape the chaos of daily life and find inner peace.
          </p>

          <div className="my-12">
            <img 
              src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb" 
              alt="Traditional tea ceremony setup"
              className="w-full rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-500 text-center mt-4">
              A traditional tea ceremony setup with carefully arranged utensils and premium tea leaves
            </p>
          </div>

          <h2 className="bebas text-4xl font-bold text-gray-900 mt-12 mb-6">
            The Sacred Art of Preparation
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            The preparation of tea in a traditional ceremony is itself a form of meditation. From the careful selection of tea leaves to the precise temperature of water, every element is considered with utmost attention. The tea master's movements are fluid and purposeful, demonstrating years of practice and deep understanding of the craft. The sound of water boiling, the aroma of steaming leaves, and the gentle clink of porcelain create a symphony that engages all the senses.
          </p>

          <blockquote className="border-l-4 border-green-500 pl-6 my-8 italic text-xl text-gray-600">
            "Tea is not just a beverage; it is a bridge between the material and spiritual worlds, a moment of stillness in our restless lives."
          </blockquote>

          <h2 className="bebas text-4xl font-bold text-gray-900 mt-12 mb-6">
            Understanding Tea Varieties and Their Character
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Different tea varieties bring their own unique personalities to the ceremony. Delicate white teas require gentle handling and cooler water, while robust pu-erh teas can withstand multiple infusions, each revealing new layers of complexity. Green teas dance between freshness and astringency, while oolongs offer a perfect balance of floral notes and deep earthiness. Understanding these characteristics allows the tea master to honor each tea's individual nature.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-12">
            <img 
              src="https://images.unsplash.com/photo-1594631661960-0ee2a99ae5bb?w=400&h=300&fit=crop&crop=entropy&cs=tinysrgb" 
              alt="Various tea leaves"
              className="rounded-lg shadow-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=entropy&cs=tinysrgb" 
              alt="Tea pouring technique"
              className="rounded-lg shadow-lg"
            />
          </div>

          <h2 className="bebas text-4xl font-bold text-gray-900 mt-12 mb-6">
            The Mindful Practice of Serving and Receiving
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            In a traditional tea ceremony, the act of serving and receiving tea is imbued with deep respect and gratitude. The host presents each cup with both hands, a gesture that conveys honor and care for the guest. Recipients accept the tea with similar reverence, acknowledging not only the beverage but the time, skill, and intention that went into its preparation. This exchange creates a moment of genuine human connection, free from pretense or hurry.
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            The beauty of traditional tea ceremonies lies not in their complexity, but in their simplicity and intentionality. They remind us that some of life's most profound experiences can be found in its quietest moments. Whether practiced in a formal setting or adapted for modern life, the principles of mindfulness, respect, and appreciation that define these ceremonies offer timeless wisdom for our contemporary world.
          </p>
        </div>

        {/* Tags */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex flex-wrap gap-3">
            {['Tea Ceremony', 'Mindfulness', 'Traditional Culture', 'Wellness', 'Meditation'].map((tag) => (
              <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Info */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg min-w-16 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">CW</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Chen Wei</h3>
              <p className="text-gray-600 mb-2">Tea Master & Cultural Historian</p>
              <p className="text-sm text-gray-500">
                Chen Wei has been practicing traditional tea ceremonies for over 15 years and teaches the art of mindful tea preparation across the globe.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="bebas text-5xl font-bold text-gray-900 mb-4">
              More Tea Stories
            </h2>
            <p className="text-gray-600 text-lg">
              Continue your journey into the world of tea
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="relative overflow-hidden mb-4">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">{post.date}</p>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="pt-2">
                    <span className="text-green-600 bebas text-sm font-medium group-hover:text-green-700 transition-colors">
                      Read More →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}