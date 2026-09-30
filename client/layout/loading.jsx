"use client";

import { useState, useEffect } from "react";
import { FaCouch, FaBed, FaChair } from "react-icons/fa6";

const FURNITURE_ITEMS = [
  { icon: FaCouch, label: "ห้องนั่งเล่น & โซฟา" },
  { icon: FaBed, label: "ห้องนอน & เตียง" },
  { icon: FaChair, label: "เก้าอี้ & ของแต่งบ้าน" },
];

const Loading = ({ text = "กำลังจัดเตรียมเฟอร์นิเจอร์...", subtext }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FURNITURE_ITEMS.length);
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  const ActiveIcon = FURNITURE_ITEMS[currentIndex].icon;
  const activeLabel = subtext || FURNITURE_ITEMS[currentIndex].label;

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md transition-opacity duration-300">
      {/* Furniture Card Container */}
      <div className="relative flex flex-col items-center justify-center px-8 py-7 rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(251,197,14,0.18)] max-w-[280px] w-full mx-4 text-center select-none animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ambient Backlight Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#fbc50e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#fbc50e] animate-pulse" />
          <span className="text-[10px] font-semibold text-neutral-300 tracking-widest uppercase">
            Furniture Marketplace
          </span>
        </div>

        {/* Animated Centerpiece Display */}
        <div className="relative w-28 h-28 flex items-center justify-center my-1">
          {/* Outer dashed rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#fbc50e]/30 animate-[spin_12s_linear_infinite]" />
          
          {/* Inner smooth spinning gold accent ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-[#fbc50e] border-r-[#fbc50e]/70 animate-[spin_1.2s_cubic-bezier(0.55,0.15,0.45,0.85)_infinite]" />
          
          {/* Center Furniture Podium */}
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900/90 border border-neutral-700/70 shadow-inner flex flex-col items-center justify-center overflow-hidden">
            {/* Soft inner radial glow */}
            <div className="absolute inset-0 bg-[#fbc50e]/10 blur-sm rounded-2xl" />

            {/* Cycling Furniture Icon with float bounce */}
            <div
              key={currentIndex}
              className="relative z-10 text-[#fbc50e] transition-all duration-500 ease-out transform animate-[bounce_2s_infinite]"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}
            >
              <ActiveIcon size={30} />
            </div>

            {/* Furniture Shadow on floor */}
            <div className="w-7 h-1 bg-black/50 rounded-full blur-[1px] mt-1" />
          </div>
        </div>

        {/* Text Area */}
        <div className="mt-4 flex flex-col items-center">
          <h3 className="text-white text-base font-medium tracking-wide">
            {text}
          </h3>
          <p className="text-xs text-[#fbc50e] font-light mt-1 h-4 transition-all duration-300">
            {activeLabel}
          </p>
        </div>

        {/* Progress Shimmer Bar */}
        <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden mt-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbc50e] to-transparent w-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
