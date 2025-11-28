import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  RotateCcw,
  X,
  Save,
  Upload,
} from "lucide-react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { deleteFromCloudinary } from "@/utils/deleteFromCloudinary";
import RichTextEditor from "@/components/ui/RichTextEditor";

import {
  updateCertificateDetails,
  saveCertificateDetails,
  deleteCertificate,
  // saveCertificatesFromForm is imported in ProfileForm
} from "@/services/certificateService";

interface CertificateFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  userId: string;
  token: string;
}

interface Certificate {
  id: string; // Client-side ID
  certificateType: string;
  certificateTitle: string;
  domain: string;
  certificateProvidedBy: string;
  date: string;
  description: string;
  uploadedFile: File | null;
  uploadedFileName: string;
  isExpanded: boolean;
  uploadedFileUrl?: string;
  uploadedFileType?: string;
  certificate_id?: number; // DB ID
}

export default function CertificationDetailsForm({
  onNext,
  onBack,
  initialData = {},
  userId,
  token,
}: CertificateFormProps) {
  // Handler for initializing certificates
  const initialCertificates: Certificate[] =
    initialData.certificates && initialData.certificates.length > 0
      ? initialData.certificates.map((c: any) => ({
          ...c,
          id: c.id || c.certificate_id?.toString() || Date.now().toString(),
        }))
      : [
          {
            id: "1",
            certificateType: "",
            certificateTitle: "",
            domain: "",
            certificateProvidedBy: "",
            date: "",
            description: "",
            uploadedFile: null,
            uploadedFileName: "",
            isExpanded: true,
          },
        ];

  const [certificates, setCertificates] =
    useState<Certificate[]>(initialCertificates);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- Change Tracking / Feedback ---
  const [certChanges, setCertChanges] = useState<Record<string, string[]>>({});
  const [certFeedback, setCertFeedback] = useState<Record<string, string>>({});
  const initialCertsRef = useRef<Record<string, Certificate>>({});
  const deletedCertificateIds = useRef<number[]>([]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Handler for initializing refs on mount
  useEffect(() => {
    certificates.forEach((c) => {
      initialCertsRef.current[c.id] = { ...c };
    });
  }, []);

  // Handler for checking Certificate changes
  useEffect(() => {
    const changes: Record<string, string[]> = {};
    certificates.forEach((current) => {
      const initial = initialCertsRef.current[current.id];
      const changedFields: string[] = [];

      if (current.certificateType !== (initial?.certificateType || ""))
        changedFields.push("certificateType");
      if (current.certificateTitle !== (initial?.certificateTitle || ""))
        changedFields.push("certificateTitle");
      if (current.domain !== (initial?.domain || ""))
        changedFields.push("domain");
      if (
        current.certificateProvidedBy !== (initial?.certificateProvidedBy || "")
      )
        changedFields.push("certificateProvidedBy");
      if (current.date !== (initial?.date || "")) changedFields.push("date");
      if (current.description !== (initial?.description || ""))
        changedFields.push("description");

      // Check file changes (file object existence or URL change)
      if (current.uploadedFile !== initial?.uploadedFile)
        changedFields.push("fileUpload");
      else if (current.uploadedFileUrl !== (initial?.uploadedFileUrl || ""))
        changedFields.push("uploadedFileUrl");

      if (changedFields.length > 0) {
        changes[current.id] = changedFields;
      } else if (!current.certificate_id && current.certificateTitle) {
        changes[current.id] = ["new"];
      }
    });
    setCertChanges(changes);
  }, [certificates]);

  // Validation functions
  const validateCertificateTitle = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,-:()]+$/.test(value)) {
      return "Invalid characters in certificate title";
    }
    return "";
  };

  const validateDomain = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,-/&]+$/.test(value)) {
      return "Invalid characters in domain";
    }
    return "";
  };

  const validateProvider = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,&'-]+$/.test(value)) {
      return "Invalid characters in provider name";
    }
    return "";
  };

  // Handler for validating file format and size
  const validateFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return "Only PDF, JPG, and JPEG files are allowed";
    }

    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return "";
  };

  // Handler for field changes
  const handleCertificateChange = (
    index: number,
    field: string,
    value: string | boolean | File | null
  ) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);

    // Validate fields
    if (field === "certificateTitle" && typeof value === "string") {
      const error = validateCertificateTitle(value);
      setErrors((prev) => ({
        ...prev,
        [`cert-${index}-certificateTitle`]: error,
      }));
    } else if (field === "domain" && typeof value === "string") {
      const error = validateDomain(value);
      setErrors((prev) => ({ ...prev, [`cert-${index}-domain`]: error }));
    } else if (field === "certificateProvidedBy" && typeof value === "string") {
      const error = validateProvider(value);
      setErrors((prev) => ({
        ...prev,
        [`cert-${index}-certificateProvidedBy`]: error,
      }));
    }
  };

  // Handler for expanding/collapsing card
  const toggleExpand = (index: number) => {
    const updated = [...certificates];
    updated[index] = {
      ...updated[index],
      isExpanded: !updated[index].isExpanded,
    };
    setCertificates(updated);
  };

  // Handler for resetting a single certificate card
  const resetCertificate = (index: number) => {
    const initial = initialCertsRef.current[certificates[index].id];
    const updated = [...certificates];

    updated[index] = {
      ...updated[index],
      certificateType: initial?.certificateType || "",
      certificateTitle: initial?.certificateTitle || "",
      domain: initial?.domain || "",
      certificateProvidedBy: initial?.certificateProvidedBy || "",
      date: initial?.date || "",
      description: initial?.description || "",
      uploadedFile: null,
      uploadedFileName:
        initial?.uploadedFileName ||
        (initial?.uploadedFileUrl
          ? initial.uploadedFileUrl.split("/").pop()
          : ""),
      uploadedFileUrl: initial?.uploadedFileUrl || "",
      uploadedFileType: initial?.uploadedFileType || "",
    };
    setCertificates(updated);

    // Clear errors and mark as unchanged
    setCertChanges((prev) => {
      const newChanges = { ...prev };
      delete newChanges[updated[index].id];
      return newChanges;
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`cert-${index}-certificateTitle`];
      delete newErrors[`cert-${index}-file`];
      return newErrors;
    });
    setCertFeedback((prev) => {
      const newFeedback = { ...prev };
      delete newFeedback[updated[index].id];
      return newFeedback;
    });
  };

  // Handler for adding a new empty certificate card
  const addCertificate = () => {
    const newId = Date.now().toString();
    setCertificates([
      ...certificates,
      {
        id: newId,
        certificateType: "",
        certificateTitle: "",
        domain: "",
        certificateProvidedBy: "",
        date: "",
        description: "",
        uploadedFile: null,
        uploadedFileName: "",
        isExpanded: true,
      },
    ]);
    setCertChanges((prev) => ({ ...prev, [newId]: ["new"] }));
  };

  // Handler for removing a certificate card and deletion API call
  const removeCertificate = async (index: number) => {
    const cert = certificates[index];

    if (certificates.length === 1) return;

    if (cert.certificate_id) {
      try {
        await deleteCertificate(userId, token, cert.certificate_id);
        deletedCertificateIds.current.push(cert.certificate_id);
        setCertFeedback((prev) => ({
          ...prev,
          [cert.id]: "Deleted successfully!",
        }));
      } catch (error) {
        setCertFeedback((prev) => ({
          ...prev,
          [cert.id]: "Failed to delete.",
        }));
        setTimeout(
          () =>
            setCertFeedback((prev) => {
              const updated = { ...prev };
              delete updated[cert.id];
              return updated;
            }),
          3000
        );
        return;
      }
    }

    const id = cert.id;
    setCertificates(certificates.filter((_, i) => i !== index));
    delete initialCertsRef.current[id];
    setCertChanges((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // Handler for uploading file (Manual upload)
  const handleFileUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [`cert-${index}-file`]: error }));
      return;
    }

    const updated = [...certificates];
    updated[index] = {
      ...updated[index],
      uploadedFile: file,
      uploadedFileName: file.name,
      uploadedFileType: file.type,
    };

    setCertificates(updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`cert-${index}-file`];
      return newErrors;
    });
  };

  // Handler for dropping file (Drag and drop)
  const handleFileDrop = (
    index: number,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateFile(file);

    if (error) {
      setErrors((prev) => ({ ...prev, [`cert-${index}-file`]: error }));
      return;
    }

    const updated = [...certificates];
    updated[index] = {
      ...updated[index],
      uploadedFile: file,
      uploadedFileName: file.name,
      uploadedFileType: file.type,
    };
    setCertificates(updated);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`cert-${index}-file`];
      return newErrors;
    });
  };

  // Handler for removing attached file
  const clearFile = async (index: number) => {
    const updated = [...certificates];
    updated[index] = {
      ...updated[index],
      uploadedFile: null,
      uploadedFileName: "",
      uploadedFileUrl: "",
      uploadedFileType: "",
    };

    setCertificates(updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`cert-${index}-file`];
      return newErrors;
    });
  };

  // Handler for saving an individual certificate card (PUT/POST)
  const handleSaveCertificate = async (cert: Certificate, index: number) => {
    const isNew = !cert.certificate_id;
    const certId = cert.id;
    const changes = certChanges[certId];

    const localErrors = [
      errors[`cert-${index}-certificateTitle`],
      errors[`cert-${index}-file`],
    ].filter(Boolean);

    if (localErrors.length > 0) return;

    if (!changes || changes.length === 0) {
      setCertFeedback((prev) => ({ ...prev, [certId]: "No changes to save." }));
      setTimeout(
        () =>
          setCertFeedback((prev) => {
            const updated = { ...prev };
            delete updated[certId];
            return updated;
          }),
        3000
      );
      return;
    }

    // --- 1. Construct FormData ---
    let formDataToSend = new FormData();

    // Append all text fields
    formDataToSend.append("certificate_type", cert.certificateType || "");
    formDataToSend.append("certificate_title", cert.certificateTitle || "");
    formDataToSend.append("domain", cert.domain || "");
    formDataToSend.append(
      "certificate_provided_by",
      cert.certificateProvidedBy || ""
    );
    formDataToSend.append("date", cert.date || "");
    formDataToSend.append("description", cert.description || "");

    // --- 2. Handle File Logic ---

    // If a new local File object exists, append it
    if (cert.uploadedFile && changes.includes("fileUpload")) {
      try {
        // Append the file object directly for the API to handle upload
        formDataToSend.append("file", cert.uploadedFile);
      } catch (error) {
        setCertFeedback((prev) => ({
          ...prev,
          [certId]: "File processing failed.",
        }));
        setTimeout(
          () =>
            setCertFeedback((prev) => {
              const updated = { ...prev };
              delete updated[certId];
              return updated;
            }),
          3000
        );
        return;
      }
    }

    // If URL changed (cleared or new value due to save) or if other fields changed, send file_url
    if (
      changes.includes("uploadedFileUrl") ||
      (cert.uploadedFileUrl && !cert.uploadedFile)
    ) {
      formDataToSend.append("file_url", cert.uploadedFileUrl || "");
    }

    // --- 3. API Call ---
    try {
      let response;
      if (isNew) {
        response = await saveCertificateDetails(userId, token, formDataToSend);
      } else {
        response = await updateCertificateDetails(
          userId,
          token,
          cert.certificate_id!,
          formDataToSend
        );
      }

      // Check response for new ID/updated URL
      const finalCertData = Array.isArray(response) ? response[0] : response;
      let updatedCert: Certificate;

      if (finalCertData.certificate_id) {
        updatedCert = {
          ...cert,
          certificate_id: finalCertData.certificate_id,
          uploadedFile: null,
          uploadedFileUrl: finalCertData.file_url || cert.uploadedFileUrl,
          uploadedFileType: finalCertData.file_type || cert.uploadedFileType,
          uploadedFileName: finalCertData.file_url
            ? finalCertData.file_url.split("/").pop()
            : cert.uploadedFileName,
        };
        setCertFeedback((prev) => ({
          ...prev,
          [certId]: isNew ? "Saved successfully!" : "Updated successfully!",
        }));
      }

      // Sync state
      if (updatedCert) {
        setCertificates((prev) =>
          prev.map((c) => (c.id === cert.id ? updatedCert : c))
        );
        initialCertsRef.current[cert.id] = updatedCert;
      }

      setCertChanges((prev) => {
        const updated = { ...prev };
        delete updated[certId];
        return updated;
      });
      setTimeout(
        () =>
          setCertFeedback((prev) => {
            const updated = { ...prev };
            delete updated[certId];
            return updated;
          }),
        3000
      );
    } catch (error) {
      console.error("Error saving certificate:", error);
      const feedback = isNew ? "Failed to save." : "Failed to update.";
      setCertFeedback((prev) => ({ ...prev, [certId]: feedback }));
      setTimeout(
        () =>
          setCertFeedback((prev) => {
            const updated = { ...prev };
            delete updated[certId];
            return updated;
          }),
        3000
      );
    }
  };

  // Check if there are any unsaved changes in any section
  const hasUnsavedChanges = Object.keys(certChanges).length > 0;

  // Final submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasUnsavedChanges) {
      Object.keys(certChanges).forEach((id) => {
        setCertFeedback((prev) => ({
          ...prev,
          [id]: "Please save your certificate changes before proceeding",
        }));
        setTimeout(
          () =>
            setCertFeedback((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            }),
          3000
        );
      });
      return;
    }

    // Filter out completely empty certificates before sending to next step
    const validCertificates = certificates.filter(
      (c) => c.certificateTitle || c.certificate_id
    );

    onNext({
      certificates: validCertificates,
      deletedCertificateIds: deletedCertificateIds.current,
    });
  };

  const renderCertificateCard = (certificate: Certificate, index: number) => {
    const changed = certChanges[certificate.id]?.length > 0;
    const feedback = certFeedback[certificate.id];

    return (
      <div
        key={certificate.id}
        className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            Certificate - {index + 1}
          </h3>
          <div className="flex gap-2 items-center">
            {/* SAVE BUTTON */}
            {changed && (
              <button
                type="button"
                onClick={() => handleSaveCertificate(certificate, index)}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                title="Save changes"
              >
                <Save className="w-3 h-3 text-green-600" strokeWidth={2.5} />
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleExpand(index)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-3 h-3 text-gray-600 cursor-pointer transition-transform ${
                  !certificate.isExpanded ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
              />
            </button>
            <button
              type="button"
              onClick={() => resetCertificate(index)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RotateCcw
                className="w-3 h-3 text-gray-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
            {certificates.length > 1 && (
              <button
                type="button"
                onClick={() => removeCertificate(index)}
                className="w-5 h-5 flex items-center justify-center rounded border-2 border-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2
                  className="w-3 h-3 text-red-500 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-4 text-sm ${
              feedback.includes("successfully")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Content */}
        {certificate.isExpanded && (
          <div className="p-4 sm:p-5 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Certificate Type and Certificate Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Certificate Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Certificate Type
                  </label>
                  <div className="relative">
                    <select
                      value={certificate.certificateType}
                      onChange={(e) =>
                        handleCertificateChange(
                          index,
                          "certificateType",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Certificate Type</option>
                      <option value="Course Completion">
                        Course Completion
                      </option>
                      <option value="Professional Certification">
                        Professional Certification
                      </option>
                      <option value="Achievement">Achievement</option>
                      <option value="Training">Training</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Certificate Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    value={certificate.certificateTitle}
                    onChange={(e) =>
                      handleCertificateChange(
                        index,
                        "certificateTitle",
                        e.target.value
                      )
                    }
                    placeholder="Enter Certificate Title"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors[`cert-${index}-certificateTitle`]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors[`cert-${index}-certificateTitle`] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[`cert-${index}-certificateTitle`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Domain, Certificate Provided By, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Domain */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={certificate.domain}
                    onChange={(e) =>
                      handleCertificateChange(index, "domain", e.target.value)
                    }
                    placeholder="Enter Domain"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors[`cert-${index}-domain`]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors[`cert-${index}-domain`] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[`cert-${index}-domain`]}
                    </p>
                  )}
                </div>

                {/* Certificate Provided By */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Certificate Provided By
                  </label>
                  <input
                    type="text"
                    value={certificate.certificateProvidedBy}
                    onChange={(e) =>
                      handleCertificateChange(
                        index,
                        "certificateProvidedBy",
                        e.target.value
                      )
                    }
                    placeholder="Certificate Provided By"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors[`cert-${index}-certificateProvidedBy`]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors[`cert-${index}-certificateProvidedBy`] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[`cert-${index}-certificateProvidedBy`]}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Date (Month & Year)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={certificate.date}
                      onChange={(e) =>
                        handleCertificateChange(index, "date", e.target.value)
                      }
                      placeholder="Select Month and Year"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm pr-8"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <RichTextEditor
                  value={certificate.description}
                  onChange={(value) =>
                    handleCertificateChange(
                      index,
                      "description",
                      value
                    )
                  }
                  placeholder="Provide Description..."
                  rows={5}
                />
              </div>

              {/* Upload Certificate */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Upload Certificate
                </label>

                {!certificate.uploadedFileName ? (
                  <>
                    <input
                      id={`file-input-${index}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(index, e)}
                      className="hidden"
                      ref={(el) => {
                        fileInputRefs.current[certificate.id] = el;
                      }}
                    />
                    <div
                      onDrop={(e) => handleFileDrop(index, e)}
                      onDragOver={(e) => e.preventDefault()}
                      className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center hover:border-orange-400 transition-colors cursor-pointer ${
                        errors[`cert-${index}-file`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onClick={() =>
                        fileInputRefs.current[certificate.id]?.click()
                      }
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 cursor-pointer" />
                      <p className="text-xs sm:text-sm text-gray-600">
                        Drag and drop or upload certificate... (pdf, jpg, jpeg
                        format only)
                      </p>
                    </div>
                    {errors[`cert-${index}-file`] && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[`cert-${index}-file`]}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Upload className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        {certificate.uploadedFileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => clearFile(index)}
                      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-gray-600 cursor-pointer" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <form onSubmit={handleSubmit}>
        <div className="max-w-6xl mx-auto">
          {/* Step Header */}
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1">
              Step 6: Certificates
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Provide certificate details (if any) related to your job role.
            </p>
          </div>

          {/* Certificate Cards */}
          {certificates.map((certificate, index) =>
            renderCertificateCard(certificate, index)
          )}

          {/* Add Certificate Button */}
          <button
            type="button"
            onClick={addCertificate}
            className="flex items-center gap-2 px-4 py-2.5 text-orange-400 hover:text-orange-500 font-medium text-sm transition-colors mb-4 md:mb-5 cursor-pointer"
          >
            <Plus className="w-4 h-4 cursor-pointer" />
            Add Certificate
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-orange-300 hover:border-orange-400 text-orange-400 rounded-xl font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={hasUnsavedChanges}
              style={{
                background: hasUnsavedChanges
                  ? "#BDBDBD"
                  : "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-400 hover:bg-orange-700 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Go to DashBoard
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
