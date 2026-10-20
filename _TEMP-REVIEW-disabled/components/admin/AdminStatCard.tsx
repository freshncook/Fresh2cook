export default function AdminStatCard({
  title,
  value,
  color = "text-emerald-600",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-slate-500">
        {title}
      </p>

      <h2
        className={`text-4xl font-bold mt-2 ${color}`}
      >
        {value}
      </h2>
    </div>
  );
}


