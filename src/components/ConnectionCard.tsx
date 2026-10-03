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

  const getStatusStyles = () => {
    switch (connection.status) {
      case 'online':
        return {
          bgClass: 'bg-emerald-500 text-neutral-950 shadow-md',
          statusText: `В сети • ${connection.pingMs} мс`,
          statusTextClass: 'text-emerald-950/75',
          secondaryTextClass: 'text-emerald-950/70',
          dividerClass: 'border-black/10',
          paramBtnClass: 'bg-black/10 hover:bg-black/20 text-neutral-950 border border-black/15',
          actionBtnClass: 'bg-neutral-950 hover:bg-black text-white shadow-xs',
          deleteBtnHover: 'text-black/50 hover:text-black hover:bg-black/10',
        };
      case 'error':
        return {
          bgClass: 'bg-rose-500 text-neutral-950 shadow-md',
          statusText: 'Ошибка связи',
          statusTextClass: 'text-neutral-950 font-bold',
          secondaryTextClass: 'text-neutral-950/70',
          dividerClass: 'border-black/10',
          paramBtnClass: 'bg-black/10 hover:bg-black/20 text-neutral-950 border border-black/15',
          actionBtnClass: 'bg-neutral-950 hover:bg-black text-white shadow-xs',
          deleteBtnHover: 'text-black/50 hover:text-black hover:bg-black/10',
        };
      case 'connecting':
        return {
          bgClass: 'bg-amber-400 text-neutral-950 shadow-md',
          statusText: 'Подключение...',
          statusTextClass: 'text-amber-950/80 font-bold',
          secondaryTextClass: 'text-amber-950/70',
          dividerClass: 'border-black/10',
          paramBtnClass: 'bg-black/10 hover:bg-black/20 text-neutral-950 border border-black/15',
          actionBtnClass: 'bg-neutral-950 hover:bg-black text-white shadow-xs',
          deleteBtnHover: 'text-black/50 hover:text-black hover:bg-black/10',
        };
      case 'standby':
      default:
        return {
          bgClass: 'bg-neutral-200 text-neutral-900 border border-neutral-300 shadow-xs',
          statusText: 'Ожидание / Вне сети',
          statusTextClass: 'text-neutral-600',
          secondaryTextClass: 'text-neutral-500',
          dividerClass: 'border-neutral-300/80',
          paramBtnClass: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 shadow-2xs',
          actionBtnClass: 'bg-neutral-900 hover:bg-black text-white shadow-xs',
          deleteBtnHover: 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-300/60',
        };
    }
  };

  const status = getStatusStyles();

  return (
    <div
      onClick={onSelect}
      className={`rounded-[16px] p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out relative select-none group min-h-[160px] ${status.bgClass} ${
        isSelected
          ? 'ring-3 ring-violet-600 ring-offset-2 ring-offset-white shadow-[0_16px_36px_rgba(124,58,237,0.32)] -translate-y-1.5 scale-[1.01]'
          : 'hover:-translate-y-1 hover:shadow-lg'
      }`}
    >
      {/* Top Header: Title & Discrete Delete Button */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {isSelected && (
              <span className="w-2 h-2 rounded-full bg-violet-950 shrink-0" title="Активно в панели справа" />
            )}
            <h3
              className="text-base font-black tracking-tight font-heading leading-snug truncate text-neutral-950"
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
                ? 'bg-neutral-950 text-white px-2.5 text-[10px] font-bold flex items-center gap-1 shadow-sm'
                : `opacity-0 group-hover:opacity-100 ${status.deleteBtnHover}`
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

        {/* Big Number (Clean Two-Liner) */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-neutral-950">
            {connection.tagsCount}
          </span>
          <span className={`text-xs font-bold font-sans ${status.secondaryTextClass}`}>
            тегов
          </span>
        </div>
      </div>

      {/* Bottom Row: Status Text (Dot Removed) + Action Buttons */}
      <div className={`mt-3 pt-3 flex items-center justify-between border-t ${status.dividerClass}`}>
        {/* Status Text replacing the old dot indicator */}
        <span className={`text-[11px] font-sans font-medium truncate max-w-[130px] ${status.statusTextClass}`}>
          {status.statusText}
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
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-bold transition-all shrink-0 font-sans cursor-pointer ${status.paramBtnClass}`}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all hover:scale-102 shrink-0 font-sans cursor-pointer active:scale-95 ${status.actionBtnClass}`}
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
