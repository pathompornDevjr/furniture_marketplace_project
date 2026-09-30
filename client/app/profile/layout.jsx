"use client";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FaChevronRight,
  FaCity,
  FaCreditCard,
  FaHome,
  FaIdCard,
  FaReceipt,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";
export { NO_PROFILE };

const Layout = ({ children }) => {
  const { user, checking } = useGetSeesion();
  const router = useRouter();
  const pathName = usePathname();

  const menus = [
    {
      id: 1,
      icon: <FaUser />,
      url: "/profile/user",
      title: "ข้อมูลส่วนตัว",
      desc: "จัดการข้อมูลชื่อ เบอร์โทร และวันเกิด",
    },
    {
      id: 5,
      icon: <FaCreditCard />,
      url: "/profile/bank_account",
      title: "บัญชีธนาคาร",
      desc: "ข้อมูลบัญชีสำหรับรับเงินคืน",
    },
    {
      id: 3,
      icon: <FaCity />,
      url: "/profile/address",
      title: "ที่อยู่จัดส่ง",
      desc: "ที่อยู่สำหรับจัดส่งสินค้าและใบเสร็จ",
    },
    {
      id: 2,
      icon: <FaReceipt />,
      url: "/profile/order-history",
      title: "ประวัติการสั่งซื้อ",
      desc: "รายการคำสั่งซื้อและสถานะพัสดุ",
    },
    {
      id: 4,
      icon: <FaIdCard />,
      url: "/profile/account",
      title: "ความปลอดภัยบัญชี",
      desc: "เปลี่ยนรหัสผ่านและความปลอดภัย",
    },
  ];

  const currentMenu = menus.find(
    (m) => pathName === m.url || pathName.startsWith(`${m.url}/`)
  );

  useEffect(() => {
    if (checking) return;

    const timeout = setTimeout(() => {
      if (user?.user_id) return;
      router.push("/");
    }, 1100);

    return () => clearTimeout(timeout);
  }, [user]);

  return (
    <div className="w-full bg-[#f9fafb] min-h-screen pb-16 pt-32 lg:pt-36">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 font-medium"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors"
          >
            <FaHome className="text-neutral-400" />
            <span>หน้าแรก</span>
          </Link>
          <FaChevronRight size={10} className="text-neutral-400" />
          <Link
            href="/profile/user"
            className="hover:text-neutral-900 transition-colors"
          >
            บัญชีผู้ใช้
          </Link>
          {currentMenu && (
            <>
              <FaChevronRight size={10} className="text-neutral-400" />
              <span className="text-neutral-900 font-semibold">
                {currentMenu.title}
              </span>
            </>
          )}
        </nav>

        {/* Content Layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full shrink-0 flex flex-col gap-4 lg:w-72">
            {/* User Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
              {/* Joy Card Top Banner */}
              <div className="relative bg-gradient-to-r from-[#18181b] to-[#27272a] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#fbc50e] text-neutral-950 font-black text-[10px] px-2 py-0.5 rounded tracking-wider">
                      FURNITURE
                    </span>
                    <span className="text-[11px] font-bold text-neutral-300 tracking-wide">
                      MARKETPLACE
                    </span>
                  </div>
                  <FaStar className="text-[#fbc50e]" size={14} />
                </div>
              </div>

              {/* User Identity Info */}
              <div className="p-4 flex items-center gap-3.5 border-b border-neutral-100">
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full ring-2 ring-[#fbc50e] ring-offset-2 overflow-hidden bg-neutral-100">
                  <SafeImage
                    src={
                      user?.profile
                        ? envConfig.imgURL + user?.profile
                        : null
                    }
                    type="avatar"
                    className="w-full h-full object-cover"
                    alt={user?.first_name || "รูปโปรไฟล์"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-400">ยินดีต้อนรับ</p>
                  <p className="truncate font-bold text-neutral-900 text-sm sm:text-base">
                    คุณ{user?.first_name || "สมาชิก"} {user?.last_name || ""}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#b48300] bg-[#fef9c3] px-2 py-0.5 rounded-full mt-0.5">
                    สมาชิก Furniture Marketplace
                  </span>
                </div>
              </div>

              {/* Mobile Horizontal Scrolling Tabs */}
              <div className="flex lg:hidden overflow-x-auto gap-1.5 p-2 bg-neutral-50/80 border-b border-neutral-100">
                {menus.map((m) => {
                  const isActive =
                    pathName === m.url || pathName.startsWith(`${m.url}/`);
                  return (
                    <button
                      key={m.id}
                      onClick={() => router.push(m.url)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                        isActive
                          ? "bg-[#fbc50e] text-neutral-950 shadow-2xs"
                          : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
                      }`}
                    >
                      <span className={isActive ? "text-neutral-950" : "text-neutral-400"}>
                        {m.icon}
                      </span>
                      <span>{m.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop Vertical Navigation Menu */}
              <nav
                aria-label="เมนูโปรไฟล์"
                className="hidden lg:flex flex-col gap-1 p-2.5"
              >
                {menus.map((m) => {
                  const isActive =
                    pathName === m.url || pathName.startsWith(`${m.url}/`);

                  return (
                    <button
                      onClick={() => router.push(m.url)}
                      key={m.id}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all duration-150 ${
                        isActive
                          ? "bg-[#fbc50e] text-neutral-950 font-bold shadow-xs"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`text-base transition-colors ${
                            isActive
                              ? "text-neutral-950"
                              : "text-neutral-400 group-hover:text-neutral-800"
                          }`}
                        >
                          {m.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm truncate">{m.title}</span>
                        </div>
                      </div>
                      <FaChevronRight
                        size={12}
                        className={`transition-transform ${
                          isActive
                            ? "text-neutral-950 translate-x-0.5"
                            : "text-neutral-300 group-hover:text-neutral-500"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;

