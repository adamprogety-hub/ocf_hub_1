"use client";

import React from 'react';
import { CaretUp, CaretDown } from '@phosphor-icons/react';

interface CustomNumberInputProps {
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  variant?: 'light' | 'dark';
  className?: string;
  disabled?: boolean;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  variant = 'light',
  className = '',
  disabled = false,
}) => {
  const isDark = variant === 'dark';

  const handleIncrement = () => {
    if (disabled) return;
    const current = Number(value) || 0;
    const next = current + step;
    if (max !== undefined && next > max) return;
    onChange(String(next));
  };

  const handleDecrement = () => {
    if (disabled) return;
    const current = Number(value) || 0;
    const next = current - step;
    if (min !== undefined && next < min) return;
    onChange(String(next));
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full rounded-[8px] pl-3.5 pr-8 py-2.5 text-xs font-sans transition-all focus:outline-none ${
          isDark
            ? 'bg-white/5 border border-white/12 text-white focus:border-violet-500 focus:bg-white/10'
            : 'bg-[#f8fafd] border border-neutral-200/80 text-neutral-900 focus:border-violet-600 focus:bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />

      {/* Custom Designed Micro-Steppers */}
      <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center gap-0.5 px-1">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={handleIncrement}
          className={`w-4 h-3.5 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-white/15'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70'
          }`}
          title="Увеличить"
        >
          <CaretUp size={10} weight="bold" />
        </button>

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={handleDecrement}
          className={`w-4 h-3.5 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-white/15'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70'
          }`}
          title="Уменьшить"
        >
          <CaretDown size={10} weight="bold" />
        </button>
      </div>
    </div>
  );
};
