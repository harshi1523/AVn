import React, { useMemo } from 'react';
import { Order } from '../../lib/store';

interface AdminFinancialsProps {
    startDate: Date;
    endDate: Date;
    allOrders: Order[];
}

const AdminFinancials: React.FC<AdminFinancialsProps> = ({ startDate, endDate, allOrders }) => {
    const finData = useMemo(() => {
        const finOrders = allOrders.filter(o => {
            const d = new Date(o.date);
            return d >= startDate && d <= endDate;
        });

        const rentalOrders = finOrders.filter(o => o.items.some(i => i.type === 'rent'));
        const purchaseOrders = finOrders.filter(o => o.items.every(i => i.type === 'buy'));

        const totalRev = finOrders.reduce((s, o) => s + (o.total || 0), 0);
        const rentalRev = rentalOrders.reduce((s, o) => s + (o.total || 0), 0);
        const purchaseRev = purchaseOrders.reduce((s, o) => s + (o.total || 0), 0);
        const avgOrder = finOrders.length > 0 ? totalRev / finOrders.length : 0;

        const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const isDaily = dayDiff <= 31;
        const chartBuckets: { label: string; date: Date; rental: number; purchase: number }[] = [];

        if (isDaily) {
            for (let i = 0; i < dayDiff; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                chartBuckets.push({ date: d, label: `${d.getDate()}/${d.getMonth() + 1}`, rental: 0, purchase: 0 });
            }
        } else {
            const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
            for (let i = 0; i < monthDiff; i++) {
                const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                chartBuckets.push({ date: d, label: d.toLocaleString('default', { month: 'short' }), rental: 0, purchase: 0 });
            }
        }

        finOrders.forEach(order => {
            const od = new Date(order.date);
            const bucket = chartBuckets.find(b =>
                isDaily
                    ? b.date.getDate() === od.getDate() && b.date.getMonth() === od.getMonth() && b.date.getFullYear() === od.getFullYear()
                    : b.date.getMonth() === od.getMonth() && b.date.getFullYear() === od.getFullYear()
            );
            if (bucket) {
                if (order.items.some(i => i.type === 'rent')) bucket.rental += order.total || 0;
                else bucket.purchase += order.total || 0;
            }
        });

        const maxBucket = Math.max(...chartBuckets.map(b => b.rental + b.purchase), 1000);

        return { totalRev, rentalRev, purchaseRev, avgOrder, chartBuckets, maxBucket, finOrders };
    }, [startDate, endDate, allOrders]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand-card border border-white/5 p-8 rounded-[2rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Period Revenue</p>
                    <p className="text-3xl font-black text-white">₹{finData.totalRev.toLocaleString()}</p>
                </div>
                <div className="bg-brand-card border border-white/5 p-8 rounded-[2rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Rentals Revenue</p>
                    <p className="text-3xl font-black text-purple-400">₹{finData.rentalRev.toLocaleString()}</p>
                </div>
                <div className="bg-brand-card border border-white/5 p-8 rounded-[2rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Sales Revenue</p>
                    <p className="text-3xl font-black text-blue-400">₹{finData.purchaseRev.toLocaleString()}</p>
                </div>
                <div className="bg-brand-card border border-white/5 p-8 rounded-[2rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Average Order Value</p>
                    <p className="text-3xl font-black text-white">₹{Math.round(finData.avgOrder).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-brand-card border border-white/5 p-10 rounded-[3rem] shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-8">Revenue Stream Mix</h3>
                <div className="h-80 flex items-end gap-2 lg:gap-4 relative pt-10 px-4">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-8 py-10 opacity-20">
                        {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-white/10" />)}
                    </div>
                    {finData.chartBuckets.map((b, i) => {
                        const hRent = (b.rental / finData.maxBucket) * 100;
                        const hBuy = (b.purchase / finData.maxBucket) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all bg-white text-black text-[9px] font-black p-3 rounded-xl z-30 shadow-2xl whitespace-nowrap min-w-[80px]">
                                    <p className="text-gray-500 underline mb-1">{b.label}</p>
                                    <p className="text-purple-600">Rent: ₹{b.rental.toLocaleString()}</p>
                                    <p className="text-blue-600">Sales: ₹{b.purchase.toLocaleString()}</p>
                                </div>
                                <div className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden border border-white/5">
                                    <div className="bg-purple-500 shadow-glow" style={{ height: `${hRent}%` }} />
                                    <div className="bg-blue-500" style={{ height: `${hBuy}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-8 text-[9px] text-gray-500 font-black uppercase px-4 truncate">
                    {finData.chartBuckets.filter((_, i) => {
                        if (finData.chartBuckets.length > 20) return i % 5 === 0;
                        return true;
                    }).map((b, i) => <span key={i}>{b.label}</span>)}
                </div>
            </div>
        </div>
    );
};

export default AdminFinancials;
