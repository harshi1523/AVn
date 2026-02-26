import React from 'react';
import { Product } from '../../lib/mockData';
import { User, useStore } from '../../lib/store';

interface AdminInventoryProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredProducts: Product[];
    setSelectedProduct: (product: Product | null) => void;
    setEditingProduct: (product: Product | null) => void;
    setIsAddProductOpen: (isOpen: boolean) => void;
    allUsers: User[];
}

const AdminInventory: React.FC<AdminInventoryProps> = ({
    searchTerm,
    setSearchTerm,
    filteredProducts,
    setSelectedProduct,
    setEditingProduct,
    setIsAddProductOpen,
    allUsers,
}) => {
    const { deleteProduct } = useStore();

    return (
        <div className="space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-5 mb-10 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-brand-border rounded-xl pl-12 pr-10 py-4 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setIsAddProductOpen(true); }}
                    className="bg-cta-gradient hover:brightness-110 transition-all text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 w-full md:w-auto text-center cursor-pointer active:scale-95 shadow-lg"
                >
                    <span className="material-symbols-outlined">add</span> Add New Product
                </button>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                    <p className="text-xl font-bold text-white">No results found</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
                    <button onClick={() => setSearchTerm('')} className="mt-6 text-brand-primary font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 shadow-xl group hover:border-brand-primary/50 transition-all">
                            <div
                                onClick={() => setSelectedProduct(p)}
                                className="aspect-[4/3] bg-black/40 rounded-[1.5rem] mb-6 p-6 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors relative overflow-hidden"
                            >
                                <img src={p.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20">Quick View</span>
                                </div>
                            </div>
                            <h3 className="text-white font-bold tracking-tight mb-2 truncate">{p.name}</h3>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${p.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    p.status === 'RENTED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>{p.status || 'AVAILABLE'}</span>
                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-white/5 text-gray-400 border border-white/10">
                                    Qty: {p.stock ?? 0}
                                </span>
                                {!!p.deposit && (
                                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-white/5 text-gray-400 border border-white/10">
                                        Dep: ₹{p.deposit.toLocaleString()}
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${p.isPublic ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                    {p.isPublic ? 'Public' : 'Hidden'}
                                </span>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button onClick={() => { setEditingProduct(p); setIsAddProductOpen(true); }} className="flex-1 bg-white/5 hover:bg-white/10 py-4 lg:py-3 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-white transition-all cursor-pointer min-h-[44px] flex items-center justify-center">Edit</button>
                                <button onClick={() => {
                                    const activeOrders = allUsers.flatMap(u => (u as any).orders || []).filter((o: any) =>
                                        (o.status === 'Placed' || o.status === 'Shipped' || o.status === 'Active Rental' || o.status === 'In Use' || o.status === 'Awaiting Delivery') &&
                                        o.items.some((i: any) => i.productId === p.id)
                                    );

                                    let message = `Are you sure you want to delete "${p.name}"?`;
                                    if (activeOrders.length > 0) {
                                        message += `\n\nWARNING: This product is currently in ${activeOrders.length} ACTIVE order(s)/rental(s).\nDeleting it will NOT remove it from existing orders, but it will be removed from the catalog.`;
                                    } else {
                                        message += `\n\nThis action cannot be undone.`;
                                    }

                                    if (confirm(message)) {
                                        deleteProduct(p.id)
                                            .then(() => alert("Product deleted successfully"))
                                            .catch((err: any) => alert("Failed to delete product: " + err.message));
                                    }
                                }} className="flex-1 bg-white/5 hover:bg-red-500/20 py-4 lg:py-3 rounded-xl text-[9px] font-black uppercase text-red-400/50 hover:text-red-400 transition-all cursor-pointer min-h-[44px] flex items-center justify-center">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
