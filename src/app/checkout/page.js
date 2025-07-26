"use client";

import { useState } from 'react';
import { Plus, Minus, MapPin } from 'lucide-react';

export default function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quantities, setQuantities] = useState({
    item1: 1,
    item2: 1
  });
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('SAVE10');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');

  const updateQuantity = (item, change) => {
    setQuantities(prev => ({
      ...prev,
      [item]: Math.max(1, prev[item] + change)
    }));
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode);
      setPromoCode('');
    }
  };

  const deliveryServices = [
    { id: 'standard', name: 'Standard Delivery', price: 5.00, time: '3-5 days' },
    { id: 'express', name: 'Express Delivery', price: 15.00, time: '1-2 days' },
    { id: 'overnight', name: 'Overnight Delivery', price: 25.00, time: 'Next day' }
  ];

  const products = [
    { id: 1, name: 'Lorem ipsum', price: 415.10, image: '/api/placeholder/64/64' },
    { id: 2, name: 'Lorem ipsum', price: 320.50, image: '/api/placeholder/64/64' },
    { id: 3, name: 'Lorem ipsum', price: 180.25, image: '/api/placeholder/64/64' },
    { id: 4, name: 'Lorem ipsum', price: 25.99, image: '/api/placeholder/64/64' }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Form */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6">
          {/* Step Tabs */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex w-1/2 items-center pb-2 ${currentStep === 1 ? 'text border-b-2 border-[#3C950D]' : 'text-gray-400 border-b-2 border-gray-300 '}`}
            >
              <div className={`w-8 h-8 ${currentStep === 1 ? 'bg ' : 'bg-gray-200'} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                ✓
              </div>
              <span className="ml-3 text-sm font-medium">Consumer Information</span>
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`flex w-1/2 items-center pb-2 ${currentStep === 2 ? 'text border-b-2 border-[#3C950D]' : 'text-gray-400 border-b-2 border-gray-300 '}`}
            >
              <div className={`w-8 h-8 ${currentStep === 2 ? 'bg' : 'bg-gray-200'} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                ✓
              </div>
              <span className="ml-3 text-sm font-medium">Payment Details</span>
            </button>
          </div>

          {/* Tab Content */}
          {currentStep === 1 && (
            <>
              {/* Personal Details */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Personal Details</h2>
                <p className="text-sm text-gray-500 mb-6">Complete shipping to continue the rest of the payment</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value="Pikachu Cheepeetan"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value="PikachuCheepeetan@gmail.com"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option>India</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Country</label>
                    <input
                      type="text"
                      value="Delhi"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Pin</label>
                    <input
                      type="text"
                      value="363423"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="border-t pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Delivery Address</h3>
                      <p className="text-sm text-gray-600">
                        At: Navjean Street, New York City, NY 10012-1408, on the corner of Broome Street 
                        and Pemo Place (in the heart of Greenwich Village.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Services Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Delivery Service</h2>
                <p className="text-sm text-gray-500 mb-6">Select your preferred delivery option</p>
                
                <div className="space-y-3">
                  {deliveryServices.map((service) => (
                    <div key={service.id} className="flex items-center p-3 border-2 border-gray-300 rounded-md">
                      <input
                        type="radio"
                        id={service.id}
                        name="delivery"
                        value={service.id}
                        checked={selectedDelivery === service.id}
                        onChange={(e) => setSelectedDelivery(e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={service.id} className="ml-3 flex-1 flex justify-between items-center cursor-pointer">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-xs text-gray-500">{service.time}</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">₹ {service.price.toFixed(2)}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Billing Details</h2>
                <p className="text-sm text-gray-500 mb-6">Complete the data from the payment card that will be used</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value="67548-09378-28487-19699"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expired Card</label>
                    <input
                      type="text"
                      value="2028"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Code</label>
                    <input
                      type="text"
                      value="*******"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value="3465"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value="New Delhi"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Town</label>
                    <input
                      type="text"
                      value="Connaught Place"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                    <input
                      type="text"
                      value="+91 9876543210"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value="110001"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value="Block A, Sector 12"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value="Near Metro Station"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Landmark</label>
                    <input
                      type="text"
                      value="India Gate"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Billing Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Billing Details</h2>
                <p className="text-sm text-gray-500 mb-6">Complete the data from the payment card that will be used</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value="67548-09378-28487-19699"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expired Card</label>
                    <input
                      type="text"
                      value="2028"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Code</label>
                    <input
                      type="text"
                      value="*******"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value="3465"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value="New Delhi"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Town</label>
                    <input
                      type="text"
                      value="Connaught Place"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                    <input
                      type="text"
                      value="+91 9876543210"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value="110001"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value="Block A, Sector 12"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value="Near Metro Station"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Landmark</label>
                    <input
                      type="text"
                      value="India Gate"
                      className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Section - Order Summary */}
        <div className="bg-[#F8F8F8] border-2 border-gray-300 sticky top-10 rounded-lg p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
          <p className="text-xs text-gray-500 mb-6">The cost of all total payments for goods there</p>

          {/* Available Products */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Available Products</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">₹ {product.price}</p>
                  </div>
                  <button className="text-xs text bg-green-100 hover:bg-green-200 px-2 py-1 rounded">Add</button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {/* Item 1 */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Lorem ipsum dolor</h4>
                <p className="text-xs text-gray-500">Quantity : 1</p>
              </div>
              <div className="flex items-center gap-2">
                
                
                <button 
                  onClick={() => updateQuantity('item1', -1)}
                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                >
                  <Minus className="w-3 h-3 text-black" />
                </button>
                <span className="text-sm text-black font-medium">{quantities.item1}</span>
                <button 
                  onClick={() => updateQuantity('item1', 1)}
                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-black" />
                </button>
              </div>
              <div className="text-sm font-semibold text-black">₹ 415.10</div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Lorem ipsum dolor</h4>
                <p className="text-xs text-gray-500">Quantity : 1</p>
              </div>
              <div className="flex items-center  gap-2">
                
                
                <button 
                  onClick={() => updateQuantity('item2', -1)}
                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                >
                  <Minus className="w-3 h-3 text-black" />
                </button>
                <span className="text-sm text-black font-medium">{quantities.item2}</span>
                <button 
                  onClick={() => updateQuantity('item2', 1)}
                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-black" />
                </button>
              </div>
              <div className="text-sm font-semibold text-black">₹ 415.10</div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Promo Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleApplyPromo}
                className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Apply
              </button>
            </div>
            {appliedPromo && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-green-600">Applied: {appliedPromo}</span>
                <button
                  onClick={() => setAppliedPromo('')}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-black">₹ 524.37</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes</span>
              <span className="font-semibold text-black">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Code Promo</span>
              <span className="font-semibold text">- ₹ 415.10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Service</span>
              <span className="font-semibold text-black">₹ {deliveryServices.find(s => s.id === selectedDelivery)?.price.toFixed(2) || '5.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vat (10%)</span>
              <span className="font-semibold text-black">₹ 1.45</span>
            </div>
          </div>

          {/* Pay Button */}
          <button className="w-full bg hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors">
            PAY
          </button>
        </div>
      </div>
    </div>
  );
}