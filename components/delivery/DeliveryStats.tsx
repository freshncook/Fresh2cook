"use client";

type Props = {
  summary: any;
};

export default function DeliveryStats({
  summary,
}: Props) {
  const cards = [
    {
      title: "Total Riders",
      value:
        summary?.totalRiders || 0,
    },
    {
      title: "Online Riders",
      value:
        summary?.onlineRiders || 0,
    },
    {
      title: "Delivered",
      value:
        summary?.deliveredOrders ||
        0,
    },
    {
      title: "Revenue",
      value: `₹${
        summary?.totalRevenue ||
        0
      }`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-5 shadow"
        >
          <p className="text-gray-500 text-sm">
            {card.title}
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}



