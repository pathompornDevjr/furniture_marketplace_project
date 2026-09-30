"use client";

import { envConfig } from "@/config/env-config";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { useState } from "react";
import { popup } from "@/libs/alert-popup";

export default function ExportProductBtn({ search = "", searchCtg = "", fallbackProducts = [] }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      let rows = [];
      try {
        const res = await axios.get(envConfig.apiURL + "/admin/products-report", {
          withCredentials: true,
          params: { search, searchCtg },
        });
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          rows = res.data;
        }
      } catch (apiErr) {
        console.warn("Product report API failed, checking fallback:", apiErr);
      }

      // Fallback: If API returned no rows or errored, format from fallbackProducts
      if (rows.length === 0 && fallbackProducts && fallbackProducts.length > 0) {
        rows = fallbackProducts.map((p, idx) => ({
          ลำดับ: idx + 1,
          รหัสสินค้า: `P${String(p.pro_id).padStart(4, "0")}`,
          ชื่อสินค้า: p.pro_name,
          หมวดหมู่: p.categories?.map((c) => c.name).join(", ") || "-",
          "ราคาต่อหน่วย (บาท)": p.pro_price,
          "ค่าจัดส่ง (บาท)": p.freight,
          สต็อกคงเหลือ: p.pro_number,
          หน่วยนับ: p.unit || "ชิ้น",
          จำนวนที่ขายแล้ว: p.sell_count || 0,
          "มูลค่าสต็อกรวม (บาท)": (p.pro_price || 0) * (p.pro_number || 0),
          สี: p.pro_color || "-",
          ขนาด: p.pro_size || "-",
          รายละเอียด: p.pro_details ? p.pro_details.slice(0, 200) : "-",
        }));
      }

      if (rows.length === 0) {
        popup.warning("ไม่พบข้อมูลสินค้าสำหรับออกรายงาน", "แจ้งเตือน");
        return;
      }

      // สร้าง Worksheet
      const ws = XLSX.utils.json_to_sheet(rows);

      // กำหนดความกว้างคอลัมน์อัตโนมัติ
      const colKeys = Object.keys(rows[0] || {});
      const colWidths = colKeys.map((key) => {
        let maxLen = key.length * 2.2;
        rows.forEach((r) => {
          const val = r[key];
          const len = val !== null && val !== undefined ? String(val).length : 0;
          if (len > maxLen) maxLen = len;
        });
        return { wch: Math.min(Math.max(Math.ceil(maxLen) + 3, 10), 50) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "รายงานสินค้า");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `รายงานรายการสินค้า_${dateStr}.xlsx`
      );

      popup.success("ส่งออกรายงานสินค้าเป็น Excel เรียบร้อยแล้ว", "สำเร็จ");
    } catch (err) {
      console.error("Export error:", err);
      popup.err("เกิดข้อผิดพลาดในการส่งออกรายงาน Excel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
      title="ออกรายงานสินค้าเป็น Excel (.xlsx)"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>กำลังส่งออก...</span>
        </>
      ) : (
        <>
          <FaFileExcel className="text-base text-emerald-100" />
          <span>ออกรายงาน Excel</span>
        </>
      )}
    </button>
  );
}
