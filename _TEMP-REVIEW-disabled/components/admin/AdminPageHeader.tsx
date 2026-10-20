export default function AdminPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-xl shadow-xl p-8 mb-6">
      <h1 className="text-4xl font-bold text-slate-800">
        {title}
      </h1>

      {subtitle && (
        <p className="text-slate-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}


