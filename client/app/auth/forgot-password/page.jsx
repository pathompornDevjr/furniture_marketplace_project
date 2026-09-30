"use client";
import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

/* ── Password rule badge ── */
const PasswordRule = ({ passed, label }) => (
  <span className="flex items-center gap-2">
    <span
      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        passed ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-neutral-100 text-neutral-400"
      }`}
    >
      {passed ? <FaCheck size={7} /> : <FaTimes size={7} />}
    </span>
    <p className={`text-[11px] transition-colors duration-300 ${passed ? "text-emerald-700 font-medium" : "text-neutral-500"}`}>
      {label}
    </p>
  </span>
);

/* ── Step indicator ── */
const steps = [
  { label: "ยืนยันตัวตน", icon: FaUser },
  { label: "รหัส OTP", icon: FaShieldAlt },
  { label: "รหัสใหม่", icon: FaKey },
];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-6 w-full">
    {steps.map((step, idx) => {
      const Icon = step.icon;
      const done = idx < current;
      const active = idx === current;
      return (
        <div key={idx} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done
                  ? "bg-[#111111] border-[#111111] text-[#fbc50e]"
                  : active
                  ? "bg-[#fef9c3] border-[#fbc50e] text-neutral-900 font-bold"
                  : "bg-neutral-100 border-neutral-200 text-neutral-400"
              }`}
            >
              {done ? <FaCheck size={12} /> : <Icon size={12} />}
            </div>
            <p
              className={`text-[11px] font-bold transition-colors duration-300 ${
                done || active ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {step.label}
            </p>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-14 sm:w-16 h-0.5 mb-4 mx-1 transition-all duration-500 ${
                idx < current ? "bg-[#111111]" : "bg-neutral-200"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [authPass, setAuthPass] = useState("");
  const [isAuthPassCorrect, setIsAuthPassCorrect] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({
    defaultValues: {
      user_name: "",
      email: "",
      password: "",
      confirm_pass: "",
      otp: "",
    },
  });

  const password = watch("password");
  const confirmPass = watch("confirm_pass");

  /* current step index */
  const currentStep = isAuthPassCorrect ? 2 : authPass ? 1 : 0;

  /* ── Step 1: verify user & send OTP ── */
  const checkUserAndSendEmail = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        envConfig.apiURL + "/auth/forgot-pass/checkuser",
        data
      );
      if (res.data.err) return popup.err(res.data.err);
      if (res.status === 200) {
        popup.success("ระบบได้ส่งรหัสยืนยันไปยังอีเมลแล้ว");
        setAuthPass(res.data.authPass);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: check OTP ── */
  const checkAuthPass = (data) => {
    if (data.otp !== authPass) return popup.err("รหัสยืนยันไม่ถูกต้อง");
    setIsAuthPassCorrect(true);
    popup.success("รหัสยืนยันถูกต้อง");
  };

  /* ── Step 3: save new password ── */
  const saveNewPass = async (data) => {
    setLoading(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/auth/forgot-pass/update-pass",
        data
      );
      if (res.status === 200) {
        popup.success("บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว");
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared input class ── */
  const inputClass = (hasError) =>
    `w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-50 text-neutral-900 text-xs placeholder-neutral-400 border transition-all duration-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#fbc50e]/30 ${
      hasError ? "border-rose-400" : "border-neutral-200 focus:border-[#fbc50e]"
    }`;

  return (
    <div className="w-full max-w-md animate-fadeIn">
      {/* Heading */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#fef9c3] text-neutral-900 px-2.5 py-0.5 rounded text-[11px] font-bold mb-2">
          <span>SECURITY RECOVERY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          ลืมรหัสผ่าน
        </h2>
        <p className="text-neutral-500 text-xs mt-1">
          {currentStep === 0
            ? "กรอกข้อมูลของคุณ เพื่อรับรหัสยืนยันทางอีเมล"
            : currentStep === 1
            ? "กรอกรหัส OTP ที่ได้รับในอีเมลของคุณ"
            : "ตั้งรหัสผ่านใหม่ที่คุณต้องการใช้งาน"}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Step progress bar */}
        <StepBar current={currentStep} />

        {/* ── Step 0: User identity ── */}
        {currentStep === 0 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Username */}
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">
                รหัสผู้ใช้งาน หรือ อีเมล
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FaUser size={12} />
                </span>
                <Controller
                  name="user_name"
                  control={control}
                  rules={{ required: "กรุณากรอกรหัสผู้ใช้งานหรืออีเมล" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="forgot-username"
                      type="text"
                      placeholder="กรอกรหัสผู้ใช้งานหรืออีเมลของคุณ"
                      className={inputClass(errors.user_name)}
                    />
                  )}
                />
              </div>
              {errors.user_name && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.user_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">
                อีเมลที่ผูกกับบัญชี
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FaEnvelope size={12} />
                </span>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "กรุณากรอกอีเมลเพื่อรับรหัสยืนยันตัวตน" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="forgot-email"
                      type="email"
                      placeholder="กรอกอีเมลของคุณ"
                      className={inputClass(errors.email)}
                    />
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.email.message}</p>
              )}
            </div>

            {/* Info box */}
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3.5 flex gap-2.5">
              <FaEnvelope className="text-[#fbc50e] shrink-0 mt-0.5" size={13} />
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                ระบบจะส่งรหัสยืนยัน (OTP) ไปยังอีเมลที่ผูกไว้กับบัญชีของคุณ กรุณาตรวจสอบกล่องข้อความ
              </p>
            </div>
          </div>
        )}

        {/* ── Step 1: OTP ── */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">
                รหัสยืนยัน OTP
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FaShieldAlt size={12} />
                </span>
                <Controller
                  name="otp"
                  control={control}
                  rules={{ required: "กรุณากรอกรหัสยืนยันตัวตนที่ได้รับทางอีเมล" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="forgot-otp"
                      type="text"
                      placeholder="กรอกรหัส OTP 6 หลัก"
                      className={`${inputClass(errors.otp)} text-center text-lg tracking-[0.4em] font-mono`}
                    />
                  )}
                />
              </div>
              {errors.otp && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.otp.message}</p>
              )}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 flex gap-2.5">
              <FaEnvelope className="text-amber-600 shrink-0 mt-0.5" size={13} />
              <p className="text-amber-800 text-[11px] leading-relaxed">
                กรุณาตรวจสอบอีเมลของคุณ และกรอกรหัส OTP ที่ได้รับเพื่อความปลอดภัยของบัญชี
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: New password ── */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* New password */}
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FaLock size={12} />
                </span>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "กรุณาสร้างรหัสผ่านใหม่",
                    validate: (value) => {
                      if (value.length < 8) return "ความยาวต้องมากกว่า 8 ตัวอักษร";
                      if (!/[a-zA-Z]/.test(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
                      if (!/[0-9]/.test(value)) return "ต้องมีตัวเลข";
                      if (!/[^a-zA-Z0-9]/.test(value)) return "ต้องมีอักขระพิเศษ";
                      if (
                        watch("confirm_pass").length > 0 &&
                        value !== watch("confirm_pass")
                      )
                        return "รหัสผ่านไม่ตรงกัน";
                      if (watch("user_name") === value)
                        return "รหัสผ่านห้ามตรงกับรหัสผู้ใช้งาน";
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="forgot-new-password"
                      type={showPass ? "text" : "password"}
                      placeholder="สร้างรหัสผ่านใหม่"
                      className={`${inputClass(errors.password)} pr-10`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">
                ยืนยันรหัสผ่านใหม่อีกครั้ง
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FaKey size={12} />
                </span>
                <Controller
                  name="confirm_pass"
                  control={control}
                  rules={{
                    required: "กรุณากรอกรหัสผ่านอีกครั้ง",
                    validate: (value) => {
                      if (value !== watch("password")) return "รหัสผ่านไม่ตรงกัน";
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="forgot-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="กรอกรหัสผ่านใหม่เพื่อยืนยันอีกครั้ง"
                      className={`${inputClass(errors.confirm_pass)} pr-10`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label="Toggle password confirmation visibility"
                >
                  {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.confirm_pass && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.confirm_pass.message}</p>
              )}
            </div>

            {/* Password strength checker */}
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3 flex flex-col gap-1.5">
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">เงื่อนไขความปลอดภัยของรหัสผ่าน</p>
              <PasswordRule passed={password.length > 8} label="ความยาวมากกว่า 8 ตัวอักษร" />
              <PasswordRule passed={/[A-Za-z]/.test(password)} label="มีตัวอักษรภาษาอังกฤษ" />
              <PasswordRule passed={/[^A-Za-z0-9]/.test(password)} label="มีอักขระพิเศษอย่างน้อย 1 ตัว" />
              <PasswordRule passed={/\d/.test(password)} label="มีตัวเลขอักษรอย่างน้อย 1 ตัว" />
              <PasswordRule
                passed={confirmPass.length > 0 && password === confirmPass}
                label="รหัสผ่านและการยืนยันตรงกัน"
              />
            </div>
          </div>
        )}

        {/* ── Action button ── */}
        <button
          id="forgot-submit"
          disabled={loading}
          onClick={handleSubmit((data) =>
            currentStep === 1
              ? checkAuthPass(data)
              : currentStep === 2
              ? saveNewPass(data)
              : checkUserAndSendEmail(data)
          )}
          className="w-full mt-6 py-3 rounded-lg font-bold text-neutral-950 bg-[#fbc50e] hover:bg-[#e0ac00] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader />
              <span>กำลังตรวจสอบ...</span>
            </>
          ) : currentStep === 1 ? (
            <>
              <FaSearch size={12} />
              <span>ยืนยันรหัส OTP</span>
            </>
          ) : currentStep === 2 ? (
            <>
              <FaKey size={12} />
              <span>บันทึกรหัสผ่านใหม่</span>
            </>
          ) : (
            <>
              <span>ส่งรหัสยืนยันตัวตน</span>
              <FaArrowRight size={12} />
            </>
          )}
        </button>
      </div>

      {/* Back to sign-in */}
      <p className="text-center text-xs text-neutral-600 mt-6">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-1.5 text-neutral-900 font-bold hover:text-[#e0ac00] transition-colors"
        >
          <FaArrowLeft size={10} />
          <span>กลับไปยังหน้าเข้าสู่ระบบ</span>
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
