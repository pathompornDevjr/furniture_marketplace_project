"use client";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import SafeImage from "@/components/safe-image";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import { showWarningToast, showSuccessToast, showErrorToast } from "@/libs/cart-toast";
import { useAppContext } from "@/context/app-context";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBoxes,
  FaCheck,
  FaCheckCircle,
  FaChevronRight,
  FaEnvelope,
  FaHome,
  FaLock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaQrcode,
  FaShieldAlt,
  FaShoppingBag,
  FaShoppingCart,
  FaTimes,
  FaTrash,
  FaTruck,
  FaUndo,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { NO_IMG_PRODUCT } from "@/config/constants";
import { useRouter } from "next/navigation";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartProduct, setCartProduct] = useState([]);
  const { user, checking } = useGetSeesion();
  const { setCart } = useAppContext();
  const [data, setData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(1); // Default to Cash on Delivery (1)
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPeace, setTotalPeace] = useState(0);
  const [totalFreight, setTotalFreight] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [slip, setSlip] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const router = useRouter();
  const [address, setAddress] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/check-out-data", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setData(res.data);
        setAddress(res.data?.tb_user_address?.[0] || null);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    router.prefetch("/profile/order-history");
    if (!user || checking) return;
    fetchData();
  }, [user, checking, router]);

  const getProduct = () => {
    const cart = localStorage.getItem("cart");
    if (!cart) {
      setCartProduct([]);
      setTotalPeace(0);
      setTotalAmount(0);
      setTotalFreight(0);
      setTotalDiscount(0);
      return;
    }

    try {
      const data = JSON.parse(cart) || [];

      // รวมจำนวนชิ้น
      const totalPieces = data.reduce((total, item) => total + (Number(item?.count) || 1), 0);
      setTotalPeace(totalPieces);

      // รวมราคารวมทั้งหมด
      const originalAmount = data.reduce(
        (total, item) => total + (Number(item?.count) || 1) * Number(item?.pro_price || 0),
        0
      );

      const discountAmount = data.reduce((total, item) => {
        const discountPercent = Number(item?.promotion?.discount || 0);
        if (discountPercent > 0) {
          const discountPerItem = Math.round((discountPercent / 100) * Number(item?.pro_price || 0));
          return total + (Number(item?.count) || 1) * discountPerItem;
        }
        return total;
      }, 0);

      setTotalDiscount(discountAmount);
      setTotalAmount(originalAmount);

      const freight = data?.reduce(
        (total, item) => Math.ceil((total + (Number(item?.freight) || 0)) / (data.length || 1)),
        0
      );
      setTotalFreight(freight || 0);
      setCartProduct(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const getQrCode = async () => {
    setConfirming(true);
    try {
      const netPay = totalAmount + totalFreight - totalDiscount;
      const res = await axios.get(
        envConfig.apiURL + `/user/qrcode-promptpay/${netPay}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setQrCode(res.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setConfirming(false);
    }
  };

  const handleConfirmOrder = () => {
    getProduct();
    if (!data?.email && !user?.email) {
      showWarningToast("กรุณาระบุอีเมลในบัญชีของคุณเพื่อรับข้อมูลคำสั่งซื้อ");
      return false;
    }
    if (!address?.address) {
      showWarningToast("กรุณาเพิ่มที่อยู่สำหรับจัดส่งสินค้าก่อนดำเนินการ");
      return false;
    }
    if (paymentMethod === 0) {
      showWarningToast("กรุณาเลือกช่องทางการชำระเงิน");
      return false;
    }
    if (paymentMethod === 2) {
      getQrCode();
      return false;
    }

    if (paymentMethod === 1) {
      createOrder();
    }
  };

  const slipPicker = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlip(URL.createObjectURL(file));
      setSlipFile(file);
    }
  };

  const createOrder = async () => {
    const { isConfirmed: lastConfirm } = await popup.confirmPopUp(
      "ยืนยันการสั่งซื้อสินค้า?",
      "ระบบจะส่งคำสั่งซื้อไปยังผู้ดูแลเพื่อดำเนินการจัดส่ง",
      "ยืนยันการสั่งซื้อ"
    );
    if (!lastConfirm) return;

    setConfirming(true);
    try {
      const formData = new FormData();
      formData.append("cart-product", JSON.stringify(cartProduct));
      formData.append(
        "payment-method",
        paymentMethod === 1 ? "เก็บปลายทาง" : "QR Promptpay"
      );
      formData.append("totalProductList", cartProduct.length);
      formData.append("totalPeace", totalPeace);
      formData.append("totalProductPrice", totalAmount);
      formData.append("totalFreight", totalFreight);
      formData.append("totalPay", totalFreight + totalAmount - totalDiscount);
      formData.append("totalDiscount", totalDiscount);
      formData.append("user_id", user?.user_id);
      if (paymentMethod === 2 && slipFile) {
        formData.append("slip", slipFile);
      }

      const res = await axios.post(
        envConfig.apiURL + "/user/create-order",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        setShowModal(false);
        localStorage.removeItem("cart");
        setCart(0);
        showSuccessToast("สั่งซื้อสินค้าสำเร็จเรียบร้อยแล้ว!");
        router.replace("/profile/order-history");
        setTimeout(() => {
          if (window.location.pathname !== "/profile/order-history") {
            window.location.href = "/profile/order-history";
          }
        }, 150);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <Loading />;

  if (cartProduct?.length < 1) {
    return (
      <div className="w-full min-h-screen bg-neutral-50/70 flex flex-col items-center justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-8 sm:p-12 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200/70 text-amber-600 flex items-center justify-center shadow-inner">
            <FaShoppingCart size={32} />
          </div>
          <h2 className="text-xl font-black text-neutral-900">ไม่มีสินค้าที่ต้องชำระเงิน</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            รถเข็นของคุณยังว่างอยู่ โปรดเลือกสินค้าก่อนเข้าสู่ขั้นตอนชำระเงิน
          </p>
          <Link
            href="/search"
            className="mt-2 px-7 py-3 rounded-2xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <FaShoppingBag size={13} />
            <span>เลือกซื้อสินค้า</span>
          </Link>
        </div>
      </div>
    );
  }

  const netPayTotal = totalAmount + totalFreight - totalDiscount;

  return (
    <div className="w-full min-h-screen bg-neutral-50/70 flex flex-col items-center pt-[135px] lg:pt-[165px] pb-24">
      {/* Breadcrumb & Step Progress Tracker */}
      <div className="w-full max-w-7xl px-4 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1 font-medium">
              <FaHome size={12} className="text-neutral-400" />
              <span>หน้าแรก</span>
            </Link>
            <FaChevronRight size={9} className="text-neutral-300" />
            <Link href="/cart" className="hover:text-neutral-900 transition-colors font-medium">
              รถเข็นสินค้า
            </Link>
            <FaChevronRight size={9} className="text-neutral-300" />
            <span className="text-neutral-900 font-bold">ตรวจสอบและชำระเงิน</span>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link
              href="/cart"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <FaCheck size={10} className="text-emerald-600" />
              <span>รถเข็นสินค้า</span>
            </Link>
            <span className="w-4 h-px bg-neutral-300" />
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbc50e] text-neutral-950 font-bold shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-neutral-950 text-[#fbc50e] flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>ตรวจสอบ & ชำระเงิน</span>
            </span>
            <span className="w-4 h-px bg-neutral-300" />
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-400">
              <span className="w-4 h-4 rounded-full bg-neutral-300 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>สำเร็จ</span>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Address, Items List, Payment Method */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Delivery Address Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                    <FaMapMarkerAlt size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      ที่อยู่สำหรับจัดส่งพัสดุ
                    </h3>
                    <p className="text-[11px] text-neutral-400">ข้อมูลผู้รับและสถานที่นำส่งสินค้า</p>
                  </div>
                </div>

                <Link
                  href="/profile/address"
                  className="text-xs font-bold text-neutral-700 hover:text-amber-700 px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all flex items-center gap-1"
                >
                  <span>{address ? "เปลี่ยนที่อยู่" : "+ เพิ่มที่อยู่"}</span>
                </Link>
              </div>

              {address ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm shrink-0 border border-slate-200">
                      {data?.first_name ? data.first_name.slice(0, 1) : <FaUser size={13} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-neutral-900 text-sm">
                        {data?.title_type || ""}
                        {data?.first_name || "ผู้สั่งซื้อ"} {data?.last_name || ""}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FaPhone size={10} className="text-neutral-400" />
                          <span className="font-mono">{address?.phone || data?.tel || "ไม่ระบุเบอร์โทร"}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                        <span className="flex items-center gap-1">
                          <FaEnvelope size={10} className="text-neutral-400" />
                          <span>{data?.email || user?.email || "ไม่ระบุอีเมล"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 text-xs text-neutral-700 leading-relaxed font-medium mt-1">
                    {address?.address}{" "}
                    {address?.sub_district && `ต./แขวง ${address.sub_district}`}{" "}
                    {address?.district && `อ./เขต ${address.district}`}{" "}
                    {address?.province && `จ.${address.province}`}{" "}
                    {address?.zipcode && address.zipcode}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/30 flex flex-col items-center justify-center text-center gap-2">
                  <p className="text-xs font-bold text-neutral-800">ยังไม่มีข้อมูลที่อยู่จัดส่งในระบบ</p>
                  <p className="text-[11px] text-neutral-500">
                    โปรดเพิ่มที่อยู่ของคุณเพื่อให้เราสามารถจัดส่งเฟอร์นิเจอร์ได้อย่างถูกต้อง
                  </p>
                  <Link
                    href="/profile/address"
                    className="mt-1 px-4 py-2 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-2xs"
                  >
                    + เพิ่มที่อยู่จัดส่งใหม่
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Order Items Review Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                    <FaBoxes size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      รายการสินค้าที่สั่งซื้อ ({cartProduct.length} รายการ)
                    </h3>
                    <p className="text-[11px] text-neutral-400">ตรวจสอบรายการสินค้าและจำนวนชิ้น</p>
                  </div>
                </div>
                <Link
                  href="/cart"
                  className="text-xs font-semibold text-neutral-600 hover:text-amber-600 transition-colors"
                >
                  แก้ไขในรถเข็น
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-neutral-100">
                {cartProduct.map((c, idx) => {
                  const hasDiscount = c?.promotion?.discount && Number(c.promotion.discount) > 0;
                  const unitPrice = hasDiscount
                    ? c.pro_price - Math.round((Number(c.promotion.discount) / 100) * c.pro_price)
                    : Number(c?.pro_price || 0);
                  const lineTotal = unitPrice * (Number(c?.count) || 1);

                  return (
                    <div
                      key={c?.pro_id ? `${c.pro_id}-${idx}` : idx}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-16 h-16 rounded-xl border border-neutral-200/90 overflow-hidden bg-neutral-100 shrink-0 shadow-2xs">
                          <SafeImage
                            src={c?.imgs?.[0]?.url ? envConfig.imgURL + c.imgs[0].url : null}
                            className="w-full h-full object-cover"
                            type="product"
                            alt={c?.pro_name || "สินค้า"}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate" title={c?.pro_name}>
                            {c?.pro_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500 flex-wrap">
                            {c?.color && (
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-medium">
                                สี: {c.color}
                              </span>
                            )}
                            {c?.size && (
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-medium">
                                ขนาด: {c.size}
                              </span>
                            )}
                            <span>จำนวน: <strong className="text-neutral-800">{c?.count || 1}</strong> {c?.unit || "ชิ้น"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-neutral-950 font-mono">
                          ฿{lineTotal.toLocaleString()}.-
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          (฿{unitPrice.toLocaleString()}/{c?.unit || "ชิ้น"})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment Method Selection Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs flex flex-col gap-4">
              <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    เลือกวิธีการชำระเงิน
                  </h3>
                  <p className="text-[11px] text-neutral-400">เลือกช่องทางการชำระเงินที่คุณสะดวก</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <FaShieldAlt size={10} />
                  <span>ระบบปลอดภัย</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Method 1: เก็บเงินปลายทาง */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(1)}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    paymentMethod === 1
                      ? "border-[#fbc50e] bg-amber-50/40 ring-2 ring-[#fbc50e]/30 shadow-2xs"
                      : "border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 1
                        ? "bg-[#fbc50e] text-neutral-950 shadow-xs"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <FaTruck size={16} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">
                        เก็บเงินปลายทาง (COD)
                      </span>
                      {paymentMethod === 1 && (
                        <FaCheckCircle size={14} className="text-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      ชำระเงินสดหรือโอนผ่านพนักงานจัดส่งเมื่อได้รับสินค้า
                    </p>
                  </div>
                </button>

                {/* Method 2: QR PromptPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(2)}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    paymentMethod === 2
                      ? "border-[#fbc50e] bg-amber-50/40 ring-2 ring-[#fbc50e]/30 shadow-2xs"
                      : "border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 2
                        ? "bg-[#fbc50e] text-neutral-950 shadow-xs"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <FaQrcode size={16} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">
                        QR พร้อมเพย์ (PromptPay)
                      </span>
                      {paymentMethod === 2 && (
                        <FaCheckCircle size={14} className="text-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      สแกนจ่ายผ่านแอปธนาคารทุกแห่งและแนบสลิปหลักฐาน
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Order Summary */}
          <div className="lg:col-span-4 sticky top-[150px] flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                <h3 className="text-base font-black text-neutral-900">
                  สรุปคำสั่งซื้อ
                </h3>
                <span className="text-xs font-semibold text-neutral-500">
                  {totalPeace} ชิ้น
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>ราคารวมสินค้า ({cartProduct.length} รายการ)</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    ฿{totalAmount.toLocaleString()}.-
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>ส่วนลดสินค้าโปรโมชัน</span>
                    <span className="font-semibold font-mono">
                      -฿{totalDiscount.toLocaleString()}.-
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>ค่าจัดส่งสินค้า</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {totalFreight > 0 ? `฿${totalFreight.toLocaleString()}.-` : "จัดส่งฟรี"}
                  </span>
                </div>

                <div className="pt-3.5 mt-1 border-t border-neutral-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-neutral-900 block">
                      ยอดชำระสุทธิ
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ราคารวมภาษีมูลค่าเพิ่มแล้ว
                    </span>
                  </div>
                  <span className="text-2xl font-black text-neutral-950 font-mono tracking-tight text-[#b48300]">
                    ฿{netPayTotal.toLocaleString()}.-
                  </span>
                </div>
              </div>

              {/* Order Confirmation CTA Button */}
              <button
                type="button"
                disabled={confirming}
                onClick={handleConfirmOrder}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {confirming ? (
                  <Loader />
                ) : paymentMethod === 2 ? (
                  <>
                    <FaQrcode size={15} />
                    <span>ชำระผ่าน QR พร้อมเพย์</span>
                  </>
                ) : (
                  <>
                    <FaCheck size={13} />
                    <span>ยืนยันคำสั่งซื้อ</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                *เมื่อกดยืนยันคำสั่งซื้อ คุณยอมรับเงื่อนไขการบริการและนโยบายความเป็นส่วนตัวของระบบ
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-neutral-500 text-[10px] text-center">
                <div className="flex flex-col items-center gap-1">
                  <FaTruck className="text-amber-600" size={14} />
                  <span>จัดส่งทั่วไทย</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FaShieldAlt className="text-amber-600" size={14} />
                  <span>รับประกันของแท้</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FaLock className="text-amber-600" size={14} />
                  <span>ปลอดภัย 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code PromptPay Payment Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 bg-white rounded-3xl border border-neutral-200/90 shadow-2xl flex flex-col gap-5 relative">
          {/* Modal Header */}
          <div className="w-full pb-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">ชำระเงินผ่าน QR พร้อมเพย์</h2>
                <p className="text-xs text-neutral-400">สแกน QR Code และแนบสลิปเพื่อยืนยันคำสั่งซื้อ</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Order Summary Receipt Box */}
          <div className="w-full p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col gap-2">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider pb-1.5 border-b border-neutral-200/60">
              สรุปยอดคำสั่งซื้อ
            </p>
            <div className="flex text-xs items-center justify-between text-neutral-600">
              <span>สินค้าทั้งหมด</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {cartProduct?.length?.toLocaleString()} รายการ ({totalPeace.toLocaleString()} ชิ้น)
              </span>
            </div>
            <div className="flex text-xs items-center justify-between text-neutral-600">
              <span>รวมราคาสินค้า</span>
              <span className="font-semibold text-neutral-900 font-mono">฿{totalAmount.toLocaleString()}.-</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex text-xs items-center justify-between text-rose-600">
                <span>ส่วนลดพิเศษ</span>
                <span className="font-semibold font-mono">-฿{totalDiscount.toLocaleString()}.-</span>
              </div>
            )}
            <div className="flex text-xs items-center justify-between text-neutral-600">
              <span>ค่าจัดส่ง</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {totalFreight > 0 ? `฿${totalFreight.toLocaleString()}.-` : "จัดส่งฟรี"}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">ยอดชำระสุทธิ</span>
              <span className="text-2xl font-black text-[#b48300] font-mono">
                ฿{netPayTotal.toLocaleString()}.-
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="w-full flex flex-col items-center gap-2 pt-1">
            <p className="text-xs font-semibold text-neutral-700 text-center">
              สแกน QR Code นี้ผ่านแอปธนาคารใดก็ได้เพื่อชำระเงิน
            </p>
            <div className="w-56 h-56 p-3 rounded-2xl border-2 border-neutral-200 bg-white shadow-xs flex items-center justify-center overflow-hidden">
              <img
                src={qrCode || NO_IMG_PRODUCT}
                className="w-full h-full object-contain"
                alt="QR Code"
              />
            </div>
            <p className="text-[11px] text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 text-center font-medium">
              เมื่อชำระแล้ว กรุณาอัปโหลดสลิปหลักฐานด้านล่าง
            </p>
          </div>

          {/* Slip Upload & Action */}
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="pick-slip"
                className="py-2.5 px-4 cursor-pointer bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 rounded-xl transition-all shadow-xs"
              >
                <FaUpload size={12} />
                <span>{slip ? "เปลี่ยนรูปสลิป" : "อัปโหลดสลิปหลักฐาน"}</span>
                <input
                  type="file"
                  onChange={slipPicker}
                  className="hidden"
                  id="pick-slip"
                  accept="image/*"
                />
              </label>
              {slip && (
                <button
                  type="button"
                  onClick={() => {
                    setSlip("");
                    setSlipFile(null);
                  }}
                  className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 text-xs flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <FaTrash size={12} />
                  <span>ลบรูป</span>
                </button>
              )}
            </div>

            {slip && (
              <div className="w-48 max-h-56 overflow-hidden rounded-xl border border-neutral-200 shadow-xs p-1 bg-neutral-50">
                <img src={slip} className="w-full h-full object-contain rounded-lg" alt="Slip" />
              </div>
            )}

            {slip && (
              <div className="w-full flex flex-col gap-2 mt-1">
                <p className="text-[11px] text-neutral-500 text-center">
                  *คำสั่งซื้อจะถูกส่งไปยังระบบ Admin เพื่อตรวจสอบความถูกต้องทันที
                </p>
                <button
                  disabled={confirming}
                  onClick={createOrder}
                  className="w-full py-3.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-sm rounded-2xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {confirming ? "กำลังยืนยันคำสั่งซื้อ..." : "ยืนยันการชำระเงินและสั่งซื้อ"}
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
