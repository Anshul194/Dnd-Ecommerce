"use client"

import React, { useState } from 'react';
import { ShoppingBag, MapPin, Heart, Settings, LogOut, User, FileText } from 'lucide-react';

// Import dashboard components
import Dashboard from '../../components/dashboard/Dashboard';
import Orders from '../../components/dashboard/Orders';
import Addresses from '../../components/dashboard/Addresses';
import Wishlist from '../../components/dashboard/Wishlist';
import AccountDetails from '../../components/dashboard/AccountDetails';
import SupportTickets from '../../components/dashboard/SupportTickets';

export default function SidebarDashboard() {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const user = {
    name: 'Anshul',
    email: 'anshul12@gmail.com'
  };

  const sidebarItems = [
    { icon: ShoppingBag, label: 'Orders', component: 'orders' },
    { icon: MapPin, label: 'Addresses', component: 'addresses' },
    { icon: Heart, label: 'Wishlist', component: 'wishlist' },
    { icon: Settings, label: 'Account Details', component: 'account-details' },
    { icon: FileText, label: 'Support Ticket', component: 'support-tickets' }
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'orders':
        return <Orders />;
      case 'addresses':
        return <Addresses />;
      case 'wishlist':
        return <Wishlist />;
      case 'account-details':
        return <AccountDetails />;
      case 'support-tickets':
        return <SupportTickets />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          {/* User Profile */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveComponent('dashboard')}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full text-left ${
                activeComponent === 'dashboard'
                  ? 'bg-red-100 text-red-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
              }`}
            >
              <User size={18} />
              <span className="font-medium">Dashboard</span>
            </button>
            
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveComponent(item.component)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full text-left ${
                  activeComponent === item.component
                    ? 'bg-red-100 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 w-full">
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderActiveComponent()}
      </div>
    </div>
  );
}