import Swal from "sweetalert2";

// Base themed instance of SweetAlert2
const ThemedSwal = Swal.mixin({
  confirmButtonColor: "#fbc50e",
  denyButtonColor: "#f3f4f6",
  cancelButtonColor: "#f3f4f6",
  reverseButtons: true,
  focusConfirm: true,
});

export const popup = {
  err: (mes = "โปรดตรวจเครือข่ายแล้วลองอีกครั้ง", title = "เกิดข้อผิดพลาด") => {
    const message =
      typeof mes === "string"
        ? mes
        : mes?.response?.data?.err ||
          mes?.response?.data?.message ||
          mes?.message ||
          "เกิดข้อผิดพลาดในการทำรายการ";
    return ThemedSwal.fire({
      icon: "error",
      title,
      text: message,
      confirmButtonText: "ตกลง",
    });
  },
  success: (mes = "บันทึกข้อมูลแล้ว", title = "สำเร็จ") => {
    return ThemedSwal.fire({
      icon: "success",
      title,
      text: typeof mes === "string" ? mes : (mes?.message || "ทำรายการสำเร็จ"),
      confirmButtonText: "ตกลง",
      timer: 3000,
      timerProgressBar: true,
    });
  },
  confirmPopUp: (
    title = "ยืนยันการทำรายการ",
    mes = "",
    confirmButtonText = "ยืนยัน",
    denyButtonText = "ยกเลิก"
  ) => {
    return ThemedSwal.fire({
      title,
      text: mes,
      confirmButtonText,
      denyButtonText,
      showDenyButton: true,
      icon: "question",
      reverseButtons: true,
    });
  },
  confirmDanger: (
    title = "ยืนยันการลบ",
    mes = "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?",
    confirmButtonText = "ยืนยันการลบ",
    denyButtonText = "ยกเลิก"
  ) => {
    return ThemedSwal.fire({
      title,
      text: mes,
      confirmButtonText,
      denyButtonText,
      showDenyButton: true,
      icon: "warning",
      reverseButtons: true,
      customClass: {
        confirmButton: "swal2-danger-confirm",
      },
    });
  },
  warning: (
    mes = "ขออภัยจำนวนสินค้าคงเหลือไม่เพียงพอ",
    title = "ขออภัย!"
  ) => {
    return ThemedSwal.fire({
      icon: "warning",
      title,
      text: typeof mes === "string" ? mes : (mes?.message || JSON.stringify(mes)),
      confirmButtonText: "ตกลง",
    });
  },
  info: (mes = "", title = "แจ้งเตือน") => {
    return ThemedSwal.fire({
      icon: "info",
      title,
      text: typeof mes === "string" ? mes : (mes?.message || JSON.stringify(mes)),
      confirmButtonText: "ตกลง",
    });
  },
};

export default popup;
