"use client";
import { envConfig } from "@/config/env-config";
import SafeImage from "@/components/safe-image";
import BrandLogo from "@/components/brand-logo";
import useGetSeesion from "@/hooks/useGetSession";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  FaBars,
  FaChevronDown,
  FaFire,
  FaHeart,
  FaQuestionCircle,
  FaSearch,
  FaShoppingBag,
  FaShoppingCart,
  FaSignInAlt,
  FaSignOutAlt,
  FaTimes,
  FaTruck,
  FaUserCircle,
  FaUserPlus,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";
import { MdReceiptLong } from "react-icons/md";
import Loading from "./loading";
import { useAppContext } from "@/context/app-context";

let globalCategories = null;
let globalCategoriesPromise = null;
let globalPopularProducts = [
  { pro_id: 4, pro_name: "เก้าอี้เพื่อสุขภาพ Ergonomic Mesh Chair" },
  { pro_id: 3, pro_name: "โต๊ะทำงานปรับระดับไฟฟ้า Ergonomic Desk" },
  { pro_id: 9, pro_name: "โซฟาเบดปรับนอน 2 ที่นั่ง Compact Relax" },
  { pro_id: 5, pro_name: "ชั้นวางของอเนกประสงค์ 5 ชั้น มินิมอล" },
  { pro_id: 2, pro_name: "เตียงนอนไม้สักแท้ 6 ฟุต King Size" },
];
let globalPopularPromise = null;

const Navbar = () => {
  const pathName = usePathname();
  const { user, checking } = useGetSeesion();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState(globalCategories || []);
  const [popularProducts, setPopularProducts] = useState(globalPopularProducts || []);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const megaMenuRef = useRef(null);

  const { cart, setCart, setSearchCtgs, search, setSearch } = useAppContext();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (!savedCart) return;
    setCart(savedCart?.length);
  }, []);

  const fetchCTG = async () => {
    if (globalCategories) {
      setCategories(globalCategories);
      return;
    }
    if (globalCategoriesPromise) {
      const data = await globalCategoriesPromise;
      if (data) setCategories(data);
      return;
    }
    globalCategoriesPromise = axios.get(envConfig.apiURL + "/guest/get-ctg")
      .then((res) => {
        if (res.status === 200) {
          globalCategories = res.data;
          setCategories(res.data);
          return res.data;
        }
        return null;
      })
      .catch((error) => {
        console.error(error);
        return null;
      })
      .finally(() => {
        globalCategoriesPromise = null;
      });
  };

  const fetchPopularProducts = async () => {
    if (globalPopularProducts && globalPopularProducts.length > 0) {
      setPopularProducts(globalPopularProducts);
    }
    if (globalPopularPromise) {
      const data = await globalPopularPromise;
      if (data && data.length > 0) setPopularProducts(data);
      return;
    }
    globalPopularPromise = axios
      .get(envConfig.apiURL + "/guest/get-products")
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          const sorted = [...res.data]
            .sort((a, b) => (Number(b.sell_count) || 0) - (Number(a.sell_count) || 0))
            .slice(0, 5);
          globalPopularProducts = sorted;
          setPopularProducts(sorted);
          return sorted;
        }
        return globalPopularProducts;
      })
      .catch((error) => {
        console.error("Error fetching popular products:", error);
        return globalPopularProducts;
      })
      .finally(() => {
        globalPopularPromise = null;
      });
  };

  useEffect(() => {
    fetchCTG();
    fetchPopularProducts();
  }, []);

  const pathNotShowNav = [
    "/auth/sign-up",
    "/auth/sign-in",
    "/auth/forgot-password",
  ];

  const handleLogout = async () => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ออกจากระบบ",
      "ต้องการออกจากระบบหรือไม่",
      "ออกจากระบบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.post(
        envConfig.apiURL + "/auth/logout",
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        try {
          localStorage.removeItem("token");
        } catch (e) {}
        popup.success("ออกจากระบบแล้ว");
        location.href = "/";
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const handleCtgClick = (id) => {
    setSearchCtgs((prev) =>
      prev.find((p) => p === id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
    setIsMegaMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/search");
  };

  useEffect(() => {
    if (checking) return;
    if (Number(user?.roleId) === 1 && pathName.split("/")[1] !== "admin") {
      router.push("/admin/dashboard");
    }
  }, [user]);

  useEffect(() => {
    if (pathName !== "/search") {
      setSearchCtgs([]);
    }
    setIsMegaMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathName]);

  // Click outside to close mega menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <Loading />;
  if (pathNotShowNav.includes(pathName) || pathName.split("/")[1] === "admin")
    return null;

  return (
    <header className="z-50 w-full fixed top-0 left-0 flex flex-col bg-white shadow-xs">
      {/* 1. Top Utility Bar */}
      <div className="w-full bg-[#1e1e1e] text-neutral-300 text-[11px] py-1.5 px-4 lg:px-12 flex justify-between items-center border-b border-neutral-800">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="font-bold text-[#fbc50e] tracking-tight">
            Furniture Marketplace
          </span>
          <span className="text-neutral-500 hidden sm:inline">•</span>
          <span className="text-neutral-300 truncate">
            ระบบซื้อขายเฟอร์นิเจอร์ออนไลน์
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">

          {/* User Auth controls */}
          {!checking && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/profile/user"
                    className="flex items-center gap-1.5 hover:text-[#fbc50e] text-neutral-200 transition-colors"
                  >
                    <FaUserCircle size={13} className="text-[#fbc50e]" />
                    <span className="font-medium truncate max-w-[120px]">
                      {user?.first_name}
                    </span>
                  </Link>
                  <span className="w-px h-3 bg-neutral-700" />
                  <Link
                    href="/profile/order-history"
                    className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <MdReceiptLong size={14} />
                    <span>คำสั่งซื้อ</span>
                  </Link>
                  <span className="hidden sm:block w-px h-3 bg-neutral-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium cursor-pointer transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center gap-1 hover:text-[#fbc50e] transition-colors"
                  >
                    <FaSignInAlt />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                  <span className="w-px h-3 bg-neutral-700" />
                  <Link
                    href="/auth/sign-up"
                    className="flex items-center gap-1 text-[#fbc50e] hover:text-yellow-300 font-semibold transition-colors"
                  >
                    <FaUserPlus />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Header (Logo, Search, Cart) */}
      {pathName === "/cart" || pathName === "/checkout" ? (
        <div className="w-full py-3.5 px-4 lg:px-12 flex items-center justify-between border-b border-neutral-200 bg-white">
          <BrandLogo size="md" href="/" />
          <div className="text-sm font-semibold text-neutral-800 border-l-2 border-[#fbc50e] pl-3 py-0.5">
            {pathName === "/cart" ? "รถเข็นสินค้าของคุณ" : "ดำเนินการสั่งซื้อสินค้า"}
          </div>
        </div>
      ) : (
        <div className="w-full px-4 lg:px-12 py-3.5 bg-white border-b border-neutral-100 flex flex-col gap-2">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-800 hover:text-black focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Brand Logo - Furniture Marketplace */}
            <BrandLogo size="md" href="/" />

            {/* Central Search Bar with Index Style */}
            <div className="flex-1 max-w-2xl hidden md:flex flex-col gap-1">
              <div className="relative flex items-center rounded-full border-2 border-neutral-200 focus-within:border-[#fbc50e] transition-all bg-neutral-50 overflow-hidden shadow-xs">
                <input
                  type="text"
                  className="flex-1 text-sm bg-transparent pl-4 pr-3 py-2 text-neutral-800 focus:outline-none placeholder-neutral-400"
                  placeholder="ค้นหาสินค้าที่คุณต้องการ เช่น โซฟา, ชุดห้องนอน, ที่นอน..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!search) return popup.err("ไม่พบคำค้นหา");
                      router.push("/search");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (!search) return popup.err("ไม่พบคำค้นหา");
                    router.push("/search");
                  }}
                  className="bg-[#fbc50e] hover:bg-[#e0ac00] text-neutral-950 font-bold px-6 py-2.5 flex items-center gap-2 text-sm transition-all"
                  aria-label="Search"
                >
                  <FaSearch size={14} />
                  <span>ค้นหา</span>
                </button>
              </div>

              {/* Quick Search Chips */}
              <div className="flex items-center text-[11px] text-neutral-500 gap-2.5 px-3 overflow-x-auto scrollbar-none whitespace-nowrap">
                <span className="text-neutral-400 font-medium">ยอดนิยม:</span>
                <button
                  onClick={() => {
                    setSearch("โซฟา");
                    router.push("/search");
                  }}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  โซฟา
                </button>
                <span className="text-neutral-300">•</span>
                <button
                  onClick={() => {
                    setSearch("ที่นอน");
                    router.push("/search");
                  }}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  ที่นอน
                </button>
                <span className="text-neutral-300">•</span>
                <button
                  onClick={() => {
                    setSearch("เตียง");
                    router.push("/search");
                  }}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  เตียงนอน
                </button>
                <span className="text-neutral-300">•</span>
                <button
                  onClick={() => {
                    setSearch("โต๊ะ");
                    router.push("/search");
                  }}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  โต๊ะทำงาน
                </button>
                {categories.slice(0, 3).map((c) => (
                  <span key={c?.id} className="flex items-center gap-2">
                    <span className="text-neutral-300">•</span>
                    <button
                      onClick={() => handleCtgClick(c?.id)}
                      className="hover:text-black hover:underline cursor-pointer"
                    >
                      {c?.name}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Member Profile Quick Link */}
              {user && (
                <Link
                  href="/profile/user"
                  className="hidden lg:flex items-center gap-2.5 text-neutral-800 hover:text-black transition-colors"
                >
                  <SafeImage
                    src={user?.profile ? envConfig.imgURL + user?.profile : null}
                    type="avatar"
                    alt={user?.first_name || "Profile"}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-300"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">สมาชิก</span>
                    <span className="text-xs font-bold truncate max-w-[85px] leading-tight">
                      {user?.first_name}
                    </span>
                  </div>
                </Link>
              )}

              {/* Shopping Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 bg-neutral-50 hover:bg-[#fef9c3] rounded-full text-neutral-900 transition-colors border border-neutral-200 group flex items-center justify-center"
                aria-label="Shopping Cart"
              >
                <FaShoppingCart size={20} className="group-hover:text-neutral-950 transition-colors" />
                {Number(cart) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#fbc50e] text-neutral-950 rounded-full min-w-5 h-5 flex items-center justify-center text-[10px] font-extrabold px-1 border-2 border-white shadow-xs">
                    {Number(cart).toLocaleString()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="w-full md:hidden flex items-center rounded-full border border-neutral-300 focus-within:border-[#fbc50e] bg-neutral-50 overflow-hidden mt-1 shadow-inner">
            <input
              type="text"
              className="flex-1 text-xs bg-transparent pl-3 pr-2 py-2 text-neutral-800 focus:outline-none"
              placeholder="ค้นหาสินค้า เช่น โซฟา, เตียงนอน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!search) return popup.err("ไม่พบคำค้นหา");
                  router.push("/search");
                }
              }}
            />
            <button
              onClick={() => {
                if (!search) return popup.err("ไม่พบคำค้นหา");
                router.push("/search");
              }}
              className="bg-[#fbc50e] text-neutral-950 p-2.5 px-4 font-bold"
              aria-label="Search"
            >
              <FaSearch size={12} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Mega-Menu & Category Navigation Bar (Desktop) */}
      {!["/cart", "/checkout"].includes(pathName) && (
        <div
          ref={megaMenuRef}
          className="hidden lg:block w-full bg-white border-b border-neutral-200 relative text-xs"
        >
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-12 flex items-center">
            {/* Left Category Toggle & Items */}
            <div className="flex items-center gap-1 w-full">
              {/* Mega Menu Toggle Button */}
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-2 font-bold px-4 py-3 cursor-pointer transition-colors ${
                  isMegaMenuOpen
                    ? "bg-[#fbc50e] text-neutral-950"
                    : "bg-[#111111] text-white hover:bg-black"
                }`}
              >
                <FaBars size={13} />
                <span>หมวดหมู่สินค้า</span>
                <FaChevronDown
                  size={10}
                  className={`transition-transform duration-200 ${
                    isMegaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Popular Products Navigation Links (Top 5) */}
              <div className="flex items-center gap-3 lg:gap-5 pl-4 font-medium text-neutral-800 text-xs overflow-hidden flex-1">
                {popularProducts.map((p, idx) => (
                  <Link
                    key={p.pro_id || idx}
                    href={`/product-detail/${p.pro_id}`}
                    title={p.pro_name}
                    className="group flex items-center gap-1.5 hover:text-[#d4a000] py-3 transition-colors shrink-0 max-w-[140px] xl:max-w-[200px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbc50e] group-hover:scale-125 transition-transform shrink-0" />
                    <span className="truncate">{p.pro_name}</span>
                  </Link>
                ))}

                {/* Hot Promotions Link */}
                <Link
                  href="/search"
                  className="flex items-center gap-1 text-rose-600 font-bold hover:text-rose-700 py-3 transition-colors shrink-0 ml-auto xl:ml-3"
                >
                  <FaFire size={12} className="text-rose-500 animate-pulse" />
                  <span>FLASH DEAL</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mega Menu Dropdown Layer */}
          {isMegaMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl z-50 animate-fadeIn">
              <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100 mb-4">
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#fbc50e] rounded-sm" />
                    <span>เลือกดูสินค้าตามหมวดหมู่</span>
                  </h3>
                  <button
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="text-xs text-neutral-500 hover:text-black flex items-center gap-1"
                  >
                    <span>ปิด</span>
                    <FaTimes size={10} />
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                  {categories.map((c) => (
                    <button
                      key={c?.id}
                      onClick={() => handleCtgClick(c?.id)}
                      className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all text-center cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 group-hover:scale-105 transition-transform">
                        <SafeImage
                          src={c?.img ? envConfig.imgURL + c?.img : null}
                          type="category"
                          alt={c?.name || "Category"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-semibold text-neutral-700 group-hover:text-black transition-colors line-clamp-1">
                        {c?.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-black/60 backdrop-blur-xs z-50 flex flex-col">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto p-4 gap-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="font-bold text-sm text-neutral-900">
                หมวดหมู่สินค้า
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-neutral-500 hover:text-black"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href="/search"
                className="flex items-center justify-between p-2.5 rounded-lg text-rose-600 font-bold bg-rose-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <FaFire />
                  <span>FLASH DEAL โปรแรงสุดคุ้ม</span>
                </span>
              </Link>

              {/* Mobile Popular Products */}
              {popularProducts?.length > 0 && (
                <div className="py-2 border-b border-neutral-100">
                  <span className="text-[11px] font-bold text-amber-700 px-2.5 flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbc50e]" />
                    <span>สินค้ายอดนิยม</span>
                  </span>
                  <div className="flex flex-col">
                    {popularProducts.map((p) => (
                      <Link
                        key={p.pro_id}
                        href={`/product-detail/${p.pro_id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1.5 px-2.5 text-xs text-neutral-700 hover:text-[#d4a000] truncate flex items-center gap-2"
                      >
                        <span className="text-neutral-400">•</span>
                        <span className="truncate">{p.pro_name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {categories.map((c) => (
                <button
                  key={c?.id}
                  onClick={() => handleCtgClick(c?.id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 text-neutral-800 text-left font-medium text-xs border-b border-neutral-50"
                >
                  <SafeImage
                    src={c?.img ? envConfig.imgURL + c?.img : null}
                    type="category"
                    alt={c?.name || "Category"}
                    className="w-7 h-7 rounded-md object-cover border border-neutral-200 shrink-0"
                  />
                  <span>{c?.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-neutral-200 pt-4 flex flex-col gap-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <FaTruck className="text-[#fbc50e]" />
                <span>ส่งและติดตั้งฟรีตามเงื่อนไข</span>
              </div>
              <div className="flex items-center gap-2">
                <FaHeadset className="text-[#fbc50e]" />
                <span>บริการลูกค้าสัมพันธ์</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
