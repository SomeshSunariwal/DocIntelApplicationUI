import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
  Search,
  Maximize2,
  Minimize2,
  RefreshCcw,
} from "lucide-react";

export default function ViewerToolbar({
  page,
  actualPageCount,
  zoom,
  viewMode,
  fullscreen,
  searchOpen,
  viewerSearch,
  currentSearchText,
  searchMatchesLength,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  onZoomOut,
  onZoomIn,
  onResetZoom,
  onViewModeChange,
  onToggleFullscreen,
  onSearchOpen,
  onSearchChange,
  onSearchClose,
  onPreviousMatch,
  onNextMatch,
  onRefresh,
}) {
  return (
    <div className="flex min-h-[44px] shrink-0 items-center border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center border-r text-[12px] border-slate-100 px-3 dark:border-slate-800">
        <button
          onClick={onPreviousPage}
          disabled={page <= 1}
          className="disabled:opacity-30"
        >
          <ChevronLeft size={17} />
        </button>
        <button
          onClick={onGoToPage}
          className="mx-2 rounded bg-slate-100 px-2 py-1 dark:bg-slate-800"
        >
          {page}
        </button>
        <span className="">/ {actualPageCount}</span>
        <button
          onClick={onNextPage}
          disabled={page >= actualPageCount}
          className="ml-2 disabled:opacity-30"
        >
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="flex items-center text-[12px] gap-2 border-r border-slate-100 px-3 dark:border-slate-800">
        <button
          onClick={onZoomOut}
          disabled={zoom <= 50}
          className="disabled:opacity-30"
          title="Zoom out"
        >
          <Minus size={16} />
        </button>
        <span className="rounded bg-slate-100 px-3 py-1 dark:bg-slate-800">
          {zoom}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={zoom >= 200}
          className="disabled:opacity-30"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onResetZoom}
          disabled={zoom === 100}
          className="rounded px-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 dark:hover:text-slate-200"
          title="Reset zoom"
        >
          Reset
        </button>
      </div>
      <div className="border-r border-slate-100 px-3 dark:border-slate-800">
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium outline-none dark:border-slate-700 dark:bg-slate-900"
          aria-label="PDF page display mode"
        >
          <option value="all">All pages</option>
          <option value="page">Page by page</option>
        </select>
      </div>
      <button
        onClick={onToggleFullscreen}
        className="mx-3"
        title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      <div className="ml-auto mr-3 flex h-8 items-center justify-end gap-2 text-[11px] text-slate-500">
        <div
          className={`flex h-8 items-center overflow-hidden transition-[width,opacity] duration-200 ease-in-out ${searchOpen ? "w-[250px] max-w-[35vw] opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
        >
          <div className="flex h-8 w-[250px] max-w-[35vw] items-center gap-2 rounded border border-slate-200 px-2 dark:border-slate-700">
            <Search size={14} className="shrink-0" />
            <input
              autoFocus={searchOpen}
              value={viewerSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Search in document"
            />
            <button
              type="button"
              onClick={onSearchClose}
              className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Close search"
              aria-label="Close search"
            >
              <X size={14} />
            </button>
            <span className="shrink-0 text-[10px]">{currentSearchText}</span>
          </div>
        </div>
        {!searchOpen && (
          <button
            type="button"
            onClick={onSearchOpen}
            className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Search in document"
            aria-label="Search in document"
          >
            <Search size={15} />
          </button>
        )}
      </div>
      {searchMatchesLength > 1 && (
        <>
          <button
            onClick={onPreviousMatch}
            className="mr-1 text-slate-500"
            title="Previous match"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={onNextMatch}
            className="mr-2 text-slate-500"
            title="Next match"
          >
            <ChevronRight size={15} />
          </button>
        </>
      )}
      <button
        onClick={onRefresh}
        className="mr-3 text-slate-500"
        title="Refresh page"
      >
        <RefreshCcw size={15} />
      </button>
    </div>
  );
}
