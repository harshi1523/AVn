import React, { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { Product, ProductFeature, RentalOption } from "../lib/mockData";
import { supabase } from "../lib/supabase"; // Use Supabase Storage

interface AddProductModalProps {
    onClose: () => void;
    productToEdit?: Product | null;
}

export default function AddProductModal({ onClose, productToEdit }: AddProductModalProps) {
    const { addProduct, updateProduct } = useStore();
    const [loading, setLoading] = useState(false);
    const [newFeature, setNewFeature] = useState<ProductFeature>({ title: '', description: '', icon: 'star' });
    const [formData, setFormData] = useState<Partial<Product>>(productToEdit || {
        availability: 'rent',
        category: undefined,
        brand: undefined,
        condition: 'New',
        status: 'AVAILABLE',
        rating: 5,
        reviews: 0,
        image: '', // No default image
        features: [],
        rentalOptions: [],
        deposit: 0,
        buyPrice: 0,
        isPublic: true // Default to visible for new products
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Rental Option State
    const [newRentalOption, setNewRentalOption] = useState<RentalOption>({ months: 0, price: 0, label: '', discount: '' });

    const handleAddRentalOption = () => {
        if (!newRentalOption.months || !newRentalOption.price) return;
        setFormData(prev => ({
            ...prev,
            rentalOptions: [...(prev.rentalOptions || []), newRentalOption]
        }));
        setNewRentalOption({ months: 0, price: 0, label: '', discount: '' });
    };

    const handleRemoveRentalOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rentalOptions: (prev.rentalOptions || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddFeature = () => {
        if (!newFeature.title || !newFeature.description) return;
        setFormData(prev => ({
            ...prev,
            features: [...(prev.features || []), newFeature]
        }));
        setNewFeature({ title: '', description: '', icon: 'star' });
    };

    const handleRemoveFeature = (index: number) => {
        if (!confirm("Remove this feature?")) return;
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: name === 'price' || name === 'originalPrice' || name === 'stock' ? Number(value) : value
            };

            // Reset rental specific fields if switching to buy only
            if (name === 'availability' && value === 'buy') {
                updated.rentalOptions = [];
                updated.deposit = 0;
            }
            return updated;
        });
    };

    const handleToggleVisibility = () => {
        setFormData(prev => ({
            ...prev,
            isPublic: !prev.isPublic
        }));
    };

    const isRentable = formData.availability === 'rent' || formData.availability === 'both';
    const isBuyable = formData.availability === 'buy' || formData.availability === 'both';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = "Product name is required";

        // Context-aware error message for price
        if (isRentable) {
            if (!formData.price || formData.price <= 0) newErrors.price = "Valid Monthly Rent is required";
        }
        if (formData.availability === 'buy') {
            if (!formData.price || formData.price <= 0) newErrors.price = "Valid Selling Price is required";
        }
        if (formData.availability === 'both') {
            if (!formData.buyPrice || formData.buyPrice <= 0) newErrors.buyPrice = "Valid Selling Price is required";
        }

        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.brand) newErrors.brand = "Brand is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            if (productToEdit) {
                await updateProduct({ ...productToEdit, ...formData } as Product);
            } else {
                await addProduct(formData as Omit<Product, 'id'>);
            }
            onClose();
        } catch (error: any) {
            console.error("Error saving product:", error);
            alert(`Failed to save product: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-brand-card rounded-[2rem] shadow-2xl border border-brand-border p-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-display font-bold text-white">
                        {productToEdit ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Name</label>
                            <input
                                name="name"
                                value={formData.name || ''}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                                className={`w-full bg-black/40 border ${errors.name ? 'border-red-500' : 'border-brand-border'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm`}
                                placeholder="e.g. MacBook Pro M3"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subtitle</label>
                            <input
                                name="subtitle"
                                value={formData.subtitle || ''}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                                placeholder="e.g. 16GB RAM • 512GB SSD"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isRentable && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly Rent (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (errors.price) setErrors({ ...errors, price: '' });
                                    }}
                                    className={`w-full bg-black/40 border ${errors.price ? 'border-red-500' : 'border-brand-border'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm`}
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                            </div>
                        )}

                        {isBuyable && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selling Price (₹)</label>
                                <input
                                    type="number"
                                    name={formData.type === 'rent_and_buy' ? 'buyPrice' : 'price'}
                                    value={(formData.type === 'rent_and_buy' ? formData.buyPrice : formData.price) || ''}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const key = formData.type === 'rent_and_buy' ? 'buyPrice' : 'price';
                                        if (errors[key]) setErrors({ ...errors, [key]: '' });
                                    }}
                                    className={`w-full bg-black/40 border ${errors[formData.availability === 'both' ? 'buyPrice' : 'price'] ? 'border-red-500' : 'border-brand-border'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm`}
                                    placeholder="0.00"
                                />
                                {errors.buyPrice && formData.availability === 'both' && <p className="text-red-500 text-xs mt-1">{errors.buyPrice}</p>}
                                {errors.price && formData.availability === 'buy' && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Original Price (₹)</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice || ''}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Availability</label>
                            <select
                                name="availability"
                                value={formData.availability}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            >
                                <option value="rent" style={{ backgroundColor: 'white', color: 'black' }}>Rent Only</option>
                                <option value="buy" style={{ backgroundColor: 'white', color: 'black' }}>Buy Only</option>
                                <option value="both" style={{ backgroundColor: 'white', color: 'black' }}>Both (Buy & Rent)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                            <select
                                name="category"
                                value={formData.category || ''}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (errors.category) setErrors({ ...errors, category: '' });
                                }}
                                className={`w-full bg-black/40 border ${errors.category ? 'border-red-500' : 'border-brand-border'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm`}
                            >
                                <option value="" disabled style={{ backgroundColor: 'white', color: 'gray' }}>Select Category</option>
                                <option value="Laptop" style={{ backgroundColor: 'white', color: 'black' }}>Laptop</option>
                                <option value="Desktop" style={{ backgroundColor: 'white', color: 'black' }}>Desktop</option>
                                <option value="Monitor" style={{ backgroundColor: 'white', color: 'black' }}>Monitor</option>
                                <option value="Audio" style={{ backgroundColor: 'white', color: 'black' }}>Audio</option>
                                <option value="Gaming" style={{ backgroundColor: 'white', color: 'black' }}>Gaming</option>
                                <option value="Accessories" style={{ backgroundColor: 'white', color: 'black' }}>Accessories</option>
                            </select>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Brand</label>
                            <select
                                name="brand"
                                value={formData.brand || ''}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (errors.brand) setErrors({ ...errors, brand: '' });
                                }}
                                className={`w-full bg-black/40 border ${errors.brand ? 'border-red-500' : 'border-brand-border'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm`}
                            >
                                <option value="" disabled style={{ backgroundColor: 'white', color: 'gray' }}>Select Brand</option>
                                <option value="Apple" style={{ backgroundColor: 'white', color: 'black' }}>Apple</option>
                                <option value="Dell" style={{ backgroundColor: 'white', color: 'black' }}>Dell</option>
                                <option value="HP" style={{ backgroundColor: 'white', color: 'black' }}>HP</option>
                                <option value="Lenovo" style={{ backgroundColor: 'white', color: 'black' }}>Lenovo</option>
                                <option value="Asus" style={{ backgroundColor: 'white', color: 'black' }}>Asus</option>
                                <option value="Generic" style={{ backgroundColor: 'white', color: 'black' }}>Other</option>
                            </select>
                            {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                            <select
                                name="status"
                                value={formData.status || 'AVAILABLE'}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            >
                                <option value="AVAILABLE" style={{ backgroundColor: 'white', color: 'black' }}>Available</option>
                                <option value="LOW STOCK" style={{ backgroundColor: 'white', color: 'black' }}>Low Stock</option>
                                <option value="OUT_OF_STOCK" style={{ backgroundColor: 'white', color: 'black' }}>Out of Stock</option>
                                <option value="RENTED" style={{ backgroundColor: 'white', color: 'black' }}>Rented</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Condition</label>
                            <select
                                name="condition"
                                value={formData.condition || 'New'}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            >
                                <option value="New" style={{ backgroundColor: 'white', color: 'black' }}>New</option>
                                <option value="Refurbished" style={{ backgroundColor: 'white', color: 'black' }}>Refurbished</option>
                                <option value="Open Box" style={{ backgroundColor: 'white', color: 'black' }}>Open Box</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={(formData as any).stock ?? ''}
                                onChange={handleChange}
                                min={0}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-6 flex items-center justify-between group hover:border-brand-primary/40 transition-all">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className={`material-symbols-outlined text-lg ${formData.isPublic ? 'text-brand-primary' : 'text-gray-500'}`}>
                                    {formData.isPublic ? 'visibility' : 'visibility_off'}
                                </span>
                                Guest Visibility
                            </h4>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                {formData.isPublic ? 'Visible on storefront' : 'Hidden from guests (Admin Only)'}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={handleToggleVisibility}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </label>
                    </div>

                    {/* Rental Specific Fields */}
                    {isRentable && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Deposit (₹)</label>
                                <input
                                    type="number"
                                    name="deposit"
                                    value={formData.deposit || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rental Tenure Options</label>
                                <span className="text-[10px] text-gray-600">{formData.rentalOptions?.length || 0} Options</span>
                            </div>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[9px] text-gray-500">Months</label>
                                    <input
                                        type="number"
                                        placeholder="Duration"
                                        value={newRentalOption.months || ''}
                                        onChange={e => setNewRentalOption({ ...newRentalOption, months: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[9px] text-gray-500">Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newRentalOption.price || ''}
                                        onChange={e => setNewRentalOption({ ...newRentalOption, price: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                                    />
                                </div>
                                <div className="flex-[2] space-y-1">
                                    <label className="text-[9px] text-gray-500">Label (e.g. Short Term)</label>
                                    <input
                                        placeholder="Label"
                                        value={newRentalOption.label}
                                        onChange={e => setNewRentalOption({ ...newRentalOption, label: e.target.value })}
                                        className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddRentalOption}
                                    className="bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary border border-brand-primary/50 w-11 h-11 rounded-xl flex items-center justify-center mb-[1px]"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.rentalOptions?.map((opt, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-4 flex justify-between items-center group">
                                        <div>
                                            <p className="text-white font-bold text-sm">{opt.months} Months - ₹{opt.price}</p>
                                            <p className="text-gray-400 text-xs">{opt.label}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRentalOption(index)}
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Features</label>
                            <span className="text-[10px] text-gray-600">{formData.features?.length || 0} Added</span>
                        </div>

                        {/* Feature Input */}
                        <div className="flex gap-4 items-start">
                            <input
                                placeholder="Feature Title"
                                value={newFeature.title}
                                onChange={e => setNewFeature({ ...newFeature, title: e.target.value })}
                                className="flex-1 bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            />
                            <input
                                placeholder="Description"
                                value={newFeature.description}
                                onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                                className="flex-[2] bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary border border-brand-primary/50 w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-1 gap-3">
                            {formData.features?.map((feature, index) => (
                                <div key={index} className="bg-white/5 rounded-xl p-4 flex justify-between items-center group">
                                    <div>
                                        <p className="text-white font-bold text-sm">{feature.title}</p>
                                        <p className="text-gray-400 text-xs">{feature.description}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(index)}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/10">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Images</label>
                        <div className="space-y-4">
                            {/* Image Preview Grid */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10 bg-black/40">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {index === 0 && <span className="text-[8px] font-black uppercase bg-brand-primary text-black px-1 rounded absolute top-1 left-1">Main</span>}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updatedImages = formData.images?.filter((_, i) => i !== index) || [];
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            images: updatedImages,
                                                            image: updatedImages[0] || ''
                                                        }));
                                                    }}
                                                    className="p-1 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files || files.length === 0) return;

                                        // Validate Max Images
                                        const currentImages = formData.images || (formData.image ? [formData.image] : []);
                                        if (currentImages.length + files.length > 10) {
                                            alert('Maximum 10 images allowed.');
                                            return;
                                        }

                                        setLoading(true);
                                        const newImages: string[] = [];

                                        try {
                                            for (let i = 0; i < files.length; i++) {
                                                const file = files[i];

                                                // Validate File Type
                                                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                                if (!validTypes.includes(file.type)) {
                                                    alert('Invalid file format. Supported: JPG, PNG, WEBP');
                                                    continue;
                                                }

                                                // Validate File Size (5MB)
                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert(`File ${file.name} exceeds 5MB limit.`);
                                                    continue;
                                                }

                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                                                // Make path unique per file
                                                const filePath = `${fileName}`;

                                                const { error: uploadError } = await supabase.storage
                                                    .from('product-images')
                                                    .upload(filePath, file);

                                                if (uploadError) throw uploadError;

                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('product-images')
                                                    .getPublicUrl(filePath);

                                                newImages.push(publicUrl);
                                            }

                                            // Update State
                                            setFormData(prev => {
                                                const updatedImages = [...(prev.images || (prev.image ? [prev.image] : [])), ...newImages];
                                                // Ensure no duplicates if needed, but simple append is fine
                                                return {
                                                    ...prev,
                                                    image: updatedImages[0] || '', // Primary image
                                                    images: updatedImages
                                                };
                                            });

                                        } catch (error) {
                                            console.error('Error uploading images:', error);
                                            alert('Failed to upload some images. Please try again.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="hidden"
                                    id="product-image-upload"
                                />
                                <label
                                    htmlFor="product-image-upload"
                                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 hover:border-brand-primary/50 transition-all cursor-pointer group"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-gray-500 group-hover:text-brand-primary mb-2 transition-colors">cloud_upload</span>
                                    )}
                                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                                        {loading ? 'Uploading...' : 'Click to Upload Images'}
                                    </span>
                                    <span className="text-[9px] text-gray-500 mt-1">
                                        Supported: JPG, PNG, WEBP (Max 5MB). Up to 10 images.
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-brand-border text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-cta-gradient text-white hover:brightness-110 active:scale-95 transition-all shadow-glow"
                        >
                            {loading ? 'Saving...' : (productToEdit ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}

/* 
 * CRITICAL UI FIX FOR VISIBILITY:
 * The modal container has `max-w-2xl` but no fixed height or overflow control in the original code beyond window size.
 * The user reported button visibility issues.
 * Ensuring the modal body is scrollable if content overflows viewport height.
 * In the `className` of the main container: added `max-h-[90vh] overflow-y-auto`.
 */
