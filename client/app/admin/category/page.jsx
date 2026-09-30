"use client";
import Modal from "@/components/model";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { debounce } from "lodash";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaCamera,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaFolderOpen,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaTags,
  FaBoxes,
  FaCheckCircle,
  FaEyeSlash,
  FaLayerGroup,
} from "react-icons/fa";
import Loader from "@/components/loader";
import { NO_IMG_PRODUCT } from "@/config/constants";
import SafeImage from "@/components/safe-image";

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [editCtg, setEditCtg] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "draft"

  const [imgPreview, setImgPreview] = useState(null);
  const [oldImg, setOldImg] = useState(null);
  const [imgFile, setImgFile] = useState(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  const [ctgList, setCtgList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCTG = async (searchQuery = "", pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/get-ctg", {
        withCredentials: true,
        params: { search: searchQuery, page: pageNum },
      });
      if (res.status === 200) {
        setCtgList(res.data.data || []);
        setTotalPage(res.data.totalPage || 1);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce((s, p) => fetchCTG(s, p), 500),
    []
  );

  useEffect(() => {
    debounceSearch(search, page);
    return () => debounceSearch.cancel();
  }, [search, page, debounceSearch]);

  const imagePicker = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const [status, setStatus] = useState(0);
  const [saving, setSaving] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    clearErrors,
  } = useForm({
    defaultValues: {
      name: "",
      remark: "",
    },
  });

  const handleOpenCreateModal = () => {
    setEditCtg(null);
    reset({ name: "", remark: "" });
    clearErrors();
    setImgFile(null);
    setImgPreview("");
    setStatus(1); // default to active
    setShowModal(true);
  };

  const handleEdit = (ctg) => {
    setEditCtg(ctg);
    setStatus(Number(ctg?.status));
    setOldImg(ctg?.img ? envConfig.imgURL + ctg?.img : null);
    setImgPreview(ctg?.img ? envConfig.imgURL + ctg?.img : null);
    setImgFile(null);
    reset({
      name: ctg?.name || "",
      remark: ctg?.remark || "",
    });
    clearErrors();
    setShowModal(true);
  };

  const saveCtg = async (data) => {
    if (status === 0) {
      return popup.err("กรุณาเลือกสถานะ");
    }
    if (!imgPreview || (!editCtg && !imgFile)) {
      return popup.err("กรุณาเลือกรูปภาพ");
    }

    setSaving(true);
    try {
      const api = editCtg
        ? `/admin/update-ctg/${editCtg?.id}`
        : "/admin/create-ctg";

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("remark", data.remark || "");
      if (imgFile) {
        formData.append("img", imgFile);
        if (editCtg) {
          formData.append("changeImage", "true");
        }
      }
      formData.append("status", `${status}`);
      const res = await axios.post(envConfig.apiURL + api, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        popup.success(editCtg ? "อัปเดตข้อมูลหมวดหมู่แล้ว" : "เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว");
        reset();
        setStatus(0);
        setShowModal(false);
        setImgFile(null);
        setImgPreview(null);
        fetchCTG(search, page);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ctg) => {
    const { isConfirmed } = await popup.confirmPopUp(
      `ลบหมวดหมู่ ${ctg?.name}`,
      "คุณต้องการลบหมวดหมู่นี้หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้",
      "ยืนยันการลบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-ctg/${ctg?.id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        fetchCTG(search, page);
        popup.success("ลบหมวดหมู่สำเร็จแล้ว");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  };

  // Filtered categories based on client-side status toggle
  const filteredList = useMemo(() => {
    if (statusFilter === "active") return ctgList.filter((c) => Number(c?.status) === 1);
    if (statusFilter === "draft") return ctgList.filter((c) => Number(c?.status) !== 1);
    return ctgList;
  }, [ctgList, statusFilter]);

  // Computed summary metrics
  const activeCount = useMemo(
    () => ctgList.filter((c) => Number(c?.status) === 1).length,
    [ctgList]
  );
  const draftCount = useMemo(
    () => ctgList.filter((c) => Number(c?.status) !== 1).length,
    [ctgList]
  );
  const totalProductsCount = useMemo(
    () => ctgList.reduce((acc, c) => acc + (Number(c?._count?.products) || 0), 0),
    [ctgList]
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Top Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">จัดการหมวดหมู่สินค้า</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-5">
            เพิ่ม แก้ไข และจัดกลุ่มหมวดหมู่เฟอร์นิเจอร์และของตกแต่งบ้านในระบบ Furniture Marketplace
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="self-start md:self-auto px-5 py-2.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <FaPlus size={12} />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* 2. Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit border border-amber-200/60">
              หมวดหมู่ทั้งหมด
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(total || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">รายการหมวดหมู่ในระบบ</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60 shadow-2xs">
            <FaTags size={18} />
          </div>
        </div>

        {/* Active Categories */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit border border-emerald-200/60">
              เปิดใช้งานอยู่
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(activeCount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">พร้อมแสดงผลบนหน้าร้านค้า</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <FaCheckCircle size={18} />
          </div>
        </div>

        {/* Draft/Hidden Categories */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full w-fit border border-slate-200">
              ฉบับร่าง / ปิดใช้งาน
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(draftCount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">ซ่อนการแสดงผลไว้ชั่วคราว</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 shadow-2xs">
            <FaEyeSlash size={18} />
          </div>
        </div>

        {/* Total Associated Products */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full w-fit border border-neutral-200">
              สินค้ารวมทุกหมวดหมู่
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(totalProductsCount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">รายการสินค้าเฟอร์นิเจอร์</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 text-[#fbc50e] flex items-center justify-center shadow-xs">
            <FaBoxes size={18} />
          </div>
        </div>
      </div>

      {/* 3. Main Content Card: Search Toolbar & Categories Table */}
      <div className="w-full bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-5 md:p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FaSearch
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-neutral-50/80 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                placeholder="ค้นหาชื่อ หรือคำอธิบายหมวดหมู่..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <FaTimes size={11} />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-white text-neutral-950 font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                ทั้งหมด ({ctgList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "active"
                    ? "bg-white text-emerald-700 font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                เปิดใช้งาน ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "draft"
                    ? "bg-white text-neutral-700 font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                ฉบับร่าง ({draftCount})
              </button>
            </div>
          </div>

          {/* Quick Pagination Pill */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-xs text-neutral-500 font-medium">
              หน้า {page} / {totalPage || 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="p-2 rounded-xl text-neutral-700 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100 transition-colors"
                title="หน้าก่อนหน้า"
              >
                <FaChevronLeft size={11} />
              </button>
              <button
                onClick={forwardPage}
                disabled={page >= totalPage}
                className="p-2 rounded-xl text-neutral-700 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100 transition-colors"
                title="หน้าถัดไป"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table View */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/75 border-b border-neutral-200/90 text-neutral-600 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">ลำดับ</th>
                <th className="py-3.5 px-4 w-24">รูปภาพ</th>
                <th className="py-3.5 px-4 min-w-[200px]">หมวดหมู่สินค้า</th>
                <th className="py-3.5 px-4 min-w-[220px]">คำอธิบาย</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">จำนวนสินค้า</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">สถานะ</th>
                <th className="py-3.5 px-4 text-center w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-9 h-9 border-3 border-amber-200 border-t-[#fbc50e] rounded-full animate-spin" />
                      <p className="text-xs text-neutral-400 mt-1">กำลังโหลดข้อมูลหมวดหมู่...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((c, index) => {
                  const isActive = Number(c?.status) === 1;
                  return (
                    <tr
                      key={c?.id || index}
                      className="hover:bg-amber-50/25 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-4 px-4 text-center font-medium text-neutral-500">
                        {index + (page - 1) * 10 + 1}
                      </td>

                      {/* Thumbnail */}
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-100 shrink-0 shadow-2xs group-hover:border-amber-300 transition-colors flex items-center justify-center">
                          <SafeImage
                            src={c?.img ? envConfig.imgURL + c?.img : null}
                            type="category"
                            className="w-full h-full object-cover"
                            alt={c?.name || "หมวดหมู่"}
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-bold text-neutral-900 text-sm group-hover:text-[#b48300] transition-colors">
                            {c?.name}
                          </p>
                          <span className="text-[11px] text-neutral-400">
                            รหัส: #{c?.id}
                          </span>
                        </div>
                      </td>

                      {/* Remark */}
                      <td className="py-4 px-4">
                        <p className="text-neutral-600 line-clamp-2 leading-relaxed">
                          {c?.remark || "-"}
                        </p>
                      </td>

                      {/* Products Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/70">
                          <FaBoxes size={10} className="text-[#b48300]" />
                          <span>{Number(c?._count?.products || 0).toLocaleString()} ชิ้น</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                          <span>{isActive ? "เปิดใช้งาน" : "ฉบับร่าง"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(c)}
                            title="แก้ไขหมวดหมู่"
                            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            title="ลบหมวดหมู่"
                            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60 shadow-2xs">
                        <FaFolderOpen size={24} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-neutral-800">
                          {search ? "ไม่พบข้อมูลหมวดหมู่ที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลหมวดหมู่สินค้า"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                          {search
                            ? `ไม่พบหมวดหมู่ที่ตรงกับคำว่า "${search}" ลองตรวจสอบตัวสะกดหรือค้นหาคำอื่น`
                            : "เริ่มต้นเพิ่มหมวดหมู่สินค้าเฟอร์นิเจอร์แรกของคุณ เพื่อนำไปใช้จำแนกสินค้าในร้านค้า"}
                        </p>
                      </div>
                      {!search && (
                        <button
                          onClick={handleOpenCreateModal}
                          className="mt-2 px-5 py-2.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                        >
                          <FaPlus size={11} />
                          <span>เพิ่มหมวดหมู่แรกตอนนี้</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Summary & Pagination */}
        <div className="p-4 md:px-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            แสดงผล{" "}
            <span className="font-semibold text-neutral-800">
              {filteredList.length > 0 ? (page - 1) * 10 + 1 : 0}
            </span>{" "}
            ถึง{" "}
            <span className="font-semibold text-neutral-800">
              {Math.min(page * 10, total)}
            </span>{" "}
            จากทั้งหมด{" "}
            <span className="font-semibold text-neutral-800">{total}</span> หมวดหมู่
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white font-medium shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <FaChevronLeft size={10} />
              <span>ก่อนหน้า</span>
            </button>
            <span className="px-3 py-1.5 font-bold text-neutral-800 bg-neutral-100 rounded-xl">
              {page} / {totalPage || 1}
            </span>
            <button
              onClick={forwardPage}
              disabled={page >= totalPage}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white font-medium shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>ถัดไป</span>
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Add / Edit Category Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
          setStatus(0);
        }}
      >
        <div className="w-full max-w-lg p-6 md:p-8 flex flex-col bg-white border border-neutral-200/90 rounded-3xl shadow-2xl gap-5">
          <div className="w-full pb-4 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {editCtg?.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </h2>
                <p className="text-xs text-neutral-500">
                  กำหนดชื่อ ข้อมูล และภาพประกอบหมวดหมู่สินค้า
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                reset();
                setStatus(0);
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">รูปภาพหมวดหมู่</label>
            <label
              htmlFor="img-picker"
              className="w-28 h-28 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#fbc50e] bg-neutral-50 hover:bg-neutral-100/60 overflow-hidden cursor-pointer flex flex-col items-center justify-center gap-1.5 text-neutral-500 transition-all shadow-2xs"
            >
              <input
                onChange={imagePicker}
                type="file"
                className="hidden"
                id="img-picker"
              />
              {imgPreview ? (
                <SafeImage
                  src={imgPreview}
                  type="category"
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <>
                  <FaCamera size={18} className="text-[#b48300]" />
                  <p className="text-[11px] font-medium text-neutral-600">อัปโหลดรูป</p>
                </>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="name"
              rules={{ required: "กรุณากรอกชื่อหมวดหมู่" }}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ""}
                  type="text"
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all"
                  placeholder="เช่น ห้องนั่งเล่น, ห้องนอน"
                />
              )}
            />
            {errors.name && (
              <small className="text-xs text-rose-500 font-medium">
                {errors.name.message}
              </small>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              คำอธิบาย <span className="text-neutral-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <Controller
              name="remark"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ""}
                  type="text"
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                  placeholder="เช่น เฟอร์นิเจอร์ห้องนั่งเล่น โซฟา และโต๊ะกลาง (ไม่จำเป็นต้องระบุ)"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">สถานะ</label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStatus(1)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  status === 1
                    ? "bg-[#fbc50e] text-neutral-950 border-[#fbc50e] shadow-xs"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                เปิดใช้งาน
              </button>
              <button
                type="button"
                onClick={() => setStatus(2)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  status === 2
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                ฉบับร่าง
              </button>
            </div>
          </div>

          <button
            disabled={saving || loading}
            onClick={handleSubmit(saveCtg)}
            className="w-full mt-2 py-3 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader /> <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>บันทึกหมวดหมู่</span>
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Category;
