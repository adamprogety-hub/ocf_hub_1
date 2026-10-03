"use client";

import { useState } from 'react';
import {
  HardDrives,
  Cpu,
  Plugs,
  ArrowsClockwise,
  Broadcast,
  CheckCircle,
  Wrench,
  SlidersHorizontal,
} from '@phosphor-icons/react';

interface GatewaysViewProps {
  onShowToast: (msg: string) => void;
}

interface GatewayDevice {
  id: string;
  name: string;
  vendor: string;
  model: string;
  ip: string;
  mac: string;
  fieldbus: string;
  baudRate: string;
  connectedSlaves: number;
  packetsPerSec: number;
  status: 'online' | 'standby' | 'error';
  pingMs: number;
}

export const GatewaysView: React.FC<GatewaysViewProps> = ({ onShowToast }) => {
  const [gateways, setGateways] = useState<GatewayDevice[]>([
    {
      id: 'gw-1',
      name: 'Шлюз Modbus RTU / OPC UA • ЦТП-3',
      vendor: 'Moxa Technologies',
      model: 'MGate 5105-MB-EIP',
      ip: '10.0.30.12',
      mac: '00:90:E8:4A:21:BC',
      fieldbus: 'RS-485 (2-wire half duplex)',
      baudRate: '115200 8-N-1',
      connectedSlaves: 14,
      packetsPerSec: 48,
      status: 'online',
      pingMs: 12,
    },
    {
      id: 'gw-2',
      name: 'Концентратор шины M-Bus учета тепла',
      vendor: 'Advantech Industrial',
      model: 'WISE-710 IoT Gateway',
      ip: '10.0.32.4',
      mac: '74:FE:48:19:55:01',
      fieldbus: 'M-Bus / Ethernet TCP',
      baudRate: '9600 8-E-1',
      connectedSlaves: 28,
      packetsPerSec: 16,
      status: 'online',
      pingMs: 19,
    },
    {
      id: 'gw-3',
      name: 'Периферийный шлюз телемеханики ТП-1',
      vendor: 'Wiren Board',
      model: 'Wiren Board 7 Edge',
      ip: '10.0.34.8',
      mac: 'D8:80:39:CA:71:0E',
      fieldbus: 'CAN 2.0B + 2x RS-485',
      baudRate: '250 kbps (CAN) / 57600 (Modbus)',
      connectedSlaves: 9,
      packetsPerSec: 32,
      status: 'online',
      pingMs: 16,
    },
    {
      id: 'gw-4',
      name: 'Контроллер сбора данных насосной №2',
      vendor: 'Siemens Industrial',
      model: 'SIMATIC S7-1200 CPU 1214C',
      ip: '10.0.4.15',
      mac: '68:69:B6:F0:8A:22',
      fieldbus: 'Profinet RT / Industrial Ethernet',
      baudRate: '100 Mbps Full Duplex',
      connectedSlaves: 6,
      packetsPerSec: 110,
      status: 'online',
      pingMs: 18,
    },
  ]);

  const handleRestartStack = (gw: GatewayDevice) => {
    onShowToast(`Стек OPC UA перезапущен на "${gw.name}"`);
  };

  const handlePortDiagnostics = (gw: GatewayDevice) => {
    onShowToast(`Тест COM-порта "${gw.fieldbus}": Ошибок CRC — 0. Качество 100%`);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between h-full relative z-10 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-4 border-b border-neutral-200/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-heading">
            Шлюзы и контроллеры
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Аппаратная топология полевых шин Modbus RTU/TCP, Profinet, CAN и концентраторов
          </p>
        </div>

        <button
          onClick={() => onShowToast('Сканирование ARP и поиск новых шлюзов...')}
          className="bg-[#0f172a] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102 shrink-0 font-sans"
        >
          <Broadcast size={14} weight="bold" />
          <span>Сканировать полевую сеть</span>
        </button>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4 shrink-0">
        <div className="bg-white/70 backdrop-blur-md rounded-[14px] border border-white/90 p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-sans mb-1">
            Аппаратные шлюзы
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0f172a] font-heading">4</span>
            <span className="text-xs font-semibold text-neutral-400 font-sans">концентратора в сети</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold mt-2">
            100% аптайм полевого оборудования
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-[14px] border border-white/90 p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-sans mb-1">
            Опрашиваемые Slave-устройства
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0f172a] font-heading">57</span>
            <span className="text-xs font-semibold text-neutral-400 font-sans">приборов (датчики, ПЧВ)</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-sans mt-2">
            Modbus RTU, M-Bus и CANopen шины
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-[14px] border border-white/90 p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-sans mb-1">
            Суммарный битрейт шин
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-violet-700 font-heading">206</span>
            <span className="text-xs font-semibold text-neutral-400 font-sans">пакетов/сек</span>
          </div>
          <p className="text-[11px] text-violet-600 font-semibold font-sans mt-2">
            Ошибки контрольных сумм: 0.00%
          </p>
        </div>
      </div>

      {/* Grid of Gateway Cards */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className="bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/80 rounded-[16px] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)] transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-[4px] font-sans uppercase">
                      {gw.vendor}
                    </span>
                    <h3 className="text-base font-extrabold text-[#0f172a] font-heading mt-1.5 tracking-tight">
                      {gw.name}
                    </h3>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="В сети" />
                </div>

                <div className="bg-[#f8fafd] rounded-[10px] p-3 border border-neutral-200/60 my-3 space-y-1.5 text-xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Модель:</span>
                    <span className="font-bold text-neutral-900">{gw.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">IP адрес:</span>
                    <span className="font-sans text-neutral-800">{gw.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">MAC адрес:</span>
                    <span className="font-sans text-neutral-500 text-[11px]">{gw.mac}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Полевая шина:</span>
                    <span className="font-semibold text-neutral-800">{gw.fieldbus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Скорость порта:</span>
                    <span className="font-semibold text-neutral-800">{gw.baudRate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-neutral-200/40 flex items-center justify-between">
                <div className="text-xs font-sans text-neutral-500">
                  Ведомых приборов: <strong className="text-neutral-900">{gw.connectedSlaves} шт</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePortDiagnostics(gw)}
                    className="px-2.5 py-1.5 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-sans"
                    title="Диагностика порта RS-485/CAN"
                  >
                    <Wrench size={13} weight="light" />
                    <span>Порт</span>
                  </button>

                  <button
                    onClick={() => handleRestartStack(gw)}
                    className="px-3 py-1.5 rounded-[8px] bg-[#0f172a] hover:bg-black text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer font-sans"
                    title="Перезапустить OPC UA стек"
                  >
                    <ArrowsClockwise size={13} weight="bold" />
                    <span>Стек</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
