"use client";

import Loader from "@/components/loader";
import { Select } from "@/components/react-select";
import { NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import { popup } from "@/libs/alert-popup";
import { days, months, years } from "@/libs/bithdate-options";
import { isValidEmail, isValidThaiPhone } from "@/libs/validate-input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaCalendarAlt,
  FaCamera,
  FaCheck,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaIdBadge,
  FaKey,
  FaLock,
  FaPhone,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaUser,
  FaUserCircle,
  FaUserShield,
} from "react-icons/fa";

export function generateSecurePassword() {
  const length = 12;
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+[]{}|;:,.<>?";
  const allChars = letters + numbers + specials;

  let password = "";
  password += letters[Math.floor(Math.random() * letters.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specials[Math.floor(Math.random() * specials.length)];

  for (let i = 3; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

const prefixOptions = [
  { label: "นาย", value: "นาย" },
  { label: "นาง", value: "นาง" },
  { label: "นางสาว", value: "นางสาว" },
];

const genderOptions = [
  { label: "ชาย", value: "ชาย" },
  { label: "หญิง", value: "หญิง" },
];

const AdminAccountPage = () => {
  const { user: sessionUser, checking } = useGetSeesion();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security'
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Profile Form State
  const {
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
    watch: watchProfile,
    control: profileControl,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      tel: "",
    },
  });

  const [dateBirth, setDateBirth] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [prefix, setPrefix] = useState("นาย");
  const [gender, setGender] = useState("ชาย");
  const [profileImage, setProfileImage] = useState(NO_PROFILE);
  const [originalProfileImage, setOriginalProfileImage] = useState(NO_PROFILE);
  const [imageFile, setImageFile] = useState(null);

  // Password Form State
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const {
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    setValue: setPasswordValue,
    watch: watchPassword,
    control: passwordControl,
    reset: resetPasswordForm,
  } = useForm({
    defaultValues: {
      current_pass: "",
      new_pass: "",
      confirm_pass: "",
    },
  });

  // Fetch admin profile
  const fetchProfileData = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-info", {
        withCredentials: true,
      });

      if (res.status === 200 && res.data) {
        const data = res.data;
        setPrefix(data.title_type || "นาย");
        setGender(data.gender || "ชาย");

        if (data.birth_date && data.birth_date.includes("/")) {
          const parts = data.birth_date.split("/");
          setDateBirth(Number(parts[0]) || "");
          setBirthMonth(parts[1] || "");
          setBirthYear(Number(parts[2]) || "");
        } else {
          setDateBirth("");
          setBirthMonth("");
          setBirthYear("");
        }

        const imgPath = data.profile
          ? envConfig.imgURL + data.profile
          : NO_PROFILE;
        setProfileImage(imgPath);
        setOriginalProfileImage(imgPath);
        setImageFile(null);

        resetProfileForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          tel: data.tel || "",
        });
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      popup.err("ไม่สามารถโหลดข้อมูลโปรไฟล์ผู้ดูแลได้");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle avatar upload preview
  const handleSelectAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return popup.err("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB");
    }

    if (!file.type.startsWith("image/")) {
      return popup.err("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    }

    setImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  // Save Profile Handler
  const onSaveProfile = async (formData) => {
    if (formData.email && !isValidEmail(formData.email)) {
      return popup.err("รูปแบบอีเมลไม่ถูกต้อง");
    }
    if (formData.tel && !isValidThaiPhone(formData.tel)) {
      return popup.err("รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง (เช่น 0812345678)");
    }

    setProfileSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("first_name", formData.first_name.trim());
      formPayload.append("last_name", formData.last_name.trim());
      formPayload.append("email", formData.email?.trim() || "");
      formPayload.append("tel", formData.tel?.trim() || "");
      formPayload.append("title_type", prefix || "นาย");
      formPayload.append("gender", gender || "ชาย");

      if (dateBirth && birthMonth && birthYear) {
        formPayload.append("birth_date", `${dateBirth}/${birthMonth}/${birthYear}`);
      } else {
        formPayload.append("birth_date", "//");
      }

      if (imageFile) {
        formPayload.append("profile", imageFile);
        formPayload.append("changeprofile", "true");
      }

      const res = await axios.post(
        envConfig.apiURL + "/user/update-info",
        formPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        await popup.success("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว");
        await fetchProfileData();
        // Trigger browser reload after a short delay so layout header reflects updated admin name/avatar
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating admin profile:", error);
      popup.err(error?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setProfileSaving(false);
    }
  };

  // Save Password Handler
  const onSavePassword = async (data) => {
    setPasswordSaving(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/user/change-pass",
        data,
        { withCredentials: true }
      );

      if (res.data?.err) {
        return popup.err(res.data.err);
      }

      if (res.status === 200) {
        await popup.success("บันทึกรหัสผ่านใหม่แล้ว ระบบจะนำคุณออกจากระบบ");
        location.href = "/";
      }
    } catch (error) {
      console.error("Error changing password:", error);
      popup.err(error?.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
            <h1 className="text-2xl font-bold text-neutral-900">
              บัญชีและข้อมูลผู้ดูแลระบบ
            </h1>
          </div>
          <p className="text-sm text-neutral-500 pl-5">
            จัดการข้อมูลโปรไฟล์ส่วนตัว และการตั้งค่ารหัสผ่านความปลอดภัยของผู้ดูแล
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100/90 rounded-2xl border border-neutral-200/70 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
            }`}
          >
            <FaUserCircle
              className={activeTab === "profile" ? "text-amber-500" : "text-neutral-400"}
              size={15}
            />
            <span>ข้อมูลโปรไฟล์</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "security"
                ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
            }`}
          >
            <FaShieldAlt
              className={activeTab === "security" ? "text-amber-500" : "text-neutral-400"}
              size={14}
            />
            <span>ความปลอดภัยและรหัสผ่าน</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROFILE MANAGEMENT */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Admin Identity Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 flex flex-col items-center text-center gap-5">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full ring-4 ring-amber-400/30 border-2 border-[#fbc50e] overflow-hidden bg-neutral-100 flex items-center justify-center shadow-inner">
                <SafeImage
                  src={profileImage}
                  type="avatar"
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Camera Overlay Icon */}
              <label
                htmlFor="admin-avatar-input"
                className="absolute inset-0 rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-2xs"
                title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
              >
                <FaCamera size={22} />
                <span className="text-[11px] font-medium mt-1">อัปโหลดรูป</span>
              </label>

              <input
                type="file"
                id="admin-avatar-input"
                accept="image/*"
                onChange={handleSelectAvatar}
                className="hidden"
              />
            </div>

            <div className="flex flex-col items-center gap-1.5 w-full">
              <label
                htmlFor="admin-avatar-input"
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-300/80 cursor-pointer transition-colors shadow-2xs"
              >
                เลือกรูปภาพใหม่
              </label>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 2MB
              </p>
            </div>

            <div className="w-full border-t border-neutral-100 pt-4 flex flex-col gap-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">บทบาทระบบ</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                  <FaUserShield size={11} className="text-amber-600" />
                  <span>ผู้ดูแลระบบ (Admin)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">สถานะบัญชี</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>เปิดใช้งานปกติ</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">ชื่อผู้ดูแล</span>
                <span className="text-xs font-bold text-neutral-800">
                  {prefix} {watchProfile("first_name") || "–"} {watchProfile("last_name") || ""}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">อีเมลติดต่อ</span>
                <span className="text-xs font-medium text-neutral-700 truncate max-w-[170px]">
                  {watchProfile("email") || "ยังไม่ระบุ"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">เบอร์โทรศัพท์</span>
                <span className="text-xs font-medium text-neutral-700">
                  {watchProfile("tel") || "ยังไม่ระบุ"}
                </span>
              </div>
            </div>

            {/* Quick security notice card */}
            <div className="w-full p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-left flex items-start gap-2.5 mt-1">
              <FaShieldAlt className="text-amber-600 shrink-0 mt-0.5" size={13} />
              <p className="text-[11px] text-amber-900 leading-relaxed">
                การแก้ไขข้อมูลโปรไฟล์มีผลทันทีต่อระบบหลังบ้าน และบันทึกประวัติการดำเนินการของผู้ดูแล
              </p>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-[#fbc50e] rounded-full" />
                <h2 className="text-base font-bold text-neutral-900">
                  แก้ไขข้อมูลส่วนตัว
                </h2>
              </div>
              <button
                type="button"
                onClick={fetchProfileData}
                disabled={profileLoading}
                className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                title="โหลดข้อมูลล่าสุด"
              >
                <FaSyncAlt size={11} className={profileLoading ? "animate-spin" : ""} />
                <span>รีเฟรชข้อมูล</span>
              </button>
            </div>

            {profileLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader />
                <span className="text-xs">กำลังโหลดข้อมูลโปรไฟล์...</span>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit(onSaveProfile)} className="flex flex-col gap-5">
                {/* Prefix and Gender Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prefix */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      คำนำหน้าชื่อ <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      options={prefixOptions}
                      value={prefixOptions.find((p) => p.value === prefix || p.label === prefix) || prefixOptions[0]}
                      onChange={(opt) => setPrefix(opt.value)}
                      placeholder="เลือกคำนำหน้า"
                      className="text-xs font-medium"
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      เพศ <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      options={genderOptions}
                      value={genderOptions.find((g) => g.value === gender || g.label === gender) || genderOptions[0]}
                      onChange={(opt) => setGender(opt.value)}
                      placeholder="เลือกเพศ"
                      className="text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                      <FaUser size={11} className="text-neutral-400" />
                      <span>ชื่อจริง <span className="text-rose-500">*</span></span>
                    </label>
                    <Controller
                      name="first_name"
                      rules={{ required: "กรุณาระบุชื่อจริง" }}
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ""}
                          type="text"
                          className="w-full text-xs font-medium p-2.5 px-3.5 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                          placeholder="ชื่อจริงของผู้ดูแล"
                        />
                      )}
                    />
                    {profileErrors.first_name && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {profileErrors.first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                      <FaUser size={11} className="text-neutral-400" />
                      <span>นามสกุล <span className="text-rose-500">*</span></span>
                    </label>
                    <Controller
                      name="last_name"
                      rules={{ required: "กรุณาระบุนามสกุล" }}
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ""}
                          type="text"
                          className="w-full text-xs font-medium p-2.5 px-3.5 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                          placeholder="นามสกุลของผู้ดูแล"
                        />
                      )}
                    />
                    {profileErrors.last_name && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {profileErrors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                      <FaEnvelope size={11} className="text-neutral-400" />
                      <span>อีเมล <span className="text-rose-500">*</span></span>
                    </label>
                    <Controller
                      name="email"
                      rules={{ required: "กรุณาระบุอีเมล" }}
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ""}
                          type="email"
                          className="w-full text-xs font-medium p-2.5 px-3.5 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                          placeholder="admin@furniture.com"
                        />
                      )}
                    />
                    {profileErrors.email && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                      <FaPhone size={11} className="text-neutral-400" />
                      <span>เบอร์โทรศัพท์ <span className="text-rose-500">*</span></span>
                    </label>
                    <Controller
                      name="tel"
                      rules={{ required: "กรุณาระบุเบอร์โทรศัพท์" }}
                      control={profileControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ""}
                          type="tel"
                          className="w-full text-xs font-medium p-2.5 px-3.5 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                          placeholder="0812345678"
                        />
                      )}
                    />
                    {profileErrors.tel && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {profileErrors.tel.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Birth Date Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                    <FaCalendarAlt size={11} className="text-neutral-400" />
                    <span>วัน / เดือน / ปีเกิด</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      options={days}
                      value={days.find((d) => d.value === dateBirth) || null}
                      onChange={(opt) => setDateBirth(opt?.value || "")}
                      placeholder="วัน"
                      className="text-xs"
                      isClearable
                    />
                    <Select
                      options={months}
                      value={months.find((m) => m.label === birthMonth) || null}
                      onChange={(opt) => setBirthMonth(opt?.label || "")}
                      placeholder="เดือน"
                      className="text-xs"
                      isClearable
                    />
                    <Select
                      options={years}
                      value={years.find((y) => y.value === birthYear) || null}
                      onChange={(opt) => setBirthYear(opt?.value || "")}
                      placeholder="ปี"
                      className="text-xs"
                      isClearable
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    ข้อมูลวันเกิดใช้สำหรับคำนวณอายุและสิทธิประโยชน์ภายในระบบ
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={fetchProfileData}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    คืนค่าเดิม
                  </button>

                  <button
                    type="submit"
                    disabled={profileSaving || checking}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <>
                        <Loader />
                        <span>กำลังบันทึกข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck size={13} />
                        <span>บันทึกการแก้ไขโปรไฟล์</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <div className="w-full bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <span className="w-2 h-5 bg-[#fbc50e] rounded-full" />
            <h2 className="text-base font-bold text-neutral-900">
              เปลี่ยนรหัสผ่านผู้ดูแลระบบ
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit(onSavePassword)} className="flex flex-col gap-6">
            {/* Current Password */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <label className="text-xs font-bold text-neutral-700 md:w-[200px] md:pt-2.5">
                รหัสผ่านปัจจุบัน <span className="text-rose-500">*</span>
              </label>
              <div className="flex-1 flex flex-col gap-1">
                <div className="relative">
                  <Controller
                    name="current_pass"
                    rules={{ required: "กรุณากรอกรหัสผ่านปัจจุบัน" }}
                    control={passwordControl}
                    render={({ field }) => (
                      <input
                        value={field.value || ""}
                        {...field}
                        type={showCurrentPass ? "text" : "password"}
                        className="w-full text-xs font-medium p-3 pr-10 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                        placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                  >
                    {showCurrentPass ? <FaEye size={15} /> : <FaEyeSlash size={15} />}
                  </button>
                </div>
                {passwordErrors.current_pass && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {passwordErrors.current_pass.message}
                  </p>
                )}
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <label className="text-xs font-bold text-neutral-700 md:w-[200px] md:pt-2.5">
                รหัสผ่านใหม่ <span className="text-rose-500">*</span>
              </label>
              <div className="flex-1 flex flex-col gap-1">
                <div className="relative">
                  <Controller
                    name="new_pass"
                    rules={{
                      required: "กรุณาตั้งรหัสผ่านใหม่",
                      validate: (value) => {
                        if (value.length < 8) return "ความยาวต้องมากกว่าหรือเท่ากับ 8 ตัวอักษร";
                        if (!/[a-zA-Z]/.test(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
                        if (!/[0-9]/.test(value)) return "ต้องมีตัวเลข";
                        if (!/[^a-zA-Z0-9]/.test(value)) return "ต้องมีอักขระพิเศษ";
                        if (
                          watchPassword("confirm_pass")?.length > 0 &&
                          value !== watchPassword("confirm_pass")
                        )
                          return "รหัสผ่านไม่ตรงกัน";
                      },
                    }}
                    control={passwordControl}
                    render={({ field }) => (
                      <input
                        value={field.value || ""}
                        {...field}
                        type={showNewPass ? "text" : "password"}
                        className="w-full text-xs font-medium p-3 pr-10 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                        placeholder="ตั้งรหัสผ่านใหม่"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                  >
                    {showNewPass ? <FaEye size={15} /> : <FaEyeSlash size={15} />}
                  </button>
                </div>
                {passwordErrors.new_pass && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {passwordErrors.new_pass.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Requirements Checklist & Generator */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <label className="text-xs font-bold text-neutral-700 md:w-[200px] md:pt-1">
                เงื่อนไขความปลอดภัย
              </label>
              <div className="flex-1 flex flex-col gap-3">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {watchPassword("new_pass")?.length >= 8 ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaCheck size={9} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                        <FaTimes size={9} />
                      </span>
                    )}
                    <span
                      className={`text-xs ${
                        watchPassword("new_pass")?.length >= 8
                          ? "text-emerald-700 font-medium"
                          : "text-neutral-500"
                      }`}
                    >
                      รหัสผ่านยาวอย่างน้อย 8 ตัวอักษร
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/[A-Za-z]/.test(watchPassword("new_pass") || "") ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaCheck size={9} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                        <FaTimes size={9} />
                      </span>
                    )}
                    <span
                      className={`text-xs ${
                        /[A-Za-z]/.test(watchPassword("new_pass") || "")
                          ? "text-emerald-700 font-medium"
                          : "text-neutral-500"
                      }`}
                    >
                      ประกอบด้วยตัวอักษรภาษาอังกฤษ (A-Z, a-z)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/\d/.test(watchPassword("new_pass") || "") ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaCheck size={9} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                        <FaTimes size={9} />
                      </span>
                    )}
                    <span
                      className={`text-xs ${
                        /\d/.test(watchPassword("new_pass") || "")
                          ? "text-emerald-700 font-medium"
                          : "text-neutral-500"
                      }`}
                    >
                      ประกอบด้วยตัวเลขอย่างน้อย 1 ตัว
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/[^A-Za-z0-9]/.test(watchPassword("new_pass") || "") ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaCheck size={9} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                        <FaTimes size={9} />
                      </span>
                    )}
                    <span
                      className={`text-xs ${
                        /[^A-Za-z0-9]/.test(watchPassword("new_pass") || "")
                          ? "text-emerald-700 font-medium"
                          : "text-neutral-500"
                      }`}
                    >
                      ประกอบด้วยอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPasswordValue("new_pass", generateSecurePassword())}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-200/80 self-start"
                >
                  <FaKey size={12} className="text-amber-600" />
                  <span>สร้างรหัสผ่านปลอดภัยอัตโนมัติ</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <label className="text-xs font-bold text-neutral-700 md:w-[200px] md:pt-2.5">
                ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span>
              </label>
              <div className="flex-1 flex flex-col gap-1">
                <div className="relative">
                  <Controller
                    name="confirm_pass"
                    rules={{
                      required: "กรุณายืนยันรหัสผ่านใหม่อีกครั้ง",
                      validate: (value) => {
                        if (value !== watchPassword("new_pass"))
                          return "รหัสผ่านไม่ตรงกัน";
                      },
                    }}
                    control={passwordControl}
                    render={({ field }) => (
                      <input
                        value={field.value || ""}
                        {...field}
                        type={showConfirmNew ? "text" : "password"}
                        className="w-full text-xs font-medium p-3 pr-10 text-neutral-800 bg-neutral-50/70 border border-neutral-300/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 transition-all placeholder:text-neutral-400"
                        placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNew(!showConfirmNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                  >
                    {showConfirmNew ? <FaEye size={15} /> : <FaEyeSlash size={15} />}
                  </button>
                </div>
                {passwordErrors.confirm_pass && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {passwordErrors.confirm_pass.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notice & Submit */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                <span>* หมายเหตุ: เพื่อความปลอดภัย ระบบจะทำการออกจากระบบโดยอัตโนมัติเมื่อเปลี่ยนรหัสผ่านสำเร็จ</span>
              </p>
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2.5 bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <Loader />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <FaCheck size={13} />
                    <span>บันทึกรหัสผ่านใหม่</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAccountPage;
