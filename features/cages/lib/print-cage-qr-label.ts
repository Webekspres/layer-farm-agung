/** Print cage QR without `window.open` (Brave/popup blockers). */

export function buildCageQrPrintDocumentHtml(input: {
  cageName: string;
  qrCode: string;
  qrSvgHtml: string;
}): string {
  const { cageName, qrCode, qrSvgHtml } = input;
  const safeName = escapeHtml(cageName);
  const safeCode = escapeHtml(qrCode);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>QR ${safeName}</title>
  <style>
    @page { margin: 12mm; }
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      color: #111;
      background: #fff;
    }
    .sheet {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      text-align: center;
    }
    h1 { font-size: 28px; margin: 0; }
    .code { font-family: ui-monospace, monospace; font-size: 18px; font-weight: 700; }
    .hint { font-size: 12px; color: #444; max-width: 320px; }
    .qr { padding: 12px; border: 1px solid #ddd; background: #fff; display: inline-flex; }
    .qr svg { display: block; width: 200px; height: 200px; }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>${safeName}</h1>
    <div class="qr">${qrSvgHtml}</div>
    <p class="code">${safeCode}</p>
    <p class="hint">Scan dengan AAPM Mobile (opsional). Pastikan staff ditugaskan ke kandang ini.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Same-document iframe print — works when Brave blocks popups. */
export function printHtmlViaHiddenIframe(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Cetak QR Kandang");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    throw new Error("Tidak dapat menyiapkan jendela cetak.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    iframe.remove();
  };

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } finally {
      win.addEventListener("afterprint", cleanup, { once: true });
      window.setTimeout(cleanup, 1500);
    }
  };

  window.setTimeout(triggerPrint, 50);
}
