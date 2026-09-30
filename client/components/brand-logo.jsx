"use client";

import Link from "next/link";
import SafeImage from "./safe-image";

/**
 * BrandLogo component for Furniture Marketplace
 * Supports both high-resolution image asset and ultra-crisp vector SVG
 * 
 * @param {string} theme - "light" (for white backgrounds) or "dark" (for dark backgrounds/sidebar)
 * @param {string} size - "sm" | "md" | "lg"
 * @param {boolean} showText - whether to render text alongside the emblem
 * @param {string} href - link destination (default "/")
 * @param {boolean} useImage - whether to render the AI-generated high-res image logo
 */
export default function BrandLogo({
  theme = "light",
  size = "md",
  showText = true,
  href = "/",
  useImage = false,
  className = "",
}) {
  const isDark = theme === "dark";

  // Size configurations
  const sizes = {
    sm: {
      emblem: "w-8 h-8",
      title: "text-base tracking-tight",
      subtitle: "text-[9px] tracking-[0.2em]",
      imgSize: 32,
    },
    md: {
      emblem: "w-10 h-10",
      title: "text-lg lg:text-xl tracking-tight",
      subtitle: "text-[10px] tracking-[0.25em]",
      imgSize: 42,
    },
    lg: {
      emblem: "w-12 h-12",
      title: "text-2xl tracking-tight",
      subtitle: "text-xs tracking-[0.3em]",
      imgSize: 52,
    },
  };

  const currentSize = sizes[size] || sizes.md;

  const logoContent = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 1. Emblem / Icon Badge */}
      {useImage ? (
        <div
          className={`${currentSize.emblem} rounded-xl overflow-hidden shadow-xs shrink-0 border ${
            isDark ? "border-neutral-800 bg-[#1e1e1e]" : "border-amber-200/60 bg-white"
          }`}
        >
          <img
            src={isDark ? "/logo-dark.jpg" : "/logo.jpg"}
            alt="Furniture Marketplace"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`${currentSize.emblem} rounded-xl shrink-0 flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105 ${
            isDark
              ? "bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/80 shadow-md shadow-black/40"
              : "bg-gradient-to-br from-[#1c1c1e] to-[#111111] border border-neutral-800 shadow-sm"
          }`}
        >
          {/* Stylized Modern House + Armchair SVG Emblem */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#fbc50e" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            {/* House Roofline Outline */}
            <path
              d="M24 6L6 20H11V38C11 39.1 11.9 40 13 40H35C36.1 40 37 39.1 37 38V20H42L24 6Z"
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />
            {/* Chimney */}
            <path
              d="M32 12V8H36V15"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Stylized Modern Armchair / Sofa inside */}
            {/* Backrest */}
            <path
              d="M19 23C19 21.5 20 20.5 21.5 20.5H26.5C28 20.5 29 21.5 29 23V28H19V23Z"
              fill="url(#goldGrad)"
              fillOpacity="0.3"
              stroke="url(#goldGrad)"
              strokeWidth="1.8"
            />
            {/* Left Armrest */}
            <rect
              x="16"
              y="24"
              width="4.5"
              height="8"
              rx="1.5"
              fill="url(#goldGrad)"
            />
            {/* Right Armrest */}
            <rect
              x="27.5"
              y="24"
              width="4.5"
              height="8"
              rx="1.5"
              fill="url(#goldGrad)"
            />
            {/* Seat Cushion */}
            <rect
              x="18"
              y="27"
              width="12"
              height="5"
              rx="1.5"
              fill="url(#goldGrad)"
            />
            {/* Chair Legs */}
            <path
              d="M18 32L16.5 35.5M30 32L31.5 35.5"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* 2. Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black uppercase ${currentSize.title} ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              FURNITURE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbc50e] animate-pulse" />
          </div>
          <span
            className={`font-bold uppercase tracking-widest ${currentSize.subtitle} ${
              isDark ? "text-[#fbc50e]" : "text-[#b48300]"
            }`}
          >
            MARKETPLACE
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
