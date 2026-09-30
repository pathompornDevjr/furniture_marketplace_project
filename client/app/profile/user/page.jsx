"use client";
import { Select } from "@/components/react-select";
import { FaCheck } from "react-icons/fa";
import { NO_PROFILE } from "@/config/constants";
import SafeImage from "@/components/safe-image";
import useGetSeesion from "@/hooks/useGetSession";
import { useEffect, useState } from "react";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { Controller, useForm } from "react-hook-form";
import { days, months, years } from "@/libs/bithdate-options";
import { isValidEmail, isValidThaiPhone } from "@/libs/validate-input";
import Loader from "@/components/loader";

const Profile = () => {
  const { user, checking } = useGetSeesion();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
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
  const [prefix, setPrefix] = useState("");
  const [gender, setGender] = useState("");
  const getUserData = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-info", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setPrefix(res.data.title_type);
        setGender(res.data.gender);
        setDateBirth(Number(res.data?.birth_date?.split("/")[0]) || "");
        setBirthMonth(res.data?.birth_date?.split("/")[1] || "");
        setBirthYear(Number(res.data?.birth_date?.split("/")[2]) || "");
        setProfile(
          res.data?.profile ? envConfig.imgURL + res.data?.profile : NO_PROFILE
        );
        setOldImg(
          res.data?.profile ? envConfig.imgURL + res.data?.profile : NO_PROFILE
        );
        // set form
        reset({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          tel: res.data.tel || "",
        });
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const [profile, setProfile] = useState(NO_PROFILE);
  const [imgFile, setImgFile] = useState();
  const [oldImg, setOldImg] = useState();
  const handlePickImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setProfile(URL.createObjectURL(file));
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSaveData = async (data) => {
    if (!dateBirth || !birthMonth || !birthYear) {
      return popup.err("วัน/เดือน/ปี เกิดไม่ถูกต้อง");
    }
    if (!isValidEmail(watch("email")) && watch("email")) {
      return popup.err("รูปแบบอีเมลไม่ถูกต้อง");
    }
    if (!isValidThaiPhone(watch("tel")) && watch("tel")) {
      return popup.err("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");
    }

    setSaving(true);
    try {
      const finalForm = {
        ...data,
        title_type: prefix,
        gender,
        birth_date: `${dateBirth}/${birthMonth}/${birthYear}`,
      };

      const formData = new FormData();
      for (const key in finalForm) {
        formData.append(key, finalForm[key]);
      }

      if (imgFile) {
        formData.append("profile", imgFile);
      }
      if (oldImg !== profile) {
        formData.append("changeprofile", true);
      }

      const res = await axios.post(
        envConfig.apiURL + "/user/update-info",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        popup.success();
        getUserData();
      }
    } catch (error) {
      console.error(error);
      popup.err(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (checking) return;

    if (user) {
      getUserData(user.id);
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 w-full border-b border-neutral-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#fbc50e] rounded-full" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">ข้อมูลส่วนตัว</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-4">
            จัดการข้อมูลส่วนตัวและรายละเอียดบัญชีของคุณ
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full bg-white p-5 sm:p-7 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col-reverse lg:flex-row gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="w-full lg:w-[65%] flex flex-col gap-5">
          {/* Prefix */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0">
              คำนำหน้า
            </label>
            <div className="flex-1 w-full">
              <Select
                options={[
                  { label: "นาย", value: "นาย" },
                  { label: "นาง", value: "นาง" },
                  { label: "นางสาว", value: "นางสาว" },
                ]}
                value={[
                  { label: "นาย", value: "นาย" },
                  { label: "นาง", value: "นาง" },
                  { label: "นางสาว", value: "นางสาว" },
                ].find((p) => p.label == prefix || p.value == prefix)}
                onChange={(option) => {
                  setPrefix(option.value);
                }}
                className="w-full text-xs sm:text-sm"
                placeholder="เลือกคำนำหน้า"
              />
            </div>
          </div>

          {/* First Name */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0 sm:pt-2.5">
              ชื่อ <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col flex-1 w-full gap-1">
              <Controller
                name="first_name"
                rules={{ required: "กรุณากรอกชื่อ" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type="text"
                    className="w-full text-xs sm:text-sm p-2.5 px-3.5 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="กรอกชื่อจริง"
                  />
                )}
              />
              {errors.first_name && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Last Name */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0 sm:pt-2.5">
              นามสกุล <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col flex-1 w-full gap-1">
              <Controller
                name="last_name"
                rules={{ required: "กรุณากรอกนามสกุล" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type="text"
                    className="w-full text-xs sm:text-sm p-2.5 px-3.5 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="กรอกนามสกุล"
                  />
                )}
              />
              {errors.last_name && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0">
              เพศ
            </label>
            <div className="flex-1 w-full">
              <Select
                options={[
                  { label: "ชาย", value: "ชาย" },
                  { label: "หญิง", value: "หญิง" },
                ]}
                value={[
                  { label: "ชาย", value: "ชาย" },
                  { label: "หญิง", value: "หญิง" },
                ].find((p) => p.label == gender || p.value == gender)}
                onChange={(option) => {
                  setGender(option.label);
                }}
                className="w-full text-xs sm:text-sm"
                placeholder="เลือกเพศ"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0 sm:pt-2.5">
              อีเมล <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col flex-1 w-full gap-1">
              <Controller
                name="email"
                rules={{ required: "กรุณากรอกอีเมล" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type="email"
                    className="w-full text-xs sm:text-sm p-2.5 px-3.5 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="example@mail.com"
                  />
                )}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Telephone */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0 sm:pt-2.5">
              หมายเลขโทรศัพท์ <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col flex-1 w-full gap-1">
              <Controller
                name="tel"
                rules={{ required: "กรุณากรอกเบอร์โทรศัพท์" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field.value || ""}
                    {...field}
                    type="tel"
                    className="w-full text-xs sm:text-sm p-2.5 px-3.5 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="0812345678"
                  />
                )}
              />
              {errors.tel && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.tel.message}
                </p>
              )}
            </div>
          </div>

          {/* Birth Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 w-full">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 sm:w-36 shrink-0">
              วัน/เดือน/ปี เกิด
            </label>
            <div className="grid grid-cols-3 gap-2 flex-1 w-full">
              <Select
                options={days}
                value={days.find((d) => d.value === dateBirth) || null}
                onChange={(option) => {
                  setDateBirth(option?.value || "");
                }}
                className="text-xs sm:text-sm"
                placeholder="วัน"
                isClearable
              />
              <Select
                options={months}
                value={months.find((d) => d.label === birthMonth) || null}
                onChange={(option) => {
                  setBirthMonth(option?.label || "");
                }}
                className="text-xs sm:text-sm"
                placeholder="เดือน"
                isClearable
              />
              <Select
                options={years}
                value={years.find((d) => d.value === birthYear) || null}
                onChange={(option) => {
                  setBirthYear(option?.value || "");
                }}
                className="text-xs sm:text-sm"
                placeholder="ปี"
                isClearable
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-end">
            <button
              disabled={checking || saving}
              onClick={handleSubmit(handleSaveData)}
              className="w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-bold hover:bg-[#eab308] text-neutral-950 rounded-xl flex items-center justify-center gap-2 bg-[#fbc50e] shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <FaCheck size={13} />
                  <span>บันทึกข้อมูลส่วนตัว</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Avatar Upload Box */}
        <div className="w-full lg:w-[35%] flex flex-col items-center gap-3.5 p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80">
          <label
            htmlFor="img-pick"
            className="w-28 h-28 sm:w-32 sm:h-32 cursor-pointer rounded-full ring-4 ring-[#fbc50e]/30 border-2 border-[#fbc50e] overflow-hidden hover:opacity-90 transition-opacity bg-white flex items-center justify-center shadow-xs"
          >
            <input
              onChange={handlePickImage}
              type="file"
              id="img-pick"
              accept="image/*"
              className="hidden"
            />
            <SafeImage
              src={profile}
              type="avatar"
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </label>

          <label
            htmlFor="img-pick"
            className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer hover:border-neutral-900 hover:text-neutral-900 hover:bg-white transition-all shadow-2xs"
          >
            เปลี่ยนรูปโปรไฟล์
          </label>
          <p className="text-[11px] text-neutral-400 text-center">
            รองรับ JPG, PNG ขนาดไฟล์ไม่เกิน 2MB
          </p>
        </div>
      </div>
    </div>
  );
};
export default Profile;
