export default function BrandLogo({
  dark = false,
}: {
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* VEGETABLE BASKET */}
      <div className="relative w-[76px] h-[62px] shrink-0">

        {/* Leaves */}
        <div className="absolute left-5 top-0 text-2xl rotate-[-18deg]">
          ðŸ¥¬
        </div>

        <div className="absolute left-10 top-1 text-xl rotate-[18deg]">
          ðŸŒ¿
        </div>

        {/* Vegetables */}
        <div className="absolute left-1 top-8 text-xl">
          ðŸ…
        </div>

        <div className="absolute left-7 top-7 text-xl">
          ðŸ¥•
        </div>

        <div className="absolute left-12 top-8 text-xl">
          ðŸ«‘
        </div>

        {/* Basket */}
        <div className="absolute left-2 bottom-0 text-3xl">
          ðŸ§º
        </div>

      </div>

      {/* BRAND TEXT */}

      <div>

        <div className="text-3xl md:text-[36px] font-black italic tracking-tight leading-none">

          <span className={dark ? "text-white" : "text-green-700"}>
            Fresh
          </span>

          <span className="text-orange-500">
            2
          </span>

          <span className={dark ? "text-white" : "text-green-700"}>
            Cook
          </span>

        </div>

        <div
          className={`flex items-center gap-2 mt-1 text-[12px] md:text-[13px] font-bold italic ${
            dark ? "text-white" : "text-gray-700"
          }`}
        >

          <span className="text-lime-500">
            0
          </span>

          <span>
            Cut
          </span>

          <span className="text-lime-500">
            ðŸƒ
          </span>

          <span>
            Clean
          </span>

          <span className="text-lime-500">
            ðŸƒ
          </span>

          <span>
            Cook
          </span>

          <span className="text-lime-500">
            0
          </span>

        </div>

      </div>
    </div>
  );
}



