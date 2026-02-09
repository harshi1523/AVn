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
    isDefault?: boolean;
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
    invoiceUrl?: string; // New field
}

export interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: 'Open' | 'Pending' | 'In Progress' | 'Resolved';
    date: string;
    userName?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
    joinedDate?: string;
    addresses?: Address[];
    wishlist?: string[];
    cart?: CartItem[];
    orders?: Order[];
    tickets?: Ticket[];
    kycStatus?: 'pending' | 'approved' | 'rejected' | 'reupload_required' | 'not_submitted';
    kycDocuments?: { front: string; back: string; type: string };
    kycVerifiedDate?: string;
    kycRejectionReason?: string;
    rentalPreferences?: {
        depositMethod: 'card' | 'upi' | 'net_banking';
        isOnboardingComplete: boolean;
        termsAccepted?: boolean;
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
