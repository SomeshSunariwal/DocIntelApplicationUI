import React from "react";
import PdfPage from "./PdfPage";

export default function ThumbnailRail({
  doc,
  pdf,
  page,
  actualPageCount,
  documentPages,
  thumbnailRailRef,
  thumbnailContentRef,
  thumbnailSelectionRef,
  thumbnailRefs,
  onGoToPage,
}) {
  const pages = Array.from({ length: actualPageCount }, (_, i) => i + 1);
  return (
    <aside
      ref={thumbnailRailRef}
      className="thin-scroll w-[112px] shrink-0 overflow-y-auto bg-slate-50 p-2 dark:bg-slate-900"
    >
      <div ref={thumbnailContentRef} className="relative">
        <div
          ref={thumbnailSelectionRef}
          className="pointer-events-none absolute left-0 top-0 z-20 box-border rounded border-2 border-blue-500 opacity-0 transition-transform duration-200 ease-out"
        />
        {pdf &&
          pages.map((p) => (
            <button
              key={p}
              ref={(node) => {
                if (node) thumbnailRefs.current.set(p, node);
                else thumbnailRefs.current.delete(p);
              }}
              onClick={() => onGoToPage(p)}
              className="mb-3 block w-full"
            >
              <div
                data-thumbnail-box
                className="mx-auto flex h-[113px] w-[72px] items-center justify-center overflow-hidden rounded border border-slate-200 bg-white"
              >
                <PdfPage pdf={pdf} pageNumber={p} thumbnail render={true} />
              </div>
              <div
                className={`mt-1 text-center text-[10px] ${page === p ? "text-blue-600" : ""}`}
              >
                {p}
              </div>
            </button>
          ))}
        {doc.type === "txt" &&
          pages.map((p) => (
            <button
              key={p}
              ref={(node) => {
                if (node) thumbnailRefs.current.set(p, node);
                else thumbnailRefs.current.delete(p);
              }}
              onClick={() => onGoToPage(p)}
              className="mb-3 block w-full"
            >
              <div
                data-thumbnail-box
                className="mx-auto h-[113px] w-[72px] overflow-hidden rounded border border-slate-200 bg-white p-1 text-left text-[8px] leading-3 text-slate-500"
              >
                {String(documentPages[p - 1] || "").slice(0, 360)}
              </div>
              <div
                className={`mt-1 text-center text-[10px] ${page === p ? "text-blue-600" : ""}`}
              >
                {p}
              </div>
            </button>
          ))}
        {(doc.type === "docx" ||
          doc.type === "docs" ||
          /\.(docx|docs)$/i.test(doc.name || "")) &&
          pages.map((p) => (
            <button
              key={p}
              ref={(node) => {
                if (node) thumbnailRefs.current.set(p, node);
                else thumbnailRefs.current.delete(p);
              }}
              onClick={() => onGoToPage(p)}
              className="mb-3 block w-full"
            >
              <div
                data-thumbnail-box
                className="mx-auto flex h-[113px] w-[72px] items-center justify-center overflow-hidden rounded border border-slate-200 bg-white text-[9px] font-medium text-slate-500"
              >
                <div className="px-1 text-center leading-3">
                  A4
                  <br />
                  Page {p}
                </div>
              </div>
              <div
                className={`mt-1 text-center text-[10px] ${page === p ? "text-blue-600" : ""}`}
              >
                {p}
              </div>
            </button>
          ))}
      </div>
    </aside>
  );
}
