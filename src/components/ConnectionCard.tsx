"use client";

import { useState } from 'react';
import {
  Trash,
  Check,
  ArrowRight,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import type { OpcConnection } from '../types/opc';

interface ConnectionCardProps {
  connection: OpcConnection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onConnect: (connection: OpcConnection) => void;
  onOpenParameters?: (connection: OpcConnection) => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  isSelected,
  onSelect,
  onDelete,
  onConnect,
  onOpenParameters,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(connection.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const getStatusText = () => {
    switch (connection.status) {
      case 'online':
        return `В сети • ${connection.pingMs} мс`;
      case 'error':
        return 'Ошибка связи';
      case 'connecting':
        return 'Подключение...';
      case 'standby':
      default:
        return 'Ожидание / Вне сети';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-[16px] p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out relative select-none group min-h-[160px] ${
        isSelected
          ? 'bg-[#0c0e14] text-white border border-violet-500/80 ring-2 ring-violet-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.4),0_0_24px_rgba(124,58,237,0.22)] -translate-y-1 scale-[1.01]'
          : 'bg-white hover:bg-neutral-50/70 text-neutral-900 border border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header: Title & Discrete Delete Button */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {isSelected && (
              <span
                className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7] shrink-0 animate-pulse"
                title="Активно в панели справа"
              />
            )}
            <h3
              className={`text-base font-black tracking-tight font-heading leading-snug truncate transition-colors ${
                isSelected ? 'text-white' : 'text-neutral-950'
              }`}
              title={connection.name}
            >
              {connection.name}
            </h3>
          </div>

          {/* Delete Button (visible on hover or confirm) */}
          <button
            onClick={handleDeleteClick}
            className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              confirmDelete
                ? isSelected
                  ? 'bg-rose-500 text-white px-2.5 text-[10px] font-bold flex items-center gap-1 shadow-sm'
                  : 'bg-neutral-950 text-white px-2.5 text-[10px] font-bold flex items-center gap-1 shadow-sm'
                : isSelected
                ? 'opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white hover:bg-white/10'
                : 'opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title={confirmDelete ? 'Подтвердите удаление' : 'Удалить'}
          >
            {confirmDelete ? (
              <>
                <Check size={12} weight="bold" />
                <span>Удалить?</span>
              </>
            ) : (
              <Trash size={15} weight="light" />
            )}
          </button>
        </div>

        {/* Big Number (Clean Two-Liner using Manrope font-heading) */}
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-black tracking-tight font-heading transition-colors ${
              isSelected ? 'text-white' : 'text-neutral-950'
            }`}
          >
            {connection.tagsCount}
          </span>
          <span
            className={`text-xs font-bold font-sans transition-colors ${
              isSelected ? 'text-neutral-400' : 'text-neutral-400'
            }`}
          >
            тегов
          </span>
        </div>
      </div>

      {/* Bottom Row: Status Text + Action Buttons */}
      <div
        className={`mt-3 pt-3 flex items-center justify-between border-t transition-colors ${
          isSelected ? 'border-white/10' : 'border-neutral-100'
        }`}
      >
        {/* Status Text (clean, no bright background fill) */}
        <span
          className={`text-[11px] font-sans font-medium truncate max-w-[130px] transition-colors ${
            isSelected ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          {getStatusText()}
        </span>

        {/* Action Buttons: Параметры + Войти */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenParameters) {
                onOpenParameters(connection);
              } else {
                onSelect();
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-bold transition-all shrink-0 font-sans cursor-pointer ${
              isSelected
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 border border-neutral-200/80'
            }`}
            title="Открыть параметры подключения"
          >
            <SlidersHorizontal size={13} weight="bold" />
            <span>Параметры</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onConnect(connection);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all hover:scale-102 shrink-0 font-sans cursor-pointer active:scale-95 ${
              isSelected
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md'
                : 'bg-neutral-900 hover:bg-black text-white shadow-xs'
            }`}
            title="Войти в сессию OPC UA"
          >
            <span>Войти</span>
            <ArrowRight size={12} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};
