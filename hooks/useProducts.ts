import { products } from '../lib/mockData';

export const useProducts = () => {
  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getProductsByCategory = (category: string) => {
    if (category === 'All') return products;
    return products.filter(p => p.category === category);
  };

  return {
    products,
    getProductById,
    getProductsByCategory,
  };
};