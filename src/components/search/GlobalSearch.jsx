import React, { useEffect, useRef, useState } from "react";
import { Search, FileText, Files, Heading, X } from "lucide-react";
import FileIcon from "../common/FileIcon";
import useDebounce from "../../hooks/useDebounce";
import { searchDocuments } from "../../services/api";

export default function GlobalSearch({ onResult }) {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [open, setOpen] = useState(true);

  const [category, setCategory] = useState("All Results");

  const [loading, setLoading] = useState(false);

  const ref = useRef();

  const debounced = useDebounce(query, 300);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (debounced.trim().length < 3) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      const r = await searchDocuments(debounced);
      if (active) {
        setResults(r);
        setOpen(true);
        setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [debounced]);

  const counts = {
    "All Results": 12,
    Documents: 8,
    Pages: 3,
    Headings: 5,
  };

  return (
    <div ref={ref} className="relative z-50">
      <div className="surface rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft dark:bg-[#111a2d]">
        <div className="flex gap-2">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-lg border border-blue-400 bg-white px-3 shadow-[0_0_0_2px_rgba(59,130,246,.06)] dark:bg-[#0d1627]">
            <Search size={22} className="text-blue-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setOpen(true)}
              className="w-full bg-transparent text-[16px] outline-none"
              placeholder="Search across your documents..."
            />
            <button
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
            >
              <X size={17} className="text-blue-600" />
            </button>
          </div>
          <button className="h-11 w-[112px] rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-[13px] font-semibold text-white">
            Search
          </button>
        </div>
      </div>
      {open && query.length >= 3 && (
        <div className="absolute left-0 right-0 top-[67px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111a2d]">
          <div className="flex max-h-[270px]">
            <aside className="w-[220px] shrink-0 border-r border-slate-100 p-2 dark:border-slate-800">
              {[
                ["All Results", Search],
                ["Documents", FileText],
                ["Pages", Files],
                ["Headings", Heading],
              ].map(([label, Icon]) => (
                <button
                  key={label}
                  onClick={() => setCategory(label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] ${category === label ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">
                    {counts[label]}
                  </span>
                </button>
              ))}
            </aside>
            <div className="thin-scroll min-w-0 flex-1 overflow-y-auto px-3">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader />
                </div>
              ) : results.length ? (
                results.map((r) => (
                  <button
                    key={r.documentId}
                    onClick={() => {
                      setOpen(false);
                      onResult(r.documentId, r.page);
                    }}
                    className="flex w-full items-center gap-3 border-b border-slate-100 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <FileIcon type={r.type} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] leading-5">
                        <Highlighted text={r.snippet} query={query} />
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {r.name}
                        <span className="mx-2">•</span>Page {r.page}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium ${r.match >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {r.match}% match
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Loader() {
  return (
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
  );
}
function Highlighted({ text, query }) {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return text.split(re).map((p, i) =>
    terms.some((t) => p.toLowerCase() === t.toLowerCase()) ? (
      <mark
        key={i}
        className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
      >
        {p}
      </mark>
    ) : (
      p
    ),
  );
}
