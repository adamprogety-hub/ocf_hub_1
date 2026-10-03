"use client";

import { useState, useMemo } from 'react';
import {
  Bell,
  WarningCircle,
  Warning,
  CheckCircle,
  SpeakerHigh,
  SpeakerSimpleSlash,
  MagnifyingGlass,
  DownloadSimple,
  Check,
  ChartLineUp,
  Clock,
  Copy,
  ShieldWarning,
  SlidersHorizontal,
  X,
  ArrowRight,
  Info,
  CaretDown,
} from '@phosphor-icons/react';

export type AlarmSeverity = 'critical' | 'high' | 'warning' | 'info';
export type AlarmState = 'active_unack' | 'active_acked' | 'cleared_unack' | 'cleared_acked';

export interface AlarmItem {
  id: string;
  sourceNode: string;
  sourceName: string;
  serverName: string;
  conditionType: string;
  message: string;
  severity: AlarmSeverity;
  severityScore: number;
  state: AlarmState;
  value: string;
  limit: string;
  activeTime: string;
  ackTime?: string;
  ackUser?: string;
  comment?: string;
}

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alm-1',
    sourceNode: 'ns=2;s=Boiler4.Circuit1.Overheat',
    sourceName: 'Котельная №4 • Котёл 1',
    serverName: 'Котельная №4',
    conditionType: 'LimitAlarmType (HighHigh)',
    message: 'Аварийная температура подачи: 84.2 °C превысила порог защитного отключения (80.0 °C)',
    severity: 'critical',
    severityScore: 950,
    state: 'active_unack',
    value: '84.2 °C',
    limit: '80.0 °C (HH)',
    activeTime: '13:04:12',
  },
  {
    id: 'alm-2',
    sourceNode: 'ns=2;s=Pumps.Pump1.DryRunTrip',
    sourceName: 'Насосная станция • Насос 1 (Основной)',
    serverName: 'Насосная станция',
    conditionType: 'TripAlarmType (LowLow)',
    message: 'Срабатывание защиты от сухого хода: Давление на всасе 0.28 бар < 0.50 бар',
    severity: 'critical',
    severityScore: 900,
    state: 'active_unack',
    value: '0.28 бар',
    limit: '0.50 бар (LL)',
    activeTime: '13:02:40',
  },
  {
    id: 'alm-3',
    sourceNode: 'ns=2;s=AHU1.Recovery.FreezeWarning',
    sourceName: 'Вентиляция Блок Б • Приточная установка ПУ-1',
    serverName: 'Вентиляция Блок Б',
    conditionType: 'LimitAlarmType (Low)',
    message: 'Угроза обмерзания рекуператора: Температура обратного теплоносителя 14.8 °C < 20.0 °C',
    severity: 'high',
    severityScore: 700,
    state: 'active_unack',
    value: '14.8 °C',
    limit: '20.0 °C (L)',
    activeTime: '12:59:15',
  },
  {
    id: 'alm-4',
    sourceNode: 'ns=2;s=Chiller2.Comp1.OilPressureLow',
    sourceName: 'Чиллерная №2 • Компрессор 1',
    serverName: 'Чиллерная №2',
    conditionType: 'OffNormalAlarmType',
    message: 'Пониженное давление масла компрессора: 1.82 бар (Требуется осмотр картера)',
    severity: 'warning',
    severityScore: 650,
    state: 'active_acked',
    value: '1.82 бар',
    limit: '2.00 бар (L)',
    activeTime: '12:53:02',
    ackTime: '12:54:10',
    ackUser: 'Диспетчер Смирнов А.',
    comment: 'Сервисная бригада предупреждена, проверен масляный фильтр.',
  },
  {
    id: 'alm-5',
    sourceNode: 'ns=2;s=Boiler4.Makeup.PressureDrop',
    sourceName: 'Котельная №4 • Контур подпитки',
    serverName: 'Котельная №4',
    conditionType: 'LimitAlarmType (Low)',
    message: 'Кратковременная просадка давления подпитки (Давление восстановлено: 2.45 бар)',
    severity: 'warning',
    severityScore: 500,
    state: 'cleared_unack',
    value: '2.45 бар (Норма)',
    limit: '2.20 бар (L)',
    activeTime: '12:44:20',
  },
  {
    id: 'alm-6',
    sourceNode: 'ns=2;s=Gateway.Modbus.CommRestored',
    sourceName: 'Шлюз телемеханики ЦТП-3',
    serverName: 'Котельная №4',
    conditionType: 'SystemEventType',
    message: 'Связь по шине RS-485 восстановлена в полном объёме (CRC OK, 48 пак/сек)',
    severity: 'info',
    severityScore: 200,
    state: 'cleared_acked',
    value: 'Online 100%',
    limit: 'Таймаут < 1000мс',
    activeTime: '12:35:10',
    ackTime: '12:38:00',
    ackUser: 'Система (AutoAck)',
    comment: 'Автоматическое квитирование после 50 успешных кадров подряд.',
  },
];

interface AlarmsViewProps {
  onShowToast: (msg: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AlarmsView: React.FC<AlarmsViewProps> = ({ onShowToast, onNavigateToTab }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>(INITIAL_ALARMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'unack' | 'active' | 'critical' | 'cleared'>('all');
  const [filterServer, setFilterServer] = useState<string>('all');
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmItem | null>(null);
  const [operatorComment, setOperatorComment] = useState('');

  // Counts
  const activeUnackCount = alarms.filter((a) => a.state === 'active_unack').length;
  const activeCount = alarms.filter((a) => a.state === 'active_unack' || a.state === 'active_acked').length;
  const criticalCount = alarms.filter((a) => a.severity === 'critical').length;
  const clearedCount = alarms.filter((a) => a.state === 'cleared_unack' || a.state === 'cleared_acked').length;

  // Acknowledge single alarm
  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextState: AlarmState = a.state === 'active_unack' ? 'active_acked' : 'cleared_acked';
          return {
            ...a,
            state: nextState,
            ackTime: now,
            ackUser: 'Дежурный диспетчер',
          };
        }
        return a;
      })
    );
    const target = alarms.find((a) => a.id === id);
    onShowToast(`Квитировано: ${target?.sourceName || 'Авария'}`);
  };

  // Acknowledge All Alarms
  const handleAcknowledgeAll = () => {
    const unackedCount = alarms.filter((a) => a.state === 'active_unack' || a.state === 'cleared_unack').length;
    if (unackedCount === 0) {
      onShowToast('Нет неквитированных аварий');
      return;
    }
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAlarms((prev) =>
      prev.map((a) => ({
        ...a,
        state: a.state === 'active_unack' ? 'active_acked' : a.state === 'cleared_unack' ? 'cleared_acked' : a.state,
        ackTime: a.ackTime || now,
        ackUser: a.ackUser || 'Дежурный диспетчер (Групповое)',
      }))
    );
    onShowToast(`Квитированы все тревоги (${unackedCount} шт.)`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Время', 'Объект', 'NodeId', 'Тип условия', 'Важность', 'Балл', 'Сообщение', 'Значение', 'Порог', 'Статус', 'Квитировал'];
    const rows = alarms.map((a) => [
      a.id,
      a.activeTime,
      `"${a.sourceName}"`,
      `"${a.sourceNode}"`,
      `"${a.conditionType}"`,
      a.severity.toUpperCase(),
      a.severityScore,
      `"${a.message.replace(/"/g, '""')}"`,
      `"${a.value}"`,
      `"${a.limit}"`,
      a.state,
      `"${a.ackUser || '—'}"`,
    ]);
    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `opc_ua_alarms_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Журнал аварий экспортирован в CSV');
  };

  // Add Comment to selected alarm
  const handleAddComment = () => {
    if (!selectedAlarm || !operatorComment.trim()) return;
    setAlarms((prev) =>
      prev.map((a) => (a.id === selectedAlarm.id ? { ...a, comment: operatorComment.trim() } : a))
    );
    setSelectedAlarm((prev) => (prev ? { ...prev, comment: operatorComment.trim() } : null));
    setOperatorComment('');
    onShowToast('Комментарий оператора сохранён в аудит-логе');
  };

  // Copy NodeId
  const handleCopyNodeId = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nodeId);
    onShowToast(`NodeId скопирован: ${nodeId}`);
  };

  // Filtered Alarms
  const filteredAlarms = useMemo(() => {
    return alarms.filter((item) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceNode.toLowerCase().includes(searchQuery.toLowerCase());

      // State Filter
      let matchesState = true;
      if (filterState === 'unack') matchesState = item.state === 'active_unack' || item.state === 'cleared_unack';
      if (filterState === 'active') matchesState = item.state === 'active_unack' || item.state === 'active_acked';
      if (filterState === 'critical') matchesState = item.severity === 'critical';
      if (filterState === 'cleared') matchesState = item.state === 'cleared_unack' || item.state === 'cleared_acked';

      // Server Filter
      const matchesServer = filterServer === 'all' || item.serverName === filterServer;

      return matchesSearch && matchesState && matchesServer;
    });
  }, [alarms, searchQuery, filterState, filterServer]);

  const uniqueServers = Array.from(new Set(alarms.map((a) => a.serverName)));

  // Top unacknowledged emergency alarms for the banner track, sorted by severity
  const unackAlarms = useMemo(() => {
    return alarms
      .filter((a) => a.state === 'active_unack' || a.state === 'cleared_unack')
      .sort((a, b) => b.severityScore - a.severityScore);
  }, [alarms]);

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 shrink-0">
        <div>
          <h1 className="font-heading font-black text-xl text-[#0f172a] tracking-tight">
            Журнал аварий и событий
          </h1>
          <p className="font-sans text-xs text-neutral-500 mt-0.5">
            Стандартизированный диспетчерский стек аварийных событий, прецизионное квитирование и аудит-лог
          </p>
        </div>

        {/* Top Header Right Actions: Siren Toggle & Export CSV */}
        <div className="flex items-center gap-2">
          {/* Siren Mute Toggle */}
          <button
            onClick={() => {
              setIsSirenMuted(!isSirenMuted);
              onShowToast(isSirenMuted ? 'Звуковое оповещение включено' : 'Звук оповещения приглушён');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all border cursor-pointer shrink-0 shadow-2xs ${
              isSirenMuted
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200/80'
            }`}
            title="Звуковая сигнализация при поступлении новых аварий"
          >
            {isSirenMuted ? (
              <>
                <SpeakerSimpleSlash size={14} weight="light" className="text-amber-600" />
                <span>Звук выкл</span>
              </>
            ) : (
              <>
                <SpeakerHigh size={14} weight="light" className="text-neutral-500" />
                <span>Звук вкл</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 text-xs font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
            title="Экспортировать журнал инцидентов в CSV"
          >
            <DownloadSimple size={13} weight="light" />
            <span>Экспорт CSV</span>
          </button>
        </div>
      </div>

      {/* Unified Long Dark Banner: Emergency action + Individual active alarm cards track */}
      <div className="bg-[#0e0f14] text-white rounded-[18px] border border-white/10 p-3.5 sm:p-4 relative overflow-x-auto select-none shrink-0 flex items-stretch gap-3.5 mt-3 mb-5 sm:mb-6">
        {/* Action 1: Acknowledge All Button Card at the start of the row */}
        <button
          onClick={handleAcknowledgeAll}
          disabled={activeUnackCount === 0 && alarms.every((a) => a.state !== 'cleared_unack')}
          className={`w-36 sm:w-44 rounded-[14px] p-4 flex flex-col items-center justify-center gap-2.5 transition-all shrink-0 border select-none text-center active:scale-98 ${
            activeUnackCount > 0
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/30 cursor-pointer group shadow-[0_4px_16px_rgba(225,29,72,0.3)]'
              : 'bg-neutral-800/80 text-neutral-400 border-white/5 cursor-not-allowed'
          }`}
          title="Квитировать все неподтверждённые аварии"
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform shadow-xs ${
            activeUnackCount > 0 ? 'bg-white/20 group-hover:scale-110' : 'bg-white/5'
          }`}>
            <Check size={20} weight="light" />
          </div>
          <span className="text-xs font-bold font-sans leading-tight">
            Квитировать всё<br />({activeUnackCount})
          </span>
        </button>

        {/* Dynamic Individual Alarm Cards Track - Sorted by severity, large size, minimal info */}
        {unackAlarms.length > 0 ? (
          unackAlarms.map((alarm) => {
            const isCritical = alarm.severityScore >= 800;
            const isHigh = alarm.severityScore >= 600 && alarm.severityScore < 800;
            const bgColor = isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-400' : 'bg-amber-300';

            // Minimal short title for the alarm essence
            const shortReason =
              alarm.id === 'alm-1'
                ? 'Перегрев подачи'
                : alarm.id === 'alm-2'
                ? 'Сухой ход насоса'
                : alarm.id === 'alm-3'
                ? 'Угроза обмерзания'
                : alarm.id === 'alm-4'
                ? 'Низкое давление масла'
                : alarm.id === 'alm-5'
                ? 'Просадка подпитки'
                : alarm.id === 'alm-6'
                ? 'Восстановление связи'
                : alarm.message.split(':')[0] || alarm.message;

            return (
              <div
                key={alarm.id}
                className={`relative z-10 w-[320px] sm:w-[350px] md:w-[380px] rounded-[14px] p-4 flex flex-col justify-between shadow-md shrink-0 select-none ${bgColor} text-neutral-950 transition-all`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-black text-neutral-950 font-heading tracking-tight leading-snug truncate" title={alarm.sourceName}>
                      {alarm.sourceName}
                    </h3>
                    <span className="text-[11px] font-heading font-bold text-black/60 shrink-0 mt-0.5">
                      {alarm.activeTime}
                    </span>
                  </div>

                  {/* Minimal Hero Value & Short Reason */}
                  <div className="my-2">
                    <div className="text-3xl font-black font-heading text-neutral-950 tracking-tight">
                      {alarm.value}
                    </div>
                    <p className="text-xs text-black/85 font-sans font-bold mt-0.5 tracking-tight truncate">
                      {shortReason}
                    </p>
                  </div>
                </div>

                {/* Minimal Card Footer: Clean Acknowledge Button */}
                <div className="pt-2 border-t border-black/10 flex items-center justify-between text-xs font-sans">
                  <span className="text-[11px] text-black/60 font-heading font-semibold">
                    {isCritical ? 'Критическая' : isHigh ? 'Высокая' : 'Предупреждение'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleAcknowledge(alarm.id, e)}
                    className="px-3.5 py-1.5 rounded-[8px] bg-neutral-950 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                    title="Квитировать данное событие"
                  >
                    <Check size={13} weight="bold" />
                    <span>Квит.</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Normal State: Calm solid green card when all alarms are acknowledged */
          <div className="relative z-10 w-full sm:w-[360px] md:w-[400px] rounded-[14px] p-4 flex flex-col justify-between shadow-md shrink-0 bg-emerald-500 text-neutral-950">
            <div>
              <h3 className="text-base font-black text-neutral-950 font-heading tracking-tight">
                Все системы в норме
              </h3>
              <p className="text-xs text-emerald-950/80 font-sans mt-0.5 font-medium">
                Активных неквитированных инцидентов нет
              </p>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-black/10 flex items-center justify-between text-xs font-sans">
              <span className="text-[11px] text-emerald-950/70 font-sans font-medium">
                Нормализовано: {clearedCount} за смену
              </span>
              <span className="px-2 py-0.5 rounded-[5px] bg-emerald-950 text-emerald-100 text-[10px] font-bold">
                Штатный режим
              </span>
            </div>
          </div>
        )}

        {/* Clean trailing space */}
        <div className="flex-1 min-w-[8px]" />
      </div>

      {/* Minimalist Filter and Search Bar with Comfortable Vertical Spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 shrink-0">
        {/* Minimal Search */}
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по журналу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafd] border border-neutral-200/80 rounded-[8px] pl-8 pr-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 font-sans transition-colors"
          />
        </div>

        {/* Minimal Filter Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-[8px] border border-neutral-200/70 text-xs font-sans overflow-x-auto">
          {[
            { id: 'all', label: 'Все', count: alarms.length },
            { id: 'unack', label: 'Неквитированные', count: activeUnackCount },
            { id: 'active', label: 'Активные', count: activeCount },
            { id: 'critical', label: 'Критические', count: criticalCount },
            { id: 'cleared', label: 'Норма', count: clearedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id as typeof filterState)}
              className={`tactile-btn px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterState === tab.id
                  ? 'bg-white text-neutral-900 font-bold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1 rounded ${filterState === tab.id ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Minimal Server Select Dropdown */}
        <div className="relative shrink-0">
          <select
            value={filterServer}
            onChange={(e) => setFilterServer(e.target.value)}
            className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 rounded-[8px] pl-3 pr-7 py-2 text-xs font-medium focus:outline-none focus:border-neutral-400 cursor-pointer shadow-2xs appearance-none font-sans"
          >
            <option value="all">Все серверы ({alarms.length})</option>
            {uniqueServers.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
          <CaretDown size={11} weight="bold" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Alarms List Table - Minimalist 4 Essential Columns with Air */}
      <div className="flex-1 min-w-0 bg-white rounded-[14px] border border-neutral-200/80 shadow-xs flex flex-col overflow-hidden">
        {/* Table Header: 4 Essential Columns */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#f8fafd] border-b border-neutral-200/70 text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-wider shrink-0">
          <div className="col-span-2 flex items-center gap-1.5">
            <Clock size={12} weight="light" />
            <span>Время</span>
          </div>
          <div className="col-span-7">Объект и событие</div>
          <div className="col-span-1 text-right">Значение</div>
          <div className="col-span-2 text-right">Действие</div>
        </div>

        {/* Scrollable Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {filteredAlarms.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-neutral-400 gap-2">
              <CheckCircle size={32} weight="light" className="text-emerald-500" />
              <div className="font-heading font-bold text-sm text-neutral-700">Нет тревог по выбранному фильтру</div>
              <div className="font-sans text-xs">Все технологические контуры работают в штатном режиме</div>
            </div>
          ) : (
            filteredAlarms.map((alarm) => {
              const isUnack = alarm.state === 'active_unack' || alarm.state === 'cleared_unack';
              const isCritical = alarm.severity === 'critical';
              const isWarning = alarm.severity === 'high' || alarm.severity === 'warning';

              return (
                <div
                  key={alarm.id}
                  onClick={() => setSelectedAlarm(alarm)}
                  className={`grid grid-cols-12 gap-3 px-4 py-3.5 items-center transition-colors cursor-pointer group ${
                    isUnack
                      ? isCritical
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : 'bg-amber-50/30 hover:bg-amber-50/60'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  {/* Col 1: Time with subtle severity dot */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCritical
                          ? 'bg-rose-500 animate-pulse'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="font-mono text-xs font-bold text-neutral-800">
                      {alarm.activeTime}
                    </span>
                  </div>

                  {/* Col 2: Combined Object & Event Message */}
                  <div className="col-span-7 flex items-center gap-2 min-w-0 pr-3">
                    <span className="font-heading font-bold text-xs text-[#0f172a] shrink-0 group-hover:text-rose-600 transition-colors">
                      {alarm.sourceName}
                    </span>
                    <span className="text-neutral-300 text-xs shrink-0">—</span>
                    <span className="font-sans text-xs text-neutral-600 truncate" title={alarm.message}>
                      {alarm.message}
                    </span>
                  </div>

                  {/* Col 3: Clean Hero Value */}
                  <div className="col-span-1 text-right">
                    <span className="font-mono text-xs font-bold text-[#0f172a]">
                      {alarm.value}
                    </span>
                  </div>

                  {/* Col 4: Single Clean Action Button or Acked Status */}
                  <div className="col-span-2 flex items-center justify-end">
                    {isUnack ? (
                      <button
                        onClick={(e) => handleAcknowledge(alarm.id, e)}
                        className={`tactile-btn flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-bold text-white shadow-2xs cursor-pointer ${
                          isCritical ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                        title="Подтвердить ознакомление"
                      >
                        <Check size={12} weight="bold" />
                        <span>Квит.</span>
                      </button>
                    ) : (
                      <span className="text-xs font-sans text-neutral-400 flex items-center gap-1">
                        <Check size={13} weight="bold" className="text-emerald-600" />
                        <span>Квитировано</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Minimal Table Footer */}
        <div className="px-4 py-2 bg-[#f8fafd] border-t border-neutral-200/70 text-[11px] font-sans text-neutral-500 flex items-center justify-between shrink-0">
          <div>
            Событий: <strong className="text-neutral-800">{filteredAlarms.length}</strong> из {alarms.length}
          </div>
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-sans text-xs">Данные синхронизированы</span>
          </div>
        </div>
      </div>

      {/* Slide-over Alarm Inspector Modal / Drawer */}
      {selectedAlarm && (
        <div
          onClick={() => setSelectedAlarm(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[16px] border border-neutral-200/90 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-start justify-between ${
              selectedAlarm.severity === 'critical' ? 'bg-rose-50/80 border-rose-200/70' : 'bg-neutral-50 border-neutral-200/80'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
                  selectedAlarm.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Warning size={20} weight="bold" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm text-[#0f172a] leading-tight">
                    Инспектор аварийного узла OPC UA
                  </h3>
                  <p className="font-sans text-[11px] text-neutral-500 mt-0.5">
                    {selectedAlarm.conditionType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAlarm(null)}
                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            {/* Modal Body: OPC UA Attributes Grid */}
            <div className="p-4 flex flex-col gap-3 font-sans text-xs">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
                  Текст сообщения
                </span>
                <p className="font-heading font-bold text-sm text-neutral-900 mt-0.5">
                  {selectedAlarm.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-neutral-50 p-3 rounded-[10px] border border-neutral-200/60 font-mono text-[11px]">
                <div>
                  <span className="text-neutral-400 text-[10px]">SourceNode:</span>
                  <div className="text-neutral-800 truncate" title={selectedAlarm.sourceNode}>{selectedAlarm.sourceNode}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px]">Server:</span>
                  <div className="text-neutral-800 font-bold">{selectedAlarm.serverName}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px]">Текущее значение:</span>
                  <div className="text-rose-600 font-bold">{selectedAlarm.value}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px]">Аварийный порог:</span>
                  <div className="text-neutral-700">{selectedAlarm.limit}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px]">Время возникновения:</span>
                  <div className="text-neutral-800">{selectedAlarm.activeTime}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px]">Статус квитирования:</span>
                  <div className={selectedAlarm.ackTime ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {selectedAlarm.ackTime ? `Квит. (${selectedAlarm.ackTime})` : 'Неквитировано'}
                  </div>
                </div>
              </div>

              {/* Operator Notes / Comment */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[11px] text-neutral-500 font-medium">
                  Журнал действий оператора (Аудит):
                </span>
                {selectedAlarm.comment && (
                  <div className="bg-neutral-100 p-2.5 rounded-[8px] text-neutral-700 text-xs">
                    «{selectedAlarm.comment}»
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Добавить примечание диспетчера..."
                    value={operatorComment}
                    onChange={(e) => setOperatorComment(e.target.value)}
                    className="flex-1 bg-[#f8fafd] border border-neutral-200/80 rounded-[8px] px-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!operatorComment.trim()}
                    className="tactile-btn px-3 py-1.5 rounded-[8px] bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#f8fafd] border-t border-neutral-200/70 flex items-center justify-between">
              {(selectedAlarm.state === 'active_unack' || selectedAlarm.state === 'cleared_unack') && (
                <button
                  onClick={() => {
                    handleAcknowledge(selectedAlarm.id);
                    setSelectedAlarm((prev) => (prev ? { ...prev, state: 'active_acked', ackTime: 'Сейчас', ackUser: 'Дежурный диспетчер' } : null));
                  }}
                  className="tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Check size={14} weight="bold" />
                  <span>Квитировать аварию</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      setSelectedAlarm(null);
                      onNavigateToTab('monitor');
                    }}
                    className="tactile-btn flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChartLineUp size={14} />
                    <span>Перейти к тренду</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlarm(null)}
                  className="tactile-btn px-3 py-1.5 rounded-[8px] bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
