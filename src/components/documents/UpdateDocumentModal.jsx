import { X } from "lucide-react";
import { createPortal } from "react-dom";
import UploadPanel from "../upload/UploadPanel";

export default function UpdateDocumentModal({
  document,
  onClose,
  onFiles,
  uploadError,
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-document-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#414141] dark:bg-[#303030] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="update-document-title" className="text-lg font-semibold">
            Update document
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close update document dialog"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#383838]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mb-3 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-[#414141]">
          <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            File Name
          </div>
          <div className="break-words text-sm text-slate-700 dark:text-slate-200">
            {document.fileName || document.name || "—"}
          </div>
        </div>
        <UploadPanel
          singleFile
          title="Upload Document"
          uploadError={uploadError}
          onFiles={(files) => {
            onFiles(files);
            onClose();
          }}
        />
        <div
          role="note"
          className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
        >
          <span className="font-semibold">Note:</span> Please add updated
          document of existing one. If it&apos;s a new document then consider
          uploading as new document.
        </div>
      </section>
    </div>,
    globalThis.document.body,
  );
}
