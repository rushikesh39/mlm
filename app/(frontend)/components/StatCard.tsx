import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-5 rounded-2xl shadow-md bg-white border-t-4 ${color || "border-blue-500"}`}
    >
      <div>
        <h4 className="text-gray-500 text-sm">{title}</h4>
        <h2 className="text-2xl font-semibold text-gray-800">{value}</h2>
      </div>
      <div className="p-3 bg-blue-100 rounded-full text-blue-700">{icon}</div>
    </div>
  );
}
