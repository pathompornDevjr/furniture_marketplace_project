"use client";
import Loader from "@/components/loader";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { validateUsername } from "@/libs/validate-input";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaKey,
  FaLock,
  FaTimes,
  FaUser,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";

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

const SignUp = () => {
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    defaultValues: {
      user_name: "",
      password: "",
      confirm_pass: "",
      first_name: "",
      last_name: "",
    },
  });

  const router = useRouter();
  const [prefix, setPrefix] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch("password");
  const confirmPass = watch("confirm_pass");

  const handleSignUp = async (data) => {
    if (prefix < 1) {
      return popup.err("โปรดระบุคำนำหน้า");
    }
    setLoading(true);
    try {
      const payload = {
        ...data,
        title_type: prefix === 1 ? "นาย" : prefix === 2 ? "นาง" : "นางสาว",
      };
      const res = await axios.post(envConfig.apiURL + "/auth/create-user", payload);
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 201) {
        popup.success("สมัครสมาชิกสำเร็จเรียบร้อยแล้ว!");
        router.replace("/auth/sign-in");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-50 text-neutral-900 text-xs placeholder-neutral-400 border transition-all duration-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#fbc50e]/30 ${
      hasError ? "border-rose-400" : "border-neutral-200 focus:border-[#fbc50e]"
    }`;

  return (
    <div className="w-full max-w-md animate-fadeIn">
      {/* Heading */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#fef9c3] text-neutral-900 px-2.5 py-0.5 rounded text-[11px] font-bold mb-2">
          <span>MEMBER REGISTRATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          สมัครสมาชิกใหม่
        </h2>
        <p className="text-neutral-500 text-xs mt-1">
          สร้างบัญชีเพื่อสะสมคะแนนและรับสิทธิพิเศษมากมาย
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
        {/* ---- Section: ข้อมูลทั่วไป ---- */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#fbc50e] rounded-xs" />
            <span>ข้อมูลส่วนบุคคล</span>
          </p>

          {/* คำนำหน้า */}
          <div className="mb-3">
            <label className="block text-neutral-700 text-xs font-bold mb-1.5">คำนำหน้า</label>
            <Select
              id="signup-prefix"
              options={[
                { label: "นาย", value: 1 },
                { label: "นาง", value: 2 },
                { label: "นางสาว", value: 3 },
              ]}
              value={[
                { label: "นาย", value: 1 },
                { label: "นาง", value: 2 },
                { label: "นางสาว", value: 3 },
              ].find((p) => p.value === prefix)}
              onChange={(option) => setPrefix(option.value)}
              className="w-full text-xs"
              placeholder="เลือกคำนำหน้า"
            />
          </div>

          {/* ชื่อ / นามสกุล */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">ชื่อจริง</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <FaUser size={11} />
                </span>
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: "กรุณากรอกชื่อ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="signup-firstname"
                      type="text"
                      placeholder="ชื่อของคุณ"
                      className={inputClass(errors.first_name)}
                    />
                  )}
                />
              </div>
              {errors.first_name && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-neutral-700 text-xs font-bold mb-1.5">นามสกุล</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <FaIdCard size={11} />
                </span>
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: "กรุณากรอกนามสกุล" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="signup-lastname"
                      type="text"
                      placeholder="นามสกุล"
                      className={inputClass(errors.last_name)}
                    />
                  )}
                />
              </div>
              {errors.last_name && (
                <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.last_name.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-100" />

        {/* ---- Section: ข้อมูลบัญชีผู้ใช้ ---- */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#fbc50e] rounded-xs" />
            <span>ข้อมูลบัญชีผู้ใช้งาน</span>
          </p>

          {/* Username */}
          <div className="mb-3">
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
                rules={{
                  required: "กรุณาตั้งรหัสผู้ใช้งานหรืออีเมล",
                  validate: (value) => {
                    if (value.length < 6) return "ความยาวต้องมากกว่า 6 ตัวอักษร";
                    if (!validateUsername(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="signup-username"
                    type="text"
                    placeholder="ตั้งชื่อผู้ใช้หรืออีเมลของคุณ"
                    className={inputClass(errors.user_name)}
                  />
                )}
              />
            </div>
            {errors.user_name && (
              <p className="text-rose-500 text-[11px] mt-1">⚠ {errors.user_name.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-neutral-700 text-xs font-bold mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <FaLock size={12} />
              </span>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "กรุณาสร้างรหัสผ่าน",
                  validate: (value) => {
                    if (value.length < 8) return "ความยาวต้องมากกว่า 8 ตัวอักษร";
                    if (!/[a-zA-Z]/.test(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
                    if (!/[0-9]/.test(value)) return "ต้องมีตัวเลข";
                    if (!/[^a-zA-Z0-9]/.test(value)) return "ต้องมีอักขระพิเศษ";
                    if (watch("confirm_pass").length > 0 && value !== watch("confirm_pass"))
                      return "รหัสผ่านไม่ตรงกัน";
                    if (watch("user_name") === value)
                      return "รหัสผ่านห้ามตรงกับรหัสผู้ใช้งาน";
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="signup-password"
                    type={showPass ? "text" : "password"}
                    placeholder="สร้างรหัสผ่านเพื่อใช้ยืนยันตัวตน"
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

          {/* Confirm Password */}
          <div className="mb-3">
            <label className="block text-neutral-700 text-xs font-bold mb-1.5">ยืนยันรหัสผ่านอีกครั้ง</label>
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
                    id="signup-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="กรอกรหัสผ่านเพื่อยืนยันอีกครั้ง"
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

          {/* Password strength rules */}
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

        {/* Submit */}
        <button
          id="signup-submit"
          disabled={loading}
          onClick={handleSubmit(handleSignUp)}
          className="w-full py-3 rounded-lg font-bold text-neutral-950 bg-[#fbc50e] hover:bg-[#e0ac00] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-xs cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader />
              <span>กำลังบันทึกข้อมูล...</span>
            </>
          ) : (
            <>
              <span>ยืนยันการสมัครสมาชิก</span>
              <FaArrowRight size={12} />
            </>
          )}
        </button>
      </div>

      {/* Sign-in link */}
      <div className="mt-6 text-center text-xs text-neutral-600">
        มีบัญชีสมาชิกอยู่แล้ว?{" "}
        <Link
          href="/auth/sign-in"
          className="text-neutral-950 font-bold hover:text-[#e0ac00] underline ml-1 transition-colors"
        >
          เข้าสู่ระบบที่นี่
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
