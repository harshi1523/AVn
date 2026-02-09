# User Acceptance Testing (UAT) Scripts
## SB Tech Solution - E-Commerce & Rental Platform

---

## Test Script $$

$$
- **Application**: SB Tech Solution
- **Version**: 1.0
- **Test Type**: User Acceptance Testing (UAT)
- **Total Test Cases**: 50
- **Date**: February 07, 2026

---

## 1. AUTHENTICATION & PROFILE MANAGEMENT (Test Cases 1-8)

### TC-001: User Registration with Email/Password (Positive)
**Objective**: Verify that a new user can successfully register using email and password  
**Preconditions**: User is not registered  
**Test Steps**:
1. Navigate to Sign Up page
2. Enter valid email address
3. Enter strong password (min 8 characters with uppercase, lowercase, number)
4. Click "Sign Up" button
5. Verify email verification prompt (if applicable)

**Expected Result**: 
- User account is created successfully
- User is redirected to dashboard/home page
- Welcome message is displayed

**Test Data**: 
- Email: testuser@example.com
- Password: Test@1234

---

### TC-002: User Registration with Google Authentication (Positive)
**Objective**: Verify Google OAuth integration for sign-up  
**Preconditions**: Valid Google account exists  
**Test Steps**:
1. Navigate to Sign Up page
2. Click "Sign up with Google" button
3. Select Google account
4. Grant permissions

**Expected Result**: 
- User is authenticated via Google
- Account is created automatically
- User is redirected to dashboard

**Test Data**: Valid Google credentials

---

### TC-003: Login with Invalid Credentials (Negative)
**Objective**: Verify system handles incorrect login credentials  
**Preconditions**: User account exists  
**Test Steps**:
1. Navigate to Login page
2. Enter valid email
3. Enter incorrect password
4. Click "Login" button

**Expected Result**: 
- Error message displayed: "Invalid email or password"
- User remains on login page
- No access granted

**Test Data**: 
- Email: testuser@example.com
- Password: WrongPass123

---

### TC-004: Login with Empty Fields (Negative)
**Objective**: Verify validation for empty login fields  
**Preconditions**: None  
**Test Steps**:
1. Navigate to Login page
2. Leave email field empty
3. Leave password field empty
4. Click "Login" button

**Expected Result**: 
- Validation error messages displayed
- "Email is required"
- "Password is required"
- Login button remains inactive or shows errors

---

### TC-005: Add Multiple Delivery Addresses (Positive)
**Objective**: Verify user can add multiple delivery addresses  
**Preconditions**: User is logged in  
**Test Steps**:
1. Navigate to Profile > Address Management
2. Click "Add New Address"
3. Enter complete address details (Street, City, State, ZIP, Phone)
4. Save address
5. Repeat steps 2-4 to add second address

**Expected Result**: 
- Both addresses are saved successfully
- Addresses appear in the address list
- User can view all saved addresses

**Test Data**: 
- Address 1: Home address with all fields
- Address 2: Office address with all fields

---

### TC-006: Set Default Delivery Address (Positive)
**Objective**: Verify user can set a default delivery address  
**Preconditions**: User has at least 2 saved addresses  
**Test Steps**:
1. Navigate to Profile > Address Management
2. Select an address
3. Click "Set as Default" checkbox/button
4. Save changes

**Expected Result**: 
- Selected address is marked as default
- Default indicator (star/badge) appears on the address
- This address is pre-selected during checkout

---

### TC-007: Update Profile Information (Positive)
**Objective**: Verify user can update personal details  
**Preconditions**: User is logged in  
**Test Steps**:
1. Navigate to Profile page
2. Update Name field
3. Click "Save Changes" button

**Expected Result**: 
- Success message displayed
- Updated information is reflected immediately
- Changes persist after logout/login

**Test Data**: 
- New Name: John Updated Doe

---

### TC-008: Rental Preferences Onboarding (Positive)
**Objective**: Verify rental users can set payment preferences  
**Preconditions**: New rental user account  
**Test Steps**:
1. Navigate to Rental Preferences/Onboarding
2. Select payment method (Card/UPI/Net Banking)
3. Enter payment details (if required)
4. Save preferences

**Expected Result**: 
- Payment preferences are saved
- Confirmation message displayed
- Preferences are used during rental checkout

**Test Data**: Payment method: UPI

---

## 2. PRODUCT DISCOVERY (Test Cases 9-15)

### TC-009: Browse Product Catalog (Positive)
**Objective**: Verify users can view all available products  
**Preconditions**: Products exist in the system  
**Test Steps**:
1. Navigate to Products/Catalog page
2. Observe product listings

**Expected Result**: 
- All available products are displayed
- Each product shows image, name, and price
- Products are properly formatted and aligned

---

### TC-010: Filter Products by Category (Positive)
**Objective**: Verify category filtering functionality  
**Preconditions**: Products with different categories exist  
**Test Steps**:
1. Navigate to Products page
2. Select "Laptop" from Category filter
3. Observe results
4. Change to "Desktop" category
5. Observe results

**Expected Result**: 
- Only laptops are shown after selecting Laptop category
- Only desktops are shown after selecting Desktop category
- Product count updates accordingly
- Other categories are hidden

**Test Data**: Categories: Laptop, Desktop, Monitor

---

### TC-011: Filter Products by Brand (Positive)
**Objective**: Verify brand filtering functionality  
**Preconditions**: Products with different brands exist  
**Test Steps**:
1. Navigate to Products page
2. Select "Apple" from Brand filter
3. Observe results
4. Change to "Dell" brand
5. Observe results

**Expected Result**: 
- Only Apple products displayed after selecting Apple
- Only Dell products displayed after selecting Dell
- Filter can be cleared to show all products

**Test Data**: Brands: Apple, Dell, HP

---

### TC-012: Combine Multiple Filters (Positive)
**Objective**: Verify multiple filters work together  
**Preconditions**: Products exist with various categories and brands  
**Test Steps**:
1. Navigate to Products page
2. Select Category: "Laptop"
3. Select Brand: "Apple"
4. Observe results

**Expected Result**: 
- Only Apple Laptops are displayed
- Products matching both criteria are shown
- Filter count is accurate

---

### TC-013: View Product Details (Positive)
**Objective**: Verify product detail page displays all information  
**Preconditions**: Products exist in catalog  
**Test Steps**:
1. Navigate to Products page
2. Click on a product card
3. Observe product details page

**Expected Result**: 
- Product detail page opens
- Displays: Name, Price, Description, Specifications
- Shows high-quality images
- Displays specific features (e.g., "M3 Chip")
- Shows stock status

---

### TC-014: Quick View Product (Positive)
**Objective**: Verify Quick View modal functionality  
**Preconditions**: Products exist in catalog  
**Test Steps**:
1. Navigate to Products page
2. Click "Quick View" icon/button on a product
3. Observe modal popup
4. Close modal

**Expected Result**: 
- Modal popup appears without page navigation
- Shows key product information
- User remains on product listing page after closing
- Modal has close button/functionality

---

### TC-015: Search Products with No Results (Edge Case)
**Objective**: Verify behavior when no products match filters  
**Preconditions**: Limited product inventory  
**Test Steps**:
1. Navigate to Products page
2. Apply filter combination that yields no results (e.g., Category: Monitor, Brand: Apple - if no such product exists)

**Expected Result**: 
- "No products found" message is displayed
- Suggestion to clear filters or browse all products
- Page doesn't break or show errors

---

## 3. SHOPPING CART & CHECKOUT (Test Cases 16-27)

### TC-016: Add Product to Cart for Purchase (Positive)
**Objective**: Verify user can add product to cart in Buy mode  
**Preconditions**: User is logged in, products available  
**Test Steps**:
1. Navigate to Products page
2. Select a product
3. Choose "Buy" option
4. Click "Add to Cart"
5. Navigate to Cart

**Expected Result**: 
- Product is added to cart
- Cart icon shows updated count
- Product appears in cart with correct price
- Buy mode is indicated

**Test Data**: Product: MacBook Pro M3

---

### TC-017: Add Product to Cart for Rental (Positive)
**Objective**: Verify user can add product to cart in Rent mode  
**Preconditions**: User is logged in, products available  
**Test Steps**:
1. Navigate to Products page
2. Select a product
3. Choose "Rent" option
4. Select rental tenure (e.g., 12 months)
5. Click "Add to Cart"
6. Navigate to Cart

**Expected Result**: 
- Product is added to cart as rental
- Rental tenure is displayed
- Monthly rental price is shown
- Total rental cost is calculated

**Test Data**: 
- Product: Dell XPS 15
- Tenure: 12 months

---

### TC-018: Select Rental Tenure (Positive)
**Objective**: Verify all rental tenure options are available  
**Preconditions**: Product in cart as rental  
**Test Steps**:
1. Add rental product to cart
2. View cart
3. Test changing tenure: 3, 6, 12, 18, 24 months
4. Observe price updates

**Expected Result**: 
- All tenure options (3, 6, 12, 18, 24 months) are available
- Monthly price updates when tenure changes
- Total cost recalculates automatically

---

### TC-019: Remove Item from Cart (Positive)
**Objective**: Verify user can remove items from cart  
**Preconditions**: Cart has at least one item  
**Test Steps**:
1. Navigate to Cart
2. Click "Remove" button on an item
3. Confirm removal (if confirmation dialog appears)

**Expected Result**: 
- Item is removed from cart
- Cart total updates
- Cart count decreases
- If cart is empty, "Cart is empty" message appears

---

### TC-020: Checkout with Home Delivery (Positive)
**Objective**: Verify checkout process with home delivery  
**Preconditions**: Cart has items, user has saved address  
**Test Steps**:
1. Navigate to Cart
2. Click "Proceed to Checkout"
3. Select "Home Delivery"
4. Select delivery address
5. Select payment method
6. Review order summary
7. Click "Place Order"

**Expected Result**: 
- Delivery address selection is available
- Order summary shows correct items and total
- Order is placed successfully
- Order confirmation page/message appears

---

### TC-021: Checkout with Self Pickup (Positive)
**Objective**: Verify checkout process with self pickup  
**Preconditions**: Cart has items  
**Test Steps**:
1. Navigate to Cart
2. Click "Proceed to Checkout"
3. Select "Self Pickup"
4. Select payment method
5. Review order summary
6. Click "Place Order"

**Expected Result**: 
- No address selection required
- Pickup location/instructions displayed
- Order is placed successfully
- Pickup confirmation shown

---

### TC-022: Checkout without Selecting Address (Negative)
**Objective**: Verify validation when no address is selected  
**Preconditions**: Cart has items, Home Delivery selected  
**Test Steps**:
1. Navigate to Checkout
2. Select "Home Delivery"
3. Do not select any address
4. Attempt to proceed

**Expected Result**: 
- Validation error: "Please select a delivery address"
- User cannot proceed to payment
- Address selection is highlighted

---

### TC-023: Rental Checkout with KYC Not Completed (Business Rule)
**Objective**: Verify KYC enforcement for rental orders  
**Preconditions**: Cart has rental item, KYC not completed  
**Test Steps**:
1. Add rental item to cart
2. Proceed to checkout
3. Observe KYC check

**Expected Result**: 
- Warning/prompt to complete KYC appears
- User is redirected to KYC submission page
- Cannot complete rental checkout without KYC (Note: Currently bypassable for testing - document if bypass is allowed)

---

### TC-024: Rental Checkout with Approved KYC (Positive)
**Objective**: Verify rental checkout with verified KYC  
**Preconditions**: Cart has rental item, KYC approved  
**Test Steps**:
1. Add rental item to cart
2. Proceed to checkout
3. Complete checkout process

**Expected Result**: 
- No KYC warnings appear
- Checkout proceeds smoothly
- Rental agreement terms displayed (if applicable)
- Order placed successfully with deposit information

---

### TC-025: Payment Method Selection (Positive)
**Objective**: Verify all payment methods are available  
**Preconditions**: At checkout stage  
**Test Steps**:
1. Proceed to payment step
2. Verify available payment methods: Card, Net Banking, UPI
3. Select each method and observe

**Expected Result**: 
- All three payment methods are displayed
- Each method is selectable
- Appropriate payment fields/redirects appear for each method

---

### TC-026: Order Confirmation with Total Cost Display (Positive)
**Objective**: Verify order summary shows correct total  
**Preconditions**: Items in cart, at final checkout step  
**Test Steps**:
1. Review order summary before placing order
2. Verify item prices
3. Verify deposit amount (for rentals)
4. Verify total cost

**Expected Result**: 
- All items listed with individual prices
- Rental deposit clearly shown (if applicable)
- Subtotal, taxes (if any), and grand total displayed
- All calculations are correct

---

### TC-027: Empty Cart Checkout Attempt (Negative)
**Objective**: Verify system prevents checkout with empty cart  
**Preconditions**: Cart is empty  
**Test Steps**:
1. Clear all items from cart
2. Attempt to access checkout page directly

**Expected Result**: 
- "Your cart is empty" message displayed
- Checkout button is disabled or hidden
- User is prompted to browse products

---

## 4. CUSTOMER DASHBOARD & ORDER MANAGEMENT (Test Cases 28-35)

### TC-028: View Active Rentals (Positive)
**Objective**: Verify customer can view active rental subscriptions  
**Preconditions**: User has at least one active rental  
**Test Steps**:
1. Login as customer with active rentals
2. Navigate to Dashboard > My Rentals
3. Observe rental details

**Expected Result**: 
- All active rentals are listed
- Each rental shows: Product name, Monthly price, Tenure, Start date
- Rental status is clearly indicated

---

### TC-029: View Order History (Positive)
**Objective**: Verify customer can view past orders  
**Preconditions**: User has placed orders  
**Test Steps**:
1. Navigate to Dashboard > Order History
2. Observe order list

**Expected Result**: 
- All past orders (Buy and Rent) are listed
- Each order shows: Order ID, Date, Status, Total cost
- Orders are sorted by date (newest first)

---

### TC-030: Download Invoice (Positive)
**Objective**: Verify customer can download order invoices  
**Preconditions**: User has completed orders  
**Test Steps**:
1. Navigate to Order History
2. Select an order
3. Click "Download Invoice" button

**Expected Result**: 
- Invoice PDF downloads successfully
- Invoice contains: Order details, Items, Prices, Customer info, Company info
- Invoice is properly formatted

---

### TC-031: Create Support Ticket (Positive)
**Objective**: Verify customer can create support tickets  
**Preconditions**: User is logged in  
**Test Steps**:
1. Navigate to Dashboard > Support
2. Click "Create Ticket"
3. Enter ticket subject
4. Enter ticket description
5. Submit ticket

**Expected Result**: 
- Ticket is created successfully
- Ticket ID is generated
- Success message displayed
- Ticket appears in support ticket list

**Test Data**: 
- Subject: "Product delivery delay"
- Description: "My order #12345 is delayed"

---

### TC-032: View Support Ticket Status (Positive)
**Objective**: Verify customer can track support ticket status  
**Preconditions**: User has created support tickets  
**Test Steps**:
1. Navigate to Dashboard > Support
2. View support ticket list
3. Click on a ticket to view details

**Expected Result**: 
- All tickets are listed with status (Open, In Progress, Resolved)
- Ticket details show submission date and current status
- Status updates are reflected in real-time

---

### TC-033: Submit KYC Documents (Positive)
**Objective**: Verify customer can upload KYC documents  
**Preconditions**: User is logged in, KYC not submitted  
**Test Steps**:
1. Navigate to Dashboard > KYC Status
2. Click "Upload Documents"
3. Upload ID Proof Front image
4. Upload ID Proof Back image
5. Submit for verification

**Expected Result**: 
- Both images upload successfully
- Supported formats: JPG, PNG, PDF
- KYC status changes to "Pending"
- Confirmation message displayed

**Test Data**: Valid ID card images (front and back)

---

### TC-034: View KYC Status - Real-time Tracking (Positive)
**Objective**: Verify customer can track KYC verification status  
**Preconditions**: KYC submitted  
**Test Steps**:
1. Navigate to Dashboard > KYC Status
2. Observe current status

**Expected Result**: 
- Current status is displayed: Not Submitted, Pending, Approved, or Rejected
- Status updates in real-time (when admin approves/rejects)
- Timestamp of last update shown

---

### TC-035: View KYC Rejection Reason (Positive)
**Objective**: Verify customer receives feedback on KYC rejection  
**Preconditions**: Admin has rejected KYC with reason  
**Test Steps**:
1. Navigate to Dashboard > KYC Status
2. View rejection details

**Expected Result**: 
- Status shows "Rejected"
- Rejection reason provided by admin is displayed
- Option to resubmit documents is available

**Test Data**: Rejection reason example: "Document image is blurry"

---

## 5. ADMIN DASHBOARD & ANALYTICS (Test Cases 36-40)

### TC-036: View Admin Dashboard Analytics (Positive)
**Objective**: Verify admin can view key business metrics  
**Preconditions**: Admin is logged in  
**Test Steps**:
1. Login as Admin
2. Navigate to Admin Dashboard
3. Observe analytics section

**Expected Result**: 
- Key metrics displayed: Total Revenue, Monthly Growth %, Active Rentals count, Open Support Tickets
- Numbers are accurate and updated
- Metrics are clearly labeled

---

### TC-037: View Sales Growth Graph (Positive)
**Objective**: Verify sales visualization is functional  
**Preconditions**: Sales data exists, Admin logged in  
**Test Steps**:
1. Navigate to Admin Dashboard
2. Locate Sales Graph
3. Observe graph display

**Expected Result**: 
- Graph displays sales data over time
- X-axis shows time period (days/months)
- Y-axis shows revenue
- Data points are accurate
- Graph is interactive (hover shows values)

---

### TC-038: Access Admin Panel with Customer Account (Negative)
**Objective**: Verify admin routes are protected  
**Preconditions**: Customer account exists  
**Test Steps**:
1. Login as Customer
2. Attempt to access admin URL directly (e.g., /admin/dashboard)

**Expected Result**: 
- Access denied message displayed
- User is redirected to customer dashboard or login
- Admin functionalities are not accessible

---

### TC-039: Admin Dashboard Real-time Updates (Positive)
**Objective**: Verify dashboard metrics update in real-time  
**Preconditions**: Admin dashboard is open  
**Test Steps**:
1. Open admin dashboard
2. Simulate a new order being placed (in another session/user)
3. Observe dashboard metrics

**Expected Result**: 
- Total Revenue updates without page refresh
- Active Rentals count updates (if rental order)
- Updates occur within seconds (Firestore real-time sync)

---

### TC-040: Filter Dashboard by Date Range (Positive)
**Objective**: Verify admin can filter analytics by date  
**Preconditions**: Admin logged in, historical data exists  
**Test Steps**:
1. Navigate to Admin Dashboard
2. Select date range filter (e.g., Last 7 days, Last 30 days, Custom)
3. Apply filter

**Expected Result**: 
- Metrics update to show data for selected period
- Sales graph adjusts to date range
- Filter selection is clearly indicated

---

## 6. ADMIN INVENTORY MANAGEMENT (Test Cases 41-45)

### TC-041: Add New Product (Positive)
**Objective**: Verify admin can add products to catalog  
**Preconditions**: Admin is logged in  
**Test Steps**:
1. Navigate to Admin > Inventory > Add Product
2. Enter product details: Name, Price, Brand, Category
3. Add dynamic features (Title: "Processor", Description: "M3 Chip")
4. Upload product images
5. Set stock status (Available)
6. Save product

**Expected Result**: 
- Product is created successfully
- Product appears in inventory list
- All entered details are saved correctly
- Images are uploaded and displayed

**Test Data**: 
- Name: MacBook Air M3
- Price: 1299
- Brand: Apple
- Category: Laptop

---

### TC-042: Edit Existing Product (Positive)
**Objective**: Verify admin can update product information  
**Preconditions**: Product exists in inventory  
**Test Steps**:
1. Navigate to Admin > Inventory
2. Select a product
3. Click "Edit"
4. Modify price and description
5. Save changes

**Expected Result**: 
- Changes are saved successfully
- Updated information reflects immediately in customer catalog
- Edit history/timestamp recorded (if applicable)

---

### TC-043: Add Product Features Dynamically (Positive)
**Objective**: Verify admin can add multiple features to products  
**Preconditions**: In product edit/add mode  
**Test Steps**:
1. Navigate to Features section
2. Add Feature 1: Title: "Display", Description: "14-inch Retina"
3. Add Feature 2: Title: "Memory", Description: "16GB RAM"
4. Add Feature 3: Title: "Storage", Description: "512GB SSD"
5. Save product

**Expected Result**: 
- All features are saved
- Features appear in correct order
- Features display on product detail page
- Admin can add unlimited features

---

### TC-044: Delete Product (Positive)
**Objective**: Verify admin can remove products from catalog  
**Preconditions**: Product exists in inventory  
**Test Steps**:
1. Navigate to Admin > Inventory
2. Select a product
3. Click "Delete" button
4. Confirm deletion

**Expected Result**: 
- Confirmation dialog appears
- Product is removed from inventory
- Product no longer appears in customer catalog
- Deletion is permanent (or archived, based on design)

---

### TC-045: Update Stock Status (Positive)
**Objective**: Verify admin can change product stock status  
**Preconditions**: Product exists  
**Test Steps**:
1. Navigate to Admin > Inventory
2. Select a product
3. Change stock status: Available → Low Stock → Rented
4. Save changes

**Expected Result**: 
- Stock status updates successfully
- Status is reflected in customer catalog
- Products marked "Rented" cannot be added to cart
- Low Stock shows warning indicator

---

## 7. ADMIN ORDER & USER MANAGEMENT (Test Cases 46-50)

### TC-046: View All Orders (Positive)
**Objective**: Verify admin can view all customer orders  
**Preconditions**: Orders exist in system, Admin logged in  
**Test Steps**:
1. Navigate to Admin > Orders
2. Observe order list

**Expected Result**: 
- All orders are displayed
- Each order shows: Order ID, Customer name, Status, Total amount, Date
- Orders are sortable/filterable

---

### TC-047: Update Order Status (Positive)
**Objective**: Verify admin can update order workflow status  
**Preconditions**: Order exists with status "Pending"  
**Test Steps**:
1. Navigate to Admin > Orders
2. Select an order
3. Update status: Pending → Shipped → Delivered
4. Save status

**Expected Result**: 
- Status updates successfully
- Customer sees updated status in their dashboard (real-time)
- Status change timestamp is recorded
- Customer receives notification (if applicable)

---

### TC-048: Approve KYC Request (Positive)
**Objective**: Verify admin can approve customer KYC  
**Preconditions**: Customer has submitted KYC (Pending status)  
**Test Steps**:
1. Navigate to Admin > Users > KYC Review
2. Filter users with "Pending" verification
3. Select a user
4. View uploaded documents (Front and Back ID)
5. Click "Approve"

**Expected Result**: 
- User KYC status changes to "Approved" immediately
- User can now complete rental checkouts
- Update reflects in customer dashboard in real-time
- Admin action is logged

---

### TC-049: Reject KYC Request with Reason (Positive)
**Objective**: Verify admin can reject KYC with feedback  
**Preconditions**: Customer has submitted KYC (Pending status)  
**Test Steps**:
1. Navigate to Admin > Users > KYC Review
2. Select a pending KYC request
3. Click "Reject"
4. Enter rejection reason: "Document is expired"
5. Submit rejection

**Expected Result**: 
- User KYC status changes to "Rejected"
- Rejection reason is stored
- Customer sees rejection reason in their dashboard
- Customer can resubmit documents

**Test Data**: Rejection reason: "Document is expired"

---

### TC-050: View User Directory (Positive)
**Objective**: Verify admin can view all registered users  
**Preconditions**: Multiple users registered, Admin logged in  
**Test Steps**:
1. Navigate to Admin > Users
2. Observe user list

**Expected Result**: 
- All registered users are listed
- Each user shows: Name, Email, Role (Customer/Admin), Registration date
- Admin can search/filter users
- User KYC status is visible

---

## TEST EXECUTION SUMMARY

### Test Coverage Matrix

| Feature Area | Test Cases | Positive | Negative | Edge Cases |
|--------------|------------|----------|----------|------------|
| Authentication & Profile | TC-001 to TC-008 | 6 | 2 | 0 |
| Product Discovery | TC-009 to TC-015 | 5 | 0 | 2 |
| Shopping Cart & Checkout | TC-016 to TC-027 | 9 | 3 | 0 |
| Customer Dashboard | TC-028 to TC-035 | 8 | 0 | 0 |
| Admin Dashboard | TC-036 to TC-040 | 4 | 1 | 0 |
| Admin Inventory | TC-041 to TC-045 | 5 | 0 | 0 |
| Admin Order & User Mgmt | TC-046 to TC-050 | 5 | 0 | 0 |
| **TOTAL** | **50** | **42** | **6** | **2** |

### Testing Notes

1. **Real-time Testing**: Test cases TC-032, TC-034, TC-039, TC-047, and TC-048 require verification of Firestore real-time synchronization. Use multiple browser sessions/devices to verify instant updates.

2. **KYC Bypass**: TC-023 notes that KYC is currently bypassable for testing purposes. Document actual behavior during testing.

3. **Payment Integration**: Payment method tests (TC-025) may require sandbox/test payment gateway credentials.

4. **File Upload**: KYC document upload (TC-033) should test file size limits and format validation.

5. **Security Testing**: TC-038 verifies admin route protection - additional security testing may be needed for production readiness.

### Recommended Additional Testing

- **Performance Testing**: Load testing with multiple concurrent users
- **Security Testing**: Penetration testing, XSS, SQL injection attempts
- **Mobile Responsiveness**: All test cases should be executed on mobile devices
- **Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge
- **Accessibility**: WCAG compliance testing for screen readers and keyboard navigation

---

## Test Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Development Lead | | | |
| Business Stakeholder | | | |

---

**End of UAT Test Scripts**
