import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../layout/Navbar";
import UploadPanel from "../upload/UploadPanel";
import DocumentList from "../documents/DocumentList";
import TotalDocuments from "../documents/TotalDocuments";
import GlobalSearch from "../search/GlobalSearch";
import DocumentViewer from "../viewer/DocumentViewer";
import { getUserAllDocumentsAction } from "../apis/actions/getUserAllDocumentsAction";
import { filesUploadAction } from "../apis/actions/filesUploadAction";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatFileSize = (bytes) => {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return "—";
  if (size < 1024) return `${size} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = size / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
};

const mapDocumentStatus = (value) => {
  switch (String(value || "").toUpperCase()) {
    case "UPLOADED":
    case "PROCESSING":
      return "processing";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    case "DELETED":
      return "deleted";
    default:
      return "processing";
  }
};

const mapApiDocument = (document) => {
  const type = String(
    document.fileExtensions || document.fileName?.split(".").pop() || "file",
  )
    .replace(/^\./, "")
    .toLowerCase();
  const apiStatus = String(document.status || "").toUpperCase();

  return {
    id: document.documentId,
    name: document.fileName || "Untitled document",
    type,
    size: formatFileSize(document.fileSize),
    date: formatDate(document.updatedAt || document.createdAt),
    status: mapDocumentStatus(apiStatus),
    progress: ["UPLOADED", "PROCESSING"].includes(apiStatus) ? 75 : undefined,
    pages: Number(document.pages || document.chunks) || 1,
    url: document.URI || document.uri || document.url || "",
  };
};

export default function Dashboard({ setLogin }) {
  const [dark, setDark] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [jumpPage, setJumpPage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSubmitted, setUploadSubmitted] = useState(false);
  const dispatch = useDispatch();

  const {
    data: documentResponse,
    loading,
    error,
  } = useSelector((state) => state.rootReducer.getUserAllDocuments);

  const { loading: uploadLoading, error: uploadError } = useSelector(
    (state) => state.rootReducer.filesUpload,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    dispatch(getUserAllDocumentsAction());
  }, [dispatch]);

  useEffect(() => {
    if (!documentResponse) return;
    const apiDocuments = Array.isArray(documentResponse)
      ? documentResponse
      : documentResponse.documents;
    if (!Array.isArray(apiDocuments)) return;

    const mapped = apiDocuments.map(mapApiDocument);
    setDocuments((current) => {
      const apiNames = new Set(mapped.map((doc) => doc.name));
      const pending = current.filter(
        (doc) => doc.status === "uploading" && !apiNames.has(doc.name),
      );
      return [...pending, ...mapped];
    });
  }, [documentResponse]);

  useEffect(() => {
    if (!uploadLoading) return undefined;

    const timer = window.setInterval(() => {
      setDocuments((current) =>
        current.map((document) =>
          document.status === "uploading"
            ? {
                ...document,
                progress: Math.min(95, (document.progress || 0) + 5),
              }
            : document,
        ),
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, [uploadLoading]);

  useEffect(() => {
    const hasProcessing = documents.some(
      (document) => document.status === "processing",
    );
    if (!hasProcessing) return undefined;

    const timer = window.setTimeout(() => {
      dispatch(getUserAllDocumentsAction());
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [dispatch, documents]);

  const selected = documents.find((d) => d.id === selectedId) || null;

  const select = (id, page = 1) => {
    setSelectedId(id);
    setJumpPage(page);
  };

  const addFiles = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop().toLowerCase();
        if (
          file.size > 50 * 1024 * 1024 ||
          !["pdf", "doc", "docx", "txt"].includes(ext)
        )
          continue;
        const temp = {
          id: `upload-${crypto.randomUUID()}`,
          name: file.name,
          type: ext,
          size:
            file.size < 1024 * 1024
              ? `${Math.max(1, Math.round(file.size / 1024))} KB`
              : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          date: "Today",
          status: "uploading",
          progress: 0,
          pages: 1,
          url: "",
        };
        setDocuments((ds) => [temp, ...ds]);
      }
      const acceptedFiles = files.filter((file) => {
        const ext = file.name.split(".").pop().toLowerCase();
        return (
          file.size <= 50 * 1024 * 1024 &&
          ["pdf", "doc", "docx", "txt"].includes(ext)
        );
      });
      if (acceptedFiles.length) {
        setUploadSubmitted(true);
        dispatch(filesUploadAction(acceptedFiles));
      }
    } finally {
      setUploading(false);
    }
  };

  const loadMore = useCallback(async () => false, []);

  useEffect(() => {
    if (!uploadSubmitted) return;
    if (uploadLoading || uploading) return;
    if (uploadError) {
      setDocuments((current) =>
        current.map((doc) =>
          doc.id.startsWith("upload-") && doc.status === "uploading"
            ? { ...doc, status: "failed" }
            : doc,
        ),
      );
    } else {
      setDocuments((current) =>
        current.map((document) =>
          document.status === "uploading"
            ? { ...document, status: "processing", progress: 75 }
            : document,
        ),
      );
      dispatch(getUserAllDocumentsAction());
    }
    setUploadSubmitted(false);
  }, [dispatch, uploadLoading, uploadError, uploading, uploadSubmitted]);

  const totalSize = useMemo(() => {
    let mb = 0;
    documents
      .filter((d) => !["failed", "deleted"].includes(d.status))
      .forEach((d) => {
        const n = parseFloat(d.size) || 0;
        if (d.size.includes("TB")) {
          mb += n * 1024 * 1024;
        } else if (d.size.includes("GB")) {
          mb += n * 1024;
        } else if (d.size.includes("MB")) {
          mb += n;
        } else if (d.size.includes("KB")) {
          mb += n / 1024;
        } else if (d.size.includes("B")) {
          mb += n / (1024 * 1024);
        }
      });
    return `${mb.toFixed(1)} MB`;
  }, [documents]);

  return (
    <div className="app-shell flex h-screen min-h-0 flex-col overflow-hidden bg-[#f4f8fe] text-[#101a3d] dark:bg-[#0b1220] dark:text-slate-100">
      <Navbar dark={dark} setDark={setDark} setLogin={setLogin} />
      <main className="app-main grid min-h-0 flex-1 grid-cols-[348px_minmax(0,1fr)] gap-4 overflow-hidden px-7 py-3.5">
        <aside className="sidebar-grid grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden">
          <UploadPanel onFiles={addFiles} uploadError={uploadError} />
          <DocumentList
            documents={documents}
            setDocuments={setDocuments}
            totalCount={documents.length}
            selectedId={selectedId}
            onSelect={select}
            onLoadMore={loadMore}
          />
          <TotalDocuments
            count={
              documents.filter((d) => !["failed", "deleted"].includes(d.status))
                .length
            }
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
}
