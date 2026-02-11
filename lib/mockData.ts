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

export const products: Product[] = [
  {
    id: 'apple-macbook-pro-m3',
    type: 'rent',
    brand: 'Apple',
    category: 'Laptop',
    name: 'MacBook Pro 16" M3 Max',
    subtitle: 'Extreme Performance • Liquid Retina XDR • Space Black',
    price: 8500,
    originalPrice: 12000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', // Main
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop', // Side
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1200&auto=format&fit=crop'  // Keyboard
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-person-typing-on-a-laptop-4488-large.mp4',
    rating: 4.9,
    reviews: 128,
    condition: 'New',
    status: 'AVAILABLE',
    isTrending: true,
    features: [
      { title: 'M3 Max Chip', description: 'Up to 16-core CPU and 40-core GPU for extreme workflows.', icon: 'memory' },
      { title: '22-Hour Battery', description: 'Longest battery life ever in a Mac laptop.', icon: 'battery_full' },
      { title: 'Liquid Retina XDR', description: '1,600 nits peak brightness for HDR content.', icon: 'display_settings' },
      { title: 'MagSafe 3', description: 'High-speed charging with a dedicated magnetic port.', icon: 'bolt' }
    ],
    fullSpecs: {
      'Silicon': { 'Chip': 'Apple M3 Max', 'CPU': '16-core', 'GPU': '40-core', 'Neural Engine': '16-core' },
      'Display': { 'Size': '16.2-inch', 'Resolution': '3456 x 2234', 'ProMotion': 'Up to 120Hz' },
      'Memory': { 'Unified Memory': '36GB (Configurable to 128GB)', 'Bandwidth': '400GB/s' }
    },
    variants: {
      ram: ['36GB', '64GB', '128GB'],
      ssd: ['1TB', '2TB', '4TB'],
      colors: [
        { name: 'Space Black', hex: '#1C1C1C' },
        { name: 'Silver', hex: '#E3E4E5' }
      ]
    },
    rentalOptions: [
      { months: 3, price: 10500, label: 'Short Term' },
      { months: 6, price: 9200, label: 'Performance' },
      { months: 12, price: 8500, label: 'Enterprise' }
    ],
    reviewsList: [
      { id: 'r1', userName: 'Arjun M.', rating: 5, date: '2024-05-10', comment: 'The M3 Max chip is terrifyingly fast. Rendering times cut in half.', verified: true },
      { id: 'r2', userName: 'Sarah L.', rating: 5, date: '2024-04-22', comment: 'Display is next level. Perfect for HDR color grading.', verified: true }
    ]
  },
  {
    id: 'dell-vostro-15',
    type: 'buy',
    brand: 'Dell',
    category: 'Laptop',
    name: 'Dell 15 Laptop (Vostro)',
    subtitle: '14th Gen Intel Core 3 • 512GB SSD • Windows 11',
    price: 38500,
    originalPrice: 45000,
    image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=1200&auto=format&fit=crop',
    rating: 4.4,
    reviews: 256,
    condition: 'New',
    status: 'AVAILABLE',
    features: [
      { title: 'Intel Core 3 100U', description: '14th Generation processor up to 4.70 GHz, 10MB 6 Cores.', icon: 'processor' },
      { title: '120Hz WVA Display', description: '15.6" FHD Narrow Border LED-Backlit with Anti-Glare.', icon: 'monitor' },
      { title: 'Military Grade', description: 'MIL-810H Certified for extreme durability and testing.', icon: 'verified' },
      { title: 'Express Charge', description: 'Recharge your battery up to 80% in just 60 minutes.', icon: 'bolt' }
    ],
    fullSpecs: {
      'Performance': { 'CPU': 'Intel Core 3 100U (14th Gen)', 'Cores': '6 Cores', 'Cache': '10MB', 'Max Clock': '4.70 GHz' },
      'Storage & Memory': { 'RAM': '8GB DDR4 (2666 MT/s)', 'SSD': '512GB M.2 PCIe NVMe' },
      'Display': { 'Screen Size': '15.6-inch (14.96" Viewable)', 'Refresh Rate': '120Hz', 'Panel': 'WVA IPS AG 250 nit' },
      'Connectivity': { 'USB-C': '1x USB 3.2 Gen 1 full function', 'USB-A': '2x USB 3.2 Gen 1', 'HDMI': '1x HDMI 1.4', 'Other': 'SD 3.0 Card Slot' }
    }
  },
  {
    id: 'razer-blade-16',
    type: 'rent',
    brand: 'Razer',
    category: 'Gaming',
    name: 'Razer Blade 16 (2024)',
    subtitle: 'NVIDIA RTX 4090 • Dual Mode Mini-LED • 240Hz',
    price: 3375,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviews: 64,
    condition: 'Refurbished',
    status: 'LOW STOCK',
    discountLabel: 'SAVE 25%',
    features: [
      { title: 'RTX 4090 GPU', description: 'Maximum TGP 175W for desktop-class gaming performance.', icon: 'sports_esports' },
      { title: 'Dual Mode Display', description: 'Switch between UHD+ 120Hz and FHD+ 240Hz natively.', icon: 'brightness_6' },
      { title: 'Vapor Chamber', description: 'Advanced cooling for sustained peak performance.', icon: 'ac_unit' }
    ],
    fullSpecs: {
      'Graphics': { 'GPU': 'NVIDIA GeForce RTX 4090', 'VRAM': '16GB GDDR6X', 'TGP': '175W' },
      'CPU': { 'Model': 'Intel Core i9-14900HX', 'Cores': '24-core', 'Max Boost': '5.8 GHz' },
      'Display': { 'Type': 'Mini-LED', 'Resolution': '4K/FHD+ Switchable', 'Contrast': '1M:1' }
    },
    variants: {
      ram: ['32GB', '64GB'],
      ssd: ['1TB', '2TB'],
      colors: [{ name: 'Black', hex: '#000000' }]
    },
    rentalOptions: [
      { months: 6, price: 3800, label: 'Gamer' },
      { months: 12, price: 3375, label: 'Pro' }
    ]
  },
  {
    id: 'hp-omnibook-5-ai',
    type: 'buy',
    brand: 'HP',
    category: 'Laptop',
    name: 'HP OmniBook 5 AI',
    subtitle: 'Snapdragon X Elite • Copilot+ PC • 26h Battery',
    price: 135900,
    originalPrice: 149900,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    reviews: 18,
    condition: 'New',
    status: 'AVAILABLE',
    features: [
      { title: 'Snapdragon X Elite', description: 'Unprecedented efficiency with integrated NPU.', icon: 'bolt' },
      { title: '26h Battery', description: 'True all-day (and night) battery performance.', icon: 'timer' },
      { title: 'Copilot+ Ready', description: 'Dedicated AI features built into the core experience.', icon: 'psychology' }
    ],
    fullSpecs: {
      'AI Engine': { 'NPU': '45 TOPS', 'Platform': 'Snapdragon X Elite' },
      'Weight': { 'Chassis': '1.2 kg', 'Material': 'Recycled Aluminum' },
      'Battery': { 'Runtime': 'Up to 26 hours', 'Type': '3-cell 56 Wh' }
    }
  },
  {
    id: 'dell-xps-15-9530',
    type: 'buy',
    brand: 'Dell',
    category: 'Laptop',
    name: 'Dell XPS 15 9530',
    subtitle: 'Intel Core i9 • 3.5K OLED Touch • Precision Crafted',
    price: 185000,
    originalPrice: 210000,
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviews: 210,
    condition: 'New',
    status: 'AVAILABLE',
    isTrending: true,
    features: [
      { title: 'InfinityEdge', description: '4-sided borderless view for maximum immersion.', icon: 'photo_size_select_large' },
      { title: 'OLED 3.5K', description: 'Incredible color depth and pure blacks.', icon: 'touch_app' },
      { title: 'Waves Nx® Audio', description: '3D spatial sound for a pro studio experience.', icon: 'surround_sound' }
    ],
    fullSpecs: {
      'Display': { 'Panel': '3.5K OLED Touch', 'Brightness': '400 nits', 'Color': '100% DCI-P3' },
      'Processor': { 'CPU': 'Intel Core i9-13900H', 'Cores': '14-core', 'Cache': '24MB' },
      'Chassis': { 'Material': 'CNC Aluminum', 'Palm Rest': 'Black Carbon Fiber' }
    },
    variants: {
      ram: ['16GB', '32GB', '64GB'],
      ssd: ['512GB', '1TB', '2TB'],
      colors: [
        { name: 'Platinum Silver', hex: '#C0C0C0' },
        { name: 'Graphite', hex: '#3C3C3C' }
      ]
    }
  },
  {
    id: 'apple-imac-m3',
    type: 'buy',
    brand: 'Apple',
    category: 'Desktop',
    name: 'iMac 24-inch M3',
    subtitle: '4.5K Retina Display • 8-Core GPU • Blue',
    price: 129900,
    originalPrice: 134900,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviews: 42,
    condition: 'New',
    status: 'AVAILABLE'
  },
  {
    id: 'lenovo-thinkpad-x1',
    type: 'rent',
    brand: 'Lenovo',
    category: 'Laptop',
    name: 'ThinkPad X1 Carbon Gen 12',
    subtitle: 'Intel Core Ultra • Carbon Fiber • Lightweight Pro',
    price: 2800,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    reviews: 89,
    condition: 'Open Box',
    status: 'RENTED',
    features: [
      { title: 'Ultra-Lightweight', description: 'Carbon fiber chassis weighing only 1.09 kg.', icon: 'flight_takeoff' },
      { title: 'MIL-SPEC Tested', description: 'Passed over 200 durability tests.', icon: 'security' },
      { title: 'Legendary Keyboard', description: 'The best typing experience in any laptop.', icon: 'keyboard' }
    ],
    fullSpecs: {
      'Build': { 'Chassis': 'Carbon Fiber', 'Weight': '1.09 kg', 'Thickness': '14.96 mm' },
      'CPU': { 'Model': 'Intel Core Ultra 7 155H', 'NPU': 'Integrated AI Engine' },
      'Security': { 'Scanner': 'Match-on-chip Fingerprint', 'Camera': 'IR for Windows Hello' }
    },
    rentalOptions: [
      { months: 12, price: 2800, label: 'Standard' },
      { months: 24, price: 2400, label: 'Long Term' }
    ]
  },
  {
    id: 'asus-proart-studiobook',
    type: 'buy',
    brand: 'Asus',
    category: 'Laptop',
    name: 'Asus ProArt Studiobook 16',
    subtitle: 'OLED HDR • ASUS Dial • Workstation Performance',
    price: 215000,
    originalPrice: 240000,
    image: 'https://images.unsplash.com/photo-1588872650979-af7de596e72c?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    reviews: 31,
    condition: 'New',
    status: 'AVAILABLE',
    features: [
      { title: 'ASUS Dial', description: 'Intuitive controller for creative apps.', icon: 'radio_button_checked' },
      { title: 'OLED HDR', description: 'Verified color accuracy with Delta E < 1.', icon: 'color_lens' },
      { title: 'Triple SSD Support', description: 'Massive storage expansion for pro projects.', icon: 'storage' }
    ],
    fullSpecs: {
      'Display': { 'Type': '16" 3.2K OLED HDR', 'Color': '100% DCI-P3', 'Accuracy': 'Pantone Validated' },
      'GPU': { 'Model': 'NVIDIA RTX 3000 Ada', 'VRAM': '8GB GDDR6' },
      'Interface': { 'Control': 'Physical ASUS Dial', 'Trackpad': 'Haptic with Stylus Support' }
    }
  },
  {
    id: 'logitech-mx-master-3s',
    type: 'buy',
    brand: 'Logitech',
    category: 'Mice',
    name: 'Logitech MX Master 3S',
    subtitle: 'Quiet Clicks • 8K DPI • Magspeed Scrolling',
    price: 9495,
    originalPrice: 10995,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop',
    rating: 4.9,
    reviews: 1250,
    condition: 'New',
    status: 'AVAILABLE'
  },
  {
    id: 'sony-wh1000xm5',
    type: 'buy',
    brand: 'Generic',
    category: 'Audio',
    name: 'Sony WH-1000XM5 ANC',
    subtitle: 'Industry Leading Noise Cancellation',
    price: 26900,
    originalPrice: 34990,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    rating: 4.8,
    reviews: 840,
    condition: 'New',
    status: 'AVAILABLE'
  },
  {
    id: 'keychron-q3-max',
    type: 'buy',
    brand: 'Generic',
    category: 'Keyboards',
    name: 'Keychron Q3 Max Mechanical',
    subtitle: 'Full Metal • Gasket Mount • Wireless',
    price: 18500,
    originalPrice: 21000,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91a603?q=80&w=1000&auto=format&fit=crop',
    rating: 4.9,
    reviews: 156,
    condition: 'New',
    status: 'AVAILABLE'
  },
  {
    id: 'dell-precision-workstation',
    type: 'rent',
    brand: 'Dell',
    category: 'Desktop',
    name: 'Dell Precision 7875 Tower',
    subtitle: 'AMD Threadripper PRO • NVIDIA RTX 6000 Ada',
    price: 25000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1591405416991-d0074467f62b?q=80&w=1200&auto=format&fit=crop',
    rating: 5.0,
    reviews: 12,
    condition: 'New',
    status: 'AVAILABLE',
    rentalOptions: [
      { months: 6, price: 28000, label: 'Project' },
      { months: 12, price: 25000, label: 'Annual' }
    ]
  },
  {
    id: 'lg-ultrafine-5k',
    type: 'buy',
    brand: 'Generic',
    category: 'Monitor',
    name: 'LG UltraFine 27" 5K',
    subtitle: 'Designed for Mac • P3 Wide Color • 5120 x 2880',
    price: 95000,
    originalPrice: 110000,
    image: 'https://images.unsplash.com/photo-1551645101-5292021517f5?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    reviews: 45,
    condition: 'Refurbished',
    status: 'OUT_OF_STOCK'
  },
  {
    id: 'microsoft-surface-pro-10',
    type: 'buy',
    brand: 'Generic',
    category: 'Tablet',
    name: 'Surface Pro 10 for Business',
    subtitle: 'Ultra-thin • Laptop Power • Tablet Flexibility',
    price: 115000,
    originalPrice: 125000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    reviews: 24,
    condition: 'New',
    status: 'AVAILABLE'
  },
  {
    id: 'hp-z-central-4g',
    type: 'rent',
    brand: 'HP',
    category: 'Desktop',
    name: 'HP Z Central 4G Workstation',
    subtitle: 'Intel Xeon • 128GB RAM • Reliable Deployment',
    price: 12000,
    originalPrice: 15000,
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviews: 9,
    condition: 'Refurbished',
    status: 'AVAILABLE',
    rentalOptions: [
      { months: 12, price: 12000, label: 'Managed' }
    ]
  },
  {
    id: 'apple-mac-studio-m2',
    type: 'rent',
    brand: 'Apple',
    category: 'Desktop',
    name: 'Mac Studio M2 Ultra',
    subtitle: 'Compact Powerhouse • 24-core CPU • 76-core GPU',
    price: 15000,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1629738453147-3f32420958f2?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviews: 55,
    condition: 'Open Box',
    status: 'AVAILABLE',
    rentalOptions: [
      { months: 6, price: 18000, label: 'Creative' },
      { months: 12, price: 15000, label: 'Standard' }
    ]
  },
  {
    id: 'asus-rog-swift-monitor',
    type: 'buy',
    brand: 'Asus',
    category: 'Monitor',
    name: 'ASUS ROG Swift 32" 4K',
    subtitle: 'OLED • 240Hz • 0.03ms Response • HDR10',
    price: 115000,
    originalPrice: 129000,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviews: 38,
    condition: 'New',
    status: 'AVAILABLE'
  },
  {
    id: 'lenovo-p620-workstation',
    type: 'rent',
    brand: 'Lenovo',
    category: 'Desktop',
    name: 'Lenovo ThinkStation P620',
    subtitle: 'AMD Threadripper • ISV Certified • Rack Mountable',
    price: 18000,
    originalPrice: 25000,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviews: 14,
    condition: 'Refurbished',
    status: 'AVAILABLE',
    rentalOptions: [
      { months: 12, price: 18000, label: 'Compute Tier' }
    ]
  },
  {
    id: 'logitech-g-pro-keyboard',
    type: 'buy',
    brand: 'Logitech',
    category: 'Keyboards',
    name: 'Logitech G PRO X TKL',
    subtitle: 'LIGHTSPEED Wireless • GX Switches • RGB',
    price: 17995,
    originalPrice: 19995,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33faf9c1?q=80&w=1000&auto=format&fit=crop',
    rating: 4.7,
    reviews: 112,
    condition: 'New',
    status: 'AVAILABLE'
  }
];