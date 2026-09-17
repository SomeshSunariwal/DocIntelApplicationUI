import React from "react";
import PdfPage from "./PdfPage";

export default function DocumentPages({
  doc,
  pdf,
  pdfError,
  page,
  zoom,
  viewMode,
  pageElements,
  pageSizes,
  renderedPages,
  viewerSearchActive,
  viewerSearch,
  searchMatches,
  searchIndex,
  refreshKey,
  onRetry,
  documentPages,
  pdfScrollRef,
  pageRefs,
  wordViewerRef,
  highlightPlainText,
}) {
  return (
    <div
      ref={pdfScrollRef}
      className="thin-scroll min-w-0 flex-1 overflow-auto bg-slate-100 p-4 sm:p-6 dark:bg-slate-950"
    >
      <div className="mx-auto flex min-w-0 flex-col items-center gap-5 py-1">
        {doc.type === "pdf" &&
          pdf &&
          (viewMode === "page" ? [page] : pageElements).map((p) => {
            const size = pageSizes[p - 1];
            const width = size ? size.width * (zoom / 100) : 720 * (zoom / 100);
            const height = size
              ? size.height * (zoom / 100)
              : 930 * (zoom / 100);
            const shouldRender =
              viewMode === "page" || viewerSearchActive || renderedPages.has(p);
            return (
              <div
                key={p}
                ref={(node) => {
                  if (node) pageRefs.current.set(p, node);
                  else pageRefs.current.delete(p);
                }}
                data-page={p}
                className="pdf-paper relative shrink-0 overflow-hidden shadow-sm"
                style={{ width, minHeight: height }}
              >
                {shouldRender ? (
                  <PdfPage
                    key={`${p}-${refreshKey}`}
                    pdf={pdf}
                    pageNumber={p}
                    scale={zoom / 100}
                    render
                    searchTerm={viewerSearchActive ? viewerSearch : ""}
                    searchMatchOffset={
                      viewerSearchActive
                        ? searchMatches.filter((m) => m.page < p).length
                        : 0
                    }
                    currentSearchMatch={viewerSearchActive ? searchIndex : -1}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-300">
                    Page {p}
                  </div>
                )}
              </div>
            );
          })}
        {doc.type === "pdf" && !pdf && !pdfError && (
          <div className="flex h-[520px] w-[720px] max-w-full items-center justify-center rounded bg-white text-sm text-slate-500 shadow-sm">
            Loading PDF…
          </div>
        )}
        {doc.type === "pdf" && pdfError && (
          <div className="flex h-[520px] w-[720px] max-w-full flex-col items-center justify-center rounded bg-white text-sm text-red-500 shadow-sm">
            <div>Unable to load the PDF.</div>
            <button
              onClick={onRetry}
              className="mt-3 rounded border px-3 py-1 text-xs text-slate-600"
            >
              Retry
            </button>
          </div>
        )}
        {doc.type === "txt" &&
          (viewMode === "page"
            ? [page]
            : documentPages.map((_, i) => i + 1)
          ).map((p) => {
            const content = documentPages[p - 1] || "";
            const scaledWidth = 595 * (zoom / 100);
            const scaledHeight = 842 * (zoom / 100);
            return (
              <div
                key={`${doc.id}-${p}`}
                ref={(node) => {
                  if (node) pageRefs.current.set(p, node);
                  else pageRefs.current.delete(p);
                }}
                data-page={p}
                className="pdf-paper relative shrink-0 overflow-hidden shadow-sm"
                style={{ width: scaledWidth, minHeight: scaledHeight }}
              >
                <div
                  className="txt-page-content doc-page-content absolute left-0 top-0 min-h-[842px] w-[595px] overflow-hidden text-[15px] leading-7"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                  }}
                >
                  <pre className="m-0 whitespace-pre-wrap break-words font-sans text-[15px] leading-7">
                    {highlightPlainText(
                      content,
                      viewerSearch,
                      documentPages
                        .slice(0, p - 1)
                        .reduce((total, pageText) => {
                          const needle = viewerSearch.toLocaleLowerCase();
                          if (!needle) return total;
                          const lower = (pageText || "").toLocaleLowerCase();
                          let count = 0;
                          let at = lower.indexOf(needle);
                          while (at !== -1) {
                            count += 1;
                            at = lower.indexOf(
                              needle,
                              at + Math.max(1, needle.length),
                            );
                          }
                          return total + count;
                        }, 0),
                      searchIndex,
                    )}
                  </pre>
                </div>
              </div>
            );
          })}
        {(doc.type === "docx" ||
          doc.type === "docs" ||
          /\.(docx|docs)$/i.test(doc.name || "")) && (
          <div className="word-document-shell shrink-0" ref={wordViewerRef} />
        )}
      </div>
    </div>
  );
}
