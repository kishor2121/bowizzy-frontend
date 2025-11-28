import React from "react";
import type { Certificate } from "src/types/resume";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSection,
  AddButton,
} from "@/pages/(ResumeBuilder)/components/ui";
import { Upload, X } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface CertificationsFormProps {
  data: Certificate[];
  onChange: (data: Certificate[]) => void;
}

const certificateTypes = [
  { value: "Technical", label: "Technical" },
  { value: "Professional", label: "Professional" },
  { value: "Academic", label: "Academic" },
  { value: "Language", label: "Language" },
  { value: "Industry", label: "Industry" },
  { value: "Other", label: "Other" },
];

export const CertificationsForm: React.FC<CertificationsFormProps> = ({
  data,
  onChange,
}) => {
  const [collapsedStates, setCollapsedStates] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const toggleCollapse = (id: string) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  const validateFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return "Only PDF, JPG, and JPEG files are allowed";
    }

    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return "";
  };

  const updateCertificate = (
    id: string,
    field: string,
    value: string | boolean
  ) => {
    onChange(
      data.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );

    if (field === "certificateTitle" && typeof value === "string") {
      const error = validateCertificateTitle(value);
      setErrors((prev) => ({
        ...prev,
        [`cert-${id}-certificateTitle`]: error,
      }));
    } else if (field === "domain" && typeof value === "string") {
      const error = validateDomain(value);
      setErrors((prev) => ({ ...prev, [`cert-${id}-domain`]: error }));
    } else if (field === "providedBy" && typeof value === "string") {
      const error = validateProvider(value);
      setErrors((prev) => ({ ...prev, [`cert-${id}-providedBy`]: error }));
    }
  };

  const handleFileUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);

      if (error) {
        setErrors((prev) => ({ ...prev, [`cert-${id}-file`]: error }));
        return;
      }

      onChange(
        data.map((cert) =>
          cert.id === id
            ? { ...cert, uploadedFile: file, uploadedFileName: file.name }
            : cert
        )
      );

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`cert-${id}-file`];
        return newErrors;
      });
    }
  };

  const handleFileDrop = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);

      if (error) {
        setErrors((prev) => ({ ...prev, [`cert-${id}-file`]: error }));
        return;
      }

      onChange(
        data.map((cert) =>
          cert.id === id
            ? { ...cert, uploadedFile: file, uploadedFileName: file.name }
            : cert
        )
      );

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`cert-${id}-file`];
        return newErrors;
      });
    }
  };

  const clearFile = (id: string) => {
    onChange(
      data.map((cert) =>
        cert.id === id
          ? { ...cert, uploadedFile: null, uploadedFileName: "" }
          : cert
      )
    );

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`cert-${id}-file`];
      return newErrors;
    });
  };

  const addCertificate = () => {
    const newCert: Certificate = {
      id: Date.now().toString(),
      certificateType: "",
      certificateTitle: "",
      domain: "",
      providedBy: "",
      date: "",
      description: "",
      certificateUrl: "",
      enabled: true,
    };
    onChange([...data, newCert]);
  };

  const removeCertificate = (id: string) => {
    if (data.length > 1) {
      onChange(data.filter((cert) => cert.id !== id));
      setCollapsedStates((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`cert-${id}-certificateTitle`];
        delete newErrors[`cert-${id}-domain`];
        delete newErrors[`cert-${id}-providedBy`];
        delete newErrors[`cert-${id}-file`];
        return newErrors;
      });
    }
  };

  const toggleCertificate = (id: string, enabled: boolean) => {
    onChange(
      data.map((cert) => (cert.id === id ? { ...cert, enabled } : cert))
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {data.map((cert, index) => (
        <FormSection
          key={cert.id}
          title={`Certificate ${data.length > 1 ? index + 1 : ""}`}
          showToggle={true}
          enabled={cert.enabled}
          onToggle={(enabled) => toggleCertificate(cert.id, enabled)}
          onRemove={
            data.length > 1 ? () => removeCertificate(cert.id) : undefined
          }
          showActions={true}
          isCollapsed={collapsedStates[cert.id] || false}
          onCollapseToggle={() => toggleCollapse(cert.id)}
        >
          <FormInput
            label="Certificate Title"
            placeholder="Enter Certificate Title"
            value={cert.certificateTitle}
            onChange={(v) => updateCertificate(cert.id, "certificateTitle", v)}
            error={errors[`cert-${cert.id}-certificateTitle`]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              label="Certificate Type"
              placeholder="Select Certificate Type"
              value={cert.certificateType}
              onChange={(v) => updateCertificate(cert.id, "certificateType", v)}
              options={certificateTypes}
            />
            <FormInput
              label="Date"
              placeholder="Select Date"
              value={cert.date}
              onChange={(v) => updateCertificate(cert.id, "date", v)}
              type="month"
            />
          </div>

          <div className="mt-4">
            <FormInput
              label="Domain"
              placeholder="Enter Domain"
              value={cert.domain}
              onChange={(v) => updateCertificate(cert.id, "domain", v)}
              error={errors[`cert-${cert.id}-domain`]}
            />
          </div>

          <div className="mt-4">
            <FormInput
              label="Certificate Provided By"
              placeholder="Certificate Provided By"
              value={cert.providedBy}
              onChange={(v) => updateCertificate(cert.id, "providedBy", v)}
              error={errors[`cert-${cert.id}-providedBy`]}
            />
          </div>

          <div className="mt-4">
            <RichTextEditor
              label="Description"
              placeholder="Provide Description..."
              value={cert.description}
              onChange={(v) => updateCertificate(cert.id, "description", v)}
              rows={3}
            />
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-600 font-medium mb-2 block">
              Upload Certificate Image
            </label>

            {!cert.certificateUrl ? (
              <>
                <div
                  onDrop={(e) => handleFileDrop(cert.id, e)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() =>
                    document.getElementById(`file-input-${cert.id}`)?.click()
                  }
                  className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-300 transition-colors cursor-pointer ${
                    errors[`cert-${cert.id}-file`]
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Drag and drop or upload certificate.. (pdf, jpg, jpeg
                      format only)
                    </p>
                  </div>
                  <input
                    id={`file-input-${cert.id}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(cert.id, e)}
                    className="hidden"
                  />
                </div>
                {errors[`cert-${cert.id}-file`] && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[`cert-${cert.id}-file`]}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Upload className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                    {cert.certificateUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => clearFile(cert.id)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-600 cursor-pointer" />
                </button>
              </div>
            )}
          </div>
        </FormSection>
      ))}

      <div className="bg-white border border-gray-200 rounded-xl">
        <AddButton onClick={addCertificate} label="Add Certificate" />
      </div>
    </div>
  );
};

export default CertificationsForm;
