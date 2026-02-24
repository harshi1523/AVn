import { products } from '../lib/mockData';

export const useProducts = () => {
  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getProductsByCategory = (category: string) => {
    if (category === 'All') return products;
    return products.filter(p => {
      const categories = Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []);
      return categories.includes(category as any);
    });
  };

  return {
    products,
    getProductById,
    getProductsByCategory,
  };
};