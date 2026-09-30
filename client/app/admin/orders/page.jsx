"use client";
import { use, useEffect, useMemo, useState } from "react";
import { FiFolderMinus } from "react-icons/fi";
import {
  FaBox,
  FaCalendar,
  FaCaretUp,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCity,
  FaClock,
  FaCreditCard,
  FaDonate,
  FaEdit,
  FaEnvelope,
  FaExclamationCircle,
  FaHourglassHalf,
  FaImage,
  FaPhone,
  FaReceipt,
  FaRegListAlt,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTimesCircle,
  FaTrash,
  FaTruck,
  FaTruckMoving,
  FaUpload,
  FaUser,
  FaMapMarkerAlt,
  FaCopy,
  FaPrint,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { MdInfoOutline } from "react-icons/md";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import Loading from "@/layout/loading";
import { debounce } from "lodash";
import Modal from "@/components/model";
import Loader from "@/components/loader";
import { NO_IMG_PRODUCT } from "@/config/constants";
import SafeImage from "@/components/safe-image";

const Orders = () => {
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyOrderId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [take, setTake] = useState(15);
  const [searchStatus, setSearchStatus] = useState("all");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [orderAvg, setOrderAvg] = useState(null);
  const [order, setOrder] = useState(null);

  const [geting, setGeting] = useState(false);
  const getOrderAvg = async () => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/orders-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setOrderAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };
  useEffect(() => {
    getOrderAvg();
  }, []);

  const resetAllSearch = () => {
    setPage(1);
    setSort(JSON.stringify({ createdAt: "desc" }));
    setTake(15);
    setSearchStatus("all");
    setSearch("");
  };

  const fetchOrderHistory = async (status, sort, page, take, search) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/get-orders", {
        withCredentials: true,
        params: {
          status,
          sort,
          page,
          take,
          search,
        },
      });
      if (res.status === 200) {
        setOrderList(res.data.data);
        setTotal(res.data.total);
        setTotalPage(res.data.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const [getingOrder, setGetingOder] = useState(false);
  const fetchOrder = async (id) => {
    setGetingOder(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + `/admin/order-detail/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setOrder(res.data);
        setOriginalSlip(
          res.data?.slip_return
            ? envConfig.imgURL + res?.data?.slip_return
            : null
        );
        setSlipReturnPreview(
          res.data?.slip_return
            ? envConfig.imgURL + res?.data?.slip_return
            : null
        );
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGetingOder(false);
    }
  };

  const handleLookOrder = (id) => {
    fetchOrder(id);
    setShowModal(true);
  };

  const debounceSearch = useMemo(
    () => debounce(fetchOrderHistory, 700),
    [fetchOrderHistory]
  );

  useEffect(() => {
    debounceSearch(searchStatus, sort, page, take, search);
  }, [searchStatus, sort, page, take, search]);

  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const handleUpdateOrderStatus = async (status, orderId) => {
    const { isConfirmed } = await popup.confirmPopUp(
      status === "cancel"
        ? "ยกเลิกคำสั่งซื้อนี้"
        : "ฉันได้ตรวจสอบความถูกต้องของคำสั่งซื้อนี้แล้ว",
      status === "cancel"
        ? "ต้องการยกเลิกคำสั่งซื้อนี้หรือไม่"
        : "กด ยืนยัน เพื่อยืนยันคำสั่งซื้อนี้ จากนั้นคำสั่งซื้อนี้จะเข้าสู่สถานะ กำลังจัดส่ง",
      status === "cancel" ? "ยกเลิกคำสั่งซื้อ" : "ยืนยัน"
    );
    if (!isConfirmed) return;

    setGetingOder(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + `/admin/update-order-status`,
        { status, orderId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success(
          status === "cancel" ? "ยกเลิกคำสั่งซื้อแล้ว" : "ยืนยันคำสั่งซื้อแล้ว"
        );
        fetchOrderHistory(searchStatus, sort, page, take, search);
        getOrderAvg();
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGetingOder(false);
    }
  };

  const [originalSlip, setOriginalSlip] = useState(null);
  const [slipReturn, setSlipReturn] = useState(null);
  const [slipReturnPreview, setSlipReturnPreview] = useState(null);
  const handleSlipReturnChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSlipReturn(file);
    setSlipReturnPreview(URL.createObjectURL(file));
  };

  const [updating, setUpdating] = useState(false);
  const handleUpdateSlipReturn = async () => {
    if (!slipReturnPreview) return popup.err("กรุณาอัปโหลดหลักฐานการคืนเงิน");

    const { isConfirmed } = await popup.confirmPopUp(
      "ยืนยันการคืนเงิน",
      "ฉันได้ตรวจสอบคำสั่งซื้อแล้วและต้องการคืนเงินให้ลูกค้า",
      "ยืนยัน"
    );
    if (!isConfirmed) return;

    setUpdating(true);
    try {
      const payload = new FormData();
      if (originalSlip !== slipReturnPreview)
        payload.append("slip_return", slipReturn);
      const res = await axios.put(
        envConfig.apiURL + `/admin/update-slip-return/${order?.bill_id}`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.status === 200) {
        popup.success("อัปโหลดหลักฐานการคืนเงินแล้ว");
        setShowModal(false);
        setShowReturnModal(false);
        fetchOrderHistory(searchStatus, sort, page, take, search);
        getOrderAvg();
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setUpdating(false);
    }
  };

  if (geting) return <Loading />;

  return (
    <>
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">จัดการคำสั่งซื้อ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold">
              Orders Management
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 pl-5">
            ตรวจสอบรายละเอียดคำสั่งซื้อ อัปเดตสถานะการจัดส่ง และยืนยันการชำระเงินของลูกค้า
          </p>
        </div>
        <button
          onClick={() => {
            fetchOrderHistory(searchStatus, sort, page, take, search);
            getOrderAvg();
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors active:scale-95 cursor-pointer"
        >
          <FaSyncAlt size={12} className={loading ? "animate-spin text-[#b48300]" : "text-neutral-500"} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* KPI Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full">
        {/* All Orders */}
        <div
          onClick={() => {
            setSearchStatus("all");
            setPage(1);
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs ${
            searchStatus === "all"
              ? "bg-amber-50/40 border-[#fbc50e] ring-2 ring-[#fbc50e]/30"
              : "bg-white border-neutral-200/90 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">คำสั่งซื้อทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#b48300] border border-amber-200/70 flex items-center justify-center">
              <FaReceipt size={13} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-neutral-900">
            {Number(orderAvg?.allOrders || 0).toLocaleString()}
          </p>
        </div>

        {/* Pending */}
        <div
          onClick={() => {
            setSearchStatus("pending");
            setPage(1);
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs ${
            searchStatus === "pending"
              ? "bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/30"
              : "bg-white border-neutral-200/90 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">รอยืนยัน</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center">
              <FaClock size={13} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-900">
            {Number(orderAvg?.allPending || 0).toLocaleString()}
          </p>
        </div>

        {/* Sending */}
        <div
          onClick={() => {
            setSearchStatus("sending");
            setPage(1);
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs ${
            searchStatus === "sending"
              ? "bg-violet-50/50 border-violet-400 ring-2 ring-violet-400/30"
              : "bg-white border-neutral-200/90 hover:border-violet-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-800">กำลังจัดส่ง</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 border border-violet-200/70 flex items-center justify-center">
              <FaTruck size={13} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-violet-900">
            {Number(orderAvg?.allSending || 0).toLocaleString()}
          </p>
        </div>

        {/* Received */}
        <div
          onClick={() => {
            setSearchStatus("recevied");
            setPage(1);
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs ${
            searchStatus === "recevied"
              ? "bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-400/30"
              : "bg-white border-neutral-200/90 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">สำเร็จแล้ว</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
              <FaCheckCircle size={13} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-900">
            {Number(orderAvg?.allRecevied || 0).toLocaleString()}
          </p>
        </div>

        {/* Cancelled */}
        <div
          onClick={() => {
            setSearchStatus("cancel");
            setPage(1);
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs ${
            searchStatus === "cancel"
              ? "bg-rose-50/50 border-rose-400 ring-2 ring-rose-400/30"
              : "bg-white border-neutral-200/90 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">ยกเลิกแล้ว</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center">
              <FaTimes size={13} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-900">
            {Number(orderAvg?.allCancel || 0).toLocaleString()}
          </p>
        </div>

        {/* Return Pending */}
        <div
          onClick={() => {
            setSearchStatus("return_pending");
            setPage(1);
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs relative ${
            searchStatus === "return_pending"
              ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/30"
              : "bg-white border-neutral-200/90 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">คำขอคืนเงิน</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 border border-amber-300 flex items-center justify-center">
              <FaExclamationCircle size={13} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-neutral-900">
            {Number(orderAvg?.allReturnPending || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Table Box */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col overflow-hidden">
        {/* Search & Filters Toolbar */}
        <div className="p-5 md:p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
              <input
                type="text"
                placeholder="ค้นหารหัสคำสั่งซื้อ ชื่อ หรือเบอร์โทรลูกค้า..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all text-neutral-900 placeholder:text-neutral-400"
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

            {/* Status Select */}
            <div className="w-full sm:w-[180px]">
              <select
                onChange={(e) => {
                  setSearchStatus(e.target.value);
                  setPage(1);
                }}
                value={searchStatus}
                className="w-full text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="pending">สถานะ: รอยืนยัน</option>
                <option value="sending">สถานะ: กำลังจัดส่ง</option>
                <option value="recevied">สถานะ: สำเร็จแล้ว</option>
                <option value="cancel">สถานะ: ยกเลิก</option>
                <option value="return_pending">สถานะ: คำขอคืนเงิน</option>
              </select>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Select */}
            <select
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              value={sort}
              className="text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
            >
              <option value={JSON.stringify({ createdAt: "desc" })}>เรียง: คำสั่งซื้อล่าสุด</option>
              <option value={JSON.stringify({ createdAt: "asc" })}>เรียง: คำสั่งซื้อเก่าสุด</option>
              <option value={JSON.stringify({ bill_price: "desc" })}>เรียง: ยอดรวมสูงสุด</option>
              <option value={JSON.stringify({ bill_price: "asc" })}>เรียง: ยอดรวมน้อยสุด</option>
              <option value={JSON.stringify({ bill_productPeace: "desc" })}>เรียง: จำนวนสินค้ามากสุด</option>
            </select>

            {/* Rows Per Page */}
            <select
              onChange={(e) => {
                setTake(Number(e.target.value));
                setPage(1);
              }}
              value={take}
              className="text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
            >
              <option value={15}>15 แถว</option>
              <option value={25}>25 แถว</option>
              <option value={50}>50 แถว</option>
              <option value={100}>100 แถว</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={resetAllSearch}
              className="px-3.5 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ล้างตัวกรองทั้งหมด"
            >
              <FaTrash size={11} className="text-neutral-400" />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-neutral-50/75 border-b border-neutral-200/90 text-xs font-bold text-neutral-600 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">รหัสคำสั่งซื้อ / รายการ</div>
              <div className="col-span-3">ข้อมูลลูกค้า</div>
              <div className="col-span-2 text-center">วันที่สั่งซื้อ</div>
              <div className="col-span-1 text-right">ยอดรวมสุทธิ</div>
              <div className="col-span-1 text-center">สถานะ</div>
              <div className="col-span-1 text-center">จัดการ</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col min-h-[380px]">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20 text-neutral-400">
                  <div className="w-9 h-9 border-3 border-amber-200 border-t-[#fbc50e] rounded-full animate-spin" />
                  <p className="text-xs text-neutral-500 mt-2">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
                </div>
              ) : orderList?.length > 0 ? (
                <div className="divide-y divide-neutral-100 text-xs">
                  {orderList.map((o, index) => (
                    <div
                      key={uuid()}
                      onClick={() => handleLookOrder(o?.bill_id)}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-amber-50/25 transition-colors cursor-pointer group"
                    >
                      {/* Index */}
                      <div className="col-span-1 text-center font-medium text-neutral-400">
                        {index + (page - 1) * take + 1}
                      </div>

                      {/* Bill ID & Items */}
                      <div className="col-span-3 flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900 group-hover:text-[#b48300] transition-colors truncate">
                            {o?.bill_id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200/80 font-medium">
                            {o?.pm_method || "ชำระเงิน"}
                          </span>
                          <span className="text-neutral-500">
                            {o?.bill_productList} รายการ ({o?.bill_productPeace} ชิ้น)
                          </span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="col-span-3 flex flex-col gap-0.5 min-w-0">
                        <p className="font-bold text-neutral-900 truncate">
                          {o?.user?.title_type || ""}
                          {o?.user?.first_name || ""} {o?.user?.last_name || ""}
                        </p>
                        <p className="text-neutral-500 font-mono text-[11px] truncate">
                          {o?.user?.tel || "-"}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-center text-neutral-600">
                        <p className="font-medium">
                          {o?.bill_date ? new Date(o.bill_date).toLocaleDateString("th-TH") : "-"}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {o?.bill_date ? new Date(o.bill_date).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 text-right">
                        <p className="font-extrabold text-neutral-900 text-sm">
                          ฿{Number(o?.bill_price || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            o?.status_pm === "pending"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : o?.status_pm === "sending"
                              ? "bg-violet-50 text-violet-800 border-violet-200"
                              : o?.status_pm === "recevied"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {o?.status_pm === "pending" ? (
                            <>
                              <FaClock size={10} />
                              <span>รอยืนยัน</span>
                            </>
                          ) : o?.status_pm === "sending" ? (
                            <>
                              <FaTruck size={10} />
                              <span>กำลังจัดส่ง</span>
                            </>
                          ) : o?.status_pm === "recevied" ? (
                            <>
                              <FaCheck size={10} />
                              <span>สำเร็จแล้ว</span>
                            </>
                          ) : (
                            <>
                              <FaTimes size={10} />
                              <span>ยกเลิก</span>
                            </>
                          )}
                        </span>

                        {o?.status_pm === "return_pending" && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs">
                            ขอคืนเงิน
                          </span>
                        )}
                        {o?.status_pm === "return_sending" && (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded shadow-2xs">
                            รอยืนยันรับเงิน
                          </span>
                        )}
                        {o?.status_pm === "return_confirmed" && (
                          <span className="text-[10px] font-bold text-[#b48300] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shadow-2xs">
                            คืนเงินแล้ว
                          </span>
                        )}
                      </div>

                      {/* Action */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLookOrder(o?.bill_id);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          ตรวจสอบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60 shadow-2xs">
                    <FiFolderMinus size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-neutral-800">
                      {search || searchStatus !== "all"
                        ? "ไม่พบรายการคำสั่งซื้อที่ตรงกับเงื่อนไข"
                        : "ยังไม่มีคำสั่งซื้อในระบบ"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                      {search || searchStatus !== "all"
                        ? "ลองปรับเปลี่ยนคำค้นหา หรือคลิกเพื่อล้างตัวกรองสถานะทั้งหมด"
                        : "เมื่อมีลูกค้าสั่งซื้อเฟอร์นิเจอร์ ข้อมูลรายการจะปรากฏที่นี่ทันที"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Footer: Summary & Pagination */}
        <div className="p-4 md:px-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            แสดงผล{" "}
            <span className="font-semibold text-neutral-800">
              {orderList?.length > 0 ? (page - 1) * take + 1 : 0}
            </span>{" "}
            ถึง{" "}
            <span className="font-semibold text-neutral-800">
              {Math.min(page * take, total)}
            </span>{" "}
            จากทั้งหมด{" "}
            <span className="font-semibold text-neutral-800">{total}</span> คำสั่งซื้อ
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
      {/* View Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full max-w-4xl max-h-[92vh] bg-white relative overflow-y-auto p-5 sm:p-7 md:p-8 flex flex-col rounded-3xl border border-neutral-200/90 shadow-2xl gap-6">
          {getingOrder ? (
            <div className="w-full flex flex-col h-72 items-center justify-center gap-3">
              <Loader />
              <p className="text-xs text-neutral-400 font-medium animate-pulse">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
            </div>
          ) : (
            <>
              {/* 1. Modal Header: Title, Order ID badge with copy, Print and Close */}
              <div className="w-full pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                    <FaReceipt size={18} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">รายละเอียดคำสั่งซื้อ</h2>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 text-xs font-mono font-bold text-neutral-800 transition-colors">
                        <span>#{order?.bill_id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(order?.bill_id)}
                          className="text-neutral-500 hover:text-amber-700 p-0.5 cursor-pointer"
                          title="คัดลอกรหัสคำสั่งซื้อ"
                        >
                          <FaCopy size={11} />
                        </button>
                        {copiedId && (
                          <span className="text-[10px] text-emerald-600 font-sans font-bold">คัดลอกแล้ว!</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <FaCalendar size={11} />
                      <span>
                        สั่งซื้อเมื่อ:{" "}
                        {order?.bill_date
                          ? new Date(order.bill_date).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="พิมพ์คำสั่งซื้อ"
                  >
                    <FaPrint size={13} />
                    <span className="hidden sm:inline">พิมพ์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="ปิดหน้าต่าง"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>

              {/* 2. Order Lifecycle Progress Stepper */}
              {order?.status_pm === "cancel" ? (
                <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FaTimesCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">คำสั่งซื้อนี้ถูกยกเลิกแล้ว</h4>
                    <p className="text-[11px] text-rose-600">คำสั่งซื้อถูกระงับหรือยกเลิกโดยระบบหรือผู้ดูแล</p>
                  </div>
                </div>
              ) : order?.status_pm?.includes("return") ? (
                <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <FaDonate size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      {order?.status_pm === "return_pending" && "อยู่ระหว่างดำเนินการคืนเงิน (คำขอจากลูกค้า)"}
                      {order?.status_pm === "return_sending" && "แนบหลักฐานการคืนเงินแล้ว (รอลูกค้ายืนยันรับเงินคืน)"}
                      {order?.status_pm === "return_confirmed" && "การคืนเงินสำเร็จสมบูรณ์"}
                    </h4>
                    <p className="text-[11px] text-amber-700">คำสั่งซื้อนี้มีการขอคืนสินค้าและคืนเงิน</p>
                  </div>
                </div>
              ) : (
                <div className="w-full p-4 sm:p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 shadow-2xs">
                  <div className="grid grid-cols-3 relative">
                    {/* Stepper Connecting Bar */}
                    <div className="absolute top-4 left-[16.6%] right-[16.6%] h-1 bg-neutral-200 z-0 -translate-y-1/2">
                      <div
                        className="h-full bg-[#fbc50e] transition-all duration-500"
                        style={{
                          width:
                            order?.status_pm === "recevied"
                              ? "100%"
                              : order?.status_pm === "sending"
                              ? "50%"
                              : "0%",
                        }}
                      />
                    </div>

                    {/* Step 1: รอยืนยันคำสั่งซื้อ */}
                    <div className="flex flex-col items-center text-center relative z-10 gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          order?.status_pm === "pending" ||
                          order?.status_pm === "sending" ||
                          order?.status_pm === "recevied"
                            ? "bg-[#fbc50e] text-neutral-950 ring-4 ring-amber-100"
                            : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        <FaReceipt size={12} />
                      </div>
                      <span className="text-xs font-bold text-neutral-800">รอยืนยัน</span>
                      <span className="text-[10px] text-neutral-400 hidden sm:inline">ได้รับคำสั่งซื้อแล้ว</span>
                    </div>

                    {/* Step 2: กำลังจัดส่ง */}
                    <div className="flex flex-col items-center text-center relative z-10 gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          order?.status_pm === "sending" || order?.status_pm === "recevied"
                            ? "bg-[#fbc50e] text-neutral-950 ring-4 ring-amber-100"
                            : "bg-white border-2 border-neutral-300 text-neutral-400"
                        }`}
                      >
                        <FaTruck size={12} />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          order?.status_pm === "sending" || order?.status_pm === "recevied"
                            ? "text-neutral-900"
                            : "text-neutral-400"
                        }`}
                      >
                        กำลังจัดส่ง
                      </span>
                      <span className="text-[10px] text-neutral-400 hidden sm:inline">พัสดุอยู่ระหว่างขนส่ง</span>
                    </div>

                    {/* Step 3: ได้รับสินค้าสำเร็จ */}
                    <div className="flex flex-col items-center text-center relative z-10 gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          order?.status_pm === "recevied"
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                            : "bg-white border-2 border-neutral-300 text-neutral-400"
                        }`}
                      >
                        <FaCheck size={12} />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          order?.status_pm === "recevied" ? "text-emerald-700" : "text-neutral-400"
                        }`}
                      >
                        สำเร็จ
                      </span>
                      <span className="text-[10px] text-neutral-400 hidden sm:inline">ลูกค้าได้รับสินค้าแล้ว</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Customer, Delivery & Payment 2-Column Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: ข้อมูลลูกค้าและสถานที่จัดส่ง */}
                <div className="p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex flex-col justify-between gap-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <FaUser size={13} />
                    </div>
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                      ข้อมูลลูกค้าและสถานที่จัดส่ง
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 text-xs">
                    {/* Customer Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200 shrink-0">
                        {order?.user?.first_name ? order.user.first_name.slice(0, 1) : <FaUser size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-neutral-900 text-sm">
                          {order?.user?.title_type || ""}
                          {order?.user?.first_name || "ลูกค้า"} {order?.user?.last_name || ""}
                        </span>
                        <span className="text-[11px] text-neutral-400">บัญชีผู้สั่งซื้อในระบบ</span>
                      </div>
                    </div>

                    {/* Contact Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                      <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2">
                        <FaPhone className="text-neutral-400 shrink-0" size={12} />
                        <span className="text-[11px] text-neutral-700 truncate font-mono">
                          {order?.user?.tel || order?.user?.tb_user_address?.[0]?.phone || "ไม่ระบุเบอร์โทร"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2">
                        <FaEnvelope className="text-neutral-400 shrink-0" size={12} />
                        <span className="text-[11px] text-neutral-700 truncate">
                          {order?.user?.email || "ไม่ระบุอีเมล"}
                        </span>
                      </div>
                    </div>

                    {/* Address Box */}
                    <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 flex items-start gap-2.5 mt-1">
                      <FaMapMarkerAlt className="text-amber-600 mt-0.5 shrink-0" size={14} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          ที่อยู่จัดส่งพัสดุ
                        </span>
                        {order?.user?.tb_user_address?.[0]?.address ? (
                          <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                            {order.user.tb_user_address[0].address}{" "}
                            {order.user.tb_user_address[0].sub_district && `ต./แขวง ${order.user.tb_user_address[0].sub_district}`}{" "}
                            {order.user.tb_user_address[0].district && `อ./เขต ${order.user.tb_user_address[0].district}`}{" "}
                            {order.user.tb_user_address[0].province && `จ.${order.user.tb_user_address[0].province}`}{" "}
                            {order.user.tb_user_address[0].zipcode && order.user.tb_user_address[0].zipcode}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-400 italic">
                            ยังไม่มีข้อมูลที่อยู่จัดส่งในระบบ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: ข้อมูลการชำระเงินและสลิป */}
                <div className="p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <FaCreditCard size={13} />
                      </div>
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                        ข้อมูลการชำระเงิน
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {order?.pm_method || "PromptPay"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-neutral-500">สถานะการชำระ</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <FaCheckCircle size={12} />
                        <span>ชำระเรียบร้อยแล้ว</span>
                      </span>
                    </div>

                    {/* Transfer Slip Preview Area */}
                    {order?.slip_pm ? (
                      <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0 shadow-2xs">
                          <SafeImage
                            src={envConfig.imgURL + order.slip_pm}
                            type="slip"
                            alt="สลิปการโอน"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-neutral-800">มีหลักฐานการโอนเงิน (สลิป)</span>
                          <span className="text-[10px] text-neutral-400">
                            {order?.bill_pm ? new Date(order.bill_pm).toLocaleString("th-TH") : "ชำระเงินเรียบร้อย"}
                          </span>
                          <a
                            href={envConfig.imgURL + order.slip_pm}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 mt-1"
                          >
                            <span>ดูรูปสลิปขนาดเต็ม</span>
                            <FaExternalLinkAlt size={9} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/40 text-center flex flex-col items-center justify-center gap-1 py-4 text-neutral-400">
                        <FaReceipt size={18} className="opacity-40" />
                        <span className="text-[11px]">ไม่มีไฟล์สลิปแนบ (ชำระผ่านช่องทางอัตโนมัติหรือบัตร)</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-neutral-500 text-[11px] pt-1">
                      <span>จำนวนรายการสินค้า:</span>
                      <span className="font-bold text-neutral-800">
                        {order?.bill_productPeace || order?.order_details?.length || 1} ชิ้น
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Ordered Products Table */}
              <div className="flex flex-col p-5 border border-neutral-200/90 rounded-2xl bg-white shadow-2xs gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <FaBox size={13} />
                    </div>
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                      รายการสินค้าในคำสั่งซื้อ
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {order?.order_details?.length || 0} รายการ
                  </span>
                </div>

                {order?.order_details && order.order_details.length > 0 ? (
                  <div className="w-full flex flex-col divide-y divide-neutral-100 max-h-[300px] overflow-y-auto pr-1">
                    {order.order_details.map((d) => (
                      <div
                        key={d?.detail_id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-neutral-50/60 p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded-xl border border-neutral-200/90 overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center shadow-2xs">
                            <SafeImage
                              src={
                                d?.product?.imgs?.[0]?.url
                                  ? envConfig.imgURL + d.product.imgs[0].url
                                  : null
                              }
                              className="w-full h-full object-cover"
                              type="product"
                              alt={d?.product?.pro_name || "สินค้า"}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                              {d?.product?.pro_name || "สินค้าเฟอร์นิเจอร์"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500 flex-wrap">
                              {d?.color && (
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-medium border border-neutral-200/70">
                                  สี: {d.color}
                                </span>
                              )}
                              {d?.size && (
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-medium border border-neutral-200/70">
                                  ขนาด: {d.size}
                                </span>
                              )}
                              {d?.unit && (
                                <span className="text-neutral-400">({d.unit})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 text-xs pl-17 sm:pl-0 shrink-0">
                          <div className="text-right">
                            <span className="text-[11px] text-neutral-400 block">จำนวน</span>
                            <span className="font-bold text-neutral-800">
                              {Number(d?.quantity || 1).toLocaleString()} ชิ้น
                            </span>
                          </div>
                          <div className="text-right min-w-[90px]">
                            <span className="text-[11px] text-neutral-400 block">ยอดรวม</span>
                            <span className="font-black text-neutral-900 font-mono text-sm">
                              ฿{Number(d?.total_amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center gap-2 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                    <FaBox size={24} className="text-neutral-300" />
                    <p className="text-xs font-semibold text-neutral-600">
                      ไม่พบรายละเอียดสินค้าย่อยในคำสั่งซื้อนี้
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      (จำนวนสินค้าตามใบเสร็จ: {Number(order?.bill_productPeace || 0)} ชิ้น)
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Payment Financial Breakdown */}
              <div className="p-5 rounded-2xl bg-neutral-900 text-white shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-300">สรุปยอดคำนวณการชำระเงิน</span>
                  <span className="text-neutral-400 text-[11px]">สกุลเงิน: บาท (THB)</span>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>รวมราคาสินค้าทั้งหมด (Subtotal)</span>
                    <span className="font-semibold text-white font-mono">
                      ฿{Number(order?.bill_totalamount || order?.bill_price || 0).toLocaleString()}
                    </span>
                  </div>

                  {Number(order?.bill_totalDiscount || 0) > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>ส่วนลดโปรโมชั่น (Discount)</span>
                      <span className="font-semibold font-mono">
                        -฿{Number(order.bill_totalDiscount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-300">
                    <span>ค่าจัดส่งสินค้า (Freight / Delivery)</span>
                    <span className="font-semibold text-white font-mono">
                      {Number(order?.bill_freighttotal || 0) > 0
                        ? `฿${Number(order.bill_freighttotal).toLocaleString()}`
                        : "จัดส่งฟรี (฿0)"}
                    </span>
                  </div>

                  <div className="pt-3 mt-1 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">ยอดชำระสุทธิ (Net Total)</span>
                      <span className="text-[10px] text-neutral-400">ราคารวมภาษีมูลค่าเพิ่มแล้ว</span>
                    </div>
                    <span className="text-2xl font-black text-[#fbc50e] font-mono tracking-tight">
                      ฿{Number(order?.bill_price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Action Footer Bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100">
                <div className="text-xs text-neutral-500">
                  {order?.status_pm === "pending" && (
                    <span className="text-amber-600 font-medium">
                      * สามารถกดยืนยันคำสั่งซื้อเพื่อเปลี่ยนสถานะเป็น "กำลังจัดส่ง"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>

                  {order?.status_pm === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus("cancel", order?.bill_id)}
                        className="rounded-xl py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 text-xs transition-colors cursor-pointer"
                      >
                        ยกเลิกคำสั่งซื้อ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus("sending", order?.bill_id)}
                        className="rounded-xl py-2.5 px-5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <FaTruck size={12} />
                        <span>ยืนยันคำสั่งซื้อ (เริ่มจัดส่ง)</span>
                      </button>
                    </>
                  ) : order?.status_pm === "sending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus("recevied", order?.bill_id)}
                        className="rounded-xl py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <FaCheck size={12} />
                        <span>เปลี่ยนเป็นได้รับสินค้าแล้ว</span>
                      </button>
                    </>
                  ) : order?.status_pm === "recevied" ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <FaCheckCircle size={13} className="text-emerald-600" />
                      <span>คำสั่งซื้อสำเร็จเรียบร้อย</span>
                    </div>
                  ) : order?.status_pm === "return_pending" ? (
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(true)}
                      className="rounded-xl py-2.5 px-5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <FaDonate />
                      <span>ดำเนินการคืนเงินลูกค้า</span>
                    </button>
                  ) : order?.status_pm === "return_sending" || order?.status_pm === "return_confirmed" ? (
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(true)}
                      className="rounded-xl py-2.5 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <FaSearch />
                      <span>ตรวจสอบหลักฐานการคืนเงิน</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Return Refund Modal */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)}>
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col border border-neutral-200/90 gap-5">
          <div className="pb-4 border-b border-neutral-200/80 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900">คืนเงินลูกค้า</h2>
                <p className="text-xs text-neutral-500">ตรวจสอบข้อมูลบัญชีและอัปโหลดหลักฐานการโอนเงินคืน</p>
              </div>
            </div>
            <button
              onClick={() => setShowReturnModal(false)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Customer Bank Details Card */}
          <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col gap-2.5">
            <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">ข้อมูลบัญชีธนาคารของลูกค้า</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                <span className="text-[11px] text-neutral-400 block">ธนาคาร</span>
                <span className="text-xs font-bold text-neutral-900">{order?.user?.bank_name || "-"}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                <span className="text-[11px] text-neutral-400 block">เลขที่บัญชี</span>
                <span className="text-xs font-bold text-[#b48300] font-mono">{order?.user?.bank_number || "-"}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                <span className="text-[11px] text-neutral-400 block">ชื่อบัญชี</span>
                <span className="text-xs font-bold text-neutral-900">{order?.user?.bank_owner || "-"}</span>
              </div>
            </div>
          </div>

          {/* Order Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-200/80 flex flex-col gap-2 text-xs">
            <p className="text-xs font-bold text-neutral-700 pb-1.5 border-b border-neutral-200">
              รายละเอียดคำสั่งซื้อและยอดคืนเงิน
            </p>
            <div className="flex justify-between text-neutral-600">
              <span>รวมราคาสินค้า</span>
              <span className="font-semibold text-neutral-800">
                ฿{Number(order?.bill_totalamount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>ส่วนลด</span>
              <span className="font-semibold text-rose-600">
                -฿{Number(order?.bill_totalDiscount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>ค่าจัดส่ง</span>
              <span className="font-semibold text-neutral-800">
                ฿{Number(order?.bill_freighttotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">ยอดที่ต้องโอนคืน</span>
              <span className="text-xl font-extrabold text-[#b48300] font-mono">
                ฿{Number(order?.bill_price || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Upload Proof */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-neutral-700">หลักฐานการโอนเงินคืน</label>
            {order?.status_pm !== "return_confirmed" && (
              <label
                htmlFor="slip-picker"
                className="w-full h-24 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#fbc50e] bg-neutral-50 hover:bg-neutral-100/60 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-neutral-500 shadow-2xs"
              >
                <input
                  type="file"
                  onChange={handleSlipReturnChange}
                  id="slip-picker"
                  className="hidden"
                />
                <FaImage size={18} className="text-[#b48300]" />
                <p className="text-xs font-bold text-neutral-800">
                  {slipReturnPreview ? "คลิกเพื่อเปลี่ยนรูปภาพหลักฐาน" : "คลิกเพื่ออัปโหลดหลักฐานการโอนเงิน"}
                </p>
                <p className="text-[10px] text-neutral-400">รองรับไฟล์สลิป JPG, PNG หรือ WebP</p>
              </label>
            )}

            {slipReturnPreview && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="max-w-xs rounded-xl overflow-hidden border border-neutral-200 shadow-2xs bg-neutral-50 flex items-center justify-center">
                  <SafeImage
                    src={slipReturnPreview}
                    className="w-full h-auto object-cover max-h-[360px]"
                    type="slip"
                    showFallbackText={true}
                    alt="Slip Return Preview"
                  />
                </div>
                {order?.status_pm !== "return_confirmed" && (
                  <p className="text-[11px] text-neutral-400 text-center">
                    * เมื่อลูกค้ายืนยันรับเงินคืนแล้ว จะไม่สามารถแก้ไขหลักฐานได้อีก
                  </p>
                )}
                {order?.status_pm !== "return_confirmed" && (
                  <button
                    disabled={updating}
                    onClick={handleUpdateSlipReturn}
                    className="mt-3 w-full flex items-center justify-center gap-2 p-3 text-xs font-bold bg-[#fbc50e] text-neutral-950 hover:bg-[#eab308] rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaCheck />
                        <span>ยืนยันการคืนเงิน</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Orders;
