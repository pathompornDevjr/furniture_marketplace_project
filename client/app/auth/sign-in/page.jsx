"use client";
import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaLock, FaUser, FaArrowRight, FaShieldAlt } from "react-icons/fa";

const SignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      user_name: "",
      password: "",
    },
  });

  const handleSignIn = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(envConfig.apiURL + "/auth/login", data, {
        withCredentials: true,
      });
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 200) {
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        popup.success("เข้าสู่ระบบเรียบร้อยแล้ว");
        if (Number(res.data.roleId) === 1) {
          location.href = "/admin/dashboard";
        } else {
          location.href = "/";
        }
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fadeIn">
      {/* Heading */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#fef9c3] text-neutral-900 px-2.5 py-0.5 rounded text-[11px] font-bold mb-2">
          <span>MEMBER LOGIN</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          เข้าสู่ระบบ
        </h2>
        <p className="text-neutral-500 text-xs mt-1">
          กรุณากรอกรหัสผู้ใช้งานหรืออีเมลเพื่อเข้าสู่ระบบสมาชิก
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Username */}
        <div className="mb-4">
          <label className="block text-neutral-700 text-xs font-bold mb-1.5">
            รหัสผู้ใช้งาน หรือ อีเมล
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <FaUser size={13} />
            </span>
            <Controller
              name="user_name"
              control={control}
              rules={{ required: "กรุณากรอกรหัสผู้ใช้งานหรืออีเมล" }}
              render={({ field }) => (
                <input
                  {...field}
                  id="signin-username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้หรืออีเมลของคุณ"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-50 text-neutral-900 text-xs placeholder-neutral-400 border transition-all duration-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#fbc50e]/30 ${
                    errors.user_name
                      ? "border-rose-400"
                      : "border-neutral-200 focus:border-[#fbc50e]"
                  }`}
                />
              )}
            />
          </div>
          {errors.user_name && (
            <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.user_name.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-neutral-700 text-xs font-bold">
              รหัสผ่าน
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-neutral-600 hover:text-black font-semibold hover:underline transition-colors"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <FaLock size={13} />
            </span>
            <Controller
              name="password"
              control={control}
              rules={{ required: "กรุณากรอกรหัสผ่าน" }}
              render={({ field }) => (
                <input
                  {...field}
                  id="signin-password"
                  type={showPass ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-neutral-50 text-neutral-900 text-xs placeholder-neutral-400 border transition-all duration-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#fbc50e]/30 ${
                    errors.password
                      ? "border-rose-400"
                      : "border-neutral-200 focus:border-[#fbc50e]"
                  }`}
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
            <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button (Index Yellow) */}
        <button
          id="signin-submit"
          disabled={loading}
          onClick={handleSubmit(handleSignIn)}
          className="w-full mt-4 py-3 rounded-lg font-bold text-neutral-950 bg-[#fbc50e] hover:bg-[#e0ac00] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader />
              <span>กำลังเข้าสู่ระบบ...</span>
            </>
          ) : (
            <>
              <span>เข้าสู่ระบบ</span>
              <FaArrowRight size={12} />
            </>
          )}
        </button>

        {/* Security badge note */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <FaShieldAlt className="text-emerald-600" />
          <span>ระบบรักษาความปลอดภัยมาตรฐาน 256-Bit SSL</span>
        </div>
      </div>

      {/* Sign-up Link */}
      <div className="mt-6 text-center text-xs text-neutral-600">
        ยังไม่ได้เป็นสมาชิก?{" "}
        <Link
          href="/auth/sign-up"
          className="text-neutral-950 font-bold hover:text-[#e0ac00] underline ml-1 transition-colors"
        >
          สมัครสมาชิกใหม่ทันที
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
