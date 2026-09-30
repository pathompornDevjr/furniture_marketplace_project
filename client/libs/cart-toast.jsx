"use client";
import React from "react";
import { toast } from "react-toastify";
import { FaCheckCircle, FaShoppingCart, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { envConfig } from "@/config/env-config";
import Link from "next/link";

export const showCartToast = ({ product, option, count = 1 }) => {
  const imgUrl = product?.imgs?.[0]?.url
    ? envConfig.imgURL + product.imgs[0].url
    : null;

  const hasDiscount = product?.promotion?.discount && Number(product.promotion.discount) > 0;
  const unitPrice = hasDiscount
    ? product.pro_price - Math.round((Number(product.promotion.discount) / 100) * product.pro_price)
    : Number(product?.pro_price || 0);

  const totalPrice = unitPrice * count;

  return toast(
    ({ closeToast }) => (
      <div className="flex items-start gap-3 w-full font-sans text-neutral-800">
        {/* Product Thumbnail */}
        <div className="w-13 h-13 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/90 shrink-0 flex items-center justify-center shadow-2xs">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product?.pro_name || "สินค้า"}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaShoppingCart className="text-neutral-400" size={18} />
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs">
            <FaCheckCircle size={13} className="shrink-0 text-emerald-500" />
            <span>เพิ่มลงในรถเข็นสำเร็จ!</span>
          </div>

          <p className="text-xs font-bold text-neutral-900 truncate mt-1 leading-snug" title={product?.pro_name}>
            {product?.pro_name || "สินค้า"}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 flex-wrap">
            {option?.color && (
              <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-medium">
                สี: {option.color}
              </span>
            )}
            {option?.size && (
              <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-medium">
                ขนาด: {option.size}
              </span>
            )}
            <span className="font-semibold text-neutral-700">
              {count} {product?.unit || "ชิ้น"}
            </span>
          </div>

          {/* Quick link button to view cart */}
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-black text-neutral-950 font-mono">
              ฿{totalPrice.toLocaleString()}.-
            </span>
            <a
              href="/cart"
              onClick={closeToast}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-950 hover:bg-[#eab308] bg-[#fbc50e] px-3 py-1 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <span>ดูรถเข็น</span>
              <FaArrowRight size={9} />
            </a>
          </div>
        </div>
      </div>
    ),
    {
      icon: false,
      autoClose: 3500,
      className: "!rounded-2xl !border !border-neutral-200/90 !shadow-2xl !bg-white/95 !backdrop-blur-md !p-3.5 !min-w-[310px] sm:!min-w-[340px]",
      bodyClassName: "!p-0 !m-0",
      progressClassName: "!bg-[#fbc50e]",
    }
  );
};

export const showWarningToast = (message) => {
  return toast.warning(message, {
    autoClose: 3000,
    className: "!rounded-2xl !border !border-amber-300 !shadow-xl !bg-amber-50/95 !text-amber-950 !font-bold !text-xs !p-3.5",
    progressClassName: "!bg-amber-500",
  });
};

export const showErrorToast = (message) => {
  return toast.error(message, {
    autoClose: 3000,
    className: "!rounded-2xl !border !border-rose-300 !shadow-xl !bg-rose-50/95 !text-rose-950 !font-bold !text-xs !p-3.5",
    progressClassName: "!bg-rose-500",
  });
};

export const showSuccessToast = (message) => {
  return toast.success(message, {
    autoClose: 3000,
    className: "!rounded-2xl !border !border-emerald-300 !shadow-xl !bg-emerald-50/95 !text-emerald-950 !font-bold !text-xs !p-3.5",
    progressClassName: "!bg-emerald-500",
  });
};
