import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Download, Link, MoreVertical } from "lucide-react";
import FileIcon from "../common/FileIcon";
import { PromptInputBasic } from "../chat/PromptInputBasic";
import { getDocument } from "pdfjs-dist";
import mammoth from "mammoth/mammoth.browser";
import {
  buildDocumentPages,
  highlightPlainText,
  highlightHtml,
  isWordDocument,
  MIN_ZOOM,
  MAX_ZOOM,
} from "./documentViewerUtils";
import ViewerToolbar from "./ViewerToolbar";
import ThumbnailRail from "./ThumbnailRail";
import DocumentPages from "./DocumentPages";
import TabBar from "./TabBar";

export default function DocumentViewer({ doc, jumpPage, onClose }) {
  const [tab, setTab] = useState("Chat");
  const [page, setPage] = useState(jumpPage || 1);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState("all");
  const [menu, setMenu] = useState(false);
  const [viewerSearch, setViewerSearch] = useState("");
  const [viewerSearchActive, setViewerSearchActive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewerText, setViewerText] = useState("");
  const [viewerHtml, setViewerHtml] = useState("");
  const [viewerWordBuffer, setViewerWordBuffer] = useState(null);
  const [wordPageCount, setWordPageCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [pdf, setPdf] = useState(null);
  const [pdfError, setPdfError] = useState(false);
  const [pageSizes, setPageSizes] = useState([]);
  const [renderedPages, setRenderedPages] = useState(() => new Set());
  const [searchMatches, setSearchMatches] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const viewerRef = useRef(null);
  const pdfScrollRef = useRef(null);
  const wordViewerRef = useRef(null);
  const pageRefs = useRef(new Map());
  const observerRef = useRef(null);
  const zoomingRef = useRef(false);
  const zoomAnchorRef = useRef({ page: 1, ratio: 0 });
  const thumbnailRefs = useRef(new Map());
  const thumbnailRailRef = useRef(null);
  const thumbnailContentRef = useRef(null);
  const thumbnailSelectionRef = useRef(null);
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTargetRef = useRef(null);
  const programmaticScrollTimerRef = useRef(null);
  const viewerMenuButtonRef = useRef(null);
  const viewerMenuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;

    const handleOutsidePointerDown = (event) => {
      const target = event.target;
      if (viewerMenuButtonRef.current?.contains(target)) return;
      if (viewerMenuRef.current?.contains(target)) return;
      setMenu(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [menu]);

  const documentPages = useMemo(
    () =>
      buildDocumentPages(doc?.type, viewerText, viewerHtml, doc?.pages || 1),
    [doc?.type, doc?.pages, viewerText, viewerHtml],
  );
  const actualPageCount =
    pdf?.numPages ||
    (isWordDocument(doc) ? wordPageCount : documentPages.length) ||
    1;

  useEffect(() => {
    if (tab !== "Viewer") return;

    const rail = thumbnailRailRef.current;
    const content = thumbnailContentRef.current;
    const selection = thumbnailSelectionRef.current;
    if (!rail || !content || !selection || !page) return;

    let frame = 0;
    let resizeObserver = null;

    const updateSelection = () => {
      const thumb = thumbnailRefs.current.get(page);
      if (!thumb) return;

      const box = thumb.querySelector("[data-thumbnail-box]");
      if (!box) return;

      // Center the selected thumbnail when possible, clamped naturally at
      // the first and last pages.
      const railRect = rail.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const thumbTopInRail = thumbRect.top - railRect.top + rail.scrollTop;
      const maxScroll = Math.max(0, rail.scrollHeight - rail.clientHeight);
      const targetScroll = Math.max(
        0,
        Math.min(
          maxScroll,
          thumbTopInRail - (rail.clientHeight - thumbRect.height) / 2,
        ),
      );

      if (Math.abs(rail.scrollTop - targetScroll) > 1) {
        rail.scrollTo({ top: targetScroll, behavior: "smooth" });
      }

      // Measure AFTER the rail has been positioned. PDF thumbnails can finish
      // rendering after the initial React effect, so also re-run when the
      // thumbnail size changes.
      const contentRect = content.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();

      selection.style.width = `${boxRect.width}px`;
      selection.style.height = `${boxRect.height}px`;
      selection.style.transform = `translate3d(${boxRect.left - contentRect.left}px, ${boxRect.top - contentRect.top}px, 0)`;
      selection.style.opacity = "1";
    };

    // Run after the thumbnail DOM has painted and again on the next frame.
    frame = requestAnimationFrame(() => {
      updateSelection();
      requestAnimationFrame(updateSelection);
    });

    if (typeof ResizeObserver !== "undefined") {
      const thumb = thumbnailRefs.current.get(page);
      const box = thumb?.querySelector("[data-thumbnail-box]");
      if (box) {
        resizeObserver = new ResizeObserver(() => updateSelection());
        resizeObserver.observe(box);
      }
      resizeObserver?.observe(rail);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
    };
  }, [tab, page, actualPageCount, doc?.type]);

  useEffect(() => {
    if (tab !== "Viewer") return;
    if (!pdf || !jumpPage || viewMode !== "all") return;
    const timer = setTimeout(() => {
      const node = pageRefs.current.get(
        Math.max(1, Math.min(actualPageCount, jumpPage)),
      );
      node?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [pdf, jumpPage, actualPageCount, viewMode]);

  useEffect(() => {
    setPage(
      Math.max(1, Math.min(jumpPage || 1, pdf?.numPages || doc?.pages || 1)),
    );
  }, [tab, jumpPage, doc?.pages, pdf?.numPages]);

  useEffect(() => {
    setPage(jumpPage || 1);
    setTab("Chat");
    setMenu(false);
    setZoom(100);
    setViewMode("all");
    zoomingRef.current = false;
    programmaticScrollRef.current = false;
    programmaticScrollTargetRef.current = null;
    if (programmaticScrollTimerRef.current)
      clearTimeout(programmaticScrollTimerRef.current);
    programmaticScrollTimerRef.current = null;
    zoomAnchorRef.current = { page: jumpPage || 1, ratio: 0 };
    thumbnailRefs.current.clear();
    setSearchMatches([]);
    setSearchIndex(0);
    setViewerSearchActive(false);
    setRenderedPages(new Set());
    setPageSizes([]);
    setRefreshKey(0);
  }, [doc?.id]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask;

    async function loadPdf() {
      setPdf(null);
      setPdfError(false);
      if (!doc?.url || doc.type !== "pdf") return;

      try {
        loadingTask = getDocument({ url: doc.url });
        const loaded = await loadingTask.promise;
        if (cancelled) return;
        setPdf(loaded);

        // Read page dimensions once. This lets the viewer reserve the exact
        // space for every page while only rendering pages near the viewport.
        const sizes = await Promise.all(
          Array.from({ length: loaded.numPages }, async (_, index) => {
            const p = await loaded.getPage(index + 1);
            const viewport = p.getViewport({ scale: 1 });
            return { width: viewport.width, height: viewport.height };
          }),
        );
        if (!cancelled) {
          setPageSizes(sizes);
          const first = Math.max(1, Math.min(jumpPage || 1, loaded.numPages));
          setRenderedPages(
            new Set(
              [first, first - 1, first + 1].filter(
                (n) => n >= 1 && n <= loaded.numPages,
              ),
            ),
          );
        }
      } catch {
        if (!cancelled) setPdfError(true);
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy?.();
      } catch {}
    };
  }, [doc?.id, doc?.url, doc?.type]);

  useEffect(() => {
    const onFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  // While a thumbnail/page jump is smoothly moving the main viewport, keep
  // the explicitly selected page locked. Release the lock only after the
  // destination page reaches the top of the viewport (or at the fallback
  // timeout above). This prevents the observer from selecting intermediate
  // pages during a long smooth scroll.
  useEffect(() => {
    const root = pdfScrollRef.current;
    if (!root) return;

    const handleProgrammaticScroll = () => {
      if (!programmaticScrollRef.current) return;
      const target = programmaticScrollTargetRef.current;
      if (!target) return;

      const node = pageRefs.current.get(target);
      if (!node) return;

      const rootRect = root.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const distanceToTarget = Math.abs(nodeRect.top - rootRect.top - 4);

      if (distanceToTarget <= 3) {
        requestAnimationFrame(() => {
          if (programmaticScrollTargetRef.current !== target) return;
          programmaticScrollRef.current = false;
          programmaticScrollTargetRef.current = null;
          if (programmaticScrollTimerRef.current) {
            clearTimeout(programmaticScrollTimerRef.current);
            programmaticScrollTimerRef.current = null;
          }
          setPage(target);
        });
      }
    };

    root.addEventListener("scroll", handleProgrammaticScroll, {
      passive: true,
    });
    return () => root.removeEventListener("scroll", handleProgrammaticScroll);
  }, [tab, pdf, pageSizes.length, actualPageCount]);

  // Observe page wrappers twice: one observer pre-renders nearby pages, while
  // the second tracks the page that is actually visible. This prevents the
  // active page number from jumping ahead because of the preload margin.
  useEffect(() => {
    if (tab !== "Viewer") return;

    const root = pdfScrollRef.current;
    if (!root || (!pdf && doc?.type !== "txt" && !isWordDocument(doc))) return;

    observerRef.current?.disconnect?.();
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        setRenderedPages((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const n = Number(entry.target.dataset.page);
            if (!n) return;
            next.add(n);
            if (n > 1) next.add(n - 1);
            if (n < actualPageCount) next.add(n + 1);
          });
          return next;
        });
      },
      { root, rootMargin: "700px 0px", threshold: 0.01 },
    );

    const activeObserver = new IntersectionObserver(
      () => {
        // Normal page selection is handled exclusively by the document
        // scroll synchronizer below. Do not call setPage() here: an
        // IntersectionObserver threshold can temporarily prefer the previous
        // page while the viewport is crossing a page boundary, causing the
        // selected thumbnail to flicker.
      },
      { root, threshold: [0.35, 0.6, 0.85] },
    );

    pageRefs.current.forEach((node) => {
      if (pdf) preloadObserver.observe(node);
      activeObserver.observe(node);
    });

    observerRef.current = {
      disconnect: () => {
        preloadObserver.disconnect();
        activeObserver.disconnect();
      },
    };

    return () => {
      preloadObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [tab, pdf, pageSizes.length, actualPageCount, viewMode]);

  // Keep the exact viewport location when zoom changes in All Pages.
  useEffect(() => {
    if (tab !== "Viewer") return;
    if (!pdf || viewMode !== "all" || !zoomingRef.current) return;
    const anchor = zoomAnchorRef.current;
    const target = Math.max(1, Math.min(actualPageCount, anchor.page));
    const frame = requestAnimationFrame(() => {
      const root = pdfScrollRef.current;
      const node = pageRefs.current.get(target);
      if (!root || !node) return;

      const rootRect = root.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const newPageTop = nodeRect.top - rootRect.top + root.scrollTop;
      const scaleFactor = (zoom || 100) / Math.max(1, anchor.oldZoom || 100);
      const newOffsetInPage = (anchor.offsetInPage || 0) * scaleFactor;

      root.scrollTop = Math.max(0, newPageTop + newOffsetInPage);
      setPage(target);

      // Give the observer one frame to settle, but never let it replace the
      // page selected before the zoom operation.
      requestAnimationFrame(() => {
        setPage(target);
        zoomingRef.current = false;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [tab, zoom, pdf, viewMode, actualPageCount]);

  // One-way document -> thumbnail synchronization.
  // The active page is determined by the viewer's vertical midpoint. A page
  // changes only when that midpoint crosses its boundary, so the thumbnail
  // centering operation can never make the active page jump back temporarily.
  useEffect(() => {
    if (tab !== "Viewer") return;

    const root = pdfScrollRef.current;
    if (!root) return;

    let frame = 0;
    let lastPage = null;

    const syncFromDocumentScroll = () => {
      if (programmaticScrollRef.current || viewMode !== "all") return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rootRect = root.getBoundingClientRect();
        const centerY = rootRect.top + rootRect.height / 2;

        let active = null;

        pageRefs.current.forEach((node, n) => {
          const rect = node.getBoundingClientRect();
          if (rect.top <= centerY && rect.bottom > centerY) {
            active = n;
          }
        });

        if (!active || active === lastPage) return;
        lastPage = active;

        // This is the single source of truth for the selected page while the
        // user scrolls the document. The thumbnail rail never feeds back
        // into this calculation.
        setPage(active);

        // Keep the selected thumbnail centered, but ONLY move the thumbnail
        // rail. Never call scrollIntoView(), which can participate in nested
        // scrolling/layout updates during a page transition.
        const thumb = thumbnailRefs.current.get(active);
        if (!thumb) return;

        const rail =
          thumb.closest("[data-page-scroller]") || thumb.parentElement;
        if (!rail) return;

        const railRect = rail.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        const thumbCenter = (thumbRect.top + thumbRect.bottom) / 2;
        const railCenter = (railRect.top + railRect.bottom) / 2;

        // Only adjust when the selected thumbnail is materially outside the
        // center zone. This prevents repeated scrollTop writes while crossing
        // from one page to the next.
        if (
          Math.abs(thumbCenter - railCenter) >
          Math.max(4, railRect.height * 0.08)
        ) {
          const desired =
            thumb.offsetTop - (rail.clientHeight - thumb.offsetHeight) / 2;
          rail.scrollTop = Math.max(0, desired);
        }
      });
    };

    root.addEventListener("scroll", syncFromDocumentScroll, { passive: true });
    syncFromDocumentScroll();

    return () => {
      root.removeEventListener("scroll", syncFromDocumentScroll);
      cancelAnimationFrame(frame);
    };
  }, [tab, doc?.id, actualPageCount, viewMode]);

  // Load TXT and DOCX content for the in-viewer search experience.
  useEffect(() => {
    let cancelled = false;
    if (!doc || doc.type === "pdf") {
      setViewerText("");
      setViewerHtml("");
      setViewerWordBuffer(null);
      setWordPageCount(0);
      return;
    }

    setViewerText("");
    setViewerHtml("");
    setViewerWordBuffer(null);
    setWordPageCount(0);

    if (!doc.url) {
      setViewerText("Unable to load document content.");
      return;
    }

    if (doc.type === "txt") {
      fetch(doc.url)
        .then((r) =>
          r.ok
            ? r.text()
            : Promise.reject(new Error("Unable to load text document")),
        )
        .then((text) => {
          if (!cancelled) setViewerText(text);
        })
        .catch(() => {
          if (!cancelled) setViewerText("Unable to load document content.");
        });
    } else if (isWordDocument(doc)) {
      fetch(doc.url)
        .then((r) =>
          r.ok
            ? r.arrayBuffer()
            : Promise.reject(new Error("Unable to load Word document")),
        )
        .then((arrayBuffer) => {
          if (cancelled) return;
          setViewerWordBuffer(arrayBuffer);
          return mammoth.convertToHtml({ arrayBuffer });
        })
        .then((result) => {
          if (!result || cancelled) return;
          const html = result.value || "";
          const temp = document.createElement("div");
          temp.innerHTML = html;
          setViewerText(temp.textContent || "");
          setViewerHtml(html);
        })
        .catch(() => {
          if (!cancelled) {
            setViewerText("Unable to load Word document content.");
            setViewerHtml("");
            setViewerWordBuffer(null);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [doc?.id, doc?.url, doc?.type]);

  // Render Word as fixed A4 pages, using the same page-by-page model as TXT.
  // We deliberately do not use docx-preview's continuous document canvas here:
  // every page has a fixed A4 boundary and overflow starts a new page.
  useEffect(() => {
    if (!viewerHtml || !isWordDocument(doc)) return;
    const root = wordViewerRef.current;
    if (!root) return;

    let cancelled = false;
    root.innerHTML = "";
    setWordPageCount(0);
    pageRefs.current.clear();

    const A4_WIDTH = 595;
    const A4_HEIGHT = 842;
    const PAGE_PADDING = 56;
    const CONTENT_WIDTH = A4_WIDTH - PAGE_PADDING * 2;
    const CONTENT_HEIGHT = A4_HEIGHT - PAGE_PADDING * 2;

    const source = document.createElement("div");
    source.className = "word-html-source";
    const wordMatchOffset = 0;
    source.innerHTML = highlightHtml(
      viewerHtml,
      viewerSearch,
      wordMatchOffset,
      searchIndex,
    );
    source.style.position = "absolute";
    source.style.visibility = "hidden";
    source.style.left = "-100000px";
    source.style.top = "0";
    source.style.width = `${CONTENT_WIDTH}px`;
    source.style.boxSizing = "border-box";
    document.body.appendChild(source);

    const wrapper = document.createElement("div");
    wrapper.className = "word-pages-generated";
    root.appendChild(wrapper);

    const blocks = [];
    const collect = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent.trim()) {
            const p = document.createElement("p");
            p.textContent = child.textContent;
            blocks.push(p);
          }
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        const tag = child.tagName;
        if (
          /^(P|H1|H2|H3|H4|H5|H6|TABLE|UL|OL|IMG|BLOCKQUOTE|PRE|HR)$/.test(tag)
        ) {
          blocks.push(child.cloneNode(true));
        } else if (child.children.length) {
          collect(child);
        } else if (child.textContent.trim()) {
          blocks.push(child.cloneNode(true));
        }
      });
    };
    collect(source);

    let pageNumber = 0;
    let page = null;
    let content = null;
    let usedHeight = 0;

    const createPage = () => {
      pageNumber += 1;
      page = document.createElement("section");
      page.className =
        "word-a4-page pdf-paper relative shrink-0 overflow-hidden shadow-sm";
      page.dataset.page = String(pageNumber);
      page.style.width = `${A4_WIDTH}px`;
      page.style.height = `${A4_HEIGHT}px`;
      page.style.minHeight = `${A4_HEIGHT}px`;
      page.style.boxSizing = "border-box";
      page.style.padding = `${PAGE_PADDING}px`;
      page.style.background = "#fff";
      page.style.margin = "0 auto 20px";
      content = document.createElement("div");
      content.className = "word-a4-content";
      content.style.whiteSpace = "pre-wrap";
      content.style.width = `${CONTENT_WIDTH}px`;
      content.style.height = `${CONTENT_HEIGHT}px`;
      content.style.overflow = "hidden";
      page.appendChild(content);
      wrapper.appendChild(page);
      pageRefs.current.set(pageNumber, page);
      usedHeight = 0;
    };

    const measure = (node) => {
      node.style.boxSizing = "border-box";
      content.appendChild(node);
      const h = node.getBoundingClientRect().height;
      content.removeChild(node);
      return h;
    };

    const appendBlock = (block) => {
      if (!page) createPage();
      const h = measure(block.cloneNode(true));
      if (usedHeight > 0 && usedHeight + h > CONTENT_HEIGHT) {
        createPage();
      }
      content.appendChild(block);
      usedHeight += block.getBoundingClientRect().height;
    };

    blocks.forEach((block) => {
      if (cancelled) return;
      appendBlock(block);
    });

    if (!cancelled) setWordPageCount(Math.max(1, pageNumber));
    source.remove();

    return () => {
      cancelled = true;
      source.remove();
      root.innerHTML = "";
      pageRefs.current.clear();
    };
  }, [
    viewerHtml,
    viewerSearch,
    viewerSearchActive,
    searchIndex,
    doc?.id,
    doc?.type,
    doc?.name,
  ]);

  // Search the currently opened document and return EVERY occurrence, not just pages.
  useEffect(() => {
    let cancelled = false;
    const term = viewerSearch.trim().toLocaleLowerCase();
    if (!viewerSearchActive || term.length < 1) {
      setSearchMatches([]);
      setSearchIndex(0);
      return;
    }

    const findOccurrences = (text, pageNumber) => {
      const matches = [];
      const lower = (text || "").toLocaleLowerCase();
      let from = 0;
      let index = lower.indexOf(term, from);
      while (index !== -1) {
        matches.push({ page: pageNumber, offset: index });
        from = index + Math.max(1, term.length);
        index = lower.indexOf(term, from);
      }
      return matches;
    };

    if (pdf) {
      (async () => {
        const matches = [];
        for (let i = 1; i <= pdf.numPages; i += 1) {
          if (cancelled) return;
          try {
            const pdfPage = await pdf.getPage(i);
            const content = await pdfPage.getTextContent();
            // PDF.js can split one visible word/phrase across several text items.
            // Preserve item boundaries with a single space for reliable searching.
            const text = content.items
              .map((item) => (typeof item.str === "string" ? item.str : ""))
              .join(" ");
            matches.push(...findOccurrences(text, i));
          } catch {}
        }
        if (!cancelled) {
          setSearchMatches(matches);
          setSearchIndex((prev) =>
            Math.min(prev, Math.max(0, matches.length - 1)),
          );
          // Make sure the target page's text layer is rendered immediately.
          if (matches.length) {
            const targetPage =
              matches[Math.min(searchIndex, matches.length - 1)]?.page;
            if (targetPage) {
              setRenderedPages((prev) => {
                const next = new Set(prev);
                [targetPage - 1, targetPage, targetPage + 1].forEach((n) => {
                  if (n >= 1 && n <= pdf.numPages) next.add(n);
                });
                return next;
              });
            }
          }
        }
      })();
    } else if (isWordDocument(doc)) {
      const root = wordViewerRef.current;
      const marks = root
        ? Array.from(root.querySelectorAll("[data-search-match]"))
        : [];
      const pageMatches = marks.map((mark, occurrence) => {
        const pageNode = mark.closest(".word-a4-page");
        const pageNumber = pageNode ? Number(pageNode.dataset.page || 1) : 1;
        return { page: pageNumber, occurrence };
      });
      setSearchMatches(pageMatches);
      setSearchIndex((prev) =>
        Math.min(prev, Math.max(0, pageMatches.length - 1)),
      );
    } else {
      const matches = [];
      documentPages.forEach((content, index) => {
        matches.push(...findOccurrences(content, index + 1));
      });
      setSearchMatches(matches);
      setSearchIndex((prev) => Math.min(prev, Math.max(0, matches.length - 1)));
    }

    return () => {
      cancelled = true;
    };
  }, [
    pdf,
    doc?.id,
    doc?.name,
    viewerText,
    viewerHtml,
    viewerSearch,
    viewerSearchActive,
    documentPages,
    wordPageCount,
  ]);

  // Apply the viewer zoom to the generated DOCX pages.
  // DOCX uses fixed A4 DOM pages rather than the PDF canvas, so it needs
  // its own layout-aware zoom. CSS zoom keeps both the visual size and
  // scrollable layout in sync.
  useEffect(() => {
    if (!isWordDocument(doc)) return;
    const root = wordViewerRef.current;
    if (!root) return;
    root.style.zoom = `${zoom / 100}`;
    return () => {
      root.style.zoom = "1";
    };
  }, [doc?.id, doc?.type, zoom, wordPageCount]);

  // Move to the exact occurrence for TXT/Word.
  useEffect(() => {
    if (pdf || !searchMatches.length) return;
    const target = searchMatches[searchIndex];
    if (!target) return;
    const root = pdfScrollRef.current;
    if (!root) return;
    requestAnimationFrame(() => {
      const marks = Array.from(root.querySelectorAll(".pdf-search-highlight"));
      const match = marks[searchIndex];
      if (match)
        match.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "nearest",
        });
      else if (target.page) goToPage(target.page);
    });
  }, [
    pdf,
    searchIndex,
    searchMatches,
    viewerSearch,
    viewerSearchActive,
    wordPageCount,
  ]);

  useEffect(() => {
    if (!pdf || !searchMatches.length) return;
    const target = searchMatches[searchIndex];
    if (!target?.page) return;

    // Search navigation must behave like TXT/DOCX: select the occurrence,
    // switch to its PDF page, make sure that page is rendered, then scroll to it.
    setPage(target.page);
    setRenderedPages((prev) => {
      const next = new Set(prev);
      [target.page - 1, target.page, target.page + 1].forEach((n) => {
        if (n >= 1 && n <= pdf.numPages) next.add(n);
      });
      return next;
    });

    const timer = setTimeout(() => {
      const root = pdfScrollRef.current;
      const node = pageRefs.current.get(target.page);
      if (!root || !node) return;
      programmaticScrollRef.current = true;
      programmaticScrollTargetRef.current = target.page;
      if (programmaticScrollTimerRef.current)
        clearTimeout(programmaticScrollTimerRef.current);
      node.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      programmaticScrollTimerRef.current = setTimeout(() => {
        programmaticScrollRef.current = false;
        programmaticScrollTargetRef.current = null;
      }, 700);
    }, 80);

    return () => clearTimeout(timer);
  }, [pdf, searchIndex, searchMatches]);

  const downloadDocument = () => {
    if (!doc?.url) return;
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.name || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewerRef.current.requestFullscreen();
    } catch {}
  };

  const goToPage = (next, { smooth = true } = {}) => {
    const target = Math.max(1, Math.min(actualPageCount, Number(next) || 1));
    setPage(target);
    setRenderedPages((prev) => {
      const nextSet = new Set(prev);
      [target - 1, target, target + 1].forEach((n) => {
        if (n >= 1 && n <= actualPageCount) nextSet.add(n);
      });
      return nextSet;
    });

    if (viewMode === "page") return;

    requestAnimationFrame(() => {
      const root = pdfScrollRef.current;
      const node = pageRefs.current.get(target);
      if (!root || !node) return;

      // The main PDF viewport remains smoothly scrollable. The thumbnail rail
      // is handled separately by the page-selection effect, so it does not
      // animate through every intermediate thumbnail.
      programmaticScrollRef.current = true;
      programmaticScrollTargetRef.current = target;
      if (programmaticScrollTimerRef.current)
        clearTimeout(programmaticScrollTimerRef.current);

      const rootRect = root.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const targetTop = Math.max(
        0,
        nodeRect.top - rootRect.top + root.scrollTop - 4,
      );
      root.scrollTo({ top: targetTop, behavior: smooth ? "smooth" : "auto" });

      if (!smooth) {
        programmaticScrollRef.current = false;
        programmaticScrollTargetRef.current = null;
      } else {
        // Do not use a short fixed timeout here. A long jump (for example
        // page 1 -> page 19) can take longer than the timeout, allowing the
        // IntersectionObserver to select pages 15, 16, 17, 18 on the way.
        // Keep the clicked page selected until the destination actually
        // reaches its requested viewport position.
        const distance = Math.abs(root.scrollTop - targetTop);
        const fallbackMs = Math.max(1200, Math.min(5000, 700 + distance * 1.2));
        programmaticScrollTimerRef.current = setTimeout(() => {
          programmaticScrollRef.current = false;
          programmaticScrollTargetRef.current = null;
          setPage(target);
        }, fallbackMs);
      }
    });
  };

  const prepareZoom = (nextZoom) => {
    if (viewMode !== "all" || !pdfScrollRef.current) {
      setZoom(nextZoom);
      return;
    }

    const root = pdfScrollRef.current;
    const node = pageRefs.current.get(page);
    if (!node) {
      setZoom(nextZoom);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const pageTop = nodeRect.top - rootRect.top + root.scrollTop;
    const offsetInPage = root.scrollTop - pageTop;

    // Keep the exact point currently visible in the viewport at the same
    // relative position after the page dimensions change. The page itself is
    // never forced to the top.
    zoomAnchorRef.current = {
      page,
      offsetInPage,
      oldZoom: zoom,
    };
    zoomingRef.current = true;
    setZoom(nextZoom);
  };

  const changeZoom = (delta) => {
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    if (nextZoom === zoom) return;
    prepareZoom(nextZoom);
  };

  const resetZoom = () => {
    if (zoom === 100) return;
    prepareZoom(100);
  };

  const openInNewTab = () => {
    if (doc?.url) window.open(doc.url, "_blank", "noopener,noreferrer");
    setMenu(false);
  };

  const shareDocument = async () => {
    try {
      if (navigator.share)
        await navigator.share({ title: doc?.name, url: window.location.href });
      else if (navigator.clipboard)
        await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const pageCountText = `${actualPageCount} pages`;
  const currentSearchText = searchMatches.length
    ? `${searchIndex + 1}/${searchMatches.length}`
    : viewerSearch.trim().length >= 2
      ? "0/0"
      : "—";

  const pageElements = useMemo(() => {
    if (!pdf) return [];
    return Array.from({ length: actualPageCount }, (_, index) => index + 1);
  }, [pdf, actualPageCount]);

  if (!doc) {
    return (
      <section className="surface flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111a2d]">
        <PromptInputBasic />
      </section>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case "Viewer":
        return (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <ViewerToolbar
              page={page}
              actualPageCount={actualPageCount}
              zoom={zoom}
              viewMode={viewMode}
              fullscreen={fullscreen}
              searchOpen={searchOpen}
              viewerSearch={viewerSearch}
              currentSearchText={currentSearchText}
              searchMatchesLength={searchMatches.length}
              onPreviousPage={() => goToPage(page - 1)}
              onNextPage={() => goToPage(page + 1)}
              onGoToPage={() => {
                const value = window.prompt("Go to page", String(page));
                if (value) goToPage(value);
              }}
              onZoomOut={() => changeZoom(-10)}
              onZoomIn={() => changeZoom(10)}
              onResetZoom={resetZoom}
              onViewModeChange={(nextMode) => {
                zoomingRef.current = false;
                setViewMode(nextMode);
                setRenderedPages((prev) => {
                  const next = new Set(prev);
                  [page - 1, page, page + 1].forEach((n) => {
                    if (n >= 1 && n <= actualPageCount) next.add(n);
                  });
                  return next;
                });
              }}
              onToggleFullscreen={toggleFullscreen}
              onSearchOpen={() => setSearchOpen(true)}
              onSearchChange={(value) => {
                setViewerSearch(value);
                setViewerSearchActive(true);
              }}
              onSearchClose={() => {
                setViewerSearch("");
                setViewerSearchActive(false);
                setSearchMatches([]);
                setSearchIndex(0);
                setSearchOpen(false);
              }}
              onPreviousMatch={() =>
                setSearchIndex(
                  (i) => (i - 1 + searchMatches.length) % searchMatches.length,
                )
              }
              onNextMatch={() =>
                setSearchIndex((i) => (i + 1) % searchMatches.length)
              }
              onRefresh={() => setRefreshKey((v) => v + 1)}
            />

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <ThumbnailRail
                doc={doc}
                pdf={pdf}
                page={page}
                actualPageCount={actualPageCount}
                documentPages={documentPages}
                thumbnailRailRef={thumbnailRailRef}
                thumbnailContentRef={thumbnailContentRef}
                thumbnailSelectionRef={thumbnailSelectionRef}
                thumbnailRefs={thumbnailRefs}
                onGoToPage={(p) => goToPage(p, { smooth: true })}
              />

              <DocumentPages
                doc={doc}
                pdf={pdf}
                pdfError={pdfError}
                page={page}
                zoom={zoom}
                viewMode={viewMode}
                pageElements={pageElements}
                pageSizes={pageSizes}
                renderedPages={renderedPages}
                viewerSearchActive={viewerSearchActive}
                viewerSearch={viewerSearch}
                searchMatches={searchMatches}
                searchIndex={searchIndex}
                refreshKey={refreshKey}
                onRetry={() => setRefreshKey((v) => v + 1)}
                documentPages={documentPages}
                pdfScrollRef={pdfScrollRef}
                pageRefs={pageRefs}
                wordViewerRef={wordViewerRef}
                highlightPlainText={highlightPlainText}
              />
            </div>
          </div>
        );

      case "Chat":
        return (
          <div className="h-full min-h-0 overflow-hidden">
            <PromptInputBasic />
          </div>
        );

      default:
        return (
          <div className="h-full min-h-0 flex-1 overflow-auto p-8">
            <h2 className="text-xl font-bold">{tab}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Mock {tab.toLowerCase()} generated from the selected document.
              This area is ready to be connected to your RAG backend.
            </p>
          </div>
        );
    }
  };

  return (
    <section
      ref={viewerRef}
      className="surface relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111a2d]"
    >
      <div className="flex min-h-15.5 shrink-0 items-center border-b border-slate-100 px-4 dark:border-slate-800">
        <FileIcon type={doc.type} />
        <div className="ml-3 min-w-0">
          <div className="truncate text-[16px] font-bold">{doc.name}</div>
          <div className="text-[11px] text-slate-500">
            {doc.size}
            <span className="mx-1.5">•</span>
            {pageCountText}
            <span className="mx-1.5">•</span>
            {doc.date}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[12px]">
          <button
            className="flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-500 to-blue-500 px-4 py-2 font-semibold text-white"
            onClick={() => setTab("Chat")}
          >
            <Sparkles size={15} />
            Ask AI
          </button>
          <button
            onClick={downloadDocument}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-[12px] dark:border-slate-700"
          >
            <Download size={15} />
            Download
          </button>
          <button
            onClick={shareDocument}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-[12px] dark:border-slate-700"
          >
            <Link size={15} />
            Share
          </button>
          <div className="relative">
            <button
              ref={viewerMenuButtonRef}
              onClick={() => setMenu((v) => !v)}
              className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              aria-label="Document actions"
            >
              <MoreVertical size={17} />
            </button>
            {menu && (
              <div
                ref={viewerMenuRef}
                className="absolute right-0 top-11 z-50 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <Menu label="Open in new tab" onClick={openInNewTab} />
                <Menu label="Rename" />
                <Menu label="Move to folder" />
                <Menu
                  label="Close document"
                  red
                  onClick={() => {
                    setMenu(false);
                    onClose();
                  }}
                />
                <Menu label="Delete" red />
              </div>
            )}
          </div>
        </div>
      </div>

      <TabBar
        tabs={["Chat", "Viewer", "Summary"]}
        activeTab={tab}
        onTabChange={setTab}
      />

      <div className="min-h-0 flex-1 overflow-hidden">{renderTab()}</div>
    </section>
  );
}

function Menu({ label, red, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded px-2 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${red ? "text-red-500" : ""}`}
    >
      {label}
    </button>
  );
}
