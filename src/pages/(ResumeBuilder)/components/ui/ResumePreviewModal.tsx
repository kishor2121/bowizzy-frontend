// Razorpay type declaration for TypeScript
declare global {
  interface Window {
    Razorpay?: any;
  }
}
import React, { useState, useRef, useEffect } from "react";
// Get resume amount from Vite env
const RESUME_AMOUNT = Number(import.meta.env.VITE_RESUME_AMOUNT) || 19;
import { Lock } from "lucide-react";
import { X, Download, Eye, Save } from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { getTemplateById } from "@/templates/templateRegistry";
import { pdf } from "@react-pdf/renderer";
import { usePageMarkers } from "@/hooks/usePageMarkers";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import api from "@/api";
import { getExperienceSummary } from "@/services/experienceSummaryService";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  templateId: string | null;
  editorPaginatePreview?: boolean;
  autoGeneratePreview?: boolean;
  autoShowPdfPreview?: boolean;
  onPreviewComplete?: () => void;
  onSaveAndExit?: () => Promise<void>;
  userId?: string;
  token?: string;
  resumeTemplateId?: string | null;
  username?: string;
  experienceSummary?: string;
  jobRole?: string;
  primaryColor?: string;
  fontFamily?: string;
}

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  templateId,
  editorPaginatePreview,
  autoGeneratePreview = false,
  autoShowPdfPreview = false,
  onPreviewComplete,
  onSaveAndExit,
  userId,
  token,
  resumeTemplateId,
  username,
  experienceSummary = '',
  jobRole = '',
  primaryColor = '#111827',
  fontFamily = 'Times New Roman, serif',
}) => {
  // Generate default resume name based on user info
  // Fix: Move showPayMsg state to top level to avoid conditional hook call
  const [showPayMsg, setShowPayMsg] = React.useState(false);
  const [payLoading, setPayLoading] = React.useState(false);
  const [resumeUnlocked, setResumeUnlocked] = React.useState(false);
  const generateDefaultResumeName = (): string => {
    // Prefer explicit `username` prop, then try resumeData.personal names
    let namePart = '';
    if (username && String(username).trim()) {
      namePart = String(username).trim();
    } else if (resumeData?.personal) {
      const fn = (resumeData.personal.firstName || '').trim();
      const ln = (resumeData.personal.lastName || '').trim();
      namePart = [fn, ln].filter(Boolean).join('');
    }

    if (!namePart) namePart = 'User';

    // sanitize: replace spaces with empty, remove disallowed chars
    namePart = namePart.replace(/\s+/g, '').replace(/[^a-zA-Z0-9-_]/g, '');

    const expPart = (experienceSummary || apiExperienceSummary || '').trim();
    const jobPart = (jobRole || apiJobRole || '').trim();
    const cleanedExp = expPart.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
    const cleanedJob = jobPart.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

    const parts = [namePart];
    if (cleanedExp) parts.push(cleanedExp);
    if (cleanedJob) parts.push(cleanedJob);
    parts.push('Bowizzy');

    return parts.join('_').replace(/_+/g, '_');
  };
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); 
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [resumeName, setResumeName] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [saveMode, setSaveMode] = useState<'download' | 'template' | null>(null);

  // Initialize resume name with dynamic default
  useEffect(() => {
    if (showNameDialog && !resumeName) {
      setResumeName(generateDefaultResumeName());
    }
  }, [showNameDialog]);

  // API-provided experience summary and job role (fetched when needed)
  const [apiExperienceSummary, setApiExperienceSummary] = useState<string>('');
  const [apiJobRole, setApiJobRole] = useState<string>('');

  // Fetch experience summary from backend when modal opens or when dialog opens
  useEffect(() => {
    const fetchExp = async () => {
      if (!userId || !token) return;
      try {
        const data = await getExperienceSummary(userId, token);
        if (data) {
          if (data.experience_summary) setApiExperienceSummary(String(data.experience_summary));
          if (data.job_role) setApiJobRole(String(data.job_role));
        }
      } catch (err) {
        // silent fail — leave fields empty
        // console.error('Failed to fetch experience summary', err);
      }
    };

    if (isOpen) fetchExp();
  }, [isOpen, userId, token]);

  const previewContentRef = useRef<HTMLDivElement>(null);
  const [modalPaginatePageCount, setModalPaginatePageCount] = useState<number | null>(null);
  const [modalPaginateCurrentPage, setModalPaginateCurrentPage] = useState<number>(1);
  const modalPaginatedRef = useRef<{ goTo: (i: number) => void; next: () => void; prev: () => void } | null>(null);
  const pdfPagesRef = useRef<HTMLDivElement>(null);

  // Get template
  const template = templateId ? getTemplateById(templateId) : null;
  const DisplayComponent = template?.displayComponent || template?.component;
  const PDFComponent = template?.pdfComponent; // The react-pdf component needed for PDFDownloadLink

  // Calculate page markers for preview
  const { totalPages } = usePageMarkers(previewContentRef, [
    resumeData,
  ]);

  // Auto-generate preview when modal opens
  useEffect(() => {
    if (!isOpen || !autoGeneratePreview || !PDFComponent) return;

    const generatePreview = async () => {
      setIsDownloading(true);
      try {
        const waitForPages = async () => {
          for (let i = 0; i < 20; i++) {
            const container = pdfPagesRef.current;
            const printableNow = container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
            if (printableNow && printableNow.length > 0 && (modalPaginatePageCount === null || printableNow.length === modalPaginatePageCount)) {
              return printableNow;
            }
            await new Promise((r) => setTimeout(r, 100));
          }
          const container = pdfPagesRef.current;
          return container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
        };

        let generatedBlob: Blob | null = null;

        const printable = await waitForPages();
        if (printable && printable.length > 0) {
          const pdfDoc = new jsPDF('p', 'pt', 'a4');
          const pdfWidth = pdfDoc.internal.pageSize.getWidth();
          const pdfHeight = pdfDoc.internal.pageSize.getHeight();

          for (let i = 0; i < printable.length; i++) {
            const canvas = await html2canvas(printable[i] as HTMLElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdfDoc.addPage();
            pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          }

          generatedBlob = pdfDoc.output('blob') as Blob;
        } else {
          const preparedData = await embedProfilePhoto(resumeData);
          const doc = <PDFComponent data={preparedData} primaryColor={primaryColor} fontFamily={fontFamily} />;
          const asPdf = pdf(doc);
          generatedBlob = await asPdf.toBlob();
        }

        if (generatedBlob) {
          setPdfBlob(generatedBlob);
          const url = URL.createObjectURL(generatedBlob);
          setPdfUrl(url);
          // Auto-show PDF preview if requested
          if (autoShowPdfPreview) {
            setShowDownloadDialog(true);
            onPreviewComplete?.();
          }
        }
      } catch (err) {
        console.error('PDF generation error:', err);
      } finally {
        setIsDownloading(false);
      }
    };

    generatePreview();
  }, [isOpen, autoGeneratePreview, autoShowPdfPreview, PDFComponent, resumeData]);

  if (!isOpen) return null;

  const uploadPdfToCloudinary = async (blob: Blob): Promise<string | null> => {
    try {
      // Convert Blob to File
      const file = new File([blob], `${resumeName.trim()}.pdf`, { type: 'application/pdf' });
      
      const result = await uploadToCloudinary(file);
      return result?.url || null;
    } catch (error) {
      console.error('Cloudinary PDF upload error:', error);
      return null;
    }
  };

  const saveResumeTemplate = async (templateFileUrl: string) => {
    if (!userId || !token) return;

    try {
      const templatePayload = {
        template_name: resumeName.trim(),
        template_id: templateId,
        template_file_url: templateFileUrl,
        thumbnail_url: 'IMAGE_URL_FOR_RESUME_THUMBNAIL',
      };

      const payload = {
        templates: [templatePayload],
      };

      const endpoint = resumeTemplateId
        ? `/users/${userId}/resume-templates/${resumeTemplateId}`
        : `/users/${userId}/resume-templates`;

      const method = resumeTemplateId ? 'put' : 'post';

      const response = await api[method](endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const handleSaveAndExitClick = () => {
    setSaveMode('template');
    setShowDownloadDialog(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setPdfBlob(null);
    setResumeName(generateDefaultResumeName());
    setShowNameDialog(true);
  };

  // Try to fetch remote profile photo and convert to data URL so react-pdf can embed it reliably
  const embedProfilePhoto = async (d: ResumeData): Promise<ResumeData> => {
    const clone: ResumeData = JSON.parse(JSON.stringify(d));
    const url = clone?.personal?.profilePhotoUrl;
    if (!url) return clone;
    if (String(url).startsWith('data:')) return clone; // already embedded

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch image');
      const blob = await res.blob();
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read image blob'));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
      });
      clone.personal.profilePhotoUrl = dataUrl;
      return clone;
    } catch {
      // fallback to an initials SVG data URL if fetch fails
      try {
        const initials = ((clone.personal?.firstName || '')[0] || '') + ((clone.personal?.lastName || '')[0] || '');
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='#f0f0f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='72' fill='#004b87' font-family='Helvetica, Arial, sans-serif' font-weight='bold'>${initials}</text></svg>`;
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
        clone.personal.profilePhotoUrl = dataUrl;
      } catch {
        // ignore, return clone without change
      }
      return clone;
    }
  };

  return (
    <>
      {/* Modal Container - Hidden when auto-showing PDF preview */}
      {!autoShowPdfPreview && (
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
                  {DisplayComponent && (
                    <div style={{ position: 'relative' }}>
                      {/* Top-right modal page indicator when paginated */}
                      {modalPaginatePageCount ? (
                        <div style={{ position: 'absolute', right: 12, top: 8, zIndex: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '6px 10px', borderRadius: 12, boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)' }}>
                            <button onClick={() => modalPaginatedRef.current?.prev()} disabled={modalPaginateCurrentPage <= 1} style={{ padding: '6px 8px', borderRadius: 8 }}>&lsaquo;</button>
                            <span style={{ fontSize: 13 }}>{modalPaginateCurrentPage}/{modalPaginatePageCount} Pages</span>
                            <button onClick={() => modalPaginatedRef.current?.next()} disabled={modalPaginateCurrentPage >= (modalPaginatePageCount || 1)} style={{ padding: '6px 8px', borderRadius: 8 }}>&rsaquo;</button>
                          </div>
                        </div>
                      ) : null}

                      {editorPaginatePreview === false ? (
                        <DisplayComponent
                          data={resumeData}
                          supportsPhoto={template?.supportsPhoto ?? false}
                        />
                      ) : (
                        <DisplayComponent
                          data={resumeData}
                          supportsPhoto={template?.supportsPhoto ?? false}
                          showPageBreaks={true}
                          onPageCountChange={(n: number) => setModalPaginatePageCount(n)}
                          onPageChange={(i: number) => setModalPaginateCurrentPage(i)}
                          pageControllerRef={modalPaginatedRef}
                        />
                      )}
                    </div>
                  )}
                  {/* <PageBreakMarkers markers={markers} /> */}
                </div>
              </div>

              {/* Hidden Print Version (no markers) */}
              <div className="print-version hidden">
                {DisplayComponent && (
                  <DisplayComponent
                    data={resumeData}
                    supportsPhoto={template?.supportsPhoto ?? false}
                  />
                )}
              </div>

              {/* Hidden paginated pages for PDF generation (rendered off-screen) */}
              <div style={{ position: 'absolute', left: '-9999px', top: 0 }} ref={pdfPagesRef} aria-hidden>
                {DisplayComponent && (
                  <DisplayComponent
                    data={resumeData}
                    supportsPhoto={template?.supportsPhoto ?? false}
                    showPageBreaks={true}
                    // make sure PDF-ready pages are rendered inside the DisplayComponent
                    onPageCountChange={(n: number) => setModalPaginatePageCount(n)}
                    onPageChange={(i: number) => setModalPaginateCurrentPage(i)}
                    pageControllerRef={modalPaginatedRef}
                  />
                )}
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

          {/* Save & Exit Button */}
          <button
            onClick={handleSaveAndExitClick}
            className="flex items-center bg-white text-left py-3 px-4 rounded-full border-0 hover:bg-gray-50 transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-5 h-5 mr-2 text-orange-500" />
            <span className="text-black text-sm font-medium whitespace-nowrap">
              Save & Exit
            </span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={() => setShowNameDialog(true)}
            className="flex items-center bg-orange-500 text-left py-3 px-4 rounded-full border-0 hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
          >
            <Download className="w-5 h-5 mr-2 text-white" />
            <span className="text-white text-sm font-medium whitespace-nowrap">
              Download PDF
            </span>
          </button>

          {/* Preview Button - Always Visible */}
          {PDFComponent && (
            <button
              onClick={async () => {
                setIsDownloading(true);
                try {
                  const waitForPages = async () => {
                    for (let i = 0; i < 20; i++) {
                      const container = pdfPagesRef.current;
                      const printableNow = container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                      if (printableNow && printableNow.length > 0 && (modalPaginatePageCount === null || printableNow.length === modalPaginatePageCount)) {
                        return printableNow;
                      }
                      await new Promise((r) => setTimeout(r, 100));
                    }
                    const container = pdfPagesRef.current;
                    return container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                  };

                  let generatedBlob: Blob | null = null;

                  const printable = await waitForPages();
                  if (printable && printable.length > 0) {
                    const pdfDoc = new jsPDF('p', 'pt', 'a4');
                    const pdfWidth = pdfDoc.internal.pageSize.getWidth();
                    const pdfHeight = pdfDoc.internal.pageSize.getHeight();

                    for (let i = 0; i < printable.length; i++) {
                      const canvas = await html2canvas(printable[i] as HTMLElement, { scale: 2, useCORS: true });
                      const imgData = canvas.toDataURL('image/png');
                      if (i > 0) pdfDoc.addPage();
                      pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    }

                    generatedBlob = pdfDoc.output('blob') as Blob;
                  } else {
                    const preparedData = await embedProfilePhoto(resumeData);
                    const doc = <PDFComponent data={preparedData} primaryColor={primaryColor} fontFamily={fontFamily} />;
                    const asPdf = pdf(doc);
                    generatedBlob = await asPdf.toBlob();
                  }

                  if (generatedBlob) {
                    setPdfBlob(generatedBlob);
                    const url = URL.createObjectURL(generatedBlob);
                    setPdfUrl(url);
                    setShowDownloadDialog(true);
                  }
                } catch (_err) {
                      console.error('PDF generation error:', _err);
                      alert('Failed to generate PDF. See console for details.');
                    } finally {
                      setIsDownloading(false);
                    }
                  }}
                  disabled={isDownloading}
                  className="flex items-center bg-blue-500 text-left py-3 px-4 rounded-full border-0 hover:bg-blue-600 transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="text-white text-sm font-medium whitespace-nowrap">
                        Processing...
                      </span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2 text-white" />
                      <span className="text-white text-sm font-medium whitespace-nowrap">
                        Preview
                      </span>
                    </>
                  )}
                </button>
              )}
        </div>
      </div>
      )}

      {/* Resume Name Dialog - Appears when Download PDF is clicked */}
      {showNameDialog && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setShowNameDialog(false)}
          />

          {/* Dialog Box */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-8 relative flex flex-col gap-6">
              {/* Close Button */}
              <button
                onClick={() => setShowNameDialog(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-semibold text-gray-900 text-center">
                Resume Name
              </h3>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter resume name
                </label>
                <input
                  type="text"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && resumeName.trim()) {
                      // Trigger download
                      const downloadBtn = document.querySelector('[data-download-trigger]') as HTMLButtonElement;
                      if (downloadBtn) downloadBtn.click();
                    }
                  }}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="e.g., Software Engineer Resume"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isDownloadingPdf}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!resumeName.trim()) return;
                    setIsDownloadingPdf(true);
                    try {
                      const waitForPages = async () => {
                        for (let i = 0; i < 20; i++) {
                          const container = pdfPagesRef.current;
                          const printableNow = container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                          if (printableNow && printableNow.length > 0 && (modalPaginatePageCount === null || printableNow.length === modalPaginatePageCount)) {
                            return printableNow;
                          }
                          await new Promise((r) => setTimeout(r, 100));
                        }
                        const container = pdfPagesRef.current;
                        return container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                      };

                      let finalBlob: Blob | null = null;

                      const printable = await waitForPages();
                      if (printable && printable.length > 0) {
                        const pdfDoc = new jsPDF('p', 'pt', 'a4');
                        const pdfWidth = pdfDoc.internal.pageSize.getWidth();
                        const pdfHeight = pdfDoc.internal.pageSize.getHeight();

                        for (let i = 0; i < printable.length; i++) {
                          const canvas = await html2canvas(printable[i] as HTMLElement, { scale: 2, useCORS: true });
                          const imgData = canvas.toDataURL('image/png');
                          if (i > 0) pdfDoc.addPage();
                          pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        }

                        finalBlob = pdfDoc.output('blob') as Blob;
                      } else {
                        const preparedData = await embedProfilePhoto(resumeData);
                        const doc = <PDFComponent data={preparedData} primaryColor={primaryColor} fontFamily={fontFamily} />;
                        const asPdf = pdf(doc);
                        finalBlob = await asPdf.toBlob();
                      }

                      // If saving template, upload to Cloudinary and save to API
                      if (saveMode === 'template') {
                        const cloudinaryUrl = await uploadPdfToCloudinary(finalBlob);
                        if (cloudinaryUrl) {
                          await saveResumeTemplate(cloudinaryUrl);
                          setShowNameDialog(false);
                          onClose();
                        } else {
                          alert('Failed to upload PDF to Cloudinary');
                        }
                      } else {
                        // Regular download
                        const url = URL.createObjectURL(finalBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${resumeName.trim()}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                        setShowNameDialog(false);
                      }
                    } catch (err) {
                      console.error('Error:', err);
                      alert('Failed to process PDF. See console for details.');
                    } finally {
                      setIsDownloadingPdf(false);
                      setSaveMode(null);
                    }
                  }}
                  disabled={!resumeName.trim() || isDownloadingPdf}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isDownloadingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {saveMode === 'template' ? 'Saving...' : 'Downloading...'}
                    </>
                  ) : (
                    saveMode === 'template' ? 'Save' : 'Download'
                  )}
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
              className="bg-white rounded-2xl shadow-2xl w-[95%] h-[95vh] max-w-7xl p-8 relative flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDownloadDialog(false);
                  if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                  }
                  setPdfUrl(null);
                  setPdfBlob(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* If PDF is not generated, show the form */}
              {!pdfUrl ? (
                <div className="overflow-y-auto flex-1">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-6 text-center">
                    Your Resume
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">Pages: <strong>{modalPaginatePageCount ?? totalPages}</strong></p>

                  {/* Loading State */}
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Click below to generate PDF preview</p>
                    </div>
                  </div>

                    {/* Preview Button - GENERATE AND PREVIEW */}
                    {PDFComponent && (
                      <button
                        onClick={async () => {
                              setIsDownloading(true);
                              try {
                                // Wait briefly for paginated pages to be rendered and counted (if any)
                                const waitForPages = async () => {
                                  // Prefer pages rendered inside our off-screen container to avoid picking up pages from other components
                                  for (let i = 0; i < 20; i++) {
                                    const container = pdfPagesRef.current;
                                    const printableNow = container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                                    if (printableNow && printableNow.length > 0 && (modalPaginatePageCount === null || printableNow.length === modalPaginatePageCount)) {
                                      return printableNow;
                                    }
                                    // small pause
                                    // eslint-disable-next-line no-await-in-loop
                                    await new Promise((r) => setTimeout(r, 100));
                                  }
                                  const container = pdfPagesRef.current;
                                  return container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                                };

                                let generatedBlob: Blob | null = null;

                                const printable = await waitForPages();
                                if (printable && printable.length > 0) {
                                  // Generate PDF from paginated DOM
                                  const pdfDoc = new jsPDF('p', 'pt', 'a4');
                                  const pdfWidth = pdfDoc.internal.pageSize.getWidth();
                                  const pdfHeight = pdfDoc.internal.pageSize.getHeight();

                                  for (let i = 0; i < printable.length; i++) {
                                    // html2canvas each page
                                    const canvas = await (html2canvas as any)(printable[i] as HTMLElement, { scale: 2, useCORS: true });
                                    const imgData = canvas.toDataURL('image/png');
                                    if (i > 0) pdfDoc.addPage();
                                    pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                  }

                                  generatedBlob = pdfDoc.output('blob') as Blob;
                                } else {
                                  // Fallback: use react-pdf generation
                                  const preparedData = await embedProfilePhoto(resumeData);
                                  const doc = <PDFComponent data={preparedData} primaryColor={primaryColor} fontFamily={fontFamily} />;
                                  const asPdf = pdf(doc);
                                  generatedBlob = await asPdf.toBlob();
                                }

                                // Store the blob and create preview URL
                                if (generatedBlob) {
                                  setPdfBlob(generatedBlob);
                                  const url = URL.createObjectURL(generatedBlob);
                                  setPdfUrl(url);
                                }
                              } catch (err) {
                                console.error('PDF generation error:', err);
                                alert('Failed to generate PDF. See console for details.');
                              } finally {
                                setIsDownloading(false);
                              }
                            }}
                        disabled={isDownloading}
                        className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {isDownloading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing</>) : (<><Eye className="w-4 h-4" /> Preview</>)}
                      </button>
                    )}

                    {/* Download (.pdf) Button */}
                    {PDFComponent && (
                      <button
                        onClick={async () => {
                              setIsDownloading(true);
                              try {
                                // Wait briefly for paginated pages to be rendered and counted (if any)
                                const waitForPages = async () => {
                                  // Prefer pages rendered inside our off-screen container to avoid picking up pages from other components
                                  for (let i = 0; i < 20; i++) {
                                    const container = pdfPagesRef.current;
                                    const printableNow = container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                                    if (printableNow && printableNow.length > 0 && (modalPaginatePageCount === null || printableNow.length === modalPaginatePageCount)) {
                                      return printableNow;
                                    }
                                    // small pause
                                    // eslint-disable-next-line no-await-in-loop
                                    await new Promise((r) => setTimeout(r, 100));
                                  }
                                  const container = pdfPagesRef.current;
                                  return container ? container.querySelectorAll('.pdf-print-page') : document.querySelectorAll('.pdf-print-page');
                                };

                                const printable = await waitForPages();
                                if (printable && printable.length > 0) {
                                  // Generate PDF from paginated DOM
                                  const pdfDoc = new jsPDF('p', 'pt', 'a4');
                                  const pdfWidth = pdfDoc.internal.pageSize.getWidth();
                                  const pdfHeight = pdfDoc.internal.pageSize.getHeight();

                                  for (let i = 0; i < printable.length; i++) {
                                    // html2canvas each page
                                    const canvas = await (html2canvas as any)(printable[i] as HTMLElement, { scale: 2, useCORS: true });
                                    const imgData = canvas.toDataURL('image/png');
                                    if (i > 0) pdfDoc.addPage();
                                    pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                  }

                                  pdfDoc.save('resume.pdf');
                                } else {
                                  // Fallback: use react-pdf generation
                                  const preparedData = await embedProfilePhoto(resumeData);
                                  const doc = <PDFComponent data={preparedData} />;
                                  const asPdf = pdf(doc);
                                  const blob: Blob = await asPdf.toBlob();
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = 'resume.pdf';
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  URL.revokeObjectURL(url);
                                }
                              } catch (err) {
                                console.error('PDF generation error:', err);
                                alert('Failed to generate PDF. See console for details.');
                              } finally {
                                setIsDownloading(false);
                              }
                            }}
                        disabled={isDownloading}
                        className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {isDownloading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing</>) : (<><Download className="w-4 h-4" /> Download</>)}
                      </button>
                    )}
                    
                    {/* Fallback if PDFComponent is not defined */}
                    {!PDFComponent && (
                      <>
                        <button
                          disabled
                          className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          Preview
                        </button>
                        <button
                          disabled
                          className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          Download
                        </button>
                      </>
                    )}
                  </div>
              ) : (
                // PDF Preview Section
                <div className="flex flex-col flex-1">
                  {/* Header with Resume Name */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bowizzy Preview
                    </h3>
                  </div>

                  {/* PDF Viewer */}
                  <div className="flex-1 overflow-auto bg-gray-100 rounded-lg mb-4">
                      {/* Show Lock icon and label above PDF preview for template12-20 */}
                      {(() => {
                        const match = templateId && templateId.match(/^template(\d+)$/);
                        const num = match ? parseInt(match[1], 10) : null;
                        if (num && num >= 12 && num <= 20) {
                          return (
                            <div className="flex flex-col items-center justify-center mb-4">
                              <Lock className="w-8 h-8 text-gray-500 mb-2" />
                              <span className="text-sm font-semibold text-gray-700">Premium Resume</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <iframe
                        src={pdfUrl ? `${pdfUrl}#toolbar=0` : ''}
                        className="w-full h-full border-none"
                        title="Resume PDF Preview"
                      />
                  </div>

                  {/* Footer Buttons */}
                  {/* Show Lock icon for template12-20 below PDF preview, above Save & Exit */}
                  {(() => {
                    const match = templateId && templateId.match(/^template(\d+)$/);
                    const num = match ? parseInt(match[1], 10) : null;
                    const isLocked = num && num >= 12 && num <= 20;
                    if (isLocked) {
                      return (
                        <div className="flex flex-col items-center justify-center mb-4">
                          <button
                            type="button"
                            className="group flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 hover:bg-orange-200 active:bg-orange-400 transition-colors border-2 border-orange-200 focus:outline-none relative"
                            style={{ outline: 'none' }}
                            onClick={() => setShowPayMsg(true)}
                            title={`Unlock this resume for ₹${RESUME_AMOUNT}`}
                          >
                            <Lock className="w-8 h-8 text-orange-400 group-hover:text-orange-500 group-active:text-white transition-colors" />
                          </button>
                          <span className="text-gray-700 font-medium mt-2">Payment required to download this resume</span>
                          {showPayMsg && (
                            <div className="mt-4 p-4 bg-orange-100 border border-orange-400 rounded-lg text-orange-700 text-center font-semibold z-50">
                              Resume is locked. You need to pay <span className="text-orange-600 font-bold">₹{RESUME_AMOUNT}</span> to unlock.<br/>
                              <button
                                className="mt-3 px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={payLoading}
                                onClick={async () => {
                                  setPayLoading(true);
                                  try {
                                    // Step 1: Load Razorpay script if not already loaded
                                    const loadRazorpayScript = () => new Promise<void>((resolve, reject) => {
                                      if (typeof window !== 'undefined' && window.Razorpay) {
                                        return resolve();
                                      }
                                      const script = document.createElement('script');
                                      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                      script.onload = () => resolve();
                                      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
                                      document.body.appendChild(script);
                                    });
                                    await loadRazorpayScript();

                                    // Get user data and token from localStorage
                                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                    const token = userData?.token;
                                    if (!token) {
                                      alert('User not authenticated. Please login again.');
                                      setPayLoading(false);
                                      return;
                                    }

                                    // Step 1: Call /payment/create-order to get order_id
                                    const createOrderResponse = await api.post(
                                      '/payment/create-order',
                                      { amount: RESUME_AMOUNT },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    );

                                    const orderData = createOrderResponse?.data || createOrderResponse;
                                    const orderId = orderData?.id;
                                    const orderAmount = orderData?.amount; // in paise from backend
                                    const currency = orderData?.currency || 'INR';

                                    if (!orderId || !orderAmount) {
                                      throw new Error('Failed to create order: missing order_id or amount');
                                    }

                                    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
                                    if (!razorpayKeyId) {
                                      throw new Error('Razorpay Key ID not configured in environment variables');
                                    }

                                    // Step 2: Open Razorpay checkout with order details
                                    const options = {
                                      key: razorpayKeyId,
                                      amount: orderAmount,
                                      currency: currency,
                                      name: 'Bowizzy',
                                      description: 'Premium Resume Template Unlock',
                                      order_id: orderId,
                                      modal: {
                                        ondismiss: () => {
                                          setPayLoading(false);
                                        },
                                      },
                                      // Step 3: Handle successful payment
                                      handler: async (response: any) => {
                                        try {
                                          // Debug: log Razorpay handler response for prod troubleshooting
                                          console.log('Razorpay handler response:', response);

                                          // Call /payment/verify with payment details
                                          const verifyResponse = await api.post(
                                            '/payment/verify',
                                            {
                                              razorpay_order_id: response.razorpay_order_id,
                                              razorpay_payment_id: response.razorpay_payment_id,
                                              razorpay_signature: response.razorpay_signature,
                                            },
                                            {
                                              headers: {
                                                Authorization: `Bearer ${token}`,
                                              },
                                            }
                                          );

                                          // Debug: log raw verify response
                                          console.log('verifyResponse (raw):', verifyResponse);

                                          // Step 4: If verification successful, unlock resume
                                          const responseData = verifyResponse?.data || verifyResponse;
                                          console.log('verifyResponse data:', responseData);

                                          const isSuccess =
                                            responseData?.status === 'success' ||
                                            Boolean(responseData?.message && String(responseData.message).toLowerCase().includes('success')) ||
                                            responseData?.message === 'Payment successful' ||
                                            verifyResponse?.status === 200;

                                          if (isSuccess) {
                                            setResumeUnlocked(true);
                                            setShowPayMsg(false);
                                            alert('Payment successful! Resume unlocked.');
                                          } else {
                                            throw new Error(`Payment verification returned: ${JSON.stringify(responseData)}`);
                                          }
                                        } catch (verifyErr) {
                                          console.error('Payment verification error:', verifyErr);
                                          alert('Payment verification failed. Please contact support if amount was deducted.');
                                        } finally {
                                          setPayLoading(false);
                                        }
                                      },
                                      prefill: {
                                        name: userData?.name || userData?.full_name || '',
                                        email: userData?.email || '',
                                      },
                                      theme: {
                                        color: '#FF8251',
                                      },
                                    };

                                    // Initialize and open Razorpay checkout
                                    const rzp = new window.Razorpay(options);
                                    if (typeof rzp.on === 'function') {
                                      rzp.on('payment.failed', (failureResponse: any) => {
                                        setPayLoading(false);
                                        console.error('Razorpay payment failed:', failureResponse);
                                        alert(`Payment failed: ${failureResponse?.error?.description || 'Unknown error'}`);
                                      });
                                    }
                                    rzp.open();
                                  } catch (err) {
                                    setPayLoading(false);
                                    console.error('Payment initialization error:', err);
                                    alert(`Failed to initiate payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
                                  }
                                }}
                              >
                                {payLoading ? 'Initiating Payment...' : `Pay ₹${RESUME_AMOUNT}`}
                              </button>
                              <button
                                className="ml-4 mt-3 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                                onClick={() => { setShowPayMsg(false); setPayLoading(false); }}
                                disabled={payLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          onClose();
                          setShowDownloadDialog(false);
                          if (pdfUrl) {
                            URL.revokeObjectURL(pdfUrl);
                          }
                          setPdfUrl(null);
                          setPdfBlob(null);
                        }}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Back to Edit
                      </button>
                      <button
                        onClick={handleSaveAndExitClick}
                        className="px-6 py-2.5 text-sm font-medium border-2 rounded-full flex items-center gap-2 transition-colors bg-white border-orange-400 text-gray-800 hover:bg-orange-50 shadow-sm"
                        disabled={false}
                      >
                        <Save className="w-4 h-4 text-orange-500" />
                        Save & Exit
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowDownloadDialog(false);
                        if (pdfUrl) {
                          URL.revokeObjectURL(pdfUrl);
                        }
                        setPdfUrl(null);
                        setPdfBlob(null);
                        setResumeName(generateDefaultResumeName());
                        setShowNameDialog(true);
                      }}
                      className={`px-6 py-2.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors ${(() => {
                        const match = templateId && templateId.match(/^template(\d+)$/);
                        const num = match ? parseInt(match[1], 10) : null;
                        if (num && num >= 12 && num <= 20 && !resumeUnlocked) {
                          return 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60';
                        }
                        return 'text-white bg-orange-500 hover:bg-orange-600';
                      })()}`}
                      disabled={(() => {
                        const match = templateId && templateId.match(/^template(\d+)$/);
                        const num = match ? parseInt(match[1], 10) : null;
                        return num && num >= 12 && num <= 20 && !resumeUnlocked;
                      })()}
                    >
                      <Download className={`w-4 h-4 ${(() => {
                        const match = templateId && templateId.match(/^template(\d+)$/);
                        const num = match ? parseInt(match[1], 10) : null;
                        return num && num >= 12 && num <= 20 && !resumeUnlocked ? 'text-gray-400' : 'text-white';
                      })()}`} />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
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