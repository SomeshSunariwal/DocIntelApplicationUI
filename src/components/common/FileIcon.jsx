import React from "react";
import pdfIcon from "../../../resources/pdf.png";
import docxIcon from "../../../resources/docx.png";
import txtIcon from "../../../resources/txt.png";

export default function FileIcon({ type = "pdf", size = "md" }) {
  const t = type.toLowerCase();
  const map = {
    pdf: pdfIcon,
    doc: docxIcon,
    docx: docxIcon,
    txt: txtIcon,
    xls: txtIcon,
    xlsx: txtIcon,
    ppt: txtIcon,
    pptx: txtIcon,
  };
  const iconSize = size === "sm" ? 30 : 36;
  return (
    <img
      src={map[t] || txtIcon}
      width={iconSize}
      height={iconSize}
      alt={`${t} file`}
      className={`${size === "sm" ? "h-8 w-8" : "h-9 w-9"} shrink-0 object-contain`}
    />
  );
}
