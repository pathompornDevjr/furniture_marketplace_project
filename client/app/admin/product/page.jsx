"use client";
import Modal from "@/components/model";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BiFolderOpen } from "react-icons/bi";
import { v4 as uuid } from "uuid";
import {
  FaBoxes,
  FaCaretUp,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaEdit,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaImage,
  FaPlus,
  FaRegListAlt,
  FaSearch,
  FaStoreAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import Loader from "@/components/loader";
import { debounce } from "lodash";
import { NO_IMG_PRODUCT } from "@/config/constants";
import SafeImage from "@/components/safe-image";
import ExportProductBtn from "@/components/export-product-btn";
export { NO_IMG_PRODUCT };

const Product = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");
  const [take, setTake] = useState(15);
  const [searchCtg, setSearchCtg] = useState("");
  const [sort, setSort] = useState(JSON.stringify({ pro_number: "asc" }));
  const [editProduct, setEditProduct] = useState(null);

  const [categoriesOption, setCategoriesOptions] = useState([]);
  const [selectCategories, setSelectCategories] = useState([]);
  const handleSelectCtg = (ctg) => {
    setSelectCategories((prev) => [ctg, ...prev]);
  };
  const handleDeleteSelectCtg = (value) => {
    setSelectCategories((prev) => prev.filter((p) => p?.value !== value));
  };

  const [loading, setLoading] = useState(false);
  const fetchCTG = async (search = "", page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/get-ctg", {
        withCredentials: true,
        params: { search, page, forProduct: true },
      });
      if (res.status === 200) {
        const ctgList = res.data.data;
        const ctgOptions = ctgList.map((c) => ({
          label: c.name,
          value: c?.id,
        }));
        setCategoriesOptions(ctgOptions);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCTG();
    fetchProductAvg();
  }, []);

  const [productAvg, setProductAvg] = useState(null);
  const fetchProductAvg = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/product-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setProductAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err(error);
    } finally {
      setLoading(false);
    }
  };

  const [productsList, setProcutList] = useState([]);
  const fetchProduct = async (search = "", searchCtg, sort, take, page) => {
    setLoading(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/get-product-list",
        {
          withCredentials: true,
          params: {
            search,
            searchCtg,
            sort,
            take,
            page,
          },
        }
      );
      if (res.status === 200) {
        setProcutList(res.data.products);
        setTotal(res.data.total);
        setTotalPage(res.data.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce(fetchProduct, 700),
    [fetchProduct]
  );

  useEffect(() => {
    debounceSearch(search, searchCtg, sort, take, page);
  }, [search, searchCtg, sort, take, page]);

  const [selectImages, setSelectImages] = useState([]);
  const [deleteImgs, setDeleteImgs] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const handleSelectImage = (e) => {
    const files = Array.from(e.target.files); // แปลง FileList -> Array

    // เช็คจำนวนรูป
    if (selectImages.length + files.length > 5) {
      return popup.err("อัปโหลดไม่เกิน 5 รูปภาพ");
    }
    const id = uuid();
    const newFiles = files.map((f, index) => {
      return {
        id: id + `${index}`,
        file: f,
      };
    });

    const newPreviews = files.map((f, index) => {
      return {
        id: id + `${index}`,
        url: URL.createObjectURL(f),
      };
    });
    console.log(selectImages);
    setSelectImages((prev) => [...newFiles, ...prev]);
    setPreviewImages((prev) => [...newPreviews, ...prev]);
  };
  const handleDeleteImage = (id, url) => {
    setSelectImages((prev) => prev.filter((p) => p.id !== id));
    setPreviewImages((prev) => prev.filter((p) => p.id !== id));
    if (editProduct?.pro_id && url.startsWith("h")) {
      setDeleteImgs((prev) => [id, ...prev]);
    }
  };

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      pro_name: "",
      pro_price: "",
      freight: "",
      pro_number: "",
      pro_color: "",
      pro_size: "",
      pro_details: "",
      unit: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const handleSaveProduct = async (data) => {
    if (selectCategories.length < 1) {
      return popup.err("โปรดเลือกหมวดหมู่สินค้าอย่าง 1 หมวดหมู่");
    }
    if (previewImages.length < 2) {
      return popup.err("อัปโหลดอย่างน้อย 2 รูปภาพ");
    }

    setSaving(true);
    try {
      const api = editProduct?.pro_id
        ? `/admin/update-product/${editProduct.pro_id}`
        : `/admin/create-product`;

      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      //   image
      selectImages.forEach((imgObj) => {
        formData.append("images[]", imgObj.file);
      });
      //ctgs
      formData.append(
        "categories",
        selectCategories.map((s) => s.value).join(",")
      );

      if (editProduct?.pro_id && deleteImgs.length > 0) {
        formData.append("deleteImgs", deleteImgs.join(","));
      }

      const res = await axios.post(envConfig.apiURL + api, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200) {
        fetchProduct(search, searchCtg, sort, take, page);
        fetchProductAvg();
        popup.success();
        setShowModal(false);
        reset();
        setSelectCategories([]);
        setSelectImages([]);
        setPreviewImages([]);
        if (editProduct?.pro_id) {
          setSort(JSON.stringify({ updatedAt: "desc" }));
        } else {
          setSort(JSON.stringify({ createdAt: "desc" }));
        }
        setPage(1);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const resetAllSearch = () => {
    setPage(1);
    setSearch("");
    setSearchCtg("");
    setSort(JSON.stringify({ createdAt: "desc" }));
    setTake(15);
  };

  const handleEdit = async (product) => {
    setEditProduct(product);
    setShowModal(true);
    reset({
      pro_name: product?.pro_name,
      pro_color: product?.pro_color,
      pro_details: product?.pro_details,
      freight: product?.freight,
      pro_number: product?.pro_number,
      pro_price: product?.pro_price,
      pro_size: product?.pro_size,
      unit: product?.unit,
    });

    setSelectCategories(
      product?.categories?.map((c) => ({ label: c?.name, value: c?.id }))
    );
    setPreviewImages(
      product?.imgs.map((img) => ({
        id: img?.id,
        url: envConfig.imgURL + img?.url,
      }))
    );
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await popup.confirmPopUp(
      `ลบสินค้า${name}`,
      "ต้องการลบข้อมูลของสินค้าหรือไม่?",
      "ลบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-product/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success("ลบข้อมูลแล้ว");
        fetchProduct(search, searchCtg, sort, take, page);
        fetchProductAvg();
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
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">จัดการรายการสินค้า</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-5">
            เพิ่ม แก้ไขข้อมูลเฟอร์นิเจอร์และของแต่งบ้าน Furniture Marketplace ตรวจสอบสต็อก และจัดการหมวดหมู่
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <ExportProductBtn
            search={search}
            searchCtg={searchCtg}
            fallbackProducts={productsList}
          />
          <button
            onClick={() => {
              setShowModal(true);
              setEditProduct(null);
              reset({
                pro_name: "",
                pro_price: "",
                freight: "",
                pro_number: "",
                pro_color: "",
                pro_size: "",
                pro_details: "",
                unit: "",
              });
              setSelectCategories([]);
              setPreviewImages([]);
              setSelectImages([]);
            }}
            className="px-5 py-2.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FaPlus size={13} />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit border border-amber-200/60">
              รายการสินค้าทั้งหมด
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(productAvg?.allList || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <FaBoxes size={20} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full w-fit border border-violet-200/60">
              สต็อกรวมทั้งหมด
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(productAvg?.allStock || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
            <FaStoreAlt size={20} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit border border-emerald-200/60">
              จำหน่ายแล้วทั้งหมด
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(productAvg?.allSell || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FaDollarSign size={20} />
          </div>
        </div>

        <div
          onClick={() => {
            setSort(JSON.stringify({ pro_number: "asc" }));
            setPage(1);
          }}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full w-fit border border-rose-200/60">
              สินค้าใกล้หมดสต็อก
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Number(productAvg?.allLowStock || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:bg-rose-100 transition-colors">
            <FaExclamationTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Main Content & Table Box */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col overflow-hidden">
        {/* Search & Filters Toolbar */}
        <div className="p-5 md:p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า รายละเอียดเฟอร์นิเจอร์..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all text-neutral-900 placeholder:text-neutral-400"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <FaTimes size={11} />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="w-full sm:w-[220px]">
              <Select
                options={categoriesOption}
                onChange={(option) => {
                  setSearchCtg(option ? option.value : "");
                  setPage(1);
                }}
                value={categoriesOption.find((c) => c.value == searchCtg) || null}
                placeholder="หมวดหมู่สินค้าทั้งหมด"
                className="w-full text-xs"
                isClearable
              />
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                value={sort}
                className="appearance-none text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
              >
                <option value={JSON.stringify({ createdAt: "desc" })}>เรียง: เพิ่มล่าสุด</option>
                <option value={JSON.stringify({ updatedAt: "desc" })}>เรียง: แก้ไขล่าสุด</option>
                <option value={JSON.stringify({ pro_number: "desc" })}>เรียง: สต็อกมากสุด</option>
                <option value={JSON.stringify({ pro_number: "asc" })}>เรียง: สต็อกน้อยสุด</option>
                <option value={JSON.stringify({ sell_count: "desc" })}>เรียง: ยอดขายสูงสุด</option>
                <option value={JSON.stringify({ pro_price: "desc" })}>เรียง: ราคาสูงสุด</option>
                <option value={JSON.stringify({ pro_price: "asc" })}>เรียง: ราคาต่ำสุด</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={10} />
            </div>

            {/* Take Rows Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  setTake(e.target.value);
                  setPage(1);
                }}
                value={take}
                className="appearance-none text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
              >
                <option value={15}>แสดง 15 แถว</option>
                <option value={25}>แสดง 25 แถว</option>
                <option value={50}>แสดง 50 แถว</option>
                <option value={100}>แสดง 100 แถว</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={10} />
            </div>

            {/* Reset Filters Button */}
            <button
              onClick={resetAllSearch}
              className="p-2.5 text-xs font-semibold text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="ล้างการค้นหา"
            >
              <FaTrash size={11} />
              <span className="hidden sm:inline">ล้างฟิลเตอร์</span>
            </button>

            {/* Quick Pagination Pill */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="p-2 text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl disabled:opacity-30 transition-colors"
                title="หน้าก่อนหน้า"
              >
                <FaChevronLeft size={11} />
              </button>
              <span className="text-xs font-semibold text-neutral-700 px-1">
                {page} / {totalPage || 1}
              </span>
              <button
                onClick={forwardPage}
                disabled={page >= totalPage}
                className="p-2 text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl disabled:opacity-30 transition-colors"
                title="หน้าถัดไป"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Table View */}
        <div className="overflow-x-auto">
          <div className="min-w-[1020px]">
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-neutral-50/75 border-b border-neutral-200/90 text-xs font-bold text-neutral-600 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">สินค้า</div>
              <div className="col-span-2">รายละเอียด</div>
              <div className="col-span-2 text-right">ราคา / หน่วย</div>
              <div className="col-span-1 text-center">คงเหลือ</div>
              <div className="col-span-1 text-center">ขายแล้ว</div>
              <div className="col-span-1 text-center">จัดการ</div>
            </div>

            <div className="flex flex-col min-h-[380px]">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20 text-neutral-400">
                  <div className="w-9 h-9 border-3 border-amber-200 border-t-[#fbc50e] rounded-full animate-spin" />
                  <p className="text-xs text-neutral-500 mt-2">กำลังโหลดข้อมูลสินค้า...</p>
                </div>
              ) : productsList?.length > 0 ? (
                <div className="divide-y divide-neutral-100 text-xs">
                  {productsList.map((p, index) => {
                    const isOutOfStock = Number(p?.pro_number) === 0;
                    const isLowStock = Number(p?.pro_number) > 0 && Number(p?.pro_number) <= 5;
                    return (
                      <div
                        key={uuid()}
                        className={`grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-amber-50/25 transition-colors group ${
                          isOutOfStock ? "bg-rose-50/25" : ""
                        }`}
                      >
                        {/* Index */}
                        <div className="col-span-1 text-center font-medium text-neutral-400">
                          {index + (page - 1) * take + 1}
                        </div>

                        {/* Product Thumbnail & Name */}
                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-100 shrink-0 relative shadow-2xs group-hover:border-amber-300 transition-colors flex items-center justify-center">
                            <SafeImage
                              src={
                                p?.imgs?.[0]
                                  ? envConfig.imgURL + p.imgs[0].url
                                  : null
                              }
                              className="w-full h-full object-cover"
                              type="product"
                              alt={p?.pro_name || "สินค้า"}
                            />
                            {(isOutOfStock || isLowStock) && (
                              <span
                                className={`absolute bottom-0 inset-x-0 text-[9px] text-center font-bold text-white py-0.5 ${
                                  isOutOfStock ? "bg-rose-600" : "bg-amber-600"
                                }`}
                              >
                                {isOutOfStock ? "หมดสต็อก" : "ใกล้หมด"}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0 gap-1">
                            <p
                              className="font-bold text-neutral-900 text-sm truncate group-hover:text-[#b48300] transition-colors"
                              title={p?.pro_name}
                            >
                              {p?.pro_name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              {p?.categories?.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 font-medium">
                                  {p.categories.map((c) => c.name).join(", ")}
                                </span>
                              )}
                              {p?.freight > 0 ? (
                                <span className="text-neutral-500">
                                  ค่าส่ง ฿{Number(p.freight).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                  ส่งฟรี
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="col-span-2 text-neutral-600 line-clamp-2 leading-relaxed">
                          {p?.pro_details || "-"}
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-right">
                          <p className="font-extrabold text-neutral-900 text-sm">
                            ฿{Number(p?.pro_price).toLocaleString()}
                          </p>
                          <span className="text-[11px] text-neutral-400">
                            /{p?.unit || "ชิ้น"}
                          </span>
                        </div>

                        {/* Stock */}
                        <div className="col-span-1 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isOutOfStock
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isLowStock
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {Number(p?.pro_number).toLocaleString()}
                          </span>
                        </div>

                        {/* Sells */}
                        <div className="col-span-1 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/60">
                            <span>{Number(p?.sell_count || 0).toLocaleString()}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="แก้ไขสินค้า"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p?.pro_id, p?.pro_name)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="ลบสินค้า"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60 shadow-2xs">
                    <BiFolderOpen size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-neutral-800">
                      {search || searchCtg ? "ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข" : "ยังไม่มีข้อมูลสินค้าในระบบ"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                      {search || searchCtg
                        ? "ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองหมวดหมู่เพื่อค้นหาใหม่อีกครั้ง"
                        : "เริ่มต้นเพิ่มสินค้าเฟอร์นิเจอร์ชิ้นแรกของคุณเข้าสู่ระบบได้ทันที"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Footer: Summary & Pagination */}
        <div className="p-4 md:px-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            แสดงผล{" "}
            <span className="font-semibold text-neutral-800">
              {productsList?.length > 0 ? (page - 1) * take + 1 : 0}
            </span>{" "}
            ถึง{" "}
            <span className="font-semibold text-neutral-800">
              {Math.min(page * take, total)}
            </span>{" "}
            จากทั้งหมด{" "}
            <span className="font-semibold text-neutral-800">{total}</span> รายการสินค้า
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

      {/* add edit forms */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setDeleteImgs([]);
        }}
      >
        <div className="w-full max-w-4xl max-h-[90vh] p-6 md:p-8 bg-white rounded-3xl border border-neutral-200/90 shadow-2xl overflow-y-auto flex flex-col gap-5">
          <div className="w-full pb-4 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {editProduct?.pro_id ? "แก้ไขข้อมูลสินค้า" : "เพิ่มข้อมูลสินค้าใหม่"}
                </h2>
                <p className="text-xs text-neutral-500">
                  จัดการรายละเอียดสินค้าและคลังรูปภาพเฟอร์นิเจอร์
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                reset();
                setDeleteImgs([]);
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="w-full flex flex-col lg:mt-2 gap-6 lg:flex-row">
            {/* Left Column: Product Details Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full lg:w-1/2 lg:pr-6 lg:border-r border-neutral-200">
              {/* ctgs */}
              <div className="flex flex-col lg:col-span-2 gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  หมวดหมู่สินค้า <span className="text-rose-500">*</span>
                </label>
                <Select
                  options={categoriesOption.filter(
                    (c) =>
                      !selectCategories.map((s) => s?.value).includes(c?.value)
                  )}
                  onChange={(options) => handleSelectCtg(options)}
                  placeholder="เลือกหมวดหมู่ที่ต้องการ..."
                  className="w-full text-xs"
                />
                {selectCategories.length > 0 && (
                  <div
                    className={`mt-1.5 w-full grid grid-cols-2 lg:grid-cols-3 gap-2 ${
                      selectCategories.length > 3
                        ? "h-[80px] overflow-auto"
                        : ""
                    }`}
                  >
                    {selectCategories.map((s, index) => (
                      <span
                        key={s?.value || index}
                        className="py-1 px-2.5 shadow-2xs cursor-pointer justify-between text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg flex items-center gap-2"
                      >
                        <p>{s?.label}</p>
                        <FaTimes
                          onClick={() => handleDeleteSelectCtg(s?.value)}
                          className="cursor-pointer text-amber-700 hover:text-rose-600 transition-colors"
                          size={11}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* pro_name */}
              <div className="flex flex-col w-full lg:col-span-2 gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ชื่อสินค้า <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="pro_name"
                  rules={{ required: "กรุณากรอกชื่อสินค้า" }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="เช่น โซฟาผ้า 3 ที่นั่ง รุ่น Nordic Luxe"
                    />
                  )}
                />
                {errors.pro_name && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.pro_name.message}
                  </small>
                )}
              </div>

              {/* unit */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  หน่วยนับ <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="unit"
                  rules={{ required: "กรุณากรอกหน่วยของสินค้า" }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="เช่น ชิ้น, ตัว, ชุด"
                    />
                  )}
                />
                {errors.unit && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.unit.message}
                  </small>
                )}
              </div>

              {/* pro price */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ราคา (บาท) <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="pro_price"
                  rules={{
                    required: "กรุณากรอกราคาสินค้า",
                    validate: (value) => {
                      if (value < 0) return "ราคาไม่ถูกต้อง";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value?.toString() || ""}
                      {...field}
                      type="number"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.pro_price && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.pro_price.message}
                  </small>
                )}
              </div>

              {/* freight */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ค่าจัดส่ง (บาท) <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="freight"
                  rules={{
                    required: "กรุณากรอกค่าจัดส่ง",
                    validate: (value) => {
                      if (value < 0) return "ราคาไม่ถูกต้อง";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value?.toString() || ""}
                      {...field}
                      type="number"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="0 (ส่งฟรีใส่ 0)"
                    />
                  )}
                />
                {errors.freight && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.freight.message}
                  </small>
                )}
              </div>

              {/* pro_number */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  จำนวนสต็อกสินค้า <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="pro_number"
                  rules={{
                    required: "กรุณากรอกจำนวนที่เพิ่ม",
                    validate: (value) => {
                      if (value < 1) return "จำนวนไม่ถูกต้อง";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      type="number"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="เช่น 50"
                    />
                  )}
                />
                {errors.pro_number && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.pro_number.message}
                  </small>
                )}
              </div>

              {/* pro_color */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ตัวเลือกสี <span className="text-neutral-400 font-normal">(คั่นด้วย ,)</span> <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="pro_color"
                  rules={{
                    required: "กรุณากรอกสี เช่น สีเทา, สีเบจ",
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      type="text"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="เช่น สีเทา, สีเบจ, สีน้ำตาลวอลนัท"
                    />
                  )}
                />
                {errors.pro_color && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.pro_color.message}
                  </small>
                )}
              </div>

              {/* pro_size */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ขนาด / ไซส์ <span className="text-neutral-400 font-normal">(คั่นด้วย ,)</span> <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="pro_size"
                  rules={{
                    required: "กรุณากรอกไซส์ เช่น กว้าง 120cm",
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      type="text"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400"
                      placeholder="เช่น S, M, L หรือ 3.5 ฟุต, 5 ฟุต, 6 ฟุต"
                    />
                  )}
                />
                {errors.pro_size && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.pro_size.message}
                  </small>
                )}
              </div>

              {/* pro details */}
              <div className="flex flex-col w-full lg:col-span-2 gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  รายละเอียดสินค้า <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="pro_details"
                  rules={{
                    required: "กรุณาระบุรายละเอียดของสินค้า",
                    validate: (value) => {
                      if (value.length < 20) return "รายละเอียดสั้นเกินไป";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <textarea
                      value={field.value || ""}
                      {...field}
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-900 transition-all placeholder:text-neutral-400 h-28 resize-none leading-relaxed"
                      placeholder="อธิบายรายละเอียด คุณสมบัติ วัสดุ และจุดเด่นของเฟอร์นิเจอร์ชิ้นนี้..."
                    ></textarea>
                  )}
                />
                {errors.pro_details && (
                  <small className="text-xs text-rose-500 font-medium">
                    {errors.pro_details.message}
                  </small>
                )}
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="w-full lg:w-1/2 flex flex-col lg:pl-3 gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">
                  รูปภาพสินค้า ({previewImages.length}/5)
                </label>
                <span className="text-[11px] text-neutral-400">รูปแรกจะใช้เป็นภาพหลัก</span>
              </div>

              {/* Upload Dropzone */}
              <label
                htmlFor="img-pickers"
                className="w-full h-24 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#fbc50e] bg-neutral-50 hover:bg-neutral-100/60 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-neutral-500 shadow-2xs"
              >
                <input
                  type="file"
                  id="img-pickers"
                  className="hidden"
                  multiple
                  onChange={handleSelectImage}
                />
                <FaImage size={20} className="text-[#b48300]" />
                <p className="text-xs font-bold text-neutral-800">คลิกเพื่อเลือกรูปภาพสินค้า</p>
                <p className="text-[10px] text-neutral-400">รองรับไฟล์ JPG, PNG หรือ WebP (สูงสุด 5 รูป)</p>
              </label>

              {/* Preview Images Grid */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1">
                {previewImages?.length > 0 ? (
                  previewImages.map((p, idx) => (
                    <div
                      key={p?.id}
                      className="h-28 relative rounded-xl overflow-hidden border border-neutral-200/80 shadow-2xs bg-neutral-100 group"
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(p?.id, p?.url)}
                        className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-lg bg-neutral-900/80 hover:bg-rose-600 text-white transition-colors shadow-sm"
                        title="ลบรูปภาพนี้"
                      >
                        <FaTrash size={10} />
                      </button>

                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 z-10 text-[9px] font-bold bg-[#fbc50e] text-neutral-950 px-1.5 py-0.5 rounded shadow-xs">
                          ภาพหลัก
                        </span>
                      )}

                      <SafeImage
                        src={p?.url || null}
                        className="w-full h-full object-cover"
                        type="product"
                        alt={p?.name || "ภาพสินค้า"}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-xs text-neutral-400">
                    ยังไม่มีรูปภาพสินค้าที่เลือก
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={saving}
            onClick={handleSubmit(handleSaveProduct)}
            className="w-full py-3.5 flex items-center justify-center gap-2 mt-2 text-neutral-950 font-bold text-xs bg-[#fbc50e] hover:bg-[#eab308] rounded-xl shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader /> <span>กำลังบันทึกข้อมูลสินค้า...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>บันทึกข้อมูลสินค้า</span>
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default Product;
