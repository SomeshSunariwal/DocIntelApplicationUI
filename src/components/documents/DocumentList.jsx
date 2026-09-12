import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, Ellipsis, Filter, LoaderCircle, Search, TriangleAlert, ArrowUp, ArrowDown } from 'lucide-react';
import FileIcon from '../common/FileIcon';

export default function DocumentList({ documents, setDocuments, totalCount, selectedId, onSelect, onLoadMore }) {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const sortMenuRef = useRef(null);
  const loadingRef = useRef(false);
  const menuButtonRefs = useRef(new Map());
  const menuRef = useRef(null);

  const handleScroll = useCallback(async (event) => {
    const el = event.currentTarget;
    if (menu) setMenu(null);
    if (loadingRef.current || !hasMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > 96) return;
    if (el.scrollHeight <= el.clientHeight) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const added = await onLoadMore();
      if (!added) setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    const handlePointerDown = e => {
      if (menu) {
        const button = menuButtonRefs.current.get(menu.id);
        if (!button?.contains(e.target) && !menuRef.current?.contains(e.target)) {
          setMenu(null);
        }
      }
      if (sortOpen && !sortMenuRef.current?.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menu, sortOpen]);

  const shown = [...documents]
    .filter(d => d.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      let result = 0;

      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else if (sortBy === 'size') {
        const toBytes = value => {
          const match = String(value || '').match(/([\d.]+)\s*(KB|MB|GB)/i);
          if (!match) return 0;
          const n = Number(match[1]);
          const unit = match[2].toUpperCase();
          return unit === 'GB' ? n * 1024 * 1024 * 1024
            : unit === 'MB' ? n * 1024 * 1024
            : n * 1024;
        };
        result = toBytes(a.size) - toBytes(b.size);
      } else if (sortBy === 'date') {
        result = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }

      return sortDirection === 'desc' ? -result : result;
    });
  const retry = id => setDocuments(ds => ds.map(d => d.id === id ? { ...d, status: 'uploading', progress: 10 } : d));

  return (
    <section className="surface min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-[#111a2d] flex flex-col">
      <div className="flex shrink-0 items-center justify-between px-3.5 pt-3.5"><h2 className="text-[17px] font-bold">Your Documents <span className="font-medium text-slate-500">({totalCount})</span></h2><button className="rounded p-1"><ChevronUp size={17} /></button></div>
      <div className="flex shrink-0 gap-2 px-3.5 py-3"><div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 dark:border-slate-700"><Search size={16} className="shrink-0 text-slate-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your documents..." className="w-full min-w-0 bg-transparent text-[12px] outline-none placeholder:text-slate-400" /></div><div className="flex shrink-0 items-center gap-1">
        <div ref={sortMenuRef} className="relative">
          <button
            onClick={() => setSortOpen(v => !v)}
            className={`rounded-lg border px-2.5 py-2 ${sortBy ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700'}`}
            aria-label="Sort documents"
            aria-expanded={sortOpen}
          >
            <Filter size={17} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-11 z-50 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {[
                ['name', 'Sort by Name'],
                ['size', 'Sort by size'],
                ['date', 'Sort by Date']
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSortBy(current => current === value ? null : value);
                    setSortOpen(false);
                  }}
                  className={`w-full rounded px-2.5 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${sortBy === value ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setSortDirection(v => v === 'asc' ? 'desc' : 'asc')}
          disabled={!sortBy}
          className={`rounded-lg border px-2.5 py-2 ${sortBy ? 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800' : 'cursor-default border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'}`}
          aria-label={sortDirection === 'asc' ? 'Ascending order' : 'Descending order'}
          title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortDirection === 'asc' ? <ArrowUp size={17} /> : <ArrowDown size={17} />}
        </button>
      </div></div>
      <div onScroll={handleScroll} className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-1">
        {shown.map(d => <div key={d.id} onClick={() => d.status === 'completed' && onSelect(d.id, 1)} className={`relative flex min-h-[61px] items-center gap-3 border-b border-slate-100 px-2.5 dark:border-slate-800 ${d.status === 'completed' ? 'cursor-pointer' : ''} ${selectedId === d.id ? 'rounded-md bg-blue-50/90 dark:bg-blue-950/40' : ''}`}>
          {selectedId === d.id && <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-blue-600" />}
          <FileIcon type={d.type} />
          <div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-medium">{d.name}</div>{d.status === 'uploading' ? <><div className="mt-1 flex items-center gap-2 text-[11px] text-blue-600"><span>Uploading...</span><span>{d.progress}%</span></div><div className="mt-1 h-0.5 w-[105px] bg-slate-200 dark:bg-slate-700"><div className="h-full bg-blue-500" style={{ width: `${d.progress}%` }} /></div></> : d.status === 'processing' ? <><div className="mt-1 text-[11px] text-blue-600">Processing...</div><div className="mt-1 h-0.5 w-[105px] bg-slate-200 dark:bg-slate-700"><div className="h-full w-[45%] bg-blue-500" /></div></> : d.status === 'failed' ? <div className="mt-1 flex items-center gap-1 text-[11px] text-red-500"><span>Upload failed</span><span>•</span><button onClick={e => { e.stopPropagation(); retry(d.id); }} className="font-medium">Retry</button></div> : <div className="mt-1 text-[11px] text-slate-500">{d.size}<span className="mx-1.5">•</span>{d.date}</div>}</div>
          {d.status === 'completed' ? <div>
            <button
              onClick={e => {
                e.stopPropagation();
                if (menu?.id === d.id) {
                  setMenu(null);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const width = 144;
                const gap = 4;
                const left = Math.min(
                  Math.max(8, rect.right - width),
                  window.innerWidth - width - 8
                );
                const top = Math.min(
                  rect.bottom + gap,
                  window.innerHeight - 8
                );
                setMenu({ id: d.id, top, left });
              }}
              ref={node => { if (node) menuButtonRefs.current.set(d.id, node); else menuButtonRefs.current.delete(d.id); }}
              className="rounded p-1"
              aria-label="Document actions"
            >
              <Ellipsis size={18} />
            </button>
            {menu?.id === d.id && createPortal(
              <div
                ref={menuRef}
                className="fixed z-[100] w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                style={{ top: menu.top, left: menu.left }}
                onClick={e => e.stopPropagation()}
              >
                <MenuItem label="Open" onClick={() => { setMenu(null); onSelect(d.id, 1); }} />
                <MenuItem label="Rename" />
                <MenuItem label="Delete" danger />
              </div>,
              document.body
            )}
          </div> : d.status === 'failed' ? <button onClick={e => { e.stopPropagation(); retry(d.id); }} className="rounded-full"><TriangleAlert size={19} className="text-red-500" /></button> : <LoaderCircle size={20} className="animate-spin text-blue-500" />}
        </div>)}
        {loading && <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-slate-500"><LoaderCircle size={15} className="animate-spin text-blue-500" />Loading documents...</div>}
        {!hasMore && <div className="py-2 text-center text-[10px] text-slate-400">All documents loaded</div>}
      </div>
    </section>
  );
}
function MenuItem({ label, danger, onClick }) { return <button onClick={onClick} className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${danger ? 'text-red-500' : ''}`}>{label}</button>; }
