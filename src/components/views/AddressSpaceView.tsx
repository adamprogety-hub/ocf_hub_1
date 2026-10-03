"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  CaretRight,
  CaretDown,
  Folder,
  FolderOpen,
  Tag,
  ArrowsClockwise,
  MagnifyingGlass,
  CheckCircle,
  PencilSimple,
  Pulse,
  Eye,
  ArrowLeft,
  SlidersHorizontal,
  Power,
  Copy,
  ShieldCheck,
  Cpu,
} from '@phosphor-icons/react';
import type { OpcConnection } from '@/types/opc';
import {
  TreeNode,
  OpcVariable,
  getOrCreateAddressSpace,
} from '@/data/opcDeviceTrees';

interface AddressSpaceViewProps {
  currentConnection?: OpcConnection | null;
  connections: OpcConnection[];
  categoryTitle?: string;
  onBack: () => void;
  onDisconnect?: () => void;
  onOpenParameters?: (conn: OpcConnection) => void;
  onShowToast: (msg: string) => void;
}

export const AddressSpaceView: React.FC<AddressSpaceViewProps> = ({
  currentConnection,
  connections,
  categoryTitle,
  onBack,
  onDisconnect,
  onOpenParameters,
  onShowToast,
}) => {
  // Active connection: use currentConnection or fallback to first connection
  const activeConn = currentConnection || connections[0];

  // Retrieve device address space configuration
  const deviceSpace = useMemo(() => {
    return getOrCreateAddressSpace(activeConn.id, activeConn.name);
  }, [activeConn.id, activeConn.name]);

  // Initial state setup based on loaded device space
  const initialNodeKeys = useMemo(() => Object.keys(deviceSpace.variablesByNode), [deviceSpace]);
  const defaultSelectedNodeId = initialNodeKeys[0] || 'root';

  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root', 'objects', initialNodeKeys[0]?.split('-')[0] || '']);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(defaultSelectedNodeId);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Working copy of variables for the currently active node
  const [variablesState, setVariablesState] = useState<Record<string, OpcVariable[]>>(deviceSpace.variablesByNode);

  // Sync state when active connection changes
  useEffect(() => {
    const space = getOrCreateAddressSpace(activeConn.id, activeConn.name);
    const keys = Object.keys(space.variablesByNode);
    setVariablesState(space.variablesByNode);
    const firstKey = keys[0] || 'root';
    setSelectedNodeId(firstKey);
    setExpandedNodes(['root', 'objects', firstKey.split('-')[0] || '']);
  }, [activeConn.id, activeConn.name]);

  const currentVariables = variablesState[selectedNodeId] || [];
  const [selectedVarId, setSelectedVarId] = useState<string>(currentVariables[0]?.id || '');

  // Keep selected variable synchronized
  useEffect(() => {
    if (currentVariables.length > 0 && (!selectedVarId || !currentVariables.find((v) => v.id === selectedVarId))) {
      setSelectedVarId(currentVariables[0].id);
    }
  }, [currentVariables, selectedVarId]);

  const selectedVariable = currentVariables.find((v) => v.id === selectedVarId) || currentVariables[0];

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSubscription = (id: string) => {
    setVariablesState((prevState) => {
      const nodeVars = prevState[selectedNodeId] || [];
      const updatedVars = nodeVars.map((v) => {
        if (v.id === id) {
          const newState = !v.isMonitored;
          onShowToast(newState ? `Подписка на тег "${v.name.split(' ')[0]}" активна` : `Подписка снята`);
          return { ...v, isMonitored: newState };
        }
        return v;
      });
      return { ...prevState, [selectedNodeId]: updatedVars };
    });
  };

  const handleSaveValue = (id: string) => {
    setVariablesState((prevState) => {
      const nodeVars = prevState[selectedNodeId] || [];
      const updatedVars = nodeVars.map((v) => {
        if (v.id === id) {
          onShowToast(`Значение записано в ПЛК: ${editValue} ${v.unit || ''}`);
          return { ...v, value: editValue };
        }
        return v;
      });
      return { ...prevState, [selectedNodeId]: updatedVars };
    });
    setEditingVarId(null);
    setEditValue('');
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(activeConn.endpoint);
    onShowToast(`URI скопирован: ${activeConn.endpoint}`);
  };

  const filteredVariables = currentVariables.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nodeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recursive tree renderer
  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-3.5 ml-1 border-l border-neutral-200/70' : ''}`}>
        {nodes.map((node) => {
          const isExpanded = expandedNodes.includes(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = selectedNodeId === node.id;
          const isFolder = node.type === 'folder';

          return (
            <div key={node.id} className="select-none">
              <div
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(node.id);
                  } else {
                    setSelectedNodeId(node.id);
                  }
                }}
                className={`flex items-center gap-1.5 py-1 px-1.5 rounded-[6px] transition-all cursor-pointer text-xs font-sans ${
                  isSelected
                    ? 'bg-violet-600 text-white font-bold shadow-2xs'
                    : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-950 font-medium'
                }`}
                title={node.name}
              >
                {/* Expander Arrow */}
                {hasChildren ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(node.id);
                    }}
                    className="p-0.5 hover:text-violet-600 shrink-0"
                  >
                    {isExpanded ? <CaretDown size={11} weight="bold" /> : <CaretRight size={11} weight="bold" />}
                  </span>
                ) : (
                  <span className="w-3 shrink-0" />
                )}

                {/* Node Icon */}
                {isFolder ? (
                  isExpanded ? (
                    <FolderOpen size={14} weight="light" className={isSelected ? 'text-white' : 'text-violet-600 shrink-0'} />
                  ) : (
                    <Folder size={14} weight="light" className={isSelected ? 'text-white' : 'text-neutral-400 shrink-0'} />
                  )
                ) : (
                  <Tag size={13} weight="light" className={isSelected ? 'text-white' : 'text-orange-500 shrink-0'} />
                )}

                <span className="truncate leading-tight">{node.name}</span>
              </div>

              {hasChildren && isExpanded && renderTree(node.children!, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between h-full relative z-10 select-none animate-drill-in">
      {/* Level 3 Top Navigation Bar: Breadcrumbs + Session Status Ribbon */}
      <div className="flex flex-col gap-2.5 shrink-0 pb-3 border-b border-neutral-200/60">
        {/* Row 1: Breadcrumbs & Quick Back */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-sans">
            <button
              onClick={onBack}
              className="tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 font-bold transition-all cursor-pointer shadow-2xs"
              title="Вернуться к списку подключений"
            >
              <ArrowLeft size={13} weight="bold" />
              <span>К списку</span>
            </button>
            <span className="text-neutral-300">/</span>
            <button
              onClick={onBack}
              className="text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer font-medium"
            >
              {categoryTitle || 'Контроллеры ПЛК'}
            </button>
            <span className="text-neutral-300">/</span>
            <span className="font-extrabold text-[#0f172a] truncate max-w-xs font-heading">
              {activeConn.name}
            </span>
          </div>

          {/* Session Actions: Parameters & Disconnect */}
          <div className="flex items-center gap-2">
            {onOpenParameters && (
              <button
                onClick={() => onOpenParameters(activeConn)}
                className="tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-white border border-neutral-200/80 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs cursor-pointer"
                title="Свойства и сертификаты подключения"
              >
                <SlidersHorizontal size={13} weight="light" />
                <span>Параметры</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onDisconnect) {
                  onDisconnect();
                } else {
                  onBack();
                }
                onShowToast(`Сессия с "${activeConn.name}" завершена`);
              }}
              className="tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs cursor-pointer hover:bg-orange-600"
              title="Разорвать сессию OPC UA"
            >
              <Power size={13} weight="bold" />
              <span>Отключиться</span>
            </button>
          </div>
        </div>

        {/* Row 2: Live Industrial Telemetry Pill Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c0e14]/95 text-white rounded-[12px] px-3.5 py-2 border border-white/10 shadow-sm">
          {/* Left: Device Name & Live Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-heading font-black text-xs sm:text-sm tracking-tight text-white">
                {activeConn.name}
              </span>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-white/10 text-neutral-300 font-sans border border-white/10">
              {activeConn.controllerType || 'OPC UA Device'}
            </span>
          </div>

          {/* Right: Endpoint URI, Security Mode, Ping */}
          <div className="flex items-center gap-3 text-[11px] font-sans text-neutral-300">
            {/* Endpoint with Copy */}
            <div
              onClick={handleCopyEndpoint}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-[5px] cursor-pointer transition-colors border border-white/5"
              title="Нажмите, чтобы скопировать Endpoint URI"
            >
              <span className="text-violet-300 font-mono text-[10px]">{activeConn.endpoint}</span>
              <Copy size={11} weight="light" className="text-neutral-400" />
            </div>

            {/* Security Policy Badge */}
            <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
              <ShieldCheck size={13} weight="bold" />
              <span>{activeConn.securityPolicy || 'Basic256Sha256'}</span>
            </div>

            {/* Ping */}
            <div className="flex items-center gap-1 text-neutral-400 text-[10px]">
              <Pulse size={12} weight="light" className="text-orange-400" />
              <span>{activeConn.pingMs > 0 ? `${activeConn.pingMs} мс` : '< 10 мс'}</span>
            </div>

            {/* IEC Standard */}
            <span className="text-[10px] font-bold text-violet-400 hidden md:inline">
              IEC 62541
            </span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Industrial Explorer Area */}
      <div className="flex-1 min-w-0 flex gap-4 my-3 overflow-hidden">
        {/* Column 1: Object Tree Explorer */}
        <div className="w-64 sm:w-72 bg-white/70 backdrop-blur-md rounded-[14px] border border-neutral-200/60 p-3 flex flex-col justify-between shrink-0 shadow-2xs overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
                Дерево объектов ПЛК
              </span>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-[4px] font-sans">
                {Object.keys(deviceSpace.variablesByNode).length} узлов
              </span>
            </div>

            {/* Tree Navigation Container */}
            <div className="flex-1 overflow-y-auto pr-1">
              {renderTree(deviceSpace.tree)}
            </div>
          </div>

          {/* Sync Button */}
          <div className="pt-2 mt-2 border-t border-neutral-100 shrink-0">
            <button
              onClick={() => onShowToast('Дерево узлов и адресация синхронизированы')}
              className="w-full py-1.5 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-sans"
            >
              <ArrowsClockwise size={13} weight="bold" />
              <span>Перечитать дерево (Browse)</span>
            </button>
          </div>
        </div>

        {/* Column 2: Live Variable & Telemetry Table */}
        <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-md rounded-[14px] border border-neutral-200/60 p-4 flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Search Filter Header */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-100 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <MagnifyingGlass
                  size={14}
                  weight="light"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Фильтр переменных по имени или NodeId..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafd] border border-neutral-200/70 rounded-[8px] pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-violet-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-sans text-neutral-400">
                <span>
                  Переменных в узле: <strong className="text-neutral-800">{filteredVariables.length}</strong>
                </span>
              </div>
            </div>

            {/* Variables Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-neutral-200/60 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-2 pl-2">Переменная / NodeId</th>
                    <th className="pb-2">Тип</th>
                    <th className="pb-2">Значение</th>
                    <th className="pb-2">Качество</th>
                    <th className="pb-2">Опрос</th>
                    <th className="pb-2 text-right pr-2">Подписка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredVariables.map((v) => {
                    const isSelected = selectedVarId === v.id;
                    const isEditing = editingVarId === v.id;

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVarId(v.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-violet-50/70 font-medium' : 'hover:bg-neutral-50/70'
                        }`}
                      >
                        <td className="py-2.5 pl-2 max-w-[220px]">
                          <div className="font-bold text-[#0f172a] truncate">{v.name}</div>
                          <div className="text-[11px] text-neutral-400 truncate">{v.nodeId}</div>
                        </td>

                        <td className="py-2.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-neutral-100 text-neutral-700">
                            {v.dataType}
                          </span>
                        </td>

                        <td className="py-2.5">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveValue(v.id);
                                  if (e.key === 'Escape') setEditingVarId(null);
                                }}
                                className="w-20 bg-white border border-violet-500 rounded px-1.5 py-0.5 text-xs text-neutral-900 outline-none"
                              />
                              <button
                                onClick={() => handleSaveValue(v.id)}
                                className="text-[11px] bg-violet-600 text-white px-2 py-0.5 rounded font-bold hover:bg-violet-700"
                              >
                                ОК
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[#0f172a] font-heading text-sm">
                                {String(v.value)}
                              </span>
                              {v.unit && <span className="text-[11px] text-neutral-400">{v.unit}</span>}
                              {v.access === 'R/W' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingVarId(v.id);
                                    setEditValue(String(v.value));
                                  }}
                                  className="text-neutral-300 hover:text-violet-600 transition-colors cursor-pointer p-0.5"
                                  title="Записать значение в контроллер"
                                >
                                  <PencilSimple size={13} weight="light" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-2.5">
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {v.quality}
                          </span>
                        </td>

                        <td className="py-2.5 text-neutral-500 text-[11px]">
                          {v.samplingMs} мс
                        </td>

                        <td className="py-2.5 text-right pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubscription(v.id);
                            }}
                            className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                              v.isMonitored
                                ? 'bg-violet-600 text-white shadow-2xs hover:bg-violet-700'
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {v.isMonitored ? 'Подписан' : 'Следить'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 3: Variable Inspector & IEC 62541 Attributes */}
        <div className="w-72 sm:w-80 bg-white/80 backdrop-blur-md rounded-[14px] border border-neutral-200/60 p-4 flex flex-col justify-between shrink-0 shadow-2xs">
          {selectedVariable ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
                    Инспектор атрибутов
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-[4px] font-sans">
                    {selectedVariable.access}
                  </span>
                </div>

                <h3 className="text-sm font-black text-[#0f172a] font-heading tracking-tight leading-snug">
                  {selectedVariable.name}
                </h3>

                {/* Quick Metrics Cloud */}
                <div className="bg-[#f8fafd] rounded-[10px] p-3 border border-neutral-200/60 my-3">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider font-sans mb-1">
                    Текущее значение (Telemetry)
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f172a] font-heading">
                      {String(selectedVariable.value)}
                    </span>
                    {selectedVariable.unit && (
                      <span className="text-sm font-bold text-neutral-500 font-sans">
                        {selectedVariable.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Attribute Key-Values */}
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-400">NodeId:</span>
                    <span
                      className="font-semibold text-neutral-800 text-[11px] truncate max-w-[150px]"
                      title={selectedVariable.nodeId}
                    >
                      {selectedVariable.nodeId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-400">Data Type:</span>
                    <span className="font-bold text-neutral-800">{selectedVariable.dataType}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-400">Качество связи:</span>
                    <span className="font-bold text-emerald-600">0x00000000 (Good)</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-400">Период опроса:</span>
                    <span className="font-bold text-neutral-800">{selectedVariable.samplingMs} мс</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-400">Подписка:</span>
                    <span
                      className={`font-bold ${
                        selectedVariable.isMonitored ? 'text-violet-600' : 'text-neutral-400'
                      }`}
                    >
                      {selectedVariable.isMonitored ? 'Активна (Live)' : 'Выключена'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Write or Toggle */}
              <div className="pt-3 border-t border-neutral-100">
                {selectedVariable.access === 'R/W' ? (
                  <button
                    onClick={() => {
                      setEditingVarId(selectedVariable.id);
                      setEditValue(String(selectedVariable.value));
                    }}
                    className="tactile-btn w-full py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-[8px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <PencilSimple size={13} weight="bold" />
                    <span>Записать новое значение</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-center text-neutral-400 py-1 font-sans">
                    Переменная только для чтения (Read Only)
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-neutral-400">
              Выберите переменную для инспекции
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
