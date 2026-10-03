"use client";

import { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  ArrowsClockwise,
  Trash,
  ArrowSquareOut,
  Plugs,
  Lightning,
  CheckCircle,
  ArrowRight,
  MagnifyingGlass,
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  Broadcast,
  PencilSimple,
} from '@phosphor-icons/react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import type { OpcConnection, HardwareCategoryId } from '../types/opc';

export interface DiscoveredDevice {
  id: string;
  name: string;
  endpoint: string;
  controllerType: string;
  categoryId: HardwareCategoryId;
  securityPolicy: string;
  messageSecurityMode: 'SignAndEncrypt' | 'Sign' | 'None';
  pingMs: number;
  tagsCount: number;
  discoverySource: 'LDS :4840' | 'mDNS' | 'Subnet Scan';
  vendor: string;
}

export const DISCOVERED_DEVICES: DiscoveredDevice[] = [
  {
    id: 'disc-1',
    name: 'Siemens S7-1500 (CPU 1516)',
    endpoint: 'opc.tcp://10.0.4.15:4840',
    controllerType: 'Siemens S7-1200 / S7-1500 (TIA Portal)',
    categoryId: 'plc',
    securityPolicy: 'Basic256Sha256',
    messageSecurityMode: 'SignAndEncrypt',
    pingMs: 14,
    tagsCount: 384,
    discoverySource: 'LDS :4840',
    vendor: 'Siemens AG',
  },
  {
    id: 'disc-2',
    name: 'Schneider Modicon M262',
    endpoint: 'opc.tcp://10.0.4.82:4840',
    controllerType: 'Schneider Modicon M241 / M262',
    categoryId: 'plc',
    securityPolicy: 'Aes128_Sha256_RsaOaep',
    messageSecurityMode: 'SignAndEncrypt',
    pingMs: 22,
    tagsCount: 192,
    discoverySource: 'LDS :4840',
    vendor: 'Schneider Electric',
  },
  {
    id: 'disc-3',
    name: 'Beckhoff CX5140 (TwinCAT)',
    endpoint: 'opc.tcp://10.0.4.99:4840',
    controllerType: 'Другой OPC UA сервер',
    categoryId: 'plc',
    securityPolicy: 'Basic256Sha256',
    messageSecurityMode: 'SignAndEncrypt',
    pingMs: 18,
    tagsCount: 512,
    discoverySource: 'LDS :4840',
    vendor: 'Beckhoff Automation',
  },
  {
    id: 'disc-4',
    name: 'Овен ПЛК210 (Codesys)',
    endpoint: 'opc.tcp://10.0.4.110:4840',
    controllerType: 'Овен ПЛК210 / ПЛК200 (Codesys)',
    categoryId: 'plc',
    securityPolicy: 'Basic256Sha256',
    messageSecurityMode: 'Sign',
    pingMs: 19,
    tagsCount: 140,
    discoverySource: 'mDNS',
    vendor: 'Овен Автоматика',
  },
  {
    id: 'disc-5',
    name: 'Wiren Board 7 Gateway',
    endpoint: 'opc.tcp://10.0.4.120:4840',
    controllerType: 'Другой OPC UA сервер',
    categoryId: 'gateway',
    securityPolicy: 'None',
    messageSecurityMode: 'None',
    pingMs: 11,
    tagsCount: 96,
    discoverySource: 'Subnet Scan',
    vendor: 'Wiren Board',
  },
  {
    id: 'disc-6',
    name: 'Moxa NPort IAW5150D',
    endpoint: 'opc.tcp://10.0.4.135:4840',
    controllerType: 'Другой OPC UA сервер',
    categoryId: 'gateway',
    securityPolicy: 'Basic256Sha256',
    messageSecurityMode: 'Sign',
    pingMs: 15,
    tagsCount: 64,
    discoverySource: 'LDS :4840',
    vendor: 'Moxa Inc.',
  },
  {
    id: 'disc-7',
    name: 'KEPServerEX v6 Gateway',
    endpoint: 'opc.tcp://10.0.4.200:49320',
    controllerType: 'Другой OPC UA сервер',
    categoryId: 'scada',
    securityPolicy: 'Basic256Sha256',
    messageSecurityMode: 'SignAndEncrypt',
    pingMs: 8,
    tagsCount: 1240,
    discoverySource: 'LDS :4840',
    vendor: 'PTC Kepware',
  },
  {
    id: 'disc-8',
    name: 'Danfoss VLT FC 302',
    endpoint: 'opc.tcp://10.0.4.150:4840',
    controllerType: 'Carel pCO / Холодильная автоматика',
    categoryId: 'smart_device',
    securityPolicy: 'Basic256Sha256',
    messageSecurityMode: 'Sign',
    pingMs: 16,
    tagsCount: 78,
    discoverySource: 'mDNS',
    vendor: 'Danfoss Drives',
  },
];

interface RightDrawerProps {
  isOpen: boolean;
  mode?: 'view' | 'create' | 'search';
  onClose: () => void;
  connection: OpcConnection | null;
  connections?: OpcConnection[];
  allConnections?: OpcConnection[];
  currentCategoryTitle?: string;
  onSelectConnection?: (conn: OpcConnection) => void;
  onDeleteConnection: (id: string) => void;
  onOpenSession: (conn: OpcConnection) => void;
  onAddConnection?: (newConn: OpcConnection) => void;
  onSwitchMode?: (mode: 'view' | 'create' | 'search') => void;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  mode = 'view',
  onClose,
  connection,
  connections = [],
  allConnections = [],
  currentCategoryTitle,
  onSelectConnection,
  onDeleteConnection,
  onOpenSession,
  onAddConnection,
  onSwitchMode,
}) => {
  // Search mode states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'current' | 'all'>('current');
  const [cameFromSearch, setCameFromSearch] = useState(false);

  // View mode states
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Create mode states (Manual & Auto-Discovery)
  const [createMethod, setCreateMethod] = useState<'manual' | 'auto'>('manual');
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('opc.tcp://10.0.1.');
  const [controllerType, setControllerType] = useState('Siemens S7-1200 / S7-1500 (TIA Portal)');
  const [securityPolicy, setSecurityPolicy] = useState('Basic256Sha256');
  const [messageSecurityMode, setMessageSecurityMode] = useState<OpcConnection['messageSecurityMode']>('SignAndEncrypt');
  const [tagsCount, setTagsCount] = useState(120);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [prefilledFromDiscovered, setPrefilledFromDiscovered] = useState<string | null>(null);

  // Auto-discovery states
  const [isScanning, setIsScanning] = useState(false);
  const [scanSubnet, setScanSubnet] = useState('10.0.4.0/24 (Ethernet)');
  const [selectedDiscoveredId, setSelectedDiscoveredId] = useState<string | null>('disc-1');
  const [discoveryScope, setDiscoveryScope] = useState<'category' | 'all'>('category');

  if (!isOpen && !connection) return null;

  const handleCopyEndpoint = () => {
    if (!connection) return;
    navigator.clipboard.writeText(connection.endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePingTest = () => {
    if (!connection) return;
    setPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setPinging(false);
      setPingResult(`Отклик: ${connection.pingMs} мс • Пакеты 100% (Без потерь)`);
    }, 500);
  };

  const handleTestCreatePing = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Связь установлена: 19 мс (OPC UA v1.04)');
    }, 500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !onAddConnection) return;

    const newConnection: OpcConnection = {
      id: `conn-${Date.now()}`,
      categoryId: connection?.categoryId || 'plc',
      name: name.trim(),
      endpoint: endpoint.trim() || 'opc.tcp://10.0.1.50:4840',
      tagsCount: Number(tagsCount) || 80,
      protocol: 'OPC UA v1.04',
      pingMs: 20,
      uptime: '100%',
      status: 'online',
      securityPolicy,
      messageSecurityMode,
      controllerType,
      lastSync: 'Только что',
    };

    onAddConnection(newConnection);
    setName('');
    setTestResult(null);
  };

  const currentList = connections || [];
  const fullList = allConnections && allConnections.length > 0 ? allConnections : currentList;
  const baseList = searchScope === 'all' ? fullList : currentList;

  const filteredConnections = baseList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.endpoint.toLowerCase().includes(q) ||
      (c.controllerType && c.controllerType.toLowerCase().includes(q))
    );
  });

  const handleSelectFromSearch = (conn: OpcConnection) => {
    setCameFromSearch(true);
    if (onSelectConnection) {
      onSelectConnection(conn);
    }
  };

  const handleConnectDiscovered = (dev: DiscoveredDevice) => {
    if (!onAddConnection) return;
    const newConnection: OpcConnection = {
      id: `conn-${Date.now()}`,
      categoryId: connection?.categoryId || dev.categoryId,
      name: dev.name,
      endpoint: dev.endpoint,
      tagsCount: dev.tagsCount,
      protocol: 'OPC UA v1.04',
      pingMs: dev.pingMs,
      uptime: '100%',
      status: 'online',
      securityPolicy: dev.securityPolicy,
      messageSecurityMode: dev.messageSecurityMode,
      controllerType: dev.controllerType,
      lastSync: 'Только что (LDS)',
    };
    onAddConnection(newConnection);
  };

  const handlePreFillFromDiscovered = (dev: DiscoveredDevice) => {
    setName(dev.name);
    setEndpoint(dev.endpoint);
    setControllerType(dev.controllerType);
    setSecurityPolicy(dev.securityPolicy);
    setMessageSecurityMode(dev.messageSecurityMode);
    setTagsCount(dev.tagsCount);
    setPrefilledFromDiscovered(dev.name);
    setCreateMethod('manual');
  };

  const handleScanSubnet = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 650);
  };

  const activeCategory = connection?.categoryId || 'plc';
  const categoryDiscovered = DISCOVERED_DEVICES.filter((d) => d.categoryId === activeCategory);
  const filteredDiscovered = DISCOVERED_DEVICES.filter((d) => {
    if (discoveryScope === 'category' && d.categoryId !== activeCategory) {
      return false;
    }
    return true;
  });

  const selectedDevice = DISCOVERED_DEVICES.find((d) => d.id === selectedDiscoveredId) || filteredDiscovered[0] || null;

  return (
    <aside
      className={`bg-[#0c0e14] text-white border border-white/10 rounded-[18px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col shrink-0 select-none overflow-hidden z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen
          ? 'w-80 sm:w-96 p-5 opacity-100 translate-x-0 scale-100 pointer-events-auto'
          : 'w-0 p-0 border-0 opacity-0 translate-x-10 scale-95 pointer-events-none'
      }`}
    >
      <div className="w-[280px] sm:w-[344px] h-full flex flex-col min-h-0 shrink-0 text-white overflow-hidden">
        {mode === 'search' ? (
          /* ========================================================= */
          /* MODE: SEARCH / FIND EXISTING CONNECTIONS                 */
          /* ========================================================= */
          <div key="search" className="motion-mode-switch flex-1 flex flex-col h-full min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header */}
              <div className="motion-stagger-1 flex items-center justify-between pb-3.5 border-b border-white/10 mb-3.5 shrink-0">
                <div>
                  <h2 className="text-base font-black text-white tracking-tight font-heading">
                    Поиск подключения
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">
                    Ручной поиск по названию, IP или ПЛК
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="tactile-btn w-7 h-7 rounded-[7px] bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Закрыть панель"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>

              {/* Search Input Bar */}
              <div className="motion-stagger-2 shrink-0 mb-3 space-y-2">
                <div className="relative">
                  <MagnifyingGlass
                    size={16}
                    weight="light"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Поиск по названию или IP (10.0.8, Блок Б)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/12 rounded-[10px] pl-9 pr-8 py-2 text-xs font-sans text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                      title="Очистить"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  )}
                </div>

                {/* Scope selector tabs & counter */}
                <div className="flex items-center justify-between text-[11px] font-sans">
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-[7px] border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSearchScope('current')}
                      className={`tactile-btn px-2 py-0.5 rounded-[5px] text-[10px] font-bold transition-all cursor-pointer ${
                        searchScope === 'current'
                          ? 'bg-white/20 text-white shadow-2xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      В категории ({currentList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchScope('all')}
                      className={`tactile-btn px-2 py-0.5 rounded-[5px] text-[10px] font-bold transition-all cursor-pointer ${
                        searchScope === 'all'
                          ? 'bg-white/20 text-white shadow-2xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Все узлы ({fullList.length})
                    </button>
                  </div>

                  <span className="text-[10px] text-neutral-400 font-medium">
                    Найдено: {filteredConnections.length}
                  </span>
                </div>
              </div>

              {/* List of Matched Connections */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0">
                {filteredConnections.length > 0 ? (
                  filteredConnections.map((conn, idx) => (
                    <div
                      key={conn.id}
                      onClick={() => handleSelectFromSearch(conn)}
                      className={`bg-white/5 hover:bg-white/10 rounded-[12px] p-3 border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer group flex flex-col gap-2 ${
                        idx === 0
                          ? 'motion-stagger-3'
                          : idx === 1
                          ? 'motion-stagger-4'
                          : idx === 2
                          ? 'motion-stagger-5'
                          : 'motion-stagger-6'
                      }`}
                    >
                      {/* Row 1: Status + Name + Tags */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              conn.status === 'online'
                                ? 'bg-emerald-500 animate-pulse'
                                : conn.status === 'error'
                                ? 'bg-red-500'
                                : 'bg-neutral-400'
                            }`}
                          />
                          <h4 className="text-xs font-black text-white group-hover:text-violet-300 transition-colors font-heading truncate">
                            {conn.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 bg-white/10 px-1.5 py-0.5 rounded-[4px] shrink-0 font-sans">
                          {conn.tagsCount} тегов
                        </span>
                      </div>

                      {/* Row 2: Endpoint URI */}
                      <div className="text-[11px] font-sans text-neutral-300 truncate flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-[6px] border border-white/5">
                        <Plugs size={13} weight="light" className="text-neutral-400 shrink-0" />
                        <span className="truncate">{conn.endpoint}</span>
                      </div>

                      {/* Row 3: Controller + Action Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 gap-1 text-[11px] font-sans">
                        <span className="text-[10px] text-neutral-400 truncate max-w-[130px]" title={conn.controllerType}>
                          {conn.controllerType}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectFromSearch(conn);
                            }}
                            className="tactile-btn px-2 py-1 bg-white/10 hover:bg-white/20 text-neutral-200 text-[10px] font-bold rounded-[6px] transition-colors flex items-center gap-1 cursor-pointer font-sans"
                            title="Открыть параметры"
                          >
                            <SlidersHorizontal size={11} weight="bold" />
                            <span>Параметры</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSession(conn);
                            }}
                            className="tactile-btn px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-950 text-[10px] font-bold rounded-[6px] transition-all flex items-center gap-1 cursor-pointer shadow-2xs font-sans"
                            title="Открыть сессию"
                          >
                            <span>Войти</span>
                            <ArrowRight size={10} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="motion-stagger-3 h-44 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center text-neutral-400 mb-2 border border-white/10">
                      <MagnifyingGlass size={20} weight="light" />
                    </div>
                    <p className="text-xs font-bold text-white font-heading">
                      Подключений не найдено
                    </p>
                    <p className="text-[11px] text-neutral-400 font-sans mt-0.5 max-w-[200px]">
                      По запросу «{searchQuery}» совпадений нет
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="tactile-btn mt-3 text-xs font-bold text-violet-400 hover:text-violet-300 underline font-sans cursor-pointer"
                      >
                        Сбросить фильтр
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Bottom Footer Action */}
            <div className="motion-stagger-5 pt-3.5 mt-auto border-t border-white/10 shrink-0">
              {onSwitchMode && (
                <button
                  type="button"
                  onClick={() => onSwitchMode('create')}
                  className="tactile-btn w-full py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-bold rounded-[8px] flex items-center justify-center gap-1.5 transition-colors font-sans cursor-pointer border border-violet-500/30"
                >
                  <Plus size={14} weight="bold" />
                  <span>Настроить новое подключение</span>
                </button>
              )}
            </div>
          </div>
      ) : mode === 'create' ? (
        /* ========================================================= */
        /* MODE: CREATE / CONFIGURE NEW CONNECTION                   */
        /* ========================================================= */
        <div key="create" className="motion-mode-switch flex-1 flex flex-col h-full min-h-0">
          {/* Fixed Header */}
          <div className="motion-stagger-1 flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
            <div>
              <h2 className="text-base font-black text-white tracking-tight font-heading">
                Новое подключение OPC UA
              </h2>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                {createMethod === 'manual'
                  ? 'Ручной ввод сетевых параметров ПЛК'
                  : 'Автообнаружение серверов в сети (LDS / mDNS)'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="tactile-btn w-7 h-7 rounded-[7px] bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Закрыть панель"
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          {/* Segmented Control Switcher: Вручную vs Автопоиск */}
          <div className="flex bg-white/5 p-1 rounded-[10px] border border-white/10 shrink-0 mb-3 gap-1">
            <button
              type="button"
              onClick={() => setCreateMethod('manual')}
              className={`tactile-btn flex-1 py-1.5 rounded-[7px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                createMethod === 'manual'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PencilSimple size={13} weight="bold" />
              <span>Вручную</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateMethod('auto')}
              className={`tactile-btn flex-1 py-1.5 rounded-[7px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                createMethod === 'auto'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Broadcast size={14} weight="bold" />
              <span>Автопоиск устройств</span>
            </button>
          </div>

          {createMethod === 'manual' ? (
            /* ======================================================= */
            /* TAB 1: MANUAL CONFIGURATION FORM                       */
            /* ======================================================= */
            <>
              {/* Scrollable Form Body */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {prefilledFromDiscovered && (
                  <div className="flex items-center justify-between text-[11px] bg-violet-500/15 border border-violet-500/30 text-violet-300 px-3 py-2 rounded-[8px]">
                    <span className="truncate">✨ Заполнено из автопоиска: {prefilledFromDiscovered}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefilledFromDiscovered(null);
                        setName('');
                        setEndpoint('opc.tcp://10.0.1.');
                      }}
                      className="text-violet-300 hover:text-white underline ml-2 shrink-0 cursor-pointer font-bold"
                    >
                      Сброс
                    </button>
                  </div>
                )}

                <form id="create-conn-form" onSubmit={handleCreateSubmit} className="motion-stagger-2 space-y-3 text-xs font-sans pb-1">
                  {/* Equipment / Node Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-sans">
                      Имя оборудования / Узла
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="например: Котельная №5 или Чиллер Emerson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/12 rounded-[8px] px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-sans"
                    />
                  </div>

                  {/* Endpoint URI with test ping */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-sans">
                      Сетевой адрес Endpoint URI
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Plugs
                          size={15}
                          weight="light"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                          type="text"
                          required
                          placeholder="opc.tcp://10.0.1.50:4840"
                          value={endpoint}
                          onChange={(e) => setEndpoint(e.target.value)}
                          className="w-full bg-white/5 border border-white/12 rounded-[8px] pl-8 pr-2 py-2 text-xs font-sans text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTestCreatePing}
                        disabled={isTesting}
                        className="tactile-btn bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3 py-2 rounded-[8px] text-xs font-semibold font-sans transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Lightning size={13} weight="bold" className="text-amber-400" />
                        <span>{isTesting ? 'Пинг...' : 'Тест'}</span>
                      </button>
                    </div>

                    {testResult && (
                      <div className="mt-2 text-xs text-emerald-300 bg-emerald-500/15 p-2 rounded-[6px] border border-emerald-500/30 flex items-center gap-1.5 font-sans animate-in fade-in duration-150">
                        <CheckCircle size={14} weight="bold" className="text-emerald-400" />
                        <span className="text-[11px] font-medium">{testResult}</span>
                      </div>
                    )}
                  </div>

                  {/* Controller Model */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-sans">
                      Модель ПЛК / Источник данных
                    </label>
                    <CustomSelect
                      value={controllerType}
                      onChange={setControllerType}
                      variant="dark"
                      options={[
                        { value: 'Siemens S7-1200 / S7-1500 (TIA Portal)', label: 'Siemens S7-1200 / S7-1500 (TIA Portal)' },
                        { value: 'Schneider Modicon M241 / M262', label: 'Schneider Modicon M241 / M262' },
                        { value: 'Овен ПЛК210 / ПЛК200 (Codesys)', label: 'Овен ПЛК210 / ПЛК200 (Codesys)' },
                        { value: 'Carel pCO / Холодильная автоматика', label: 'Carel pCO / Холодильная автоматика' },
                        { value: 'Другой OPC UA сервер', label: 'Другой OPC UA сервер (FreeOpcUa / Kepware)' },
                      ]}
                    />
                  </div>

                  {/* Security Policy & Mode */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-sans">
                        Политика
                      </label>
                      <CustomSelect
                        value={securityPolicy}
                        onChange={setSecurityPolicy}
                        variant="dark"
                        options={[
                          { value: 'Basic256Sha256', label: 'Basic256Sha256' },
                          { value: 'Aes128_Sha256_RsaOaep', label: 'Aes128_Sha256' },
                          { value: 'None', label: 'None (Без шифр.)' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-sans">
                        Режим
                      </label>
                      <CustomSelect
                        value={messageSecurityMode}
                        onChange={(val) => setMessageSecurityMode(val as OpcConnection['messageSecurityMode'])}
                        variant="dark"
                        options={[
                          { value: 'SignAndEncrypt', label: 'SignAndEncrypt' },
                          { value: 'Sign', label: 'Sign' },
                          { value: 'None', label: 'None' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Estimated Tags Count */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-sans">
                      Количество опрашиваемых тегов
                    </label>
                    <CustomNumberInput
                      min={1}
                      max={10000}
                      step={10}
                      value={tagsCount}
                      onChange={(val) => setTagsCount(Number(val) || 0)}
                      variant="dark"
                      placeholder="100"
                    />
                  </div>
                </form>
              </div>

              {/* Pinned Bottom Footer Action Buttons for Manual Form */}
              <div className="motion-stagger-3 pt-3.5 mt-auto border-t border-white/10 shrink-0 flex flex-col gap-2">
                <button
                  form="create-conn-form"
                  type="submit"
                  className="tactile-btn w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all shadow-md font-sans cursor-pointer hover:scale-101 active:scale-98"
                >
                  <span>Сохранить подключение</span>
                  <ArrowRight size={14} weight="bold" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="tactile-btn w-full py-2 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-bold rounded-[8px] flex items-center justify-center transition-colors font-sans cursor-pointer"
                >
                  <span>Отмена</span>
                </button>
              </div>
            </>
          ) : (
            /* ======================================================= */
            /* TAB 2: AUTOMATIC DISCOVERY (LDS / SUBNET SCANNER)       */
            /* ======================================================= */
            <>
              {/* Scan Bar & Status Toolbar (shrink-0) */}
              <div className="motion-stagger-2 shrink-0 mb-3 space-y-2">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-[8px] p-1.5">
                  <div className="relative flex-1 flex items-center gap-1.5 min-w-0 pl-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        value={scanSubnet}
                        onChange={setScanSubnet}
                        variant="dark"
                        options={[
                          { value: '10.0.4.0/24 (Ethernet)', label: '10.0.4.0/24 (Ethernet)' },
                          { value: 'LDS-сервер :4840', label: 'LDS :4840 (Local Discovery)' },
                          { value: 'mDNS / Zeroconf', label: 'mDNS / Zeroconf (Multicast)' },
                          { value: '10.0.0.0/16', label: '10.0.0.0/16 (Заводская сеть)' },
                        ]}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleScanSubnet}
                    disabled={isScanning}
                    className="tactile-btn px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-[6px] text-[11px] font-bold font-sans transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <ArrowsClockwise size={12} weight="bold" className={isScanning ? 'animate-spin text-violet-400' : ''} />
                    <span>{isScanning ? 'Поиск...' : 'Поиск'}</span>
                  </button>
                </div>

                {/* Section title & count */}
                <div className="flex items-center justify-between px-1 text-[11px] font-sans">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Обнаружено в сети
                  </span>
                  <span className="text-[11px] font-heading text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {filteredDiscovered.length} узла
                  </span>
                </div>
              </div>

              {/* Scrollable Discovered Devices List */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {isScanning ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 mb-3 animate-pulse">
                      <Broadcast size={22} weight="bold" className="animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-white font-heading">
                      Поиск устройств...
                    </p>
                    <p className="text-[11px] text-neutral-400 font-sans mt-0.5 max-w-[220px]">
                      Опрос технологической сети {scanSubnet}
                    </p>
                  </div>
                ) : filteredDiscovered.length > 0 ? (
                  filteredDiscovered.map((dev) => {
                    const isSelected = selectedDevice?.id === dev.id;
                    return (
                      <div
                        key={dev.id}
                        onClick={() => setSelectedDiscoveredId(dev.id)}
                        onDoubleClick={() => handleConnectDiscovered(dev)}
                        className={`rounded-[10px] px-3 py-2.5 border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                          isSelected
                            ? 'bg-violet-600/15 border-violet-500 shadow-[0_0_14px_rgba(124,58,237,0.22)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Left: Radio + Name + IP & tags */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Radio indicator */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-violet-500 bg-violet-600'
                                : 'border-white/30 group-hover:border-white/50'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-bold tracking-tight font-heading truncate transition-colors ${
                                isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                              }`}
                            >
                              {dev.name}
                            </h4>
                            <div className="text-[11px] font-heading text-neutral-400 truncate mt-0.5">
                              {dev.endpoint.replace('opc.tcp://', '')} • {dev.tagsCount} тегов
                            </div>
                          </div>
                        </div>

                        {/* Right: Latency badge */}
                        <div className="shrink-0 flex items-center">
                          <span className="text-[10px] font-heading font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[5px]">
                            {dev.pingMs} мс
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center text-neutral-400 mb-2 border border-white/10">
                      <Broadcast size={20} weight="light" />
                    </div>
                    <p className="text-xs font-bold text-white font-heading">
                      Устройства не обнаружены
                    </p>
                    <p className="text-[11px] text-neutral-400 font-sans mt-0.5 max-w-[200px]">
                      Попробуйте выбрать другую подсеть или опрос по протоколу mDNS
                    </p>
                  </div>
                )}
              </div>

              {/* Pinned Bottom Footer Action Buttons for Auto-Discovery */}
              <div className="motion-stagger-3 pt-3.5 mt-auto border-t border-white/10 shrink-0 flex flex-col gap-2">
                {selectedDevice ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConnectDiscovered(selectedDevice)}
                      className="tactile-btn w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-[8px] flex items-center justify-center gap-2 transition-all shadow-md font-sans cursor-pointer hover:scale-101 active:scale-98"
                    >
                      <Lightning size={14} weight="bold" className="text-amber-400" />
                      <span>Подключить выбранный узел</span>
                      <ArrowRight size={14} weight="bold" className="shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePreFillFromDiscovered(selectedDevice)}
                      className="tactile-btn w-full py-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold rounded-[8px] flex items-center justify-center gap-1.5 transition-colors font-sans cursor-pointer border border-white/10"
                    >
                      <SlidersHorizontal size={13} weight="bold" />
                      <span>Настроить параметры вручную</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 bg-white/10 text-neutral-500 text-xs font-bold rounded-[8px] flex items-center justify-center transition-colors font-sans cursor-not-allowed border border-white/5"
                  >
                    <span>Выберите устройство из списка</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="tactile-btn w-full py-1.5 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-bold rounded-[8px] flex items-center justify-center transition-colors font-sans cursor-pointer"
                >
                  <span>Отмена</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* MODE: VIEW CONNECTION PARAMETERS                          */
        /* ========================================================= */
        <div key="view" className="motion-mode-switch flex-1 flex flex-col h-full min-h-0">
          {/* Fixed Header */}
          <div className="motion-stagger-1 flex items-center justify-between pb-3.5 border-b border-white/10 mb-3 shrink-0">
            <div>
              {cameFromSearch && onSwitchMode && (
                <button
                  type="button"
                  onClick={() => onSwitchMode('search')}
                  className="tactile-btn inline-flex items-center gap-1 text-[11px] font-bold text-violet-400 hover:text-violet-300 mb-1 transition-colors cursor-pointer font-sans"
                >
                  <ArrowLeft size={12} weight="bold" />
                  <span>Назад к поиску</span>
                </button>
              )}
              <h2 className="text-base font-black text-white tracking-tight font-heading">
                Параметры узла
              </h2>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Спецификация активного подключения
              </p>
            </div>

            <button
              onClick={onClose}
              className="tactile-btn w-7 h-7 rounded-[7px] bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Скрыть панель параметров"
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          {connection && (
            <>
              {/* Scrollable Body: Overview + Properties + Diagnostics */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 custom-scrollbar pb-1">
                {/* Selected Connection Overview Card */}
                <div className="motion-stagger-2 bg-white/5 rounded-[12px] p-3.5 border border-white/10 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-sans">
                      Оборудование
                    </span>
                    <span
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold font-sans ${
                        connection.status === 'online'
                          ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
                          : connection.status === 'error'
                          ? 'text-rose-300 bg-rose-500/15 border border-rose-500/30'
                          : 'text-neutral-300 bg-white/10 border border-white/10'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          connection.status === 'online'
                            ? 'bg-emerald-400 animate-pulse'
                            : connection.status === 'error'
                            ? 'bg-rose-400'
                            : 'bg-neutral-400'
                        }`}
                      />
                      {connection.status === 'online'
                        ? 'В сети'
                        : connection.status === 'error'
                        ? 'Ошибка'
                        : 'Вне сети'}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white tracking-tight font-heading truncate" title={connection.name}>
                    {connection.name}
                  </h3>

                  <div className="flex items-center justify-between mt-2.5 bg-black/40 border border-white/10 rounded-[8px] px-3 py-1.5">
                    <span className="text-xs font-sans text-neutral-300 truncate mr-2">
                      {connection.endpoint}
                    </span>
                    <button
                      onClick={handleCopyEndpoint}
                      className="tactile-btn text-neutral-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                      title="Скопировать URI"
                    >
                      {copied ? (
                        <Check size={14} weight="bold" className="text-violet-400" />
                      ) : (
                        <Copy size={15} weight="light" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Properties Rows */}
                <div className="motion-stagger-3 space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Cpu size={15} weight="light" className="text-violet-400" />
                      <span>Контроллер:</span>
                    </span>
                    <span className="font-bold text-white text-right truncate max-w-[150px]" title={connection.controllerType}>
                      {connection.controllerType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <ShieldCheck size={15} weight="light" className="text-violet-400" />
                      <span>Политика:</span>
                    </span>
                    <span className="font-sans text-neutral-300 text-[11px] font-medium truncate max-w-[150px]">
                      {connection.securityPolicy}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Plugs size={15} weight="light" className="text-amber-400" />
                      <span>Режим:</span>
                    </span>
                    <span className="font-bold text-white">
                      {connection.messageSecurityMode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Сетевой пинг:</span>
                    <span className="font-sans text-violet-400 font-bold">
                      {connection.pingMs} мс
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Количество тегов:</span>
                    <span className="font-black text-white font-heading text-sm">
                      {connection.tagsCount}
                    </span>
                  </div>
                </div>

                {/* Live Diagnostics Card */}
                <div className="motion-stagger-4 bg-white/5 rounded-[12px] p-3.5 border border-white/10 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white font-heading">
                      Диагностика связи
                    </span>
                    <button
                      onClick={handlePingTest}
                      disabled={pinging}
                      className="tactile-btn text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowsClockwise
                        size={14}
                        weight="bold"
                        className={pinging ? 'animate-spin' : ''}
                      />
                      <span>{pinging ? 'Проверка...' : 'Тест связи'}</span>
                    </button>
                  </div>

                  {pingResult ? (
                    <div className="text-[11px] font-sans text-violet-300 bg-violet-500/15 p-2.5 rounded-[7px] border border-violet-500/30">
                      {pingResult}
                    </div>
                  ) : (
                    <div className="text-[11px] text-neutral-400 font-sans">
                      Прямой сетевой запрос к TCP порту контроллера
                    </div>
                  )}
                </div>
              </div>

              {/* Pinned Bottom Footer Action Buttons */}
              <div className="motion-stagger-5 shrink-0 pt-3.5 mt-auto border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => onOpenSession(connection)}
                  className="tactile-btn w-full py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-black rounded-[8px] flex items-center justify-center gap-2 transition-all shadow-md font-sans cursor-pointer hover:scale-101 active:scale-99"
                >
                  <span>Открыть сессию и адресное пространство</span>
                  <ArrowSquareOut size={15} weight="bold" />
                </button>

                <button
                  onClick={() => onDeleteConnection(connection.id)}
                  className="tactile-btn w-full py-2 bg-transparent hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-[8px] flex items-center justify-center gap-1.5 transition-colors font-sans cursor-pointer"
                >
                  <Trash size={15} weight="light" />
                  <span>Удалить это подключение</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
      </div>
    </aside>
  );
};
