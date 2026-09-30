"use client";
import { useEffect, useMemo, useState } from "react";
import { FiFolderMinus } from "react-icons/fi";
import Switch from "react-switch";
import {
  FaCamera,
  FaCaretUp,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHourglassHalf,
  FaIdCard,
  FaLock,
  FaPlus,
  FaReceipt,
  FaRegListAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaTruck,
  FaTruckMoving,
  FaUser,
  FaUserCheck,
  FaUsers,
  FaUsersSlash,
} from "react-icons/fa";
import { MdInfoOutline } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/components/model";
import Link from "next/link";
import { isValidEmail } from "@/libs/validate-input";
import Loader from "@/components/loader";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import { NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";
import { generateSecurePassword } from "@/libs/password";
import Loading from "@/layout/loading";
import { debounce } from "lodash";
import ExportMemberBtn from "@/components/export-member-btn";

const Members = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");
  const [take, setTake] = useState(15);
  const [searchStatus, setSearchStatus] = useState("all");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState(0);

  const [fetching, setFetching] = useState(false);
  const [membersAvg, setMembersAvg] = useState(null);
  const fetchAvg = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/members/avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setMembersAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvg();
  }, []);

  const [members, setMembers] = useState([]);
  const getMembers = async (page, take, search, searchStatus, sort) => {
    setFetching(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/members", {
        withCredentials: true,
        params: {
          page,
          take,
          search,
          searchStatus,
          sort,
        },
      });

      if (res.status === 200) {
        setMembers(res.data.members);
        setTotal(res?.data?.total);
        setTotalPage(res?.data?.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setFetching(false);
    }
  };

  const debounceSearch = useMemo(() => debounce(getMembers, 700), [getMembers]);

  useEffect(() => {
    debounceSearch(page, take, search, searchStatus, sort);
  }, [page, take, search, searchStatus, sort]);

  const resetAllSearch = () => {
    setPage(1);
    setSort(JSON.stringify({ createdAt: "desc" }));
    setSearchStatus("all");
    setTake(15);
    setSearch("");
  };

  const handleAllowedMember = async (id, isAllowed) => {
    const { isConfirmed } = await popup.confirmPopUp(
      isAllowed ? "ระงับการใช้งานบัญชี" : "เปิดใช้งานบัญชี",
      isAllowed
        ? "ต้องการระงับการใช้งานบัญชีนี้หรือไม่?"
        : "ต้องการเปิดใช้งานบัญชีนี้หรือไม่?",
      isAllowed ? "ระงับ" : "เปิด"
    );
    if (!isConfirmed) return;

    setFetching(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/admin/toggle-member",
        { id, isAllowed },
        { withCredentials: true }
      );
      if (res.status === 200) {
        if (isAllowed) {
          popup.warning(
            "ระงับบัญชีแล้ว\nระบบได้ส่งข้อความถึงผู้ใช้งานแล้ว",
            "แจ้งเตือน"
          );
        } else {
          popup.success(
            "เปิดใช้งานบัญชีแล้ว\nระบบได้ส่งข้อความถึงผู้ใช้งานแล้ว"
          );
        }
        fetchAvg();
        getMembers(page, take, search, searchStatus, sort);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setFetching(false);
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

  const [creating, setCreating] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const handleSelectProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return popup.err("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB");
    }
    if (!file.type.startsWith("image/")) {
      return popup.err("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    }
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileFile(null);
  };

  const [editMember, setEditMember] = useState(null);

  const handleEditMember = (m) => {
    setEditMember(m);
    reset({
      email: m.email || "",
      first_name: m.first_name || "",
      last_name: m.last_name || "",
      tel: m.tel || "",
      password: "",
    });
    const prefixMap = { "นาย": 1, "นาง": 2, "นางสาว": 3 };
    setPrefix(prefixMap[m.title_type] || 0);
    setProfileFile(null);
    setProfileImage(m.profile ? envConfig.imgURL + m.profile : null);
    setShowModal(true);
  };

  const handleDeleteMember = async (m) => {
    const fullName = `${m?.title_type || ""}${m?.first_name || ""} ${m?.last_name || ""}`.trim();
    const { isConfirmed } = await popup.confirmDanger(
      "ยืนยันการลบสมาชิก",
      `คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${fullName}"? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบออกจากระบบ`,
      "ยืนยันการลบ",
      "ยกเลิก"
    );
    if (!isConfirmed) return;

    setFetching(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-member/${m?.user_id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success("ลบข้อมูลสมาชิกเรียบร้อยแล้ว");
        fetchAvg();
        getMembers(page, take, search, searchStatus, sort);
      }
    } catch (error) {
      console.error(error);
      popup.err(error?.response?.data?.err || "เกิดข้อผิดพลาดในการลบสมาชิก");
    } finally {
      setFetching(false);
    }
  };

  const handleSaveMember = async (data) => {
    if (prefix === 0) {
      return popup.err("กรุณาเลือกคำนำหน้า");
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email.trim());
      formData.append("first_name", data.first_name.trim());
      formData.append("last_name", data.last_name.trim());
      formData.append("title_type", prefix === 1 ? "นาย" : prefix === 2 ? "นาง" : "นางสาว");
      if (data.tel) {
        formData.append("tel", data.tel.trim());
      }
      if (profileFile) {
        formData.append("profile", profileFile);
      } else if (!profileImage && editMember?.profile) {
        formData.append("removeProfile", "true");
      }

      if (editMember) {
        if (data.password && data.password.trim()) {
          formData.append("password", data.password.trim());
        }
        const res = await axios.post(
          envConfig.apiURL + `/admin/update-member/${editMember.user_id}`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (res.data?.err) {
          return popup.err(res.data.err);
        }
        if (res.status === 200) {
          popup.success("แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว");
          setShowModal(false);
          setEditMember(null);
          reset();
          setPrefix(0);
          handleRemoveProfileImage();
          getMembers(page, take, search, searchStatus, sort);
        }
      } else {
        formData.append("password", generateSecurePassword());
        const res = await axios.post(
          envConfig.apiURL + "/admin/create-member",
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (res.data?.err) {
          return popup.err(res.data.err);
        }
        if (res.status === 200) {
          popup.success("สมาชิกจะได้รับรหัสผ่านทางอีเมล");
          setShowModal(false);
          reset();
          setPrefix(0);
          handleRemoveProfileImage();
          fetchAvg();
          getMembers(page, take, search, searchStatus, sort);
        }
      }
    } catch (error) {
      console.error(error);
      popup.err(error?.response?.data?.err || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setCreating(false);
    }
  };

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      tel: "",
      password: "",
    },
  });

  if (loading) return <Loading />;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">จัดการสมาชิก</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-5">
            จัดการข้อมูลสมาชิก Joy Card Furniture Marketplace ควบคุมสิทธิ์การใช้งานบัญชี และลงทะเบียนลูกค้าใหม่
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <ExportMemberBtn
            search={search}
            searchStatus={searchStatus}
            fallbackMembers={members}
          />
          <button
            onClick={() => {
              setEditMember(null);
              setShowModal(true);
              reset({
                email: "",
                first_name: "",
                last_name: "",
                tel: "",
                password: "",
              });
              setPrefix(0);
              handleRemoveProfileImage();
            }}
            className="px-5 py-2.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FaPlus size={13} />
            <span>เพิ่มสมาชิกใหม่</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit border border-indigo-200/60">
              สมาชิกทั้งหมด
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {membersAvg?.allMembers?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <FaUsers size={20} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit border border-emerald-200/60">
              เปิดใช้งานปกติ
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {membersAvg?.allAllowed?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FaUserCheck size={20} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full w-fit border border-rose-200/60">
              ระงับใช้งานชั่วคราว
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {membersAvg?.allUnAllowed?.toLocaleString() || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <FaUsersSlash size={20} />
          </div>
        </div>
      </div>

      {/* Main Table & Filter Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col gap-5">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="ค้นหาชื่อสมาชิก นามสกุล อีเมล..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all text-slate-800"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Select */}
            <div className="relative">
              <select
                onChange={(e) => {
                  setSearchStatus(e.target.value);
                  setPage(1);
                }}
                value={searchStatus}
                className="appearance-none text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="true">สถานะ: ใช้งาน</option>
                <option value="false">สถานะ: ระงับชั่วคราว</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                value={sort}
                className="appearance-none text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
              >
                <option value={JSON.stringify({ createdAt: "desc" })}>เรียง: สมัครล่าสุด</option>
                <option value={JSON.stringify({ bill_orders: { _count: "desc" } })}>เรียง: ซื้อบ่อยที่สุด</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
            </div>

            {/* Take Rows Select */}
            <div className="relative">
              <select
                onChange={(e) => {
                  setTake(e.target.value);
                  setPage(1);
                }}
                value={take}
                className="appearance-none text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 cursor-pointer focus:outline-none focus:border-[#fbc50e]"
              >
                <option value={15}>แสดง 15 แถว</option>
                <option value={25}>แสดง 25 แถว</option>
                <option value={50}>แสดง 50 แถว</option>
                <option value={100}>แสดง 100 แถว</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetAllSearch}
              className="p-2.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              title="ล้างตัวกรอง"
            >
              <FaTrash size={12} />
              <span className="hidden sm:inline">ล้าง</span>
            </button>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-40 transition-colors"
              >
                <FaChevronLeft size={11} />
              </button>
              <span className="text-xs font-medium text-slate-600">
                {page} / {totalPage}
              </span>
              <button
                onClick={forwardPage}
                disabled={page >= totalPage}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-40 transition-colors"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">สมาชิก</div>
              <div className="col-span-1 text-center">ออเดอร์</div>
              <div className="col-span-2 text-right">ยอดซื้อสะสม</div>
              <div className="col-span-2 text-center">สิทธิ์ใช้งาน</div>
              <div className="col-span-2 text-center">จัดการ</div>
            </div>

            <div className="flex flex-col min-h-[350px]">
              {fetching ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                  <div className="w-8 h-8 border-3 border-neutral-200 border-t-[#fbc50e] rounded-full animate-spin" />
                  <p className="text-xs">กำลังโหลดข้อมูลสมาชิก...</p>
                </div>
              ) : members?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {members.map((m, index) => (
                    <div
                      key={uuid()}
                      className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-slate-50/80 rounded-xl transition-colors text-sm text-slate-800"
                    >
                      <div className="col-span-1 text-center text-xs font-semibold text-slate-400">
                        {index + (page - 1) * take + 1}
                      </div>

                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full ring-2 ring-neutral-200/80 overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center">
                          <SafeImage
                            src={m?.profile ? envConfig.imgURL + m?.profile : null}
                            type="avatar"
                            alt={m?.first_name || "Member"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {m?.title_type}{m?.first_name} {m?.last_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>สมัคร: {new Date(m?.createdAt).toLocaleDateString("th-TH")}</span>
                            {m?.tel && <span>• โทร: {m.tel}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1 text-center font-semibold text-slate-700">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                          {m?._count?.bill_orders?.toLocaleString() || 0} ครั้ง
                        </span>
                      </div>

                      <div className="col-span-2 text-right font-bold text-slate-900">
                        ฿{Number(m?.total || 0).toLocaleString()}
                      </div>

                      <div className="col-span-2 flex items-center justify-center">
                        <Switch
                          onChange={() => handleAllowedMember(m?.user_id, m?.allowed)}
                          checked={m?.allowed}
                          onColor="#22c55e"
                          offColor="#cbd5e1"
                          handleDiameter={16}
                          height={22}
                          width={42}
                          uncheckedIcon={false}
                          checkedIcon={false}
                        />
                      </div>

                      {/* Actions Column (Far Right) */}
                      <div className="col-span-2 flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditMember(m)}
                          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="แก้ไขข้อมูลสมาชิก"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบสมาชิก"
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                  <FiFolderMinus size={40} className="text-slate-300" />
                  <p className="text-sm">ไม่พบข้อมูลสมาชิก</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration & Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMember(null);
          reset();
          handleRemoveProfileImage();
        }}
      >
        <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/90 shadow-2xl flex flex-col gap-5">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {editMember ? "แก้ไขข้อมูลสมาชิก" : "ลงทะเบียนสมาชิกใหม่"}
                </h2>
                <p className="text-xs text-neutral-500">
                  {editMember
                    ? `อัปเดตข้อมูลของ ${editMember?.first_name} ${editMember?.last_name}`
                    : "สร้างบัญชีผู้ใช้งานใหม่ในระบบ"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                setEditMember(null);
                reset();
                handleRemoveProfileImage();
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Profile Image Picker */}
            <div className="flex flex-col items-center justify-center gap-2 py-1">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full ring-3 ring-amber-400/30 border-2 border-[#fbc50e] overflow-hidden bg-neutral-100 flex items-center justify-center shadow-xs">
                  {profileImage ? (
                    <SafeImage
                      src={profileImage}
                      type="avatar"
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400">
                      <FaUser size={28} />
                    </div>
                  )}
                </div>

                {/* Camera overlay */}
                <label
                  htmlFor="member-avatar-upload"
                  className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-2xs"
                  title="คลิกเพื่อเลือกรูปโปรไฟล์"
                >
                  <FaCamera size={18} />
                </label>

                {/* Remove button */}
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveProfileImage}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs hover:bg-rose-600 transition-colors cursor-pointer"
                    title="ลบรูปภาพ"
                  >
                    <FaTimes size={10} />
                  </button>
                )}

                <input
                  id="member-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleSelectProfileImage}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="member-avatar-upload"
                  className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 px-3 py-1 rounded-lg border border-neutral-300/80 cursor-pointer transition-colors shadow-2xs"
                >
                  {profileImage ? "เปลี่ยนรูปโปรไฟล์" : "เพิ่มรูปโปรไฟล์"}
                </label>
                <span className="text-[10px] text-neutral-400">
                  (ไม่บังคับ - สูงสุด 2MB)
                </span>
              </div>
            </div>

            {/* Title Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">คำนำหน้า *</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 1, label: "นาย" },
                  { id: 2, label: "นาง" },
                  { id: 3, label: "นางสาว" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrefix(p.id)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      prefix === p.id
                        ? "bg-[#fbc50e] text-neutral-950 border-[#fbc50e] shadow-xs"
                        : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-700">ชื่อ *</label>
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: "กรุณากรอกชื่อ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="กรอกชื่อ"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-800 transition-all"
                    />
                  )}
                />
                {errors.first_name && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.first_name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-700">นามสกุล *</label>
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: "กรุณากรอกนามสกุล" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="กรอกนามสกุล"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-800 transition-all"
                    />
                  )}
                />
                {errors.last_name && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-neutral-700">อีเมลผู้ใช้งาน *</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "กรุณากรอกอีเมลผู้ใช้งาน",
                  validate: (val) => isValidEmail(val) || "รูปแบบอีเมลไม่ถูกต้อง",
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="example@mail.com"
                    className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-800 transition-all"
                  />
                )}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-neutral-700">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
              <Controller
                name="tel"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    placeholder="เช่น 0812345678"
                    className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-800 transition-all"
                  />
                )}
              />
            </div>

            {/* Password Field (Optional in edit mode) */}
            {editMember ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-700">เปลี่ยนรหัสผ่านใหม่ (ไม่บังคับ)</label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="password"
                      placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน"
                      className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 text-neutral-800 transition-all"
                    />
                  )}
                />
                <span className="text-[10px] text-neutral-400">กรอกอย่างน้อย 6 ตัวอักษรหากต้องการตั้งรหัสผ่านใหม่</span>
              </div>
            ) : (
              <p className="text-xs text-neutral-600 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 leading-relaxed">
                * ระบบจะทำการสุ่มรหัสผ่านที่ปลอดภัยและจัดส่งไปยังอีเมลของสมาชิกโดยอัตโนมัติ
              </p>
            )}

            <button
              disabled={creating}
              onClick={handleSubmit(handleSaveMember)}
              className="w-full py-3 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 mt-1 cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : editMember ? (
                <>
                  <FaCheck size={14} />
                  <span>บันทึกการแก้ไขข้อมูล</span>
                </>
              ) : (
                <>
                  <FaIdCard size={16} />
                  <span>ยืนยันการลงทะเบียน</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Members;
