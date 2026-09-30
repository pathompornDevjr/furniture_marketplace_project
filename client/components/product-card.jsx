import { envConfig } from "@/config/env-config";
import SafeImage from "@/components/safe-image";
import Link from "next/link";
import { FaEye, FaShoppingBag, FaStar } from "react-icons/fa";

const ProductCard = ({
  pro_id,
  pro_name,
  pro_price,
  categories,
  pro_number,
  imgs,
  promotion,
  sell_count,
  unit,
}) => {
  if (!pro_id || !pro_name || !pro_price || !categories || !imgs) return null;

  const hasDiscount = promotion?.discount && Number(promotion?.discount) > 0;
  const discountedPrice = hasDiscount
    ? pro_price - Math.round((Number(promotion?.discount) / 100) * pro_price)
    : pro_price;

  return (
    <Link
      href={`/product-detail/${pro_id}`}
      prefetch={true}
      className="group relative flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 cursor-pointer block"
    >
      {/* 1. Sold Out Overlay */}
      {pro_number < 1 && (
        <div className="absolute top-0 left-0 w-full h-full z-20 bg-black/60 flex items-center justify-center flex-col gap-1.5 backdrop-blur-[2px]">
          <span className="px-3 py-1 bg-neutral-900 text-[#fbc50e] font-extrabold text-xs uppercase tracking-wider rounded border border-neutral-700">
            สินค้าหมดชั่วคราว
          </span>
          <p className="text-[11px] text-white">Out of Stock</p>
        </div>
      )}

      {/* 2. Promo / Discount Tag (Top Left Badge) */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {hasDiscount && (
          <span className="bg-[#e11d48] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm">
            ลด {promotion?.discount}%
          </span>
        )}
        {sell_count > 10 && (
          <span className="bg-[#fbc50e] text-neutral-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs w-fit">
            ยอดนิยม
          </span>
        )}
      </div>

      {/* 3. Product Image Container with Hover Button */}
      <div className="w-full aspect-square bg-neutral-50 overflow-hidden relative flex items-center justify-center border-b border-neutral-100">
        <SafeImage
          src={imgs?.[0]?.url ? envConfig.imgURL + imgs[0]?.url : null}
          alt={pro_name}
          type="product"
          showFallbackText={true}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover "ดูรายละเอียดสินค้า" overlay button (Index Living Mall style) */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:flex">
          <div className="w-full py-2 bg-[#111111]/90 hover:bg-black text-white text-xs font-semibold rounded text-center flex items-center justify-center gap-1.5 shadow-md backdrop-blur-xs">
            <FaEye size={12} className="text-[#fbc50e]" />
            <span>ดูรายละเอียดสินค้า</span>
          </div>
        </div>
      </div>

      {/* 4. Card Body / Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category Tag */}
          <div className="mb-1 text-[11px] text-neutral-400 font-medium truncate">
            {categories?.map((c) => c?.name).join(" • ")}
          </div>

          {/* Product Name (2 Lines Max) */}
          <h4
            className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#e0ac00] transition-colors"
            title={pro_name}
          >
            {pro_name}
          </h4>
        </div>

        {/* Pricing Section (Special Price + Original Strikethrough) */}
        <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-neutral-950">
              ฿{discountedPrice.toLocaleString()}.-
            </span>

            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                ฿{Number(pro_price).toLocaleString()}.-
              </span>
            )}
          </div>

          {/* Sold count */}
          <div className="flex items-center justify-end text-[11px] text-neutral-400 mt-0.5">
            <span>
              ขายแล้ว {sell_count || 0} {unit || "ชิ้น"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
