import { ReactNode } from "react";

export default function AdminTable({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}



