"use client";

import React, { useState, useEffect } from "react";
import { envConfig } from "@/config/env-config";
import {
  NO_IMG_PRODUCT,
  NO_PROFILE,
  NO_CATEGORY,
  NO_SLIP,
} from "@/config/constants";
import {
  FaUser,
  FaImage,
  FaBoxOpen,
  FaFolderOpen,
  FaReceipt,
  FaQrcode,
} from "react-icons/fa6";

/**
 * Normalizes image source:
 * - If src is empty / null / "null" / "undefined" -> returns null
 * - If src starts with http, https, data:, blob:, or / -> returns as-is
 * - Otherwise prepends envConfig.imgURL
 */
export function resolveImageUrl(src) {
  if (!src || typeof src !== "string") return null;
  const trimmed = src.trim();
  if (
    trimmed === "" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "false"
  ) {
    return null;
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  const baseUrl = envConfig.imgURL || "";
  return baseUrl.endsWith("/") || trimmed.startsWith("/")
    ? `${baseUrl}${trimmed}`
    : `${baseUrl}/${trimmed}`;
}

/**
 * Returns default SVG data URI fallback for a given type
 */
export function getDefaultFallbackSrc(type) {
  switch (type) {
    case "avatar":
    case "profile":
    case "user":
      return NO_PROFILE;
    case "category":
    case "ctg":
      return NO_CATEGORY;
    case "slip":
    case "receipt":
      return NO_SLIP;
    case "product":
    default:
      return NO_IMG_PRODUCT;
  }
}

/**
 * SafeImage Component
 * - Automatically handles missing (null/empty), broken (404/network error), and un-prefixed URLs
 * - Renders an aesthetic UI placeholder with contextual icons or fallback SVG
 * - Completely resilient to offline environments and slow networks
 */
export function SafeImage({
  src,
  alt = "image",
  type = "product", // "product" | "avatar" | "category" | "slip" | "banner" | "qr"
  className = "",
  fallbackSrc,
  fallbackIcon,
  fallbackText,
  showFallbackText = false,
  containerClassName = "",
  style = {},
  onClick,
  onLoad,
  onError,
  loading = "lazy",
  ...restProps
}) {
  const resolvedUrl = resolveImageUrl(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error & loaded state whenever the input src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const defaultFallback = fallbackSrc || getDefaultFallbackSrc(type);
  const isFallback = !resolvedUrl || hasError;

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const handleImageLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Render contextual fallback placeholder
  if (isFallback) {
    const isRoundedFull =
      className.includes("rounded-full") ||
      containerClassName.includes("rounded-full");

    const getIcon = () => {
      if (fallbackIcon) return fallbackIcon;
      switch (type) {
        case "avatar":
        case "profile":
        case "user":
          return <FaUser className="opacity-60" />;
        case "category":
        case "ctg":
          return <FaFolderOpen className="opacity-60" />;
        case "slip":
        case "receipt":
          return <FaReceipt className="opacity-60" />;
        case "qr":
          return <FaQrcode className="opacity-60" />;
        case "product":
        default:
          return <FaBoxOpen className="opacity-50" />;
      }
    };

    const getText = () => {
      if (fallbackText) return fallbackText;
      switch (type) {
        case "avatar":
        case "profile":
          return "ไม่มีรูป";
        case "category":
          return "หมวดหมู่";
        case "slip":
          return "ไม่มีสลิป";
        case "qr":
          return "ไม่พบ QR";
        case "product":
        default:
          return "ไม่มีรูปสินค้า";
      }
    };

    return (
      <div
        role="img"
        aria-label={alt}
        onClick={onClick}
        style={style}
        className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 select-none overflow-hidden transition-all duration-200 border border-neutral-200/60 ${
          type === "avatar" ? "bg-slate-100 text-slate-400" : ""
        } ${className} ${containerClassName}`}
        {...restProps}
      >
        <div
          className={`flex items-center justify-center ${
            isRoundedFull ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {getIcon()}
        </div>
        {showFallbackText && !isRoundedFull && (
          <span className="text-[11px] font-medium text-neutral-500 mt-1 tracking-tight text-center px-1 truncate max-w-full">
            {getText()}
          </span>
        )}
      </div>
    );
  }

  // Render real image with error trap and graceful fade-in
  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading={loading}
      onError={handleImageError}
      onLoad={handleImageLoad}
      onClick={onClick}
      style={style}
      className={`transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-90"
      } ${className}`}
      {...restProps}
    />
  );
}

export default SafeImage;
