import React, { useState } from 'react';
import { User } from '../../lib/store';

interface AdminUsersProps {
    allUsers: User[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    setViewingUser: (user: User | null) => void;
    setSelectedKYCUser: (user: User | null) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({
    allUsers,
    searchTerm,
    setSearchTerm,
    setViewingUser,
    setSelectedKYCUser,
}) => {
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'pending_kyc'>('all');

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = !searchTerm ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.addresses?.some(a => a.phone?.includes(searchTerm));

        let matchesRole = true;
        if (roleFilter === 'all') matchesRole = true;
        else if (roleFilter === 'pending_kyc') matchesRole = u.kycStatus === 'pending';
        else matchesRole = u.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (roleFilter === 'pending_kyc' && a.kycStatus === 'pending' && b.kycStatus === 'pending') {
            return new Date(a.kycSubmissionDate || 0).getTime() - new Date(b.kycSubmissionDate || 0).getTime();
        }
        return 0;
    });

    return (
        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">User Management & KYC</h3>
                <div className="flex gap-4">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="custom-select bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                    >
                        <option value="all" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>All Users</option>
                        <option value="user" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Customers Only</option>
                        <option value="admin" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Admins Only</option>
                        <option value="pending_kyc" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Pending KYC</option>
                    </select>

                    <div className="relative w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Search by Name, Email, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] border-b border-white/5">
                            <th className="px-6 py-6 whitespace-nowrap">User</th>
                            <th className="px-6 py-6 whitespace-nowrap">Email</th>
                            <th className="px-6 py-6 whitespace-nowrap">Role</th>
                            <th className="px-6 py-6 whitespace-nowrap">Account Status</th>
                            <th className="px-6 py-6 whitespace-nowrap">KYC Status</th>
                            <th className="px-6 py-6 text-right whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map(u => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-6 text-white font-bold">
                                    {u.name}
                                    {u.kycStatus === 'pending' && (
                                        <div className="text-[9px] font-normal text-yellow-500 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                            {u.kycSubmissionDate ? `${Math.floor((Date.now() - new Date(u.kycSubmissionDate).getTime()) / (1000 * 60 * 60 * 24))} days pending` : 'Action Required'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-6 text-gray-400 text-sm">{u.email}</td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.accountStatus === 'suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                        {u.accountStatus || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.kycStatus === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        u.kycStatus === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            u.kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                        }`}>
                                        {u.kycStatus || 'Not Submitted'}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => setViewingUser(u)}
                                        className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-all border border-brand-border"
                                        title="View Profile"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                    {u.kycStatus === 'pending' && (
                                        <button
                                            onClick={() => setSelectedKYCUser(u)}
                                            className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-glow border border-purple-500"
                                        >
                                            Review Docs
                                        </button>
                                    )}
                                    {u.kycStatus === 'approved' && (
                                        <span className="text-gray-500 text-[10px] font-black uppercase flex items-center h-full">Verified</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {allUsers.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found. (Ensure you are logged in as Admin and Firestore sync is active)</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
