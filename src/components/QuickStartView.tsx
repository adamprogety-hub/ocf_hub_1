"use client";

import {
  X,
  Plugs,
  Folders,
  ShieldCheck,
  ChartLineUp,
  ArrowRight,
  Lightning,
} from '@phosphor-icons/react';

interface QuickStartViewProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConnection?: () => void;
}

export const QuickStartView: React.FC<QuickStartViewProps> = ({
  isOpen,
  onClose,
  onStartConnection,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      number: '01',
      title: 'Подключение к оборудованию',
      description: 'Введите сетевой адрес Endpoint URI (например, opc.tcp://10.0.1.50:4840) контроллера Siemens, Овен, Schneider или шлюза.',
      icon: Plugs,
      accent: 'text-violet-600',
      badge: 'Шаг 1',
    },
    {
      number: '02',
      title: 'Адресное пространство и теги',
      description: 'Исследуйте дерево узлов Root/Objects, выбирайте технологические переменные и настраивайте периодичность опроса.',
      icon: Folders,
      accent: 'text-orange-500',
      badge: 'Шаг 2',
    },
    {
      number: '03',
      title: 'Безопасность и сертификаты',
      description: 'Выбирайте политики шифрования Basic256Sha256, режим Sign&Encrypt и доверенные сертификаты безопасности.',
      icon: ShieldCheck,
      accent: 'text-violet-600',
      badge: 'Шаг 3',
    },
    {
      number: '04',
      title: 'Мониторинг и диагностика',
      description: 'Контролируйте сетевой пинг, качество связи Good/Bad, подписки на события и алармы в реальном времени.',
      icon: ChartLineUp,
      accent: 'text-orange-500',
      badge: 'Шаг 4',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-[16px] w-full max-w-2xl shadow-2xl border border-neutral-100 p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px] font-sans">
                Гайд
              </span>
              <span className="text-xs font-semibold text-neutral-400 font-sans">
                Интерактивное руководство
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#0f172a] tracking-tight font-heading">
              Быстрый старт
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Ознакомьтесь с функционалом и начните работать эффективнее
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Закрыть руководство"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#f8fafd] border border-neutral-200/70 rounded-[12px] p-4 flex flex-col justify-between hover:border-violet-300 hover:bg-white transition-all shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-sans font-bold text-neutral-400">
                      {step.number}
                    </span>
                    <Icon size={20} weight="light" className={`${step.accent} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h4 className="text-xs font-bold text-[#0f172a] font-heading">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-sans mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-sans">
            <Lightning size={14} weight="light" className="text-orange-500" />
            <span>Готово к подключению любого оборудования по OPC UA</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors font-sans"
            >
              Закрыть
            </button>

            {onStartConnection && (
              <button
                onClick={() => {
                  onClose();
                  onStartConnection();
                }}
                className="px-4 py-2 rounded-[8px] text-xs font-bold bg-[#0f172a] hover:bg-black text-white transition-all shadow-sm flex items-center gap-1.5 font-sans"
              >
                <span>Создать подключение</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
