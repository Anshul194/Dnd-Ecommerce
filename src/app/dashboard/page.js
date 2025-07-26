"use client";

import Image from 'next/image';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold poppins text-gray-900 mb-1 animate-fade-in">Hey user ! Great to see you</h1>
          <h2 className="text-2xl font-bold poppins text-gray-900 animate-fade-in-delay">again</h2>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Your Orders Card */}
          <div className="group relative bg-[#E6EEE2] rounded-2xl shadow-sm overflow-hidden h-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2">
            {/* Background Image */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/images/orders.png"
                alt="Orders background"
                fill
                className="object-cover transition-all duration-500 group-hover:brightness-110"
                priority
              />
              {/* Overlay that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                <h3 className="text-4xl font-semibold bebas text-gray-900 mb-2 transition-colors duration-300 group-hover:text-gray-800">Your Orders</h3>
                <p className="text-sm text-gray-600 leading-relaxed transition-all duration-300 group-hover:text-gray-700">
                  The start of all total payments<br />
                  for goods there
                </p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium w-fit transition-all duration-300 transform group-hover:translate-x-2 group-hover:shadow-lg">
                See
              </button>
            </div>
          </div>

          {/* Login & Security Card */}
          <div className="group relative bg-[#E6EEE2] rounded-2xl shadow-sm overflow-hidden h-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2">
            {/* Background Image */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/images/login.png"
                alt="Login background"
                fill
                className="object-cover transition-all duration-500 group-hover:brightness-110"
                priority
              />
              {/* Overlay that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                <h3 className="text-4xl font-semibold bebas text-gray-900 mb-2 transition-colors duration-300 group-hover:text-gray-800">Login & Security</h3>
                <p className="text-sm text-gray-600 leading-relaxed transition-all duration-300 group-hover:text-gray-700">
                  Edit Login, name and mobile<br />
                  number
                </p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium w-fit transition-all duration-300 transform group-hover:translate-x-2 group-hover:shadow-lg">
                See
              </button>
            </div>
          </div>

          {/* Your Addresses Card */}
          <div className="group relative bg-[#E6EEE2] rounded-2xl shadow-sm overflow-hidden h-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2">
            {/* Background Image */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/images/login-bg.png"
                alt="Addresses background"
                fill
                className="object-cover transition-all duration-500 group-hover:brightness-110"
                priority
              />
              {/* Overlay that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                <h3 className="text-4xl font-semibold bebas text-gray-900 mb-2 transition-colors duration-300 group-hover:text-gray-800">Your Addresses</h3>
                <p className="text-sm text-gray-600 leading-relaxed transition-all duration-300 group-hover:text-gray-700">
                  Edit addresses for orders and<br />
                  others
                </p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium w-fit transition-all duration-300 transform group-hover:translate-x-2 group-hover:shadow-lg">
                See
              </button>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="group relative bg-[#E6EEE2] rounded-2xl shadow-sm overflow-hidden h-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2">
            {/* Background Image */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/images/contact-us.png"
                alt="Contact us background"
                fill
                className="object-cover transition-all duration-500 group-hover:brightness-110"
                priority
              />
              {/* Overlay that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                <h3 className="text-4xl font-semibold bebas text-gray-900 mb-2 transition-colors duration-300 group-hover:text-gray-800">Contact Us</h3>
                <p className="text-sm text-gray-600 leading-relaxed transition-all duration-300 group-hover:text-gray-700">
                  Contact our customer service<br />
                  via phone
                </p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium w-fit transition-all duration-300 transform group-hover:translate-x-2 group-hover:shadow-lg">
                See
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}