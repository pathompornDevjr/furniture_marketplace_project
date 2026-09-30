"use client";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const Address = () => {
  const { user, checking } = useGetSeesion();
  const [address, setAddress] = useState(null);

  const [geting, setGeting] = useState(false);
  const getUserAddress = async () => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-address", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setAddress(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };

  const [updating, setUpdating] = useState(false);
  const handleUseAddress = async (address) => {
    const { district: amphure, sub_distric: tambon, ...rest } = address;
    if (address?.is_using) return;

    const { isConfirmed } = await popup.confirmPopUp(
      "คุณต้องการใช้ที่อยู่นี้หรือไม่?",
      "เลือกใช้ที่อยู่นี้เป็นที่อยู่จัดส่ง",
      "ยืนยัน"
    );
    if (!isConfirmed) return;

    setUpdating(true);
    try {
      const res = await axios.post(
        envConfig.apiURL + `/user/update-address/${address?.id}`,
        {
          amphure,
          tambon,

          ...rest,
          is_using: true,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.err) {
        popup.err(res.data.err);
        return;
      }
      if (res.status === 200) {
        getUserAddress();
        popup.success("เปลี่ยนที่อยู่จัดส่งเรียบร้อย");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (checking) return;

    getUserAddress();
  }, [user]);

  if (checking || geting) return <Loading />;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center pb-4 border-b border-neutral-200 justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#fbc50e] rounded-full" />
            <h1 className="text-xl font-bold text-neutral-900">ที่อยู่จัดส่ง</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1 pl-4">
            เพิ่มและจัดการข้อมูลที่อยู่จัดส่งสินค้าหรือที่อยู่ออกใบกำกับภาษี
          </p>
        </div>
        <Link
          href="/profile/address/0"
          className="px-4 py-2 text-sm font-bold text-neutral-950 bg-[#fbc50e] hover:bg-[#eab308] flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <FaPlus size={12} />
          <span>เพิ่มที่อยู่ใหม่</span>
        </Link>
      </div>
      <div className="w-full mt-4 flex flex-col gap-3">
        {updating ? (
          <div className="w-full py-12 flex flex-col items-center gap-2">
            <div className="w-9 h-9 border-3 border-[#fbc50e] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-500">กำลังโหลดที่อยู่...</p>
          </div>
        ) : address?.length < 1 ? (
          <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
            <p className="text-sm">ยังไม่มีข้อมูลที่อยู่จัดส่ง</p>
          </div>
        ) : (
          address?.map((a) => (
            <div
              key={a?.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                a?.is_using
                  ? "border-[#fbc50e] bg-amber-50/20 shadow-xs"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className="pt-1">
                <input
                  type="radio"
                  onChange={() => handleUseAddress(a)}
                  checked={a?.is_using}
                  name="using"
                  className="accent-[#fbc50e] w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 text-sm">
                    {user?.first_name} {user?.last_name}
                  </span>
                  {a?.is_using && (
                    <span className="text-[11px] font-bold text-[#b48300] bg-[#fef9c3] border border-[#fbc50e]/30 px-2 py-0.5 rounded-md">
                      ที่อยู่เริ่มต้น
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed break-words">
                  {`${a?.address} ${a?.sub_district} ${a?.district} จ.${a?.province} ${a?.zipcode}`}
                </p>
                <p className="text-xs text-neutral-500">
                  โทรศัพท์: <span className="text-neutral-700 font-medium">{a?.phone}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 self-start pt-1">
                <Link
                  href={`/profile/address/${a?.id}`}
                  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                  title="แก้ไขที่อยู่"
                >
                  <FaEdit size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(a)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="ลบที่อยู่"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Address;
