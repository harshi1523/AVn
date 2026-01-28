# Product Requirements Document (PRD) - SB Tech Solution

## 1. Introduction
sb-tech (2) is a full-stack e-commerce and rental platform for technology products (Laptops, Desktops, Monitors, etc.). The platform supports two primary user roles: **Customers** (who browse, rent, and buy products) and **Admins** (who manage inventory, orders, and users). The system utilizes Firebase/Firestore for real-time data and authentication.

## 2. User Roles
-   **Customer**: End-users who can sign up, browse the catalog, purchase/rent items, manage their profile, and track orders.
-   **Admin**: Platform managers with elevated privileges to manage the business operations.

## 3. Customer Functional Requirements

### 3.1. Authentication & Profile
-   **Sign Up / Login**: Users can create accounts using Email/Password or Google Authentication.
-   **Profile Management**:
    -   View personal details (Name, Email).
    -   **Address Management**: Add multiple delivery addresses; set a default address.
    -   **Rental Preferences**: detailed setup for rental users (Onboarding) including payment preferences (Card, UPI, Net Banking).

### 3.2. Product Discovery
-   **Catalog Browsing**: View a list of available technology products.
-   **Filtering**: Filter products by Category (Laptop, Desktop, etc.) and Brand (Apple, Dell, etc.).
-   **Product Details**: View detailed specifications, high-quality images, and specific features (e.g., "M3 Chip").
-   **Quick View**: Modal popup for fast product inspection without leaving the listing.

### 3.3. Shopping Cart & Checkout
-   **Cart Management**:
    -   Add products to cart (Support for both "Rent" and "Buy" modes).
    -   Select Rental Tenure (3, 6, 12, 18, 24 months) for rental items.
    -   Remove items from cart.
-   **Checkout Process**:
    -   Select Delivery Method (Home Delivery vs. Self Pickup).
    -   Select Shipping Address.
    -   **Rental Logic**:
        -   **KYC Check**: Enforce Identity Verification for rental orders. (Note: Currently bypassable for testing).
        -   **Rental Agreement**: (Previously required digital signature, currently disabled for streamlined flow).
    -   **Payment**: Select payment method (Card, Net Banking, UPI).
    -   **Order Confirmation**: Review total cost (including deposit for rentals) and place order.

### 3.4. Dashboard & Order Management
-   **My Rentals**: View active rental subscriptions, monthly price, and tenure.
-   **Order History**: View past orders (Buy/Rent), status (Shipped, Delivered), and total cost.
-   **Invoice**: Download generated invoices for orders.
-   **Support Tickets**: Create and view status of support tickets.
-   **KYC Status**:
    -   Real-time status tracking (Not Submitted, Pending, Approved, Rejected).
    -   Upload ID Proof (Front/Back) via secure storage.
    -   Receive feedback on rejection (Reason provided by Admin).

## 4. Admin Functional Requirements

### 4.1. Dashboard Overview
-   **Analytics**: View key metrics: Total Revenue, Monthly Growth, Active Rentals count, Open Support Tickets.
-   **Sales Graph**: Visual representation of sales growth over time.

### 4.2. Inventory Management
-   **Product List**: View all products with images and stock status.
-   **Add/Edit Product**:
    -   Set basic details (Name, Price, Brand, Category).
    -   **Features Management**: Add dynamic features (Title, Description) to products.
    -   Upload Product Images.
    -   Set Stock Status (Available, Low Stock, Rented).
-   **Delete Product**: Remove products from the catalog.

### 4.3. Order Management
-   **Order List**: View all customer orders with status and totals.
-   **Status Update**: workflow to update order status (Shipped, Delivered, Returned, Completed).
-   **Invoicing**: Generate and download order invoices for customers.

### 4.4. User & KYC Management
-   **User Directory**: View list of all registered users, their roles, and emails.
-   **KYC Review**:
    -   Filter users with "Pending" verification.
    -   View uploaded ID documents (Front/Back).
    -   **Approve/Reject**:
        -   Approve: Instantly updates user status to "Verified".
        -   Reject: Provide a reason for rejection (sent to user).

### 4.5. Support
-   **Ticket Management**: View and manage customer support queries.

## 5. Non-Functional Requirements
-   **Real-time Synchronization**: Order status, KYC status, and Inventory updates must reflect instantly across all connected clients (powered by Firestore).
-   **Responsive Design**: The platform must be fully functional on Desktop and Mobile devices.
-   **Security**: Admin routes must be protected; Storage buckets for KYC must be secure.
