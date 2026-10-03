"use client";

import { Broadcast, ArrowRight } from '@phosphor-icons/react';

interface FindConnectionCardProps {
  onClick: () => void;
}

export const FindConnectionCard: React.FC<FindConnectionCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white/40 hover:bg-white/80 backdrop-blur-xl border-2 border-dashed border-orange-300/60 hover:border-orange-500/70 rounded-[16px] p-5 flex flex-col justify-between items-start cursor-pointer transition-all duration-300 ease-out select-none group min-h-[160px] shadow-[0_8px_24px_rgba(15,23,42,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.06)] hover:-translate-y-1"
      title="Поиск и обнаружение других OPC UA серверов в локальной сети"
    >
      <div>
        <div className="w-8 h-8 rounded-[8px] bg-white/80 backdrop-blur-md border border-white/80 shadow-2xs flex items-center justify-center text-neutral-600 group-hover:text-orange-500 group-hover:scale-105 transition-all">
          <Broadcast size={18} weight="light" />
        </div>

        <h3 className="text-base font-extrabold text-[#0f172a] tracking-tight font-heading mt-3 group-hover:text-orange-600 transition-colors">
          Найти существующее подключение
        </h3>
        <p className="text-xs text-neutral-400 font-sans mt-0.5 line-clamp-2">
          Автопоиск оборудования в технологической подсети или по IP
        </p>
      </div>

      <div className="w-full pt-3 border-t border-neutral-200/40 flex items-center justify-between text-xs font-sans">
        <span className="font-semibold text-neutral-400 group-hover:text-neutral-600 transition-colors">
          Сканер сети
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98 shrink-0 font-sans cursor-pointer"
        >
          <span>Поиск в сети</span>
          <ArrowRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
};
