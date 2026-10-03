"use client";

import {
  SquaresFour,
  ChartLineUp,
  Certificate,
  Bell,
  GearSix,
  SidebarSimple,
} from '@phosphor-icons/react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  totalConnectionsCount?: number;
  activeAlarmsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isExpanded,
  onToggleExpand,
  totalConnectionsCount = 11,
  activeAlarmsCount = 3,
}) => {
  const navItems = [
    { id: 'connections', label: 'Подключения', badge: String(totalConnectionsCount), icon: SquaresFour },
    { id: 'monitor', label: 'Монитор и тренды', badge: 'Live', icon: ChartLineUp },
    { id: 'security', label: 'Сертификаты и защита', icon: Certificate },
    { id: 'alarms', label: 'Аварии и события', badge: activeAlarmsCount > 0 ? String(activeAlarmsCount) : undefined, icon: Bell },
    { id: 'settings', label: 'Настройки системы', icon: GearSix },
  ];

  return (
    <aside
      className={`bg-[#07080b] flex flex-col justify-between py-6 shrink-0 select-none relative transition-all duration-300 ease-in-out pr-0 ${
        isExpanded ? 'w-64 sm:w-72' : 'w-18 sm:w-20 items-center'
      }`}
    >
      {/* Top Header & Branding */}
      <div className="flex flex-col gap-8 w-full">
        {/* Brand Logo and Title (No jumping toggle button here) */}
        <div className={`flex items-center ${isExpanded ? 'px-4' : 'justify-center'}`}>
          <div
            onClick={onToggleExpand}
            className="flex items-center gap-3 cursor-pointer group"
            title={isExpanded ? 'Свернуть меню' : 'Развернуть меню'}
          >
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-violet-600 to-violet-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform shrink-0">
              <span className="font-heading font-black text-xs tracking-tight text-white select-none">
                РТ
              </span>
            </div>

            {isExpanded && (
              <span className="font-heading font-black text-white text-base tracking-tight leading-tight truncate animate-in fade-in duration-200">
                OCF Studio
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items with Sliding Inverted Fillet Notch Indicator */}
        <div className="relative w-full">
          {/* Sliding Architectural Inverted Fillet Notch Indicator (Seamless with global white canvas, no shadows) */}
          <div
            className="notch-tab-active absolute top-0 right-0 h-12 pointer-events-none transition-transform duration-320 ease-[cubic-bezier(0.16,1,0.3,1)] z-30"
            style={{
              width: '100%',
              transform: `translateY(${Math.max(0, navItems.findIndex((item) => item.id === activeTab)) * 56}px)`,
            }}
          >
            {/* Top Inverted Fillet: Mathematically exact concave arc, perfectly tangent to vertical canvas */}
            <svg
              className="absolute -top-[16px] right-0 w-[16px] h-[16px] pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M16,0 L16,16 L0,16 A16,16 0 0,0 16,0 Z" fill="#ffffff" />
            </svg>

            {/* Bottom Inverted Fillet: Mathematically exact concave arc, perfectly tangent to vertical canvas */}
            <svg
              className="absolute -bottom-[16px] right-0 w-[16px] h-[16px] pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M16,16 L16,0 L0,0 A16,16 0 0,1 16,16 Z" fill="#ffffff" />
            </svg>

            {/* Micro-overlap flap extending 4px into the white canvas to prevent subpixel seams */}
            <div className="absolute -top-[16px] -bottom-[16px] -right-[4px] w-[4px] bg-white pointer-events-none" />
          </div>

          {/* Navigation Items (Buttons) Layered Above Indicator */}
          <nav className="relative z-40 flex flex-col w-full gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="w-full">
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`h-12 w-full flex items-center transition-all duration-200 tactile-btn cursor-pointer select-none ${
                      isExpanded
                        ? 'pl-5 pr-4 justify-between'
                        : 'justify-center pl-1'
                    } ${
                      isActive ? '' : 'hover:bg-white/[0.04] text-neutral-400 hover:text-white'
                    }`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="relative">
                        <Icon
                          size={20}
                          weight={isActive ? 'bold' : 'light'}
                          className={`shrink-0 transition-all duration-200 ${
                            isActive
                              ? 'text-[#07080b]'
                              : 'text-neutral-400 group-hover:text-white opacity-60 hover:opacity-100'
                          }`}
                        />
                        {!isExpanded && item.id === 'alarms' && !isActive && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#07080b] animate-pulse" />
                        )}
                      </div>
                      {isExpanded && (
                        <span
                          className={`tracking-tight truncate transition-colors duration-200 ${
                            isActive
                              ? 'font-heading font-extrabold text-sm text-[#07080b]'
                              : 'font-sans font-medium text-xs text-neutral-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isExpanded && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] font-sans shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'bg-[#07080b] text-white scale-100 shadow-xs'
                            : item.id === 'alarms'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/10 text-neutral-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Panel Toggle Button (Consistent position) */}
      <div className={`w-full relative z-30 ${isExpanded ? 'px-3' : 'px-2 flex justify-center'}`}>
        <button
          onClick={onToggleExpand}
          className={`h-10 rounded-[8px] flex items-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all group ${
            isExpanded ? 'px-3 gap-3 w-full' : 'w-10 justify-center'
          }`}
          title={isExpanded ? 'Свернуть панель' : 'Развернуть панель'}
        >
          <SidebarSimple
            size={18}
            weight="light"
            className="group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100 shrink-0"
          />
          {isExpanded && (
            <span className="font-sans font-medium text-xs text-neutral-400 group-hover:text-white tracking-tight truncate animate-in fade-in duration-150">
              Свернуть панель
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
