"use client";

import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { isValidThaiBankAccount } from "@/libs/validate-input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";

const bankOptions = [
  { value: "ธนาคารกรุงไทย", label: "ธนาคารกรุงไทย" },
  { value: "ธนาคารกรุงเทพ", label: "ธนาคารกรุงเทพ" },
  { value: "ธนาคารกสิกรไทย", label: "ธนาคารกสิกรไทย" },
  { value: "ธนาคารไทยพาณิชย์", label: "ธนาคารไทยพาณิชย์" },
  { value: "ธนาคารทหารไทยธนชาต", label: "ธนาคารทหารไทยธนชาต" },
  { value: "ธนาคารกรุงศรีอยุธยา", label: "ธนาคารกรุงศรีอยุธยา" },
  { value: "ธนาคารออมสิน", label: "ธนาคารออมสิน" },
  {
    value: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
    label: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
  },
  { value: "ธนาคารซีไอเอ็มบีไทย", label: "ธนาคารซีไอเอ็มบีไทย" },
  { value: "ธนาคารยูโอบี", label: "ธนาคารยูโอบี" },
  { value: "ธนาคารทิสโก้", label: "ธนาคารทิสโก้" },
  { value: "ธนาคารเกียรตินาคินภัทร", label: "ธนาคารเกียรตินาคินภัทร" },
  { value: "ธนาคารแลนด์แอนด์เฮ้าส์", label: "ธนาคารแลนด์แอนด์เฮ้าส์" },
  { value: "ธนาคารอิสลามแห่งประเทศไทย", label: "ธนาคารอิสลามแห่งประเทศไทย" },
  {
    value: "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อม",
    label: "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อม",
  },
  {
    value: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย",
    label: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย",
  },
];

const Page = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {
      bank_number: "",
      bank_name: "",
      bank_owner: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลบัญชีธนาคารของผู้ใช้มาแสดง

  const fetchBankData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-bank", {
        withCredentials: true,
      });
      if (res.status === 200) {
        reset({
          bank_name: res.data?.bank_name || "",
          bank_number: res.data?.bank_number || "",
          bank_owner: res.data?.bank_owner || "",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/user/update-bank",
        data,
        { withCredentials: true }
      );
      if (res.status === 200) {
        fetchBankData();
        popup.success("บันทึกข้อมูลบัญชีธนาคารสำเร็จ");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex flex-col justify-center items-center gap-2">
        <div className="w-9 h-9 border-3 border-[#fbc50e] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-neutral-500">กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between pb-4 w-full border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#fbc50e] rounded-full" />
            <h1 className="text-xl font-bold text-neutral-900">บัญชีธนาคาร</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1 pl-4">
            จัดการข้อมูลบัญชีธนาคารสำหรับรับเงินคืนในกรณีที่มีการยกเลิกคำสั่งซื้อ
          </p>
        </div>
      </div>
      {/* bank_name */}
      <div className="mt-8 lg:ml-2 w-full flex lg:flex-row flex-col gap-1 lg:items-center">
        <p className="text-sm text-gray-800 w-[25%]">ธนาคาร</p>
        <div className="flex flex-col gap-1 w-full] lg:w-[40%]">
          <Controller
            name="bank_name"
            rules={{ required: "กรุณาระบุธนาคารของคุณ" }}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={bankOptions.find((c) => c.value === field.value)}
                onChange={(val) => field.onChange(val.value)}
                options={bankOptions}
                placeholder="เลือกธนาคารของคุณ"
                className="text-[0.9rem]"
              />
            )}
          />
          {errors.bank_name && (
            <small className="mt-1 text-sm text-red-500">
              {errors.bank_name.message}
            </small>
          )}
        </div>
      </div>
      {/* bank_name */}
      <div className="mt-8 lg:ml-5 w-full flex lg:flex-row flex-col gap-1 lg:items-center">
        <p className="text-sm text-gray-800 w-[25%]">เลขที่บัญชี</p>
        <div className="flex flex-col gap-1 w-full] lg:w-[40%]">
          <Controller
            name="bank_number"
            rules={{
              required: "กรุณาระบุเลขที่บัญชีธนาคารของคุณ",
              validate: (value) => {
                if (!isValidThaiBankAccount(value))
                  return "เลขที่บัญชีธนาคารไม่ถูกต้อง";

                if (!/[0-9]/.test(value))
                  return "เลขที่บัญชีต้องมีความยาวอย่างน้อย 10 ตัว";
              },
            }}
            control={control}
            render={({ field }) => (
              <input
                value={field || ""}
                {...field}
                type="text"
                className="text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                placeholder="เลขที่บัญชีธนาคารของคุณ"
              />
            )}
          />
          {errors.bank_number && (
            <small className="mt-1 text-sm text-red-500">
              {errors.bank_number.message}
            </small>
          )}
        </div>
      </div>
      {/* bank_owner */}
      <div className="mt-8 lg:ml-5 w-full flex lg:flex-row flex-col gap-1 lg:items-center">
        <p className="text-sm text-gray-800 lg:w-[25%]">
          ชื่อผู้ถือบัญชีธนาคารของคุณ
        </p>
        <div className="flex flex-col gap-1 w-full] lg:w-[40%]">
          <Controller
            name="bank_owner"
            rules={{
              required: "กรุณาระบุชื่อผู้ถือบัญชีธนาคารของคุณ",
            }}
            control={control}
            render={({ field }) => (
              <input
                value={field || ""}
                {...field}
                type="text"
                className=" text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                placeholder="ชื่อผู้ถือบัญชีธนาคารของคุณ"
              />
            )}
          />
          {errors.bank_owner && (
            <small className="mt-1 text-sm text-red-500">
              {errors.bank_owner.message}
            </small>
          )}
        </div>
      </div>
      <p className="mt-8 lg:ml-2 text-xs text-neutral-500">
        * โปรดตรวจสอบความถูกต้องของชื่อบัญชีและเลขที่บัญชีก่อนบันทึก
      </p>
      <div className="lg:ml-2 mt-4">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-bold hover:bg-[#eab308] text-neutral-950 rounded-xl flex items-center justify-center gap-2 bg-[#fbc50e] shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FaCheck />
              <p>บันทึกบัญชีธนาคาร</p>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default Page;
