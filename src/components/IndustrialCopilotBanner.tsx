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
  CaretDown,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FilePdf,
  Plus,
  Chats,
  Check,
} from '@phosphor-icons/react';
import type { HardwareCategoryId } from '@/types/opc';

interface CopilotRecommendation {
  service: string;
  badge: string;
  title: string;
  description: string;
  actionText: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document';
  url: string;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  attachments?: AttachedFile[];
  action?: {
    label: string;
    targetTab?: string;
    targetCategory?: HardwareCategoryId;
  };
  recommendation?: CopilotRecommendation;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
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

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Новый диалог',
    createdAt: 'Сегодня',
    messages: [],
  },
];

export const IndustrialCopilotBanner: React.FC<IndustrialCopilotBannerProps> = ({
  onNavigateTab,
  onSelectCategory,
  onShowToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [isConvMenuOpen, setIsConvMenuOpen] = useState(false);

  const [inputQuery, setInputQuery] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<AttachedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const convMenuRef = useRef<HTMLDivElement | null>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messages = activeConversation.messages;

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 150);
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
  }, [isExpanded, messages, isTyping]);

  // Close conversation switcher popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (convMenuRef.current && !convMenuRef.current.contains(e.target as Node)) {
        setIsConvMenuOpen(false);
      }
    };
    if (isConvMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConvMenuOpen]);

  // Handle ESC key to minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        if (isConvMenuOpen) {
          setIsConvMenuOpen(false);
        } else {
          setIsExpanded(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, isConvMenuOpen]);

  // Create a new conversation
  const handleCreateNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: `Диалог ${conversations.length + 1}`,
      createdAt: 'Только что',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    setIsConvMenuOpen(false);
    setPendingAttachments([]);
    if (onShowToast) onShowToast('Создан новый диалог');
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      // Just clear current messages
      setConversations([
        {
          id: `conv-${Date.now()}`,
          title: 'Новый диалог',
          createdAt: 'Сегодня',
          messages: [],
        },
      ]);
      return;
    }
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConvId === id) {
      setActiveConvId(updated[0].id);
    }
  };

  // Handle file uploads (photos or documents)
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: AttachedFile[] = [];
    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} МБ`
          : `${Math.round(file.size / 1024)} КБ`;

      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: sizeStr,
        type: isImg ? 'image' : 'document',
        url: URL.createObjectURL(file),
      });
    });

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    if (onShowToast) {
      onShowToast(`Прикреплено файлов: ${newAttachments.length}`);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendPrompt = (rawText: string) => {
    const trimmed = rawText.trim();
    if ((!trimmed && pendingAttachments.length === 0) || isTyping) return;

    const currentAttachments = [...pendingAttachments];
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed || (currentAttachments.length > 0 ? 'Анализ прикрепленных материалов' : ''),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    // Update conversation title if it is the first user message
    const hasExistingMessages = messages.length > 0;
    const autoTitle = trimmed.length > 30 ? `${trimmed.slice(0, 30)}...` : trimmed || 'Анализ файлов';

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            title: hasExistingMessages ? c.title : autoTitle,
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      })
    );

    setInputQuery('');
    setPendingAttachments([]);
    if (!isExpanded) setIsExpanded(true);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAnswer(trimmed, currentAttachments);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, response],
            };
          }
          return c;
        })
      );
      setIsTyping(false);
    }, 600);
  };

  const generateAnswer = (query: string, attached: AttachedFile[]): Message => {
    const q = query.toLowerCase();

    // If attachments present, tailor answer to uploaded materials
    if (attached.length > 0) {
      const hasImage = attached.some((a) => a.type === 'image');
      const hasDoc = attached.some((a) => a.type === 'document');

      if (hasImage && hasDoc) {
        return {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: `Файлы успешно обработаны: проанализированы фото узла автоматики и сопроводительная спецификация.\n\n• На схеме подтверждено соответствие портов Profinet/OPC UA (TCP 4840).\n• Карта регистров совпадает со стандартной структурой NodeId для промышленных контроллеров.\n• Рекомендуем запустить автообнаружение узлов в сети.`,
          action: {
            label: "Открыть раздел ПЛК",
            targetCategory: 'plc',
          },
          recommendation: {
            service: "Edge",
            badge: "Ростелеком Экосистема",
            title: "Аппаратная верификация конфигураций",
            description: "Инженеры Ростелеком могут выполнить удалённую валидацию схем шкафов автоматики и параметров сетевых экранов.",
            actionText: "Запросить инженерную консультацию",
          },
        };
      }

      if (hasImage) {
        return {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: `Изображение «${attached[0].name}» проанализировано встроенным зрением Copilot:\n\n• Идентифицирован технологический модуль с Ethernet-интерфейсом.\n• Индикация питания в норме, активен статус готовности сетевого стека.\n• Для опроса переменных укажите адрес шлюза в формате opc.tcp://10.0.x.x:4840.`,
          action: {
            label: "Создать подключение к устройству",
            targetTab: 'connections',
          },
          recommendation: {
            service: "Security",
            badge: "ГК «Солар»",
            title: "Контроль физического и сетевого периметра",
            description: "Мониторинг технологических шкафов и каналов связи с ПЛК для защиты от несанкционированного прямого подключения.",
            actionText: "Подключить периметральную защиту",
          },
        };
      }

      if (hasDoc) {
        return {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: `Документ «${attached[0].name}» разобран:\n\n• Извлечены параметры протокола OPC UA v1.04 и перечень сигналов.\n• Рекомендуемый период опроса (Publishing Interval): 250 мс, глубина очереди QueueSize = 20.\n• Переменные готовы к автоматическому маппингу в пространство адресов.`,
          action: {
            label: "Перейти в Настройки системы",
            targetTab: 'settings',
          },
          recommendation: {
            service: "Cloud",
            badge: "Ростелеком Cloud",
            title: "Импорт карт регистров в защищенный архив",
            description: "Автоматическая синхронизация схемы тегов с облачным хранилищем телеметрии Ростелеком ЦОД Tier III.",
            actionText: "Связать с облачным репозиторием",
          },
        };
      }
    }

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
      {/* Hidden File Input for uploading documents and photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        accept="image/*,.pdf,.doc,.docx,.xml,.pcap,.txt,.json,.csv"
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 1. COLLAPSED DOCKED BAR (At the bottom of the page)                        */}
      {/* ========================================================================= */}
      <div
        className={`relative z-10 shrink-0 mt-3 select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded
            ? 'opacity-0 scale-[0.98] pointer-events-none'
            : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        <div
          onClick={() => setIsExpanded(true)}
          className="group h-[56px] rounded-[14px] bg-[#0c0d12] hover:bg-[#11131c] border border-white/10 hover:border-violet-500/40 transition-all duration-200 px-3.5 sm:px-4 flex items-center justify-between gap-3 cursor-pointer shadow-sm"
        >
          {/* Left: Clean Greeting Input Trigger (No avatars or logos) */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white font-heading tracking-tight truncate">
                Привет, какой план на сегодня?
              </span>
              <span className="text-[11px] text-neutral-400 font-sans tracking-tight truncate">
                Спросите ассистента, загрузите схему или выберите быстрый сценарий...
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
      {/* 2. EXPANDED DIALOG (Opens upwards with smooth aesthetic cubic-bezier)      */}
      {/*    Continuous living background with pure CSS mask-image fade!            */}
      {/* ========================================================================= */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`absolute inset-0 z-40 bg-[#0c0d12] text-white rounded-[16px] border flex flex-col justify-between overflow-hidden select-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDragging ? 'border-violet-500 ring-2 ring-violet-500/40' : 'border-white/10'
        } ${
          isExpanded
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-[0.97] pointer-events-none'
        }`}
      >
        {/* Living Orbital Blurred Background Circles (Violet & Radiant Orange) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[16px] z-0">
          {/* Orbital Circle 1: Deep Violet Aurora (Orbits in circle & gently pulses) */}
          <div
            className="animate-orbit-violet absolute top-0 -right-8 w-[520px] h-[520px] filter blur-[80px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.85) 0%, rgba(139, 92, 246, 0.55) 45%, rgba(99, 102, 241, 0.18) 75%, transparent 100%)',
            }}
          />

          {/* Orbital Circle 2: Warm Radiant Orange (Orbits in circle & gently pulses) */}
          <div
            className="animate-orbit-orange absolute bottom-0 -left-6 w-[500px] h-[500px] filter blur-[80px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255, 120, 0, 0.85) 0%, rgba(249, 115, 22, 0.55) 45%, rgba(251, 146, 60, 0.18) 75%, transparent 100%)',
            }}
          />
        </div>

          {/* ----------------------------------------------------------------------- */}
          {/* HEADER: Pure Minimalist Title + Multi-Dialog Switcher                   */}
          {/* ----------------------------------------------------------------------- */}
          <div className="relative z-30 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
            {/* Left: OCF Copilot + Multi-Chat Switcher */}
            <div className="flex items-center gap-3">
              <span className="font-heading font-black text-sm tracking-tight text-white select-none">
                OCF Copilot
              </span>

              {/* Multi-dialog dropdown trigger */}
              <div className="relative" ref={convMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsConvMenuOpen(!isConvMenuOpen)}
                  className="tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-sans text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Управление диалогами"
                >
                  <Chats size={13} weight="light" className="text-violet-400" />
                  <span className="max-w-[140px] truncate text-[11px] font-medium">
                    {activeConversation.title}
                  </span>
                  <CaretDown size={10} weight="bold" className="text-neutral-400" />
                </button>

                {/* Dropdown Popover */}
                {isConvMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-[12px] bg-[#12141c]/95 backdrop-blur-xl border border-white/12 shadow-[0_16px_36px_rgba(0,0,0,0.55)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-white/8 text-[11px] font-bold text-neutral-400 font-sans">
                      <span>Диалоги ({conversations.length})</span>
                      <button
                        type="button"
                        onClick={handleCreateNewConversation}
                        className="text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} weight="bold" />
                        <span>Новый</span>
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {conversations.map((conv) => {
                        const isActive = conv.id === activeConvId;
                        return (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setActiveConvId(conv.id);
                              setIsConvMenuOpen(false);
                            }}
                            className={`group/item flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-xs font-sans cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-violet-600/30 text-white font-medium border border-violet-500/40'
                                : 'hover:bg-white/5 text-neutral-300 hover:text-white'
                            }`}
                          >
                            <span className="truncate max-w-[170px]">{conv.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {isActive && <Check size={12} weight="bold" className="text-violet-400" />}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-rose-400 transition-opacity cursor-pointer"
                                title="Удалить диалог"
                              >
                                <Trash size={12} weight="light" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick + New dialog button */}
              <button
                type="button"
                onClick={handleCreateNewConversation}
                className="tactile-btn p-1.5 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Создать новый диалог"
              >
                <Plus size={12} weight="bold" />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setConversations((prev) =>
                      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [] } : c))
                    );
                  }}
                  className="tactile-btn p-2 rounded-[8px] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Очистить сообщения диалога"
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

          {/* ----------------------------------------------------------------------- */}
          {/* CHAT BODY: Scrollable Canvas with Pure Mask-Image Smooth Fade            */}
          {/*    (Zero cut-off rectangles! Messages dissolve seamlessly into dark)    */}
          {/* ----------------------------------------------------------------------- */}
          <div
            ref={chatScrollRef}
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 36px), transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 36px), transparent 100%)',
            }}
            className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5 font-sans"
          >
            {/* If no messages yet: Pure Clean greeting without avatars or logos */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center max-w-lg mx-auto py-6 text-center animate-in fade-in duration-300">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
                  Привет, какой план на сегодня?
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed mb-6">
                  Задайте вопрос по подключению ПЛК, политикам шифрования X.509 или загрузите схему/паспорт оборудования:
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
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[78%] rounded-[14px] p-4 text-xs leading-relaxed font-sans ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white/[0.05] text-neutral-200 border border-white/10'
                  }`}
                >
                  {/* Uploaded attachments preview inside message bubble */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {msg.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="rounded-[8px] overflow-hidden border border-white/15 bg-black/30 p-1 flex items-center gap-2 max-w-full"
                        >
                          {file.type === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded-[6px]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-[6px] bg-white/10 flex items-center justify-center shrink-0">
                              <FilePdf size={18} weight="light" className="text-rose-400" />
                            </div>
                          )}
                          <div className="pr-2 min-w-0">
                            <div className="text-[11px] font-bold text-white truncate max-w-[140px]">
                              {file.name}
                            </div>
                            <div className="text-[9px] text-neutral-300">{file.size}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
              <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-white/[0.04] border border-white/8 text-neutral-400 text-xs w-fit">
                <Sparkle size={13} weight="fill" className="text-violet-400 animate-spin" />
                <span>Формирую ответ...</span>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* FOOTER: Crisp White Island Input Bar (Maximum Contrast & Clean Rhythm)  */}
          {/* ----------------------------------------------------------------------- */}
          <div className="relative z-20 px-5 sm:px-6 pb-4 pt-2 shrink-0">
            {/* Pending Attachments Strip */}
            {pendingAttachments.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-2 animate-in fade-in duration-150">
                {pendingAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 bg-white/95 border border-white/20 rounded-[8px] pl-2.5 pr-2 py-1 text-xs text-[#0f172a] shadow-md backdrop-blur-md"
                  >
                    {file.type === 'image' ? (
                      <ImageIcon size={14} weight="bold" className="text-violet-600" />
                    ) : (
                      <FileText size={14} weight="bold" className="text-blue-600" />
                    )}
                    <span className="max-w-[130px] truncate text-[11px] font-semibold">{file.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{file.size}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="p-1 hover:text-rose-600 text-neutral-400 cursor-pointer transition-colors"
                      title="Удалить"
                    >
                      <X size={11} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(inputQuery);
              }}
              className="flex items-center gap-2.5 bg-white rounded-[13px] px-3.5 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] focus-within:ring-2 focus-within:ring-violet-500/40 transition-all border border-white/80"
            >
              {/* Paperclip attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="tactile-btn p-1.5 rounded-[7px] hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
                title="Прикрепить документы или фотографии"
              >
                <Paperclip size={16} weight="light" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Задайте вопрос, загрузите схему/паспорт оборудования или фото узла..."
                className="bg-transparent text-xs text-[#0f172a] placeholder:text-neutral-400 outline-none w-full font-sans font-medium"
              />

              <button
                type="submit"
                disabled={(!inputQuery.trim() && pendingAttachments.length === 0) || isTyping}
                className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  (inputQuery.trim() || pendingAttachments.length > 0) && !isTyping
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs hover:scale-105 active:scale-95'
                    : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                }`}
                title="Отправить (Enter)"
              >
                <ArrowUp size={13} weight="bold" />
              </button>
            </form>
          </div>
        </div>
    </>
  );
};
