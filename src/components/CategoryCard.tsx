"use client";

import { ArrowRight } from '@phosphor-icons/react';
import type { HardwareCategory } from '../types/opc';

interface CategoryCardProps {
  category: HardwareCategory;
  onClick: () => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  plc: '/categories/01_plc_controllers.png',
  gateway: '/categories/02_iot_gateways.png',
  scada: '/categories/03_opc_servers.png',
  smart_device: '/categories/04_smart_field_devices.png',
};

const getConnectionsLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${count} подключений`;
  if (mod10 === 1) return `${count} подключение`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} подключения`;
  return `${count} подключений`;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const imageSrc = CATEGORY_IMAGES[category.id];

  return (
    <div
      onClick={onClick}
      className="bg-white/80 hover:bg-white text-[#0f172a] backdrop-blur-xl border border-neutral-200/70 hover:border-neutral-300/80 rounded-[18px] p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out select-none group min-h-[235px] relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(15,23,42,0.1)] hover:-translate-y-1"
    >
      {/* 3D Illustration (Positioned further left and lower for natural breathing room) */}
      {imageSrc && (
        <div className="absolute top-6 right-6 sm:top-7 sm:right-8 w-[135px] h-[135px] sm:w-[150px] sm:h-[150px] pointer-events-none flex items-center justify-center z-0">
          <img
            src={imageSrc}
            alt={category.title}
            className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(15,23,42,0.09)] group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-320 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </div>
      )}

      {/* Card Text Content (Constrained to left side so it doesn't overlap the 3D illustration) */}
      <div className="relative z-10 max-w-[60%] sm:max-w-[62%] flex flex-col">
        {/* Title & Subtitle */}
        <h3 className="text-lg sm:text-[19px] font-black tracking-tight text-[#0f172a] font-heading leading-snug">
          {category.title}
        </h3>
        <p className="text-xs font-semibold text-neutral-400 font-sans mt-1">
          {category.subtitle}
        </p>
        <p className="text-xs text-neutral-500 font-sans mt-2.5 leading-relaxed line-clamp-3">
          {category.description}
        </p>
      </div>

      {/* Bottom Row: Left-aligned Action Button that highlights on card hover */}
      <div className="relative z-10 mt-6 flex items-center justify-start">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#0e0f14] text-white group-hover:bg-violet-600 group-hover:shadow-[0_4px_16px_rgba(124,58,237,0.35)] text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-all duration-200 font-sans">
          <span>Открыть {getConnectionsLabel(category.totalNodes)}</span>
          <ArrowRight
            size={13}
            weight="bold"
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};
