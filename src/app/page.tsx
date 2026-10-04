"use client";

import { useState, useRef } from 'react';
import { IconContext, ArrowLeft } from '@phosphor-icons/react';
import { Sidebar } from '@/components/Sidebar';
import { CategoryCard } from '@/components/CategoryCard';
import { ConnectionCard } from '@/components/ConnectionCard';
import { AddConnectionCard } from '@/components/AddConnectionCard';
import { FindConnectionCard } from '@/components/FindConnectionCard';
import { IndustrialCopilotBanner } from '@/components/IndustrialCopilotBanner';
import { RightDrawer } from '@/components/RightDrawer';
import { AddressSpaceView } from '@/components/views/AddressSpaceView';
import { MonitorTrendsView } from '@/components/views/MonitorTrendsView';
import { SecurityView } from '@/components/views/SecurityView';
import { AlarmsView } from '@/components/views/AlarmsView';
import { SettingsView } from '@/components/views/SettingsView';
import { HARDWARE_CATEGORIES, INITIAL_CONNECTIONS, DISCOVERED_DEVICES } from '@/data/mockData';
import type { OpcConnection, HardwareCategoryId } from '@/types/opc';

export default function Home() {
  const [activeTab, setActiveTab] = useState('connections');
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategoryId | null>(null);
  const [activeSessionConn, setActiveSessionConn] = useState<OpcConnection | null>(null);
  const [connections, setConnections] = useState<OpcConnection[]>(INITIAL_CONNECTIONS);
  const [selectedConnId, setSelectedConnId] = useState<string>(INITIAL_CONNECTIONS[0].id);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(true);
  const [drawerMode, setDrawerMode] = useState<'view' | 'create' | 'search'>('view');
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({
    message: 'Синхронизация узлов OPC UA...',
    isVisible: true,
  });
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const NAV_ORDER = ['connections', 'monitor', 'security', 'alarms', 'settings'];
  const [tabDirection, setTabDirection] = useState<'down' | 'up'>('down');

  const handleTabChange = (nextTab: string) => {
    const currentIndex = NAV_ORDER.indexOf(activeTab);
    const nextIndex = NAV_ORDER.indexOf(nextTab);
    setTabDirection(nextIndex >= currentIndex ? 'down' : 'up');
    setActiveTab(nextTab);
  };

  const handleNavigateFromMonitor = (conn: OpcConnection) => {
    setActiveTab('connections');
    setSelectedCategory(conn.categoryId);
    setSelectedConnId(conn.id);
    setActiveSessionConn(conn);
    showToast(`Переход в сессию: ${conn.name}`);
  };

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message: msg, isVisible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3200);
  };

  const currentCategory = HARDWARE_CATEGORIES.find((c) => c.id === selectedCategory) || null;

  const categoryConnections = selectedCategory
    ? connections.filter((c) => c.categoryId === selectedCategory)
    : connections;

  const selectedConnection =
    connections.find((c) => c.id === selectedConnId) || connections[0] || null;

  const handleAddConnection = (newConn: OpcConnection) => {
    const connWithCategory: OpcConnection = {
      ...newConn,
      categoryId: selectedCategory || 'plc',
    };
    setConnections((prev) => [connWithCategory, ...prev]);
    setSelectedConnId(connWithCategory.id);
    setDrawerMode('view');
    setIsRightDrawerOpen(true);
    showToast(`Подключение "${newConn.name}" сохранено!`);
  };

  const handleDeleteConnection = (id: string) => {
    const connToDelete = connections.find((c) => c.id === id);
    setConnections((prev) => prev.filter((c) => c.id !== id));
    if (selectedConnId === id) {
      const remaining = connections.filter((c) => c.id !== id);
      if (remaining.length > 0) setSelectedConnId(remaining[0].id);
    }
    if (activeSessionConn?.id === id) {
      setActiveSessionConn(null);
    }
    showToast(`Подключение "${connToDelete?.name || ''}" удалено.`);
  };

  const handleConnectSession = (conn: OpcConnection) => {
    setSelectedConnId(conn.id);
    setActiveSessionConn(conn);
    if (!selectedCategory) {
      setSelectedCategory(conn.categoryId);
    }
    setIsRightDrawerOpen(false);
    showToast(`Сессия открыта: ${conn.name}`);
  };

  const handleFindConnectionClick = () => {
    setDrawerMode('search');
    setIsRightDrawerOpen(true);
  };

  return (
    <IconContext.Provider
      value={{
        weight: 'light',
        size: 20,
        className: 'transition-colors duration-150',
      }}
    >
      {/* Root Container Locked to 100vh Viewport Height */}
      <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#07080b] p-3 sm:p-4 flex text-[#0f172a] font-sans selection:bg-[#0f172a] selection:text-white select-none">
        {/* Left Dark Expandable Sidebar with Notch */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
          totalConnectionsCount={connections.length}
        />

        {/* Main Workspace Wrapper with Graphite Pill Layered Behind White Canvas */}
        <div className="flex-1 min-w-0 flex relative">
          {/* Graphite Action/Loading Pill: Physically emerges FROM UNDER the white global canvas directly above the collapse icon */}
          <div
            onClick={() => setToast((prev) => ({ ...prev, isVisible: false }))}
            className={`absolute bottom-[74px] left-0 z-10 select-none cursor-pointer transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              toast.isVisible
                ? '-translate-x-[60px] opacity-100 pointer-events-auto'
                : 'translate-x-3 opacity-0 pointer-events-none'
            }`}
            title={toast.message || 'Синхронизация узлов OPC UA...'}
          >
            <div className="h-[34px] w-[76px] rounded-l-full bg-gradient-to-r from-[#1c202a] to-[#252a35] border border-white/[0.12] border-r-0 shadow-[-6px_6px_20px_rgba(0,0,0,0.45)] flex items-center pl-[12px] transition-all hover:brightness-115">
              {/* Pure White Circular Loading Indicator */}
              <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9.5"
                    stroke="rgba(255, 255, 255, 0.16)"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9.5"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeDasharray="59.69"
                    strokeDashoffset="18"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-spin origin-center"
                    style={{ animationDuration: '1.1s' }}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Main White Canvas (Layer 2: Foreground, z-20, physically overlaps right part of the pill) */}
          <div className="w-full h-full flex overflow-hidden bg-white rounded-[18px] sm:rounded-[20px] shadow-2xl relative z-20 transition-all duration-300 ease-in-out p-5 sm:p-6 gap-5">
            {/* TAB 1: Подключения (Connection Hub & Drill-Down) */}
            {activeTab === 'connections' && (
              <div
                key="connections"
                className={`flex-1 min-w-0 flex h-full gap-5 ${
                  tabDirection === 'down' ? 'animate-tab-down' : 'animate-tab-up'
                }`}
              >
              {/* LEVEL 3: Active Controller Session & Address Space Drill-Down */}
              {activeSessionConn ? (
                <div className="flex-1 min-w-0 flex h-full gap-5">
                  <main className="flex-1 min-w-0 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10">
                    <AddressSpaceView
                      currentConnection={activeSessionConn}
                      connections={connections}
                      categoryTitle={currentCategory?.title}
                      onBack={() => setActiveSessionConn(null)}
                      onDisconnect={() => {
                        setActiveSessionConn(null);
                        showToast(`Сессия с "${activeSessionConn.name}" завершена`);
                      }}
                      onOpenParameters={(conn) => {
                        setSelectedConnId(conn.id);
                        setDrawerMode('view');
                        setIsRightDrawerOpen(true);
                      }}
                      onShowToast={showToast}
                    />
                  </main>

                  {/* Collapsible Right Parameter Drawer (accessible in Level 3 when opened) */}
                  <RightDrawer
                    isOpen={isRightDrawerOpen}
                    mode={drawerMode}
                    onClose={() => setIsRightDrawerOpen(false)}
                    connection={activeSessionConn}
                    connections={categoryConnections}
                    allConnections={connections}
                    currentCategoryTitle={currentCategory?.title}
                    onSelectConnection={(conn) => {
                      setSelectedConnId(conn.id);
                      setDrawerMode('view');
                      setIsRightDrawerOpen(true);
                    }}
                    onDeleteConnection={handleDeleteConnection}
                    onOpenSession={handleConnectSession}
                    onAddConnection={handleAddConnection}
                    onSwitchMode={(mode) => {
                      setDrawerMode(mode);
                      setIsRightDrawerOpen(true);
                    }}
                  />
                </div>
              ) : (
                /* LEVEL 1 & LEVEL 2: Classes Grid or Category Detail Grid */
                <>
                  <main className="flex-1 min-w-0 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10">
                    {/* Central Workspace Body */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3.5">
                      {/* LEVEL 1: Hardware Classes View (Root Screen) */}
                      {!selectedCategory ? (
                        <>
                          {/* Title Section: Root Hardware Classes */}
                          <div className="flex items-center justify-between shrink-0">
                            <div>
                              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-heading">
                                Создать новое подключение
                              </h1>
                              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                                Выберите категорию устройств для перехода к активным подключениям и диагностике
                              </p>
                            </div>
                          </div>

                          {/* Grid of Hardware Categories (4 Large Glassmorphism Cards) */}
                          <div className="flex-1 min-w-0 overflow-y-auto p-5 -m-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 auto-rows-fr">
                              {HARDWARE_CATEGORIES.map((cat) => (
                                <CategoryCard
                                  key={cat.id}
                                  category={cat}
                                  onClick={() => setSelectedCategory(cat.id)}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Bottom Dark Industrial AI Copilot Dialog (Replaces static Quick Start) */}
                          <IndustrialCopilotBanner
                            onNavigateTab={handleTabChange}
                            onSelectCategory={(cat) => setSelectedCategory(cat)}
                            onShowToast={showToast}
                          />
                        </>
                      ) : (
                        /* LEVEL 2: Drilled-down Category View */
                        <>
                          {/* Title Section: Category Detail with Back Button */}
                          <div className="flex items-center justify-between shrink-0">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedCategory(null)}
                                  className="tactile-btn w-7 h-7 rounded-[7px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                  title="Вернуться к списку классов"
                                >
                                  <ArrowLeft size={14} weight="bold" />
                                </button>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-heading">
                                  {currentCategory?.title}
                                </h1>
                              </div>
                              <p className="text-xs text-neutral-400 font-sans mt-1">
                                {currentCategory?.description}
                              </p>
                            </div>
                          </div>

                          {/* Grid of Connections: 1. Add Card -> 2. Find Card -> 3. Alphabetical Connections */}
                          <div className="flex-1 min-w-0 overflow-y-auto p-5 -m-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                              {/* 1. Первая плашка: Создать новое подключение */}
                              <AddConnectionCard
                                onClick={() => {
                                  setDrawerMode('create');
                                  setIsRightDrawerOpen(true);
                                }}
                              />

                              {/* 2. Вторая плашка: Найти существующее подключение */}
                              <FindConnectionCard onClick={handleFindConnectionClick} />

                              {/* 3. Плашки подключений в алфавитном порядке */}
                              {[...categoryConnections]
                                .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                                .map((conn) => (
                                  <ConnectionCard
                                    key={conn.id}
                                    connection={conn}
                                    isSelected={selectedConnId === conn.id && isRightDrawerOpen && drawerMode === 'view'}
                                    onSelect={() => {
                                      setSelectedConnId(conn.id);
                                      setDrawerMode('view');
                                      setIsRightDrawerOpen(true);
                                    }}
                                    onOpenParameters={(c) => {
                                      setSelectedConnId(c.id);
                                      setDrawerMode('view');
                                      setIsRightDrawerOpen(true);
                                    }}
                                    onDelete={handleDeleteConnection}
                                    onConnect={handleConnectSession}
                                  />
                                ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </main>

                  {/* Collapsible Right Parameter Drawer (only when inside a category) */}
                  <RightDrawer
                    isOpen={isRightDrawerOpen && Boolean(selectedCategory)}
                    mode={drawerMode}
                    onClose={() => setIsRightDrawerOpen(false)}
                    connection={selectedConnection}
                    connections={categoryConnections}
                    allConnections={connections}
                    currentCategoryTitle={currentCategory?.title}
                    onSelectConnection={(conn) => {
                      setSelectedConnId(conn.id);
                      setDrawerMode('view');
                      setIsRightDrawerOpen(true);
                    }}
                    onDeleteConnection={handleDeleteConnection}
                    onOpenSession={handleConnectSession}
                    onAddConnection={handleAddConnection}
                    onSwitchMode={(mode) => {
                      setDrawerMode(mode);
                      setIsRightDrawerOpen(true);
                    }}
                  />
                </>
              )}
            </div>
          )}

          {/* TAB 2: Сводный монитор и тренды */}
          {activeTab === 'monitor' && (
            <div
              key="monitor"
              className={`flex-1 min-w-0 flex flex-col h-full ${
                tabDirection === 'down' ? 'animate-tab-down' : 'animate-tab-up'
              }`}
            >
              <MonitorTrendsView
                connections={connections}
                onNavigateToConnection={handleNavigateFromMonitor}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* TAB 3: Сертификаты и защита */}
          {activeTab === 'security' && (
            <div
              key="security"
              className={`flex-1 min-w-0 flex flex-col h-full ${
                tabDirection === 'down' ? 'animate-tab-down' : 'animate-tab-up'
              }`}
            >
              <SecurityView
                onShowToast={showToast}
              />
            </div>
          )}

          {/* TAB 4: Аварии и события (IEC 62541-9 A&C) */}
          {activeTab === 'alarms' && (
            <div
              key="alarms"
              className={`flex-1 min-w-0 flex flex-col h-full ${
                tabDirection === 'down' ? 'animate-tab-down' : 'animate-tab-up'
              }`}
            >
              <AlarmsView
                onShowToast={showToast}
                onNavigateToTab={handleTabChange}
              />
            </div>
          )}

          {/* TAB 5: Настройки системы */}
          {activeTab === 'settings' && (
            <div
              key="settings"
              className={`flex-1 min-w-0 flex flex-col h-full ${
                tabDirection === 'down' ? 'animate-tab-down' : 'animate-tab-up'
              }`}
            >
              <SettingsView
                onShowToast={showToast}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </IconContext.Provider>
);
}
