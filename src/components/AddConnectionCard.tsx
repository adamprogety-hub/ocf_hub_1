"use client";

import { Plus, ArrowRight } from '@phosphor-icons/react';

interface AddConnectionCardProps {
  onClick: () => void;
}

export const AddConnectionCard: React.FC<AddConnectionCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white/40 hover:bg-white/80 backdrop-blur-xl border-2 border-dashed border-neutral-300/60 hover:border-violet-500/60 rounded-[16px] p-5 flex flex-col justify-between items-start cursor-pointer transition-all duration-300 ease-out select-none group min-h-[160px] shadow-[0_8px_24px_rgba(15,23,42,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.06)] hover:-translate-y-1"
      title="Создать новое подключение к OPC UA серверу"
    >
      <div>
        <div className="w-8 h-8 rounded-[8px] bg-white/80 backdrop-blur-md border border-white/80 shadow-2xs flex items-center justify-center text-neutral-600 group-hover:text-violet-600 group-hover:scale-105 transition-all">
          <Plus size={18} weight="light" />
        </div>

        <h3 className="text-base font-extrabold text-[#0f172a] tracking-tight font-heading mt-3 group-hover:text-violet-700 transition-colors">
          Создать новое подключение
        </h3>
        <p className="text-xs text-neutral-400 font-sans mt-0.5 line-clamp-2">
          Ручной ввод сетевого адреса, порта и сертификата безопасности
        </p>
      </div>

      <div className="w-full pt-3 border-t border-neutral-200/40 flex items-center justify-between text-xs font-sans">
        <span className="font-semibold text-neutral-400 group-hover:text-neutral-600 transition-colors">
          Новое подключение
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98 shrink-0 font-sans cursor-pointer"
        >
          <span>Настроить</span>
          <ArrowRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
};
