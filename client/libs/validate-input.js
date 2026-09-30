export function validateUsername(input) {
  // ความยาวไม่น้อยกว่า 6
  if (input.length < 6) {
    return false;
  }

  // ต้องมีพยัญชนะภาษาอังกฤษ
  const hasLetter = /[a-zA-Z]/.test(input);

  return hasLetter;
}

export function validatePassword(input) {
  if (input.length < 8) {
    return false;
  }

  // ต้องมีพยัญชนะภาษาอังกฤษ
  const hasLetter = /[a-zA-Z]/.test(input);

  // ต้องมีตัวเลข
  const hasNumber = /[0-9]/.test(input);

  // ต้องมีอักขระพิเศษ (ไม่นับตัวอักษร/ตัวเลข)
  const hasSpecial = /[^a-zA-Z0-9]/.test(input);

  return hasLetter && hasNumber && hasSpecial;
}

export function isValidEmail(email) {
  // regex ตรวจสอบ email พื้นฐาน
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidThaiPhone(phone) {
  // ตัดช่องว่างหรือขีดออกก่อน
  const cleaned = phone.replace(/[\s-]/g, "");

  // เบอร์ไทยต้องมี 10 หลัก และขึ้นต้นด้วย 0
  const regex = /^0[0-9]{9}$/;
  return regex.test(cleaned);
}

export function isValidThaiBankAccount(accountNumber) {
  const regex = /^[0-9]{10,12}$/;
  return regex.test(accountNumber);
}
