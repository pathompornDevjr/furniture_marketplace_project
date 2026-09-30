"use client";
import Loader from "@/components/loader";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import useProvince from "@/hooks/useProvince";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import { isValidThaiPhone } from "@/libs/validate-input";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaArrowLeft, FaCheck, FaMapMarkerAlt, FaPhone, FaBuilding } from "react-icons/fa";

const Address = () => {
  const { id } = useParams();
  const { loading, provinceOptions, provinces } = useProvince();
  const { user, checking } = useGetSeesion();
  const [amphures, setAmphures] = useState();
  const [tambons, setTambons] = useState();
  const [zipcode, setZipcode] = useState();
  const [isUsing, setIsUsing] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      address: "",
      tambon: "",
      amphure: "",
      province: "",
      phone: "",
    },
  });

  const [geting, setGeting] = useState(false);
  const getUserAddress = async (id) => {
    setGeting(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + `/user/get-address-id/${id}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        reset({
          address: res.data?.address || "",
          province: res.data?.province || "",
          amphure: res?.data?.district || "",
          tambon: res.data?.sub_district || "",
          phone: res?.data?.phone || "",
        });
        setZipcode(res.data?.zipcode);
        setIsUsing(res.data?.is_using);

        if (provinces && provinces.length > 0) {
          const selectedProv = provinces.find((p) => p.name_th === res.data?.province);
          if (selectedProv) {
            setAmphures(selectedProv.districts);
            const selectedDist = selectedProv.districts.find(
              (p) => `อ.${p.name_th}` === res?.data?.district || p.name_th === res?.data?.district
            );
            if (selectedDist) {
              setTambons(selectedDist.sub_districts);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSaveData = async (data) => {
    setSaving(true);
    try {
      const api =
        id && id != 0 ? `/user/update-address/${id}` : "/user/add-address";
      const res = await axios.post(
        envConfig.apiURL + api,
        { ...data, is_using: isUsing, zipcode },
        {
          withCredentials: true,
        }
      );
      if (res.data.err) {
        popup.err(res.data.err);
        return;
      }
      if (res.status === 200) {
        popup.success("บันทึกข้อมูลที่อยู่จัดส่งสำเร็จ");
        router.push("/profile/address");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!id || id == 0) return;
    getUserAddress(id);
  }, [id, provinces]);

  if (checking || geting) return <Loading />;

  return (
    <div className="w-full">
      {/* Header Bar */}
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200/90 w-full">
        <Link
          href="/profile/address"
          className="px-3.5 py-2 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 hover:border-neutral-900 hover:text-neutral-950 hover:bg-neutral-50 flex items-center gap-2 rounded-xl transition-all shadow-2xs"
        >
          <FaArrowLeft size={11} />
          <span>ย้อนกลับ</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-[#fbc50e] rounded-full" />
          <h1 className="text-xl font-bold text-neutral-900">
            {Number(id) === 0 ? "เพิ่มที่อยู่ใหม่" : "แก้ไขข้อมูลที่อยู่จัดส่ง"}
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full mt-6 max-w-2xl flex flex-col gap-5">
        {/* Address Detail Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
            <FaBuilding className="text-neutral-400" size={12} />
            <span>ที่อยู่ (บ้านเลขที่, อาคาร, ซอย, ถนน)</span>
            <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="address"
            rules={{
              required: "กรุณากรอกที่อยู่",
              validate: (value) => {
                if (!value || value.trim().length < 5) return "กรุณาระบุที่อยู่อย่างน้อย 5 ตัวอักษร";
              },
            }}
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={2}
                className="w-full text-xs sm:text-sm p-3 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400 resize-none"
                placeholder="เช่น 123/45 ถนนสุขุมวิท ซอย 55 แขวงคลองตันเหนือ"
              />
            )}
          />
          {errors.address && (
            <small className="text-xs text-rose-500 font-medium">
              {errors.address.message}
            </small>
          )}
        </div>

        {/* Province Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-neutral-400" size={12} />
            <span>จังหวัด</span>
            <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="province"
            rules={{
              required: "โปรดระบุจังหวัด",
            }}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isDisabled={loading}
                options={provinceOptions}
                placeholder={loading ? "กำลังโหลดจังหวัด..." : "เลือกจังหวัด"}
                value={
                  provinces
                    ?.map((a) => ({
                      label: a.name_th,
                      value: a.name_th,
                    }))
                    .find((t) => t.value === watch("province")) || null
                }
                isSearchable
                onChange={(option) => {
                  setValue("amphure", "");
                  setValue("tambon", "");
                  setValue("province", option?.value || "");
                  const matched = provinces?.find((p) => p.name_th === option?.value);
                  setAmphures(matched?.districts || []);
                }}
                className="w-full"
              />
            )}
          />
          {errors.province && (
            <small className="text-xs text-rose-500 font-medium">
              {errors.province.message}
            </small>
          )}
        </div>

        {/* Amphure / District Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700">
            <span>อำเภอ / เขต</span>
            <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="amphure"
            rules={{
              required: "โปรดเลือกอำเภอ/เขต",
            }}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isDisabled={loading || !watch("province")}
                options={amphures?.map((a) => ({
                  label: a.name_th,
                  value: a.name_th,
                }))}
                value={
                  amphures
                    ?.map((a) => ({
                      label: a.name_th,
                      value: a.name_th,
                    }))
                    .find((t) => `อ.${t.value}` === watch("amphure") || t.value === watch("amphure")) || null
                }
                placeholder={watch("province") ? "เลือกอำเภอ / เขต" : "กรุณาเลือกจังหวัดก่อน"}
                onChange={(option) => {
                  setValue("tambon", "");
                  setValue("amphure", `อ.${option?.value}`);
                  const matchedDist = amphures?.find((p) => p.name_th === option?.value);
                  setTambons(matchedDist?.sub_districts || []);
                }}
                isSearchable
                className="w-full"
              />
            )}
          />
          {errors.amphure && (
            <small className="text-xs text-rose-500 font-medium">
              {errors.amphure.message}
            </small>
          )}
        </div>

        {/* Tambon / Sub-district Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700">
            <span>ตำบล / แขวง</span>
            <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="tambon"
            rules={{
              required: "โปรดเลือกตำบล/แขวง",
            }}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isDisabled={loading || !watch("province") || !watch("amphure")}
                options={tambons?.map((a) => ({
                  label: a.name_th,
                  value: a.name_th,
                }))}
                value={
                  tambons
                    ?.map((a) => ({
                      label: a.name_th,
                      value: a.name_th,
                    }))
                    .find((t) => `ต.${t.value}` === watch("tambon") || t.value === watch("tambon")) || null
                }
                placeholder={watch("amphure") ? "เลือกตำบล / แขวง" : "กรุณาเลือกอำเภอก่อน"}
                onChange={(option) => {
                  setValue("tambon", `ต.${option?.value}`);
                  const matchedTambon = tambons?.find((p) => p.name_th === option?.value);
                  setZipcode(matchedTambon?.zip_code || "");
                }}
                isSearchable
                className="w-full"
              />
            )}
          />
          {errors.tambon && (
            <small className="text-xs text-rose-500 font-medium">
              {errors.tambon.message}
            </small>
          )}
        </div>

        {/* Zipcode Box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700">
            <span>รหัสไปรษณีย์</span>
          </label>
          <div className="w-full p-2.5 px-3.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-neutral-800">
            {zipcode ? (
              <span className="text-neutral-900">{zipcode}</span>
            ) : (
              <span className="text-neutral-400 font-sans font-normal text-xs">
                (จะแสดงอัตโนมัติเมื่อเลือกตำบล/แขวง)
              </span>
            )}
          </div>
        </div>

        {/* Phone Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
            <FaPhone className="text-neutral-400" size={11} />
            <span>เบอร์โทรศัพท์สำหรับจัดส่ง</span>
            <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="phone"
            rules={{
              required: "กรุณากรอกเบอร์โทรศัพท์",
              validate: (value) => {
                if (!isValidThaiPhone(value)) return "เบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 0812345678)";
              },
            }}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className="w-full text-xs sm:text-sm p-3 text-neutral-900 bg-neutral-50/70 border border-neutral-300 rounded-xl focus:bg-white focus:border-[#fbc50e] focus:ring-2 focus:ring-[#fbc50e]/20 outline-none transition-all placeholder:text-neutral-400 font-mono"
                placeholder="เช่น 0891234567"
              />
            )}
          />
          {errors.phone && (
            <small className="text-xs text-rose-500 font-medium">
              {errors.phone.message}
            </small>
          )}
        </div>

        {/* Default Address Checkbox */}
        <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex items-center gap-3">
          <input
            id="status-checkbox"
            onChange={() => setIsUsing(!isUsing)}
            type="checkbox"
            name="status"
            checked={isUsing}
            className="accent-[#fbc50e] w-4 h-4 cursor-pointer rounded"
          />
          <label
            htmlFor="status-checkbox"
            className="text-xs font-semibold text-neutral-900 cursor-pointer select-none"
          >
            ตั้งเป็นที่อยู่จัดส่งเริ่มต้น (Default Address)
          </label>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={checking || saving}
            onClick={handleSubmit(handleSaveData)}
            className="px-7 py-3 text-xs sm:text-sm font-bold hover:bg-[#eab308] text-neutral-950 rounded-xl flex items-center justify-center gap-2 bg-[#fbc50e] shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader />
                <span>กำลังบันทึกที่อยู่...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>บันทึกข้อมูลที่อยู่จัดส่ง</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Address;
