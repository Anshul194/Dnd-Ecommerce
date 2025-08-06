import React, { useState } from 'react';
import { FileText, Plus, MessageCircle, Calendar, X, Send, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const SupportTickets = () => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [replyMessage, setReplyMessage] = useState('');

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
    e.preventDefault();
    try {
      const newTicket = {
        _id: Date.now().toString(),
        ...ticketForm,
        status: 'open',
        createdAt: new Date(),
        replies: []
      };
      setTickets(prev => [newTicket, ...prev]);
      setTicketForm({ subject: '', description: '', priority: 'medium' });
      setIsTicketModalOpen(false);
      alert('Support ticket submitted successfully!');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Error submitting ticket. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
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
    alert('Reply sent successfully!');
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
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Type your message here..."
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Send size={16} />
                <span>Send Reply</span>
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                onClick={() => setIsTicketModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send size={16} />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
