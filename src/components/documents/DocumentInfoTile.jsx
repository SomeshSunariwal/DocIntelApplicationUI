export default function DocumentInfoTile({
  label,
  value,
  className = "",
  noWrap = false,
}) {
  const displayValue =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div className={`min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-[#606060] dark:bg-[#383838] ${className}`}>
      <div className="border-b border-slate-300 px-3.5 py-2.5 text-center text-xs font-semibold text-slate-600 dark:border-[#606060] dark:text-slate-300">
        {label}
      </div>
      <div
        className={`flex min-h-14 max-h-20 items-center justify-center px-3.5 py-3 text-center text-sm text-slate-900 dark:text-slate-100 ${noWrap ? "whitespace-nowrap" : "overflow-auto break-words"}`}
        title={displayValue}
      >
        {displayValue}
      </div>
    </div>
  );
}
