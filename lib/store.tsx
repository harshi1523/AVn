import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from './mockData';
import { createAndUploadInvoice } from './invoice';
import { GoogleGenAI } from "@google/genai";
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, collection, deleteDoc } from "firebase/firestore";
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
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (productId: string, type: 'rent' | 'buy', tenure?: number, variants?: CartItem['variants'], warranty?: CartItem['warranty']) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  placeOrder: (address: string, totalOverride?: number, rentalDetails?: { start?: string, end?: string, deposit?: number, method?: 'pickup' | 'delivery' }) => Promise<void>;
  addTicket: (subject: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  toggleCart: (isOpen: boolean) => void;
  toggleAuth: (isOpen: boolean) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  updateKYCStatus: (userId: string, status: User['kycStatus'], documents?: User['kycDocuments'], reason?: string) => Promise<string | void>;
  updateRentalPreferences: (prefs: User['rentalPreferences']) => Promise<void>;
  dismissNotification: (id: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  savePendingCheckout: (details: User['pendingCheckout']) => Promise<void>;
  refreshProfile: () => Promise<void>;
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
            role: 'customer',
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
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthOpen(false);
      return { success: true, message: 'Logged in successfully' };
    } catch (err: any) {
      return { success: false, message: 'Password or Email Incorrect' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const baseProfile = {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
      };

      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          ...baseProfile,
          role: 'customer',
          joinedDate: new Date().toISOString().split('T')[0],
          addresses: [],
          wishlist: [],
          cart: [],
          orders: [],
          tickets: []
        };
        await setDoc(userDocRef, newUser);
      } else {
        await updateDoc(userDocRef, baseProfile);
      }

      setIsAuthOpen(false);
      return { success: true, message: 'Logged in successfully' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name }); // Update Auth Profile immediately
      const newUser: User = {
        id: userCredential.user.uid,
        name,
        email,
        role: 'customer',
        joinedDate: new Date().toISOString().split('T')[0],
        addresses: [],
        wishlist: [],
        cart: [],
        orders: [],
        tickets: []
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
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
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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

  const placeOrder = async (address: string, totalOverride?: number, rentalDetails?: { start?: string, end?: string, deposit?: number, method?: 'pickup' | 'delivery' }) => {
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

    const updatedOrders = [sanitizedOrder, ...orders];
    console.log("🚀 Placing Order:", sanitizedOrder.id);
    console.log("🚀 User ID for Order:", user.id);
    console.log("🚀 Total Orders after placement (Optimistic):", updatedOrders.length);

    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, {
      orders: updatedOrders,
      cart: [] // Clear cart in Firestore
    }).then(() => console.log("✅ Order successfully written to Firestore"))
      .catch(err => console.error("❌ Error writing order to Firestore:", err));

    setOrders(updatedOrders); // Optimistic update
    setCart([]); // Clear local cart immediately
    generateAIEmail(newOrder, 'new');
  };

  const addTicket = async (subject: string) => {
    if (!user) return;
    const newTicket: Ticket = { id: `TIC-${Math.floor(Math.random() * 1000)}`, subject, status: 'Open', date: new Date().toISOString().split('T')[0], userName: user.name };
    const updatedTickets = [newTicket, ...tickets];
    await syncUserField('tickets', updatedTickets);
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
    const newAddr: Address = { ...addr, id: Math.random().toString(36).substr(2, 9) };
    const updatedAddresses = [...(user.addresses || []), newAddr];
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { addresses: updatedAddresses });
  };

  const removeAddress = async (id: string) => {
    if (!user) return;
    const updatedAddresses = (user.addresses || []).filter(a => a.id !== id);
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { addresses: updatedAddresses });
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Find usage in allUsers
    // Note: This relies on allUsers being populated (which is true for Admin)
    for (const u of allUsers) {
      if (u.orders?.some(o => o.id === orderId)) {
        const updatedOrders = u.orders.map(o => o.id === orderId ? { ...o, status } : o);

        // Update Firestore
        const userDocRef = doc(db, 'users', u.id);
        await updateDoc(userDocRef, { orders: updatedOrders });

        // Generate Email Notification via AI
        const order = u.orders.find(o => o.id === orderId);
        if (order) generateAIEmail({ ...order, status }, 'update');
        return;
      }
    }
    console.error("Order not found for update:", orderId);
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    // Admin functionality stub
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

    // Create update object
    const updateData: any = { kycStatus: status };
    if (documents) updateData.kycDocuments = documents;
    if (reason) updateData.kycRejectionReason = reason;

    // --- AUTOMATIC ORDER PLACEMENT LOGIC ---
    // If Admin is approving, check for pending checkout in the TARGET user's data
    if (status === 'approved') {
      updateData.kycVerifiedDate = new Date().toISOString(); // Set verification date
      try {
        const targetUserSnap = await getDoc(userDocRef);
        if (targetUserSnap.exists()) {
          const targetUser = targetUserSnap.data() as User;

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

            // Add order to updateData
            // Note: need to append to existing orders.
            // Since we are inside 'updateKYCStatus', we can merge this update.
            // Using arrayUnion for orders is cleaner, but 'cart' needs to be cleared.

            // Generate Invoice Automatically
            try {
              console.log("📄 Generating automatic invoice for KYC order...");
              const invoiceUrl = await createAndUploadInvoice(newOrder, targetUser);
              newOrder.invoiceUrl = invoiceUrl;
              console.log("✅ Invoice generated:", invoiceUrl);
            } catch (invoiceErr) {
              console.error("⚠️ Failed to generate automatic invoice:", invoiceErr);
            }

            // We can't use arrayUnion easily with the 'updateData' map mixed with other fields if we want atomic
            // But we can do:
            updateData.orders = [...(targetUser.orders || []), newOrder];
            updateData.cart = []; // Clear cart
            updateData.pendingCheckout = null; // Clear pending checkout

            // Notify via AI (optional but good)
            // Note: generateAIEmail uses local 'setNotifications' which is for the CURRENT user (Admin).
            // We might want to skip that or implement a backend notification later.
            console.log("Order auto-placed:", newOrder.id);
            return `Order ID: ${newOrder.id} has been placed successfully.`;
          }
        }
      } catch (err) {
        console.error("Error auto-placing order during KYC approval:", err);
      }
    }

    await updateDoc(userDocRef, updateData);

    // Optimistic update for current user if applicable
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

  const dismissNotification = (id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); };

  return (
    <StoreContext.Provider value={{
      user, setUser, cart, orders, tickets, wishlist, allUsers, finance, products, notifications, isCartOpen, isAuthOpen, isDBReady,
      login, loginWithGoogle, signup, logout, resetPassword, addProduct, updateProduct, deleteProduct, addToCart, updateQuantity, removeFromCart, placeOrder, addTicket, toggleWishlist,
      toggleCart: setIsCartOpen, toggleAuth: setIsAuthOpen, updateOrderStatus, updateTicketStatus, updateKYCStatus, dismissNotification,
      addAddress, removeAddress, updateRentalPreferences, savePendingCheckout, refreshProfile
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