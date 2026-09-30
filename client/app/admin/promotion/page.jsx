"use client";
import MyDatePicker from "@/components/date-picker";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import PromotionCard from "@/components/promotion-card";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { debounce } from "lodash";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  FaBox,
  FaCalendar,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaFolder,
  FaPercent,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTag,
  FaTags,
  FaTimes,
  FaUndo,
} from "react-icons/fa";
import { NO_IMG_PRODUCT } from "@/config/constants";
import SafeImage from "@/components/safe-image";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [promotionStart, setPromotionStart] = useState();
  const [promotionEnd, setPromotionEnd] = useState();
  const [promotionDetail, setPromotionDetai] = useState(null);
  const [loading, setLoading] = useState(false);
  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const [avgPromotion, setAvgPromotion] = useState();
  const getAvg = async () => {
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/promotion-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setAvgPromotion(res.data);
        setTotal(res?.data?.total);
        setTotalPage(res?.data?.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };
  useEffect(() => {
    getAvg();
  }, []);

  const [promotions, setPromotions] = useState([]);
  const fetchPromotions = async (
    page,
    search,
    sort,
    promotionStart,
    promotionEnd
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/promotions", {
        withCredentials: true,
        params: {
          page,
          search,
          sort,
          promotionStart,
          promotionEnd,
          take: 20,
        },
      });
      if (res.status === 200) {
        setPromotions(res.data?.data);
        setTotal(res?.data?.total);
        setTotalPage(res?.data?.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce(fetchPromotions, 700),
    [fetchPromotions]
  );

  useEffect(() => {
    debounceSearch(page, search, sort, promotionStart, promotionEnd);
  }, [page, search, sort, promotionStart, promotionEnd]);

  const deletePromotion = async (id) => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ลบโปรโมชัน",
      "ต้องการลบโปรโมชันนี้หรือไม่?",
      "ลบ"
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-promotion/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        fetchPromotions(page, search, sort, promotionStart, promotionEnd);
        getAvg();
        popup.success("ลบข้อมูลแล้ว");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const [geting, setGeting] = useState(false);
  const getPromotionDetail = async (id) => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + `/admin/promotion/${id}`, {
        withCredentials: true,
      });
      setPromotionDetai(res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };

  const displayStatus = (start_date, end_date) => {
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

  const status = displayStatus(
    promotionDetail?.start_date,
    promotionDetail?.end_date
  );

  const statusConfig = {
    1: {
      label: "กำลังใช้งาน",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    2: {
      label: "หมดอายุ",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
    3: {
      label: "ใกล้หมดอายุ",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig[1];

  const activeCount = useMemo(() => {
    const today = new Date();
    return promotions.filter((p) => {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      return today >= start && today <= end;
    }).length;
  }, [promotions]);

  const expiringCount = useMemo(() => {
    const today = new Date();
    return promotions.filter((p) => {
      const end = new Date(p.end_date);
      const diffDays = (end - today) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 5;
    }).length;
  }, [promotions]);

  const clearFilters = () => {
    setSearch("");
    setSort(JSON.stringify({ createdAt: "desc" }));
    setPromotionStart(undefined);
    setPromotionEnd(undefined);
    setPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">
              จัดการโปรโมชัน & ส่วนลด
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold">
              Promotions & Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-5">
            สร้างแคมเปญส่วนลดและดีลพิเศษ Furniture Marketplace เพื่อกระตุ้นยอดขาย
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              fetchPromotions(page, search, sort, promotionStart, promotionEnd);
              getAvg();
            }}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors active:scale-95 cursor-pointer"
            title="รีเฟรชข้อมูล"
          >
            <FaSyncAlt size={12} className={loading ? "animate-spin text-[#b48300]" : "text-neutral-500"} />
            <span>รีเฟรช</span>
          </button>
          <Link
            href="/admin/promotion/0"
            className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 shadow-xs transition-all active:scale-[0.98]"
          >
            <FaPlus size={12} />
            <span>สร้างโปรโมชันใหม่</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Promotions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit border border-amber-200/60">
              โปรโมชันทั้งหมด
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(avgPromotion?.allPromotion || total || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/70">
            <FaTags size={18} />
          </div>
        </div>

        {/* Card 2: Active Promotions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit border border-emerald-200/60">
              กำลังเปิดใช้งาน
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(activeCount || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/70">
            <FaPercent size={16} />
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full w-fit border border-amber-300">
              ใกล้หมดอายุ (5 วัน)
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(expiringCount || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
            <FaClock size={16} />
          </div>
        </div>

        {/* Card 4: Products In Promotion */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-violet-800 bg-violet-50 px-2.5 py-0.5 rounded-full w-fit border border-violet-200/60">
              สินค้าร่วมรายการ
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(avgPromotion?.allProductInPromotion || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-200/70">
            <FaBox size={18} />
          </div>
        </div>
      </div>

      {/* Main Content Box: Search & Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col overflow-hidden">
        <div className="p-5 md:p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all text-neutral-900 placeholder:text-neutral-400"
                placeholder="ค้นหาชื่อโปรโมชัน รายละเอียดส่วนลด..."
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <FaTimes size={11} />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              value={sort}
              className="text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
            >
              <option value={JSON.stringify({ createdAt: "desc" })}>เรียง: เพิ่มล่าสุด</option>
              <option value={JSON.stringify({ products: { _count: "desc" } })}>เรียง: สินค้าร่วมรายการมากสุด</option>
              <option value={JSON.stringify({ updatedAt: "desc" })}>เรียง: แก้ไขล่าสุด</option>
            </select>
          </div>

          {/* Date Pickers & Reset */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <MyDatePicker
                setDate={(d) => {
                  setPromotionStart(d);
                  setPage(1);
                }}
                date={promotionStart}
                placeholderText="วันเริ่มต้น"
              />
              <span className="text-neutral-300">—</span>
              <MyDatePicker
                setDate={(d) => {
                  setPromotionEnd(d);
                  setPage(1);
                }}
                date={promotionEnd}
                placeholderText="วันสิ้นสุด"
              />
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="px-3.5 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ล้างตัวกรองทั้งหมด"
            >
              <FaUndo size={11} className="text-neutral-400" />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        </div>

        {/* Promotion Cards Grid Container */}
        <div className="p-5 md:p-6 bg-neutral-50/40">
          <div className="w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-2 py-20 text-neutral-400">
                <div className="w-9 h-9 border-3 border-amber-200 border-t-[#fbc50e] rounded-full animate-spin" />
                <p className="text-xs text-neutral-500 mt-2">กำลังโหลดข้อมูลโปรโมชัน...</p>
              </div>
            ) : promotions.length > 0 ? (
              promotions.map((p) => (
                <PromotionCard
                  key={p?.id}
                  {...p}
                  onDelete={() => deletePromotion(p?.id)}
                  onView={() => getPromotionDetail(p?.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60 shadow-2xs">
                  <FaFolder size={26} />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-neutral-800">
                    {search || promotionStart || promotionEnd
                      ? "ไม่พบโปรโมชันที่ตรงกับเงื่อนไข"
                      : "ยังไม่มีโปรโมชันในระบบ"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                    {search || promotionStart || promotionEnd
                      ? "ลองปรับเปลี่ยนคำค้นหา หรือล้างช่วงวันที่เพื่อค้นหาใหม่อีกครั้ง"
                      : "เริ่มต้นสร้างแคมเปญส่วนลดเฟอร์นิเจอร์ชิ้นแรกเพื่อกระตุ้นยอดขาย"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar: Results count + Pagination */}
        <div className="p-4 md:px-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            ผลการค้นหา{" "}
            <span className="font-semibold text-neutral-800">
              {total?.toLocaleString() || 0}
            </span>{" "}
            รายการโปรโมชัน
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={10} />
              <span>ก่อนหน้า</span>
            </button>
            <span className="px-3 py-1.5 font-bold text-neutral-800 bg-neutral-100 rounded-xl">
              {page} / {totalPage || 1}
            </span>
            <button
              onClick={forwardPage}
              disabled={page >= totalPage}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>ถัดไป</span>
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Promotion Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 bg-white rounded-3xl border border-neutral-200/90 shadow-2xl flex flex-col gap-5">
          {/* Modal Header */}
          <div className="w-full pb-4 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  รายละเอียดโปรโมชัน
                </h2>
                <p className="text-xs text-neutral-500">
                  ข้อมูลแคมเปญส่วนลดและรายการสินค้าเฟอร์นิเจอร์ที่ร่วมรายการ
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Promotion Info Card */}
          <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-neutral-900">
                {promotionDetail?.name}
              </h3>
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text} border ${currentStatus.border}`}
              >
                {currentStatus.label}
              </span>
            </div>

            {promotionDetail?.description && (
              <p className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                💡 <span className="font-semibold">รายละเอียด:</span> {promotionDetail.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Discount */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <FaPercent size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-neutral-400">ส่วนลด</span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    {Number(promotionDetail?.discount || 0).toLocaleString()}%
                  </span>
                </div>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/70">
                  <FaCalendar size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-neutral-400">วันเริ่มต้น</span>
                  <span className="text-xs font-bold text-neutral-800">
                    {promotionDetail?.start_date
                      ? new Date(promotionDetail.start_date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/70">
                  <FaCalendar size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-neutral-400">วันสิ้นสุด</span>
                  <span className="text-xs font-bold text-neutral-800">
                    {promotionDetail?.end_date
                      ? new Date(promotionDetail.end_date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products in Promotion */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaBox size={14} className="text-[#b48300]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  สินค้าที่ร่วมรายการ
                </h3>
              </div>
              <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200/60">
                {promotionDetail?.products?.length || 0} รายการ
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto p-1">
              {promotionDetail?.products?.map((p) => {
                const discountedPrice = Math.round(
                  p.pro_price - (Number(promotionDetail.discount) / 100) * p.pro_price
                );
                return (
                  <div
                    key={p?.pro_id}
                    className="rounded-2xl border border-neutral-200/90 bg-white shadow-2xs overflow-hidden hover:shadow-xs transition-shadow flex flex-col"
                  >
                    <div className="relative h-28 bg-neutral-100 flex items-center justify-center overflow-hidden">
                      <SafeImage
                        src={
                          p?.imgs?.[0]
                            ? envConfig.imgURL + p.imgs[0].url
                            : null
                        }
                        className="w-full h-full object-cover"
                        type="product"
                        alt={p?.pro_name || "สินค้า"}
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                        -{promotionDetail?.discount}%
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1 justify-between">
                      <p className="text-xs font-bold text-neutral-900 truncate" title={p?.pro_name}>
                        {p?.pro_name}
                      </p>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-[11px] text-neutral-400 line-through">
                          ฿{p?.pro_price?.toLocaleString()}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-600">
                          ฿{discountedPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Button Footer */}
          <div className="pt-3 border-t border-neutral-100 flex justify-end">
            <Link
              href={`/admin/promotion/${promotionDetail?.id}`}
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 shadow-xs transition-all active:scale-[0.98]"
            >
              <FaTag size={11} />
              <span>แก้ไขโปรโมชันนี้</span>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Page;
