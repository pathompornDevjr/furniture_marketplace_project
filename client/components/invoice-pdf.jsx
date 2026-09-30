"use client";

import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import SarabunNormal from "@/assets/fonts/Sarabun-normal";

// doc.text("ใบเสร็จรับเงิน", 20, 20);
// doc.save("thai-receipt.pdf");

import { popup } from "@/libs/alert-popup";

// Mock components
const Loader = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export default function FixedDownloadInvoiceButton({ bill }) {
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.addFileToVFS("Sarabun.ttf", SarabunNormal);
      doc.addFont("Sarabun.ttf", "Sarabun", "normal");
      doc.setFont("Sarabun");

      // หรือใช้วิธีง่ายๆ โดยใช้ฟอนต์เริ่มต้นและหลีกเลี่ยงอักขระพิเศษ

      const primaryColor = [59, 130, 246];
      const secondaryColor = [107, 114, 128];
      const textColor = [31, 41, 55];

      // --- Header ---
      doc.setFillColor(...primaryColor);
      doc.circle(105, 25, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("EZY", 105, 27, { align: "center" });

      doc.setTextColor(...textColor);
      doc.setFontSize(20);
      // ใช้ภาษาอังกฤษแทนเพื่อหลีกเลี่ยงปัญหาฟอนต์
      doc.text("EZY_E-COMMERCE", 105, 40, { align: "center" });

      doc.setFontSize(16);
      doc.text("ใบเสร็จ", 105, 48, { align: "center" });

      // เส้นคั่น
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 55, 190, 55);

      // --- ข้อมูลใบเสร็จ (ใช้ภาษาอังกฤษ) ---
      doc.setFontSize(10);
      doc.setTextColor(...textColor);

      const billInfo = [
        [`เลขที่คำสั่งซื้อ:`, bill.bill_id || "N/A"],
        [
          `วันที่:`,
          new Date(bill.bill_date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        ],
        [`วิธีชำระเงิน:`, bill.pm_method],
        [`สถานะ:`, "ชำระเงินสำเร็จ"],
      ];

      let yPosition = 65;
      billInfo.forEach(([label, value]) => {
        doc.text(label, 20, yPosition);
        doc.text(value, 70, yPosition);
        yPosition += 7;
      });

      // --- ตารางสินค้า (ใช้ autoTable กับการตั้งค่าภาษาไทย) ---
      const autoTable = (await import("jspdf-autotable")).default;

      const tableData =
        bill.order_details?.map((item, idx) => [
          idx + 1,
          item.productName || item.product?.pro_name || "Product",
          item.quantity || 1,
          item.color || "-",
          item.size || "-",
          `${(item.total_amount || 0).toLocaleString("en-US")} THB`,
        ]) || [];

      autoTable(doc, {
        startY: yPosition + 10,
        head: [["No.", "Product", "QTY", "color", "size", "Amount(THB)"]],
        body: tableData,
        theme: "striped",
        styles: {
          font: "Sarabun",
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 15 },
          1: { halign: "left", cellWidth: 60 },
          2: { halign: "center", cellWidth: 20 },
          3: { halign: "center", cellWidth: 25 },
          4: { halign: "center", cellWidth: 25 },
          5: { halign: "right", cellWidth: 35 },
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      });

      // --- สรุปยอดเงิน ---
      const finalY = doc.lastAutoTable.finalY || yPosition + 50;

      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.rect(20, finalY + 10, 170, 35);

      doc.setFillColor(249, 250, 251);
      doc.rect(20, finalY + 10, 170, 35, "F");

      doc.setFontSize(10);
      doc.setTextColor(...textColor);

      const summaryItems = [
        [
          "รวมราคาสินค้า:",
          `${bill.bill_totalamount.toLocaleString("en-US")} THB`,
        ],
        [
          "รวมราคาส่วนลด",
          `${bill.bill_totalDiscount.toLocaleString("en-US")} THB`,
        ],
        [
          "รวมราคาสินค้าหลังหักส่วนลด",
          `${(bill.bill_totalamount - bill.bill_totalDiscount).toLocaleString(
            "en-US"
          )} THB`,
        ],
        [
          "ค่าจัดส่ง:",
          `${(bill.bill_freighttotal || 0).toLocaleString("en-US")} THB`,
        ],
        [
          "ยอดชำระทั้งหมด",
          `${(bill.bill_price || 0).toLocaleString("en-US")} THB`,
        ],
      ];

      let summaryY = finalY + 18;
      summaryItems.forEach(([label, value], index) => {
        if (index === summaryItems.length - 1) {
          //   doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(...primaryColor);
        } else {
          //   doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(...textColor);
        }

        doc.text(label, 120, summaryY);
        doc.text(value, 185, summaryY, { align: "right" });
        summaryY += 8;
      });

      // --- Footer ---
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text("ขอบคุณที่ใช้บริการของเรา", 105, finalY + 55, {
        align: "center",
      });
      doc.text(
        `วันที่ออกใบเสร็จ: ${new Date().toLocaleString("th-TH")}`,
        105,
        finalY + 62,
        { align: "center" }
      );

      // --- บันทึกไฟล์ ---
      const fileName = `ใบเสร็จ_${bill.bill_id?.split("-")[0] || "unknown"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
      popup.err("เกิดข้อผิดพลาดในการดาวน์โหลด.");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแปลงข้อความเป็นภาษาอังกฤษ

  return (
    <div className="relative group">
      <button
        onClick={handleDownloadPDF}
        disabled={loading}
        className={`
          flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:-translate-y-0.5"
          }
          text-white shadow-md
        `}
      >
        {loading ? (
          <>
            <Loader />
            <span>กำลังสร้างใบเสร็จ...</span>
          </>
        ) : (
          <>
            <FaFilePdf className="w-5 h-5" />
            <span>ดาว์โหลดใบเสร็จ</span>
          </>
        )}
      </button>
    </div>
  );
}

// === วิธีการแก้ไขปัญหาภาษาไทยใน PDF ===

// 1. ใช้ฟอนต์ที่รองรับภาษาไทย
export const ThaiPDFGenerator = () => {
  const generateThaiPDF = async () => {
    const { jsPDF } = await import("jspdf");

    // วิธีที่ 1: ใช้ Base64 encoded font
    const doc = new jsPDF();

    // เพิ่มฟอนต์ภาษาไทย (ต้องมีไฟล์ font)
    // doc.addFileToVFS('THSarabunNew.ttf', fontBase64String);
    // doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
    // doc.setFont('THSarabunNew');

    // วิธีที่ 2: ใช้การเข้ารหัสที่ถูกต้อง
    doc.setFont("helvetica");

    // สำหรับข้อความภาษาไทย ให้แปลงเป็น UTF-8
    const thaiText = "ใบเสร็จรับเงิน";
    doc.text(thaiText, 10, 10);

    doc.save("thai-receipt.pdf");
  };

  return <button onClick={generateThaiPDF}>Generate Thai PDF (Fixed)</button>;
};
