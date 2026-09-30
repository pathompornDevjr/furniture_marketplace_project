"use client";
import { envConfig } from "@/config/env-config";
import useGetSession from "@/hooks/useGetSession";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaChartArea,
  FaCubes,
  FaList,
  FaReceipt,
  FaSignOutAlt,
  FaStore,
  FaTags,
  FaTimes,
  FaTshirt,
  FaUserAlt,
  FaUserCircle,
  FaUserShield,
} from "react-icons/fa";
import Loading from "../loading";
import { NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";
import BrandLogo from "@/components/brand-logo";

const Menu = () => {
  const path = usePathname();
  const { user } = useGetSession();
  const [showResponsive, setShowResponsive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleToggle = () => setShowResponsive((prev) => !prev);
    const handleClose = () => setShowResponsive(false);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    window.addEventListener("close-admin-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-admin-sidebar", handleToggle);
      window.removeEventListener("close-admin-sidebar", handleClose);
    };
  }, []);

  const menuSections = [
    {
      group: "ภาพรวม & รายงาน",
      items: [
        {
          id: 1,
          icon: <FaChartArea />,
          url: "/admin/dashboard",
          title: "แดชบอร์ดสรุปผล",
        },
      ],
    },
    {
      group: "สินค้า & แคตตาล็อก",
      items: [
        {
          id: 3,
          icon: <FaList />,
          url: "/admin/category",
          title: "จัดการหมวดหมู่",
        },
        {
          id: 2,
          icon: <FaCubes />,
          url: "/admin/product",
          title: "จัดการรายการสินค้า",
        },
      ],
    },
    {
      group: "คำสั่งซื้อ & การตลาด",
      items: [
        {
          id: 4,
          icon: <FaReceipt />,
          url: "/admin/orders",
          title: "จัดการคำสั่งซื้อ",
        },
        {
          id: 8,
          icon: <FaTags />,
          url: "/admin/promotion",
          title: "โปรโมชัน & ส่วนลด",
        },
      ],
    },
    {
      group: "ผู้ใช้งาน & ระบบ",
      items: [
        {
          id: 5,
          icon: <FaUserAlt />,
          url: "/admin/members",
          title: "จัดการสมาชิก",
        },
        {
          id: 6,
          icon: <FaUserShield />,
          url: "/admin/account",
          title: "บัญชีและความปลอดภัย",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ออกจากระบบ",
      "ต้องการออกจากระบบผู้ดูแลหรือไม่",
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

  if (loading) return <Loading />;

  return (
    <>
      {/* Mobile Backdrop */}
      {showResponsive && (
        <div
          onClick={() => setShowResponsive(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`p-4 lg:flex ${
          showResponsive
            ? "flex w-[290px] fixed inset-y-0 left-0"
            : "hidden lg:w-[270px]"
        } h-full flex-col justify-between border-r border-neutral-800 bg-[#141416] shadow-2xl z-[100] shrink-0 text-neutral-200 transition-all`}
      >
        <div className="w-full flex flex-col min-h-0">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-neutral-800/90">
            <BrandLogo theme="dark" size="sm" href="/admin/dashboard" />

            {showResponsive && (
              <button
                onClick={() => setShowResponsive(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            )}
          </div>

          {/* Subtitle / System Status Badge */}
          <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-neutral-300">
                Backoffice Management
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#fbc50e] bg-[#fbc50e]/10 px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Scrollable Nav Sections */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-2">
            {menuSections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {section.group}
                </p>
                {section.items.map((m) => {
                  const isActive = path.split("/")[2] === m.url.split("/")[2];
                  return (
                    <Link
                      onClick={() => setShowResponsive(false)}
                      key={m.id}
                      href={m.url}
                      prefetch={true}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-[#fbc50e] text-neutral-950 shadow-md shadow-[#fbc50e]/20"
                          : "text-neutral-400 hover:bg-neutral-800/80 hover:text-white"
                      }`}
                    >
                      <span
                        className={`text-base ${
                          isActive ? "text-neutral-950" : "text-neutral-400"
                        }`}
                      >
                        {m.icon}
                      </span>
                      <span>{m.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Area: User Profile & Logout */}
        <div className="pt-3 mt-2 border-t border-neutral-800 flex flex-col gap-2">
          {/* User Preview */}
          <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full ring-2 ring-[#fbc50e] overflow-hidden shrink-0 bg-neutral-800">
              <SafeImage
                src={user?.profile ? envConfig.imgURL + user?.profile : null}
                type="avatar"
                className="w-full h-full object-cover"
                alt={user?.first_name || "Admin"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.first_name || "ผู้ดูแลระบบ"} {user?.last_name || ""}
              </p>
              <p className="text-[10px] text-[#fbc50e] font-semibold">
                ผู้ดูแลระบบ (Admin)
              </p>
            </div>
          </div>

          {/* Quick link to Storefront */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
          >
            <FaStore size={12} className="text-[#fbc50e]" />
            <span>เปิดหน้าแรกของร้านค้า</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-rose-500/20 transition-all"
          >
            <FaSignOutAlt size={14} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
};
export default Menu;

