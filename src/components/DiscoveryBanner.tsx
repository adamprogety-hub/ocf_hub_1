"use client";

import { ArrowRight } from '@phosphor-icons/react';

interface DiscoveryBannerProps {
  href?: string;
}

export const DiscoveryBanner: React.FC<DiscoveryBannerProps> = ({
  href = "https://opcfoundation.org/developer-resources/quickstart/",
}) => {
  const handleOpenLink = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleOpenLink}
      className="relative select-none shrink-0 mt-8 mb-1 group cursor-pointer"
      title="Открыть документацию в новой вкладке"
    >
      {/* Dark Card Base Container */}
      <div className="bg-[#0e0f14] text-white rounded-[16px] px-6 py-4.5 sm:py-5 shadow-[0_12px_32px_rgba(14,15,20,0.14)] relative border border-white/8 transition-all duration-300 group-hover:border-violet-500/30 group-hover:shadow-[0_16px_40px_rgba(14,15,20,0.22)]">
        {/* Subtle radial highlight */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-violet-600/20 to-transparent pointer-events-none rounded-[16px]" />

        {/* Content Layout */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[64px]">
          {/* Left Information Section */}
          <div className="max-w-xs sm:max-w-sm shrink-0 z-20">
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-heading text-white">
              Быстрый старт
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-relaxed">
              Ознакомьтесь с функционалом и начните работать эффективнее
            </p>
          </div>

          {/* Right Action Button (External Link) */}
          <div className="shrink-0 z-20">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-white hover:bg-neutral-100 text-neutral-950 font-extrabold text-xs px-5 sm:px-6 py-2.5 rounded-[8px] transition-all duration-200 hover:scale-102 active:scale-98 shadow-sm flex items-center justify-center gap-2 font-sans group/btn cursor-pointer"
            >
              <span>Быстрый старт</span>
              <ArrowRight
                size={14}
                weight="bold"
                className="group-hover/btn:translate-x-0.5 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>

      {/* 3D Pages: Positioned between description and button, emerging from depth of banner and popping out at top */}
      <div className="absolute left-[320px] sm:left-[350px] md:left-[380px] right-[180px] sm:right-[200px] md:right-[220px] -top-14 sm:-top-16 md:-top-20 bottom-1 pointer-events-none flex items-end justify-center z-30">
        <img
          src="/quick_start_pages.png"
          alt="Быстрый старт"
          className="h-[155px] sm:h-[175px] md:h-[195px] w-auto max-w-full object-contain filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)] group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </div>
    </div>
  );
};

