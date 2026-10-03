"use client";

import { useState } from 'react';
import {
  X,
  Plugs,
  CheckCircle,
  Lightning,
} from '@phosphor-icons/react';
import type { OpcConnection } from '../types/opc';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newConn: OpcConnection) => void;
}

export const AddConnectionModal: React.FC<AddConnectionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('opc.tcp://10.0.1.');
  const [controllerType, setControllerType] = useState('Siemens S7-1200 / S7-1500');
  const [securityPolicy, setSecurityPolicy] = useState('Basic256Sha256');
  const [messageSecurityMode, setMessageSecurityMode] = useState<OpcConnection['messageSecurityMode']>('SignAndEncrypt');
  const [tagsCount, setTagsCount] = useState(120);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Связь установлена: сервер ответил за 19 мс (OPC UA v1.04)');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newConnection: OpcConnection = {
      id: `conn-${Date.now()}`,
      categoryId: 'plc',
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

    onAdd(newConnection);
    onClose();
    setName('');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-[16px] w-full max-w-lg shadow-2xl border border-neutral-100 p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight font-heading">
              Новое подключение OPC UA
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Параметры контроллера автоматики для интеграции в SCADA
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          {/* Server Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 font-sans">
              Имя оборудования / Узла
            </label>
            <input
              type="text"
              required
              placeholder="например: Котельная №5 или Чиллер Emerson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3.5 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all font-sans"
            />
          </div>

          {/* Endpoint URL with Ping Test */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 font-sans">
              Сетевой адрес Endpoint URI
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Plugs
                  size={16}
                  weight="light"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  required
                  placeholder="opc.tcp://10.0.1.50:4840"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] pl-9 pr-3.5 py-2 text-xs sm:text-sm font-sans text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleTestPing}
                disabled={isTesting}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3.5 py-2 rounded-[8px] text-xs font-semibold font-sans transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <Lightning size={14} weight="light" className="text-orange-500" />
                <span>{isTesting ? 'Пинг...' : 'Тест'}</span>
              </button>
            </div>

            {testResult && (
              <div className="mt-2 text-xs text-violet-600 flex items-center gap-1.5 font-sans">
                <CheckCircle size={16} weight="light" />
                <span>{testResult}</span>
              </div>
            )}
          </div>

          {/* Controller Model */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 font-sans">
              Модель ПЛК / Источник данных
            </label>
            <select
              value={controllerType}
              onChange={(e) => setControllerType(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3 py-2 text-xs text-neutral-800 font-sans focus:outline-none focus:border-neutral-900"
            >
              <option value="Siemens S7-1200 / S7-1500">Siemens S7-1200 / S7-1500 (TIA Portal)</option>
              <option value="Schneider Modicon M241 / M262">Schneider Modicon M241 / M262</option>
              <option value="Овен ПЛК210 / Codesys v3.5">Овен ПЛК210 / ПЛК200 (Codesys)</option>
              <option value="Carel pCO5 / Шлюз c.pCO">Carel pCO / Холодильная автоматика</option>
              <option value="Другой OPC UA сервер">Другой OPC UA сервер (FreeOpcUa / Kepware)</option>
            </select>
          </div>

          {/* Security Policy & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 font-sans">
                Политика безопасности
              </label>
              <select
                value={securityPolicy}
                onChange={(e) => setSecurityPolicy(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3 py-2 text-xs text-neutral-800 font-sans focus:outline-none focus:border-neutral-900"
              >
                <option value="Basic256Sha256">Basic256Sha256</option>
                <option value="Aes128_Sha256_RsaOaep">Aes128_Sha256</option>
                <option value="None">None (Без шифрования)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 font-sans">
                Режим сообщений
              </label>
              <select
                value={messageSecurityMode}
                onChange={(e) => setMessageSecurityMode(e.target.value as OpcConnection['messageSecurityMode'])}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3 py-2 text-xs text-neutral-800 font-sans focus:outline-none focus:border-neutral-900"
              >
                <option value="SignAndEncrypt">SignAndEncrypt</option>
                <option value="Sign">Sign</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Estimated Tags Count */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 font-sans">
              Количество опрашиваемых тегов
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={tagsCount}
              onChange={(e) => setTagsCount(Number(e.target.value))}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3 py-2 text-xs font-sans text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors font-sans"
            >
              Отмена
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-[8px] text-xs font-bold bg-neutral-950 text-white hover:bg-black transition-all hover:scale-102 active:scale-98 shadow-sm font-sans"
            >
              Сохранить подключение
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
