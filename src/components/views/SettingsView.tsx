"use client";

import { useState } from 'react';
import {
  GearSix,
  Check,
  ArrowsClockwise,
  DownloadSimple,
  SlidersHorizontal,
  FloppyDisk,
  Warning,
} from '@phosphor-icons/react';

interface SettingsViewProps {
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [defaultPort, setDefaultPort] = useState('4840');
  const [discoveryTimeout, setDiscoveryTimeout] = useState('3000');
  const [keepAliveInterval, setKeepAliveInterval] = useState('5000');
  const [maxMessageSize, setMaxMessageSize] = useState('16');
  const [autoReconnect, setAutoReconnect] = useState(true);

  const [publishingInterval, setPublishingInterval] = useState('250');
  const [maxMonitoredItems, setMaxMonitoredItems] = useState('1000');
  const [queueSize, setQueueSize] = useState('10');
  const [discardOldest, setDiscardOldest] = useState(true);

  const [logLevel, setLogLevel] = useState('Info');
  const [enablePcap, setEnablePcap] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Конфигурация OPC UA клиента успешно сохранена!');
  };

  const handleReset = () => {
    setDefaultPort('4840');
    setDiscoveryTimeout('3000');
    setKeepAliveInterval('5000');
    setMaxMessageSize('16');
    setAutoReconnect(true);
    setPublishingInterval('250');
    setMaxMonitoredItems('1000');
    setQueueSize('10');
    setDiscardOldest(true);
    setLogLevel('Info');
    setEnablePcap(false);
    onShowToast('Настройки сброшены к значениям по умолчанию.');
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-start gap-5 h-full relative z-10 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-4 border-b border-neutral-200/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-heading">
            Настройки системы
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Параметры сетевого стека OPC UA, тайм-аутов, логирования и буферизации
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-all cursor-pointer font-sans"
          >
            Сброс
          </button>

          <button
            form="settings-form"
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-[8px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102 font-sans"
          >
            <FloppyDisk size={14} weight="bold" />
            <span>Сохранить настройки</span>
          </button>
        </div>
      </div>

      {/* Form Content: Segmented Bento Grid */}
      <form id="settings-form" onSubmit={handleSave} className="space-y-5 pb-4">
        {/* CARD 1: HERO DARK CARD — Основные параметры и сетевой стек */}
        <div className="bg-[#0e0f14] text-white rounded-[18px] border border-white/10 p-6 sm:p-7 shadow-[0_12px_36px_rgba(14,15,20,0.18)] relative overflow-hidden select-none">
          {/* Subtle violet ambient glow in corner */}
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-violet-600/15 via-violet-500/5 to-transparent pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 mb-6">
            <h3 className="text-base sm:text-lg font-black text-white font-heading tracking-tight">
              Основные параметры и сетевой стек
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Базовые TCP параметры, тайм-ауты обнаружения и управление разрывом связи
            </p>
          </div>

          {/* Grid of Core Settings */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Порт OPC UA по умолчанию
              </label>
              <input
                type="number"
                value={defaultPort}
                onChange={(e) => setDefaultPort(e.target.value)}
                className="w-full bg-white/5 border border-white/12 rounded-[8px] px-3.5 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                placeholder="4840"
              />
              <span className="block text-[10px] text-neutral-500 mt-1">Стандарт IANA: TCP 4840</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Тайм-аут Discovery (мс)
              </label>
              <input
                type="number"
                value={discoveryTimeout}
                onChange={(e) => setDiscoveryTimeout(e.target.value)}
                className="w-full bg-white/5 border border-white/12 rounded-[8px] px-3.5 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                placeholder="3000"
              />
              <span className="block text-[10px] text-neutral-500 mt-1">Ожидание ответа FindServers</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Интервал Keep-Alive (мс)
              </label>
              <input
                type="number"
                value={keepAliveInterval}
                onChange={(e) => setKeepAliveInterval(e.target.value)}
                className="w-full bg-white/5 border border-white/12 rounded-[8px] px-3.5 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                placeholder="5000"
              />
              <span className="block text-[10px] text-neutral-500 mt-1">Пинг активности сессии</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Макс. размер пакета (МБ)
              </label>
              <input
                type="number"
                value={maxMessageSize}
                onChange={(e) => setMaxMessageSize(e.target.value)}
                className="w-full bg-white/5 border border-white/12 rounded-[8px] px-3.5 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                placeholder="16"
              />
              <span className="block text-[10px] text-neutral-500 mt-1">Предел фрагментации TCP</span>
            </div>
          </div>

          {/* Core Switch inside Dark Card: Toggle switch placed before description */}
          <div 
            onClick={() => setAutoReconnect(!autoReconnect)}
            className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-3.5 cursor-pointer select-none group w-fit"
          >
            <button
              type="button"
              className={`w-11 h-6 rounded-full transition-colors relative pointer-events-none shrink-0 ${
                autoReconnect ? 'bg-violet-600 shadow-[0_0_12px_rgba(124,58,237,0.5)]' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  autoReconnect ? 'left-6' : 'left-1'
                }`}
              />
            </button>
            <div>
              <div className="text-xs font-bold text-white font-sans group-hover:text-violet-200 transition-colors">
                Автоматическое переподключение (Auto-Reconnect)
              </div>
              <div className="text-[11px] text-neutral-400 font-sans">
                Экспоненциальная задержка повтора попыток связи при разрыве TCP соединения
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Two Light Segmented Bento Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* CARD 2: LIGHT CARD — Подписки реального времени и буферизация */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[18px] border border-neutral-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0f172a] font-heading tracking-tight mb-1">
                Подписки реального времени и буферизация
              </h3>
              <p className="text-xs text-neutral-400 font-sans mb-5">
                Периодичность опроса Monitored Items и управление очередями
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Интервал (мс)
                  </label>
                  <input
                    type="number"
                    value={publishingInterval}
                    onChange={(e) => setPublishingInterval(e.target.value)}
                    className="w-full bg-[#f8fafd] border border-neutral-200/80 rounded-[8px] px-3 py-2 text-xs font-sans text-neutral-900 focus:outline-none focus:border-violet-600 focus:bg-white transition-all"
                  />
                  <span className="block text-[10px] text-neutral-400 mt-1">Publishing</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Макс. тегов
                  </label>
                  <input
                    type="number"
                    value={maxMonitoredItems}
                    onChange={(e) => setMaxMonitoredItems(e.target.value)}
                    className="w-full bg-[#f8fafd] border border-neutral-200/80 rounded-[8px] px-3 py-2 text-xs font-sans text-neutral-900 focus:outline-none focus:border-violet-600 focus:bg-white transition-all"
                  />
                  <span className="block text-[10px] text-neutral-400 mt-1">В подписке</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Очередь (Queue)
                  </label>
                  <input
                    type="number"
                    value={queueSize}
                    onChange={(e) => setQueueSize(e.target.value)}
                    className="w-full bg-[#f8fafd] border border-neutral-200/80 rounded-[8px] px-3 py-2 text-xs font-sans text-neutral-900 focus:outline-none focus:border-violet-600 focus:bg-white transition-all"
                  />
                  <span className="block text-[10px] text-neutral-400 mt-1">Семплов</span>
                </div>
              </div>
            </div>

            {/* Switch inside Light Card: Toggle switch placed before description */}
            <div 
              onClick={() => setDiscardOldest(!discardOldest)}
              className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-3.5 cursor-pointer select-none group w-fit"
            >
              <button
                type="button"
                className={`w-11 h-6 rounded-full transition-colors relative pointer-events-none shrink-0 ${
                  discardOldest ? 'bg-violet-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    discardOldest ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
              <div>
                <div className="text-xs font-bold text-neutral-900 font-sans group-hover:text-violet-700 transition-colors">
                  Сброс устаревших (Discard Oldest)
                </div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Сохранять только самые свежие отсчеты
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: LIGHT CARD — Диагностика и системные логи */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[18px] border border-neutral-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0f172a] font-heading tracking-tight mb-1">
                Диагностика и системные логи
              </h3>
              <p className="text-xs text-neutral-400 font-sans mb-5">
                Уровень детализации системного журнала и экспорт дампов трафика
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Уровень логирования (Log Level)
                </label>
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="w-full bg-[#f8fafd] border border-neutral-200/80 rounded-[8px] px-3.5 py-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-violet-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Debug">Debug (Все пакеты и транзакции TCP)</option>
                  <option value="Info">Info (Штатные события и подключения)</option>
                  <option value="Warn">Warn (Предупреждения и задержки)</option>
                  <option value="Error">Error (Только критические сбои)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-400 font-sans">
                Формат экспорта: JSON / Syslog
              </div>
              <button
                type="button"
                onClick={() => onShowToast('Диагностический лог сформирован и выгружен')}
                className="px-4 py-2.5 bg-[#0f172a] hover:bg-black text-white text-xs font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 shadow-xs cursor-pointer font-sans shrink-0"
              >
                <DownloadSimple size={14} weight="bold" />
                <span>Выгрузить журнал</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
