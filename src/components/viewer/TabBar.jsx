import React from "react";

export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex h-8 shrink-0 items-end gap-7 border-b border-slate-100 px-4 text-[12px] dark:border-slate-800">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTabChange(t)}
          className={`h-6 whitespace-nowrap ${activeTab === t ? "border-b-2 border-blue-600 font-semibold text-blue-600" : "text-slate-500"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
