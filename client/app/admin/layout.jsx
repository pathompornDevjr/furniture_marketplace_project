"use client";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import AdminSidebar from "@/layout/admin-layout/admin-sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaBars, FaExternalLinkAlt, FaShieldAlt, FaStore } from "react-icons/fa";
import { NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";

const Layout = ({ children }) => {
  const { user, checking } = useGetSeesion();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (checking) return;

    if (!user || Number(user?.roleId) !== 1) {
      router.push("/");
    }
  }, [user, checking, router]);

  if (checking && !user) return null;

  return (
    <div className="w-full h-screen flex items-stretch bg-[#f4f5f7] overflow-hidden text-neutral-900">
      <AdminSidebar />
      <div className="flex-1 h-full overflow-y-auto flex flex-col">
        {/* Admin Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
              className="lg:hidden p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors"
              aria-label="เปิดเมนูผู้ดูแล"
            >
              <FaBars size={15} />
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-xs font-bold">
              <span className="bg-[#fbc50e] text-neutral-950 px-1 py-0.2 rounded text-[10px]">
                FM
              </span>
              <span>Backoffice</span>
            </span>
            <span className="text-xs text-neutral-400 hidden md:inline">|</span>
            <span className="text-xs font-medium text-neutral-600 hidden md:inline">
              ระบบซื้อขายเฟอร์นิเจอร์ออนไลน์
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Storefront Link */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
            >
              <FaStore className="text-[#b48300]" size={12} />
              <span className="hidden sm:inline">ดูหน้าเว็บหลัก</span>
              <FaExternalLinkAlt size={10} className="text-neutral-400" />
            </Link>

            {/* Admin Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full ring-2 ring-[#fbc50e] overflow-hidden bg-neutral-100 shrink-0">
                <SafeImage
                  src={
                    user?.profile
                      ? envConfig.imgURL + user?.profile
                      : null
                  }
                  type="avatar"
                  className="w-full h-full object-cover"
                  alt={user?.first_name || "Admin"}
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-neutral-900 leading-tight">
                  คุณ{user?.first_name || "Admin"}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  ผู้ดูแลระบบ
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Full Width */}
        <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;

