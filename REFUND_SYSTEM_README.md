# Return & Refund Management System

## Overview

A comprehensive **manual refund processing system** for handling order returns with a **7-day refund policy**. This system allows customers to request returns and enables admins to manually approve/reject returns and process refunds.

---

## 🎯 Features

### For Customers:
- ✅ Request order returns with reason
- ✅ Upload return images (proof)
- ✅ Provide bank details for refund
- ✅ Track return status
- ✅ Receive refund within 7 days of approval

### For Admins:
- ✅ View all return requests
- ✅ Approve or reject returns
- ✅ Set refund amount
- ✅ Track 7-day refund deadline
- ✅ Process manual refunds
- ✅ Record transaction IDs
- ✅ View customer bank details
- ✅ Filter by status (requested, approved, completed)
- ✅ Export return data

---

## 📊 Return & Refund Workflow

### Step 1: Customer Requests Return
```
Customer → Submits return request with:
- Return reason
- Comments (optional)
- Images (optional)
- Bank details (for manual refund)
```

### Step 2: Admin Reviews Request
```
Admin → Reviews return request
      → Approves OR Rejects
```

### Step 3: Refund Deadline Set (If Approved)
```
System → Sets 7-day deadline from approval date
       → Calculates days remaining
       → Alerts admin when deadline approaches
```

### Step 4: Admin Processes Refund
```
Admin → Transfers money manually (bank/UPI/wallet)
      → Enters transaction ID
      → Marks refund as completed
```

### Step 5: Order Status Updated
```
System → Updates order status to "refunded"
       → Sends confirmation to customer
```

---

## 🗂️ Database Schema Changes

### Order Model Enhancements

Added `return_details` object with the following fields:

```javascript
return_details: {
  // Return Status
  is_return_requested: Boolean,
  return_status: 'none' | 'requested' | 'approved' | 'rejected' | 'received' | 'completed',
  return_reason: String,
  return_comments: String,
  return_requested_at: Date,
  return_approved_at: Date,
  return_approved_by: ObjectId (User),
  return_received_at: Date,
  return_images: [String], // URLs
  
  // Refund Information
  refund_status: 'none' | 'pending' | 'processing' | 'completed' | 'failed',
  refund_amount: Number,
  refund_method: 'original_payment' | 'bank_transfer' | 'wallet' | 'store_credit',
  refund_initiated_at: Date,
  refund_initiated_by: ObjectId (User),
  refund_completed_at: Date,
  refund_transaction_id: String,
  refund_notes: String,
  
  // Bank Details (for manual refund)
  bank_details: {
    account_holder_name: String,
    account_number: String,
    ifsc_code: String,
    bank_name: String,
    upi_id: String,
  },
  
  // Deadline Tracking
  refund_deadline: Date, // 7 days from approval
  days_remaining: Number,
}
```

### Order Status Values

Added new status values:
- `return_requested` - Customer requested return
- `returned` - Return approved, awaiting refund
- `refunded` - Refund completed

---

## 🔌 API Endpoints

### 1. Customer: Request Return

**Endpoint:** `POST /api/orders/return`

**Request Body:**
```json
{
  "orderId": "order_id_here",
  "return_reason": "Product damaged",
  "return_comments": "Box was damaged during shipping",
  "return_images": ["url1", "url2"],
  "bank_details": {
    "account_holder_name": "John Doe",
    "account_number": "1234567890",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "upi_id": "john@paytm"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Return request submitted successfully. We will review and process within 24 hours.",
  "data": { /* order object */ }
}
```

---

### 2. Admin: Get Return Requests

**Endpoint:** `GET /api/orders/refund?status=all`

**Query Parameters:**
- `status`: `all` | `requested` | `approved` | `rejected` | `completed`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "user": { "name": "John Doe", "email": "john@example.com" },
      "total": 1500,
      "return_details": {
        "return_status": "requested",
        "refund_status": "none",
        "return_reason": "Product damaged",
        "return_requested_at": "2025-11-27T10:00:00Z",
        "refund_deadline": "2025-12-04T10:00:00Z",
        "days_remaining": 7
      }
    }
  ],
  "count": 1
}
```

---

### 3. Admin: Approve/Reject Return

**Endpoint:** `POST /api/orders/refund`

**Request Body (Approve):**
```json
{
  "orderId": "order_id_here",
  "action": "approve",
  "refund_amount": 1500,
  "refund_notes": "Return approved. Refund will be processed within 7 days."
}
```

**Request Body (Reject):**
```json
{
  "orderId": "order_id_here",
  "action": "reject",
  "refund_notes": "Product is not eligible for return as per policy."
}
```

**Response (Approve):**
```json
{
  "success": true,
  "message": "Return approved. Refund of ₹1500 must be processed within 7 days.",
  "data": { /* order object */ },
  "refund_deadline": "2025-12-04T10:00:00Z"
}
```

---

### 4. Admin: Process Refund

**Endpoint:** `PUT /api/orders/refund`

**Request Body:**
```json
{
  "orderId": "order_id_here",
  "refund_transaction_id": "TXN123456789",
  "refund_method": "bank_transfer",
  "refund_notes": "Refund processed via NEFT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": { /* order object */ }
}
```

---

## 🖥️ Admin UI Features

### Dashboard View
- **Filter Tabs**: All, Requested, Approved, Completed
- **Table Columns**:
  - Order ID
  - Customer Name & Email
  - Order Amount
  - Return Status Badge
  - Refund Status Badge
  - Refund Deadline (with days remaining)
  - Actions (View Details)

### Order Details Modal
Shows:
- Order information
- Customer details
- Return reason and comments
- Customer bank details
- Timeline of events
- Action buttons based on status

### Actions Available:

#### For "Requested" Returns:
- **Approve Return** → Sets 7-day deadline
- **Reject Return** → Closes the request

#### For "Approved" Returns:
- **Process Refund** form with:
  - Refund method dropdown
  - Transaction ID input
  - Complete Refund button

#### For "Completed" Refunds:
- Shows completion details
- Transaction ID
- Completion timestamp

---

## 📅 7-Day Refund Policy Implementation

### Automatic Deadline Calculation
```javascript
// When admin approves return:
const refundDeadline = new Date();
refundDeadline.setDate(refundDeadline.getDate() + 7);
```

### Days Remaining Calculation
```javascript
const deadline = new Date(order.return_details.refund_deadline);
const now = new Date();
const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
```

### Visual Alerts
- **7-5 days**: Normal display
- **4-3 days**: Yellow warning
- **2-0 days**: Red alert with warning icon

---

## 🎨 UI Design

### Color Coding

**Return Status Badges:**
- 🟡 Requested - Yellow
- 🔵 Approved - Blue
- 🔴 Rejected - Red
- 🟢 Completed - Green

**Refund Status Badges:**
- ⚪ Not Started - Gray
- 🟡 Pending - Yellow
- 🔵 Processing - Blue
- 🟢 Completed - Green
- 🔴 Failed - Red

### Responsive Design
- Mobile-friendly table
- Modal adapts to screen size
- Touch-friendly buttons
- Smooth animations

---

## 🔐 Security & Access Control

### Authentication
- All endpoints require authentication via `verifyTokenAndUser`
- Customer can only request returns for their own orders
- Admin access required for approval/processing

### Role-Based Access
```javascript
// Admin check
if (user.isSuperAdmin || role.name === 'admin') {
  // Allow access
}
```

### Data Validation
- Order ID validation
- Return reason required
- Transaction ID required for completion
- Amount validation

---

## 📱 Customer Experience

### Return Request Form (To be built)
```jsx
<form onSubmit={handleReturnRequest}>
  <select name="return_reason" required>
    <option>Product damaged</option>
    <option>Wrong product delivered</option>
    <option>Product not as described</option>
    <option>Changed mind</option>
    <option>Other</option>
  </select>
  
  <textarea name="return_comments" placeholder="Additional comments" />
  
  <input type="file" multiple accept="image/*" />
  
  <h3>Bank Details for Refund</h3>
  <input name="account_holder_name" required />
  <input name="account_number" required />
  <input name="ifsc_code" required />
  <input name="bank_name" required />
  <input name="upi_id" placeholder="Optional" />
  
  <button type="submit">Submit Return Request</button>
</form>
```

---

## 🚀 Usage Guide

### For Admins:

1. **Access the Dashboard**
   - Navigate to `/admin/refunds`
   - View all return requests

2. **Review Return Request**
   - Click "View" icon on any request
   - Review customer details and reason
   - Check bank details

3. **Approve Return**
   - Click "Approve Return" button
   - System sets 7-day deadline automatically
   - Customer is notified

4. **Process Refund Manually**
   - Transfer money via bank/UPI/wallet
   - Enter transaction ID in the form
   - Select refund method
   - Click "Complete Refund"
   - System marks as completed

5. **Monitor Deadlines**
   - Check "Days Remaining" column
   - Prioritize requests with <3 days
   - Red alerts for urgent refunds

---

## 📊 Sample Workflow

### Example: Customer Returns Damaged Product

**Day 0 - Customer Requests Return:**
```
Customer submits return request
→ Status: return_requested
→ Refund Status: none
```

**Day 1 - Admin Approves:**
```
Admin approves return
→ Status: returned
→ Refund Status: pending
→ Deadline: Day 8
→ Days Remaining: 7
```

**Day 5 - Admin Processes Refund:**
```
Admin transfers ₹1500 to customer's bank
Admin enters transaction ID: TXN123456
→ Refund Status: completed
→ Status: refunded
→ Customer receives confirmation
```

---

## 🔔 Notifications (To be implemented)

### Email Notifications:
1. **Customer - Return Requested**
   - "Your return request has been received"
   
2. **Admin - New Return Request**
   - "New return request from [Customer Name]"
   
3. **Customer - Return Approved**
   - "Your return has been approved. Refund will be processed within 7 days."
   
4. **Admin - Deadline Alert**
   - "Refund deadline approaching for Order #[ID] - 2 days remaining"
   
5. **Customer - Refund Completed**
   - "Your refund of ₹[Amount] has been processed. Transaction ID: [TXN_ID]"

---

## 📈 Future Enhancements

1. **Automated Refunds** - Integration with payment gateways
2. **Return Shipping Labels** - Generate return shipping labels
3. **Quality Check** - Add QC step before refund
4. **Partial Refunds** - Support for partial amount refunds
5. **Refund Analytics** - Dashboard with refund metrics
6. **Customer Portal** - Self-service return tracking
7. **SMS Notifications** - Real-time SMS updates
8. **Refund Reports** - Export detailed refund reports

---

## 🐛 Troubleshooting

### Common Issues:

**1. Return request fails**
- Check if order status is 'completed' or 'shipped'
- Verify user owns the order
- Check if return already requested

**2. Approval fails**
- Verify admin permissions
- Check if order is in correct status

**3. Refund completion fails**
- Ensure transaction ID is provided
- Verify return is approved
- Check refund status

---

## 📝 Files Created

1. ✅ `src/app/lib/models/Order.js` - Enhanced with return_details
2. ✅ `src/app/api/orders/return/route.js` - Customer return request API
3. ✅ `src/app/api/orders/refund/route.js` - Admin refund management API
4. ✅ `src/components/admin/RefundManagement.jsx` - Admin UI
5. ✅ `src/app/admin/refunds/page.jsx` - Admin page route

---

## ✅ Summary

You now have a complete **manual refund processing system** with:
- ✅ 7-day refund policy enforcement
- ✅ Customer return request functionality
- ✅ Admin approval/rejection workflow
- ✅ Manual refund processing with transaction tracking
- ✅ Deadline monitoring with visual alerts
- ✅ Bank details collection for manual transfers
- ✅ Beautiful, responsive admin UI
- ✅ Comprehensive status tracking

**Access the admin panel at:** `/admin/refunds`

---

**Built for D&D E-commerce Platform** 🎉
