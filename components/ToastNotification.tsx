import React, { useEffect } from 'react';

interface ToastNotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export default function ToastNotification({ message, type, onClose, duration = 3000 }: ToastNotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-top-5 duration-300">
            <div className={`min-w-[320px] max-w-md rounded-2xl p-4 shadow-2xl border backdrop-blur-sm ${type === 'success'
                    ? 'bg-green-500/90 border-green-400 text-white'
                    : 'bg-red-500/90 border-red-400 text-white'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-white/20' : 'bg-white/20'
                        }`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {type === 'success' ? 'check_circle' : 'error'}
                        </span>
                    </div>
                    <p className="flex-1 font-bold text-sm">{message}</p>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
