"use client";

type PrintBillButtonProps = {
  orderId: number;
  directPrint?: boolean;
};

export default function PrintBillButton({
  orderId,
  directPrint = false,
}: PrintBillButtonProps) {
  function handleClick() {
    if (directPrint) {
      window.print();
      return;
    }

    window.open(
      `/processing/print-bill/${orderId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
    >
       Print Bill A5
    </button>
  );
}




