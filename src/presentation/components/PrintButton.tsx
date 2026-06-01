"use client";

export default function PrintButton() {
  function handlePrint() {
    const el = document.getElementById("prescription-content");

    // Fallback to native print if element not found
    if (!el) {
      window.print();
      return;
    }

    // Open a clean new window — no sidebar, no topbar
    const pw = window.open("", "_blank", "width=900,height=720");
    if (!pw) {
      window.print();
      return;
    }

    pw.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Medical Prescription</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { padding: 24px; }
    table { border-collapse: collapse; width: 100%; }
    @media print {
      body { padding: 0; }
      @page { margin: 12mm 14mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  ${el.outerHTML}
</body>
</html>`);

    pw.document.close();

    // Trigger print after fonts finish loading
    setTimeout(() => {
      pw.focus();
      pw.print();
    }, 900);
  }

  return (
    <button
      onClick={handlePrint}
      className="no-print"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 20px",
        borderRadius: "10px",
        border: "none",
        background: "#1e40af",
        color: "#fff",
        fontWeight: 700,
        fontSize: "13.5px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(30,64,175,0.3)",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#1e40af";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <svg
        fill="none"
        height="16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print Prescription
    </button>
  );
}
