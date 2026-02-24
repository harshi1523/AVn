import React, { useState } from 'react';
import Tooltip from './Tooltip';

interface ShareButtonProps {
    productId: string;
    productName: string;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function ShareButton({ productId, productName, className = '', position = 'bottom' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareData = {
            title: productName,
            text: `Check out this amazing product: ${productName}`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Error copying to clipboard:', err);
            }
        }
    };

    return (
        <Tooltip
            text={copied ? 'Link Copied!' : 'Share Product'}
            position={position}
            className={className}
        >
            <button
                onClick={handleShare}
                aria-label="Share Product"
                className="flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-all duration-300 p-2"
            >
                <span className="material-symbols-outlined text-[20px]">
                    share
                </span>
            </button>
        </Tooltip>
    );
}
