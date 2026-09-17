import React, { useRef, useState } from "react";
import { CloudUpload, FolderOpen } from "lucide-react";

const allowed = ["pdf", "doc", "docx", "txt"];
const pills = ["PDF", "DOC", "DOCX", "TXT"];

export default function UploadPanel({ onFiles }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (files) => {
    setError("");
    const valid = files.filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return allowed.includes(ext) && f.size <= 50 * 1024 * 1024;
    });
    if (valid.length !== files.length)
      setError("Unsupported type or file larger than 50MB.");
    if (valid.length) onFiles(valid);
  };

  return (
    <section className="surface rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft dark:bg-[#111a2d]">
      <h2 className="mb-3 text-[17px] font-bold">Upload Documents</h2>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles([...e.dataTransfer.files]);
        }}
        className={`flex h-54 flex-col items-center justify-center rounded-lg border border-dashed px-3 pt-4 pb-2 text-center transition ${drag ? "border-blue-500 bg-blue-50/60" : "border-blue-300"} dark:border-blue-800 dark:bg-slate-950/20`}
      >
        <CloudUpload size={42} className="mb-2 text-blue-600" />
        <div className="text-[13px] font-medium">
          Drag & drop your files here
        </div>
        <div className="text-[13px]">or click to browse</div>
        <div className="my-3 flex gap-1.5">
          {pills.map((t) => (
            <span
              key={t}
              className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={() => ref.current?.click()}
          className="flex w-full max-w-[270px] items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 py-2  font-medium text-white"
        >
          <FolderOpen size={16} />
          Choose Files
        </button>
        <input
          ref={ref}
          type="file"
          hidden
          multiple
          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => {
            handleFiles([...e.target.files]);
            e.target.value = "";
          }}
        />
        <div className="mt-2 text-[10px] text-slate-500">
          Max file size 50MB
        </div>
        {error && <div className="mt-1 text-[10px] text-red-500">{error}</div>}
      </div>
    </section>
  );
}
