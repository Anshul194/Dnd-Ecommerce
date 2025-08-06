import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Plus, MessageCircle, Calendar, X, Send, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { createSupportTicket, resetTicketState } from '@/app/store/slices/supportTicketSlice';
import { fetchOrders } from '@/app/store/slices/orderSlice';
import { toast } from 'react-toastify';

const SupportTickets = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.supportTicket);
  const { orders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders);
  
  // Get user data for customer field
  const { user } = useSelector((state) => state.auth || {});
  
  // Debug: Log user data
  console.log('Current user:', user);
  
  // Debug: Log orders data
  console.log('Orders state:', orders);
  console.log('Orders loading:', ordersLoading);
  console.log('Orders error:', ordersError);
  
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    customer: '', // Will be set dynamically from user context
    orderId: '', // New field for order selection
    attachments: []
  });
  const [replyMessage, setReplyMessage] = useState('');

  // Effect to set customer ID when user data is available
  useEffect(() => {
    if (user?._id && ticketForm.customer !== user._id) {
      setTicketForm(prev => ({
        ...prev,
        customer: user._id
      }));
    }
  }, [user?._id, ticketForm.customer]);

  // Effect to fetch orders when component mounts
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user?._id]);

  const [tickets, setTickets] = useState([
    {
      _id: '1',
      subject: 'Order not received',
      description: 'I placed an order 5 days ago but haven\'t received it yet. Order number: ORD-2025-001',
      status: 'open',
      priority: 'medium',
      createdAt: new Date('2025-08-01'),
      replies: []
    },
    {
      _id: '2',
      subject: 'Payment issue',
      description: 'My payment was deducted but order was not confirmed. Transaction ID: TXN123456',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date('2025-07-30'),
      replies: [
        {
          _id: 'r1',
          message: 'Thank you for contacting us. We are looking into this issue and will update you shortly.',
          repliedBy: 'Support Team',
          repliedAt: new Date('2025-07-30T10:30:00'),
          isStaff: true
        },
        {
          _id: 'r2',
          message: 'We have identified the issue and are processing your refund. You should see the amount credited back to your account within 3-5 business days.',
          repliedBy: 'Support Team',
          repliedAt: new Date('2025-07-31T14:15:00'),
          isStaff: true
        }
      ]
    },
    {
      _id: '3',
      subject: 'Product quality concern',
      description: 'The product I received (Smart Watch Model XYZ) is damaged. There are scratches on the screen.',
      status: 'resolved',
      priority: 'medium',
      createdAt: new Date('2025-07-25'),
      replies: [
        {
          _id: 'r3',
          message: 'Can you please share photos of the damage? This will help us process your replacement request faster.',
          repliedBy: 'Support Team',
          repliedAt: new Date('2025-07-25T16:00:00'),
          isStaff: true
        },
        {
          _id: 'r4',
          message: 'I have attached the photos as requested. Please let me know the next steps.',
          repliedBy: 'Anshul',
          repliedAt: new Date('2025-07-26T09:30:00'),
          isStaff: false
        },
        {
          _id: 'r5',
          message: 'Thank you for the photos. We have processed a replacement which will be delivered within 2-3 business days. Tracking number: TRK789123',
          repliedBy: 'Support Team',
          repliedAt: new Date('2025-07-26T11:45:00'),
          isStaff: true
        }
      ]
    },
    {
      _id: '4',
      subject: 'Account login issues',
      description: 'I am unable to login to my account. Getting \'Invalid credentials\' error even with correct password.',
      status: 'closed',
      priority: 'low',
      createdAt: new Date('2025-07-20'),
      replies: [
        {
          _id: 'r6',
          message: 'Please try resetting your password using the \'Forgot Password\' link on the login page.',
          repliedBy: 'Support Team',
          repliedAt: new Date('2025-07-20T13:20:00'),
          isStaff: true
        },
        {
          _id: 'r7',
          message: 'That worked! Thank you for the quick resolution.',
          repliedBy: 'Anshul',
          repliedAt: new Date('2025-07-20T14:05:00'),
          isStaff: false
        }
      ]
    }
  ]);

  const handleTicketSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Validation
    if (!ticketForm.subject.trim()) {
      alert('Please enter a subject for your ticket.');
      return;
    }
    
    if (!ticketForm.description.trim()) {
      alert('Please enter a description for your ticket.');
      return;
    }
    
    // Validate customer ID
    if (!user?._id) {
      alert('User authentication required. Please log in again.');
      return;
    }
    
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('subject', ticketForm.subject);
      formData.append('description', ticketForm.description);
      formData.append('priority', ticketForm.priority);
      
      // Add customer ID (required field)
      formData.append('customer', user._id);
      
      // Add order ID if selected
      if (ticketForm.orderId) {
        formData.append('orderId', ticketForm.orderId);
      }
      
      // Debug log to verify customer ID
      console.log('Submitting ticket with customer ID:', user._id);
      console.log('Selected order ID:', ticketForm.orderId);
      
      // Add attachments if any
      ticketForm.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      // Debug: Log all form data entries
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Dispatch the API call
      const result = await dispatch(createSupportTicket(formData)).unwrap();
      
      // Show success toast message
      toast.success('Support ticket submitted. We’ll get back to you within 24 hours. Thank you!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Add the new ticket to local state
      const newTicket = {
        _id: result._id || Date.now().toString(),
        subject: ticketForm.subject,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: 'open',
        createdAt: new Date(),
        replies: []
      };
      setTickets(prev => [newTicket, ...prev]);
      
      // Reset form and close modal
      setTicketForm({ 
        subject: '', 
        description: '', 
        priority: 'medium',
        customer: user?._id || '',
        orderId: '',
        attachments: []
      });
      setIsTicketModalOpen(false);
      
      // Reset Redux state
      setTimeout(() => {
        dispatch(resetTicketState());
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error(error.message || 'Failed to submit support ticket. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Error is handled by Redux state
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`The following files are too large (max 10MB each): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setTicketForm(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const removeAttachment = (index) => {
    setTicketForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReplySubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyMessage.trim()) return;

    const newReply = {
      _id: Date.now().toString(),
      message: replyMessage,
      repliedBy: 'Anshul',
      repliedAt: new Date(),
      isStaff: false
    };

    setTickets(prev => prev.map(ticket => 
      ticket._id === selectedTicket._id 
        ? { ...ticket, replies: [...ticket.replies, newReply] }
        : ticket
    ));

    setSelectedTicket(prev => ({
      ...prev,
      replies: [...prev.replies, newReply]
    }));

    setReplyMessage('');
    toast.success('Reply sent successfully!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      case 'closed': return <CheckCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-red-600 hover:text-red-700 mb-2 text-sm"
            >
              ← Back to Tickets
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(selectedTicket.status)}`}>
                {getStatusIcon(selectedTicket.status)}
                <span>{selectedTicket.status.replace('_', ' ').toUpperCase()}</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                {selectedTicket.priority.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Created {selectedTicket.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Original Message */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">A</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900">Anshul</span>
                <span className="text-sm text-gray-500">{selectedTicket.createdAt.toLocaleString()}</span>
              </div>
              <p className="text-gray-700">{selectedTicket.description}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          {selectedTicket.replies.map((reply) => (
            <div key={reply._id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  reply.isStaff ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <span className={`font-medium text-sm ${
                    reply.isStaff ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {reply.isStaff ? 'S' : 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{reply.repliedBy}</span>
                    {reply.isStaff && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Support
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{reply.repliedAt.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{reply.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {selectedTicket.status !== 'closed' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Reply</h3>
            <div className="space-y-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Type your message here..."
                required
              />
              <button
                type="button"
                onClick={handleReplySubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Send size={16} />
                <span>Send Reply</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {!user?._id && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          Warning: User authentication required to create support tickets. Please ensure you are logged in.
        </div>
      )}
      {ordersLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
          Loading your orders...
        </div>
      )}
      {ordersError && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md">
          Warning: Unable to load orders. You can still create a ticket, but order selection will not be available.
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Tickets</h1>
          <p className="text-gray-600">Manage your support requests and view responses</p>
        </div>
        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Raise a Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-4">You haven&apos;t created any support tickets yet.</p>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus size={16} />
              <span>Create Your First Ticket</span>
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                </div>
                <div className="ml-4 flex flex-col space-y-2 items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span>{ticket.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{ticket.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={14} />
                    <span>{ticket.replies.length} replies</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Support Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
              <button
                onClick={() => {
                  setIsTicketModalOpen(false);
                  setTicketForm({ 
                    subject: '', 
                    description: '', 
                    priority: 'medium',
                    customer: user?._id || '',
                    orderId: '',
                    attachments: []
                  });
                  dispatch(resetTicketState());
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={ticketForm.subject}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={ticketForm.priority}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 text-black"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                  Related Order (Optional)
                </label>
                <select
                  id="orderId"
                  name="orderId"
                  value={ticketForm.orderId}
                  onChange={handleInputChange}
                  disabled={loading || ordersLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 text-black"
                >
                  <option value="">Select an order (optional)</option>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => {
                      console.log('Rendering order:', order); // Debug log
                      
                      // Get the first item's variant title for display
                      const firstItemTitle = order.items?.[0]?.variant?.title || 'Unknown Product';
                      const itemCount = order.items?.length || 0;
                      const orderDate = new Date(order.createdAt).toLocaleDateString();
                      
                      return (
                        <option key={order._id} value={order._id}>
                          {firstItemTitle}{itemCount > 1 ? ` (+${itemCount - 1} more)` : ''} - ${order.total?.toFixed(2) || '0.00'} ({orderDate})
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No orders found</option>
                  )}
                </select>
                {ordersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading orders...</p>
                )}
                {ordersError && (
                  <p className="text-xs text-red-500 mt-1">Error loading orders: {ordersError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select an order if your ticket is related to a specific purchase. This helps our support team assist you better.
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={ticketForm.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-50 text-black"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can upload multiple files (images, PDF, documents). Max 10MB per file.
                </p>
                
                {/* Show selected files */}
                {ticketForm.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    {ticketForm.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 truncate block">{file.name}</span>
                          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                          disabled={loading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsTicketModalOpen(false);
                    setTicketForm({ 
                      subject: '', 
                      description: '', 
                      priority: 'medium',
                      customer: user?._id || '',
                      orderId: '',
                      attachments: []
                    });
                    dispatch(resetTicketState());
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTicketSubmit}
                  disabled={loading || !user?._id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : !user?._id ? (
                    <>
                      <span>User Required</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;