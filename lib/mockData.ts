export interface ProductSpec {
  [key: string]: string;
}

export interface RentalOption {
  months: number;
  price: number;
  label: string;
  discount?: string;
}

export interface ProductFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
}

export interface Product {
  id: string;
  deposit?: number;
  type: 'rent' | 'buy' | 'rent_and_buy';
  brand: 'Apple' | 'Dell' | 'HP' | 'Lenovo' | 'Asus' | 'Acer' | 'Razer' | 'Logitech' | 'Generic';
  category?: 'Laptop' | 'Desktop' | 'Monitor' | 'Tablet' | 'Audio' | 'Keyboards' | 'Mice' | 'Gaming' | 'Accessories';
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  videoUrl?: string;
  rating: number;
  reviews: number;
  specs?: ProductSpec;
  features?: ProductFeature[];
  fullSpecs?: Record<string, Record<string, string>>;
  rentalOptions?: RentalOption[];
  condition?: 'New' | 'Refurbished' | 'Open Box';
  status?: 'AVAILABLE' | 'LOW STOCK' | 'RENTED' | 'OUT_OF_STOCK';
  stock?: number;
  grade?: string;
  buyPrice?: number;
  isTrending?: boolean;
  discountLabel?: string;
  variants?: {
    ram: string[];
    ssd: string[];
    colors: { name: string; hex: string }[];
  };
  reviewsList?: Review[];
}

export const products: Product[] = [];