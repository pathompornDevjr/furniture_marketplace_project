"use client";

import Loader from "@/components/loader";
import OrderCard from "@/components/order-card";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { debounce } from "lodash";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaBoxes,
  FaCheckCircle,
  FaClock,
  FaFolderOpen,
  FaList,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaTimesCircle,
  FaTruck,
} from "react-icons/fa";
import { v4 as uuid } from "uuid";

const Page = () => {
  const [orderStatus, setOrderStatus] = useState("all");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [search, setSearch] = useState("");

  const menus = [
    {
      id: 1,
      title: "ทั้งหมด",
      status: "all",
      icon: <FaBoxes size={12} />,
    },
    {
      id: 2,
      title: "รอยืนยัน",
      status: "pending",
      icon: <FaClock size={11} />,
    },
    {
      id: 3,
      title: "กำลังจัดส่ง",
      status: "sending",
      icon: <FaTruck size={11} />,
    },
    {
      id: 4,
      title: "ได้รับแล้ว",
      status: "recevied",
      icon: <FaCheckCircle size={11} />,
    },
    {
      id: 5,
      title: "ยกเลิกแล้ว",
      status: "cancel",
      icon: <FaTimesCircle size={11} />,
    },
  ];

  const [orderHistoryList, setOrderHostoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderHistory = async (status, sort, search) => {
    setLoading(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + "/user/get-order-history",
        {
          withCredentials: true,
          params: {
            status,
            sort,
            search,
          },
        }
      );
      if (res.status === 200) {
        setOrderHostoryList(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce((st, so, se) => fetchOrderHistory(st, so, se), 400),
    []
  );

  useEffect(() => {
    if (search && search.trim()) {
      debounceSearch(orderStatus, sort, search);
      return () => debounceSearch.cancel();
    } else {
      debounceSearch.cancel();
      fetchOrderHistory(orderStatus, sort, "");
    }
  }, [orderStatus, sort, search]);

  const handleUpdateOrderStatus = async (status, orderId) => {
    const { isConfirmed } = await popup.confirmPopUp(
      status === "cancel"
        ? "ยกเลิกคำสั่งซื้อนี้"
        : status === "recevied"
        ? "ฉันได้รับสินค้าแล้ว"
        : status === "return_pending"
        ? "ยืนยันส่งคำขอคืนเงิน"
        : "ได้รับเงินคืนแล้ว",
      status === "cancel"
        ? "ต้องการยกเลิกคำสั่งซื้อนี้หรือไม่"
        : status === "recevied"
        ? "กดยืนยันหากคุณได้รับสินค้าแล้ว"
        : status === "return_pending"
        ? "คุณต้องการส่งคำขอคืนเงินใช่หรือไม่"
        : "ฉันได้ตรวจสอบและได้รับเงินคืนแล้ว",
      status === "cancel" ? "ยกเลิกคำสั่งซื้อ" : "ยืนยัน"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + `/user/update-order-status`,
        { status, orderId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success(
          status === "cancel"
            ? "ยกเลิกออเดอร์แล้ว"
            : status === "recevied"
            ? "ขอบคุณที่ไว้ใจใช้บริการของเรา"
            : status === "return_pending"
            ? "ระบบได้รับคำขอคืนเงินของคุณแล้ว จะทำการตรวจสอบและติดต่อกลับโดยเร็วที่สุด"
            : "ขอบคุณที่ไว้ใจใช้บริการของเรา"
        );
        fetchOrderHistory(orderStatus, sort, search);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 w-full border-b border-neutral-200/80 gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-lg sm:text-xl font-black text-neutral-900">
              ประวัติการสั่งซื้อ
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1 pl-5">
            ตรวจสอบรายการคำสั่งซื้อ ติดตามสถานะการจัดส่งพัสดุ และประวัติการชำระเงิน
          </p>
        </div>
      </div>

      {/* 2. Modern Status Tabs Navigation */}
      <div className="w-full flex items-center border-b border-neutral-200/90 gap-1 overflow-x-auto pb-px">
        {menus.map((m) => {
          const isActive = orderStatus === m.status;
          return (
            <button
              key={m.id}
              onClick={() => setOrderStatus(m.status)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#fbc50e] text-neutral-950 bg-amber-50/50"
                  : "border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <span className={isActive ? "text-[#b48300]" : "text-neutral-400"}>
                {m.icon}
              </span>
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar & Sort Dropdown */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="w-full sm:w-80 rounded-2xl border border-neutral-200/90 p-2.5 px-3.5 flex items-center gap-2.5 bg-white focus-within:border-[#fbc50e] focus-within:ring-2 focus-within:ring-[#fbc50e]/20 transition-all shadow-2xs">
          <FaSearch className="text-neutral-400 shrink-0" size={13} />
          <input
            type="text"
            className="w-full text-xs sm:text-sm outline-none text-neutral-800 placeholder-neutral-400 bg-transparent"
            placeholder="ค้นหาตามรหัสคำสั่งซื้อ หรือชื่อสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div title="เรียงลำดับ" className="relative inline-block shrink-0">
          <select
            onChange={(e) => setSort(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            defaultValue={sort}
          >
            <option value={JSON.stringify({ createdAt: "desc" })}>
              คำสั่งซื้อล่าสุด
            </option>
            <option value={JSON.stringify({ createdAt: "asc" })}>
              คำสั่งซื้อเก่าที่สุด
            </option>
          </select>
          <div className="p-2.5 px-4 rounded-2xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-800 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs sm:text-sm font-bold">
            <FaList size={13} className="text-neutral-500" />
            <span>เรียงตามลำดับ</span>
          </div>
        </div>
      </div>

      {/* 4. Orders List Stream */}
      <div className="w-full flex flex-col gap-4">
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs gap-3">
            <Loader />
            <p className="text-xs font-bold text-neutral-500 animate-pulse">
              กำลังโหลดรายการคำสั่งซื้อ...
            </p>
          </div>
        ) : orderHistoryList.length > 0 ? (
          orderHistoryList.map((o) => (
            <OrderCard
              updateOrderStatus={handleUpdateOrderStatus}
              key={uuid()}
              {...o}
            />
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#b48300] border border-amber-200/70 flex items-center justify-center shadow-inner">
              <FaFolderOpen size={28} />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="text-base font-black text-neutral-900">
                ไม่พบประวัติคำสั่งซื้อ
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {search
                  ? `ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหา "${search}"`
                  : "คุณยังไม่มีรายการคำสั่งซื้อในหมวดหมู่นี้ เริ่มต้นเลือกซื้อสินค้าที่ถูกใจได้เลย"}
              </p>
            </div>
            <Link
              href="/search"
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FaShoppingBag size={12} />
              <span>เลือกซื้อเฟอร์นิเจอร์</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
