import React, { useState } from 'react';
import { Order, User, useStore } from '../../lib/store';
import { generateInvoice } from '../../lib/invoice';

interface AdminOrdersProps {
    allOrders: Order[];
    allUsers: User[];
    startDate: Date;
    endDate: Date;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ allOrders, allUsers, startDate, endDate }) => {
    const { updateOrderStatus, updateOrderNotes } = useStore();
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'All'>('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState('');

    const filteredOrders = allOrders.filter(o => {
        const d = new Date(o.date);
        const matchesDate = d >= startDate && d <= endDate;
        return matchesDate && (filterStatus === 'All' || o.status === filterStatus);
    });

    return (
        <div className="bg-brand-card border border-brand-border rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Order Management</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setFilterStatus('Return Requested')}
                        className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors mr-2 font-bold"
                    >
                        Return Requests ({allOrders.filter(o => o.status === 'Return Requested').length})
                    </button>
                    {(filterStatus !== 'All') && (
                        <button
                            onClick={() => { setFilterStatus('All'); }}
                            className="text-xs text-brand-primary hover:text-white transition-colors underline"
                        >
                            Clear Filters
                        </button>
                    )}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="custom-select bg-black/40 border border-brand-border rounded-xl text-xs text-gray-400 px-4 py-2 focus:outline-none focus:border-brand-primary cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        <option value="All" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>All Statuses</option>
                        <option value="Placed" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Placed</option>
                        <option value="Shipped" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Shipped</option>
                        <option value="Delivered" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Delivered</option>
                        <option value="In Use" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>In Use (Active Rentals)</option>
                        <option value="Return Requested" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Return Requested</option>
                        <option value="Returned" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Returned</option>
                        <option value="Completed" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Completed</option>
                        <option value="Cancelled" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="md:hidden space-y-4">
                {filteredOrders.length === 0 ? <p className="text-gray-500 text-center py-8">No orders found.</p> : filteredOrders.map(order => (
                    <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white/5 rounded-2xl p-6 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-white font-bold">{order.userName}</p>
                                <p className="text-[10px] text-gray-500">{order.id}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{order.date}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        order.status === 'In Use' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {order.status}
                                </span>
                                <span className="text-[9px] text-gray-400 bg-white/5 px-2 py-1 rounded">{order.items[0]?.type === 'rent' ? 'Rental' : 'Purchase'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5 gap-2">
                            <p className="text-white font-bold">₹{order.total.toLocaleString()}</p>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await generateInvoice(order, allUsers.find(u => u.id === order.userId) || null);
                                }}
                                className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 hover:text-white transition-colors ml-auto"
                                title="Download Invoice"
                            >
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto min-h-[500px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.1em] border-b border-white/5">
                            <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                            <th className="px-6 py-4 whitespace-nowrap">Date</th>
                            <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                            <th className="px-6 py-4 whitespace-nowrap">Type</th>
                            <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                            <th className="px-6 py-4 whitespace-nowrap">Payment</th>
                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 text-right whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-500">No orders found for selected filters.</td></tr> : filteredOrders.map(order => (
                            <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                <td className="px-6 py-4 text-white font-mono text-xs">{order.id}</td>
                                <td className="px-6 py-4 text-gray-400 text-xs">{order.date}</td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-bold text-xs">{order.userName}</p>
                                    <p className="text-[10px] text-gray-500">{order.userEmail}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${order.items[0]?.type === 'rent' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {order.items[0]?.type === 'rent' ? 'Rental' : 'Buy'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white font-bold text-sm">₹{order.total.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {order.paymentStatus || 'Paid'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            order.status === 'In Use' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={async () => {
                                                await generateInvoice(order, allUsers.find(u => u.id === order.userId) || null);
                                            }}
                                            className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            title="Download Invoice"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                        </button>
                                        <select
                                            onChange={(e) => {
                                                const newStatus = e.target.value as any;
                                                if (newStatus === 'Shipped') {
                                                    const courier = prompt("Enter Courier Name:");
                                                    const tracking = prompt("Enter Tracking Number:");
                                                    if (courier && tracking) {
                                                        updateOrderStatus(order.id, newStatus, { courier, trackingNumber: tracking });
                                                    } else {
                                                        alert("Tracking info is required for Shipped status.");
                                                    }
                                                } else {
                                                    updateOrderStatus(order.id, newStatus);
                                                }
                                            }}
                                            className="custom-select bg-black/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 p-2 focus:outline-none focus:border-brand-primary"
                                            value={order.status}
                                        >
                                            <option value="Placed" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Placed</option>
                                            <option value="Processing" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Processing</option>
                                            <option value="Shipped" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Shipped</option>
                                            <option value="Delivered" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Delivered</option>
                                            {order.items.some(i => i.type === 'rent') && (
                                                <>
                                                    <option value="In Use" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>In Use (Active)</option>
                                                    <option value="Return Requested" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Return Requested</option>
                                                    <option value="Returned" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Returned</option>
                                                </>
                                            )}
                                            <option value="Completed" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Completed</option>
                                            <option value="Cancelled" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Cancelled</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-brand-page border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-white/5 flex justify-between items-start sticky top-0 bg-brand-page/95 backdrop-blur z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Order Details</h2>
                                <p className="text-sm text-gray-500 font-mono">#{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Customer Info</h4>
                                    <div className="space-y-2">
                                        <p className="text-white font-bold text-lg">{selectedOrder.userName}</p>
                                        <p className="text-gray-400 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">mail</span> {selectedOrder.userEmail}</p>
                                        <p className="text-gray-400 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">call</span> {allUsers.find(u => u.id === selectedOrder.userId)?.addresses?.[0]?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Delivery Details</h4>
                                    <div className="space-y-2">
                                        <p className="text-gray-300 text-sm leading-relaxed">{selectedOrder.address}</p>
                                        <div className="mt-4 flex gap-4">
                                            <div className="text-center bg-black/40 p-3 rounded-xl border border-white/5 flex-1">
                                                <p className="text-[10px] text-gray-500 uppercase">Method</p>
                                                <p className="text-white font-bold">{selectedOrder.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
                                            </div>
                                            <div className="text-center bg-black/40 p-3 rounded-xl border border-white/5 flex-1">
                                                <p className="text-[10px] text-gray-500 uppercase">Status</p>
                                                <p className="text-brand-primary font-bold">{selectedOrder.status}</p>
                                            </div>
                                        </div>
                                        {selectedOrder.trackingInfo && (
                                            <div className="mt-2 bg-brand-primary/10 p-3 rounded-xl border border-brand-primary/20">
                                                <p className="text-[10px] text-brand-primary uppercase font-bold">Tracking Info</p>
                                                <p className="text-white text-xs mt-1">{selectedOrder.trackingInfo.courier}: {selectedOrder.trackingInfo.trackingNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Ordered Items</h4>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                                <div className="w-16 h-16 bg-white/5 rounded-xl p-2 flex-shrink-0">
                                                    <img src={item.image} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-bold text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                    {item.type === 'rent' && (
                                                        <div className="mt-1 flex gap-2">
                                                            <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/20">Rent: {item.tenure} Months</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-bold text-sm">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Internal Notes</h4>
                                    <div className="space-y-4 mb-4">
                                        {selectedOrder.internalNotes?.map((note) => (
                                            <div key={note.id} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-xs text-brand-primary font-bold">{note.author}</p>
                                                        <p className="text-[10px] text-gray-500">{new Date(note.date).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {editingNoteId === note.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedNotes = selectedOrder.internalNotes?.map(n =>
                                                                            n.id === note.id ? { ...n, content: editingNoteContent, date: new Date().toISOString() + ' (Edited)' } : n
                                                                        );
                                                                        updateOrderNotes(selectedOrder.id, updatedNotes || []);
                                                                        setSelectedOrder({ ...selectedOrder, internalNotes: updatedNotes });
                                                                        setEditingNoteId(null);
                                                                    }}
                                                                    className="text-green-500"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                                </button>
                                                                <button onClick={() => setEditingNoteId(null)} className="text-gray-500">
                                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingNoteId(note.id);
                                                                        setEditingNoteContent(note.content);
                                                                    }}
                                                                    className="text-gray-500 hover:text-white"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {editingNoteId === note.id ? (
                                                    <textarea
                                                        value={editingNoteContent}
                                                        onChange={(e) => setEditingNoteContent(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-300">{note.content}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 col-span-1 md:col-span-2">
                                <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Order Timeline</h4>
                                <div className="space-y-4">
                                    {selectedOrder.timeline?.map((event, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                                                {idx !== (selectedOrder.timeline?.length || 0) - 1 && <div className="w-px h-full bg-white/10 my-1"></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-bold">{event.status}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(event.date).toLocaleString()}</p>
                                                {event.note && <p className="text-[10px] text-gray-400 mt-1">{event.note}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
