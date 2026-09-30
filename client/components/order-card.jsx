"use client";
import { NO_IMG_PRODUCT } from "@/config/constants";
import { envConfig } from "@/config/env-config";
import SafeImage from "@/components/safe-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaBox,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaEye,
  FaQrcode,
  FaReceipt,
  FaRedo,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaTruck,
  FaUndo,
} from "react-icons/fa";

const OrderCard = ({
  status_pm,
  bill_id,
  bill_productList,
  bill_productPeace,
  order_details,
  bill_totalamount,
  pm_method,
  updateOrderStatus,
  bill_date,
  bill_totalDiscount,
}) => {
  const router = useRouter();

  const handleDetail = () => {
    router.push(`/profile/order-history/detail/${bill_id}`);
  };

  const netTotal = Number(bill_totalamount || 0) - Number(bill_totalDiscount || 0);
  const primaryItem = order_details?.[0];
  const moreItemsCount = Number(bill_productList || 0) - 1;

  const renderStatusBadge = () => {
    switch (status_pm) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs">
            <FaClock size={11} className="text-amber-600" />
            <span>รอยืนยันคำสั่งซื้อ</span>
          </span>
        );
      case "sending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-300/80 shadow-2xs">
            <FaTruck size={11} className="text-sky-600" />
            <span>กำลังจัดส่ง</span>
          </span>
        );
      case "recevied":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-2xs">
            <FaCheckCircle size={11} className="text-emerald-600" />
            <span>ได้รับสินค้าแล้ว</span>
          </span>
        );
      case "cancel":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300/80 shadow-2xs">
            <FaTimesCircle size={11} className="text-rose-600" />
            <span>ยกเลิกคำสั่งซื้อ</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span>{status_pm}</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={handleDetail}
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-amber-300/90 w-full flex flex-col bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden group"
    >
      {/* 1. Header Bar: Order ID, Date, Payment Tag, Status Badge */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-4 bg-[#fbc50e] rounded-full shadow-2xs" />
            <span className="text-xs font-bold text-neutral-400">รหัสคำสั่งซื้อ:</span>
            <span className="text-xs sm:text-sm font-mono font-black text-neutral-900 group-hover:text-[#b48300] transition-colors">
              {bill_id}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 pl-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt size={10} className="text-neutral-400" />
              <span>
                {new Date(bill_date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="flex items-center gap-1.5">
              {pm_method === "QR Promptpay" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <FaQrcode size={10} className="text-amber-600" />
                  <span>QR พร้อมเพย์</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  <FaTruck size={10} className="text-neutral-500" />
                  <span>เก็บเงินปลายทาง (COD)</span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Status Badge & Refund notifications */}
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          {renderStatusBadge()}

          {status_pm === "return_pending" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <FaSearch size={9} />
              <span>อยู่ระหว่างตรวจสอบคำขอคืนเงิน</span>
            </span>
          )}
          {status_pm === "return_sending" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              <FaClock size={9} />
              <span>ร้านค้าอัปโหลดสลิปคืนเงินแล้ว</span>
            </span>
          )}
          {status_pm === "return_confirmed" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <FaCheckCircle size={9} />
              <span>ได้รับเงินคืนแล้ว</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Primary Item Display */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-neutral-200/90 overflow-hidden bg-neutral-100 shrink-0 shadow-2xs group-hover:scale-[1.02] transition-transform">
            <SafeImage
              src={
                primaryItem?.product?.imgs?.[0]?.url
                  ? envConfig.imgURL + primaryItem.product.imgs[0].url
                  : null
              }
              className="w-full h-full object-cover"
              type="product"
              alt={primaryItem?.product?.pro_name || "สินค้า"}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <h3
              className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-amber-900 transition-colors line-clamp-1"
              title={primaryItem?.product?.pro_name}
            >
              {primaryItem?.product?.pro_name || "รายการสินค้า"}
            </h3>

            {primaryItem?.product?.categories?.length > 0 && (
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                หมวดหมู่: {primaryItem.product.categories.map((c) => c?.name).join(", ")}
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1.5 flex-wrap">
              {primaryItem?.color && (
                <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-medium">
                  สี: {primaryItem.color}
                </span>
              )}
              {primaryItem?.size && (
                <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-medium">
                  ขนาด: {primaryItem.size}
                </span>
              )}
              <span className="font-semibold text-neutral-800">
                จำนวน: x{Number(primaryItem?.quantity || 1).toLocaleString()} ชิ้น
              </span>
            </div>
          </div>
        </div>

        {/* Single Item Line Total & More items teaser */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-right shrink-0 border-t sm:border-t-0 border-neutral-100 pt-2 sm:pt-0">
          <span className="text-xs sm:text-sm font-black text-neutral-900 font-mono">
            ฿{Number(primaryItem?.total_amount || 0).toLocaleString()}.-
          </span>
          {moreItemsCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b48300] bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full mt-1">
              <FaBox size={10} />
              <span>+ อีก {moreItemsCount} รายการ</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Bottom Summary & Actions */}
      <div className="p-4 sm:p-5 bg-neutral-50/70 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Net Pay Amount */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-neutral-500 font-medium">
            ยอดรวมสุทธิ ({Number(bill_productPeace || 0)} ชิ้น):
          </span>
          <span className="text-lg sm:text-xl font-black text-[#b48300] font-mono tracking-tight">
            ฿{netTotal.toLocaleString()}.-
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* View Details Button */}
          <button
            type="button"
            onClick={handleDetail}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200/90 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FaEye size={12} className="text-neutral-500" />
            <span>ดูรายละเอียด</span>
            <FaChevronRight size={9} className="text-neutral-400" />
          </button>

          {/* Pending State: Cancel Order */}
          {status_pm === "pending" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus("cancel", bill_id);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FaTimes size={11} />
              <span>ยกเลิกคำสั่งซื้อ</span>
            </button>
          )}

          {/* Sending State: Received Confirmation */}
          {status_pm === "sending" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus("recevied", bill_id);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FaCheck size={11} />
              <span>ได้รับสินค้าแล้ว</span>
            </button>
          )}

          {/* Received or Cancelled State: Buy Again */}
          {(status_pm === "recevied" || status_pm === "cancel") && (
            <Link
              href="/search"
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FaRedo size={10} />
              <span>ซื้ออีกครั้ง</span>
            </Link>
          )}

          {/* Refund Actions for Cancelled PromptPay */}
          {status_pm === "cancel" && pm_method === "QR Promptpay" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus("return_pending", bill_id);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FaUndo size={11} />
              <span>ส่งคำขอคืนเงิน</span>
            </button>
          )}

          {/* Refund Confirmed by Store, Customer Confirms Received Refund */}
          {status_pm === "return_sending" && pm_method === "QR Promptpay" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus("return_confirmed", bill_id);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FaCheckCircle size={11} />
              <span>ได้รับเงินคืนแล้ว</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
