"use client";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import { envConfig } from "@/config/env-config";
import SafeImage from "@/components/safe-image";
import { useAppContext } from "@/context/app-context";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaEdit,
  FaFolderOpen,
  FaImage,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

const Page = () => {
  const { bannerWidth } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(0); // active,draft

  const [edit, setEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const handlePickImage = (e) => {
    const file = e.target.files[0];
    setFileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleNewBanner = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPreview(null);
    setEdit(false);
    setStatus(0);
    setFileImage(null);
  };

  const [saving, setSaving] = useState(false);
  const handleSaveBanner = async () => {
    if (!edit && (!preview || !fileImage)) {
      return popup.err("กรุณาเลือกรูปภาพก่อนบันทึก");
    }
    if (status === 0) {
      return popup.err("กรุณาเลือกสถานะก่อนบันทึก");
    }

    setSaving(true);
    try {
      const api = edit ? `/admin/edit-banner/${edit}` : "/admin/add-banner";
      const payload = new FormData();
      payload.append("image", fileImage);
      payload.append("status", status);
      if (edit && fileImage) {
        payload.append("changeImage", true);
      }
      const res = await axios.post(envConfig.apiURL + api, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        popup.success("บันทึกป้ายโฆษณาเรียบร้อย");
        handleCloseModal();
        fetchBanners();
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const [bannersList, setBannerList] = useState([]);
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-banners");
      if (res.status === 200) {
        setBannerList(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEdit(banner?.id);
    setStatus(Number(banner?.status));
    setPreview(envConfig.imgURL + banner?.img);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ลบป้ายโฆษณา",
      "คุณต้องการลบป้ายโฆษณานี้หรือไม่?",
      "ลบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-banner/${id}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        popup.success("ลบป้ายโฆษณาเรียบร้อย");
        fetchBanners();
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <>
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
          <h1 className="text-2xl font-bold text-neutral-900">จัดการป้ายโฆษณา & แบนเนอร์</h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 pl-5">
          จัดการป้ายโฆษณาและแบนเนอร์โปรโมชันที่แสดงบนหน้าแรกของ Furniture Marketplace
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <button
          onClick={handleNewBanner}
          className="px-5 py-2.5 text-sm font-bold rounded-xl hover:bg-[#eab308] w-fit bg-[#fbc50e] text-neutral-950 flex items-center gap-2 shadow-xs active:scale-[0.98] transition-all"
        >
          <FaPlus size={12} />
          <span>เพิ่มป้ายโฆษณาใหม่</span>
        </button>

        <div className="w-full flex flex-col p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="w-full mb-3 items-center hidden lg:flex pb-3 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <p className="w-[10%] text-start">ลำดับ</p>
            <p className="w-[50%] text-start">รูปภาพ</p>
            <p className="w-[15%] text-start">สถานะ</p>
            <p className="w-[15%] text-start">แก้ไขล่าสุด</p>
            <p className="w-[10%] text-center">แอคชัน</p>
          </div>
          {loading ? (
            <div className="w-full bg-gray-100 flex flex-col gap-1 py-10 items-center justify-center">
              <Loader />
              <p>กำลังโหลด..</p>
            </div>
          ) : bannersList.length > 0 ? (
            bannersList.map((b, index) => (
              <div
                key={b?.id}
                className="py-2 px-1 flex items-center text-sm text-gray-700"
              >
                <p className="w-[10%] text-start"> {index + 1}</p>
                <div className="w-[50%] p-2 text-start">
                  <SafeImage
                    src={b?.img ? envConfig.imgURL + b?.img : null}
                    type="banner"
                    showFallbackText={true}
                    className="w-[90%] h-[200px] object-cover shadow-md rounded-md"
                    alt={b?.title || "แบนเนอร์"}
                  />
                </div>
                <div className="w-[15%]">
                  <p
                    className={`w-fit p-2 text-sm px-3.5 rounded-md ${
                      b?.status == 1
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-red-500"
                    } shadow-md`}
                  >
                    {b?.status == 1 ? "ใช้งาน" : "ฉบับร่าง"}
                  </p>
                </div>
                <p className="w-[15%] text-start">
                  {new Date(b?.updatedAt).toLocaleDateString("th-TH")}
                </p>
                <div className="w-[10%] text-start justify-center flex items-center gap-5">
                  <FaEdit
                    onClick={() => handleEdit(b)}
                    size={20}
                    className="cursor-pointer hover:text-[#b48300] transition-colors"
                  />
                  <FaTrash
                    onClick={() => handleDelete(b?.id)}
                    size={20}
                    className="cursor-pointer hover:text-red-500"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-gray-700 text-sm flex flex-col gap-1 items-center justify-center">
              <FaFolderOpen size={35} />
              <p>ไม่พบป้ายโฆษณา</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="w-full max-w-2xl p-6 md:p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-2xl flex flex-col gap-5">
          <div className="w-full pb-4 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-[#fbc50e] rounded-full shadow-xs" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900">เพิ่มป้ายโฆษณาใหม่</h2>
                <p className="text-xs text-neutral-500">
                  อัปโหลดแบนเนอร์โปรโมชันสำหรับแสดงบนหน้าแรก
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <label
            htmlFor="img-picker"
            className="w-full rounded-2xl h-[280px] overflow-hidden flex flex-col items-center cursor-pointer hover:bg-neutral-50 justify-center text-neutral-500 gap-2 border-2 border-dashed border-neutral-300 hover:border-[#fbc50e] transition-all bg-neutral-50/50 shadow-2xs relative"
          >
            <input
              type="file"
              name=""
              id="img-picker"
              onChange={handlePickImage}
              className="hidden"
            />
            {preview ? (
              <SafeImage
                src={preview}
                type="banner"
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#b48300] flex items-center justify-center border border-amber-200/60 shadow-2xs">
                  <FaImage size={24} />
                </div>
                <p className="text-xs font-bold text-neutral-800 mt-1">คลิกเพื่ออัปโหลดรูปภาพแบนเนอร์</p>
                <p className="text-[11px] text-neutral-400">รองรับไฟล์ JPG, PNG หรือ WebP (แนะนำสัดส่วน 16:9)</p>
              </div>
            )}
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">สถานะการแสดงผล</label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStatus(1)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === 1
                    ? "bg-[#fbc50e] text-neutral-950 border-[#fbc50e] shadow-xs"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                เปิดใช้งาน
              </button>
              <button
                type="button"
                onClick={() => setStatus(2)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === 2
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                ฉบับร่าง
              </button>
            </div>
          </div>

          <button
            disabled={saving}
            onClick={handleSaveBanner}
            className="w-full mt-2 py-3 text-xs font-bold rounded-xl bg-[#fbc50e] hover:bg-[#eab308] text-neutral-950 flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>บันทึกป้ายโฆษณา</span>
              </>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};
export default Page;
