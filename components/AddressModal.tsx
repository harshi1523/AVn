
import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Address } from '../lib/types';

interface AddressModalProps {
  onClose: () => void;
  editAddress?: Address;  // For edit mode
  onSuccess?: (message: string) => void;  // Success callback
}

export default function AddressModal({ onClose, editAddress, onSuccess }: AddressModalProps) {
  const { addAddress, updateAddress } = useStore();
  const [formData, setFormData] = useState({
    label: editAddress?.label || 'Home',
    address: editAddress?.address || '',
    city: editAddress?.city || '',
    state: editAddress?.state || '',
    pincode: editAddress?.pincode || '',
    phone: editAddress?.phone || '',
    recipientName: editAddress?.recipientName || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.city || !formData.phone) return;

    try {
      if (editAddress) {
        // Edit mode
        await updateAddress(editAddress.id, formData);
        onSuccess?.('Address updated successfully!');
      } else {
        // Add mode
        await addAddress(formData);
        onSuccess?.('Address added successfully!');
      }
      onClose();
    } catch (error: any) {
      onSuccess?.(error.message || 'Failed to save address');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-white mb-6">
          {editAddress ? 'Edit Address' : 'Add Delivery Address'}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2">Label</label>
            <div className="flex gap-2">
              {['Home', 'Office', 'Other'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setFormData({ ...formData, label: l })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.label === l ? 'bg-brand-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Recipient Name (Optional)"
              value={formData.recipientName}
              onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
              className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
            />
            <input
              type="text"
              placeholder="Full Address (Street, Area)"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Pincode"
                value={(formData as any).pincode || ''}
                onChange={e => setFormData({ ...formData, pincode: e.target.value } as any)}
                className="bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="State"
                value={(formData as any).state || ''}
                onChange={e => setFormData({ ...formData, state: e.target.value } as any)}
                className="bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-all shadow-glow"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
