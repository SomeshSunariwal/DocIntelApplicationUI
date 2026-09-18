import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/layout/Navbar";
import UploadPanel from "./components/upload/UploadPanel";
import DocumentList from "./components/documents/DocumentList";
import TotalDocuments from "./components/documents/TotalDocuments";
import GlobalSearch from "./components/search/GlobalSearch";
import DocumentViewer from "./components/viewer/DocumentViewer";
import { getDocuments, getDocumentTotal, uploadDocument } from "./services/api";
import LoginOverlay from "./components/auth/LoginOverlay";
import SignupOverlay from "./components/auth/SignupOverlay";

export default function App() {
  const [dark, setDark] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [serverOffset, setServerOffset] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [jumpPage, setJumpPage] = useState(null);
  const [totalDocumentCount, setTotalDocumentCount] =
    useState(getDocumentTotal());

  const [login, setLogin] = useState(true);
  const [signUp, setSignUP] = useState(false);

  useEffect(() => {
    let alive = true;
    getDocuments(0, 15).then((batch) => {
      if (!alive) return;
      setDocuments(batch);
      setServerOffset(batch.length);
      setTotalDocumentCount(getDocumentTotal());
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const selected = documents.find((d) => d.id === selectedId) || null;
  const select = (id, page = 1) => {
    setSelectedId(id);
    setJumpPage(page);
  };

  const addFiles = async (files) => {
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      const id = `upload-${crypto.randomUUID()}`;
      if (
        file.size > 50 * 1024 * 1024 ||
        !["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"].includes(
          ext,
        )
      )
        continue;
      const temp = {
        id,
        name: file.name,
        type: ext,
        size:
          file.size < 1024 * 1024
            ? `${Math.max(1, Math.round(file.size / 1024))} KB`
            : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: "Today",
        status: "uploading",
        progress: 0,
        pages: ext === "pdf" ? 42 : 1,
        url: URL.createObjectURL(file),
      };
      setDocuments((ds) => [temp, ...ds]);
      setTotalDocumentCount((v) => v + 1);
      try {
        const done = await uploadDocument(file, (p) =>
          setDocuments((ds) =>
            ds.map((d) => (d.id === id ? { ...d, progress: p } : d)),
          ),
        );
        setDocuments((ds) =>
          ds.map((d) =>
            d.id === id ? { ...done, id, status: "completed" } : d,
          ),
        );
      } catch {
        setDocuments((ds) =>
          ds.map((d) => (d.id === id ? { ...d, status: "failed" } : d)),
        );
      }
    }
  };

  const loadMore = async () => {
    // Mimic the real network/loading state so the list spinner is visible
    // while the next lazy-loaded batch is being fetched.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const batch = await getDocuments(serverOffset, 6);
    if (!batch.length) return false;
    setDocuments((ds) => {
      const ids = new Set(ds.map((d) => d.id));
      return [...ds, ...batch.filter((d) => !ids.has(d.id))];
    });
    setServerOffset((v) => v + batch.length);
    return true;
  };

  const totalSize = useMemo(() => {
    let mb = 0;
    documents
      .filter((d) => d.status !== "failed")
      .forEach((d) => {
        const n = parseFloat(d.size) || 0;
        if (d.size.includes("GB")) mb += n * 1024;
        else if (d.size.includes("MB")) mb += n;
        else mb += n / 1024;
      });
    return `${mb.toFixed(1)} MB`;
  }, [documents]);

  const dashboard = (() => {
    return (
      <div className="app-shell flex h-screen min-h-0 flex-col overflow-hidden bg-[#f4f8fe] text-[#101a3d] dark:bg-[#0b1220] dark:text-slate-100">
        <Navbar dark={dark} setDark={setDark} setLogin={setLogin} />
        <main className="app-main grid min-h-0 flex-1 grid-cols-[348px_minmax(0,1fr)] gap-4 overflow-hidden px-7 py-3.5">
          <aside className="sidebar-grid grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden">
            <UploadPanel onFiles={addFiles} />
            <DocumentList
              documents={documents}
              setDocuments={setDocuments}
              totalCount={totalDocumentCount}
              selectedId={selectedId}
              onSelect={select}
              onLoadMore={loadMore}
            />
            <TotalDocuments
              count={documents.filter((d) => d.status !== "failed").length}
              size={totalSize}
            />
          </aside>
          <section className="workspace-grid grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden">
            <GlobalSearch onResult={select} />
            <DocumentViewer
              doc={selected}
              jumpPage={jumpPage}
              onClose={() => {
                setSelectedId(null);
                setJumpPage(null);
              }}
            />
          </section>
        </main>
      </div>
    );
  })();

  return (
    <div>
      {login ? (
        <div>{dashboard}</div>
      ) : signUp ? (
        <>
          <SignupOverlay setLogin={setLogin} setSignUP={setSignUP} />
          {dashboard}
        </>
      ) : (
        <>
          <LoginOverlay setLogin={setLogin} setSignUP={setSignUP} />
          {dashboard}
        </>
      )}
    </div>
  );
}
