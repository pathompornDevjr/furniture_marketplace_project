"use client";
import useGetSeesion from "@/hooks/useGetSession";
import Loading from "@/layout/loading";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FaGift,
  FaShieldAlt,
  FaStar,
  FaTruck,
  FaArrowLeft,
} from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";
import BrandLogo from "@/components/brand-logo";

const AuthLayout = ({ children }) => {
  const { checking, user } = useGetSeesion();
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (checking) return;
    if (user) {
      router.push("/");
    }
  }, [checking]);

  if (checking) return <Loading />;

  const isSignIn = pathName === "/auth/sign-in";
  const isForgot = pathName === "/auth/forgot-password";

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      {/* Left Panel – Index Living Mall Brand & Joy Member Highlights (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 lg:p-16 bg-[#161616] text-white overflow-hidden border-r border-neutral-800">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fbc50e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-neutral-800/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top: Logo & Back to Home */}
        <div className="flex items-center justify-between z-10">
          <BrandLogo theme="dark" size="md" href="/" />

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#fbc50e] transition-colors"
          >
            <FaArrowLeft size={10} />
            <span>กลับสู่หน้าแรก</span>
          </Link>
        </div>

        {/* Center: Member Privilege Content */}
        <div className="z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 bg-[#fbc50e]/15 border border-[#fbc50e]/30 px-3 py-1 rounded-full text-[#fbc50e] text-xs font-bold mb-4">
            <FaStar size={12} />
            <span>MEMBER PRIVILEGES</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black leading-tight mb-4 text-white">
            {isSignIn
              ? "ยินดีต้อนรับสู่ Furniture Marketplace"
              : isForgot
              ? "ระบบช่วยเหลือการกู้คืนรหัสผ่าน"
              : "สมัครสมาชิกใหม่วันนี้"}
          </h1>

          <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-lg">
            {isSignIn
              ? "เข้าสู่ระบบสมาชิกเพื่อรับสิทธิประโยชน์ ส่วนลดพิเศษสะสมคะแนน และติดตามสถานะคำสั่งซื้อของคุณได้อย่างสะดวกสบาย"
              : isForgot
              ? "กรุณากรอกข้อมูลของคุณเพื่อรับรหัสยืนยันและรีเซ็ตรหัสผ่านเข้าสู่ระบบใหม่"
              : "รับคะแนนสะสมทุกการช้อป แลกรับส่วนลดและบริการพิเศษก่อนใคร"}
          </p>

          {/* Member Benefits List */}
          <div className="grid grid-cols-1 gap-4 max-w-lg">
            {[
              {
                icon: FaGift,
                title: "สะสมคะแนนทุกการใช้จ่าย",
                desc: "แลกรับส่วนลดและของรางวัลพิเศษเฉพาะสมาชิก",
              },
              {
                icon: FaTruck,
                title: "บริการจัดส่งและประกอบติดตั้งฟรี*",
                desc: "ดูแลโดยทีมช่างผู้เชี่ยวชาญจาก Furniture Marketplace",
              },
              {
                icon: FaShieldAlt,
                title: "รับประกันสินค้าและสิทธิพิเศษโปรโมชั่น",
                desc: "รับสิทธิ์ช้อปดีล Flash Deal และโปรโมชั่นพิเศษล่วงหน้า",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-[#fbc50e]/15 text-[#fbc50e] flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs">{title}</h4>
                  <p className="text-neutral-400 text-[11px] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Contact Hotline */}
        <div className="flex items-center justify-between text-xs text-neutral-500 z-10 pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400">
            <MdSupportAgent size={16} className="text-[#fbc50e]" />
            <span>ศูนย์บริการลูกค้าสัมพันธ์ Furniture Marketplace</span>
          </div>
          <span>© {new Date().getFullYear()} Furniture Marketplace System</span>
        </div>
      </div>

      {/* Right Panel – Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="flex flex-col items-center gap-2 mb-6 lg:hidden">
          <BrandLogo size="md" href="/" />
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-black mt-1 flex items-center gap-1"
          >
            <FaArrowLeft size={10} />
            <span>กลับสู่หน้าแรก</span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
