import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

export default function MyDatePicker({
  setDate,
  date,
  placeholderText = "เลือกวันที่",
}) {
  return (
    <DatePicker
      selected={date}
      onChange={(d) => setDate(d)}
      locale="th"
      dateFormat="dd/MM/yyyy"
      className="bg-white w-full border border-gray-300 p-2 rounded-md shadow-md text-sm "
      placeholderText={placeholderText}
    />
  );
}
