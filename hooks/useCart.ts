import { useStore } from '../lib/store';

export const useCart = () => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useStore();

  const addItem = (productId: string, type: 'rent' | 'buy', tenure?: number) => {
    addToCart(productId, type, tenure);
  };

  const removeItem = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const updateItemQuantity = (cartItemId: string, delta: number) => {
    updateQuantity(cartItemId, delta);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return {
    cart,
    addItem,
    removeItem,
    updateItemQuantity,
    cartCount,
    cartTotal,
  };
};