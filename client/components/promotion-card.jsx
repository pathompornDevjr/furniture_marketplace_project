"use client";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaTag,
  FaTrash,
  FaEdit,
  FaEye,
  FaBox,
} from "react-icons/fa";

export default function PromotionCard({
  id,
  name,
  start_date,
  end_date,
  discount,
  _count,
  description,
  onDelete,
  onView,
}) {
  const displayStatus = () => {
    const today = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end - today < 5) {
      return 3;
    } else if (today >= end) {
      return 2;
    } else if (today >= start) {
      return 1;
    }
  };

  const status = displayStatus();

  const statusConfig = {
    1: {
      label: "กำลังใช้งาน",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    2: {
      label: "หมดอายุ",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
    3: {
      label: "ใกล้หมดอายุ",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig[1];

  return (
    <div className="group bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-5 transition-all duration-200 hover:shadow-md hover:border-amber-300 flex flex-col justify-between gap-3.5">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#b48300] transition-colors truncate" title={name}>
            {name}
          </h3>
          {description && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate" title={description}>
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onView}
            className="p-1.5 rounded-lg hover:bg-amber-50 text-neutral-400 hover:text-[#b48300] transition-colors cursor-pointer"
            title="ดูรายละเอียด"
          >
            <FaEye size={13} />
          </button>
          <Link
            href={`/admin/promotion/${id}`}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            title="แก้ไข"
          >
            <FaEdit size={13} />
          </Link>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-neutral-400 transition-colors cursor-pointer"
            title="ลบโปรโมชัน"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <span
        className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentStatus.bg} ${currentStatus.text} border ${currentStatus.border}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}
        ></span>
        {currentStatus.label}
      </span>

      {/* Info Grid */}
      <div className="flex flex-col gap-2 pt-2.5 border-t border-neutral-100 text-xs">
        {/* Discount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FaTag size={10} />
            </div>
            <span>ส่วนลด</span>
          </div>
          <span className="font-extrabold text-emerald-600 text-sm">
            {discount}%
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60">
              <FaCalendarAlt size={10} />
            </div>
            <span>ระยะเวลา</span>
          </div>
          <span className="font-medium text-neutral-600 text-[11px]">
            {new Date(start_date).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
            })}{" "}
            -{" "}
            {new Date(end_date).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        {/* Products count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <FaBox size={10} />
            </div>
            <span>สินค้าร่วมรายการ</span>
          </div>
          <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200/60 text-[11px]">
            {_count?.products || 0} ชิ้น
          </span>
        </div>
      </div>
    </div>
  );
}
