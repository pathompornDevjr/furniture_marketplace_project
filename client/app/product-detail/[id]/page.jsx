"use client";
import {
  FaCartPlus,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaHome,
  FaCheck,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaBoxes,
} from "react-icons/fa";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import SafeImage from "@/components/safe-image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { NO_IMG_PRODUCT } from "@/config/constants";
import { v4 as uuid } from "uuid";
import { cartFunc } from "@/libs/cart";
import { showWarningToast } from "@/libs/cart-toast";
import { useAppContext } from "@/context/app-context";
import useGetSeesion from "@/hooks/useGetSession";

const ShopDetail = () => {
  const { user } = useGetSeesion();
  const params = useParams();
  const { id } = params;
  const [mainImg, setMainImg] = useState(null);
  const [count, setCount] = useState(1);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [selectColor, setSelectColor] = useState();
  const [selectSize, setSelectSize] = useState();
  const { setCart } = useAppContext();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  const fetchProduct = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + `/guest/product/${id}`);
      if (res.status === 200) {
        setProduct(res.data);
        if (res?.data?.imgs?.[0]?.url) {
          setMainImg(envConfig.imgURL + res.data.imgs[0].url);
        } else {
          setMainImg(null);
        }

        const colors = res?.data?.pro_color ? res.data.pro_color.split(",").map(c => c.trim()).filter(Boolean) : [];
        setColorOptions(colors);
        if (colors.length === 1) {
          setSelectColor(colors[0]);
        }

        const sizes = res?.data?.pro_size ? res.data.pro_size.split(",").map(s => s.trim()).filter(Boolean) : [];
        setSizeOptions(sizes);
        if (sizes.length === 1) {
          setSelectSize(sizes[0]);
        }
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const changeMainImg = (url) => {
    setMainImg(url ? envConfig.imgURL + url : null);
  };

  const handleSaveToCart = () => {
    if (product?.pro_number < 1) {
      showWarningToast("ขออภัย สินค้าหมดชั่วคราว");
      return false;
    }
    if (colorOptions.length > 1 && !selectColor) {
      showWarningToast("กรุณาเลือกสีก่อนเพิ่มลงในรถเข็น");
      return false;
    }
    if (sizeOptions.length > 1 && !selectSize) {
      showWarningToast("กรุณาเลือกขนาดก่อนเพิ่มลงในรถเข็น");
      return false;
    }

    const options = {
      color: selectColor,
      size: selectSize,
    };
    cartFunc.addToCartWithOptions(product, options, count, product?.pro_number);

    const carts = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(carts.length);

    return true;
  };

  const [sameCtgProduct, setSameCtgProduct] = useState([]);
  const fetchSameCtgProduct = async (catIds) => {
    if (!catIds) return;
    try {
      const res = await axios.get(
        envConfig.apiURL + `/guest/same-ctg-product/${catIds}`
      );
      if (res.status === 200) {
        setSameCtgProduct(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [otherProduct, setOtherProduct] = useState([]);
  const fetchOtherProduct = async (excludeIds) => {
    try {
      const res = await axios.get(
        envConfig.apiURL + `/guest/notsame-ctg-product/${excludeIds}`
      );
      if (res.status === 200) {
        setOtherProduct(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (product?.categories?.length > 0) {
      fetchSameCtgProduct(product.categories.map((p) => p.id).join(","));
    }
  }, [product]);

  useEffect(() => {
    if (sameCtgProduct.length > 0) {
      fetchOtherProduct(sameCtgProduct.map((s) => s?.pro_id).join(","));
    }
  }, [sameCtgProduct]);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return <Loading />;
  if (!product) return null;

  const hasDiscount = product?.promotion?.discount && Number(product.promotion.discount) > 0;
  const discountedPrice = hasDiscount
    ? product.pro_price - Math.round((Number(product.promotion.discount) / 100) * product.pro_price)
    : product.pro_price;

  return (
    <div className="w-full min-h-screen bg-neutral-50/60 flex flex-col items-center pt-[140px] lg:pt-[170px] pb-20">
      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-7xl px-4 lg:px-8 mb-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
          <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1 font-medium">
            <FaHome size={12} className="text-neutral-400" />
            <span>หน้าแรก</span>
          </Link>
          <FaChevronRight size={9} className="text-neutral-300" />
          <Link href="/search" className="hover:text-neutral-900 transition-colors font-medium">
            สินค้าทั้งหมด
          </Link>
          {product?.categories?.[0] && (
            <>
              <FaChevronRight size={9} className="text-neutral-300" />
              <Link
                href={`/search?category=${product.categories[0].id}`}
                className="hover:text-neutral-900 transition-colors font-medium text-neutral-600"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <FaChevronRight size={9} className="text-neutral-300" />
          <span className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product?.pro_name}
          </span>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="w-full max-w-7xl px-4 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 lg:p-9 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="w-full lg:w-[46%] flex flex-col gap-4">
            <div className="w-full aspect-[4/3] sm:aspect-square bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/80 relative group shadow-2xs">
              {hasDiscount && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="bg-[#e11d48] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                    ลด {product.promotion.discount}%
                  </span>
                </div>
              )}
              {product?.pro_number < 1 && (
                <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-1">
                  <span className="px-3.5 py-1.5 bg-neutral-900 text-[#fbc50e] font-extrabold text-xs uppercase tracking-wider rounded border border-neutral-700">
                    สินค้าหมดชั่วคราว
                  </span>
                  <p className="text-[11px] text-white/90">Out of Stock</p>
                </div>
              )}
              <SafeImage
                src={mainImg}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={product?.pro_name}
                type="product"
                showFallbackText={true}
              />
            </div>

            {/* Small Thumbnails Slider */}
            {product?.imgs?.length > 1 && (
              <div className="w-full relative">
                <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {product.imgs.map((img, idx) => {
                    const fullUrl = img?.url ? envConfig.imgURL + img.url : null;
                    const isSelected = mainImg === fullUrl;
                    return (
                      <button
                        key={uuid()}
                        type="button"
                        onClick={() => changeMainImg(img?.url)}
                        onMouseEnter={() => changeMainImg(img?.url)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 border-2 shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#fbc50e] ring-2 ring-[#fbc50e]/30 shadow-xs"
                            : "border-neutral-200/90 hover:border-neutral-300"
                        }`}
                      >
                        <SafeImage
                          src={fullUrl}
                          className="w-full h-full object-cover"
                          alt={`thumbnail-${idx}`}
                          type="product"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-black text-neutral-900 leading-snug tracking-tight">
                  {product?.pro_name}
                </h1>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-neutral-500 flex-wrap">
                  <span>
                    หมวดหมู่:{" "}
                    <span className="font-semibold text-neutral-800">
                      {product?.categories?.map((p) => p.name)?.join(", ") || "-"}
                    </span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>
                    ขายแล้ว{" "}
                    <span className="font-semibold text-neutral-800">
                      {product?.sell_count?.toLocaleString() || 0}
                    </span>{" "}
                    {product?.unit || "ชิ้น"}
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/90 flex flex-col gap-2">
                {hasDiscount ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block text-[11px] font-extrabold text-white bg-[#e11d48] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                        ลดพิเศษ {product.promotion.discount}%
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        ราคาสุดพิเศษเฉพาะช่วงนี้
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                        ฿{discountedPrice.toLocaleString()}.-
                      </span>
                      <span className="text-sm text-neutral-400 line-through">
                        ฿{product?.pro_price?.toLocaleString()}.-
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        ประหยัด ฿{Math.round((Number(product.promotion.discount) / 100) * product.pro_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                      ฿{Number(product?.pro_price || 0).toLocaleString()}.-
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">/{product?.unit || "ชิ้น"}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 border-b border-neutral-100 pb-5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  รายละเอียดสินค้า
                </span>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {product?.pro_details || "ไม่มีรายละเอียดสินค้าเพิ่มเติม"}
                </p>
              </div>

              {/* Stock Level */}
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <span className="text-neutral-400 w-20 shrink-0 font-medium">คลังสินค้า</span>
                <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  <FaBoxes className="text-neutral-400" size={13} />
                  {product?.pro_number > 0 ? (
                    <span>
                      มีสินค้าพร้อมส่ง {product?.pro_number?.toLocaleString()} {product?.unit || "ชิ้น"}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">สินค้าหมดชั่วคราว</span>
                  )}
                </span>
              </div>

              {/* Color Selector */}
              {colorOptions.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-neutral-400 w-20 pt-2 text-xs font-medium shrink-0">
                    ตัวเลือกสี
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((c) => {
                      const isSelected = selectColor === c;
                      return (
                        <button
                          key={uuid()}
                          type="button"
                          onClick={() => setSelectColor(c)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "border-[#fbc50e] bg-amber-50 text-neutral-950 ring-2 ring-[#fbc50e]/30 shadow-2xs"
                              : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          {isSelected && <FaCheck size={10} className="text-amber-700" />}
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizeOptions.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-neutral-400 w-20 pt-2 text-xs font-medium shrink-0">
                    ขนาด
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((s) => {
                      const isSelected = selectSize === s;
                      return (
                        <button
                          key={uuid()}
                          type="button"
                          onClick={() => setSelectSize(s)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "border-[#fbc50e] bg-amber-50 text-neutral-950 ring-2 ring-[#fbc50e]/30 shadow-2xs"
                              : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          {isSelected && <FaCheck size={10} className="text-amber-700" />}
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              {product?.pro_number > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-neutral-400 w-20 text-xs font-medium shrink-0">จำนวน</span>
                  <div className="flex items-center border border-neutral-200/90 rounded-xl overflow-hidden bg-neutral-50 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCount((prev) => (prev <= 1 ? 1 : prev - 1))}
                      className="p-2.5 px-3.5 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-950 transition-colors cursor-pointer"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="px-4 text-xs sm:text-sm font-black text-neutral-950 min-w-[42px] text-center font-mono">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCount((prev) => (product?.pro_number && prev >= product.pro_number ? prev : prev + 1))
                      }
                      className="p-2.5 px-3.5 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-950 transition-colors cursor-pointer"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                  {product?.unit && (
                    <span className="text-xs text-neutral-400 font-medium">
                      ({product.unit})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions & Trust Perks */}
            <div className="flex flex-col gap-4 pt-2">
              {/* Purchase Controls */}
              {product?.pro_number > 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveToCart}
                    className="flex-1 py-3.5 px-6 rounded-2xl border-2 border-neutral-900 text-neutral-950 hover:bg-neutral-100 flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.99] shadow-2xs"
                  >
                    <FaCartPlus size={15} />
                    <span>เพิ่มไปยังรถเข็น</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ok = handleSaveToCart();
                      if (!ok) return;
                      if (!user) {
                        return router.push("/auth/sign-in");
                      }
                      router.push("/checkout");
                    }}
                    className="flex-1 py-3.5 px-8 rounded-2xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all text-center cursor-pointer active:scale-[0.99]"
                  >
                    <span>ซื้อสินค้าทันที</span>
                  </button>
                </div>
              ) : (
                <div className="w-full p-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-center font-bold text-neutral-400">
                  สินค้าหมดชั่วคราว
                </div>
              )}

              {/* Store Guarantee Perks */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-neutral-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <FaTruck size={12} />
                  </div>
                  <span className="font-medium truncate">จัดส่งทั่วไทย</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <FaShieldAlt size={12} />
                  </div>
                  <span className="font-medium truncate">รับประกันของแท้</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <FaUndo size={12} />
                  </div>
                  <span className="font-medium truncate">เปลี่ยนคืนใน 7 วัน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Same Category products */}
      {sameCtgProduct?.length > 0 && (
        <div className="w-full max-w-7xl px-4 lg:px-8 mt-12 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#fbc50e] rounded-full" />
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                สินค้าในหมวดหมู่เดียวกัน
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
            {sameCtgProduct.slice(0, 6).map((s) => (
              <ProductCard key={s?.pro_id} {...s} />
            ))}
          </div>
        </div>
      )}

      {/* Other suggested products */}
      {otherProduct?.length > 0 && (
        <div className="w-full max-w-7xl px-4 lg:px-8 mt-12 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#fbc50e] rounded-full" />
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                สินค้าที่คุณอาจสนใจ
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
            {otherProduct.slice(0, 6).map((o) => (
              <ProductCard key={o?.pro_id} {...o} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;
