import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, FileText, Files, Heading, X, Sparkles } from "lucide-react";
import FileIcon from "../common/FileIcon";
import useDebounce from "../../hooks/useDebounce";
import { useDispatch, useSelector } from "react-redux";
import { segmentedSearchAction } from "../apis/actions/segmentedSearchAction";
import { aiSearchAction } from "../apis/actions/aiSearchAction";

export default function GlobalSearch({ onResult }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(true);
  const [category, setCategory] = useState("All Results");
  const [generatedRequested, setGeneratedRequested] = useState(false);

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const {
    data: searchResponse,
    loading: searchLoading,
    error: searchError,
  } = useSelector((state) => state.rootReducer.segmentedSearch);
  const {
    data: aiResponse,
    loading: aiLoading,
    error: aiError,
  } = useSelector((state) => state.rootReducer.aiSearch);

  const ref = useRef();

  const debounced = useDebounce(query, 500);
  useEffect(() => {
    if (debounced.trim().length < 3) {
      setLoading(false);
      setResults([]);
      setOpen(false);
      return;
    }
    setResults([]);
    setLoading(true);
    setOpen(true);
    dispatch(segmentedSearchAction(debounced.trim()));
    setCategory("All Results");
  }, [debounced, dispatch]);

  useEffect(() => {
    if (!searchResponse) return;
    const segments = Array.isArray(searchResponse)
      ? searchResponse
      : searchResponse.textSegmentResponseDTOList || [];
    const mapped = segments.map((segment, index) => ({
      id: `${segment.documentId}-${segment.pageNumber}-${segment.lineNumber}-${index}`,
      documentId: segment.documentId,
      name: segment.fileName || "Untitled document",
      type: segment.fileName?.split(".").pop()?.toLowerCase() || "txt",
      snippet: segment.text || "",
      page: Number(segment.pageNumber) || 1,
      match:
        Number.parseFloat(String(segment.score || "0").replace("%", "")) || 0,
    }));
    setResults(mapped.sort((a, b) => b.match - a.match));
    setLoading(false);
    setOpen(true);
  }, [searchResponse]);

  useEffect(() => {
    setLoading(searchLoading);
  }, [searchLoading]);

  useEffect(() => {
    if (!searchError) return;
    setResults([]);
    setLoading(false);
  }, [searchError]);

  const submitSearch = () => {
    if (query.trim().length < 3) return;
    setLoading(true);
    setOpen(true);
    dispatch(segmentedSearchAction(query.trim()));
    dispatch(aiSearchAction(query.trim()));
    setGeneratedRequested(true);
    setCategory("All Results");
  };

  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => {
      if (category === "PDFs") return result.type === "pdf";
      if (category === "DOCx") return ["doc", "docx"].includes(result.type);
      if (category === "TXT") return result.type === "txt";
      return true;
    });
    return filtered.sort((a, b) => b.match - a.match);
  }, [category, results]);

  const counts = useMemo(
    () => ({
      "All Results": results.length,
      PDFs: results.filter((result) => result.type === "pdf").length,
      DOCx: results.filter((result) => ["doc", "docx"].includes(result.type))
        .length,
      TXT: results.filter((result) => result.type === "txt").length,
    }),
    [results],
  );

  const categories = [
    ["All Results", Search, true],
    ["PDFs", FileText, true],
    ["DOCx", Files, counts.DOCx > 0],
    ["TXT", Heading, counts.TXT > 0],
  ].filter(([, , visible]) => visible);

  const generatedReady =
    generatedRequested &&
    !aiLoading &&
    typeof aiResponse?.result === "string" &&
    Boolean(aiResponse.result.trim());

  return (
    <div ref={ref} className="relative z-50">
      <div className="surface rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft dark:bg-[#111a2d]">
        <div className="flex gap-2">
          <div className="flex h-11 text-[12px] flex-1 items-center gap-3 rounded-lg border border-blue-400 bg-white px-3 shadow-[0_0_0_2px_rgba(59,130,246,.06)] dark:bg-[#0d1627]">
            <Search size={22} className="text-blue-600" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setGeneratedRequested(false);
                setCategory("All Results");
              }}
              onFocus={() => query.trim().length >= 3 && setOpen(true)}
              className="w-full bg-transparent  outline-none"
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
          <button
            onClick={submitSearch}
            className="h-11 w-[112px] rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-[13px] font-semibold text-white"
          >
            Search
          </button>
        </div>
      </div>
      {open && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-[67px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111a2d]">
          <div className="flex max-h-[270px]">
            <aside className="w-[220px] shrink-0 border-r text-[12px] border-slate-100 p-2 dark:border-slate-800">
              {categories.map(([label, Icon]) => (
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
              {generatedRequested && (
                <button
                  onClick={() => setCategory("Generated")}
                  disabled={!generatedReady}
                  className={`mt-2 flex w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 py-3 text-left text-[13px] dark:border-slate-800 ${category === "Generated" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"} ${generatedReady ? "hover:bg-slate-50 dark:hover:bg-slate-800" : "cursor-wait opacity-70"}`}
                >
                  <Sparkles size={18} />
                  <span className={aiLoading ? "animate-[generated-text-shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,#8b5cf6_0%,#ffffff_45%,#8b5cf6_100%)] bg-[length:200%_100%] bg-clip-text text-transparent" : ""}>
                    Generated
                  </span>
                </button>
              )}
            </aside>
            <div className="thin-scroll min-w-0 flex-1 overflow-y-auto px-3">
              {category === "Generated" ? (
                aiLoading ? (
                  <div className="flex h-40 items-center justify-center"><Loader /></div>
                ) : aiError ? (
                  <div className="p-8 text-center text-sm text-red-500">{aiError}</div>
                ) : (
                  <div className="m-4 whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <strong>Response:</strong> {aiResponse?.result}
                  </div>
                )
              ) : loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader />
                </div>
              ) : searchError ? (
                <div className="p-8 text-center text-sm text-red-500">
                  {searchError}
                </div>
              ) : visibleResults.length ? (
                visibleResults.map((r) => (
                  <button
                    key={r.id}
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
                      {r.match.toFixed(2)}% match
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
