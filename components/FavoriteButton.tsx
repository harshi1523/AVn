import React from 'react';
import { useStore } from '../lib/store';
import Tooltip from './Tooltip';

interface FavoriteButtonProps {
    productId: string;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function FavoriteButton({ productId, className = '', position = 'bottom' }: FavoriteButtonProps) {
    const { wishlist, toggleWishlist } = useStore();
    const isFavorite = wishlist.includes(productId);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(productId);
    };

    return (
        <Tooltip
            text={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            position={position}
            className={className}
        >
            <button
                onClick={handleToggle}
                aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                className={`flex items-center justify-center rounded-full transition-all duration-300 p-2 ${isFavorite
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
            >
                <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'filled-icon' : ''}`}>
                    heart_plus
                </span>
            </button>
        </Tooltip>
    );
}
