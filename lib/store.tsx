import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from './mockData';
import { createAndUploadInvoice } from './invoice';
import { GoogleGenAI } from "@google/genai";
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile as updateAuthProfile, updateEmail, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, collection, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Notification, Address, CartItem, Order, Ticket, User, FinanceStats } from './types';

// Re-export for compatibility if needed, or just let components import from here if they did. 
// Since other files import { Order } from './store', we should export them.
export type { Notification, Address, CartItem, Order, Ticket, User, FinanceStats };

interface StoreContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  orders: Order[];
  tickets: Ticket[];
  wishlist: string[];
  allUsers: User[];
  finance: FinanceStats;
  products: Product[];
  notifications: Notification[];
  isCartOpen: boolean;
  isAuthOpen: boolean;
  isDBReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; role?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string; role?: string; isNewUser?: boolean }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (productId: string, type: 'rent' | 'buy', tenure?: number, variants?: CartItem['variants'], warranty?: CartItem['warranty']) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  placeOrder: (address: string, paymentMethod: string, totalOverride?: number, rentalDetails?: { start?: string, end?: string, deposit?: number, method?: 'pickup' | 'delivery' }) => Promise<void>;
  addTicket: (subject: string, description: string) => Promise<void>;
  addTicketMessage: (ticketId: string, message: string, updateStatus?: Ticket['status']) => Promise<void>;
  updateTicketPriority: (ticketId: string, priority: Ticket['priority']) => Promise<void>;
  assignTicket: (ticketId: string, adminId: string, adminName: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  toggleCart: (isOpen: boolean) => void;
  toggleAuth: (isOpen: boolean) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => Promise<void>;
  updateKYCStatus: (userId: string, status: User['kycStatus'], documents?: User['kycDocuments'], reason?: string) => Promise<string | void>;
  updateRentalPreferences: (prefs: User['rentalPreferences']) => Promise<void>;
  dismissNotification: (id: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  savePendingCheckout: (details: User['pendingCheckout']) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (details: Partial<User>) => Promise<void>;
  updateEmailAddress: (newEmail: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isDBReady, setIsDBReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fallback data for admin view
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [finance] = useState<FinanceStats>({
    totalRevenue: 2450000,
    monthlyGrowth: 12.5,
    activeRentalValue: 840000,
    pendingPayouts: 12000,
  });

  // --- SESSION TIMEOUT LOGIC ---
  const [lastActivity, setLastActivity] = useState(Date.now());
  const TIMEOUT_DURATION = 120 * 60 * 1000; // 120 minutes

  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());

    // throttle activity updates to avoid excessive state changes? 
    // For simplicity, just updating state is fine, React batches it.
    // Or we can just use a ref for lastActivity to avoid re-renders, but we need to trigger re-render on timeout?
    // Actually, checking in interval is independent of render. 
    // But we need to read the *latest* lastActivity in the interval.

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  useEffect(() => {
    if (!user) return; // Only track timeout for logged-in users

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > TIMEOUT_DURATION) {
        // Session expired
        logout();
        alert("Session expired. Please login again.");
        const event = new CustomEvent('navigate', { detail: { view: 'home' } });
        window.dispatchEvent(event);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, lastActivity, TIMEOUT_DURATION]); // dependency on lastActivity might cause interval reset often.
  // Better approach: Use a Ref for lastActivity to avoid resetting interval, or just let it reset (it's fine).
  // actually, if we include lastActivity in dependency, the interval resets on every mousemove. That's inefficient.
  // Let's use a Ref for the timestamp.



  // --- ADMIN: FETCH ALL USERS ---
  useEffect(() => {
    if (user?.role === 'admin') {
      console.log("Admin User detected. Fetching all users...");
      const usersCol = collection(db, 'users');
      const unsubscribe = onSnapshot(usersCol, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        console.log("Fetched users:", usersList.length);
        setAllUsers(usersList);
      });
      return () => unsubscribe();
    } else {
      setAllUsers([]);
    }
  }, [user?.role]);

  // --- PRODUCTS: FIREBASE SYNC & SEEDING ---
  useEffect(() => {
    const productsCol = collection(db, 'products');
    const unsubscribe = onSnapshot(productsCol, async (snapshot) => {
      const liveProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      if (liveProducts.length === 0 && initialProducts.length > 0) {
        // Seeding initial data
        console.log("Seeding initial products to Firestore...");
        try {
          // We can't use batch for too many items if > 500, but for mock data (20 items) it's fine.
          // However, let's do one by one to avoid complex batch logic for now or just set them.
          // Actually, let's just use Promise.all to seed.
          await Promise.all(initialProducts.map(p => setDoc(doc(db, 'products', p.id), p)));
          console.log("Seeding complete.");
        } catch (err) {
          console.error("Error seeding products:", err);
        }
      } else {
        setProducts(liveProducts);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- FIREBASE AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let currentName = firebaseUser.displayName;
        if (!currentName && userDoc.exists()) {
          currentName = userDoc.data()?.name;
        }

        const baseProfile = {
          name: currentName || 'User',
          email: firebaseUser.email || '',
        };

        if (userDoc.exists()) {
          // Sync profile info and get latest data
          await updateDoc(userDocRef, baseProfile);
          setUser({ id: firebaseUser.uid, ...userDoc.data(), ...baseProfile } as User);
        } else {
          // Initialize ALL records for a new user
          const newUser: User = {
            id: firebaseUser.uid,
            ...baseProfile,
            ...baseProfile,
            role: 'user',
            joinedDate: new Date().toISOString().split('T')[0],
            addresses: [],
            wishlist: [],
            cart: [],
            orders: [],
            tickets: []
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
        setCart([]);
        setOrders([]);
        setTickets([]);
        setWishlist([]);
      }
      setIsDBReady(true);
    });
    return () => unsubscribe();
  }, []);

  // --- FIRESTORE REALTIME SYNC ---
  useEffect(() => {
    if (!user) return;
    console.log("Starting Firestore Listener for User ID:", user.id);
    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("🔥 Firestore Realtime Update for User:", user.id, "KYC:", data.kycStatus);
        // console.log("🔥 Fetched Orders from DB:", data.orders?.length || 0);
        // console.log("🔥 Fetched Cart from DB:", data.cart?.length || 0);

        setCart(data.cart || []);
        setOrders(data.orders || []);
        setTickets(data.tickets || []);
        setWishlist(data.wishlist || []);
        // Keep the local user state up to date with firestore (addresses, profile, etc.)
        setUser(prev => prev ? { ...prev, ...data, id: prev.id } : (data as User));
      } else {
        console.warn("⚠️ User document does not exist in Firestore for ID:", user.id);
      }
    }, (error) => {
      console.error("❌ Firestore Listener Error:", error);
      if (error.code === 'permission-denied') {
        alert("Session expired or permission denied. Please refresh.");
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  const generateAIEmail = async (order: Order, type: 'new' | 'update') => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Draft a friendly, professional email notification for a technology platform named 'SB Tech Solution'. Event: ${type === 'new' ? 'Order Placed' : 'Order Status Changed to ' + order.status}. User: ${order.userName}. Order ID: ${order.id}. Order Items: ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}. Tone: Courteous, helpful, and clear. Avoid complex tech jargon.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const emailText = response.text || "Your order update has been processed.";
      const newNotification: Notification = { id: Math.random().toString(36).substr(2, 9), title: type === 'new' ? "Order Confirmation" : `Status Update: ${order.status}`, message: `An update about your order has been sent to ${order.userEmail}`, content: emailText, timestamp: Date.now() };
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      console.error("AI Notification Error:", err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'customer';
      setIsAuthOpen(false);
      return { success: true, message: 'Logged in successfully', role };
    } catch (err: any) {
      return { success: false, message: 'Password or Email Incorrect' };
    }
  };

  const sendWelcomeEmail = async (user: User) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Draft a warm, professional welcome email for a new user named '${user.name}' joining 'SB Tech Solution'. Tone: Exciting, professional, and welcoming. Keep it short (2-3 sentences). Mention we are excited to have them.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const emailText = response.text || "Welcome to SB Tech Solution! We are excited to have you on board.";
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title: "Welcome to SB Tech!",
        message: `A welcome email has been sent to ${user.email}`,
        content: emailText,
        timestamp: Date.now()
      };
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      console.error("AI Welcome Email Error:", err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if it's a new user (modern Firebase v9 approach uses getAdditionalUserInfo, 
      // but userCredential.additionalUserInfo might be available in compat or older types. 
      // Let's use getAdditionalUserInfo if imported, but safely we can check via userDoc existence 
      // OR use the provider result. 
      // Actually, let's look at imports. getAdditionalUserInfo is NOT imported.
      // Let's import it or just use the logic we already have: !userDoc.exists() means new to OUR DB.
      // But user might have signed in with Google before? 
      // If userDoc exists, they are an existing user.

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const baseProfile = {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
      };

      let isNewUser = !userDoc.exists();

      if (isNewUser) {
        const newUser: User = {
          id: firebaseUser.uid,
          ...baseProfile,
          role: 'user',
          joinedDate: new Date().toISOString().split('T')[0],
          addresses: [],
          wishlist: [],
          cart: [],
          orders: [],
          tickets: []
        };
        await setDoc(userDocRef, newUser);
        sendWelcomeEmail(newUser); // Send welcome email for new Google users
      } else {
        await updateDoc(userDocRef, baseProfile);
      }

      setIsAuthOpen(false);
      const role = userDoc.exists() ? userDoc.data().role : 'customer';
      return { success: true, message: 'Logged in successfully', role, isNewUser };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateAuthProfile(userCredential.user, { displayName: name });
      const newUser: User = {
        id: userCredential.user.uid,
        name,
        email,
        role: 'user',
        joinedDate: new Date().toISOString().split('T')[0],
        addresses: [],
        wishlist: [],
        cart: [],
        orders: [],
        tickets: []
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      sendWelcomeEmail(newUser); // Send welcome email for new signups
      setIsAuthOpen(false);
      return { success: true, message: 'Account created successfully' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const resetPassword = async (email: string) => {
    console.log("Attempting to reset password for:", email);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent successfully.");
      return { success: true, message: 'Password reset link sent to your email' };
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
      // Give more detailed error messages
      if (err.code === 'auth/user-not-found') {
        return { success: false, message: 'No account found with this email.' };
      }
      return { success: false, message: err.message };
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      // Create a reference with an auto-generated ID, or generate one locally
      const newId = Math.random().toString(36).substr(2, 9);
      // Better to let Firestore generate ID or use the one we made.
      // Let's use the random one for consistency with the type Omit<Product, 'id'>
      const newProduct: Product = { ...productData, id: newId };
      await setDoc(doc(db, 'products', newId), newProduct);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { ...product });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // 1. Get Product Data (to find images)
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data() as Product;

        // 2. Delete Images from Storage
        const storage = getStorage();
        const imagesToDelete = [];
        if (productData.image) imagesToDelete.push(productData.image);
        if (productData.images && productData.images.length > 0) imagesToDelete.push(...productData.images);

        // Helper to extract path from URL (if needed) or just pass ref from URL
        // Firebase Storage refFromURL supports full HTTPS URLs

        await Promise.all(imagesToDelete.map(async (imageUrl) => {
          try {
            // Check if it's a firebase storage URL
            if (imageUrl.includes('firebasestorage')) {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
            }
          } catch (err) {
            console.warn("Failed to delete image:", imageUrl, err);
            // Continue deleting product even if image delete fails
          }
        }));
      }

      // 3. Delete Document
      await deleteDoc(productRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    const event = new CustomEvent('navigate', { detail: { view: 'home' } });
    window.dispatchEvent(event);
  };

  const syncUserField = async (field: string, data: any) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { [field]: data });
  };

  const addToCart = async (productId: string, type: 'rent' | 'buy', tenure?: number, variants?: CartItem['variants'], warranty?: CartItem['warranty']) => {
    if (!user) { setIsAuthOpen(true); return; }
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let basePrice = product.price;
    if (type === 'rent') {
      if (tenure && product.rentalOptions) {
        const option = product.rentalOptions.find(o => o.months === tenure) || product.rentalOptions[0];
        basePrice = option.price;
      }
    } else {
      basePrice = product.buyPrice || product.price;
    }
    const finalPrice = basePrice + (warranty?.price || 0);
    const newItem: CartItem = { id: Math.random().toString(36).substr(2, 9), productId, type, name: product.name, image: product.image, price: finalPrice, quantity: 1, tenure: type === 'rent' ? tenure : null as any, variants: variants || null as any, warranty: warranty || null as any };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart); // Update local state immediately
    await syncUserField('cart', updatedCart);
    setIsCartOpen(true);
  };

  const updateQuantity = async (cartItemId: string, delta: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updatedCart); // Update local state
    await syncUserField('cart', updatedCart);
  };

  const removeFromCart = async (cartItemId: string) => {
    const updatedCart = cart.filter(item => item.id !== cartItemId);
    setCart(updatedCart); // Update local state
    await syncUserField('cart', updatedCart);
  };

  const placeOrder = async (address: string, paymentMethod: string, totalOverride?: number, rentalDetails?: { start?: string, end?: string, deposit?: number, method?: 'pickup' | 'delivery' }) => {
    if (!user) return;
    const finalTotal = totalOverride || cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split('T')[0],
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: [...cart],
      total: finalTotal,
      status: 'Placed',
      address,
      ...(rentalDetails ? {
        rentalStartDate: rentalDetails.start,
        rentalEndDate: rentalDetails.end,
        depositAmount: rentalDetails.deposit,
        deliveryMethod: rentalDetails.method
      } : {})
    };

    // Generate Invoice Automatically
    let invoiceUrl = "";
    try {
      console.log("📄 Generating automatic invoice...");
      invoiceUrl = await createAndUploadInvoice(newOrder, user);
      newOrder.invoiceUrl = invoiceUrl;
      console.log("✅ Invoice generated:", invoiceUrl);
    } catch (invoiceErr) {
      console.error("⚠️ Failed to generate automatic invoice:", invoiceErr);
      // Continue placing order even if invoice fails
    }

    // FIRESTORE SANITIZATION: Remove undefined keys
    const sanitizedOrder = JSON.parse(JSON.stringify(newOrder));
    console.log("🚀 Placing Order:", sanitizedOrder.id);

    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        orders: arrayUnion(sanitizedOrder),
        cart: [] // Clear cart in Firestore
      });
      console.log("✅ Order successfully written to Firestore");

      // Create Financial Record
      const financialRecord = {
        id: newOrder.id,
        orderId: newOrder.id,
        userId: user.id,
        userName: user.name,
        amount: newOrder.total,
        type: 'income',
        date: newOrder.date,
        timestamp: new Date().toISOString(),
        paymentMethod: paymentMethod,
        status: 'success',
        items: newOrder.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
      };

      try {
        await setDoc(doc(db, 'financials', newOrder.id), financialRecord);
        console.log("✅ Financial record created for Order:", newOrder.id);
      } catch (err) {
        console.error("❌ Error creating financial record:", err);
      }

      setOrders(prev => [sanitizedOrder, ...prev]);
      setCart([]);

      // Update user state optimistically to ensure user.orders is in sync
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          orders: [sanitizedOrder, ...(prevUser.orders || [])],
          cart: []
        };
      });

      generateAIEmail(newOrder, 'new');
    } catch (err) {
      console.error("❌ Error placing order:", err);
      throw err;
    }
  };

  const addTicket = async (subject: string, description: string) => {
    if (!user) return;

    const timestamp = new Date().toISOString();
    const initialMessage: any = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      senderRole: 'user',
      message: description,
      timestamp: timestamp,
    };

    const newTicket: Ticket = {
      id: `TIC-${Math.floor(Math.random() * 10000)}`,
      userId: user.id,
      subject,
      description,
      status: 'Open',
      priority: 'Medium',
      date: new Date().toISOString().split('T')[0],
      lastUpdated: timestamp,
      userName: user.name,
      customerEmail: user.email,
      messages: [initialMessage],
    };

    const updatedTickets = [newTicket, ...tickets];
    await syncUserField('tickets', updatedTickets);
  };

  const addTicketMessage = async (ticketId: string, message: string, updateStatus?: Ticket['status']) => {
    if (!user) return;

    const timestamp = new Date().toISOString();
    const newMessage: any = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role || 'admin',
      message: message,
      timestamp: timestamp,
    };

    // Find the ticket owner and update their ticket
    for (const targetUser of allUsers) {
      const ticketIndex = targetUser.tickets?.findIndex(t => t.id === ticketId);
      if (ticketIndex !== undefined && ticketIndex >= 0 && targetUser.tickets) {
        const updatedTicket = {
          ...targetUser.tickets[ticketIndex],
          messages: [...targetUser.tickets[ticketIndex].messages, newMessage],
          lastUpdated: timestamp,
          ...(updateStatus && { status: updateStatus }),
        };

        const updatedTickets = [...targetUser.tickets];
        updatedTickets[ticketIndex] = updatedTicket;

        const userDocRef = doc(db, 'users', targetUser.id);
        await updateDoc(userDocRef, { tickets: updatedTickets });
        break;
      }
    }
  };

  const updateTicketPriority = async (ticketId: string, priority: Ticket['priority']) => {
    if (!user) return;

    // Find the ticket owner and update priority
    for (const targetUser of allUsers) {
      const ticketIndex = targetUser.tickets?.findIndex(t => t.id === ticketId);
      if (ticketIndex !== undefined && ticketIndex >= 0 && targetUser.tickets) {
        const updatedTicket = {
          ...targetUser.tickets[ticketIndex],
          priority: priority,
          lastUpdated: new Date().toISOString(),
        };

        const updatedTickets = [...targetUser.tickets];
        updatedTickets[ticketIndex] = updatedTicket;

        const userDocRef = doc(db, 'users', targetUser.id);
        await updateDoc(userDocRef, { tickets: updatedTickets });
        break;
      }
    }
  };

  const assignTicket = async (ticketId: string, adminId: string, adminName: string) => {
    if (!user) return;

    // Find the ticket owner and assign admin
    for (const targetUser of allUsers) {
      const ticketIndex = targetUser.tickets?.findIndex(t => t.id === ticketId);
      if (ticketIndex !== undefined && ticketIndex >= 0 && targetUser.tickets) {
        const updatedTicket = {
          ...targetUser.tickets[ticketIndex],
          assignedTo: adminId,
          assignedToName: adminName,
          lastUpdated: new Date().toISOString(),
        };

        const updatedTickets = [...targetUser.tickets];
        updatedTickets[ticketIndex] = updatedTicket;

        const userDocRef = doc(db, 'users', targetUser.id);
        await updateDoc(userDocRef, { tickets: updatedTickets });
        break;
      }
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) { setIsAuthOpen(true); return; }
    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    await syncUserField('wishlist', updatedWishlist);
  };

  const addAddress = async (addr: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddr: Address = {
      ...addr,
      id: Math.random().toString(36).substr(2, 9),
      // Auto-set as default if this is the first address
      isDefault: (user.addresses || []).length === 0 ? true : (addr.isDefault || false)
    };
    const updatedAddresses = [...(user.addresses || []), newAddr];
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { addresses: updatedAddresses });
    setUser(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
    return newAddr.id; // Return the new address ID
  };


  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user) return;
    const updatedAddresses = (user.addresses || []).map(a =>
      a.id === id ? { ...a, ...updates } : a
    );
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { addresses: updatedAddresses });
    setUser(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    // Set selected address as default, unset others
    const updatedAddresses = (user.addresses || []).map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { addresses: updatedAddresses });
    setUser(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
  };

  const removeAddress = async (id: string) => {
    if (!user) return;

    // Check if trying to delete default address
    const addressToDelete = user.addresses?.find(a => a.id === id);
    if (addressToDelete?.isDefault && (user.addresses || []).length > 1) {
      throw new Error('Cannot delete default address. Please set another address as default first.');
    }

    const updatedAddresses = (user.addresses || []).filter(a => a.id !== id);
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { addresses: updatedAddresses });
    setUser(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingInfo?: Order['trackingInfo']) => {
    // 1. Try to find/update in allUsers (Admin scenario)
    for (const u of allUsers) {
      if (u.orders?.some(o => o.id === orderId)) {
        const updatedOrders = u.orders.map(o => {
          if (o.id === orderId) {
            const newTimeline = o.timeline || [];
            newTimeline.push({
              status,
              date: new Date().toISOString(),
              note: trackingInfo ? `Tracking: ${trackingInfo.courier} - ${trackingInfo.trackingNumber}` : undefined
            });

            return {
              ...o,
              status,
              timeline: newTimeline,
              trackingInfo: trackingInfo || o.trackingInfo
            };
          }
          return o;
        });

        // Optimistic State Update for Admin
        setAllUsers(prev => prev.map(user => user.id === u.id ? { ...user, orders: updatedOrders } : user));

        // Sanitize for Firestore persistence (removal of undefined keys)
        const sanitizedOrders = JSON.parse(JSON.stringify(updatedOrders));

        // Update Firestore
        const userDocRef = doc(db, 'users', u.id);
        await updateDoc(userDocRef, { orders: sanitizedOrders });

        // Generate Email Notification via AI
        const order = u.orders.find(o => o.id === orderId);
        if (order) generateAIEmail({ ...order, status, trackingInfo }, 'update');
        return;
      }
    }

    // 2. If not found in allUsers, check current user (User scenario)
    if (user && user.orders?.some(o => o.id === orderId)) {
      const updatedOrders = user.orders.map(o => {
        if (o.id === orderId) {
          const newTimeline = o.timeline || [];
          newTimeline.push({
            status,
            date: new Date().toISOString(),
            note: trackingInfo ? `Tracking: ${trackingInfo.courier} - ${trackingInfo.trackingNumber}` : undefined
          });

          return {
            ...o,
            status,
            timeline: newTimeline,
            trackingInfo: trackingInfo || o.trackingInfo
          };
        }
        return o;
      });

      // Optimistic Update
      setOrders(updatedOrders);
      setUser({ ...user, orders: updatedOrders });

      // Firestore Update
      const sanitizedOrders = JSON.parse(JSON.stringify(updatedOrders));
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, { orders: sanitizedOrders });

      // Email logic
      const order = user.orders.find(o => o.id === orderId);
      if (order) generateAIEmail({ ...order, status, trackingInfo }, 'update');
      return;
    }

    console.error("Order not found for update:", orderId);
  };

  const updateOrderNotes = async (orderId: string, notes: Order['internalNotes']) => {
    for (const u of allUsers) {
      if (u.orders?.some(o => o.id === orderId)) {
        const updatedOrders = u.orders.map(o => o.id === orderId ? { ...o, internalNotes: notes } : o);

        // Optimistic State Update for Admin
        setAllUsers(prev => prev.map(user => user.id === u.id ? { ...user, orders: updatedOrders } : user));

        // Sanitize for Firestore persistence
        const sanitizedOrders = JSON.parse(JSON.stringify(updatedOrders));

        const userDocRef = doc(db, 'users', u.id);
        await updateDoc(userDocRef, { orders: sanitizedOrders });
        return;
      }
    }
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    for (const u of allUsers) {
      if (u.tickets?.some(t => t.id === ticketId)) {
        const updatedTickets = u.tickets.map(t => t.id === ticketId ? { ...t, status } : t);
        setAllUsers(prev => prev.map(user => user.id === u.id ? { ...user, tickets: updatedTickets } : user));
        const userDocRef = doc(db, 'users', u.id);
        await updateDoc(userDocRef, { tickets: updatedTickets });
        return;
      }
    }
    console.error("Ticket not found for update:", ticketId);
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    setAllUsers(prev => prev.map(user => user.id === userId ? { ...user, accountStatus: status } : user));
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { accountStatus: status });
  };

  const refreshProfile = async () => {
    if (!user) return;
    console.log("Manual Profile Refresh Triggered");
    const userDocRef = doc(db, 'users', user.id);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUser(prev => prev ? { ...prev, ...data, id: prev.id } : (data as User));
      console.log("Profile Refreshed. New Status:", data.kycStatus);
    }
  };

  const updateKYCStatus = async (userId: string, status: User['kycStatus'], documents?: User['kycDocuments'], reason?: string) => {
    const userDocRef = doc(db, 'users', userId);

    // Fetch current user data to get existing history
    const targetUserSnap = await getDoc(userDocRef);
    if (!targetUserSnap.exists()) {
      console.error("User not found:", userId);
      return;
    }
    const targetUser = targetUserSnap.data() as User;

    // Create update object
    const updateData: any = { kycStatus: status };
    if (documents) updateData.kycDocuments = documents;

    // Log Admin Action and Timestamp
    if (status === 'approved' || status === 'rejected') {
      updateData.kycVerifiedDate = new Date().toISOString();
      if (user?.id) updateData.kycVerifiedBy = user.id; // Log the admin who performed the action
    }

    if (reason) updateData.kycRejectionReason = reason;

    // --- KYC HISTORY TRACKING ---
    const historyEntry: any = {
      id: Math.random().toString(36).substr(2, 9),
      action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'submitted',
      status: status || 'pending',
      timestamp: new Date().toISOString(),
    };

    // Add admin details for approval/rejection
    if (status === 'approved' || status === 'rejected') {
      if (user?.id) {
        historyEntry.adminId = user.id;
        historyEntry.adminName = user.name;
      }
    }

    // Add rejection reason to history
    if (reason) {
      historyEntry.reason = reason;
    }

    // Archive document references in history
    if (targetUser.kycDocuments) {
      historyEntry.documents = { ...targetUser.kycDocuments };
    }

    // Initialize or append to history
    const existingHistory = targetUser.kycHistory || [];
    updateData.kycHistory = [...existingHistory, historyEntry];

    // --- AUTOMATIC ORDER PLACEMENT LOGIC ---
    // If Admin is approving, check for pending checkout in the TARGET user's data
    if (status === 'approved') {
      updateData.kycVerifiedDate = new Date().toISOString(); // Set verification date
      try {

        if (targetUser.pendingCheckout && targetUser.pendingCheckout.items && targetUser.pendingCheckout.items.length > 0) {
          console.log("Found pending checkout for user. Auto-placing order...");

          const no = targetUser.pendingCheckout;
          const newOrder: Order = {
            id: `ORD-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString().split('T')[0],
            userId: targetUser.id,
            userName: targetUser.name,
            userEmail: targetUser.email,
            items: [...no.items],
            total: no.total,
            status: 'Placed',
            address: no.address,
            ...(no.rentalDetails ? {
              rentalStartDate: no.rentalDetails.start,
              rentalEndDate: no.rentalDetails.end,
              depositAmount: no.rentalDetails.deposit,
              deliveryMethod: no.rentalDetails.method
            } : {})
          };

          // Generate Invoice Automatically
          try {
            console.log("📄 Generating automatic invoice for KYC order...");
            const invoiceUrl = await createAndUploadInvoice(newOrder, targetUser);
            newOrder.invoiceUrl = invoiceUrl;
            console.log("✅ Invoice generated:", invoiceUrl);
          } catch (invoiceErr) {
            console.error("⚠️ Failed to generate automatic invoice:", invoiceErr);
          }

          updateData.orders = [...(targetUser.orders || []), newOrder];
          updateData.cart = []; // Clear cart
          updateData.pendingCheckout = null; // Clear pending checkout

          console.log("Order auto-placed:", newOrder.id);
          return `Order ID: ${newOrder.id} has been placed successfully.`;
        }
      } catch (err) {
        console.error("Error auto-placing order during KYC approval:", err);
      }
    }

    await updateDoc(userDocRef, updateData);
    console.log("✅ KYC Status updated in Firestore for user:", userId, "Status:", status);

    // The onSnapshot listener (lines 132-145) will automatically update allUsers
    // No need for optimistic update here as it can cause race conditions

    // Optimistic update for current user if applicable (only if admin is updating their own KYC)
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, ...updateData } : null);
    }
  };

  const savePendingCheckout = async (details: User['pendingCheckout']) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { pendingCheckout: details });
    setUser(prev => prev ? { ...prev, pendingCheckout: details } : null);
  };

  const updateRentalPreferences = async (prefs: User['rentalPreferences']) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { rentalPreferences: prefs });
    setUser(prev => prev ? { ...prev, rentalPreferences: prefs } : null);
  };

  const updateProfile = async (details: Partial<User>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.id);

      // Sanitize details to avoid undefined/null issues if necessary
      const sanitizedDetails = JSON.parse(JSON.stringify(details));

      await updateDoc(userDocRef, sanitizedDetails);

      // Update local state
      setUser(prev => prev ? { ...prev, ...details } : null);

      // If name or avatar changed, update Firebase Auth profile too
      if (details.name || details.avatar) {
        await updateAuthProfile(auth.currentUser!, {
          displayName: details.name || user.name,
          photoURL: details.avatar || user.avatar
        });
      }

      console.log("✅ Profile updated successfully");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      throw err;
    }
  };

  const updateEmailAddress = async (newEmail: string) => {
    if (!auth.currentUser || !user) return;
    try {
      await updateEmail(auth.currentUser, newEmail);
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, { email: newEmail });
      setUser(prev => prev ? { ...prev, email: newEmail } : null);
      console.log("✅ Email updated successfully");
    } catch (err) {
      console.error("❌ Error updating email:", err);
      throw err;
    }
  };

  const dismissNotification = (id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); };

  return (
    <StoreContext.Provider value={{
      user, setUser, cart, orders, tickets, wishlist, allUsers, finance, products, notifications, isCartOpen, isAuthOpen, isDBReady,
      login, loginWithGoogle, signup, logout, resetPassword, addProduct, updateProduct, deleteProduct, addToCart, updateQuantity, removeFromCart, placeOrder, addTicket, addTicketMessage, updateTicketPriority, assignTicket, toggleWishlist,
      toggleCart: setIsCartOpen, toggleAuth: setIsAuthOpen, updateOrderStatus, updateTicketStatus, updateKYCStatus, updateUserStatus, dismissNotification,
      addAddress, updateAddress, setDefaultAddress, removeAddress, updateRentalPreferences, savePendingCheckout, refreshProfile, updateProfile, updateEmailAddress
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
}