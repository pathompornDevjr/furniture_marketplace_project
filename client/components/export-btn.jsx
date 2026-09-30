"use client";

import { envConfig } from "@/config/env-config";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaDownload } from "react-icons/fa";
import { useState } from "react";
import Loader from "./loader";

export default function DownloadReportButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // ✅ 1. ดึง JSON จาก API
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashboard-report",
        {
          withCredentials: true,
        }
      );
      const rows = res.data;

      // ✅ 2. แปลงวันที่ + ตัวเลขให้อ่านง่าย
      const formatted = rows.map((r) => ({
        วันที่: new Date(r["วันที่"]).toLocaleDateString("th-TH"),
        จำนวนสินค้า: r["จำนวนสินค้า"],
        วิธีชำระเงิน: r["วิธีชำระเงิน"],
        "ขายได้ (บาท)": r["ขายได้"].toLocaleString("th-TH"),
      }));

      // ✅ 3. ทำ workbook
      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "รายงานยอดขาย");

      // ✅ 4. โหลดไฟล์
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        "รายงานยอดขาย.xlsx"
      );
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 hover:bg-blue-600"
    >
      {loading ? (
        <>
          <Loader />
          <span>กำลังประมวลผล...</span>
        </>
      ) : (
        <>
          <FaDownload />
          <span>ยอดขาย</span>
        </>
      )}
    </button>
  );
}
