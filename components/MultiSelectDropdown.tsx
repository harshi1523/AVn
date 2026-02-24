import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    error?: string;
}

export default function MultiSelectDropdown({
    options,
    selectedValues,
    onChange,
    label,
    placeholder = "Select categories...",
    className = "",
    error
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const newValues = selectedValues.includes(option)
            ? selectedValues.filter(v => v !== option)
            : [...selectedValues, option];
        onChange(newValues);
    };

    return (
        <div className={`relative space-y-2 ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    {label}
                </label>
            )}

            {/* Dropdown Toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-brand-border'} rounded-xl px-4 py-3 text-white cursor-pointer flex items-center justify-between hover:border-brand-primary/50 transition-all min-h-[46px] group`}
            >
                <div className="flex flex-wrap gap-1.5">
                    {selectedValues.length > 0 ? (
                        selectedValues.map(val => (
                            <span
                                key={val}
                                className="bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-1 border border-brand-primary/20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {val}
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(val);
                                    }}
                                    className="material-symbols-outlined text-[14px] hover:text-white transition-colors cursor-pointer"
                                >
                                    close
                                </span>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    )}
                </div>
                <span className={`material-symbols-outlined text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-[#1A1A1A] border border-brand-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md">
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {options.map(option => {
                            const isSelected = selectedValues.includes(option);
                            return (
                                <div
                                    key={option}
                                    onClick={() => toggleOption(option)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'bg-brand-primary/10 text-brand-primary'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">{option}</span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-brand-primary text-sm">check_circle</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
