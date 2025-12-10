import React, { useState, useRef } from "react";
import { X, Download, Printer, Copy, Save } from "lucide-react"; // Added Copy and Save icons
import type { ResumeData } from "@/types/resume";
import { getTemplateById } from "@/templates/templateRegistry";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PageBreakMarkers from "../PageBreakMarkers";
import { usePageMarkers } from "@/hooks/usePageMarkers";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  templateId: string | null;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  templateId,
}) => {
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [resumeName, setResumeName] = useState("");
  // Added state for loading status during PDF download (good practice)
  const [isDownloading, setIsDownloading] = useState(false); 

  const previewContentRef = useRef<HTMLDivElement>(null);

  // Get template
  const template = templateId ? getTemplateById(templateId) : null;
  const DisplayComponent = template?.displayComponent || template?.component;
  const PDFComponent = template?.pdfComponent; // The react-pdf component needed for PDFDownloadLink

  // Static Data (Used for the UI fields as requested)
  const STATIC_RESUME_LINK = "https://resume.builder.io/DQI/aarav-mehta-python-developer"; 
  const STATIC_THUMBNAIL_URL = "IMAGE_URL_FOR_RESUME_THUMBNAIL"; 

  // Helper function placeholders for buttons (static click logic)
  const handleStaticClick = (action) => console.log(`${action} button clicked.`);

  // Calculate page markers for preview
  const { markers, totalPages } = usePageMarkers(previewContentRef, [
    resumeData,
  ]);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    // Show the name dialog first
    setShowNameDialog(true);
  };

  const handlePrintClick = () => {
    window.print();
  };

  const handleNameSubmit = () => {
    if (!resumeName.trim()) return;
    // Close name dialog and open download dialog
    setShowNameDialog(false);
    setShowDownloadDialog(true);
  };

  return (
    <>
      {/* ... (Existing Backdrop and Modal Container code remains the same) ... */}

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        style={{
          left: "255px",
          top: "83px",
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex items-center">
        {/* Resume Preview */}
        <div
          className="h-[calc(100vh-160px)] overflow-auto scrollbar-hide"
          style={{ width: "calc(100vw - 320px)", maxWidth: "1100px" }}
        >
          <div className="p-8 flex justify-center">
            <div className="flex flex-col items-center">
              {/* Live Preview */}
              <div
                className="shadow-lg w-full relative resume-preview-wrapper"
                style={{
                  transform: "scale(1)",
                  transformOrigin: "center",
                  maxWidth: "100%",
                }}
              >
                <div
                  ref={previewContentRef}
                  className="resume-preview-content relative"
                >
                  {DisplayComponent && <DisplayComponent data={resumeData} />}
                  {/* <PageBreakMarkers markers={markers} /> */}
                </div>
              </div>

              {/* Hidden Print Version (no markers) */}
              <div className="print-version hidden">
                {DisplayComponent && <DisplayComponent data={resumeData} />}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-0 transform -translate-x-30">
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

          {/* Print Button */}
          <button
            onClick={handlePrintClick}
            className="flex items-center bg-white text-left py-3 px-4 rounded-full border-0 hover:bg-gray-50 transition-colors shadow-md cursor-pointer"
          >
            <Printer className="w-5 h-5 mr-2 text-orange-500" />
            <span className="text-black text-sm font-medium whitespace-nowrap">
              Print / Save as PDF
            </span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadClick}
            className="flex items-center bg-white text-left py-3 px-4 rounded-full border-0 hover:bg-gray-50 transition-colors shadow-md cursor-pointer"
          >
            <Download className="w-5 h-5 mr-2 text-orange-500" />
            <span className="text-black text-sm font-medium whitespace-nowrap">
              Download PDF
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Download Dialog */}
      {showDownloadDialog && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setShowDownloadDialog(false)}
          />

          {/* Dialog Box */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm md:max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowDownloadDialog(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Title: Changed to match the image text ("Your Resume") */}
              <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-6 text-center">
                Your Resume
              </h3>

              {/* Resume Thumbnail Image */}
              <div className="flex justify-center mb-6">
                <div className="w-[180px] h-auto border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={STATIC_THUMBNAIL_URL}
                    alt="Resume Thumbnail Preview"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Resume Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume Name
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    placeholder="Enter resume name"
                  />
                  {/* Submit button (Static Icon) */}
                  <button
                    onClick={() => handleStaticClick("Submit Name")}
                    className="p-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    aria-label="Save resume name"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add resume name and submit it by clicking on the check button
                  to get the resume link.
                </p>
              </div>

              {/* Resume Link Field (Static) */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume Link
                </label>
                <input
                  type="text"
                  value={STATIC_RESUME_LINK}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 rounded-lg text-orange-600 truncate"
                />
              </div>

              {/* Action Buttons (Save Resume, Copy Link, Download .pdf) */}
              <div className="flex justify-between space-x-3 w-full">
                {/* Save Resume Button (Static) */}
                <button
                  onClick={() => handleStaticClick("Save Resume")}
                  className="flex-1 px-3 py-2 text-sm font-medium text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                >
                    <Save className="w-4 h-4" />
                    Save Resume
                </button>

                {/* Copy Link Button (Static) */}
                <button
                  onClick={() => handleStaticClick("Copy Link")}
                  className="flex-1 px-3 py-2 text-sm font-medium text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                >
                    <Copy className="w-4 h-4" />
                    Copy Link
                </button>

                {/* Download (.pdf) Button - FUNCTIONAL DOWNLOAD */}
                {/* We wrap the button content inside PDFDownloadLink */}
                {PDFComponent && (
                  <PDFDownloadLink
                    document={<PDFComponent data={resumeData} />}
                    fileName={`${resumeName.trim() || 'resume'}.pdf`}
                    // Optional: Call a function when the file starts generating
                    onClick={() => setIsDownloading(true)} 
                  >
                    {({ loading, error }) => {
                        // Reset loading state after download is complete
                        if (!loading && isDownloading) {
                            setIsDownloading(false);
                            console.log("PDF generated successfully.");
                        }

                        // Handle error state (optional)
                        if (error) {
                            console.error("PDF Download Error:", error);
                        }

                        return (
                            <button
                                disabled={loading || !resumeName.trim() || !PDFComponent}
                                // Styled to match the solid orange background in the image
                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                                {loading ? (
                                    // Spinner while PDF is being generated
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      Processing
                                    </>
                                ) : (
                                    <>
                                      <Download className="w-4 h-4" />
                                      Download (.pdf)
                                    </>
                                )}
                            </button>
                        );
                    }}
                  </PDFDownloadLink>
                )}
                
                {/* Fallback if PDFComponent is not defined */}
                {!PDFComponent && (
                  <button
                    disabled
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    Download (.pdf)
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default ResumePreviewModal;