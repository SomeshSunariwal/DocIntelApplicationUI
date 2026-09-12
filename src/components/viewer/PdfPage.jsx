import React, { useEffect, useRef, useState } from 'react';
import { TextLayer, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;


function highlightSearchTerm(layer, term, matchOffset = 0, currentMatch = -1) {
  const normalizedTerm = term.trim().toLocaleLowerCase();
  if (!layer || !normalizedTerm) return;

  const spans = Array.from(layer.querySelectorAll(':scope > span'));
  if (!spans.length) return;

  // Build a searchable string from the text-layer spans so a phrase can be
  // highlighted even when PDF.js split it into multiple text items.
  const parts = spans.map(span => span.textContent || '');
  const joined = parts.join(' ');
  const lowerJoined = joined.toLocaleLowerCase();
  const ranges = [];
  let from = 0;
  while (true) {
    const index = lowerJoined.indexOf(normalizedTerm, from);
    if (index === -1) break;
    ranges.push([index, index + normalizedTerm.length, matchOffset + ranges.length]);
    from = index + Math.max(1, normalizedTerm.length);
  }
  if (!ranges.length) return;

  let cursor = 0;
  spans.forEach(span => {
    const text = span.textContent || '';
    const start = cursor;
    const end = start + text.length;
    cursor = end + 1;

    const localRanges = ranges
      .map(([a, b, occurrence]) => [Math.max(a, start), Math.min(b, end), occurrence])
      .filter(([a, b]) => b > a)
      .map(([a, b, occurrence]) => [a - start, b - start, occurrence]);
    if (!localRanges.length) return;

    const node = span.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const fragment = document.createDocumentFragment();
    let position = 0;
    localRanges.forEach(([a, b, occurrence]) => {
      if (a > position) fragment.appendChild(document.createTextNode(text.slice(position, a)));
      const mark = document.createElement('mark');
      mark.className = `pdf-search-highlight ${occurrence === currentMatch ? 'pdf-search-highlight-current' : ''}`;
      mark.setAttribute('data-search-match', String(occurrence));
      mark.textContent = text.slice(a, b);
      fragment.appendChild(mark);
      position = b;
    });
    if (position < text.length) fragment.appendChild(document.createTextNode(text.slice(position)));
    span.replaceChildren(fragment);
  });
}

export default function PdfPage({ pdf, pageNumber, scale = 1, thumbnail = false, render = true, searchTerm = '', searchMatchOffset = 0, currentSearchMatch = -1 }) {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const textTaskRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cleanupTasks = () => {
      try { renderTaskRef.current?.cancel?.(); } catch {}
      try { textTaskRef.current?.cancel?.(); } catch {}
      renderTaskRef.current = null;
      textTaskRef.current = null;
    };

    async function paint() {
      if (!pdf || !canvasRef.current || !render) return;

      cleanupTasks();
      setError(false);

      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const targetScale = thumbnail
          ? Math.min(0.22, 86 / baseViewport.width)
          : Math.max(0.5, scale);
        const viewport = page.getViewport({ scale: targetScale });

        const canvas = canvasRef.current;
        const ratio = thumbnail ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * ratio);
        canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        renderTaskRef.current = page.render({ canvasContext: ctx, viewport });
        await renderTaskRef.current.promise;
        if (cancelled || thumbnail) return;

        const layer = textLayerRef.current;
        if (!layer) return;
        layer.innerHTML = '';
        layer.style.width = `${viewport.width}px`;
        layer.style.height = `${viewport.height}px`;
        layer.style.setProperty('--scale-factor', String(viewport.scale));
        layer.style.setProperty('--total-scale-factor', String(viewport.scale));

        const textContent = await page.getTextContent();
        if (cancelled) return;

        textTaskRef.current = new TextLayer({
          container: layer,
          textContentSource: textContent,
          viewport,
        });
        await textTaskRef.current.render();
        if (!cancelled && searchTerm.trim()) highlightSearchTerm(layer, searchTerm, searchMatchOffset, currentSearchMatch);
      } catch (e) {
        if (!cancelled && e?.name !== 'RenderingCancelledException') setError(true);
      }
    }

    paint();
    return () => {
      cancelled = true;
      cleanupTasks();
      if (textLayerRef.current) textLayerRef.current.innerHTML = '';
    };
  }, [pdf, pageNumber, scale, thumbnail, render, searchTerm, searchMatchOffset, currentSearchMatch]);

  if (!render) return null;
  if (error) return <div className="flex min-h-[120px] items-center justify-center text-xs text-red-500">Unable to render page.</div>;

  return (
    <div className="relative bg-white" style={{ width: 'fit-content', height: 'fit-content' }}>
      <canvas ref={canvasRef} className="block bg-white" />
      {!thumbnail && (
        <div ref={textLayerRef} className="textLayer pdf-text-layer absolute left-0 top-0 select-text" />
      )}
    </div>
  );
}
