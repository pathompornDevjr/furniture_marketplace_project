"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/brand-logo";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLine,
  FaShieldAlt,
} from "react-icons/fa";

const Footer = () => {
  const pathName = usePathname();

  if (pathName.split("/")[1] === "admin") return null;

  const isAuthPage = pathName.startsWith("/auth");

  return (
    <footer
      className={`w-full bg-[#1e1e1e] text-neutral-300 border-t border-neutral-800 ${
        isAuthPage ? "mt-0" : "mt-20"
      }`}
    >
      {/* 1. Top Socials & Brand Strip */}
      <div className="w-full border-b border-neutral-800 bg-[#161616] py-5 px-4 lg:px-12">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo theme="dark" size="sm" />
            <span className="text-xs text-neutral-400 hidden sm:inline border-l border-neutral-700/80 pl-3">
              เฟอร์นิเจอร์และของแต่งบ้านครบวงจร เพื่อการใช้ชีวิตที่ลงตัว
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-300">ติดตามเราได้ที่</span>
            <div className="flex items-center gap-2.5">
              <a
                href="https://line.me"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Line"
              >
                <FaLine size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Instagram"
              >
                <FaInstagram size={14} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="YouTube"
              >
                <FaYoutube size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Footer: 4-Column Directory (Index Living Mall Standard) */}
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-12 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
          {/* Column 1: Customer Care */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-sm text-white tracking-wide border-b border-neutral-800 pb-2">
              ดูแลลูกค้า
            </h4>
            <ul className="flex flex-col gap-2.5 text-neutral-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  การคืนสินค้า / การคืนเงิน
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  การจัดส่งสินค้า และค่าบริการติดตั้ง
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  วิธีการชำระเงิน และผ่อน 0%
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  โปรโมชั่นบัตรเครดิต
                </Link>
              </li>
              <li>
                <Link href="/profile/order-history" className="hover:text-white transition-colors">
                  ตรวจสอบสถานะคำสั่งซื้อ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  ใบกำกับภาษีอิเล็กทรอนิกส์ (e-Tax)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  คำถามที่พบบ่อย (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  นโยบายการรับประกันสินค้า
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Branches & Services */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-sm text-white tracking-wide border-b border-neutral-800 pb-2">
              สาขาและการบริการ
            </h4>
            <ul className="flex flex-col gap-2.5 text-neutral-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  ที่ตั้งสาขาและเวลาเปิด/ปิด
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  แคตตาล็อกสินค้าออนไลน์
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  บริการประกอบติดตั้งและจัดส่ง
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  E-Gift Voucher
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Younique (เฟอร์นิเจอร์สั่งตัดบิวต์อิน)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  ไอเดียแต่งห้องและบ้าน
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About Company */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-sm text-white tracking-wide border-b border-neutral-800 pb-2">
              ข้อมูลบริษัท
            </h4>
            <ul className="flex flex-col gap-2.5 text-neutral-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  เกี่ยวกับเรา (Furniture Marketplace System)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  นักลงทุนสัมพันธ์ (Investor Relations)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  การพัฒนาอย่างยั่งยืน (ESG)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  ข่าวสารและกิจกรรมเพื่อสังคม
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  ร่วมงานกับเรา (Career)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment Channels & Security */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-bold text-sm text-white tracking-wide border-b border-neutral-800 pb-2">
              ช่องทางการชำระเงิน
            </h4>
            <div className="flex flex-col gap-3 text-neutral-400">
              <p className="text-xs text-neutral-400 leading-relaxed">
                ระบบสั่งซื้อและชำระเงินออนไลน์ที่ได้มาตรฐาน ปลอดภัย มั่นใจได้ทุกการสั่งซื้อ พร้อมการดูแลและรับประกันคุณภาพสินค้า
              </p>

              {/* Supported Payment Badges */}
              <div className="mt-1 pt-2">
                <p className="text-[11px] text-neutral-300 font-semibold mb-2">
                  ช่องทางการชำระเงินที่ปลอดภัย
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 bg-neutral-800/90 text-white rounded-lg font-bold text-xs border border-neutral-700 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>PromptPay</span>
                  </span>
                  <span className="px-3 py-1.5 bg-neutral-800/90 text-[#fbc50e] rounded-lg font-bold text-xs border border-neutral-700 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbc50e]" />
                    <span>เก็บเงินปลายทาง (COD)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Footer & Trust Marks */}
      <div className="w-full bg-[#111111] py-6 px-4 lg:px-12 border-t border-neutral-800 text-[11px] text-neutral-500">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span>COPYRIGHT © {new Date().getFullYear()} FURNITURE MARKETPLACE SYSTEM. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="hover:text-neutral-300 transition-colors">
              Site Map
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-neutral-300 transition-colors">
              ข้อกำหนดและเงื่อนไข
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-neutral-300 transition-colors">
              นโยบายความเป็นส่วนตัว (PDPA)
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <FaShieldAlt size={11} />
              <span>SSL 256-Bit Secured</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
