import React from "react";
export const MIN_ZOOM = 50;
export const MAX_ZOOM = 200;

export function highlightPlainText(
  text,
  term,
  matchOffset = 0,
  currentMatch = -1,
) {
  if (!term.trim()) return text;
  const lower = text.toLocaleLowerCase();
  const needle = term.toLocaleLowerCase();
  const nodes = [];
  let from = 0;
  let matchNumber = matchOffset;
  let index = lower.indexOf(needle, from);
  while (index !== -1) {
    if (index > from) nodes.push(text.slice(from, index));
    nodes.push(
      <mark
        key={`${index}-${needle}-${matchNumber}`}
        data-search-match={matchNumber}
        className={`pdf-search-highlight ${matchNumber === currentMatch ? "pdf-search-highlight-current" : ""}`}
      >
        {text.slice(index, index + needle.length)}
      </mark>,
    );
    matchNumber += 1;
    from = index + needle.length;
    index = lower.indexOf(needle, from);
  }
  if (from < text.length) nodes.push(text.slice(from));
  return nodes;
}

export function highlightHtml(html, term, matchOffset = 0, currentMatch = -1) {
  if (!html || !term.trim()) return html;
  const root = document.createElement("div");
  root.innerHTML = html;
  const needle = term.toLocaleLowerCase();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  let matchNumber = matchOffset;
  textNodes.forEach((node) => {
    if (!node.parentNode || !node.nodeValue) return;
    const text = node.nodeValue;
    const lower = text.toLocaleLowerCase();
    if (!lower.includes(needle)) return;

    const fragment = document.createDocumentFragment();
    let from = 0;
    let index = lower.indexOf(needle, from);
    while (index !== -1) {
      if (index > from)
        fragment.appendChild(document.createTextNode(text.slice(from, index)));
      const mark = document.createElement("mark");
      mark.className = `pdf-search-highlight ${matchNumber === currentMatch ? "pdf-search-highlight-current" : ""}`;
      mark.setAttribute("data-search-match", String(matchNumber));
      matchNumber += 1;
      mark.textContent = text.slice(index, index + needle.length);
      fragment.appendChild(mark);
      from = index + needle.length;
      index = lower.indexOf(needle, from);
    }
    if (from < text.length)
      fragment.appendChild(document.createTextNode(text.slice(from)));
    node.parentNode.replaceChild(fragment, node);
  });

  return root.innerHTML;
}

export function buildDocumentPages(type, text, html, pageCount) {
  const count = Math.max(1, Number(pageCount) || 1);
  if (type === "txt") {
    const sourceLines = (text || "").split(/\r?\n/);
    const charsPerRenderedLine = 78;
    const renderedLinesPerPage = 28;
    const pages = [];
    let current = [];
    let renderedLineCount = 0;

    const pushCurrent = () => {
      if (current.length || !pages.length) pages.push(current.join("\n"));
      current = [];
      renderedLineCount = 0;
    };

    sourceLines.forEach((line) => {
      const lineCount = Math.max(
        1,
        Math.ceil(Math.max(1, line.length) / charsPerRenderedLine),
      );
      if (
        current.length &&
        renderedLineCount + lineCount > renderedLinesPerPage
      )
        pushCurrent();

      if (lineCount <= renderedLinesPerPage) {
        current.push(line);
        renderedLineCount += lineCount;
        return;
      }

      let remaining = line;
      while (remaining.length > charsPerRenderedLine) {
        if (renderedLineCount === renderedLinesPerPage) pushCurrent();
        current.push(remaining.slice(0, charsPerRenderedLine));
        remaining = remaining.slice(charsPerRenderedLine);
        renderedLineCount += 1;
        if (renderedLineCount === renderedLinesPerPage) pushCurrent();
      }
      current.push(remaining);
      renderedLineCount += Math.max(
        1,
        Math.ceil(Math.max(1, remaining.length) / charsPerRenderedLine),
      );
    });

    pushCurrent();
    return pages;
  }

  if (type === "docx") {
    const root = document.createElement("div");
    root.innerHTML = html || "";
    const blocks = Array.from(root.children);
    if (!blocks.length) return [""];
    const perPage = Math.max(1, Math.ceil(blocks.length / count));
    return Array.from({ length: count }, (_, i) =>
      blocks
        .slice(i * perPage, (i + 1) * perPage)
        .map((node) => node.outerHTML)
        .join(""),
    ).filter((_, i, a) => a[i] || i === 0);
  }

  return [""];
}

export function isWordDocument(doc) {
  return Boolean(
    doc &&
    (doc.type === "docx" ||
      doc.type === "docs" ||
      /\.(docx|docs)$/i.test(doc.name || "")),
  );
}
