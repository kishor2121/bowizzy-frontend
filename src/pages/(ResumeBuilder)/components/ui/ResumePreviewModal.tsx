import React, { useState, useRef, useCallback } from "react";
import { X, Download, Copy, Check, Loader2 } from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { getTemplateById } from "@/templates/templateRegistry";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { uploadPdfToCloudinary } from "@/utils/uploadPdfToCloudinary";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/ResumePDF"; 

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  templateId: string;
}

// Simple class-based ErrorBoundary to avoid full app crash on render errors
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean; error?: Error | null }> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ResumePreviewModal caught error:", error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-2">Unexpected Application Error!</h2>
            <p className="text-sm text-gray-600 mb-4">
              An error occurred while rendering the resume preview. Check the
              console for details.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-orange-500 text-white rounded-md"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  templateId,
}) => {
  // ====== STATE ======
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [copied, setCopied] = useState(false);

  // replaces old isDownloading; this now covers saving/uploading/downloading
  const [isProcessing, setIsProcessing] = useState(false);

  // Cloudinary URL for the generated PDF
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  // Whether user clicked "save" or "download"
  const [actionType, setActionType] = useState<"save" | "download" | null>(
    null
  );

  // Simple status/info message for user
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ====== TEMPLATE + REF FOR PDF CAPTURE ======
  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;

  // This ref wraps the resume content we want to turn into a PDF
  const pdfRef = useRef<HTMLDivElement | null>(null);


  // ====== PDF CAPTURE & CLOUDINARY UPLOAD HELPERS ======

  const captureElementToPdfBlob = useCallback(
    async (el: HTMLElement, maxSizeBytes = 2 * 1024 * 1024) => {
      // Add a temporary stylesheet and class to reduce reliance on CSS color functions
      const styleId = "pdf-capture-fix-style";
      let styleEl = document.getElementById(styleId) as
        | HTMLStyleElement
        | null;

      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = `
          .pdf-capture, .pdf-capture * {
            color: #111 !important;
            background-color: transparent !important;
            border-color: #ddd !important;
            box-shadow: none !important;
          }
          .pdf-capture { background: #ffffff !important; }
        `;
        document.head.appendChild(styleEl);
      }

      // Apply the class to the element to capture
      el.classList.add("pdf-capture");

      // Try combinations of scale and JPEG quality until we are below target size.
      const scaleCandidates = [2, 1.5, 1.2, 1];
      const qualityCandidates = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

      let bestBlob: Blob | null = null;
      let bestSize = Infinity;

      for (const scaleOption of scaleCandidates) {
        // render at this scale
        const canvas = await html2canvas(el, {
          scale: scaleOption,
          useCORS: true,
          allowTaint: true,
        });

        for (const q of qualityCandidates) {
          try {
            const imgData = canvas.toDataURL("image/jpeg", q);

            const pdf = new jsPDF({
              unit: "px",
              format: [canvas.width, canvas.height],
            });

            pdf.addImage(
              imgData,
              "JPEG",
              0,
              0,
              canvas.width,
              canvas.height,
              undefined,
              "FAST"
            );
            const blob = pdf.output("blob");

            if (blob.size <= maxSizeBytes) {
              // Clean up class and return immediately
              el.classList.remove("pdf-capture");
              return blob;
            }

            if (blob.size < bestSize) {
              bestBlob = blob;
              bestSize = blob.size;
            }
          } catch (err) {
            // ignore and continue trying other qualities
            console.warn("Capture/compress attempt failed", err);
          }
        }
      }

      // Clean up temp class
      el.classList.remove("pdf-capture");

      // If none were under threshold, return the smallest blob we produced (may still be > limit)
      if (bestBlob) return bestBlob;

      // Fallback: one last try with default smaller scale
      const canvasFinal = await html2canvas(el, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
      });
      const imgDataFinal = canvasFinal.toDataURL("image/jpeg", 0.5);
      const pdfFinal = new jsPDF({
        unit: "px",
        format: [canvasFinal.width, canvasFinal.height],
      });
      pdfFinal.addImage(
        imgDataFinal,
        "JPEG",
        0,
        0,
        canvasFinal.width,
        canvasFinal.height
      );
      return pdfFinal.output("blob");
    },
    []
  );

  const generatePdfAndUpload = useCallback(
    async (name: string) => {
      if (!name.trim()) throw new Error("Provide a name");
      if (!pdfRef.current) throw new Error("Preview element not available");

      setIsProcessing(true);
      setStatusMessage("Generating PDF and uploading to Cloudinary...");

      try {
        const blob = await captureElementToPdfBlob(pdfRef.current);
        const file = new File([blob], `${name}.pdf`, {
          type: "application/pdf",
        });

        const res = await uploadPdfToCloudinary(file);

        if (res && res.url) {
          setCloudinaryUrl(res.url);
          setStatusMessage(
            `Resume "${name}" successfully saved and uploaded to Cloudinary!`
          );
          return res.url;
        }

        throw new Error("Upload failed");
      } finally {
        setIsProcessing(false);
      }
    },
    [captureElementToPdfBlob]
  );

  // ====== BUTTON HANDLERS (MAIN VIEW) ======

  const handleDownloadClick = () => {
    setActionType("download");
    setStatusMessage(null);
    setShowNameDialog(true);
  };

  const handleSaveAndExitClick = () => {
    setActionType("save");
    setStatusMessage(null);
    setShowNameDialog(true);
  };

  const handleNameSubmit = async () => {
    if (!resumeName.trim()) return;

    setShowNameDialog(false);

    if (actionType === "save") {
      try {
        await generatePdfAndUpload(resumeName);
        // After saving & uploading, close modal (existing "Save & Exit" behavior)
        onClose();
      } catch (error) {
        console.error(error);
        // If saving failed, still show download dialog so user can try download
        setShowDownloadDialog(true);
      }
    } else {
      // For "Download" path, just go to the download dialog
      setShowDownloadDialog(true);
    }
  };

  // ====== BUTTON HANDLERS (DOWNLOAD DIALOG) ======

  const handleSaveResume = async () => {
    if (!resumeName.trim()) return;

    // If already uploaded, just show message
    if (cloudinaryUrl) {
      setStatusMessage("Resume is already saved and Cloudinary link is ready!");
      return;
    }

    try {
      await generatePdfAndUpload(resumeName);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to save & upload resume.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeName.trim()) return;

    setIsProcessing(true);
    setStatusMessage("Preparing PDF for download...");

    try {
      // If we already have Cloudinary URL, just open it
      if (cloudinaryUrl) {
        const a = document.createElement("a");
        a.href = cloudinaryUrl;
        a.target = "_blank";
        a.click();
        setStatusMessage("Opened Cloudinary PDF in a new tab.");
        return;
      }

      // Otherwise generate + upload, then open
      const url = await generatePdfAndUpload(resumeName);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.click();
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to download PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!cloudinaryUrl) {
      setStatusMessage("Generate the link by saving the resume first.");
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cloudinaryUrl);
      } else {
        // Fallback for older browsers
        const tmp = document.createElement("input");
        tmp.value = cloudinaryUrl;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }

      setCopied(true);
      setStatusMessage("Resume link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
        setStatusMessage(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to copy link.");
    }
  };

  const generateResumeLinkDisplay = () => {
    if (cloudinaryUrl) return cloudinaryUrl;
    if (resumeName.trim())
      return "Click 'Save Resume' to generate Cloudinary URL.";
    return "Enter resume name to proceed.";
  };

  if (!isOpen) return null;

  return (
    <ErrorBoundary>
      {/* Backdrop - Only blurs main content area, not sidebar/nav */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        style={{
          left: "255px",
          top: "83px",
        }}
        onClick={onClose}
      />

      {/* Modal Container - Slides from right */}
      <div className="fixed right-50 top-0 bottom-0 z-50 flex items-center">
        {/* Resume Preview Modal */}
        <div
          className=" h-[560px] overflow-auto scrollbar-hide"
          style={{ width: "650px" }}
        >
          <div className="p-8 flex justify-center ">
            <div className="flex flex-col items-center">
              {/* Resume Preview */}
              <div
                className="shadow-lg"
                style={{
                  transform: "scale(1)",
                  transformOrigin: "center",
                }}
              >
                {/* Wrap the template with the ref so it can be captured as PDF */}
                <div ref={pdfRef}>
                  {TemplateComponent && <TemplateComponent data={resumeData} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Positioned on the right edge */}
        <div className="flex flex-col gap-4 ml-4">
          {/* Back to Edit Button */}
          <button
            onClick={onClose}
            className="flex items-center bg-white text-left py-3 px-4 rounded-full border-0 hover:bg-gray-50 transition-colors shadow-md cursor-pointer"
          >
            <X className="w-5 h-5 mr-2" />
            <span className="text-black text-sm font-medium whitespace-nowrap">
              Back to Edit
            </span>
          </button>

          {/* Save and Exit Button */}
          <button
            onClick={handleSaveAndExitClick}
            disabled={isProcessing}
            className="flex items-center bg-white text-left py-3 px-4 rounded-full border-0 hover:bg-gray-50 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isProcessing && actionType === "save" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-orange-500" />
            ) : (
              <Download className="w-5 h-5 mr-2 text-orange-500" />
            )}
            <span className="text-black text-sm font-medium whitespace-nowrap">
              {isProcessing && actionType === "save"
                ? "Saving & Uploading..."
                : "Save and Exit"}
            </span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadClick}
            disabled={isProcessing}
            className="flex items-center bg-white text-left py-3 px-4 rounded-full border-0 hover:bg-gray-50 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isProcessing && actionType === "download" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-orange-500" />
            ) : (
              <Download className="w-5 h-5 mr-2 text-orange-500" />
            )}
            <span className="text-black text-sm font-medium whitespace-nowrap">
              Download
            </span>
          </button>
        </div>
      </div>

      {/* Resume Name Dialog */}
      {showNameDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setShowNameDialog(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowNameDialog(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Resume Name
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 ">
                  Save As (Name)
                </label>
                <input
                  type="text"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  placeholder="Enter Resume Name"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="px-6 py-2.5 text-sm font-medium text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNameSubmit}
                  disabled={!resumeName.trim()}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionType === "save" ? "Save and Exit" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Download Dialog with Cloudinary Link + actions */}
            {/* Download Dialog with Cloudinary Link + actions */}
      {showDownloadDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setShowDownloadDialog(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[50%] max-w-3xl p-8 relative max-h-[65vh] overflow-y-auto">
              <button
                onClick={() => setShowDownloadDialog(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Your Resume
              </h3>

              {statusMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                    statusMessage.includes("successfully") ||
                    statusMessage.includes("already")
                      ? "bg-green-100 text-green-700"
                      : statusMessage.includes("Failed")
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="flex gap-6 mb-8">
                {/* Resume Details */}
                <div className="flex-1 min-w-0">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent pr-12"
                        placeholder="Enter resume name"
                      />
                    </div>
                  </div>

                  {/* <div className="mb-6"> */}
                    {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloudinary PDF Link
                    </label> */}
                    {/* <div className="flex items-center gap-2"> */}
                      {/* <div
                        className={`flex-1 px-4 py-3 text-sm rounded-lg break-all font-mono text-gray-800 ${
                          cloudinaryUrl
                            ? "bg-gray-50 border border-gray-300"
                            : "bg-yellow-50 border border-yellow-300 text-yellow-800"
                        }`}
                      >
                        {isProcessing ? (
                          <span className="flex items-center text-orange-500">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating link...
                          </span>
                        ) : (
                          generateResumeLinkDisplay()
                        )}
                      </div> */}
                      {/* <button
                        onClick={handleCopyLink}
                        disabled={!cloudinaryUrl || isProcessing}
                        className={`p-3 rounded-lg transition-colors flex items-center justify-center ${
                          copied
                            ? "bg-green-500 text-white"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        } disabled:opacity-50`}
                      >
                        {copied ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button> */}
                    {/* </div> */}
                  {/* </div> */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">

                {/* SAVE RESUME (Cloudinary upload – unchanged) */}
                {/* <button
                  onClick={handleSaveResume}
                  disabled={
                    isProcessing || !resumeName.trim() || !!cloudinaryUrl
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing && !cloudinaryUrl ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {cloudinaryUrl
                      ? "Link Ready"
                      : "Save Resume (Generate Link)"}
                  </span>
                </button> */}

                {/* DOWNLOAD PDF USING REACT-PDF */}
                <PDFDownloadLink
                  document={<ResumePDF data={resumeData} />}
                  fileName={`${resumeName || "resume"}.pdf`}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading || !resumeName.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{loading ? "Preparing..." : "Download (.pdf)"}</span>
                    </button>
                  )}
                </PDFDownloadLink>

              </div>
            </div>
          </div>
        </>
      )}
    </ErrorBoundary>
  );
};

export default ResumePreviewModal;

