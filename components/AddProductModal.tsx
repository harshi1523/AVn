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
        type: 'rent',
        category: 'Laptop',
        brand: 'Generic',
        condition: 'New',
        status: 'AVAILABLE',
        rating: 5,
        reviews: 0,
        image: '', // No default image
        features: [],
        rentalOptions: [],
        deposit: 0
    });

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
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'originalPrice' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.name || !formData.price) {
            alert("Name and Price are required");
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
            <div className="relative w-full max-w-2xl bg-brand-card rounded-[2rem] shadow-2xl border border-brand-border p-8 animate-in zoom-in-95 duration-300">
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
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                                placeholder="e.g. MacBook Pro M3"
                                required
                            />
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
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price || ''}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                                placeholder="0.00"
                                required
                            />
                        </div>
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
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            >
                                <option value="rent">Rent</option>
                                <option value="buy">Buy</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            >
                                <option value="Laptop">Laptop</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Monitor">Monitor</option>
                                <option value="Audio">Audio</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Brand</label>
                            <select
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                            >
                                <option value="Apple">Apple</option>
                                <option value="Dell">Dell</option>
                                <option value="HP">HP</option>
                                <option value="Lenovo">Lenovo</option>
                                <option value="Asus">Asus</option>
                                <option value="Generic">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Rental Specific Fields */}
                    {formData.type === 'rent' && (
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
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Image</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-black/40 border border-brand-border flex items-center justify-center overflow-hidden relative group">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-gray-600">image</span>
                                )}
                                {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Validate File Type
                                        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                        if (!validTypes.includes(file.type)) {
                                            alert('Invalid file type. Please upload JPG, PNG, or WEBP.');
                                            return;
                                        }

                                        setLoading(true);
                                        try {
                                            const fileExt = file.name.split('.').pop();
                                            const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                                            const filePath = `${fileName}`;

                                            const { error: uploadError } = await supabase.storage
                                                .from('product-images')
                                                .upload(filePath, file);

                                            if (uploadError) throw uploadError;

                                            const { data: { publicUrl } } = supabase.storage
                                                .from('product-images')
                                                .getPublicUrl(filePath);

                                            setFormData(prev => ({ ...prev, image: publicUrl }));
                                        } catch (error) {
                                            console.error('Error uploading image:', error);
                                            alert('Error uploading image. Please check if "product-images" bucket exists and is public.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="hidden"
                                    id="product-image-upload"
                                />
                                <label
                                    htmlFor="product-image-upload"
                                    className="cursor-pointer inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-brand-border"
                                >
                                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                                    {formData.image ? 'Change Image' : 'Upload New Image'}
                                </label>
                                <p className="text-[10px] text-gray-500 mt-2">Recommended: PNG, JPG, WEBP. Max 5MB.</p>
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
            </div>
        </div>
    );
}
