"use client";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import ProductCard from "@/components/product-card";
import { envConfig } from "@/config/env-config";
import { useAppContext } from "@/context/app-context";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFilter,
  FaList,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { v4 as uuid } from "uuid";

const Search = () => {
  const [showResponSiveMenu, setShowResponsiveMenu] = useState(false);
  const [inputMinPrice, setInputMinPrice] = useState(0);
  const [inputMaxPrice, setInputMaxPrice] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(JSON.stringify({ sell_count: "desc" }));

  const { search, searchCtgs, setSearchCtgs } = useAppContext();

  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const fetchCTG = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-ctg");
      if (res.status === 200) {
        setCategories(res.data);
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
    fetchProduct();
  }, []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchProduct = async (
    search,
    sort = JSON.stringify({ sell_count: "desc" }),
    page,
    minPrice,
    maxPrice,
    searchCtgs
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/search-product", {
        params: {
          search,
          sort,
          page,
          minPrice,
          maxPrice,
          searchCtgs,
        },
      });
      if (res.status === 200) {
        setProducts(res.data.product);
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
    debounceSearch(
      search,
      sort,
      page,
      minPrice,
      maxPrice,
      searchCtgs.join(",")
    );
  }, [search, sort, page, minPrice, maxPrice, searchCtgs]);

  const handleSelectCtg = (id) => {
    setSearchCtgs((prev) =>
      prev.find((p) => p === id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
  };

  const handleSearchByPrice = () => {
    // ไม่ให้ NaN
    if (isNaN(inputMinPrice) || isNaN(inputMaxPrice)) {
      return popup.err("กรุณากรอกราคาเป็นตัวเลข");
    }

    if (inputMinPrice < 0 || inputMaxPrice < 0) {
      return popup.err("ราคาต้องไม่ติดลบ");
    }

    if (inputMaxPrice > 0 && inputMinPrice > inputMaxPrice) {
      return popup.err("ราคาต่ำสุดต้องน้อยกว่าราคาสูงสุด");
    }

    setPage(1);
    setMinPrice(inputMinPrice || 0);
    setMaxPrice(inputMaxPrice || 0);
  };

  const resetSearch = () => {
    setMinPrice(0);
    setMaxPrice(0);
    setInputMaxPrice(0);
    setInputMinPrice(0);
    setSearchCtgs([]);
    setSort(JSON.stringify({ sell_count: "desc" }));
    setPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center pt-[150px] lg:pt-[180px] pb-16">
      <div className="w-full max-w-7xl px-4 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Filter Sidebar */}
        <aside
          className={`${
            showResponSiveMenu ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden lg:flex"
          } lg:relative lg:inset-auto lg:z-0 lg:bg-white w-full lg:w-64 shrink-0 flex flex-col gap-6 bg-white border border-slate-100 rounded-2xl shadow-xs p-5 self-start`}
        >
          {showResponSiveMenu && (
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-800">ตัวกรองสินค้า</span>
              <button
                onClick={() => setShowResponsiveMenu(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <FaTimes size={18} />
              </button>
            </div>
          )}

          {/* Filter Header */}
          <div className="hidden lg:flex items-center gap-2 pb-3.5 border-b border-neutral-100">
            <FaFilter className="text-[#fbc50e]" size={14} />
            <h3 className="font-bold text-sm text-neutral-900">ตัวกรองสินค้า</h3>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">หมวดหมู่สินค้า</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((c) => (
                <label key={uuid()} className="flex items-center gap-3 text-sm text-neutral-600 cursor-pointer hover:text-black select-none">
                  <input
                    type="checkbox"
                    checked={searchCtgs.includes(c?.id)}
                    onChange={() => handleSelectCtg(c?.id)}
                    className="w-4 h-4 rounded text-[#fbc50e] border-neutral-300 focus:ring-[#fbc50e]"
                  />
                  <span>{c?.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">ช่วงราคา (บาท)</h4>
            <div className="flex items-center gap-2">
              <input
                value={inputMinPrice === 0 ? "" : inputMinPrice}
                onChange={(e) => setInputMinPrice(Number(e.target.value))}
                className="w-full bg-neutral-50 text-xs p-2.5 rounded-lg border border-neutral-200 focus:border-[#fbc50e] focus:outline-none"
                placeholder="ต่ำสุด"
                type="number"
              />
              <span className="text-neutral-400">-</span>
              <input
                value={inputMaxPrice === 0 ? "" : inputMaxPrice}
                onChange={(e) => setInputMaxPrice(Number(e.target.value))}
                className="w-full bg-neutral-50 text-xs p-2.5 rounded-lg border border-neutral-200 focus:border-[#fbc50e] focus:outline-none"
                placeholder="สูงสุด"
                type="number"
              />
            </div>
            <button
              onClick={handleSearchByPrice}
              className="w-full py-2.5 bg-[#fbc50e] hover:bg-[#e0ac00] text-neutral-950 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              ค้นหาตามราคา
            </button>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-neutral-100 pt-5 mt-auto">
            <button
              onClick={resetSearch}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <FaTrash size={12} />
              <span>ล้างการค้นหา</span>
            </button>
          </div>
        </aside>

        {/* Right Products Panel */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Header Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowResponsiveMenu(true)}
              className="lg:hidden py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-xs transition-all"
            >
              <FaFilter size={11} />
              <span>ตัวกรองการค้นหา</span>
            </button>

            {/* Sorting control */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-neutral-500 font-medium shrink-0">เรียงตาม:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 py-2 pl-3.5 pr-9 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#fbc50e] cursor-pointer transition-all"
                >
                  <option value={JSON.stringify({ sell_count: "desc" })}>สินค้าขายดี / ยอดนิยม</option>
                  <option value={JSON.stringify({ createdAt: "desc" })}>สินค้าใหม่ล่าสุด</option>
                  <option value={JSON.stringify({ pro_price: "asc" })}>ราคา: ต่ำไปสูง</option>
                  <option value={JSON.stringify({ pro_price: "desc" })}>ราคา: สูงไปต่ำ</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                  <FaList size={10} />
                </div>
              </div>
            </div>

            {/* Pagination header */}
            <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
              <span className="text-xs text-neutral-500">
                หน้า <span className="font-bold text-neutral-900">{page}</span> จาก <span className="font-bold text-neutral-900">{totalPage}</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={prevPage}
                  disabled={page <= 1}
                  className="p-2 border border-neutral-200 hover:bg-[#fef9c3] disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-neutral-700 transition-all cursor-pointer"
                >
                  <FaArrowLeft size={10} />
                </button>
                <button
                  onClick={forwardPage}
                  disabled={page >= totalPage}
                  className="p-2 border border-neutral-200 hover:bg-[#fef9c3] disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-neutral-700 transition-all cursor-pointer"
                >
                  <FaArrowRight size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Search query feedback */}
          {search && (
            <div className="text-sm text-slate-500 px-1">
              ผลการค้นหาสำหรับ <span className="font-bold text-slate-800">"{search}"</span> ({total} รายการ)
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-xs min-h-[300px] gap-3">
              <Loader />
              <p className="text-xs text-slate-500 font-medium">กำลังค้นหาสินค้า...</p>
            </div>
          ) : products?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard key={uuid()} {...p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-xs min-h-[300px] gap-2 text-slate-400">
              <FaShoppingBag size={48} />
              <p className="text-sm font-semibold text-slate-500 mt-2">ไม่พบสินค้าตามเงื่อนไขที่ระบุ</p>
              <p className="text-xs text-slate-400">กรุณาลองเปลี่ยนคำค้นหาหรือตั้งค่าตัวกรองใหม่</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
export default Search;
