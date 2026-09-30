"use client";

import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { generateSecurePassword } from "@/libs/password";
import axios from "axios";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaCheck, FaEye, FaEyeSlash, FaKey, FaLock, FaShieldAlt, FaTimes } from "react-icons/fa";

export { generateSecurePassword };

const Page = () => {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    defaultValues: {
      current_pass: "",
      new_pass: "",
      confirm_pass: "",
    },
  });

  const handleSaveData = async (data) => {
    setSaving(true);
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
        await popup.success("บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว");
        location.href = "/";
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const newPassValue = watch("new_pass") || "";
  const isLengthValid = newPassValue.length >= 8;
  const isAlphaValid = /[A-Za-z]/.test(newPassValue);
  const isSpecialValid = /[^A-Za-z0-9]/.test(newPassValue);
  const isDigitValid = /\d/.test(newPassValue);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 w-full border-b border-neutral-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#fbc50e] rounded-full" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              ความปลอดภัยและรหัสผ่าน
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-4">
            ตั้งค่ารหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าใช้งานบัญชีของคุณ
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit(handleSaveData)}
        className="w-full max-w-2xl flex flex-col gap-5 sm:gap-6 bg-white p-5 sm:p-7 rounded-2xl border border-neutral-200/90 shadow-2xs"
      >
        {/* Current Password Field */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
          <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-44 shrink-0 sm:pt-2.5">
            รหัสผ่านปัจจุบัน <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex flex-col flex-1 w-full gap-1">
            <div className="relative w-full">
              <Controller
                name="current_pass"
                rules={{ required: "กรุณากรอกรหัสผ่านปัจจุบัน" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type={showCurrentPass ? "text" : "password"}
                    className="w-full text-xs sm:text-sm p-3 pr-10 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                title={showCurrentPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showCurrentPass ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
            {errors.current_pass && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.current_pass.message}
              </p>
            )}
          </div>
        </div>

        {/* New Password Field */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
          <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-44 shrink-0 sm:pt-2.5">
            ตั้งรหัสผ่านใหม่ <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex flex-col flex-1 w-full gap-1">
            <div className="relative w-full">
              <Controller
                name="new_pass"
                rules={{
                  required: "กรุณาตั้งรหัสผ่านใหม่",
                  validate: (value) => {
                    if (value.length < 8) return "ความยาวต้องมากกว่า 8 ตัวอักษร";
                    if (!/[a-zA-Z]/.test(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
                    if (!/[0-9]/.test(value)) return "ต้องมีตัวเลข";
                    if (!/[^a-zA-Z0-9]/.test(value)) return "ต้องมีอักขระพิเศษ";
                    if (
                      watch("confirm_pass")?.length > 0 &&
                      value !== watch("confirm_pass")
                    )
                      return "รหัสผ่านไม่ตรงกัน";
                  },
                }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type={showNewPass ? "text" : "password"}
                    className="w-full text-xs sm:text-sm p-3 pr-10 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="ตั้งรหัสผ่านใหม่"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                title={showNewPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showNewPass ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
            {errors.new_pass && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.new_pass.message}
              </p>
            )}
          </div>
        </div>

        {/* Security Checklist & Generator */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
          <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-44 shrink-0 sm:pt-1">
            เงื่อนไขความปลอดภัย
          </label>
          <div className="flex flex-col gap-2.5 flex-1 w-full">
            <div className="flex flex-col gap-2 p-3.5 sm:p-4 border border-neutral-200 rounded-xl bg-neutral-50/80 w-full text-xs">
              <div className="flex items-center gap-2">
                {isLengthValid ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                    <FaTimes size={9} />
                  </span>
                )}
                <span className={isLengthValid ? "text-emerald-700 font-medium" : "text-neutral-500"}>
                  รหัสผ่านยาวอย่างน้อย 8 ตัวอักษร
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isAlphaValid ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                    <FaTimes size={9} />
                  </span>
                )}
                <span className={isAlphaValid ? "text-emerald-700 font-medium" : "text-neutral-500"}>
                  มีตัวอักษรภาษาอังกฤษ (A-Z, a-z)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isDigitValid ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                    <FaTimes size={9} />
                  </span>
                )}
                <span className={isDigitValid ? "text-emerald-700 font-medium" : "text-neutral-500"}>
                  มีตัวเลขอย่างน้อย 1 ตัว (0-9)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isSpecialValid ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
                    <FaTimes size={9} />
                  </span>
                )}
                <span className={isSpecialValid ? "text-emerald-700 font-medium" : "text-neutral-500"}>
                  มีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setValue("new_pass", generateSecurePassword())}
              className="w-full sm:w-auto p-2.5 px-4 justify-center border border-neutral-300 hover:border-neutral-800 bg-white text-neutral-800 hover:bg-neutral-50 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-2xs transition-colors self-start"
            >
              <FaKey className="text-[#b48300]" size={12} />
              <span>สุ่มสร้างรหัสผ่านที่ปลอดภัยอัตโนมัติ</span>
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
          <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-44 shrink-0 sm:pt-2.5">
            ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex flex-col flex-1 w-full gap-1">
            <div className="relative w-full">
              <Controller
                name="confirm_pass"
                rules={{
                  required: "กรุณายืนยันรหัสผ่านใหม่อีกครั้ง",
                  validate: (value) => {
                    if (value !== watch("new_pass")) return "รหัสผ่านไม่ตรงกัน";
                  },
                }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type={showConfirmNew ? "text" : "password"}
                    className="w-full text-xs sm:text-sm p-3 pr-10 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNew(!showConfirmNew)}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                title={showConfirmNew ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showConfirmNew ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
            {errors.confirm_pass && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.confirm_pass.message}
              </p>
            )}
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
          * หมายเหตุ: หลังจากเปลี่ยนรหัสผ่านสำเร็จ ระบบจะทำการออกจากระบบโดยอัตโนมัติเพื่อความปลอดภัย
        </div>

        {/* Submit Button */}
        <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-bold hover:bg-[#eab308] text-neutral-950 rounded-xl flex items-center justify-center gap-2 bg-[#fbc50e] shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader />
                <span>กำลังบันทึกรหัสผ่าน...</span>
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
  );
};

export default Page;
