"use client";

import { useEffect, useState } from "react";
import ReactSelect from "react-select";

const defaultCustomStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#ffffff",
    borderColor: state.isFocused ? "#fbc50e" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(251, 197, 14, 0.25)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#fbc50e" : "#9ca3af",
    },
    borderRadius: "0.75rem",
    padding: "1px 2px",
    fontSize: "0.875rem",
    color: "#18181b",
    minHeight: "42px",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    zIndex: 99999,
    overflow: "hidden",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: "260px",
    backgroundColor: "#ffffff",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#fbc50e"
      : state.isFocused
      ? "#fef9c3"
      : "#ffffff",
    color: state.isSelected ? "#18181b" : "#1f2937",
    fontWeight: state.isSelected ? "700" : "500",
    fontSize: "0.875rem",
    padding: "9px 14px",
    borderRadius: "0.5rem",
    cursor: "pointer",
    display: "block",
    "&:active": {
      backgroundColor: "#fde047",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#18181b",
    fontWeight: "600",
    fontSize: "0.875rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    color: "#18181b",
    fontSize: "0.875rem",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "#6b7280",
    fontSize: "0.875rem",
    padding: "12px",
  }),
};

export const Select = ({ styles, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl animate-pulse flex items-center px-3 text-xs text-neutral-400">
        กำลังโหลดตัวเลือก...
      </div>
    );
  }

  const mergedStyles = {
    ...defaultCustomStyles,
    ...(styles || {}),
  };

  return (
    <ReactSelect
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      styles={mergedStyles}
      {...props}
    />
  );
};

export default Select;
