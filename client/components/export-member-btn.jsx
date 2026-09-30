"use client";

import { envConfig } from "@/config/env-config";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { useState } from "react";
import { popup } from "@/libs/alert-popup";

export default function ExportMemberBtn({ search = "", searchStatus = "all", fallbackMembers = [] }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      let rows = [];
      try {
        const res = await axios.get(envConfig.apiURL + "/admin/members-report", {
          withCredentials: true,
          params: { search, searchStatus },
        });
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          rows = res.data;
        }
      } catch (apiErr) {
        console.warn("Member report API failed, checking fallback:", apiErr);
      }

      // Fallback: If API returned no rows or errored, format from fallbackMembers
      if (rows.length === 0 && fallbackMembers && fallbackMembers.length > 0) {
        rows = fallbackMembers.map((m, idx) => ({
          ลำดับ: idx + 1,
          รหัสสมาชิก: `MB${String(m.user_id).padStart(4, "0")}`,
          คำนำหน้า: m.title_type || "-",
          ชื่อ: m.first_name || "-",
          นามสกุล: m.last_name || "-",
          "ชื่อ-นามสกุล": `${m.title_type || ""} ${m.first_name || ""} ${m.last_name || ""}`.trim(),
          ชื่อผู้ใช้: m.user_name || "-",
          อีเมล: m.email || "-",
          เบอร์โทรศัพท์: m.tel || "-",
          เพศ: m.gender || "-",
          วันเกิด: m.birth_date || "-",
          ที่อยู่: m.address || "-",
          จำนวนคำสั่งซื้อ: m._count?.bill_orders || 0,
          "ยอดซื้อสะสม (บาท)": m.total || 0,
          สถานะบัญชี: m.allowed ? "ปกติ" : "ระงับการใช้งาน",
          วันที่สมัครสมาชิก: m.createdAt ? new Date(m.createdAt).toLocaleDateString("th-TH") : "-",
        }));
      }

      if (rows.length === 0) {
        popup.warning("ไม่พบข้อมูลสมาชิกสำหรับออกรายงาน", "แจ้งเตือน");
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
      XLSX.utils.book_append_sheet(wb, ws, "รายงานสมาชิก");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `รายงานลูกค้าสมาชิก_${dateStr}.xlsx`
      );

      popup.success("ส่งออกรายงานสมาชิกเป็น Excel เรียบร้อยแล้ว", "สำเร็จ");
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
      title="ออกรายงานลูกค้าสมาชิกเป็น Excel (.xlsx)"
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
