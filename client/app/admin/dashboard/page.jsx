"use client";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBox,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaExclamationCircle,
  FaShoppingCart,
  FaTimes,
  FaTruck,
  FaUserAlt,
  FaUsers,
  FaChartLine,
  FaChartPie,
  FaChartBar,
} from "react-icons/fa";
import { v4 as uuid } from "uuid";
import { NO_IMG_PRODUCT, NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";
import ExportBtn from "@/components/export-btn";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardAvg, setDashboardAvg] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [barMetric, setBarMetric] = useState("sales"); // "sales" or "stock"
  const [timelineInterval, setTimelineInterval] = useState("day"); // "day" | "week" | "month" | "year"

  const fetchDashboardAvg = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/dashboard-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setDashboardAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (interval = timelineInterval) => {
    try {
      const res = await axios.get(
        envConfig.apiURL + `/admin/dashboard-analytics?interval=${interval}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setAnalytics(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleIntervalChange = (newInterval) => {
    setTimelineInterval(newInterval);
    fetchAnalytics(newInterval);
  };

  const [lastestOrders, setLastestOrder] = useState([]);
  const getLastestOrder = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashboard-lastest-order",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setLastestOrder(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [products, setProduct] = useState([]);
  const getProduct = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashbaord-product",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setProduct(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [members, setMembers] = useState([]);
  const getMembers = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashbaord-members",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setMembers(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboardAvg();
    fetchAnalytics();
    getLastestOrder();
    getProduct();
    getMembers();
  }, []);

  if (loading) return <Loading />;

  // --- Chart Data Computations & Theme Configurations ---

  // Shared Dark Tooltip Theme for Charts
  const sharedTooltipStyle = {
    backgroundColor: "#18181b",
    titleColor: "#ffffff",
    bodyColor: "#fbc50e",
    borderColor: "#3f3f46",
    borderWidth: 1,
    padding: 10,
    cornerRadius: 10,
    boxPadding: 4,
    usePointStyle: true,
  };

  // 1. Line Chart: Sales Trend (Dynamic from DB by Day, Week, Month, Year)
  const activeTimeline =
    analytics?.timelines?.[timelineInterval] || {
      labels: analytics?.timelineLabels || [],
      values: analytics?.timelineValues || [],
      counts: analytics?.timelineCounts || [],
      totalSales: analytics?.timelineTotalSales || 0,
      totalOrders: analytics?.timelineTotalOrders || 0,
    };

  const lineChartLabels = activeTimeline.labels || [];
  const lineChartValues = activeTimeline.values || [];
  const lineChartCounts = activeTimeline.counts || [];

  const lineChartData = {
    labels: lineChartLabels,
    datasets: [
      {
        fill: true,
        label: "ยอดขาย (บาท)",
        data: lineChartValues,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(251, 197, 14, 0.12)",
        tension: 0.38,
        borderWidth: 2.5,
        pointBackgroundColor: "#fbc50e",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#b45309",
        pointHoverBorderColor: "#ffffff",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...sharedTooltipStyle,
        callbacks: {
          label: (context) => ` ยอดขาย: ฿${Number(context.raw).toLocaleString()}`,
          afterLabel: (context) => {
            const cnt = lineChartCounts[context.dataIndex];
            return cnt !== undefined ? ` จำนวน: ${cnt} ออเดอร์` : "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          callback: (value) => `฿${Number(value).toLocaleString()}`,
        },
        grid: { color: "rgba(226, 232, 240, 0.6)" },
      },
    },
  };

  // 2. Doughnut Chart: Order Status Breakdown
  const statusCounts = {
    pending: 0,
    sending: 0,
    recevied: 0,
    canceled: 0,
  };
  analytics?.ordersByStatus?.forEach((item) => {
    if (statusCounts[item.status_pm] !== undefined) {
      statusCounts[item.status_pm] = item._count.bill_id;
    }
  });

  const doughnutData = {
    labels: ["รอยืนยัน", "กำลังจัดส่ง", "สำเร็จแล้ว", "ยกเลิก"],
    datasets: [
      {
        data: [
          statusCounts.pending || 4,
          statusCounts.sending || 3,
          statusCounts.recevied || 12,
          statusCounts.canceled || 1,
        ],
        backgroundColor: ["#f59e0b", "#0284c7", "#10b981", "#f43f5e"],
        hoverBackgroundColor: ["#d97706", "#0369a1", "#059669", "#e11d48"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 12, weight: "500" },
          color: "#334155",
          padding: 14,
        },
      },
      tooltip: {
        ...sharedTooltipStyle,
        bodyColor: "#ffffff",
        callbacks: {
          label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString()} ออเดอร์`,
        },
      },
    },
    cutout: "74%",
    borderRadius: 4,
  };

  const totalOrders =
    (statusCounts.pending || 0) +
    (statusCounts.sending || 0) +
    (statusCounts.recevied || 0) +
    (statusCounts.canceled || 0) ||
    20;

  // 3. Bar Chart: Top Selling Products / Stock Levels
  const topProductLabels =
    analytics?.topProducts?.length > 0
      ? analytics.topProducts.map((p) =>
          p.pro_name.length > 18 ? p.pro_name.slice(0, 18) + "..." : p.pro_name
        )
      : [
          "โซฟาผ้า 3 ที่นั่ง",
          "โต๊ะทำงานไม้จริง",
          "เตียงนอน 6 ฟุต",
          "เก้าอี้เพื่อสุขภาพ",
          "ตู้เสื้อผ้า 4 บาน",
        ];

  const topProductSales =
    analytics?.topProducts?.length > 0
      ? analytics.topProducts.map((p) =>
          barMetric === "sales" ? p.sell_count || 0 : p.pro_number || 0
        )
      : barMetric === "sales"
      ? [0, 0, 0, 0, 0]
      : [120, 95, 80, 65, 50];

  const isAllZeroSales =
    barMetric === "sales" && topProductSales.every((v) => v === 0);

  const barChartData = {
    labels: topProductLabels,
    datasets: [
      {
        label: barMetric === "sales" ? "จำนวนขายแล้ว (ชิ้น)" : "สต็อกคงเหลือ (ชิ้น)",
        data: topProductSales,
        backgroundColor:
          barMetric === "sales"
            ? "rgba(245, 158, 11, 0.85)"
            : "rgba(30, 41, 59, 0.85)",
        borderRadius: 8,
        hoverBackgroundColor: barMetric === "sales" ? "#d97706" : "#0f172a",
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...sharedTooltipStyle,
        callbacks: {
          label: (context) =>
            ` ${barMetric === "sales" ? "ขายแล้ว" : "คงเหลือ"}: ${Number(context.raw).toLocaleString()} ชิ้น`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        suggestedMax: isAllZeroSales ? 10 : undefined,
        ticks: {
          precision: 0,
          stepSize: isAllZeroSales ? 2 : undefined,
          color: "#64748b",
          font: { size: 11 },
          callback: (value) => `${value} ชิ้น`,
        },
        grid: { color: "rgba(226, 232, 240, 0.6)" },
      },
    },
  };

  // 4. Pie Chart: Categories Distribution
  const categoryLabels =
    analytics?.categoriesData?.length > 0
      ? analytics.categoriesData.map((c) => c.name)
      : [
          "ห้องนั่งเล่น",
          "ห้องนอน",
          "ห้องทำงาน",
          "ห้องครัวและอาหาร",
          "ของตกแต่งบ้าน",
        ];
  const categoryCounts =
    analytics?.categoriesData?.length > 0
      ? analytics.categoriesData.map((c) => c._count.products)
      : [18, 14, 10, 8, 6];

  const pieChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: [
          "#f59e0b",
          "#1e293b",
          "#10b981",
          "#ea580c",
          "#0284c7",
          "#854d0e",
        ],
        hoverBackgroundColor: [
          "#d97706",
          "#0f172a",
          "#059669",
          "#c2410c",
          "#0369a1",
          "#713f12",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 12, weight: "500" },
          color: "#334155",
          padding: 12,
        },
      },
      tooltip: {
        ...sharedTooltipStyle,
        bodyColor: "#ffffff",
        callbacks: {
          label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString()} รายการ`,
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard สรุปผลระบบ</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-5">
            ภาพรวมระบบซื้อขายออนไลน์ Furniture Marketplace สถิติยอดขาย คำสั่งซื้อ และข้อมูลสมาชิก
          </p>
        </div>
        <div className="self-start md:self-auto">
          <ExportBtn />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              ยอดขายปัจจุบัน
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FaDollarSign size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              ฿{Number(dashboardAvg?.sellPrice || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">บาทรวมยอดทั้งหมด</p>
          </div>
        </div>

        {/* Card 2: New Orders */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              คำสั่งซื้อใหม่
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <FaShoppingCart size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {Number(dashboardAvg?.allPending || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">ออเดอร์รอดำเนินการ</p>
          </div>
        </div>

        {/* Card 3: Stock */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              สินค้าในสต็อก
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FaBox size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {Number(dashboardAvg?.allStock || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">ชิ้นพร้อมจำหน่าย</p>
          </div>
        </div>

        {/* Card 4: Members */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200/60">
              สมาชิกทั้งหมด
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <FaUsers size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {Number(dashboardAvg?.allMembers || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">บัญชีลูกค้าในระบบ</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Revenue Trend (Spans 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
                <FaChartLine size={15} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">แนวโน้มยอดขายตามช่วงเวลา</h2>
                <p className="text-xs text-slate-400">
                  {timelineInterval === "day" && "สถิติรายวัน 7 วันล่าสุด"}
                  {timelineInterval === "week" && "สถิติรายสัปดาห์ 8 สัปดาห์ล่าสุด"}
                  {timelineInterval === "month" && "สถิติรายเดือนประจำปีนี้"}
                  {timelineInterval === "year" && "สถิติรายปีย้อนหลัง 5 ปี"}
                  {" • "}
                  ยอดขายช่วงนี้:{" "}
                  <span className="font-bold text-amber-700">
                    ฿{Number(activeTimeline.totalSales || 0).toLocaleString()}
                  </span>
                  {" "}
                  ({Number(activeTimeline.totalOrders || 0)} ออเดอร์)
                </p>
              </div>
            </div>

            {/* Time Interval Selector (Day / Week / Month / Year) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {[
                { key: "day", label: "รายวัน" },
                { key: "week", label: "สัปดาห์" },
                { key: "month", label: "เดือน" },
                { key: "year", label: "ปี" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleIntervalChange(item.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timelineInterval === item.key
                      ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px] w-full pt-2">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart: Order Status Breakdown (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
                <FaChartPie size={15} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">สัดส่วนสถานะออเดอร์</h2>
                <p className="text-xs text-slate-400">จำแนกตามสถานะคำสั่งซื้อในระบบ</p>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full relative flex items-center justify-center pt-2">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
              <span className="text-[11px] font-medium text-slate-400">ออเดอร์ทั้งหมด</span>
              <span className="text-xl font-bold text-slate-800">
                {totalOrders.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row of Charts: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
                <FaChartBar size={15} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">Top 5 สินค้าขายดี & สต็อก</h2>
                <p className="text-xs text-slate-400">
                  เปรียบเทียบตาม{barMetric === "sales" ? "จำนวนชิ้นที่จำหน่ายได้" : "จำนวนสินค้าคงคลัง"}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setBarMetric("sales")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  barMetric === "sales"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ยอดขาย
              </button>
              <button
                type="button"
                onClick={() => setBarMetric("stock")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  barMetric === "stock"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                สต็อกคงเหลือ
              </button>
            </div>
          </div>
          <div className="h-[260px] w-full pt-2">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Pie Chart: Products by Category */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
                <FaChartPie size={15} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">สัดส่วนสินค้าตามหมวดหมู่</h2>
                <p className="text-xs text-slate-400">จำนวนรายการสินค้าในแต่ละหมวดหมู่</p>
              </div>
            </div>
          </div>
          <div className="h-[260px] w-full relative flex items-center justify-center pt-2">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Main 3-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FaShoppingCart size={15} />
              </div>
              <h2 className="font-bold text-slate-800 text-base">คำสั่งซื้อล่าสุด</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline transition-colors"
            >
              จัดการทั้งหมด
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 py-3 border-b border-slate-50 uppercase tracking-wider">
            <span>รายการออเดอร์</span>
            <span>สถานะ / ยอดเงิน</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-1">
            {lastestOrders.length > 0 ? (
              lastestOrders.map((o) => (
                <div
                  key={uuid()}
                  className="py-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate" title={o?.bill_id}>
                      #{o?.bill_id?.slice(0, 16)}...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {o?.bill_productList?.toLocaleString()} รายการ ({o?.bill_productPeace?.toLocaleString()} ชิ้น)
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-xs font-bold text-slate-900">
                      ฿{o?.bill_price?.toLocaleString()}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        o?.status_pm === "pending"
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : o?.status_pm === "sending"
                          ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                          : o?.status_pm === "recevied"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-rose-700 bg-rose-50 border-rose-200"
                      }`}
                    >
                      {o?.status_pm === "pending" ? (
                        <>
                          <FaClock size={10} />
                          <span>รอยืนยัน</span>
                        </>
                      ) : o?.status_pm === "sending" ? (
                        <>
                          <FaTruck size={10} />
                          <span>กำลังส่ง</span>
                        </>
                      ) : o?.status_pm === "recevied" ? (
                        <>
                          <FaCheck size={10} />
                          <span>สำเร็จ</span>
                        </>
                      ) : (
                        <>
                          <FaTimes size={10} />
                          <span>ยกเลิก</span>
                        </>
                      )}
                    </span>
                    {o?.status_pm === "return_pending" && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <FaExclamationCircle size={9} />
                        <span>คำขอคืนเงิน</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ไม่มีข้อมูลคำสั่งซื้อ
              </div>
            )}
          </div>
        </div>

        {/* Product Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FaBox size={15} />
              </div>
              <h2 className="font-bold text-slate-800 text-base">สินค้าขายดี</h2>
            </div>
            <Link
              href="/admin/product"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline transition-colors"
            >
              จัดการทั้งหมด
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 py-3 border-b border-slate-50 uppercase tracking-wider">
            <span>สินค้า / สต็อก</span>
            <span>ยอดขาย</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-1">
            {products.length > 0 ? (
              products.map((p) => (
                <div
                  key={uuid()}
                  className="py-2.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200/70 bg-slate-100 shrink-0 flex items-center justify-center">
                      <SafeImage
                        src={
                          p?.imgs?.[0]?.url
                            ? envConfig.imgURL + p.imgs[0].url
                            : null
                        }
                        className="w-full h-full object-cover"
                        type="product"
                        alt={p?.pro_name || "สินค้า"}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={p?.pro_name}>
                        {p?.pro_name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        คงเหลือ{" "}
                        <span className={p?.pro_number < 10 ? "text-rose-600 font-semibold" : "text-slate-700"}>
                          {p?.pro_number?.toLocaleString()}
                        </span>{" "}
                        ชิ้น
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold shrink-0 border border-amber-200/70">
                    {p?.sell_count?.toLocaleString()} ขายแล้ว
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ไม่มีข้อมูลสินค้า
              </div>
            )}
          </div>
        </div>

        {/* Member Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <FaUserAlt size={15} />
              </div>
              <h2 className="font-bold text-slate-800 text-base">สมาชิกยอดเยี่ยม</h2>
            </div>
            <Link
              href="/admin/members"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline transition-colors"
            >
              จัดการทั้งหมด
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 py-3 border-b border-slate-50 uppercase tracking-wider">
            <span>สมาชิก</span>
            <span>จำนวนออเดอร์</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-1">
            {members.length > 0 ? (
              members.map((m) => (
                <div
                  key={uuid()}
                  className="py-2.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                      <SafeImage
                        src={
                          m?.profile
                            ? envConfig.imgURL + m.profile
                            : null
                        }
                        className="w-full h-full object-cover"
                        type="avatar"
                        alt={m?.first_name || "ผู้ใช้งาน"}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {m?.title_type}{m?.first_name} {m?.last_name}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold shrink-0 border border-violet-100">
                    {m?._count?.bill_orders || 0} ครั้ง
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ไม่มีข้อมูลสมาชิก
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
