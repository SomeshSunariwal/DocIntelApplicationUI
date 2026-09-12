# DocMind — React + Tailwind

This is a mock, frontend-only DocMind SPA matching the approved UI.

## Run

```bash
npm install
npm run dev
```

## Included

- React + Vite + Tailwind CSS
- Light/dark mode
- Mock upload states
- Scroll-driven lazy loading (initial batch + additional batches only after scrolling)
- Real PDF rendering with `pdfjs-dist` using `public/mock-files/product-requirements.pdf`
- Real PDF thumbnails
- Page navigation, zoom, fullscreen
- Search mock data and result navigation
- Componentized UI
- Sample DOCX/TXT/XLSX/PPTX files in `public/mock-files/`

## Important

The PDF is rendered with PDF.js inside the DocMind viewer. The browser's native PDF viewer is not used.

The document list is constrained to its own scroll container on desktop. The page itself does not grow as lazy-loaded rows are appended. On smaller screens the layout becomes a responsive stacked layout while keeping the document list independently scrollable.
