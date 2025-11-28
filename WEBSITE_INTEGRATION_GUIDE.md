# Website Integration Guide - Return & Refund System

## 🎯 Overview

This guide shows how to integrate the return and refund system into your customer-facing website.

---

## 📁 New Components Created

### 1. **ReturnRequestModal.jsx**
Location: `src/components/orders/ReturnRequestModal.jsx`

**Purpose:** Modal form for customers to request returns

**Features:**
- Return reason selection
- Additional comments
- Image upload
- Bank details form
- Form validation
- API integration

**Usage:**
```jsx
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';

<ReturnRequestModal
  order={orderObject}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // Refresh order data
    fetchOrderDetails();
  }}
/>
```

---

### 2. **ReturnStatusCard.jsx**
Location: `src/components/orders/ReturnStatusCard.jsx`

**Purpose:** Display return/refund status in order details

**Features:**
- Color-coded status indicators
- Timeline display
- Refund deadline countdown
- Transaction ID display
- Admin notes display

**Usage:**
```jsx
import ReturnStatusCard from '@/components/orders/ReturnStatusCard';

<ReturnStatusCard order={orderObject} />
```

---

### 3. **Order Details Page Example**
Location: `src/app/orders/[id]/page.jsx`

**Purpose:** Complete example of order details page with return integration

**Features:**
- Order information display
- Return request button (conditional)
- Return status card
- Order items list
- Shipping address

---

## 🔌 Integration Steps

### Step 1: Add Components to Your Order Details Page

```jsx
'use client';

import { useState } from 'react';
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';
import ReturnStatusCard from '@/components/orders/ReturnStatusCard';

export default function YourOrderPage() {
  const [order, setOrder] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Check if order can be returned
  const canRequestReturn = () => {
    if (!order) return false;
    const eligibleStatuses = ['completed', 'shipped'];
    const hasReturnRequested = order.return_details?.is_return_requested;
    return eligibleStatuses.includes(order.status) && !hasReturnRequested;
  };

  return (
    <div>
      {/* Show return status if return requested */}
      <ReturnStatusCard order={order} />

      {/* Show return button if eligible */}
      {canRequestReturn() && (
        <button onClick={() => setShowReturnModal(true)}>
          Request Return & Refund
        </button>
      )}

      {/* Return request modal */}
      <ReturnRequestModal
        order={order}
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSuccess={() => fetchOrderDetails()}
      />
    </div>
  );
}
```

---

### Step 2: Add Return Button to Orders List

In your orders list page (`/orders` or `/account/orders`):

```jsx
{orders.map((order) => (
  <div key={order._id} className="order-card">
    {/* Order info */}
    <h3>Order #{order._id}</h3>
    <p>Total: ₹{order.total}</p>
    <p>Status: {order.status}</p>

    {/* Return button */}
    {['completed', 'shipped'].includes(order.status) && 
     !order.return_details?.is_return_requested && (
      <button onClick={() => handleReturnClick(order)}>
        Request Return
      </button>
    )}

    {/* Return status badge */}
    {order.return_details?.is_return_requested && (
      <span className="return-badge">
        Return {order.return_details.return_status}
      </span>
    )}
  </div>
))}
```

---

### Step 3: Update Order Fetch API

Make sure your order fetch includes return details:

```javascript
// In your API route or client-side fetch
const order = await OrderModel.findById(orderId)
  .populate('user', 'name email phone')
  .populate('return_details.return_approved_by', 'name')
  .populate('return_details.refund_initiated_by', 'name')
  .lean();

// Calculate days remaining if deadline exists
if (order.return_details?.refund_deadline) {
  const deadline = new Date(order.return_details.refund_deadline);
  const now = new Date();
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  order.return_details.days_remaining = daysRemaining;
}
```

---

## 🎨 Styling Customization

### Customize Modal Colors

Edit `ReturnRequestModal.jsx`:

```jsx
// Change gradient colors
className="bg-gradient-to-r from-orange-600 to-red-600"
// to
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

### Customize Status Card Colors

Edit `ReturnStatusCard.jsx`:

```jsx
const colorClasses = {
  yellow: { /* your colors */ },
  blue: { /* your colors */ },
  // ... etc
};
```

---

## 📱 Mobile Responsiveness

Both components are fully responsive:

- Modal adapts to screen size
- Form fields stack on mobile
- Touch-friendly buttons
- Scrollable content

Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## 🔔 Add Notifications (Optional)

### Email Notifications

Create email templates for:

1. **Return Request Received** (to customer)
```javascript
// After successful return request
await sendEmail({
  to: order.user.email,
  subject: 'Return Request Received',
  template: 'return-request-received',
  data: { order, returnDetails: order.return_details }
});
```

2. **Return Approved** (to customer)
```javascript
// In admin approval API
await sendEmail({
  to: order.user.email,
  subject: 'Return Approved - Refund in 7 Days',
  template: 'return-approved',
  data: { order, deadline: refundDeadline }
});
```

3. **Refund Completed** (to customer)
```javascript
// In refund completion API
await sendEmail({
  to: order.user.email,
  subject: 'Refund Processed Successfully',
  template: 'refund-completed',
  data: { order, transactionId }
});
```

### Toast Notifications

Add toast library (e.g., react-hot-toast):

```bash
npm install react-hot-toast
```

```jsx
import toast from 'react-hot-toast';

// In ReturnRequestModal after successful submission
toast.success('Return request submitted successfully!');

// In ReturnStatusCard for status updates
{order.return_details.return_status === 'approved' && (
  toast.success('Your return has been approved!')
)}
```

---

## 🧪 Testing Checklist

### Customer Flow:
- [ ] Customer can view order details
- [ ] Return button appears for eligible orders
- [ ] Return button hidden for ineligible orders
- [ ] Modal opens when clicking return button
- [ ] All form fields work correctly
- [ ] Image upload works
- [ ] Bank details validation works
- [ ] Form submission succeeds
- [ ] Success message displays
- [ ] Order refreshes with return status
- [ ] Return status card displays correctly
- [ ] Deadline countdown shows correctly

### Admin Flow:
- [ ] Admin can see return request in `/admin/refunds`
- [ ] Admin can approve return
- [ ] 7-day deadline sets correctly
- [ ] Admin can process refund
- [ ] Transaction ID saves correctly
- [ ] Customer sees updated status

---

## 🎯 Common Integration Scenarios

### Scenario 1: Existing Order Details Page

If you already have an order details page:

```jsx
// Add to your existing component
import ReturnRequestModal from '@/components/orders/ReturnRequestModal';
import ReturnStatusCard from '@/components/orders/ReturnStatusCard';

// Add state
const [showReturnModal, setShowReturnModal] = useState(false);

// Add to your render
return (
  <div>
    {/* Your existing order details */}
    
    {/* Add return status card */}
    <ReturnStatusCard order={order} />
    
    {/* Add return button */}
    {canRequestReturn() && (
      <button onClick={() => setShowReturnModal(true)}>
        Request Return
      </button>
    )}
    
    {/* Add modal */}
    <ReturnRequestModal
      order={order}
      isOpen={showReturnModal}
      onClose={() => setShowReturnModal(false)}
      onSuccess={refreshOrder}
    />
  </div>
);
```

---

### Scenario 2: Orders List Page

```jsx
// In your orders list
{orders.map((order) => (
  <div key={order._id}>
    {/* Order card */}
    
    {/* Return status indicator */}
    {order.return_details?.is_return_requested && (
      <div className="return-indicator">
        <span>Return Status: {order.return_details.return_status}</span>
        {order.return_details.refund_status === 'completed' && (
          <span className="text-green-600">✓ Refunded</span>
        )}
      </div>
    )}
  </div>
))}
```

---

### Scenario 3: User Dashboard

Add return statistics:

```jsx
// Fetch user's return stats
const returnStats = {
  pending: orders.filter(o => o.return_details?.return_status === 'requested').length,
  approved: orders.filter(o => o.return_details?.return_status === 'approved').length,
  completed: orders.filter(o => o.return_details?.refund_status === 'completed').length,
};

// Display in dashboard
<div className="stats-grid">
  <div className="stat-card">
    <h3>Pending Returns</h3>
    <p>{returnStats.pending}</p>
  </div>
  <div className="stat-card">
    <h3>Approved Returns</h3>
    <p>{returnStats.approved}</p>
  </div>
  <div className="stat-card">
    <h3>Completed Refunds</h3>
    <p>{returnStats.completed}</p>
  </div>
</div>
```

---

## 🔧 Troubleshooting

### Issue: Modal not opening
**Solution:** Check if `isOpen` prop is being set to `true`

### Issue: Form submission fails
**Solution:** 
- Check network tab for API errors
- Verify authentication token
- Check order eligibility

### Issue: Return status not showing
**Solution:**
- Verify `order.return_details` exists
- Check if order data is being fetched correctly
- Ensure component is receiving order prop

### Issue: Bank details not saving
**Solution:**
- Check form field names match API expectations
- Verify all required fields are filled
- Check browser console for validation errors

---

## 📊 Analytics Integration (Optional)

Track return requests:

```javascript
// In ReturnRequestModal after successful submission
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'return_request', {
    order_id: order._id,
    order_value: order.total,
    return_reason: formData.return_reason,
  });
}
```

---

## ✅ Summary

You now have:
- ✅ Customer return request form
- ✅ Return status display
- ✅ Complete order details page example
- ✅ Integration instructions
- ✅ Customization guide
- ✅ Testing checklist

**All components are ready to use in your website!**

---

## 📞 Quick Reference

### API Endpoints:
- `POST /api/orders/return` - Submit return request
- `GET /api/orders/refund` - Get return requests (admin)
- `POST /api/orders/refund` - Approve/reject return (admin)
- `PUT /api/orders/refund` - Process refund (admin)

### Components:
- `ReturnRequestModal` - Customer return form
- `ReturnStatusCard` - Status display
- `RefundManagement` - Admin panel

### Pages:
- `/orders/[id]` - Order details (customer)
- `/admin/refunds` - Refund management (admin)

---

*Last Updated: 2025-11-27*
