import React from "react";
import { Database } from "lucide-react";
export default function TotalDocuments({ count, size }) {
  return (
    <div className="surface flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-soft dark:bg-[#111a2d]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60">
        <Database size={21} />
      </div>
      <div>
        <div className="text-[12px] text-slate-500">
          Total Uploaded Documents
        </div>
        <div className="text-[16px] font-bold text-blue-700 dark:text-blue-300">
          {count} files <span className="mx-1 text-slate-400">•</span> {size}
        </div>
      </div>
    </div>
  );
}
