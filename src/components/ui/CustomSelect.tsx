"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: any;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  variant?: 'light' | 'dark';
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите значение...',
  variant = 'light',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isDark = variant === 'dark';

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-[8px] text-xs font-sans text-left transition-all cursor-pointer ${
          isDark
            ? 'bg-white/5 hover:bg-white/8 text-white border border-white/12 focus:border-violet-500 focus:bg-white/10'
            : 'bg-[#f8fafd] hover:bg-white text-neutral-900 border border-neutral-200/80 focus:border-violet-600 focus:bg-white shadow-2xs'
        } ${isOpen ? (isDark ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-violet-600 ring-2 ring-violet-600/15') : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="truncate flex-1 font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown
          size={13}
          weight="bold"
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-violet-500' : isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        />
      </button>

      {/* Floating Custom Dropdown Popup */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-50 rounded-[10px] p-1 shadow-2xl backdrop-blur-xl border transition-all animate-drill-in max-h-60 overflow-y-auto ${
            isDark
              ? 'bg-[#12141c]/95 border-white/15 text-neutral-200 shadow-[0_12px_36px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 border-neutral-200/90 text-neutral-800 shadow-[0_12px_32px_-6px_rgba(15,23,42,0.15)]'
          }`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[7px] text-xs font-sans text-left transition-colors cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-violet-600/25 text-violet-300 font-bold'
                      : 'bg-violet-50 text-violet-700 font-bold'
                    : isDark
                    ? 'text-neutral-300 hover:bg-white/8 hover:text-white'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check
                    size={14}
                    weight="bold"
                    className={`shrink-0 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
