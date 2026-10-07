import { Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DocumentInfoTile from "./DocumentInfoTile";

export default function DocumentDetailsModal({ document, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsVisible(false);
    closeTimerRef.current = window.setTimeout(onClose, 240);
  };

  const formatTimestamp = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${date.getDate()} ${date.toLocaleDateString(undefined, { month: "long" })} ${date.getFullYear()} ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })}`;
  };

  const details = [
    ["Document Id", document.documentId || document.id],
    ["Version", document.version],
    ["Chunks", document.chunks],
    ["FileName", document.fileName || document.name],
    ["Size", document.size],
    ["Type", document.fileExtensions || document.type],
    ["Created At", formatTimestamp(document.createdAt)],
    ["Updated At", formatTimestamp(document.updatedAt)],
  ];

  return createPortal(
    <div
      data-state={isVisible ? "open" : "closed"}
      className="document-details-backdrop fixed inset-0 z-[10001] flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-details-title"
        data-state={isVisible ? "open" : "closed"}
        className="document-details-panel w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#414141] dark:bg-[#303030] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="document-details-title" className="text-lg font-semibold">
            Document details
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close document details"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#383838]"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="grid grid-cols-3 gap-3"
          style={{
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)",
          }}
        >
          {details.slice(0, 6).map(([label, value]) => (
            <DocumentInfoTile
              key={label}
              label={label}
              value={value}
              noWrap={label === "Document Id"}
            />
          ))}
          {details.slice(6).map(([label, value]) => (
            <DocumentInfoTile key={label} label={label} value={value} />
          ))}
          <div className="min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-[#606060] dark:bg-[#383838]">
            <div className="border-b border-slate-300 px-3.5 py-2.5 text-center text-xs font-semibold text-slate-600 dark:border-[#606060] dark:text-slate-300">
              Download
            </div>
            <div className="flex  min-h-14 items-center justify-center p-2">
              <a
                href={document.URI || document.url || undefined}
                target="_blank"
                rel="noreferrer"
                download={document.fileName || document.name}
                aria-disabled={!document.URI && !document.url}
                className={`text-[12px] document-download-button inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${!document.URI && !document.url ? "document-download-disabled" : ""}`}
              >
                <Download size={16} />
                Download
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>,
    globalThis.document.body,
  );
}
