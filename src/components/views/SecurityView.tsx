"use client";

import { useState } from 'react';
import {
  ShieldCheck,
  ShieldWarning,
  Certificate,
  Key,
  Check,
  X,
  DownloadSimple,
  Plus,
  ArrowClockwise,
  LockKey,
} from '@phosphor-icons/react';

interface SecurityViewProps {
  onShowToast: (msg: string) => void;
}

interface CertItem {
  id: string;
  name: string;
  endpoint: string;
  thumbprint: string;
  issuer: string;
  validUntil: string;
  keyLength: string;
  status: 'trusted' | 'quarantine' | 'expired';
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'trusted' | 'quarantine' | 'policies'>('trusted');
  const [certificates, setCertificates] = useState<CertItem[]>([
    {
      id: 'cert-1',
      name: 'Siemens S7-1500 • Котельная №4',
      endpoint: 'opc.tcp://10.0.4.15:4840',
      thumbprint: '8F:2A:44:91:C3:7E:90:12:4D:21:5B:3A',
      issuer: 'Siemens Industrial Automation Root CA',
      validUntil: '2028-09-14',
      keyLength: 'RSA 2048 / SHA-256',
      status: 'trusted',
    },
    {
      id: 'cert-2',
      name: 'Schneider Modicon M262 • Блок Б',
      endpoint: 'opc.tcp://10.0.8.20:4840',
      thumbprint: 'C4:81:19:FA:40:99:A2:7B:14:6E:3D:88',
      issuer: 'Schneider Electric Machine CA',
      validUntil: '2027-11-20',
      keyLength: 'RSA 2048 / SHA-256',
      status: 'trusted',
    },
    {
      id: 'cert-3',
      name: 'Moxa MGate 5105 • Шлюз ЦТП-3',
      endpoint: 'opc.tcp://10.0.30.12:4840',
      thumbprint: '55:B2:77:E1:90:22:33:44:FA:BC:11:09',
      issuer: 'Moxa Device Authority Class 2',
      validUntil: '2029-01-05',
      keyLength: 'RSA 4096 / SHA-256',
      status: 'trusted',
    },
    {
      id: 'cert-4',
      name: 'KEPServerEX v6 Enterprise Gateway',
      endpoint: 'opc.tcp://10.0.1.100:4840',
      thumbprint: '11:44:88:AC:EF:01:23:45:67:89:AB:CD',
      issuer: 'PTC Kepware Self-Signed Authority',
      validUntil: '2028-05-30',
      keyLength: 'RSA 2048 / SHA-256',
      status: 'trusted',
    },
    {
      id: 'cert-quarantine-1',
      name: 'Новый контроллер Beckhoff CX5140 (Запрос связи)',
      endpoint: 'opc.tcp://10.0.18.44:4840',
      thumbprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55',
      issuer: 'Beckhoff Automation GmbH CA',
      validUntil: '2027-03-12',
      keyLength: 'RSA 2048 / SHA-256',
      status: 'quarantine',
    },
  ]);

  const handleTrustCertificate = (id: string, name: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'trusted' as const } : c))
    );
    onShowToast(`Сертификат "${name}" добавлен в доверенный список!`);
  };

  const handleRevokeCertificate = (id: string, name: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'quarantine' as const } : c))
    );
    onShowToast(`Сертификат "${name}" отозван и перемещен в карантин.`);
  };

  const trustedCount = certificates.filter((c) => c.status === 'trusted').length;
  const quarantineCount = certificates.filter((c) => c.status === 'quarantine').length;

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-start gap-4.5 h-full relative z-10 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 pb-3.5 border-b border-neutral-200/50">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-heading">
          Сертификаты и защита
        </h1>
        <p className="text-xs text-neutral-400 font-sans mt-0.5">
          Управление доверенными X.509 сертификатами, политиками шифрования и доступом
        </p>
      </div>

      {/* Outer Long Dark Banner: Row starting with the violet Issue action, followed by issued certificates */}
      <div className="bg-[#0e0f14] text-white rounded-[18px] border border-white/10 p-3 sm:p-3.5 relative overflow-x-auto select-none shrink-0 flex items-stretch gap-3.5 mb-2">
        {/* Violet Action Card: Issue Certificate at the start of the row */}
        <button
          onClick={() => onShowToast('Формирование нового CSR запроса на подпись...')}
          className="w-36 sm:w-40 rounded-[14px] bg-violet-600 hover:bg-violet-500 text-white p-4 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md shrink-0 border border-violet-400/30 group select-none text-center active:scale-98"
        >
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <Plus size={22} weight="light" />
          </div>
          <span className="text-xs font-bold font-sans leading-tight">
            Выпустить<br />сертификат
          </span>
        </button>

        {/* 1. Green Card: Active Valid Client Instance */}
        <div className="relative z-10 w-[300px] sm:w-[340px] md:w-[360px] bg-emerald-500 text-neutral-950 rounded-[14px] p-4 flex flex-col justify-between shadow-md shrink-0 select-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-950/80 font-sans block mb-1">
              Активен (Client Instance)
            </span>
            <h3 className="text-base font-black text-neutral-950 font-heading tracking-tight truncate">
              OCF Studio Client Instance
            </h3>
            <p className="text-xs text-emerald-950/80 font-sans mt-0.5 font-medium truncate">
              RSA 2048 / SHA-256 • Истекает 2028-12-31
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-black/10 flex items-center justify-between text-xs font-sans">
            <span className="text-[11px] text-emerald-950/70 font-sans font-medium">
              Формат X.509 v3
            </span>
            <button
              type="button"
              onClick={() => onShowToast('Сертификат клиента выгружен в .der')}
              className="px-2.5 py-1 rounded-[6px] bg-neutral-950 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>Скачать .der</span>
            </button>
          </div>
        </div>

        {/* 2. Amber Card: Expiring Soon Warning */}
        <div className="relative z-10 w-[300px] sm:w-[340px] md:w-[360px] bg-amber-400 text-neutral-950 rounded-[14px] p-4 flex flex-col justify-between shadow-md shrink-0 select-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-950/80 font-sans block mb-1">
              Скоро истекает (14 дней)
            </span>
            <h3 className="text-base font-black text-neutral-950 font-heading tracking-tight truncate">
              Siemens S7-1500 Gateway
            </h3>
            <p className="text-xs text-amber-950/80 font-sans mt-0.5 font-medium truncate">
              RSA 2048 / SHA-256 • Истекает 2026-10-15
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-black/10 flex items-center justify-between text-xs font-sans">
            <span className="text-[11px] text-amber-950/70 font-sans font-medium">
              Требуется продление
            </span>
            <button
              type="button"
              onClick={() => onShowToast('Запрос на продление сертификата отправлен в CA')}
              className="px-2.5 py-1 rounded-[6px] bg-neutral-950 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowClockwise size={14} weight="bold" />
              <span>Продлить</span>
            </button>
          </div>
        </div>

        {/* 3. Rose/Red Card: Quarantine / Untrusted Request */}
        <div className="relative z-10 w-[300px] sm:w-[340px] md:w-[360px] bg-rose-500 text-neutral-950 rounded-[14px] p-4 flex flex-col justify-between shadow-md shrink-0 select-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-950/80 font-sans block mb-1">
              В карантине (Untrusted)
            </span>
            <h3 className="text-base font-black text-neutral-950 font-heading tracking-tight truncate">
              Beckhoff CX5140 PLC
            </h3>
            <p className="text-xs text-neutral-950/80 font-sans mt-0.5 font-medium truncate">
              Запрос связи от 10.0.18.44 • Не проверен
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-black/10 flex items-center justify-between text-xs font-sans">
            <span className="text-[11px] text-neutral-950/70 font-sans font-medium">
              Самоподписанный
            </span>
            <button
              type="button"
              onClick={() => handleTrustCertificate('cert-quarantine-1', 'Beckhoff CX5140 PLC')}
              className="px-2.5 py-1 rounded-[6px] bg-neutral-950 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Check size={14} weight="bold" />
              <span>Доверить</span>
            </button>
          </div>
        </div>

        {/* 4. Sky Blue Card: Trusted Root CA Authority */}
        <div className="relative z-10 w-[300px] sm:w-[340px] md:w-[360px] bg-sky-400 text-neutral-950 rounded-[14px] p-4 flex flex-col justify-between shadow-md shrink-0 select-none">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-950/80 font-sans block mb-1">
              Корневой центр (Root CA)
            </span>
            <h3 className="text-base font-black text-neutral-950 font-heading tracking-tight truncate">
              Industrial Trust Root Authority
            </h3>
            <p className="text-xs text-sky-950/80 font-sans mt-0.5 font-medium truncate">
              RSA 4096 / SHA-384 • Бессрочный (2035)
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-black/10 flex items-center justify-between text-xs font-sans">
            <span className="text-[11px] text-sky-950/70 font-sans font-medium">
              Цепочка доверия
            </span>
            <button
              type="button"
              onClick={() => onShowToast('Корневой сертификат экспортирован в .pem')}
              className="px-2.5 py-1 rounded-[6px] bg-neutral-950 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>Экспорт PEM</span>
            </button>
          </div>
        </div>

        {/* Clean trailing spacer */}
        <div className="flex-1 min-w-[8px]" />
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <button
          onClick={() => setActiveTab('trusted')}
          className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer font-sans ${
            activeTab === 'trusted'
              ? 'bg-[#0f172a] text-white shadow-2xs'
              : 'bg-white/70 text-neutral-600 hover:bg-white'
          }`}
        >
          Доверенные серверы ({trustedCount})
        </button>

        <button
          onClick={() => setActiveTab('quarantine')}
          className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer font-sans flex items-center gap-1.5 ${
            activeTab === 'quarantine'
              ? 'bg-orange-500 text-white shadow-2xs'
              : 'bg-white/70 text-neutral-600 hover:bg-white'
          }`}
        >
          <span>Карантин</span>
          {quarantineCount > 0 && (
            <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-full">
              {quarantineCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer font-sans ${
            activeTab === 'policies'
              ? 'bg-[#0f172a] text-white shadow-2xs'
              : 'bg-white/70 text-neutral-600 hover:bg-white'
          }`}
        >
          Политики безопасности
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-md rounded-[16px] border border-neutral-200/60 p-4 overflow-y-auto shadow-2xs">
        {activeTab !== 'policies' ? (
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200/60 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-2.5 pl-2">Оборудование / URI</th>
                <th className="pb-2.5">Отпечаток SHA-256</th>
                <th className="pb-2.5">Центр сертификации (Issuer)</th>
                <th className="pb-2.5">Срок действия</th>
                <th className="pb-2.5 text-right pr-2">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {certificates
                .filter((c) => (activeTab === 'trusted' ? c.status === 'trusted' : c.status === 'quarantine'))
                .map((cert) => (
                  <tr key={cert.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 pl-2 max-w-[220px]">
                      <div className="font-bold text-[#0f172a] truncate">{cert.name}</div>
                      <div className="text-[11px] text-neutral-400 truncate">{cert.endpoint}</div>
                    </td>

                    <td className="py-3">
                      <span className="text-[11px] font-sans text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {cert.thumbprint}
                      </span>
                    </td>

                    <td className="py-3 text-neutral-600 text-[11px] max-w-[180px] truncate" title={cert.issuer}>
                      {cert.issuer}
                    </td>

                    <td className="py-3">
                      <span className="font-semibold text-neutral-800">{cert.validUntil}</span>
                    </td>

                    <td className="py-3 text-right pr-2">
                      {cert.status === 'quarantine' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTrustCertificate(cert.id, cert.name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-[6px] shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Check size={13} weight="bold" />
                            <span>Доверить</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevokeCertificate(cert.id, cert.name)}
                          className="bg-neutral-100 hover:bg-orange-50 hover:text-orange-600 text-neutral-600 text-xs font-bold px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
                        >
                          Отозвать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          /* Encryption Policies Specs */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
            <div className="bg-[#f8fafd] border border-neutral-200/70 rounded-[12px] p-4 flex flex-col justify-between">
              <div>
                <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase">
                  Рекомендовано
                </span>
                <h4 className="text-sm font-black text-[#0f172a] font-heading mt-2">
                  Basic256Sha256
                </h4>
                <p className="text-xs text-neutral-500 font-sans mt-1 leading-relaxed">
                  Асимметричное шифрование RSA-OAEP, подпись SHA-256, симметричное шифрование AES-256-CBC.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-xs font-bold text-emerald-700">
                Максимальный промышленный уровень
              </div>
            </div>

            <div className="bg-[#f8fafd] border border-neutral-200/70 rounded-[12px] p-4 flex flex-col justify-between">
              <div>
                <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase">
                  Стандарт
                </span>
                <h4 className="text-sm font-black text-[#0f172a] font-heading mt-2">
                  Aes128_Sha256_RsaOaep
                </h4>
                <p className="text-xs text-neutral-500 font-sans mt-1 leading-relaxed">
                  Оптимизированный профиль для энергоэффективных контроллеров с умеренной вычислительной мощностью.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-xs font-bold text-neutral-600">
                Поддерживается 100% контроллеров
              </div>
            </div>

            <div className="bg-[#f8fafd] border border-neutral-200/70 rounded-[12px] p-4 flex flex-col justify-between">
              <div>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase">
                  Только отладка
                </span>
                <h4 className="text-sm font-black text-[#0f172a] font-heading mt-2">
                  SecurityMode: None
                </h4>
                <p className="text-xs text-neutral-500 font-sans mt-1 leading-relaxed">
                  Передача без шифрования открытым текстом. Допускается только в изолированных тестовых стендах.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 text-xs font-bold text-orange-600">
                Небезопасно для рабочего контура
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
