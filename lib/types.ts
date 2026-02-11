export interface Notification {
    id: string;
    title: string;
    message: string;
    content?: string;
    timestamp: number;
}

export interface Address {
    id: string;
    label: string;
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    phone: string;
    recipientName?: string;  // Optional recipient name (defaults to user name)
    isDefault?: boolean;     // Mark as default address for checkout
}

export interface CartItem {
    id: string;
    productId: string;
    type: 'rent' | 'buy';
    name: string;
    image: string;
    price: number;
    quantity: number;
    tenure?: number;
    variants?: {
        ram?: string;
        ssd?: string;
        color?: string;
    };
    warranty?: {
        id: string;
        label: string;
        price: number;
    };
}

export interface Order {
    id: string;
    date: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    items: CartItem[];
    total: number;
    status: 'Placed' | 'Awaiting Delivery' | 'In Transit' | 'Delivered' | 'In Use' | 'Returning' | 'Inspection' | 'Completed' | 'Cancelled';
    address: string;
    rentalStartDate?: string;
    rentalEndDate?: string;
    depositAmount?: number;
    deliveryMethod?: 'pickup' | 'delivery';
    invoiceUrl?: string;
    paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
    paymentMethod?: 'Card' | 'UPI' | 'NetBanking' | 'COD';
    transactionId?: string;
    tax?: number;
    deliveryFee?: number;
    timeline?: { status: string; date: string; note?: string }[];
    trackingInfo?: { courier: string; trackingNumber: string; url?: string };
    internalNotes?: { id: string; content: string; author: string; date: string }[];
}

export interface TicketMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'user';
    message: string;
    timestamp: string;
    attachments?: string[];
}

export interface Ticket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: 'Open' | 'Pending' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    date: string;
    lastUpdated: string;
    userName?: string;
    customerEmail?: string;
    assignedTo?: string;
    assignedToName?: string;
    relatedOrderId?: string;
    messages: TicketMessage[];
}

export interface KYCHistoryEntry {
    id: string;
    action: 'submitted' | 'approved' | 'rejected' | 'resubmitted';
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
    adminId?: string;
    adminName?: string;
    reason?: string;
    documents?: { front: string; back: string; type: string };
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user';
    accountStatus?: 'active' | 'suspended';
    joinedDate?: string;
    addresses?: Address[];
    wishlist?: string[];
    cart?: CartItem[];
    orders?: Order[];
    tickets?: Ticket[];
    kycStatus?: 'pending' | 'approved' | 'rejected' | 'reupload_required' | 'not_submitted';
    kycDocuments?: { front: string; back: string; type: string };
    kycVerifiedDate?: string;
    kycVerifiedBy?: string;
    kycSubmissionDate?: string;
    kycRejectionReason?: string;
    kycHistory?: KYCHistoryEntry[];
    rentalPreferences?: {
        depositMethod: 'card' | 'upi' | 'net_banking';
        isOnboardingComplete: boolean;
        termsAccepted?: boolean;
        upiId?: string;        // UPI ID for UPI payments
        cardLast4?: string;    // Last 4 digits of card for display
    };
    pendingCheckout?: {
        address: string;
        rentalDetails?: {
            start?: string;
            end?: string;
            deposit?: number;
            method?: 'pickup' | 'delivery';
        };
        total: number;
        paymentMethod: 'card' | 'net' | 'upi';
        items: CartItem[];
    };
}

export interface FinanceStats {
    totalRevenue: number;
    monthlyGrowth: number;
    activeRentalValue: number;
    pendingPayouts: number;
}
