"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkle,
  ArrowUp,
  X,
  Trash,
  ArrowRight,
  Lightning,
  CaretUp,
} from '@phosphor-icons/react';
import type { HardwareCategoryId } from '@/types/opc';

interface CopilotRecommendation {
  service: string;
  badge: string;
  title: string;
  description: string;
  actionText: string;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  action?: {
    label: string;
    targetTab?: string;
    targetCategory?: HardwareCategoryId;
  };
  recommendation?: CopilotRecommendation;
}

interface IndustrialCopilotBannerProps {
  onNavigateTab?: (tabId: string) => void;
  onSelectCategory?: (categoryId: HardwareCategoryId) => void;
  onShowToast?: (msg: string) => void;
}

const QUICK_STARTERS = [
  {
    chip: "Подключить Siemens S7-1500",
    query: "Как подключить Siemens S7-1500 к OCF Studio?",
  },
  {
    chip: "Проверить сертификаты X.509",
    query: "Какую политику шифрования сертификатов выбрать для АСУ ТП?",
  },
  {
    chip: "Архивация данных в облако",
    query: "Где хранить архивы телеметрии и трендов за несколько лет?",
  },
  {
    chip: "Защита сети АСУ ТП (Solar JSOC)",
    query: "Как защитить технологический сегмент сети от кибератак?",
  },
];

export const IndustrialCopilotBanner: React.FC<IndustrialCopilotBannerProps> = ({
  onNavigateTab,
  onSelectCategory,
  onShowToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 150);
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
  }, [isExpanded, messages, isTyping]);

  // Handle ESC key to minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleSendPrompt = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    if (!isExpanded) setIsExpanded(true);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAnswer(trimmed);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 600);
  };

  const generateAnswer = (query: string): Message => {
    const q = query.toLowerCase();

    // 1. Siemens / PLC
    if (q.includes('siemens') || q.includes('s7') || q.includes('плк') || q.includes('контроллер')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Для подключения Siemens S7-1500 / 1200:\n• В TIA Portal включите «Activate OPC UA Server» в свойствах CPU.\n• Снимите флаг «Optimized Block Access» в целевых DB для прямого доступа к адресам.\n• В OCF Studio укажите Endpoint (opc.tcp://IP:4840) и политику Basic256Sha256.",
        action: {
          label: "Открыть раздел ПЛК",
          targetCategory: 'plc',
        },
        recommendation: {
          service: "Edge",
          badge: "Ростелеком Экосистема",
          title: "Промышленные контроллеры и Edge-шлюзы",
          description: "Аттестованные аппаратные коммуникационные модули с предустановленным стеком OPC UA для ответственных технологических узлов.",
          actionText: "Запросить параметры оборудования",
        },
      };
    }

    // 2. Encryption / Certificates
    if (q.includes('сертифик') || q.includes('шифрован') || q.includes('basic') || q.includes('безопасн')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Рекомендуемый промышленный стандарт — Basic256Sha256 (RSA-OAEP, SHA-256, AES-256-CBC). Он обеспечивает криптографическую стойкость и поддерживается подавляющим большинством контроллеров.\n\nПрофиль SecurityMode: None допустим исключительно на изолированных тестовых стендах.",
        action: {
          label: "Перейти в Сертификаты и защита",
          targetTab: 'security',
        },
        recommendation: {
          service: "Solar",
          badge: "ГК «Солар»",
          title: "Solar JSOC: Кибербезопасность АСУ ТП и КИИ (187-ФЗ)",
          description: "Мониторинг технологической сети АСУ ТП в режиме 24/7, контроль целостности команд и обнаружение аномалий без задержек в цикле опроса.",
          actionText: "Подключить аудит безопасности",
        },
      };
    }

    // 3. Cloud / History / Archives
    if (q.includes('облак') || q.includes('архив') || q.includes('хран') || q.includes('истори') || q.includes('тренд')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "OCF Studio поддерживает локальную буферизацию трендов и выгрузку через OPC UA Historical Access (HA).\n\nПри объеме свыше 10 000 тегов данные целесообразно синхронизировать с внешним защищенным хранилищем временных рядов.",
        action: {
          label: "Открыть Монитор и тренды",
          targetTab: 'monitor',
        },
        recommendation: {
          service: "Cloud",
          badge: "Ростелеком Cloud",
          title: "Защищенный ЦОД Tier III для промышленных архивов",
          description: "Доступность 99.98%, хранение телеметрии по ГОСТ, автоматическое георезервирование и изолированный сетевой канал до площадки.",
          actionText: "Рассчитать емкость архива",
        },
      };
    }

    // 4. Remote / M2M
    if (q.includes('удален') || q.includes('m2m') || q.includes('сим') || q.includes('sim') || q.includes('связь')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Для удаленных площадок (ИТП, насосные, скважины) задайте QueueSize = 20..50 и включите «Discard Oldest» в Настройках, чтобы избежать переполнения буфера шлюза при нестабильном канале связи.",
        action: {
          label: "Перейти в Настройки системы",
          targetTab: 'settings',
        },
        recommendation: {
          service: "M2M",
          badge: "Ростелеком M2M",
          title: "Промышленные SIM-карты с закрытым APN и VPN",
          description: "Термостойкие M2M чипы с приоритетным QoS-трафиком и прямой передачей технологических данных в диспетчерский пункт без выхода в интернет.",
          actionText: "Подключить корпоративный тариф",
        },
      };
    }

    // Default Fallback
    return {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      text: `Запрос принят к обработке. В OCF Studio вы можете настроить подключение к любому серверу через протокол opc.tcp://, выбрав нужный класс оборудования или указав конечную точку вручную.`,
      action: {
        label: "К списку классов устройств",
        targetTab: 'connections',
      },
      recommendation: {
        badge: "Ростелеком Индустриальный Консалтинг",
        service: "Consulting",
        title: "Экспертиза и аудит технологических сетей",
        description: "Помощь в проектировании архитектуры диспетчеризации, конвертации протоколов и аттестации контуров безопасности.",
        actionText: "Связаться с инженером Ростелеком",
      },
    };
  };

  const handleActionClick = (action?: Message['action']) => {
    if (!action) return;
    setIsExpanded(false);
    if (action.targetCategory && onSelectCategory) {
      onSelectCategory(action.targetCategory);
      if (onShowToast) onShowToast(`Открыта категория: ${action.label}`);
    } else if (action.targetTab && onNavigateTab) {
      onNavigateTab(action.targetTab);
      if (onShowToast) onShowToast(`Переход: ${action.label}`);
    }
  };

  const handleRecommendationClick = (rec: CopilotRecommendation) => {
    if (onShowToast) {
      onShowToast(`Заявка по сервису «${rec.title}» передана инженерам Ростелеком.`);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. COLLAPSED DOCKED BAR (At the bottom of the page)                        */}
      {/*    No clipped shadows! Clean border & subtle ring.                         */}
      {/* ========================================================================= */}
      <div className="relative z-10 shrink-0 mt-3 select-none">
        <div
          onClick={() => setIsExpanded(true)}
          className="group h-[56px] rounded-[14px] bg-[#0c0d12] hover:bg-[#11131c] border border-white/10 hover:border-violet-500/40 transition-all duration-200 px-3.5 sm:px-4 flex items-center justify-between gap-3 cursor-pointer"
        >
          {/* Left: Friendly Engineer Avatar + Clean Greeting Input Trigger */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src="/engineer_avatar.png"
                alt="Инженер OCF Copilot"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/40 group-hover:ring-violet-400 transition-all"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0c0d12]" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white font-heading tracking-tight truncate">
                Привет, какой план на сегодня?
              </span>
              <span className="text-[11px] text-neutral-400 font-sans tracking-tight truncate">
                Спросите ассистента или выберите быстрый сценарий...
              </span>
            </div>
          </div>

          {/* Right: Clean action trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[11px] font-bold text-neutral-400 group-hover:text-neutral-200 font-sans transition-colors">
              Открыть диалог
            </span>
            <div className="w-7 h-7 rounded-[8px] bg-white/5 group-hover:bg-violet-600 text-neutral-400 group-hover:text-white flex items-center justify-center transition-all">
              <CaretUp size={13} weight="bold" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPANDED DIALOG (Opens upwards with EQUAL OFFSETS from outer canvas)   */}
      {/*    inset-0 inside main = exactly 24px from top, bottom, left, right!       */}
      {/*    No oversized shadows -> zero clipped-shadow artifacts!                  */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div
          className="absolute inset-0 z-40 bg-[#0c0d12] text-white rounded-[16px] border border-white/10 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-240 ease-[cubic-bezier(0.16,1,0.3,1)] select-none"
        >
          {/* Two Living, Flowing Amorphous Fluid Textures */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[16px] z-0">
            {/* Amorphous Blob 1: Deep Violet & Indigo Aurora */}
            <div
              className="animate-blob-1 absolute -top-16 -right-16 w-[440px] h-[440px] filter blur-[75px] opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 45% 45%, rgba(139, 92, 246, 0.7) 0%, rgba(99, 102, 241, 0.45) 45%, rgba(67, 56, 202, 0.1) 75%, transparent 100%)',
              }}
            />

            {/* Amorphous Blob 2: Cyan & Electric Blue Nebula */}
            <div
              className="animate-blob-2 absolute -bottom-20 -left-16 w-[480px] h-[480px] filter blur-[85px] opacity-25 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 55% 55%, rgba(56, 189, 248, 0.55) 0%, rgba(79, 70, 229, 0.38) 45%, rgba(124, 58, 237, 0.1) 75%, transparent 100%)',
              }}
            />
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* HEADER: Ultra-clean, with Human Engineer Identity (Seamless Dark Fade)  */}
          {/* ----------------------------------------------------------------------- */}
          <div className="relative z-20 px-5 sm:px-6 pt-4 pb-2.5 flex items-center justify-between shrink-0 bg-gradient-to-b from-[#0c0d12] via-[#0c0d12]/90 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src="/engineer_avatar.png"
                  alt="Инженер OCF Copilot"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/40"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0c0d12]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-sm tracking-tight text-white">
                    Инженер OCF Copilot
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 font-sans">
                    Онлайн
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="tactile-btn p-2 rounded-[8px] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Очистить диалог"
                >
                  <Trash size={15} weight="light" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="tactile-btn p-2 rounded-[8px] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Свернуть (Esc)"
              >
                <X size={15} weight="light" />
              </button>
            </div>
          </div>

          {/* Top smooth dark fade under header */}
          <div className="absolute top-[52px] left-0 right-0 h-10 bg-gradient-to-b from-[#0c0d12]/95 via-[#0c0d12]/50 to-transparent pointer-events-none z-20" />

          {/* ----------------------------------------------------------------------- */}
          {/* CHAT BODY: Scrollable Canvas                                             */}
          {/* ----------------------------------------------------------------------- */}
          <div
            ref={chatScrollRef}
            className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 font-sans"
          >
            {/* If no messages yet: Large clean greeting with human avatar */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center max-w-lg mx-auto py-6 text-center animate-in fade-in duration-300">
                <div className="relative mx-auto mb-4 w-18 h-18">
                  <img
                    src="/engineer_avatar.png"
                    alt="Инженер OCF Copilot"
                    className="w-18 h-18 rounded-full object-cover ring-3 ring-violet-500/40 shadow-lg mx-auto"
                  />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 absolute bottom-0 right-1 ring-3 ring-[#0c0d12]" />
                </div>

                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
                  Привет, какой план на сегодня?
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed mb-6">
                  Задайте вопрос по подключению ПЛК, политикам шифрования X.509 или выберите нужный сценарий:
                </p>

                {/* Minimal clean starter chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {QUICK_STARTERS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendPrompt(item.query)}
                      className="tactile-btn p-3 rounded-[12px] bg-white/[0.04] hover:bg-violet-600/15 border border-white/8 hover:border-violet-500/40 text-neutral-200 hover:text-white text-xs font-sans transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="font-medium tracking-tight">{item.chip}</span>
                      <ArrowRight
                        size={13}
                        weight="bold"
                        className="text-neutral-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar beside bubble */}
                {msg.sender === 'assistant' && (
                  <img
                    src="/engineer_avatar.png"
                    alt="Инженер"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/30 shrink-0 mt-1"
                  />
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[78%] rounded-[14px] p-4 text-xs leading-relaxed font-sans ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white/[0.05] text-neutral-200 border border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-sans">{msg.text}</p>

                  {/* Clean Action Button */}
                  {msg.action && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.action)}
                        className="bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs px-3.5 py-1.5 rounded-[8px] transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight size={12} weight="bold" />
                      </button>
                    </div>
                  )}

                  {/* Clean Rostelecom Recommendation Card */}
                  {msg.recommendation && (
                    <div className="mt-3.5 p-3 rounded-[10px] bg-[#14161f] border border-violet-500/30 text-white">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 font-heading">
                          {msg.recommendation.badge}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-sans">
                          Рекомендация
                        </span>
                      </div>

                      <div className="font-heading font-black text-xs text-white tracking-tight">
                        {msg.recommendation.title}
                      </div>

                      <p className="text-[11px] text-neutral-300 mt-1 leading-normal font-sans">
                        {msg.recommendation.description}
                      </p>

                      <div className="mt-3 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRecommendationClick(msg.recommendation!)}
                          className="bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-[6px] transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Lightning size={12} weight="bold" />
                          <span>{msg.recommendation.actionText}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 text-neutral-400 text-xs">
                <img
                  src="/engineer_avatar.png"
                  alt="Инженер"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/30 shrink-0"
                />
                <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-white/[0.04] border border-white/8">
                  <Sparkle size={13} weight="fill" className="text-violet-400 animate-spin" />
                  <span>Формирую ответ...</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom smooth dark fade above input */}
          <div className="absolute bottom-[68px] left-0 right-0 h-12 bg-gradient-to-t from-[#0c0d12]/95 via-[#0c0d12]/60 to-transparent pointer-events-none z-20" />

          {/* ----------------------------------------------------------------------- */}
          {/* FOOTER: Crisp Input Bar (Seamless Dark Fade, No Hard Border Lines)      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="relative z-20 px-5 sm:px-6 pb-4 pt-1 shrink-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/95 to-transparent">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(inputQuery);
              }}
              className="flex items-center gap-3 bg-[#13151d]/90 backdrop-blur-md border border-white/10 rounded-[12px] px-4 py-2.5 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all shadow-lg shadow-black/25"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Задайте вопрос по контроллерам, протоколам, архивам..."
                className="bg-transparent text-xs text-white placeholder:text-neutral-500 outline-none w-full font-sans"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  inputQuery.trim() && !isTyping
                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                }`}
                title="Отправить (Enter)"
              >
                <ArrowUp size={13} weight="bold" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
