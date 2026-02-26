import React, { useMemo } from 'react';
import { Order, Ticket } from '../../lib/store';

interface AdminOverviewProps {
    startDate: Date;
    endDate: Date;
    allOrders: Order[];
    filteredOrders: Order[];
    tickets: Ticket[];
    dateRange: string;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
    startDate,
    endDate,
    allOrders,
    filteredOrders,
    tickets,
    dateRange,
}) => {
    const { calculatedRevenue, growthPercentage, activeRentalsCount, activeReturnsCount, pendingTicketsCount } = useMemo(() => {
        const calculatedRevenue = filteredOrders
            .filter(o => o.status === 'Completed' || o.status === 'Delivered')
            .reduce((acc, order) => acc + (order.total || 0), 0);

        const duration = endDate.getTime() - startDate.getTime();
        const previousEndDate = new Date(startDate);
        const previousStartDate = new Date(startDate.getTime() - duration);

        const previousOrders = allOrders.filter(o => {
            const d = new Date(o.date);
            return d >= previousStartDate && d < previousEndDate;
        });

        const previousRevenue = previousOrders
            .filter(o => o.status === 'Completed' || o.status === 'Delivered')
            .reduce((acc, order) => acc + (order.total || 0), 0);

        const growthPercentage = previousRevenue === 0
            ? (calculatedRevenue > 0 ? 100 : 0)
            : ((calculatedRevenue - previousRevenue) / previousRevenue) * 100;

        const activeRentalsCount = allOrders.filter(o => {
            if (o.items.some(i => i.type === 'rent')) {
                if (o.rentalStartDate && o.rentalEndDate) {
                    const start = new Date(o.rentalStartDate);
                    const end = new Date(o.rentalEndDate);
                    return start <= endDate && end >= endDate;
                }
                return (o.status === 'Active Rental' || o.status === 'In Use');
            }
            return false;
        }).length;

        const activeReturnsCount = allOrders.filter(o => o.status === 'Return Requested').length;
        const pendingTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

        return { calculatedRevenue, growthPercentage, activeRentalsCount, activeReturnsCount, pendingTicketsCount };
    }, [filteredOrders, allOrders, startDate, endDate, tickets]);

    const stats = [
        { label: 'Total Revenue', value: `₹${(calculatedRevenue / 1000000).toFixed(2)}M`, icon: 'payments' },
        { label: 'Growth', value: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`, icon: 'trending_up' },
        { label: 'Active Rentals', value: activeRentalsCount, icon: 'laptop_mac' },
        { label: 'Active Returns', value: activeReturnsCount, icon: 'assignment_return' },
        { label: 'Support Tickets', value: pendingTicketsCount, icon: 'contact_support' },
    ];

    const chartInfo = useMemo(() => {
        const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const isDaily = dayDiff <= 31;

        let chartData: { date: Date; label: string; value: number }[] = [];
        if (isDaily) {
            for (let i = 0; i < dayDiff; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const label = d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
                chartData.push({ date: d, label, value: 0 });
            }
        } else {
            const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
            for (let i = 0; i < monthDiff; i++) {
                const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
                chartData.push({ date: d, label, value: 0 });
            }
        }

        filteredOrders.forEach(order => {
            if (order.status === 'Completed' || order.status === 'Delivered' || order.status === 'In Use') {
                const orderDate = new Date(order.date);
                const bucket = chartData.find(b => {
                    if (isDaily) {
                        return b.date.getDate() === orderDate.getDate() && b.date.getMonth() === orderDate.getMonth() && b.date.getFullYear() === orderDate.getFullYear();
                    } else {
                        return b.date.getMonth() === orderDate.getMonth() && b.date.getFullYear() === orderDate.getFullYear();
                    }
                });
                if (bucket) {
                    bucket.value += order.total;
                }
            }
        });

        const maxValue = Math.max(...chartData.map(d => d.value), 1000);
        return { chartData, isDaily, maxValue };
    }, [startDate, endDate, filteredOrders]);

    return (
        <div className="space-y-12 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="group glass-card p-8 rounded-[2.5rem] shadow-elevated hover:scale-[1.02] hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-brand-primary border border-white/10 shadow-inner group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                            <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mb-3 group-hover:text-white/50 transition-colors">{stat.label}</p>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl lg:text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card rounded-[3rem] p-8 lg:p-14 shadow-elevated relative overflow-hidden mt-12 mb-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-4">
                    <div>
                        <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Sales Growth Trace</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">
                            {dateRange === 'custom' ? 'Custom Analysis Period' : dateRange === '7d' ? 'Last 7 Days Performance' : 'Revenue Trends Visualization'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-brand-primary shadow-glow"></span>
                        <span className="text-[10px] font-black text-white/70 uppercase">Revenue</span>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-white/[0.03] relative">
                                <span className="absolute -right-10 -top-2 text-[8px] font-black text-gray-600">{i === 4 ? '0' : ''}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-72 lg:h-96 flex items-end justify-between gap-2 lg:gap-4 relative z-10 pt-10">
                        {chartInfo.chartData.map((data, i) => {
                            const heightPercentage = (data.value / chartInfo.maxValue) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white text-black text-[10px] font-black p-3 rounded-xl pointer-events-none whitespace-nowrap z-30 shadow-2xl">
                                        <div className="text-gray-500 mb-1">{data.label}</div>
                                        <div>₹{data.value.toLocaleString()}</div>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                                    </div>
                                    <div
                                        className="w-full max-w-[40px] bg-gradient-to-t from-brand-primary/40 to-brand-primary rounded-t-xl group-hover:from-brand-primary group-hover:to-brand-primary/80 transition-all duration-500 relative shadow-glow"
                                        style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                                    >
                                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-10 px-2 overflow-x-auto no-scrollbar">
                        {chartInfo.chartData.filter((_, i) => {
                            if (chartInfo.chartData.length > 15) return i % Math.ceil(chartInfo.chartData.length / 10) === 0;
                            return true;
                        }).map((data, i) => (
                            <span key={i} className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{data.label}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
