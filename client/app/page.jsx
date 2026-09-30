"use client";
import ProductCard from "@/components/product-card";
import { envConfig } from "@/config/env-config";
import { useAppContext } from "@/context/app-context";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronRight,
  FaClock,
  FaFire,
  FaRedo,
  FaShieldAlt,
  FaTag,
  FaTruck,
} from "react-icons/fa";
import { NO_IMG_PRODUCT } from "@/config/constants";
import SafeImage from "@/components/safe-image";

const defaultBanners = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=80",
];

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [bannersList, setBannerList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { setSearchCtgs } = useAppContext();

  const handleCtgClick = (id) => {
    setSearchCtgs((prev) =>
      prev.find((p) => p === id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
    router.push("/search");
  };

  const activeBanners =
    bannersList && bannersList.length > 0
      ? bannersList.map((b) =>
          b.img?.startsWith("http") ? b.img : envConfig.imgURL + b.img
        )
      : defaultBanners;

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);

  const prevSlide = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );

  // Auto slide every 5 seconds
  useEffect(() => {
    if (activeBanners.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const fetchCTG = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-ctg");
      if (res.status === 200) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-products");
      if (res.status === 200) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-banners");
      if (res.status === 200) {
        setBannerList(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCTG();
    fetchProducts();
    fetchBanners();
  }, []);

  if (loading) return <Loading />;

  // Filter flash deal / discounted products
  const discountedProducts = products.filter(
    (p) => p?.promotion?.discount && Number(p?.promotion?.discount) > 0
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col items-center pt-[130px] lg:pt-[150px] pb-16">
      {/* 1. Hero Banner Slider (Index Living Mall 100% Full Width Edge-to-Edge) */}
      <section className="w-full">
        <div className="relative w-full h-[240px] sm:h-[360px] md:h-[440px] lg:h-[500px] xl:h-[560px] 2xl:h-[620px] overflow-hidden group bg-neutral-900">
          {/* Slides */}
          <div className="w-full h-full relative">
            {activeBanners.map((b, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <SafeImage
                  src={b}
                  className="w-full h-full object-cover object-center"
                  type="banner"
                  alt={`Banner ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 inset-x-3 sm:inset-x-6 lg:inset-x-8 flex items-center justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevSlide}
              className="p-3 lg:p-4 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
              aria-label="Previous Slide"
            >
              <FaArrowLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 lg:p-4 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
              aria-label="Next Slide"
            >
              <FaArrowRight size={16} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? "bg-[#fbc50e] w-8 sm:w-10 shadow-sm"
                    : "bg-white/60 w-2.5 hover:bg-white"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Service Guarantee Bar (3 Value Propositions) */}
      <section className="w-full max-w-7xl px-4 lg:px-12 mt-8 lg:mt-10">
        <div className="bg-white rounded-xl border border-neutral-200 p-4 lg:py-5 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
          <div className="flex items-center gap-3.5 sm:justify-center">
            <div className="w-11 h-11 rounded-full bg-[#fef9c3] flex items-center justify-center text-neutral-900 shrink-0">
              <FaTruck size={19} className="text-neutral-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                ส่งและติดตั้งฟรี*
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-500">
                เมื่อช้อปครบตามกำหนด
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:justify-center pt-4 sm:pt-0">
            <div className="w-11 h-11 rounded-full bg-[#fef9c3] flex items-center justify-center text-neutral-900 shrink-0">
              <FaShieldAlt size={19} className="text-neutral-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                รับประกันคุณภาพแท้
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-500">
                มั่นใจคุณภาพมาตรฐานสากล
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:justify-center pt-4 sm:pt-0">
            <div className="w-11 h-11 rounded-full bg-[#fef9c3] flex items-center justify-center text-neutral-900 shrink-0">
              <FaRedo size={17} className="text-neutral-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                เปลี่ยน/คืนสินค้าใน 14 วัน
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-500">
                ตามเงื่อนไขที่กำหนด
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Campaign Highlight Strips */}
      <section className="w-full max-w-7xl px-4 lg:px-12 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/search"
            className="group relative h-28 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-5 flex items-center justify-between cursor-pointer border border-neutral-800 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fbc50e]">
                FLASH DEAL
              </span>
              <h4 className="text-lg font-black tracking-tight leading-tight mt-0.5">
                เฟอร์นิเจอร์ลดแรง
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                ส่วนลดสูงสุด 50% ทุกชิ้น
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fbc50e] text-neutral-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <FaChevronRight size={14} />
            </div>
          </Link>

          <Link
            href="/search"
            className="group relative h-28 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-r from-amber-700 to-amber-900 text-white p-5 flex items-center justify-between cursor-pointer border border-amber-800 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
                CLEARANCE SALE
              </span>
              <h4 className="text-lg font-black tracking-tight leading-tight mt-0.5">
                โซฟา & ห้องนั่งเล่น
              </h4>
              <p className="text-xs text-amber-100 mt-1">
                คุ้มค่า ครบทุกฟังก์ชัน
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <FaChevronRight size={14} />
            </div>
          </Link>

          <Link
            href="/search"
            className="group relative h-28 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-r from-neutral-800 to-slate-900 text-white p-5 flex items-center justify-between cursor-pointer border border-neutral-700 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fbc50e]">
                NEW COLLECTION
              </span>
              <h4 className="text-lg font-black tracking-tight leading-tight mt-0.5">
                ครบจบในซีรีส์เดียว
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                แต่งบ้านสไตล์มินิมอล
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fbc50e] text-neutral-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <FaChevronRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Featured Category Grid (Index Living Mall Style) */}
      <section className="w-full max-w-7xl px-4 lg:px-12 mt-12">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
            <div>
              <h2 className="text-lg lg:text-xl font-black text-neutral-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#fbc50e] rounded-sm" />
                <span>หมวดหมู่สินค้า | เฟอร์นิเจอร์และของแต่งบ้าน</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                เลือกชมสินค้าตามพื้นที่และการใช้งานภายในบ้าน
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-neutral-800 hover:text-[#e0ac00] flex items-center gap-1 transition-colors"
            >
              <span>ดูทั้งหมด</span>
              <FaChevronRight size={10} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <button
                key={c?.id}
                onClick={() => handleCtgClick(c?.id)}
                className="group flex flex-col items-center gap-3 p-3.5 rounded-xl border border-neutral-100 hover:border-neutral-300 bg-neutral-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white border border-neutral-200 overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-xs">
                  <SafeImage
                    src={c?.img ? envConfig.imgURL + c?.img : null}
                    type="category"
                    className="w-full h-full object-cover rounded-full"
                    alt={c?.name || "หมวดหมู่"}
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-neutral-800 group-hover:text-black line-clamp-1">
                  {c?.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Flash Deals / Highlight Sale (If Any Discounted Products) */}
      {discountedProducts.length > 0 && (
        <section className="w-full max-w-7xl px-4 lg:px-12 mt-12">
          <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 rounded-xl border border-rose-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-lg shadow-sm">
                  <FaFire size={20} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg lg:text-xl font-black text-neutral-900">
                      FLASH DEAL ดีลเด็ดลดแรง
                    </h3>
                    <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      จำกัดเวลา
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    สินค้าลดราคาพิเศษเฉพาะช่วงนี้เท่านั้น ช้อปด่วนก่อนสินค้าหมด!
                  </p>
                </div>
              </div>

              <Link
                href="/search"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0"
              >
                <span>ดูดีลทั้งหมด ({discountedProducts.length})</span>
                <FaChevronRight size={10} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {discountedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p?.pro_id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. All Products Grid (Index 4-Column Layout on Desktop) */}
      <section className="w-full max-w-7xl px-4 lg:px-12 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg lg:text-xl font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#fbc50e] rounded-sm" />
              <span>สินค้าแนะนำทั้งหมด (Recommended Items)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              รวมเฟอร์นิเจอร์และของใช้ในบ้านยอดนิยม ตอบโจทย์ทุกไลฟ์สไตล์
            </p>
          </div>
          <span className="text-xs text-neutral-400">
            แสดง {products.length} รายการ
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p?.pro_id} {...p} />
          ))}
        </div>

        {/* Load More / View All Action */}
        <div className="w-full flex justify-center mt-12">
          <Link
            href="/search"
            className="px-8 py-3 bg-[#111111] hover:bg-black text-[#fbc50e] hover:text-yellow-300 font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <span>ดูสินค้าทั้งหมดในระบบ</span>
            <FaChevronRight size={12} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
