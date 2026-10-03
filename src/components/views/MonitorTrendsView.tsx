"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  DownloadSimple,
  SlidersHorizontal,
  Pulse,
  Tag,
  PencilSimple,
  ArrowSquareOut,
  MagnifyingGlass,
  Clock,
  Sparkle,
  TrendUp,
  Fire,
  Fan,
  Drop,
  Snowflake,
} from '@phosphor-icons/react';
import type { OpcConnection } from '@/types/opc';

interface MonitorTrendsViewProps {
  connections: OpcConnection[];
  onNavigateToConnection: (conn: OpcConnection) => void;
  onShowToast: (msg: string) => void;
}

interface TrendPreset {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  serverConnId: string;
  serverName: string;
  unit: string;
  minFull: number;
  maxFull: number;
  minZoom: number;
  maxZoom: number;
  penPV: {
    name: string;
    nodeId: string;
    color: string;
    label: string;
  };
  penSP: {
    name: string;
    nodeId: string;
    color: string;
    label: string;
    setpoint: number;
  };
  penAux?: {
    name: string;
    nodeId: string;
    color: string;
    label: string;
  };
  initialPV: number;
  initialAux?: number;
}

const PRESETS: TrendPreset[] = [
  {
    id: 'boiler',
    title: 'Котельная №4',
    subtitle: 'Контур отопления • Подача vs Уставка',
    icon: Fire,
    serverConnId: 'conn-1',
    serverName: 'Котельная №4',
    unit: '°C',
    minFull: 40,
    maxFull: 95,
    minZoom: 72.0,
    maxZoom: 78.0,
    penPV: {
      name: 'T_Supply_Heating (Факт)',
      nodeId: 'ns=2;s=Boiler4.Circuit1.T_Supply',
      color: '#2563eb', // Royal Blue
      label: 'Факт PV',
    },
    penSP: {
      name: 'T_Supply_Setpoint (Уставка)',
      nodeId: 'ns=2;s=Boiler4.Circuit1.T_Supply_Set',
      color: '#d97706', // Warm Amber
      label: 'Уставка SP',
      setpoint: 75.0,
    },
    penAux: {
      name: 'T_Return_Heating (Обратка)',
      nodeId: 'ns=2;s=Boiler4.Circuit1.T_Return',
      color: '#94a3b8', // Neutral Slate
      label: 'Обратка',
    },
    initialPV: 74.8,
    initialAux: 73.2,
  },
  {
    id: 'vent',
    title: 'Вентиляция Блок Б',
    subtitle: 'Приточная линия • Температура vs Уставка',
    icon: Fan,
    serverConnId: 'conn-2',
    serverName: 'Вентиляция Блок Б',
    unit: '°C',
    minFull: 10,
    maxFull: 35,
    minZoom: 19.5,
    maxZoom: 24.5,
    penPV: {
      name: 'Supply_Air_Temp (Факт притока)',
      nodeId: 'ns=2;s=AHU1.Supply.T_Supply',
      color: '#2563eb',
      label: 'Факт PV',
    },
    penSP: {
      name: 'Supply_Air_Set (Уставка притока)',
      nodeId: 'ns=2;s=AHU1.Supply.T_Set',
      color: '#d97706',
      label: 'Уставка SP',
      setpoint: 22.0,
    },
    penAux: {
      name: 'Extract_Air_Temp (Вытяжка)',
      nodeId: 'ns=2;s=AHU1.Exhaust.T_Extract',
      color: '#94a3b8',
      label: 'Вытяжка',
    },
    initialPV: 21.6,
    initialAux: 22.4,
  },
  {
    id: 'pumps',
    title: 'Насосная станция',
    subtitle: 'Напорный коллектор • Давление в сети vs Уставка',
    icon: Drop,
    serverConnId: 'conn-4',
    serverName: 'Насосная станция',
    unit: 'бар',
    minFull: 0.0,
    maxFull: 10.0,
    minZoom: 5.30,
    maxZoom: 6.30,
    penPV: {
      name: 'P_Discharge (Давление факт)',
      nodeId: 'ns=2;s=Pumps.Manifold.P_Actual',
      color: '#2563eb',
      label: 'Факт PV',
    },
    penSP: {
      name: 'P_Set (Уставка давления)',
      nodeId: 'ns=2;s=Pumps.Manifold.P_Set',
      color: '#d97706',
      label: 'Уставка SP',
      setpoint: 5.80,
    },
    penAux: {
      name: 'P_Suction (Давление на всасе)',
      nodeId: 'ns=2;s=Pumps.Manifold.P_Suction',
      color: '#94a3b8',
      label: 'Всас',
    },
    initialPV: 5.76,
    initialAux: 5.50,
  },
  {
    id: 'chiller',
    title: 'Чиллерная №2',
    subtitle: 'Холодоцентр • Выход хладоносителя vs Уставка',
    icon: Snowflake,
    serverConnId: 'conn-3',
    serverName: 'Чиллерная станция №2',
    unit: '°C',
    minFull: 0.0,
    maxFull: 20.0,
    minZoom: 5.5,
    maxZoom: 8.5,
    penPV: {
      name: 'Water_Outlet_Actual (Факт)',
      nodeId: 'ns=2;s=Chiller2.Water.T_Outlet',
      color: '#2563eb',
      label: 'Факт PV',
    },
    penSP: {
      name: 'Water_Outlet_Set (Уставка)',
      nodeId: 'ns=2;s=Chiller2.Water.T_Set',
      color: '#d97706',
      label: 'Уставка SP',
      setpoint: 7.0,
    },
    penAux: {
      name: 'Water_Inlet_Temp (Вход)',
      nodeId: 'ns=2;s=Chiller2.Water.T_Inlet',
      color: '#94a3b8',
      label: 'Вход',
    },
    initialPV: 7.25,
    initialAux: 7.8,
  },
];

interface WatchlistRow {
  id: string;
  name: string;
  serverName: string;
  serverConnId: string;
  nodeId: string;
  dataType: 'Float32' | 'Int32' | 'Boolean';
  value: number | boolean;
  unit?: string;
  quality: 'Good' | 'Bad' | 'Uncertain';
  samplingMs: number;
  access: 'R/W' | 'RO';
  history: number[];
}

export const MonitorTrendsView: React.FC<MonitorTrendsViewProps> = ({
  connections,
  onNavigateToConnection,
  onShowToast,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('boiler');
  const [layoutMode, setLayoutMode] = useState<'split' | 'trends' | 'table'>('split');
  const [isPaused, setIsPaused] = useState(false);
  const [isZoomMode, setIsZoomMode] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServerFilter, setSelectedServerFilter] = useState('all');

  // Dynamic Chart Width Observer for 100% full-width plot without horizontal compression
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(1200);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateWidth = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth;
        if (w > 200) setChartWidth(w);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const currentPreset = useMemo(() => {
    return PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  }, [selectedPresetId]);

  // Buffer length: 40 points (approx 60s at 1.5s interval)
  const POINTS_COUNT = 40;

  // Real-time buffers for the 3 curves of the current preset
  const [historyPV, setHistoryPV] = useState<number[]>(() => {
    const base = currentPreset.initialPV;
    return Array.from({ length: POINTS_COUNT }, (_, i) => {
      const noise = (Math.sin(i * 0.4) * 0.35) + ((i % 5 === 0 ? 0.2 : -0.1));
      return Number((base + noise).toFixed(2));
    });
  });

  const [historySP, setHistorySP] = useState<number[]>(() => {
    const sp = currentPreset.penSP.setpoint;
    return Array.from({ length: POINTS_COUNT }, () => sp);
  });

  const [historyAux, setHistoryAux] = useState<number[]>(() => {
    const base = currentPreset.initialAux || 0;
    return Array.from({ length: POINTS_COUNT }, (_, i) => {
      const noise = Math.cos(i * 0.3) * 0.25;
      return Number((base + noise).toFixed(2));
    });
  });

  // Re-seed history when preset switches
  useEffect(() => {
    const basePV = currentPreset.initialPV;
    const baseAux = currentPreset.initialAux || 0;
    const sp = currentPreset.penSP.setpoint;

    setHistoryPV(
      Array.from({ length: POINTS_COUNT }, (_, i) => {
        const noise = (Math.sin(i * 0.4) * 0.35);
        return Number((basePV + noise).toFixed(2));
      })
    );
    setHistorySP(Array.from({ length: POINTS_COUNT }, () => sp));
    setHistoryAux(
      Array.from({ length: POINTS_COUNT }, (_, i) => {
        const noise = Math.cos(i * 0.3) * 0.25;
        return Number((baseAux + noise).toFixed(2));
      })
    );
  }, [selectedPresetId]);

  // Watchlist items
  const [watchlist, setWatchlist] = useState<WatchlistRow[]>([
    {
      id: 'w-1',
      name: 'T_Supply_Heating (Подача контура)',
      serverName: 'Котельная №4',
      serverConnId: 'conn-1',
      nodeId: 'ns=2;s=Boiler4.Circuit1.T_Supply',
      dataType: 'Float32',
      value: 74.8,
      unit: '°C',
      quality: 'Good',
      samplingMs: 250,
      access: 'R/W',
      history: [74.2, 74.5, 74.7, 74.8, 75.0, 74.8, 74.7, 74.8],
    },
    {
      id: 'w-2',
      name: 'Burner_Modulation (Модуляция мощности)',
      serverName: 'Котельная №4',
      serverConnId: 'conn-1',
      nodeId: 'ns=2;s=Boiler4.Circuit1.Burner.Modulation',
      dataType: 'Float32',
      value: 81.0,
      unit: '%',
      quality: 'Good',
      samplingMs: 1000,
      access: 'RO',
      history: [79.5, 80.2, 81.0, 81.5, 81.0, 80.8, 81.0, 81.0],
    },
    {
      id: 'w-3',
      name: 'Supply_Air_Temp (Температура притока)',
      serverName: 'Вентиляция Блок Б',
      serverConnId: 'conn-2',
      nodeId: 'ns=2;s=AHU1.Supply.T_Supply',
      dataType: 'Float32',
      value: 21.4,
      unit: '°C',
      quality: 'Good',
      samplingMs: 500,
      access: 'RO',
      history: [20.9, 21.1, 21.3, 21.4, 21.5, 21.4, 21.3, 21.4],
    },
    {
      id: 'w-4',
      name: 'HeatRecovery_Efficiency (КПД ротора)',
      serverName: 'Вентиляция Блок Б',
      serverConnId: 'conn-2',
      nodeId: 'ns=2;s=AHU1.Recovery.EfficiencyPct',
      dataType: 'Float32',
      value: 76.8,
      unit: '%',
      quality: 'Good',
      samplingMs: 1000,
      access: 'RO',
      history: [76.1, 76.4, 76.8, 77.0, 76.8, 76.6, 76.8, 76.8],
    },
    {
      id: 'w-5',
      name: 'P_Discharge (Напорное давление)',
      serverName: 'Насосная станция',
      serverConnId: 'conn-4',
      nodeId: 'ns=2;s=Pumps.Manifold.P_Actual',
      dataType: 'Float32',
      value: 5.78,
      unit: 'бар',
      quality: 'Good',
      samplingMs: 250,
      access: 'RO',
      history: [5.73, 5.75, 5.77, 5.78, 5.80, 5.78, 5.77, 5.78],
    },
    {
      id: 'w-6',
      name: 'Drive_Frequency_Hz (Выходная частота ЧП)',
      serverName: 'Насосная станция',
      serverConnId: 'conn-4',
      nodeId: 'ns=2;s=Pumps.Drive.FreqHz',
      dataType: 'Float32',
      value: 46.8,
      unit: 'Гц',
      quality: 'Good',
      samplingMs: 250,
      access: 'R/W',
      history: [46.2, 46.5, 46.7, 46.8, 47.0, 46.8, 46.7, 46.8],
    },
    {
      id: 'w-7',
      name: 'Water_Outlet_Actual (Хладоноситель факт)',
      serverName: 'Чиллерная станция №2',
      serverConnId: 'conn-3',
      nodeId: 'ns=2;s=Chiller2.Water.T_Outlet',
      dataType: 'Float32',
      value: 7.2,
      unit: '°C',
      quality: 'Good',
      samplingMs: 500,
      access: 'RO',
      history: [7.5, 7.4, 7.3, 7.2, 7.2, 7.3, 7.2, 7.2],
    },
    {
      id: 'w-8',
      name: 'Compressor_Capacity (Ступень мощности)',
      serverName: 'Чиллерная станция №2',
      serverConnId: 'conn-3',
      nodeId: 'ns=2;s=Chiller2.Compressor.CapacityStep',
      dataType: 'Float32',
      value: 75.0,
      unit: '%',
      quality: 'Good',
      samplingMs: 500,
      access: 'R/W',
      history: [75, 75, 75, 75, 75, 75, 75, 75],
    },
  ]);

  // Live simulation tick (every 1.5 seconds)
  useEffect(() => {
    if (isPaused) return;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setHistoryPV((prev) => {
        const target = currentPreset.penSP.setpoint;
        // Natural PID regulation oscillation: responsive wave with visible dynamic
        const oscillation = Math.sin(step * 0.45) * (currentPreset.id === 'pumps' ? 0.22 : 0.65);
        const noise = (Math.random() - 0.5) * (currentPreset.id === 'pumps' ? 0.05 : 0.18);
        const nextVal = Number((target + oscillation + noise).toFixed(2));
        return [...prev.slice(1), nextVal];
      });

      setHistorySP((prev) => [...prev.slice(1), currentPreset.penSP.setpoint]);

      if (currentPreset.penAux) {
        setHistoryAux((prev) => {
          const base = currentPreset.initialAux || 0;
          const drift = Math.cos(step * 0.35) * (currentPreset.id === 'pumps' ? 0.10 : 0.35);
          const nextVal = Number((base + drift).toFixed(2));
          return [...prev.slice(1), nextVal];
        });
      }

      // Update Watchlist sparklines
      setWatchlist((prevList) =>
        prevList.map((tag) => {
          if (typeof tag.value === 'number') {
            const delta = (Math.random() - 0.49) * (tag.unit === 'бар' ? 0.03 : 0.14);
            const next = Number((tag.value + delta).toFixed(tag.unit === 'бар' ? 2 : 1));
            return {
              ...tag,
              value: next,
              history: [...tag.history.slice(1), next],
            };
          }
          return tag;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, currentPreset]);

  const currentPV = historyPV[historyPV.length - 1];
  const currentSP = currentPreset.penSP.setpoint;
  const currentAux = historyAux[historyAux.length - 1];
  const currentError = Number((currentPV - currentSP).toFixed(2));

  // Export CSV
  const handleExportCsv = () => {
    const header = ['Timestamp', `${currentPreset.penPV.name} [${currentPreset.unit}]`, `${currentPreset.penSP.name} [${currentPreset.unit}]`].join(',');
    const rows = Array.from({ length: POINTS_COUNT }).map((_, i) => {
      const timeSec = (POINTS_COUNT - i) * 1.5;
      return [`-${timeSec}s`, historyPV[i] ?? '', historySP[i] ?? ''].join(',');
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `opc_trend_${currentPreset.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Экспорт тренда "${currentPreset.title}" завершен (IEC 62541-11 HDA)`);
  };

  // SVG Chart Metrics - Dynamically full-width without horizontal compression
  const chartHeight = 210;
  const padding = { top: 16, right: 18, bottom: 24, left: 52 };
  const graphWidth = Math.max(100, chartWidth - padding.left - padding.right);
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const yMin = isZoomMode ? currentPreset.minZoom : currentPreset.minFull;
  const yMax = isZoomMode ? currentPreset.maxZoom : currentPreset.maxFull;
  const yRange = yMax - yMin;

  const getY = (val: number) => {
    const normalized = Math.max(0, Math.min(1, (val - yMin) / (yRange || 1)));
    return padding.top + (1 - normalized) * graphHeight;
  };

  const getX = (idx: number) => {
    return padding.left + (idx / (POINTS_COUNT - 1)) * graphWidth;
  };

  const makeSmoothPath = (data: number[]) => {
    if (data.length < 2) return '';
    const points = data.map((v, i) => ({ x: getX(i), y: getY(v) }));
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cx = (curr.x + next.x) / 2;
      d += ` C ${cx},${curr.y} ${cx},${next.y} ${next.x},${next.y}`;
    }
    return d;
  };

  const pathPV = makeSmoothPath(historyPV);
  const pathSP = makeSmoothPath(historySP);
  const pathAux = currentPreset.penAux ? makeSmoothPath(historyAux) : '';
  const areaPV = `${pathPV} L ${padding.left + graphWidth},${padding.top + graphHeight} L ${padding.left},${padding.top + graphHeight} Z`;

  // 5 Graduation lines on Y axis
  const yTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((pct) => {
      const val = yMin + pct * yRange;
      const y = padding.top + (1 - pct) * graphHeight;
      return { val: Number(val.toFixed(1)), y };
    });
  }, [yMin, yRange, graphHeight]);

  // Filtered Watchlist
  const filteredWatchlist = useMemo(() => {
    return watchlist.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.serverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchServer =
        selectedServerFilter === 'all' || t.serverConnId === selectedServerFilter;
      return matchSearch && matchServer;
    });
  }, [watchlist, searchQuery, selectedServerFilter]);

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between h-full relative z-10 select-none animate-drill-in">
      {/* Top Header & Master Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-3 border-b border-neutral-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-heading">
              Сводный монитор и тренды
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-emerald-50 text-emerald-700 text-[10px] font-bold font-sans border border-emerald-200/70">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${!isPaused ? 'animate-pulse' : ''}`} />
              <span>{isPaused ? 'ПАУЗА' : 'LIVE 250 мс'}</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Прецизионный многоканальный самописец (IEC 62541-11 HDA) и кросс-серверный Watchlist
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Modes */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-[8px] border border-neutral-200/60 text-xs font-semibold font-sans">
            <button
              onClick={() => setLayoutMode('split')}
              className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                layoutMode === 'split' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Сплит
            </button>
            <button
              onClick={() => setLayoutMode('trends')}
              className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                layoutMode === 'trends' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Тренды
            </button>
            <button
              onClick={() => setLayoutMode('table')}
              className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                layoutMode === 'table' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Таблица
            </button>
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              onShowToast(isPaused ? 'Запись трендов возобновлена' : 'Запись трендов приостановлена');
            }}
            className={`tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
            }`}
          >
            {isPaused ? <Play size={13} weight="bold" /> : <Pause size={13} weight="bold" />}
            <span>{isPaused ? 'Пуск' : 'Пауза'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0f172a] hover:bg-black text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Экспортировать тренд в CSV"
          >
            <DownloadSimple size={13} weight="bold" />
            <span className="hidden sm:inline">Экспорт CSV</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 min-w-0 flex flex-col gap-3.5 my-3 overflow-hidden">
        {/* SECTION 1: Deep Telemetry Chart Console (Shown in 'split' and 'trends') */}
        {(layoutMode === 'split' || layoutMode === 'trends') && (
          <div
            className={`bg-[#0a0d14] text-white rounded-[16px] border border-white/[0.08] shadow-xs p-4 flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${
              layoutMode === 'trends' ? 'flex-1' : 'h-[320px] shrink-0'
            }`}
          >
            {/* Top Toolbar inside Chart: Equipment Loop Selector & Live Telemetry Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08] relative z-10 shrink-0">
              {/* Loop Presets (Clean segmented pill control) */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-[8px] border border-white/[0.08]">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      className={`tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-sans transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 text-white font-bold shadow-2xs border border-white/20'
                          : 'text-neutral-400 hover:text-white font-medium hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon size={14} weight={isSelected ? 'bold' : 'light'} />
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Real-time Readings Ribbon (PV vs SP vs Δ) */}
              <div className="flex items-center gap-2.5 text-xs font-sans">
                {/* PV (Fact) */}
                <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-400/25 px-3 py-1 rounded-[8px]">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                  <span className="text-sky-300 font-medium text-xs">{currentPreset.penPV.label}:</span>
                  <span className="font-heading font-black text-sm text-sky-100">
                    {currentPV} {currentPreset.unit}
                  </span>
                </div>

                {/* SP (Setpoint) */}
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-400/25 px-3 py-1 rounded-[8px]">
                  <span className="w-2 h-0.5 rounded bg-amber-400" />
                  <span className="text-amber-300 font-medium text-xs">{currentPreset.penSP.label}:</span>
                  <span className="font-heading font-black text-sm text-amber-100">
                    {currentSP} {currentPreset.unit}
                  </span>
                </div>

                {/* Regulation Error (Δ) */}
                <div className="hidden md:flex items-center gap-1.5 text-neutral-300 bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 rounded-[8px]">
                  <span className="text-[11px] text-neutral-400">Невязка Δ:</span>
                  <span
                    className={`font-bold font-heading text-xs ${
                      Math.abs(currentError) > 0.5 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {currentError > 0 ? `+${currentError}` : currentError} {currentPreset.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Precision SVG Oscilloscope Canvas - Dynamically Full Width */}
            <div ref={chartContainerRef} className="flex-1 w-full relative overflow-hidden flex items-center justify-center py-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
                  const ratio = Math.max(0, Math.min(1, (mouseX - padding.left) / graphWidth));
                  const idx = Math.round(ratio * (POINTS_COUNT - 1));
                  setHoverIndex(idx);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  {/* Subtle Clean Cyan Area Fill */}
                  <linearGradient id="pvGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines & Y Axis Labels */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={tick.y}
                      x2={chartWidth - padding.right}
                      y2={tick.y}
                      stroke="rgba(255, 255, 255, 0.07)"
                      strokeDasharray={i === 0 || i === yTicks.length - 1 ? 'none' : '4 4'}
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={tick.y + 3.5}
                      textAnchor="end"
                      className="text-[11px] fill-neutral-400 font-mono font-medium select-none"
                    >
                      {tick.val} {currentPreset.unit}
                    </text>
                  </g>
                ))}

                {/* X Axis Time Marks */}
                {['-60с', '-45с', '-30с', '-15с', '0с (Live)'].map((label, i) => {
                  const x = padding.left + (i / 4) * graphWidth;
                  return (
                    <g key={label}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + graphHeight}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={chartHeight - 6}
                        textAnchor={i === 4 ? 'end' : i === 0 ? 'start' : 'middle'}
                        className="text-[11px] fill-neutral-400 font-sans font-medium select-none"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Curve 1 (Auxiliary / Return, e.g. T_Return) */}
                {pathAux && (
                  <path
                    d={pathAux}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Curve 2: Setpoint SP (Amber Reference Line) */}
                <path
                  d={pathSP}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeDasharray="5 3"
                  className="transition-all duration-300"
                />

                {/* Curve 3: Process Variable PV Area Fill */}
                <path d={areaPV} fill="url(#pvGlow)" />

                {/* Curve 3: Process Variable PV (Clean, Crisp Cyan Line, No Gaudy Blur) */}
                <path
                  d={pathPV}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* Pulsating Leading Edge Dot at Current Live Time */}
                {historyPV.length > 0 && (
                  <g>
                    <circle
                      cx={padding.left + graphWidth}
                      cy={getY(currentPV)}
                      r="8"
                      fill="#38bdf8"
                      fillOpacity="0.2"
                      className="animate-ping"
                    />
                    <circle
                      cx={padding.left + graphWidth}
                      cy={getY(currentPV)}
                      r="3.5"
                      fill="#38bdf8"
                      stroke="#0a0d14"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Interactive Crosshair Cursor on Mouse Hover */}
                {hoverIndex !== null && hoverIndex >= 0 && hoverIndex < POINTS_COUNT && (
                  <g>
                    {/* Vertical guideline */}
                    <line
                      x1={getX(hoverIndex)}
                      y1={padding.top}
                      x2={getX(hoverIndex)}
                      y2={padding.top + graphHeight}
                      stroke="#64748b"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />

                    {/* Point on PV */}
                    <circle
                      cx={getX(hoverIndex)}
                      cy={getY(historyPV[hoverIndex])}
                      r="4"
                      fill="#38bdf8"
                      stroke="#0a0d14"
                      strokeWidth="2"
                    />

                    {/* Floating Tooltip Card */}
                    <g transform={`translate(${Math.min(chartWidth - 170, Math.max(padding.left, getX(hoverIndex) - 75))}, ${padding.top + 8})`}>
                      <rect
                        width="150"
                        height="54"
                        rx="8"
                        fill="#111622"
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth="1"
                        className="shadow-xl"
                      />
                      <text x="10" y="16" fill="#94a3b8" className="text-[10px] font-sans font-medium">
                        T - {Math.round((POINTS_COUNT - 1 - hoverIndex) * 1.5)} сек назад
                      </text>
                      <text x="10" y="32" fill="#38bdf8" className="text-[11px] font-bold font-mono">
                        PV: {historyPV[hoverIndex]} {currentPreset.unit}
                      </text>
                      <text x="10" y="46" fill="#f59e0b" className="text-[11px] font-bold font-mono">
                        SP: {historySP[hoverIndex]} {currentPreset.unit}
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[11px] font-sans text-neutral-400 relative z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-[#38bdf8]" />
                  <span className="text-neutral-200 font-medium">{currentPreset.penPV.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-[#f59e0b] border-b border-dashed border-[#f59e0b]" />
                  <span className="text-neutral-300 font-medium">{currentPreset.penSP.name}</span>
                </div>
                {currentPreset.penAux && (
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    <span className="w-3 h-0.5 rounded bg-[#64748b] border-b border-dashed border-[#64748b]" />
                    <span className="text-neutral-400">{currentPreset.penAux.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsZoomMode(!isZoomMode)}
                  className="tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer border border-white/[0.08]"
                  title="Нажмите, чтобы переключить между детальным зумом и полной шкалой"
                >
                  <span className="text-neutral-400">Шкала:</span>
                  <strong className="text-white">{isZoomMode ? 'Фокус (PID детали)' : 'Полный диапазон'}</strong>
                  <span className="text-sky-400 font-mono text-[10px]">[{yMin}..{yMax} {currentPreset.unit}]</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Unified Watchlist Table (Shown in 'split' and 'table') */}
        {(layoutMode === 'split' || layoutMode === 'table') && (
          <div className="flex-1 min-w-0 bg-white rounded-[16px] border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              {/* Watchlist Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-100 shrink-0">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Поиск по имени тега, NodeId или серверу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#f8fafd] border border-neutral-200/70 rounded-[8px] pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-violet-500 font-sans"
                  />
                </div>

                {/* Filter Chips by Server */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-sans">
                  <button
                    onClick={() => setSelectedServerFilter('all')}
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
                      selectedServerFilter === 'all'
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    Все ({watchlist.length})
                  </button>

                  <button
                    onClick={() => setSelectedServerFilter('conn-1')}
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
                      selectedServerFilter === 'conn-1'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    Котельная №4
                  </button>

                  <button
                    onClick={() => setSelectedServerFilter('conn-2')}
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
                      selectedServerFilter === 'conn-2'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    Вентиляция Блок Б
                  </button>

                  <button
                    onClick={() => setSelectedServerFilter('conn-4')}
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
                      selectedServerFilter === 'conn-4'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    Насосная станция
                  </button>

                  <button
                    onClick={() => setSelectedServerFilter('conn-3')}
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
                      selectedServerFilter === 'conn-3'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    Чиллерная №2
                  </button>
                </div>
              </div>

              {/* Table with Clean Micro-Sparklines */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <tr className="border-b border-neutral-200/60 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-2 pl-2">Параметр / NodeId</th>
                      <th className="pb-2">Сервер / ПЛК</th>
                      <th className="pb-2">Тип</th>
                      <th className="pb-2">Значение (Live)</th>
                      <th className="pb-2">Микротренд</th>
                      <th className="pb-2">Качество</th>
                      <th className="pb-2 text-right pr-2">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredWatchlist.map((tag) => {
                      const conn = connections.find((c) => c.id === tag.serverConnId);

                      // Mini Sparkline SVG coordinates
                      const sMin = Math.min(...tag.history);
                      const sMax = Math.max(...tag.history);
                      const sRange = sMax - sMin || 1;
                      const sPoints = tag.history
                        .map((val, i) => {
                          const sx = (i / (tag.history.length - 1)) * 64;
                          const sy = 16 - ((val - sMin) / sRange) * 12;
                          return `${sx},${sy}`;
                        })
                        .join(' ');

                      return (
                        <tr key={tag.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-2.5 pl-2 max-w-[220px]">
                            <div className="font-bold text-[#0f172a] truncate">{tag.name}</div>
                            <div className="text-[11px] text-neutral-400 truncate">{tag.nodeId}</div>
                          </td>

                          <td className="py-2.5">
                            <span className="font-semibold text-neutral-800 text-[11px] px-2 py-0.5 rounded-[4px] bg-neutral-100/90 border border-neutral-200/50">
                              {tag.serverName}
                            </span>
                          </td>

                          <td className="py-2.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-neutral-100 text-neutral-600">
                              {tag.dataType}
                            </span>
                          </td>

                          <td className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[#0f172a] font-heading text-sm">
                                {String(tag.value)}
                              </span>
                              {tag.unit && <span className="text-[11px] text-neutral-400 font-sans">{tag.unit}</span>}
                            </div>
                          </td>

                          {/* Refined Smooth SVG Polyline Sparkline */}
                          <td className="py-2.5">
                            <svg className="w-16 h-4 overflow-visible" viewBox="0 0 64 16">
                              <polyline
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={sPoints}
                              />
                            </svg>
                          </td>

                          <td className="py-2.5">
                            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {tag.quality}
                            </span>
                          </td>

                          <td className="py-2.5 text-right pr-2">
                            {conn && (
                              <button
                                onClick={() => onNavigateToConnection(conn)}
                                className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                                title="Перейти к узлу в адресном пространстве"
                              >
                                <span>К ПЛК</span>
                                <ArrowSquareOut size={12} weight="bold" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
