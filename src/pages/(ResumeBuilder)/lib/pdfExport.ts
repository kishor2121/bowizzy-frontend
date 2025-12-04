import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createRoot } from "react-dom/client";
import type { ReactElement } from "react";

export async function exportPagesAsPdf(
  renderPage: (pageIndex: number) => ReactElement | null,
  totalPages: number,
  filename = "resume.pdf"
) {
  try {
    const pdf = new jsPDF("p", "mm", "a4");

    // A4 exact pixel size at 96dpi
    const A4_WIDTH_PX = 794;   // 210mm
    const A4_HEIGHT_PX = 1123; // 297mM


    const waitForImages = (rootEl: HTMLElement, timeout = 3000) =>
      new Promise<void>((resolve) => {
        const imgs = Array.from(rootEl.querySelectorAll("img")) as HTMLImageElement[];
        if (imgs.length === 0) return resolve();
        let remaining = imgs.length;
        const onDone = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
        };
        imgs.forEach((img) => {
          if (img.complete && img.naturalWidth > 0) return onDone();
          const onEnd = () => {
            img.removeEventListener("load", onEnd);
            img.removeEventListener("error", onEnd);
            onDone();
          };
          img.addEventListener("load", onEnd);
          img.addEventListener("error", onEnd);
        });
        setTimeout(() => resolve(), timeout);
      });

    for (let i = 0; i < totalPages; i++) {
      const pageContainer = document.createElement("div");

      pageContainer.style.width = `${A4_WIDTH_PX}px`;
      pageContainer.style.height = `${A4_HEIGHT_PX}px`;
      pageContainer.style.padding = "0";
      pageContainer.style.background = "white";
      pageContainer.style.position = "absolute";
      pageContainer.style.left = "-9999px";
      pageContainer.style.top = "0";
      pageContainer.style.overflow = "hidden";

      document.body.appendChild(pageContainer);

      const reactRoot = document.createElement("div");
      pageContainer.appendChild(reactRoot);

      const root = createRoot(reactRoot);
      root.render(renderPage(i));

      await waitForImages(pageContainer);
      await new Promise((res) => setTimeout(res, 150));

      // Render EXACT A4 dimensions
      const canvas = await html2canvas(pageContainer, {
        scale: 2,
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        useCORS: true,
        backgroundColor: "#ffffff",
        imageTimeout: 3000,
      });

      const imgData = canvas.toDataURL("image/png");

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297); // A4 mm

      root.unmount();
      document.body.removeChild(pageContainer);
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Failed to generate PDF. Check console for details.");
    throw err;
  }
}
