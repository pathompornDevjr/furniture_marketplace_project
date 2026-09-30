const Loader = ({ className = "w-8 h-8", color = "border-white/30 border-t-[#fbc50e]" }) => {
  return (
    <div
      className={`rounded-full border-4 border-t-4 animate-spin ${color} ${className}`}
      role="status"
      aria-label="กำลังโหลด"
    />
  );
};

export default Loader;
