"use client";
import { useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop with elegant dark blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/65 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />
      {/* Center content container */}
      <div className="relative z-10 w-full flex items-center justify-center pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

export default Modal;
