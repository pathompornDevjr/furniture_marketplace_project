"use client";

import DownloadInvoiceButton from "@/components/invoice-pdf";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import SafeImage from "@/components/safe-image";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import { showSuccessToast, showErrorToast } from "@/libs/cart-toast";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBox,
  FaBoxes,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaCopy,
  FaCreditCard,
  FaEnvelope,
  FaEye,
  FaFileInvoice,
  FaHome,
  FaMapMarkerAlt,
  FaPhone,
  FaQrcode,
  FaReceipt,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaTimesCircle,
  FaTruck,
  FaUndo,
  FaUpload,
  FaUser,
} from "react-icons/fa";

import useGetSeesion from "@/hooks/useGetSession";

const OrderDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, checking } = useGetSeesion();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [slip, setSlip] = useState("");
  const [showSlipReturnModal, setShowSlipReturnModal] = useState(false);
  const [slipReturn, setSlipReturn] = useState("");
  const [copied, setCopied] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [newSlipFile, setNewSlipFile] = useState(null);

  const fetchOrder = async (orderId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + `/user/order-detail/${orderId}`,
        { withCredentials: true }
      );
      if (res.status === 200 && res.data) {
        setOrder(res.data);
        if (res.data.slip_pm) {
          setSlip(envConfig.imgURL + res.data.slip_pm);
        }
        if (res.data.slip_return) {
          setSlipReturn(envConfig.imgURL + res.data.slip_return);
        }
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking || !user) return;
    if (id) {
      fetchOrder(id);
    }
  }, [id, user, checking]);

  const copyOrderId = () => {
    if (order?.bill_id) {
      navigator.clipboard.writeText(order.bill_id);
      setCopied(true);
      showSuccessToast("คัดลอกรหัสคำสั่งซื้อแล้ว");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const pickNewSlip = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlip(URL.createObjectURL(file));
      setNewSlipFile(file);
    }
  };

  const updateSlip = async (orderId) => {
    if (!newSlipFile) {
      return popup.err("ไม่พบไฟล์รูปภาพสลิปใหม่");
    }
    const { isConfirmed } = await popup.confirmPopUp(
      "เปลี่ยนหลักฐานการชำระเงิน",
      "คุณต้องการบันทึกสลิปใหม่สำหรับคำสั่งซื้อนี้ใช่หรือไม่",
      "ยืนยันบันทึก"
    );
    if (!isConfirmed) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("newslip", newSlipFile);

      const res = await axios.put(
        envConfig.apiURL + `/user/update-slip/${orderId}`,
        formData,
        { withCredentials: true }
      );
      if (res.status === 200) {
        showSuccessToast("อัปเดตสลิปหลักฐานเรียบร้อยแล้ว");
        setShowModal(false);
        fetchOrder(orderId);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setUpdating(false);
    }
  };

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
        ? "กดยืนยันหากคุณตรวจสอบและได้รับสินค้าครบถ้วนแล้ว"
        : status === "return_pending"
        ? "คุณต้องการส่งคำขอคืนเงินสำหรับออเดอร์นี้ใช่หรือไม่"
        : "ฉันได้ตรวจสอบและได้รับเงินคืนเข้าบัญชีแล้ว",
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
            ? "ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว"
            : status === "recevied"
            ? "ขอบคุณที่ไว้วางใจเลือกซื้อเฟอร์นิเจอร์กับเรา"
            : status === "return_pending"
            ? "ส่งคำขอคืนเงินเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและแจ้งผลกลับโดยเร็วที่สุด"
            : "บันทึกข้อมูลเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ"
        );
        fetchOrder(orderId);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#b48300] border border-amber-200/80 flex items-center justify-center">
          <FaReceipt size={28} />
        </div>
        <h2 className="text-lg font-black text-neutral-900">ไม่พบข้อมูลคำสั่งซื้อนี้</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          อาจเกิดจากรหัสคำสั่งซื้อไม่ถูกต้อง หรือคำสั่งซื้อนี้ถูกลบออกจากระบบแล้ว
        </p>
        <Link
          href="/profile/order-history"
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs shadow-xs transition-all"
        >
          กลับสู่หน้ารายการสั่งซื้อ
        </Link>
      </div>
    );
  }

  // Address info
  const shippingAddress = order?.user?.tb_user_address?.[0];
  const customerName = `${order?.user?.title_type || ""}${order?.user?.first_name || ""} ${order?.user?.last_name || ""}`.trim() || "ผู้รับสินค้า";
  const customerPhone = shippingAddress?.phone || order?.user?.tel || "ไม่ระบุเบอร์โทร";
  const customerEmail = order?.user?.email || "ไม่ระบุอีเมล";

  // Stepper calculations
  const isCancelled = order.status_pm === "cancel" || order.status_pm?.includes("return");
  const getStepActive = (stepIndex) => {
    if (isCancelled) return false;
    if (order.status_pm === "pending") return stepIndex <= 1;
    if (order.status_pm === "sending") return stepIndex <= 2;
    if (order.status_pm === "recevied") return stepIndex <= 3;
    return false;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Back Navigation & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200/80 gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/profile/order-history"
            className="p-2 rounded-xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 text-neutral-700 hover:text-amber-800 transition-all shadow-2xs flex items-center justify-center"
            title="กลับไปหน้ารายการคำสั่งซื้อ"
          >
            <FaArrowLeft size={13} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-[#fbc50e] rounded-full shadow-xs" />
              <h1 className="text-lg sm:text-xl font-black text-neutral-900">
                รายละเอียดคำสั่งซื้อ
              </h1>
            </div>
            <p className="text-xs text-neutral-500 pl-4 mt-0.5">
              ข้อมูลพัสดุ ที่อยู่จัดส่ง รายการสินค้า และหลักฐานการชำระเงิน
            </p>
          </div>
        </div>

        {/* Action button if received: Invoice Download */}
        {order.status_pm === "recevied" && (
          <div className="shrink-0">
            <DownloadInvoiceButton bill={order} />
          </div>
        )}
      </div>

      {/* 2. Order ID Banner & Visual Status Stepper */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-6">
        {/* Banner Top: ID, Date, Status Chip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-400">รหัสคำสั่งซื้อ:</span>
              <span className="text-sm sm:text-base font-mono font-black text-neutral-950 bg-neutral-100/90 px-3 py-1 rounded-xl border border-neutral-200/70">
                {order.bill_id}
              </span>
              <button
                type="button"
                onClick={copyOrderId}
                className="p-2 rounded-xl text-xs font-bold border border-neutral-200 text-neutral-600 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="คัดลอกรหัสคำสั่งซื้อ"
              >
                {copied ? (
                  <>
                    <FaCheck size={11} className="text-emerald-600" />
                    <span className="text-[11px] text-emerald-700">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <FaCopy size={11} />
                    <span className="text-[11px]">คัดลอก</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt size={11} className="text-neutral-400" />
                <span>
                  สั่งซื้อเมื่อ:{" "}
                  {new Date(order.bill_date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
            {order.status_pm === "pending" && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                <FaClock size={12} className="text-amber-600" />
                <span>รอยืนยันคำสั่งซื้อ</span>
              </span>
            )}
            {order.status_pm === "sending" && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs">
                <FaTruck size={12} className="text-sky-600" />
                <span>กำลังจัดส่งสินค้า</span>
              </span>
            )}
            {order.status_pm === "recevied" && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                <FaCheckCircle size={12} className="text-emerald-600" />
                <span>จัดส่งสำเร็จแล้ว</span>
              </span>
            )}
            {order.status_pm === "cancel" && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                <FaTimesCircle size={12} className="text-rose-600" />
                <span>ยกเลิกคำสั่งซื้อแล้ว</span>
              </span>
            )}

            {/* Refund tags */}
            {order.status_pm === "return_pending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 mt-1">
                <FaSearch size={10} />
                <span>อยู่ระหว่างตรวจสอบคำขอคืนเงิน</span>
              </span>
            )}
            {order.status_pm === "return_sending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 mt-1">
                <FaClock size={10} />
                <span>ร้านค้าอัปโหลดสลิปคืนเงินแล้ว</span>
              </span>
            )}
            {order.status_pm === "return_confirmed" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                <FaCheckCircle size={10} />
                <span>ได้รับเงินคืนเรียบร้อยแล้ว</span>
              </span>
            )}
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        {!isCancelled ? (
          <div className="w-full pt-1">
            <div className="grid grid-cols-4 relative items-center gap-2">
              {/* Step 1: Order Placed */}
              <div className="flex flex-col items-center text-center gap-2 z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    getStepActive(0)
                      ? "bg-[#fbc50e] text-neutral-950 ring-4 ring-[#fbc50e]/20 shadow-xs"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  <FaReceipt size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-900">สั่งซื้อสำเร็จ</span>
                  <span className="text-[10px] text-neutral-400 hidden sm:inline">บันทึกข้อมูลแล้ว</span>
                </div>
              </div>

              {/* Step 2: Confirmation & Prep */}
              <div className="flex flex-col items-center text-center gap-2 z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    getStepActive(1)
                      ? "bg-[#fbc50e] text-neutral-950 ring-4 ring-[#fbc50e]/20 shadow-xs"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                  }`}
                >
                  <FaClock size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-900">รอยืนยันคำสั่งซื้อ</span>
                  <span className="text-[10px] text-neutral-400 hidden sm:inline">เตรียมสินค้า</span>
                </div>
              </div>

              {/* Step 3: In Transit */}
              <div className="flex flex-col items-center text-center gap-2 z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    getStepActive(2)
                      ? "bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-xs"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                  }`}
                >
                  <FaTruck size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-900">กำลังจัดส่ง</span>
                  <span className="text-[10px] text-neutral-400 hidden sm:inline">ขนส่งนำส่งพัสดุ</span>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col items-center text-center gap-2 z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    getStepActive(3)
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-600/20 shadow-xs"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                  }`}
                >
                  <FaCheckCircle size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-900">ได้รับสินค้าแล้ว</span>
                  <span className="text-[10px] text-neutral-400 hidden sm:inline">เสร็จสมบูรณ์</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <FaTimesCircle size={16} className="text-rose-500 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold">คำสั่งซื้อนี้ถูกยกเลิกแล้ว</span>
              <span className="text-[11px] text-rose-600">
                หากชำระเงินด้วย QR พร้อมเพย์ คุณสามารถกดส่งคำขอคืนเงินด้านล่างเพื่อรับเงินคืนได้
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Overview Tiles Grid (Payment Method, Amount, Delivery Info) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Payment Method */}
        <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shrink-0 shadow-inner">
            {order.pm_method === "QR Promptpay" ? <FaQrcode size={18} /> : <FaTruck size={18} />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-neutral-400 font-medium">วิธีชำระเงิน</span>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-900 truncate">
              {order.pm_method}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5">
              {order.bill_pm ? "ชำระเงินแล้ว" : "เก็บเงินเมื่อได้รับ"}
            </span>
          </div>
        </div>

        {/* Tile 2: Total Items */}
        <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shrink-0 shadow-inner">
            <FaBoxes size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-neutral-400 font-medium">จำนวนสินค้า</span>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
              {order.order_details?.length || 0} รายการ
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">
              รวมทั้งหมด {Number(order.bill_productPeace || 0)} ชิ้น
            </span>
          </div>
        </div>

        {/* Tile 3: Freight Status */}
        <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shrink-0 shadow-inner">
            <FaTruck size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-neutral-400 font-medium">ค่าจัดส่งพัสดุ</span>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
              {Number(order.bill_freighttotal || 0) > 0
                ? `฿${Number(order.bill_freighttotal).toLocaleString()}.-`
                : "จัดส่งฟรี"}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">จัดส่งทั่วประเทศไทย</span>
          </div>
        </div>

        {/* Tile 4: Net Pay Total */}
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#fbc50e] text-neutral-950 flex items-center justify-center shrink-0 shadow-xs font-black">
            ฿
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-amber-900 font-bold">ยอดสุทธิที่ชำระ</span>
            <span className="text-base sm:text-lg font-black text-[#b48300] font-mono tracking-tight">
              ฿{Number(order.bill_price || 0).toLocaleString()}.-
            </span>
            <span className="text-[10px] text-amber-700">ราคารวมภาษีแล้ว</span>
          </div>
        </div>
      </div>

      {/* 4. Shipping Address & Customer Information */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-4">
        <div className="pb-3 border-b border-neutral-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
            <FaMapMarkerAlt size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              ข้อมูลผู้รับและสถานที่จัดส่งพัสดุ
            </h3>
            <p className="text-[11px] text-neutral-400">นำส่งเฟอร์นิเจอร์ตามที่อยู่ที่ระบุไว้</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm shrink-0 border border-slate-200">
              <FaUser size={12} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-neutral-900 text-sm">
                {customerName}
              </span>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <FaPhone size={10} className="text-neutral-400" />
                  <span className="font-mono">{customerPhone}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="flex items-center gap-1">
                  <FaEnvelope size={10} className="text-neutral-400" />
                  <span>{customerEmail}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 text-xs text-neutral-700 leading-relaxed font-medium mt-1">
            {shippingAddress ? (
              <>
                {shippingAddress.address}{" "}
                {shippingAddress.sub_district && `ต./แขวง ${shippingAddress.sub_district}`}{" "}
                {shippingAddress.district && `อ./เขต ${shippingAddress.district}`}{" "}
                {shippingAddress.province && `จ.${shippingAddress.province}`}{" "}
                {shippingAddress.zipcode && shippingAddress.zipcode}
              </>
            ) : (
              <span className="text-neutral-400">
                ที่อยู่จัดส่งตามข้อมูลบัญชีผู้ใช้เมื่อทำการสั่งซื้อ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Products in Order Table Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-4">
        <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
              <FaBoxes size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                รายการสินค้าในคำสั่งซื้อ ({order.order_details?.length || 0} รายการ)
              </h3>
              <p className="text-[11px] text-neutral-400">รายการและจำนวนสินค้าที่ระบุในคำสั่งซื้อ</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-neutral-100">
          {order.order_details?.map((item) => {
            const hasDiscount = item?.product?.promotion?.discount && Number(item.product.promotion.discount) > 0;
            const originalPrice = Number(item?.product?.pro_price || 0);
            const discountedPrice = hasDiscount
              ? originalPrice - Math.round((Number(item.product.promotion.discount) / 100) * originalPrice)
              : originalPrice;

            return (
              <div
                key={item?.detail_id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-neutral-200/90 overflow-hidden bg-neutral-100 shrink-0 shadow-2xs group-hover:scale-[1.02] transition-transform">
                    <SafeImage
                      src={
                        item?.product?.imgs?.[0]?.url
                          ? envConfig.imgURL + item.product.imgs[0].url
                          : null
                      }
                      className="w-full h-full object-cover"
                      type="product"
                      alt={item?.product?.pro_name || "สินค้า"}
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4
                      className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1"
                      title={item?.product?.pro_name}
                    >
                      {item?.product?.pro_name}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1 flex-wrap">
                      {item?.color && (
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-medium">
                          สี: {item.color}
                        </span>
                      )}
                      {item?.size && (
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-medium">
                          ขนาด: {item.size}
                        </span>
                      )}
                      <span>จำนวน: <strong className="text-neutral-800">x{Number(item?.quantity || 1).toLocaleString()}</strong> ชิ้น</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-neutral-800">
                        ฿{discountedPrice.toLocaleString()}.-/ชิ้น
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-[11px] text-neutral-400 line-through">
                            ฿{originalPrice.toLocaleString()}.-
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ลด {item.product.promotion.discount}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-neutral-950 font-mono">
                    ฿{Number(item?.total_amount || 0).toLocaleString()}.-
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    (รวม {item?.quantity || 1} ชิ้น)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Payment Receipt Breakdown Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-4">
        <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
              <FaReceipt size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                สรุปยอดชำระเงิน
              </h3>
              <p className="text-[11px] text-neutral-400">รายละเอียดค่าสินค้า ส่วนลด และค่าจัดส่ง</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs text-neutral-600">
          <div className="flex justify-between items-center">
            <span>ราคารวมสินค้า ({order.order_details?.length || 0} รายการ)</span>
            <span className="font-semibold text-neutral-900 font-mono">
              ฿{Number(order.bill_totalamount || 0).toLocaleString()}.-
            </span>
          </div>

          {Number(order.bill_totalDiscount || 0) > 0 && (
            <div className="flex justify-between items-center text-rose-600">
              <span>ส่วนลดโปรโมชันพิเศษ</span>
              <span className="font-semibold font-mono">
                -฿{Number(order.bill_totalDiscount).toLocaleString()}.-
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span>ค่าจัดส่งสินค้า</span>
            <span className="font-semibold text-neutral-900 font-mono">
              {Number(order.bill_freighttotal || 0) > 0
                ? `฿${Number(order.bill_freighttotal).toLocaleString()}.-`
                : "จัดส่งฟรี"}
            </span>
          </div>

          <div className="pt-4 mt-1 border-t border-neutral-100 flex items-baseline justify-between">
            <div>
              <span className="text-sm font-extrabold text-neutral-900 block">
                ยอดชำระสุทธิ
              </span>
              <span className="text-[11px] text-neutral-400">
                ราคารวมภาษีมูลค่าเพิ่ม (VAT) แล้ว
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#b48300] font-mono tracking-tight">
              ฿{Number(order.bill_price || 0).toLocaleString()}.-
            </span>
          </div>
        </div>
      </div>

      {/* 7. Action Controls Toolbar */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: View Slip Proofs */}
        <div className="flex items-center gap-2 flex-wrap">
          {order.pm_method === "QR Promptpay" && (
            <>
              {order.slip_pm && (
                <button
                  type="button"
                  onClick={() => {
                    setSlip(envConfig.imgURL + order.slip_pm);
                    setShowModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaEye size={12} />
                  <span>ดูสลิปโอนเงิน</span>
                </button>
              )}

              {order.status_pm?.includes("return") && order.slip_return && (
                <button
                  type="button"
                  onClick={() => {
                    setSlipReturn(envConfig.imgURL + order.slip_return);
                    setShowSlipReturnModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaEye size={12} />
                  <span>ดูหลักฐานการคืนเงิน</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Right Side: Order State Actions */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Pending: Cancel Order */}
          {order.status_pm === "pending" && (
            <>
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus("cancel", id)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FaTimes size={12} />
                <span>ยกเลิกคำสั่งซื้อ</span>
              </button>

              {order.pm_method === "QR Promptpay" && (
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus("return_pending", id)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FaUndo size={12} />
                  <span>ส่งคำขอคืนเงิน</span>
                </button>
              )}
            </>
          )}

          {/* Sending: Confirm Received */}
          {order.status_pm === "sending" && (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus("recevied", id)}
              className="px-6 py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FaCheck size={13} />
              <span>ฉันได้รับสินค้าแล้ว</span>
            </button>
          )}

          {/* Cancelled PromptPay with Refund Uploaded */}
          {order.status_pm === "return_sending" && (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus("return_confirmed", id)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaCheckCircle size={13} />
              <span>ยืนยันได้รับเงินคืนแล้ว</span>
            </button>
          )}

          {/* Cancelled or Received: Buy Again CTA */}
          {(order.status_pm === "recevied" || order.status_pm === "cancel") && (
            <Link
              href="/search"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FaRedo size={11} />
              <span>ซื้ออีกครั้ง</span>
            </Link>
          )}
        </div>
      </div>

      {/* Modal: View Payment Slip & Update Slip */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-neutral-200/90 flex flex-col items-center rounded-3xl shadow-2xl bg-white gap-4 relative">
          <button
            onClick={() => setShowModal(false)}
            className="p-2 rounded-xl absolute top-4 right-4 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <FaTimes size={18} />
          </button>

          <div className="w-full pb-3 border-b border-neutral-200/80 flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#fbc50e] rounded-full shadow-xs" />
            <div>
              <h3 className="font-bold text-neutral-900 text-base">สลิปหลักฐานการชำระเงิน</h3>
              <p className="text-xs text-neutral-400">ตรวจสอบและอัปเดตสลิปสำหรับการสั่งซื้อนี้</p>
            </div>
          </div>

          {slip ? (
            <div className="w-full max-h-80 mt-1 p-2 rounded-2xl border border-neutral-200/80 overflow-hidden bg-neutral-50 shadow-2xs flex items-center justify-center">
              <SafeImage
                src={slip}
                className="w-full h-full object-contain rounded-xl max-h-80"
                type="slip"
                showFallbackText={true}
                alt="สลิปหลักฐานการชำระเงิน"
              />
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center text-neutral-400 gap-2">
              <FaQrcode size={32} className="text-neutral-300" />
              <p className="text-xs">ยังไม่มีรูปสลิปหลักฐาน</p>
            </div>
          )}

          {/* Change Slip Options if Pending */}
          {order?.status_pm === "pending" && (
            <div className="w-full flex flex-col gap-2.5 mt-2">
              <label
                htmlFor="pick-new-slip"
                className="w-full py-2.5 px-4 cursor-pointer hover:bg-neutral-800 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white transition-all shadow-xs"
              >
                <FaUpload size={12} />
                <span>{newSlipFile ? "เลือกรูปสลิปอื่น" : "อัปโหลดสลิปใหม่"}</span>
                <input
                  type="file"
                  onChange={pickNewSlip}
                  className="hidden"
                  id="pick-new-slip"
                  accept="image/*"
                />
              </label>

              {newSlipFile && (
                <button
                  disabled={updating}
                  onClick={() => updateSlip(order?.bill_id)}
                  className="w-full font-black hover:bg-[#eab308] py-3 rounded-xl bg-[#fbc50e] text-neutral-950 text-xs shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "กำลังบันทึกรูปภาพ..." : "บันทึกสลิปใหม่"}
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: View Refund Slip */}
      <Modal
        isOpen={showSlipReturnModal}
        onClose={() => setShowSlipReturnModal(false)}
      >
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-neutral-200/90 flex flex-col items-center rounded-3xl shadow-2xl bg-white gap-4 relative">
          <button
            onClick={() => setShowSlipReturnModal(false)}
            className="p-2 rounded-xl absolute top-4 right-4 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <FaTimes size={18} />
          </button>

          <div className="w-full pb-3 border-b border-neutral-200/80 flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#fbc50e] rounded-full shadow-xs" />
            <div>
              <h3 className="font-bold text-neutral-900 text-base">หลักฐานการคืนเงิน</h3>
              <p className="text-xs text-neutral-400">สลิปการโอนเงินคืนจากทางร้านค้า</p>
            </div>
          </div>

          {slipReturn ? (
            <div className="w-full max-h-80 mt-1 p-2 rounded-2xl border border-neutral-200/80 overflow-hidden bg-neutral-50 shadow-2xs flex items-center justify-center">
              <SafeImage
                src={slipReturn}
                className="w-full h-full object-contain rounded-xl max-h-80"
                type="slip"
                showFallbackText={true}
                alt="หลักฐานการคืนเงิน"
              />
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center text-neutral-400 gap-2">
              <FaReceipt size={32} className="text-neutral-300" />
              <p className="text-xs">ยังไม่พบหลักฐานการคืนเงิน</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
