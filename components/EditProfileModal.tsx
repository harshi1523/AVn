import React, { useState } from 'react';
import { User } from '../lib/types';
import { useStore } from '../lib/store';
import { useToast } from '../lib/ToastContext';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, updateProfile, updateEmailAddress } = useStore();
    const { showToast } = useToast();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !user) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Update email if it changed
            if (email !== user.email) {
                await updateEmailAddress(email);
            }

            // Update other profile details
            await updateProfile({
                name,
                phone,
                avatar
            });

            showToast("Profile updated successfully!", "success");
            onClose();
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            showToast(err.message || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-brand-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-brand-muted hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-muted mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition-all"
                            placeholder="Your full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-muted mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition-all"
                            placeholder="name@example.com"
                        />
                        <p className="text-[10px] text-brand-muted mt-1 opacity-60 italic">Changing email may require verification.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-muted mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition-all"
                            placeholder="+91 00000 00000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-muted mb-1.5">Avatar URL</label>
                        <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-primary flex-shrink-0 border-2 border-brand-border">
                                {avatar ? (
                                    <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-white text-3xl flex items-center justify-center h-full">account_circle</span>
                                )}
                            </div>
                            <input
                                type="url"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition-all"
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-brand-border text-white font-semibold hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-brand-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all disabled:opacity-50 shadow-glow"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
