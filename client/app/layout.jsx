import { Sarabun } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/layout/navbar";
import Footer from "@/layout/footer";
import { AppProvider } from "@/context/app-context";

const kanit = Sarabun({
  subsets: ["thai"],
  weight: ["400", "600", "800"],
});

export const metadata = {
  title: "Furniture Marketplace System | ศูนย์รวมเฟอร์นิเจอร์และของแต่งบ้านออนไลน์",
  description: "ระบบตลาดกลางจำหน่ายเฟอร์นิเจอร์และของตกแต่งบ้านคุณภาพ ตอบโจทย์ทุกไลฟ์สไตล์ พร้อมโปรโมชั่นและส่วนลดพิเศษ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${kanit.className} antialiased bg-[#f8fafc] text-neutral-900`}>
        <AppProvider>
          <Navbar />

          <div className="w-full bg-[#f8fafc] min-h-screen flex flex-col items-center">
            {children}
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
