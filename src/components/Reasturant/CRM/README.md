# Customer Relationship Management (CRM) Module

## Overview
Complete CRM system for Shinepos restaurant management with customer database, loyalty programs, order history tracking, feedback management, and marketing campaigns.

## Features Implemented

### ✅ 1. Customer Database
**File:** `CustomerDatabase.jsx`
- Add, edit, and delete customers
- Search by name, phone, or email
- Track total orders and spending per customer
- Store customer contact information and addresses

### ✅ 2. Loyalty & Rewards Program
**File:** `LoyaltyProgram.jsx`
- Automatic points calculation based on spending
- 4-tier system: Bronze, Silver, Gold, Platinum
- Configurable points earning rate (points per ₹1)
- Configurable redemption rate (points needed for ₹1 discount)
- Track points issued and redeemed
- Visual tier badges with icons

### ✅ 3. Customer Order History
**File:** `OrderHistory.jsx`
- View complete order history per customer
- Order details including items, quantities, and amounts
- Order status tracking
- Date-wise order listing
- Customer spending analytics

### ✅ 4. Feedback & Review System
**File:** `FeedbackReviews.jsx`
- 5-star rating system
- Customer comments and feedback
- Filter by positive/negative reviews
- Average rating calculation
- Mark reviews as resolved/pending
- Link reviews to specific orders

### ✅ 5. Marketing Campaigns (SMS/Email)
**File:** `MarketingCampaigns.jsx`
- Create email and SMS campaigns
- Target audience segmentation:
  - All customers
  - VIP customers (by spending threshold)
  - Frequent customers (by order count)
- Campaign scheduling and tracking
- Track sent count and reach
- Campaign status management (draft/scheduled/sent)

## Backend API Endpoints Required

### Customer Management
```
GET    /api/customers              - Get all customers
POST   /api/customers              - Create new customer
PUT    /api/customers/:id          - Update customer
DELETE /api/customers/:id          - Delete customer
GET    /api/customers/:id/orders   - Get customer order history
```

### Loyalty Program
```
GET    /api/customers/loyalty      - Get customers with loyalty data
GET    /api/loyalty/settings       - Get loyalty settings
PUT    /api/loyalty/settings       - Update loyalty settings
```

### Reviews & Feedback
```
GET    /api/reviews                - Get all reviews
POST   /api/reviews                - Create new review
PATCH  /api/reviews/:id            - Update review status
```

### Marketing Campaigns
```
GET    /api/campaigns              - Get all campaigns
POST   /api/campaigns              - Create new campaign
POST   /api/campaigns/:id/send     - Send campaign
```

## Database Schema Suggestions

### Customer Model
```javascript
{
  name: String,
  phone: String,
  email: String,
  address: String,
  totalOrders: Number,
  totalSpent: Number,
  loyaltyPoints: Number,
  redeemedPoints: Number,
  restaurantId: ObjectId,
  createdAt: Date
}
```

### Review Model
```javascript
{
  customerId: ObjectId,
  customerName: String,
  rating: Number (1-5),
  comment: String,
  orderNumber: String,
  status: String (pending/resolved),
  restaurantId: ObjectId,
  createdAt: Date
}
```

### Campaign Model
```javascript
{
  name: String,
  type: String (email/sms),
  subject: String,
  message: String,
  targetAudience: String (all/vip/frequent),
  minSpent: Number,
  minOrders: Number,
  status: String (draft/scheduled/sent),
  sentCount: Number,
  restaurantId: ObjectId,
  createdAt: Date
}
```

### Loyalty Settings Model
```javascript
{
  restaurantId: ObjectId,
  pointsPerRupee: Number,
  redeemRate: Number
}
```

## Integration Steps

1. **Sidebar Integration** ✅
   - Added CRM menu item with icon in RestaurantSidebar.jsx

2. **Dashboard Integration** ✅
   - Added CRM component to RestaurantDashboard.jsx
   - Added background image for CRM page

3. **Role Permissions** ✅
   - Added CRM access to RESTAURANT_ADMIN and MANAGER roles

4. **Backend Setup** (Required)
   - Implement the API endpoints listed above
   - Create database models
   - Add authentication middleware
   - Implement email/SMS sending service integration

## Usage

### Accessing CRM
1. Login as RESTAURANT_ADMIN or MANAGER
2. Click on "CRM" in the sidebar
3. Navigate through tabs: Customers, Loyalty, History, Feedback, Marketing

### Adding Customers
1. Go to Customers tab
2. Click "Add Customer"
3. Fill in customer details
4. Save

### Setting Up Loyalty Program
1. Go to Loyalty Program tab
2. Click "Settings"
3. Configure points per rupee and redemption rate
4. Save settings

### Creating Marketing Campaigns
1. Go to Marketing tab
2. Click "Create Campaign"
3. Choose email or SMS
4. Write message and select target audience
5. Send immediately or save as draft

## Styling
- Uses Tailwind CSS for styling
- Glassmorphism design consistent with existing UI
- Responsive design for mobile and desktop
- Dark theme with gradient accents

## Dependencies
All dependencies already exist in package.json:
- react
- react-icons
- axios
- framer-motion

## Next Steps for Backend Developer

1. Create database models for Customer, Review, Campaign, LoyaltySettings
2. Implement REST API endpoints
3. Add customer tracking to existing order system
4. Integrate SMS gateway (e.g., Twilio, AWS SNS)
5. Integrate email service (e.g., SendGrid, AWS SES)
6. Add automatic loyalty points calculation on order completion
7. Create webhook for order completion to update customer stats

## Notes
- All components use the existing API URL from .env (VITE_API_URL)
- Authentication uses existing token from localStorage
- Components follow the existing code structure and patterns
- Error handling included with console.error for debugging
