"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkle,
  PaperPlaneRight,
  ArrowsOutSimple,
  ArrowsInSimple,
  ArrowRight,
  ShieldCheck,
  Cloud,
  Broadcast,
  DeviceMobile,
  CheckCircle,
  Lightning,
  Trash,
  CaretDown,
  CaretUp,
  Cpu,
  LockKey,
} from '@phosphor-icons/react';
import type { HardwareCategoryId } from '@/types/opc';

interface CopilotRecommendation {
  badge: string;
  title: string;
  description: string;
  serviceType: 'cloud' | 'security' | 'm2m' | 'aurora' | 'edge';
  actionText: string;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  quickAction?: {
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

const PRESET_PROMPTS = [
  {
    chip: "🔌 Как подключить Siemens S7-1500?",
    query: "Как подключить Siemens S7-1500 к OCF Studio?",
  },
  {
    chip: "🔒 Какую политику шифрования выбрать?",
    query: "Какую политику шифрования сертификатов выбрать для АСУ ТП?",
  },
  {
    chip: "☁️ Долгосрочное хранение архивов",
    query: "Где хранить архивы телеметрии и трендов за несколько лет?",
  },
  {
    chip: "🛡 Защита АСУ ТП от атак (Solar JSOC)",
    query: "Как защитить технологический сегмент сети от аномалий и кибератак?",
  },
  {
    chip: "📡 Связь с удаленными объектами (M2M)",
    query: "Как организовать защищенный сбор данных с удаленных котельных без проводной сети?",
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: "Здравствуйте! Я промышленный AI-ассистент OCF Studio на базе индустриальной нейросетевой модели Ростелеком. Помогу настроить связь с ПЛК, сконфигурировать политики шифрования X.509, оптимизировать очереди подписок или подключить сервисы защищенного периметра.",
    timestamp: 'Только что',
    quickAction: {
      label: "Открыть контроллеры и ПЛК",
      targetCategory: 'plc',
    },
  },
];

export const IndustrialCopilotBanner: React.FC<IndustrialCopilotBannerProps> = ({
  onNavigateTab,
  onSelectCategory,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded, isTyping]);

  const handleSendPrompt = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsExpanded(true);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAssistantResponse(trimmed);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 700);
  };

  const generateAssistantResponse = (query: string): Message => {
    const q = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Siemens / PLC
    if (q.includes('siemens') || q.includes('s7') || q.includes('плк') || q.includes('контроллер')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Для подключения Siemens S7-1500 / S7-1200:\n1. В TIA Portal активируйте пункт: CPU Properties → OPC UA → Activate OPC UA Server.\n2. В свойствах DB снимите флаг «Optimized Block Access» для прямого чтения абсолютных адресов (DB1.DBD0) или используйте символьную адресацию.\n3. В OCF Studio выберите Endpoint: opc.tcp://192.168.0.1:4840 и политику шифрования Basic256Sha256.",
        timestamp,
        quickAction: {
          label: "Перейти к карточкам ПЛК",
          targetCategory: 'plc',
        },
        recommendation: {
          badge: "Экосистема Ростелеком • Industrial Edge",
          title: "Промышленные контроллеры и Edge-шлюзы Ростелеком",
          description: "Для распределенных производственных контуров используйте отечественные коммуникационные модули Ростелеком с преднастроенным стеком OPC UA и защитой от перепадов питания.",
          serviceType: 'edge',
          actionText: "Запросить спецификацию оборудования",
        },
      };
    }

    // 2. Encryption / Certificates
    if (q.includes('шифрован') || q.includes('сертифик') || q.includes('basic') || q.includes('безопасн') || q.includes('x.509')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "В промышленной эксплуатации стандартом является Basic256Sha256 (RSA-OAEP, SHA-256, AES-256-CBC). Для тестовых стендов допустим профиль Aes128_Sha256_RsaOaep.\n\nПрофиль SecurityMode: None (без шифрования) запрещен в соответствии с требованиями ИБ промышленных предприятий.",
        timestamp,
        quickAction: {
          label: "Открыть политики и сертификаты",
          targetTab: 'security',
        },
        recommendation: {
          badge: "ГК «Солар» (Дочерняя компания Ростелеком)",
          title: "Solar JSOC: Кибербезопасность АСУ ТП и КИИ (187-ФЗ)",
          description: "Непрерывный мониторинг технологической сети АСУ ТП, выявление аномалий протокола OPC UA и предотвращение атак без влияния на цикл опроса контроллеров.",
          serviceType: 'security',
          actionText: "Подключить аудит безопасности Solar",
        },
      };
    }

    // 3. Cloud / Archives / History / Trends
    if (q.includes('облак') || q.includes('архив') || q.includes('хран') || q.includes('тренд') || q.includes('истори')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Для долговременного хранения телеметрии OCF Studio поддерживает модуль Historical Access (HA) с буферизацией в кольцевой буфер и периодической пакетной выгрузкой отчетов.\n\nПри объемах более 10 000 тегов рекомендуется архивация во внешнее защищенное хранилище временных рядов (Time-Series).",
        timestamp,
        quickAction: {
          label: "Перейти в Монитор и тренды",
          targetTab: 'monitor',
        },
        recommendation: {
          badge: "Ростелеком Cloud • Аттестованный ЦОД Tier III",
          title: "Индустриальное облако для архивов АСУ ТП и SCADA",
          description: "Гарантированная доступность 99.98%, хранение телеметрии в защищенном контуре по ГОСТ, автоматическое резервирование и защищенный выделенный L2/L3 канал до вашего цеха.",
          serviceType: 'cloud',
          actionText: "Рассчитать емкость облачного хранилища",
        },
      };
    }

    // 4. Remote / M2M / SIM
    if (q.includes('удален') || q.includes('m2m') || q.includes('сим') || q.includes('sim') || q.includes('котельн') || q.includes('связь')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Для удаленных и необслуживаемых объектов (ИТП, скважины, насосные) настройте QueueSize = 20..50 и включите «Discard Oldest = True» в параметрах подписок, чтобы не переполнять буфер шлюза при временных просадках сотовой сети.",
        timestamp,
        quickAction: {
          label: "Настроить параметры очередей",
          targetTab: 'settings',
        },
        recommendation: {
          badge: "Ростелеком M2M/IoT • Защищенный канал",
          title: "Промышленные SIM-карты с выделенным APN и VPN",
          description: "Термостойкие M2M SIM-чипы (-40...+105°C), приоритетный промышленный QoS-трафик и закрытая маршрутизация технологических пакетов напрямую в диспетчерский пункт.",
          serviceType: 'm2m',
          actionText: "Подключить корпоративный M2M тариф",
        },
      };
    }

    // 5. Mobile / Aurora / Tablets
    if (q.includes('мобильн') || q.includes('аврор') || q.includes('планшет') || q.includes('обходчик')) {
      return {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "OCF Studio полностью адаптирован под сенсорные экраны и промышленные планшеты. Инженер обходчик может оперативно просматривать дерево тегов, квитировать аварии и отслеживать показания технологических узлов в режиме реального времени.",
        timestamp,
        recommendation: {
          badge: "ОС «Аврора» (Экосистема Ростелеком)",
          title: "Взрывозащищенные планшеты на базе ОС Аврора",
          description: "Доверенная отечественная мобильная платформа с сертификацией ФСТЭК России. Идеальное решение для мобильных бригад, полевых инженеров и работы во взрывоопасных зонах 1/2.",
          serviceType: 'aurora',
          actionText: "Получить тестовый комплект устройств",
        },
      };
    }

    // Default Fallback
    return {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      text: `Запрос принят: «${query}».\n\nВстроенная база знаний OCF Studio готова предоставить пошаговое руководство. Для быстрого запуска добавьте узел через меню подключений, выберите протокол opc.tcp и удостоверьтесь в корректности политики сертификата.`,
      timestamp,
      quickAction: {
        label: "Перейти к списку подключений",
        targetTab: 'connections',
      },
      recommendation: {
        badge: "Ростелеком Индустриальный Консалтинг",
        title: "Комплексная интеграция и аудит сетей АСУ ТП",
        description: "Эксперты Ростелекома и ГК «Солар» помогут спроектировать архитектуру диспетчеризации, настроить шлюзы конвертации протоколов и аттестовать объект по требованиям безопасности.",
        serviceType: 'security',
        actionText: "Связаться с инженером Ростелеком",
      },
    };
  };

  const handleActionClick = (action: Message['quickAction']) => {
    if (!action) return;
    if (action.targetCategory && onSelectCategory) {
      onSelectCategory(action.targetCategory);
      if (onShowToast) onShowToast(`Открыта категория: ${action.label}`);
    } else if (action.targetTab && onNavigateTab) {
      onNavigateTab(action.targetTab);
      if (onShowToast) onShowToast(`Переход в раздел: ${action.label}`);
    }
  };

  const handleRecommendationAction = (rec: CopilotRecommendation) => {
    if (onShowToast) {
      onShowToast(`Заявка отправлена: ${rec.title}. Менеджер Ростелеком свяжется с вами.`);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    if (onShowToast) onShowToast("Диалог с Copilot очищен");
  };

  return (
    <div className="relative select-none shrink-0 mt-6 mb-1 transition-all duration-300">
      {/* Dark Card Base Container */}
      <div
        className={`bg-[#0e0f14] text-white rounded-[16px] border border-white/10 shadow-[0_12px_36px_rgba(14,15,20,0.22)] relative overflow-hidden transition-all duration-300 ${
          isExpanded ? 'p-5 sm:p-6' : 'px-5 py-4'
        }`}
      >
        {/* Subtle radial ambient glow in corners */}
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-violet-600/15 via-indigo-600/5 to-transparent pointer-events-none rounded-[16px]" />
        <div className="absolute left-0 bottom-0 w-72 h-32 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none rounded-[16px]" />

        {/* ========================================================================= */}
        {/* TOP BAR: Brand Badge, Status, Controls                                   */}
        {/* ========================================================================= */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-3.5">
          {/* Left: Glowing AI Badge & Context */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(124,58,237,0.4)] shrink-0">
              <Sparkle size={16} weight="fill" className="text-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm text-white tracking-tight">
                  OCF Copilot
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-violet-500/20 text-violet-300 border border-violet-500/30 font-sans uppercase tracking-wider">
                  Ростелеком AI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Онлайн
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                Индустриальный ассистент по архитектуре OPC UA, кибербезопасности и телеметрии
              </p>
            </div>
          </div>

          {/* Right: Expand / Minimize / Reset Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isExpanded && (
              <button
                type="button"
                onClick={handleClearChat}
                className="tactile-btn p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                title="Очистить историю диалога"
              >
                <Trash size={14} weight="light" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="tactile-btn px-3 py-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold font-sans flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
              title={isExpanded ? 'Свернуть диалог' : 'Развернуть диалог'}
            >
              <span>{isExpanded ? 'Свернуть' : 'Открыть чат'}</span>
              {isExpanded ? (
                <CaretUp size={12} weight="bold" />
              ) : (
                <CaretDown size={12} weight="bold" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXPANDED DIALOG AREA: Message Feed & Ecosystem Upsell                     */}
        {/* ========================================================================= */}
        {isExpanded && (
          <div className="relative z-10 my-3 pt-3 border-t border-white/10 max-h-[340px] overflow-y-auto pr-1 space-y-4 font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-[12px] p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)]'
                      : 'bg-white/6 text-neutral-200 border border-white/10 backdrop-blur-md'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-sans">{msg.text}</p>

                  {/* Deep Link Action inside Assistant Bubble */}
                  {msg.quickAction && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-neutral-400">Быстрое действие:</span>
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.quickAction)}
                        className="bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-[11px] px-3 py-1 rounded-[6px] transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{msg.quickAction.label}</span>
                        <ArrowRight size={12} weight="bold" />
                      </button>
                    </div>
                  )}

                  {/* Native Rostelecom Ecosystem Recommendation Card */}
                  {msg.recommendation && (
                    <div className="mt-3.5 p-3 rounded-[10px] bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-blue-950/60 border border-violet-500/30 text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
                      <div className="flex items-center gap-2 mb-1.5">
                        {msg.recommendation.serviceType === 'cloud' && (
                          <Cloud size={15} weight="bold" className="text-violet-400 shrink-0" />
                        )}
                        {msg.recommendation.serviceType === 'security' && (
                          <ShieldCheck size={15} weight="bold" className="text-emerald-400 shrink-0" />
                        )}
                        {msg.recommendation.serviceType === 'm2m' && (
                          <Broadcast size={15} weight="bold" className="text-blue-400 shrink-0" />
                        )}
                        {msg.recommendation.serviceType === 'aurora' && (
                          <DeviceMobile size={15} weight="bold" className="text-amber-400 shrink-0" />
                        )}
                        {msg.recommendation.serviceType === 'edge' && (
                          <Cpu size={15} weight="bold" className="text-indigo-400 shrink-0" />
                        )}

                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-300 font-heading">
                          {msg.recommendation.badge}
                        </span>
                      </div>

                      <div className="font-heading font-black text-xs text-white tracking-tight">
                        {msg.recommendation.title}
                      </div>

                      <p className="text-[11px] text-neutral-300 mt-1 leading-normal font-sans">
                        {msg.recommendation.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRecommendationAction(msg.recommendation!)}
                          className="bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-[6px] transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Lightning size={12} weight="bold" />
                          <span>{msg.recommendation.actionText}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                  <span className="text-[9px] text-neutral-500 px-1 font-sans">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 border border-white/10 w-fit">
                <Sparkle size={14} weight="fill" className="text-violet-400 animate-spin" />
                <span className="text-xs text-neutral-400 font-sans">
                  Copilot формулирует технический ответ...
                </span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRESET CHIPS: Quick questions                                             */}
        {/* ========================================================================= */}
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(item.query)}
              className="tactile-btn shrink-0 text-[11px] font-medium font-sans px-3 py-1.5 rounded-[8px] bg-white/5 hover:bg-violet-600/20 text-neutral-300 hover:text-white border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer select-none"
            >
              {item.chip}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* INPUT PROMPT BAR: Interactive command line with glowing focus             */}
        {/* ========================================================================= */}
        <div className="relative z-10 mt-2 flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputQuery);
            }}
            className="flex-1 flex items-center gap-2 bg-neutral-900/90 border border-white/10 rounded-[10px] px-3.5 py-2 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-inner"
          >
            <Sparkle size={16} weight="light" className="text-violet-400 shrink-0" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Спросите Copilot о подключении ПЛК, тегах, шифровании или сервисах Ростелеком..."
              className="bg-transparent text-xs text-white placeholder:text-neutral-500 outline-none w-full font-sans"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className={`p-1.5 rounded-[6px] transition-all cursor-pointer ${
                inputQuery.trim() && !isTyping
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-xs hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-neutral-500 cursor-not-allowed'
              }`}
              title="Отправить запрос (Enter)"
            >
              <PaperPlaneRight size={14} weight="bold" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
