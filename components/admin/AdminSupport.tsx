import React from 'react';
import { Ticket } from '../../lib/store';

interface AdminSupportProps {
    tickets: Ticket[];
    setSelectedTicket: (ticket: Ticket | null) => void;
}

const AdminSupport: React.FC<AdminSupportProps> = ({ tickets, setSelectedTicket }) => {
    return (
        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-6 lg:p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white">Support Tickets</h3>
                <span className="bg-brand-primary/10 text-brand-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                    {tickets.filter(t => t.status !== 'Resolved').length} Pending
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] border-b border-white/5">
                            <th className="px-6 py-6 whitespace-nowrap">Ticket ID</th>
                            <th className="px-6 py-6 whitespace-nowrap">Customer</th>
                            <th className="px-6 py-6 whitespace-nowrap">Subject</th>
                            <th className="px-6 py-6 whitespace-nowrap">Status</th>
                            <th className="px-6 py-6 whitespace-nowrap">Priority</th>
                            <th className="px-6 py-6 text-right whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(t => (
                            <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-6 text-white font-mono text-sm">{t.id}</td>
                                <td className="px-6 py-6 text-gray-300 font-bold">{t.userName}</td>
                                <td className="px-6 py-6 text-gray-400 text-sm max-w-md truncate">{t.subject}</td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${t.status === 'Open' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        t.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-green-500/10 text-green-500 border-green-500/20'
                                        }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.priority === 'High' ? 'text-red-400' : t.priority === 'Medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                        {t.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button
                                        onClick={() => setSelectedTicket(t)}
                                        className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-brand-primary/20"
                                    >
                                        View & Reply
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSupport;
