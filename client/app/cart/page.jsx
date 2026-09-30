"use client";
import ProductCard from "@/components/product-card";
import SafeImage from "@/components/safe-image";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import { showSuccessToast } from "@/libs/cart-toast";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBoxes,
  FaCheck,
  FaChevronRight,
  FaHome,
  FaLock,
  FaMinus,
  FaPlus,
  FaShieldAlt,
  FaShoppingBag,
  FaShoppingCart,
  FaTrash,
  FaTruck,
  FaUndo,
} from "react-icons/fa";
import { cartFunc } from "@/libs/cart";
import useGetSeesion from "@/hooks/useGetSession";
import { useAppContext } from "@/context/app-context";
import { useRouter } from "next/navigation";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [cartProduct, setCartProduct] = useState([]);
  const { user, checking } = useGetSeesion();
  const { setCart } = useAppContext();
  const router = useRouter();

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalOriginalAmount, setTotalOriginalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalPeace, setTotalPeace] = useState(0);

  const [otherProduct, setOtherProduct] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-products");
      if (res.status === 200) {
        setOtherProduct(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProduct = () => {
    try {
      const cart = localStorage.getItem("cart");
      if (!cart) {
        setCartProduct([]);
        setTotalPeace(0);
        setTotalAmount(0);
        setTotalOriginalAmount(0);
        setTotalDiscount(0);
        setCart(0);
        return;
      }

      const data = JSON.parse(cart) || [];

      // รวมจำนวนชิ้น
      const totalPieces = data.reduce((total, item) => total + (Number(item?.count) || 1), 0);
      setTotalPeace(totalPieces);

      // คำนวณราคาเต็มและส่วนลด
      const originalAmount = data.reduce(
        (total, item) => total + (Number(item?.count) || 1) * Number(item?.pro_price || 0),
        0
      );
      setTotalOriginalAmount(originalAmount);

      const discountAmount = data.reduce((total, item) => {
        const discountPercent = Number(item?.promotion?.discount || 0);
        if (discountPercent > 0) {
          const discountPerItem = Math.round((discountPercent / 100) * Number(item?.pro_price || 0));
          return total + (Number(item?.count) || 1) * discountPerItem;
        }
        return total;
      }, 0);
      setTotalDiscount(discountAmount);

      setTotalAmount(originalAmount - discountAmount);
      setCartProduct(data);
      setCart(data.length);
    } catch (error) {
      console.error(error);
      popup.err("ไม่สามารถโหลดข้อมูลตะกร้าสินค้าได้");
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const handleMoreCount = (product, pro_number, option) => {
    cartFunc.addProduct(product, false, pro_number, option);
    getProduct();
  };

  const handleMinusCount = (product, option) => {
    cartFunc.minusProduct(product, option);
    getProduct();
  };

  const deleteProduct = (id, option) => {
    cartFunc.deleteProduct(id, option);
    getProduct();
    showSuccessToast("นำสินค้าออกจากรถเข็นแล้ว");
  };

  const clearAllCart = async () => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ล้างรถเข็นสินค้า",
      "คุณต้องการลบสินค้าทั้งหมดออกจากรถเข็นหรือไม่?",
      "ลบทั้งหมด"
    );
    if (!isConfirmed) return;

    localStorage.removeItem("cart");
    getProduct();
    showSuccessToast("ล้างรถเข็นสินค้าเรียบร้อยแล้ว");
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50/70 flex flex-col items-center pt-[135px] lg:pt-[165px] pb-24">
      {/* Breadcrumbs & Flow Steps */}
      <div className="w-full max-w-7xl px-4 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1 font-medium">
              <FaHome size={12} className="text-neutral-400" />
              <span>หน้าแรก</span>
            </Link>
            <FaChevronRight size={9} className="text-neutral-300" />
            <span className="text-neutral-900 font-bold">รถเข็นสินค้า</span>
          </div>

          {/* Stepper (1. Cart -> 2. Checkout -> 3. Completed) */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbc50e] text-neutral-950 font-bold shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-neutral-950 text-[#fbc50e] flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>รถเข็นสินค้า</span>
            </span>
            <span className="w-4 h-px bg-neutral-300" />
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-400">
              <span className="w-4 h-4 rounded-full bg-neutral-300 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>ชำระเงิน</span>
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
        {cartProduct?.length < 1 ? (
          /* Empty Cart State */
          <div className="w-full bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-8 sm:p-14 flex flex-col items-center justify-center text-center gap-5 my-4">
            <div className="w-24 h-24 rounded-full bg-amber-50 border-2 border-amber-200/70 text-amber-600 flex items-center justify-center shadow-inner">
              <FaShoppingCart size={40} />
            </div>

            <div className="flex flex-col gap-1.5 max-w-md">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                รถเข็นของคุณยังว่างอยู่
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                คุณยังไม่ได้เพิ่มสินค้าใดๆ ลงในรถเข็น ลองเลือกชมเฟอร์นิเจอร์และของแต่งบ้านคุณภาพจากเราได้เลย
              </p>
            </div>

            <Link
              href="/search"
              className="mt-2 px-8 py-3.5 rounded-2xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <FaShoppingBag size={14} />
              <span>เริ่มช้อปปิ้งเลย</span>
            </Link>
          </div>
        ) : (
          /* Active Cart Grid (Items List + Order Summary) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Header Action Bar */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 px-5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#fbc50e] rounded-full" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    รายการสินค้าในรถเข็น ({cartProduct.length} รายการ)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={clearAllCart}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FaTrash size={10} />
                  <span>ล้างรถเข็น</span>
                </button>
              </div>

              {/* Items Card List */}
              <div className="flex flex-col gap-3">
                {cartProduct.map((c, idx) => {
                  const hasDiscount = c?.promotion?.discount && Number(c.promotion.discount) > 0;
                  const unitPrice = hasDiscount
                    ? c.pro_price - Math.round((Number(c.promotion.discount) / 100) * c.pro_price)
                    : Number(c?.pro_price || 0);
                  const lineTotal = unitPrice * (Number(c?.count) || 1);

                  return (
                    <div
                      key={c?.pro_id ? `${c.pro_id}-${c?.color || ""}-${c?.size || ""}-${idx}` : idx}
                      className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs hover:border-neutral-300 transition-all"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/product-detail/${c?.pro_id}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 relative group"
                      >
                        <SafeImage
                          src={c?.imgs?.[0]?.url ? envConfig.imgURL + c.imgs[0].url : null}
                          alt={c?.pro_name || "สินค้า"}
                          type="product"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {hasDiscount && (
                          <span className="absolute top-1 left-1 bg-[#e11d48] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                            -{c.promotion.discount}%
                          </span>
                        )}
                      </Link>

                      {/* Product Details & Variant */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5 w-full">
                        <Link
                          href={`/product-detail/${c?.pro_id}`}
                          className="text-xs sm:text-sm font-bold text-neutral-900 hover:text-amber-600 transition-colors line-clamp-2 leading-snug"
                        >
                          {c?.pro_name}
                        </Link>

                        {/* Variants Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {c?.color && (
                            <span className="text-[10px] font-medium bg-neutral-100 border border-neutral-200/80 text-neutral-700 px-2 py-0.5 rounded-md">
                              สี: {c.color}
                            </span>
                          )}
                          {c?.size && (
                            <span className="text-[10px] font-medium bg-neutral-100 border border-neutral-200/80 text-neutral-700 px-2 py-0.5 rounded-md">
                              ขนาด: {c.size}
                            </span>
                          )}
                        </div>

                        {/* Unit Price */}
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xs font-bold text-neutral-900 font-mono">
                            ฿{unitPrice.toLocaleString()}.-
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] text-neutral-400 line-through">
                              ฿{Number(c.pro_price).toLocaleString()}.-
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400">
                            /{c?.unit || "ชิ้น"}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        {/* Stepper */}
                        <div className="flex items-center border border-neutral-200/90 rounded-xl overflow-hidden bg-neutral-50 shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              handleMinusCount(c, {
                                color: c?.color,
                                size: c?.size,
                              })
                            }
                            className="p-2 px-3 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 transition-colors cursor-pointer"
                            aria-label="ลดจำนวน"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="px-3.5 text-xs font-black text-neutral-950 min-w-[36px] text-center font-mono">
                            {c?.count || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleMoreCount(c, c?.pro_number, {
                                color: c?.color,
                                size: c?.size,
                              })
                            }
                            className="p-2 px-3 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 transition-colors cursor-pointer"
                            aria-label="เพิ่มจำนวน"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-xs text-neutral-400 sm:hidden block text-[10px]">ราคารวม:</span>
                          <span className="text-sm sm:text-base font-black text-neutral-950 font-mono">
                            ฿{lineTotal.toLocaleString()}.-
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => deleteProduct(c?.pro_id, { color: c?.color, size: c?.size })}
                          className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบสินค้านี้"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery perks note */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex items-center gap-3 text-amber-900 text-xs">
                <FaTruck className="text-amber-600 shrink-0" size={16} />
                <span>
                  สั่งซื้อสินค้าเฟอร์นิเจอร์ออนไลน์ บริการจัดส่งและยกติดตั้งถึงห้องทั่วประเทศไทย
                </span>
              </div>
            </div>

            {/* Right Column: Order Summary Card (4 cols) */}
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
                    <span>รวมราคาสินค้า ({cartProduct.length} รายการ)</span>
                    <span className="font-semibold text-neutral-900 font-mono">
                      ฿{totalOriginalAmount.toLocaleString()}.-
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
                    <span className="font-semibold text-emerald-700">
                      คำนวณในขั้นตอนถัดไป
                    </span>
                  </div>

                  <div className="pt-3.5 mt-1 border-t border-neutral-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-neutral-900 block">
                        ยอดรวมโดยประมาณ
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        ราคารวมภาษีมูลค่าเพิ่มแล้ว
                      </span>
                    </div>
                    <span className="text-2xl font-black text-neutral-950 font-mono tracking-tight">
                      ฿{totalAmount.toLocaleString()}.-
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  disabled={checking}
                  onClick={() => {
                    if (user) {
                      router.push("/checkout");
                    } else {
                      router.push("/auth/sign-in");
                    }
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>ดำเนินการสั่งซื้อสินค้า</span>
                  <FaArrowRight size={12} />
                </button>

                {/* Store Guarantee Icons */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-neutral-500 text-[10px] text-center">
                  <div className="flex flex-col items-center gap-1">
                    <FaShieldAlt className="text-amber-600" size={14} />
                    <span>รับประกันของแท้</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <FaUndo className="text-amber-600" size={14} />
                    <span>เปลี่ยนคืนใน 7 วัน</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <FaLock className="text-amber-600" size={14} />
                    <span>ชำระเงินปลอดภัย</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Other Products Section */}
        {otherProduct?.length > 0 && (
          <div className="mt-16 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-[#fbc50e] rounded-full" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  สินค้าที่คุณอาจสนใจเพิ่มเติม
                </h3>
              </div>
              <Link
                href="/search"
                className="text-xs font-bold text-neutral-600 hover:text-amber-600 transition-colors flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <FaChevronRight size={10} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {otherProduct.slice(0, 6).map((p) => (
                <ProductCard key={p?.pro_id} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
