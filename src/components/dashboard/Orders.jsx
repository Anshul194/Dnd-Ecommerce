import React, { useState } from 'react';
import { Package, Calendar, Eye, Download, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders] = useState([
    {
      _id: '1',
      orderNumber: 'ORD-2025-001',
      date: new Date('2025-08-01'),
      status: 'delivered',
      total: 299.99,
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 199.99 },
        { name: 'Phone Case', quantity: 2, price: 50.00 }
      ],
      shippingAddress: '123 Main St, City, State 12345',
      trackingNumber: 'TRK123456789'
    },
    {
      _id: '2',
      orderNumber: 'ORD-2025-002',
      date: new Date('2025-07-28'),
      status: 'shipped',
      total: 149.99,
      items: [
        { name: 'Gaming Mouse', quantity: 1, price: 79.99 },
        { name: 'Mouse Pad', quantity: 1, price: 29.99 },
        { name: 'USB Cable', quantity: 2, price: 20.00 }
      ],
      shippingAddress: '456 Oak Ave, City, State 54321',
      trackingNumber: 'TRK987654321'
    },
    {
      _id: '3',
      orderNumber: 'ORD-2025-003',
      date: new Date('2025-07-25'),
      status: 'processing',
      total: 89.99,
      items: [
        { name: 'Bluetooth Speaker', quantity: 1, price: 89.99 }
      ],
      shippingAddress: '789 Pine St, City, State 67890',
      trackingNumber: null
    },
    {
      _id: '4',
      orderNumber: 'ORD-2025-004',
      date: new Date('2025-07-20'),
      status: 'cancelled',
      total: 199.99,
      items: [
        { name: 'Smart Watch', quantity: 1, price: 199.99 }
      ],
      shippingAddress: '321 Elm St, City, State 09876',
      trackingNumber: null
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your order history</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.toUpperCase()}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{order.date.toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                    <span>•</span>
                    <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Tracking Number: </span>
                    <span className="font-mono font-medium text-gray-900">{order.trackingNumber}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  <Download size={14} />
                  <span>Download Invoice</span>
                </button>
                {order.status === 'delivered' && (
                  <button className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                    <span>Reorder</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
