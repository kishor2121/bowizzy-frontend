import React, { useState, useEffect, useRef, useCallback } from "react";
import type {
  EducationDetails,
  HigherEducation as HET,
} from "src/types/resume";
import {
  FormInput,
  FormSelect,
  FormSection,
  AddButton,
} from "@/pages/(ResumeBuilder)/components/ui";
import { Save, ChevronDown, Trash2 } from "lucide-react";
import {
  updateEducationDetails,
  saveEducationDetails,
  deleteEducation,
} from "@/services/educationService";

interface HigherEducation extends HET {
  education_id?: number | null;
}

interface EducationDetailsFormProps {
  data: EducationDetails;
  onChange: (data: EducationDetails) => void;
  userId: string;
  token: string;
  educationDataIdMap: Record<string, number>;
  setEducationDataIdMap: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  deleteEducationIds: number[];
  setDeleteEducationIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const boardTypes = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "State Board", label: "State Board" },
  { value: "IB", label: "International Baccalaureate" },
];

const subjectStreams = [
  { value: "Science", label: "Science" },
  { value: "Commerce", label: "Commerce" },
  { value: "Arts", label: "Arts" },
  { value: "Vocational", label: "Vocational" },
];

const resultFormats = [
  { value: "Percentage", label: "Percentage" },
  { value: "CGPA", label: "CGPA" },
  { value: "GPA", label: "GPA" },
  { value: "Grade", label: "Grade" },
];

const degrees = [
  { value: "B.Tech", label: "B.Tech" },
  { value: "B.E", label: "B.E" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "B.A", label: "B.A" },
  { value: "B.Com", label: "B.Com" },
  { value: "M.Tech", label: "M.Tech" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "MBA", label: "MBA" },
  { value: "PhD", label: "PhD" },
];

const buildYear = (val: string | null | undefined): string | number | null => {
  if (val === undefined || val === null || val === "") return null;

  if (typeof val === "string") {
    if (val.includes("-")) {
      const parts = val.split("-");
      if (parts.length >= 2) {
        return `${parts[0]}-${parts[1]}`;
      }
      return parts[0];
    }
  }

  return val;
};

export const EducationDetailsForm: React.FC<EducationDetailsFormProps> = ({
  data,
  onChange,
  userId,
  token,
  educationDataIdMap,
  setEducationDataIdMap,
  deleteEducationIds,
  setDeleteEducationIds,
}) => {
  const [sslcCollapsed, setSslcCollapsed] = useState(false);
  const [preUniversityCollapsed, setPreUniversityCollapsed] = useState(false);
  const [higherEducationCollapsed, setHigherEducationCollapsed] =
    useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [sslcFeedback, setSslcFeedback] = useState("");
  const [puFeedback, setPuFeedback] = useState("");
  const [higherEduFeedback, setHigherEduFeedback] = useState<
    Record<string, string>
  >({});

  const initialDataRef = useRef(data);

  const hasSslcChanged = useCallback(() => {
    const current = data.sslc;
    const initial = initialDataRef.current.sslc;

    return (
      data.sslcEnabled !== initialDataRef.current.sslcEnabled ||
      current.instituteName !== initial.instituteName ||
      current.boardType !== initial.boardType ||
      current.resultFormat !== initial.resultFormat ||
      current.yearOfPassing !== initial.yearOfPassing ||
      current.result !== initial.result
    );
  }, [data.sslc, data.sslcEnabled]);

  const hasPuChanged = useCallback(() => {
    const current = data.preUniversity;
    const initial = initialDataRef.current.preUniversity;

    return (
      data.preUniversityEnabled !==
        initialDataRef.current.preUniversityEnabled ||
      current.instituteName !== initial.instituteName ||
      current.boardType !== initial.boardType ||
      current.subjectStream !== initial.subjectStream ||
      current.yearOfPassing !== initial.yearOfPassing ||
      current.resultFormat !== initial.resultFormat ||
      current.result !== initial.result
    );
  }, [data.preUniversity, data.preUniversityEnabled]);

  const getHigherEduChangedStatus = useCallback(
    (edu: HigherEducation): boolean => {
      const initial = initialDataRef.current.higherEducation.find(
        (i) => i.id === edu.id
      );

      if (!initial) {
        return !!(
          edu.degree ||
          edu.instituteName ||
          edu.fieldOfStudy ||
          edu.result
        );
      }

      return (
        edu.degree !== initial.degree ||
        edu.fieldOfStudy !== initial.fieldOfStudy ||
        edu.instituteName !== initial.instituteName ||
        edu.universityBoard !== initial.universityBoard ||
        edu.startYear !== initial.startYear ||
        edu.endYear !== initial.endYear ||
        edu.resultFormat !== initial.resultFormat ||
        edu.result !== initial.result ||
        edu.currentlyPursuing !== (initial as HigherEducation).currentlyPursuing
      );
    },
    [data.higherEducation]
  );

  const hasAnyHigherEduChanged = useCallback(() => {
    return data.higherEducation.some(getHigherEduChangedStatus);
  }, [data.higherEducation, getHigherEduChangedStatus]);

  const validateField = (
    name: string,
    value: string | boolean,
    resultFormat?: string
  ) => {
    if (typeof value !== "string") return "";
    let error = "";

    if (
      name.includes("instituteName") ||
      name.includes("fieldOfStudy") ||
      name.includes("universityBoard") ||
      name.includes("boardType")
    ) {
      if (value && !/^[a-zA-Z0-9\s.,&()\-']+$/.test(value)) {
        error = "Only letters, numbers, and basic punctuation allowed";
      }
    }

    if (name.includes("result") && value) {
      if (resultFormat === "Percentage") {
        const num = parseFloat(value);
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          error = "Enter valid percentage (e.g., 85 or 85.5)";
        } else if (num < 0 || num > 100) {
          error = "Percentage must be between 0 and 100";
        }
      } else if (resultFormat === "CGPA") {
        const num = parseFloat(value);
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          error = "Enter valid CGPA (e.g., 8.5)";
        } else if (num < 0 || num > 10) {
          error = "CGPA must be between 0 and 10";
        }
      } else if (resultFormat === "GPA") {
        const num = parseFloat(value);
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          error = "Enter valid GPA (e.g., 3.5)";
        } else if (num < 0 || num > 4) {
          error = "GPA must be between 0 and 4";
        }
      } else if (resultFormat === "Grade") {
        if (!/^[A-F][+-]?$|^Pass$|^Fail$/i.test(value)) {
          error = "Enter valid grade (A, B+, C-, etc.)";
        }
      }
    }

    return error;
  };

  const validateDateRange = (
    startYear: string,
    endYear: string,
    isCurrentlyPursuing: boolean
  ) => {
    if (isCurrentlyPursuing) return "";

    if (startYear && endYear) {
      if (endYear < startYear) {
        return "End year cannot be before start year";
      }
    }
    return "";
  };

  const handleSaveSslc = async () => {
    const currentData = data.sslc;
    const initialData = initialDataRef.current.sslc;
    const education_id = initialDataRef.current.sslc.education_id;
    const isEnabled = data.sslcEnabled;

    if (errors["sslc.result"] || errors["sslc.instituteName"]) return;

    try {
      if (education_id && !isEnabled && !hasSslcChanged()) {
        await deleteEducation(userId, token, education_id);
        onChange({
          ...data,
          sslc: { ...initialResumeData.education.sslc, education_id: null },
          sslcEnabled: false,
        });
        initialDataRef.current = {
          ...initialDataRef.current,
          sslc: { ...initialResumeData.education.sslc, education_id: null },
          sslcEnabled: false,
        };
        setSslcFeedback("SSLC details cleared successfully!");
        return;
      }

      if (!isEnabled || (!hasSslcChanged() && education_id)) {
        setSslcFeedback("No changes detected to save.");
        setTimeout(() => setSslcFeedback(""), 3000);
        return;
      }

      const payload = {
        education_type: "sslc",
        institution_name: currentData.instituteName || "",
        board_type: currentData.boardType || "",
        end_year: buildYear(currentData.yearOfPassing),
        result_format: (currentData.resultFormat || "").toLowerCase(),
        result: currentData.result || "",
      };

      let response: any;
      let feedbackMessage = "";

      if (education_id) {
        const updatePayload: Record<string, any> = {};
        if (currentData.instituteName !== initialData.instituteName)
          updatePayload.institution_name = currentData.instituteName;
        if (currentData.boardType !== initialData.boardType)
          updatePayload.board_type = currentData.boardType;
        if (currentData.yearOfPassing !== initialData.yearOfPassing)
          updatePayload.end_year = buildYear(currentData.yearOfPassing);
        if (currentData.resultFormat !== initialData.resultFormat)
          updatePayload.result_format = (
            currentData.resultFormat || ""
          ).toLowerCase();
        if (currentData.result !== initialData.result)
          updatePayload.result = currentData.result;

        if (Object.keys(updatePayload).length > 0) {
          response = await updateEducationDetails(
            userId,
            token,
            education_id,
            updatePayload
          );
          feedbackMessage = "SSLC details updated successfully!";
        }
      } else {
        const newPayload = [{ ...payload }];
        response = await saveEducationDetails(userId, token, newPayload);

        if (response && response.length > 0 && response[0].education_id) {
          const newId = response[0].education_id;
          onChange({ ...data, sslc: { ...currentData, education_id: newId } });
        }
        feedbackMessage = "SSLC details saved successfully!";
      }

      initialDataRef.current = {
        ...data,
        sslc: {
          ...currentData,
          education_id: education_id || response?.[0]?.education_id || null,
        },
      };
      setSslcFeedback(feedbackMessage);

      setTimeout(() => setSslcFeedback(""), 3000);
    } catch (error) {
      console.error("Error saving SSLC:", error);
      setSslcFeedback("Failed to save SSLC details ");
      setTimeout(() => setSslcFeedback(""), 3000);
    }
  };

  const handleSavePu = async () => {
    const currentData = data.preUniversity;
    const initialData = initialDataRef.current.preUniversity;
    const education_id = initialDataRef.current.preUniversity.education_id;
    const isEnabled = data.preUniversityEnabled;

    if (errors["preUniversity.result"] || errors["preUniversity.instituteName"])
      return;

    try {
      if (education_id && !isEnabled && !hasPuChanged()) {
        await deleteEducation(userId, token, education_id);
        onChange({
          ...data,
          preUniversity: {
            ...initialResumeData.education.preUniversity,
            education_id: null,
          },
          preUniversityEnabled: false,
        });
        initialDataRef.current = {
          ...initialDataRef.current,
          preUniversity: {
            ...initialResumeData.education.preUniversity,
            education_id: null,
          },
          preUniversityEnabled: false,
        };
        setPuFeedback("Pre University details cleared successfully!");
        return;
      }

      if (!isEnabled || (!hasPuChanged() && education_id)) {
        setPuFeedback("No changes detected to save.");
        setTimeout(() => setPuFeedback(""), 3000);
        return;
      }

      const payload = {
        education_type: "puc",
        institution_name: currentData.instituteName || "",
        board_type: currentData.boardType || "",
        subject_stream: currentData.subjectStream || "",
        end_year: buildYear(currentData.yearOfPassing),
        result_format: (currentData.resultFormat || "").toLowerCase(),
        result: currentData.result || "",
      };

      let response: any;
      let feedbackMessage = "";

      if (education_id) {
        const updatePayload: Record<string, any> = {};
        if (currentData.instituteName !== initialData.instituteName)
          updatePayload.institution_name = currentData.instituteName;
        if (currentData.boardType !== initialData.boardType)
          updatePayload.board_type = currentData.boardType;
        if (currentData.subjectStream !== initialData.subjectStream)
          updatePayload.subject_stream = currentData.subjectStream;
        if (currentData.yearOfPassing !== initialData.yearOfPassing)
          updatePayload.end_year = buildYear(currentData.yearOfPassing);
        if (currentData.resultFormat !== initialData.resultFormat)
          updatePayload.result_format = (
            currentData.resultFormat || ""
          ).toLowerCase();
        if (currentData.result !== initialData.result)
          updatePayload.result = currentData.result;

        if (Object.keys(updatePayload).length > 0) {
          response = await updateEducationDetails(
            userId,
            token,
            education_id,
            updatePayload
          );
          feedbackMessage = "Pre University details updated successfully!";
        }
      } else {
        const newPayload = [{ ...payload }];
        response = await saveEducationDetails(userId, token, newPayload);

        if (response && response.length > 0 && response[0].education_id) {
          const newId = response[0].education_id;
          onChange({
            ...data,
            preUniversity: { ...currentData, education_id: newId },
          });
        }
        feedbackMessage = "Pre University details saved successfully!";
      }

      initialDataRef.current = {
        ...data,
        preUniversity: {
          ...currentData,
          education_id: education_id || response?.[0]?.education_id || null,
        },
      };
      setPuFeedback(feedbackMessage);

      setTimeout(() => setPuFeedback(""), 3000);
    } catch (error) {
      console.error("Error saving PU:", error);
      setPuFeedback("Failed to save Pre University details ");
      setTimeout(() => setPuFeedback(""), 3000);
    }
  };

  const handleSaveHigherEducation = async (edu: HigherEducation) => {
    const index = data.higherEducation.findIndex((e) => e.id === edu.id);
    if (index === -1) return;

    const hasChanged = getHigherEduChangedStatus(edu);
    const isNew = !edu.education_id;

    if (
      errors[`higherEducation.${edu.id}.result`] ||
      errors[`higherEducation.${edu.id}.instituteName`] ||
      errors[`higherEducation.${edu.id}.universityBoard`] ||
      errors[`higherEducation.${edu.id}.endYear`]
    )
      return;

    try {
      if (
        !edu.degree &&
        !edu.instituteName &&
        !edu.fieldOfStudy &&
        !edu.education_id
      ) {
        setHigherEduFeedback((prev) => ({
          ...prev,
          [edu.id]: "Cannot save empty record.",
        }));
        setTimeout(
          () =>
            setHigherEduFeedback((prev) => {
              const updated = { ...prev };
              delete updated[edu.id];
              return updated;
            }),
          3000
        );
        return;
      }

      if (!hasChanged && !isNew) {
        setHigherEduFeedback((prev) => ({
          ...prev,
          [edu.id]: "No changes to save.",
        }));
        setTimeout(
          () =>
            setHigherEduFeedback((prev) => {
              const updated = { ...prev };
              delete updated[edu.id];
              return updated;
            }),
          3000
        );
        return;
      }

      let response: any;
      let feedbackMessage = "";

      const payload = {
        education_type: "higher",
        degree: edu.degree || "",
        field_of_study: edu.fieldOfStudy || "",
        institution_name: edu.instituteName || "",
        university_name: edu.universityBoard || "",
        start_year: buildYear(edu.startYear),
        end_year: buildYear(edu.endYear),
        result_format: (edu.resultFormat || "").toLowerCase(),
        result: edu.result || "",
        currently_pursuing: !!edu.currentlyPursuing,
      };

      if (isNew) {
        response = await saveEducationDetails(userId, token, [{ ...payload }]);

        if (response && response.length > 0 && response[0].education_id) {
          const newId = response[0].education_id;

          const updatedEducation = data.higherEducation.map((e) =>
            e.id === edu.id ? { ...e, education_id: newId } : e
          );
          onChange({ ...data, higherEducation: updatedEducation });
          setEducationDataIdMap((prev) => ({ ...prev, [edu.id]: newId }));

          const updatedRefEducation =
            initialDataRef.current.higherEducation.map((e) =>
              e.id === edu.id ? { ...e, education_id: newId } : e
            );
          initialDataRef.current = {
            ...initialDataRef.current,
            higherEducation: updatedRefEducation,
          };
        }

        feedbackMessage = "Saved successfully! ";
      } else {
        const initial =
          initialDataRef.current.higherEducation.find((i) => i.id === edu.id) ||
          ({} as HigherEducation);
        const updatePayload: Record<string, any> = {};

        if (edu.degree !== initial.degree) updatePayload.degree = edu.degree;
        if (edu.fieldOfStudy !== initial.fieldOfStudy)
          updatePayload.field_of_study = edu.fieldOfStudy;
        if (edu.instituteName !== initial.instituteName)
          updatePayload.institution_name = edu.instituteName;
        if (edu.universityBoard !== initial.universityBoard)
          updatePayload.university_name = edu.universityBoard;
        if (edu.startYear !== initial.startYear)
          updatePayload.start_year = buildYear(edu.startYear);
        if (edu.endYear !== initial.endYear)
          updatePayload.end_year = buildYear(edu.endYear);
        if (edu.resultFormat !== initial.resultFormat)
          updatePayload.result_format = (edu.resultFormat || "").toLowerCase();
        if (edu.result !== initial.result) updatePayload.result = edu.result;
        if (edu.currentlyPursuing !== initial.currentlyPursuing)
          updatePayload.currently_pursuing = edu.currentlyPursuing;

        if (Object.keys(updatePayload).length > 0) {
          response = await updateEducationDetails(
            userId,
            token,
            edu.education_id as number,
            updatePayload
          );

          const updatedRefEducation =
            initialDataRef.current.higherEducation.map((e) =>
              e.id === edu.id ? { ...edu } : e
            );
          initialDataRef.current = {
            ...initialDataRef.current,
            higherEducation: updatedRefEducation,
          };

          feedbackMessage = "Updated successfully! ";
        }
      }

      setHigherEduFeedback((prev) => ({ ...prev, [edu.id]: feedbackMessage }));
      setTimeout(
        () =>
          setHigherEduFeedback((prev) => {
            const updated = { ...prev };
            delete updated[edu.id];
            return updated;
          }),
        3000
      );
    } catch (error) {
      console.error(`Error saving higher education ${edu.id}:`, error);
      setHigherEduFeedback((prev) => ({
        ...prev,
        [edu.id]: `Failed to ${isNew ? "save" : "update"} `,
      }));
      setTimeout(
        () =>
          setHigherEduFeedback((prev) => {
            const updated = { ...prev };
            delete updated[edu.id];
            return updated;
          }),
        3000
      );
    }
  };

  const updateSSLC = (field: string, value: string) => {
    const newData = {
      ...data,
      sslc: { ...data.sslc, [field]: value },
    };
    onChange(newData);

    const error = validateField(
      `sslc.${field}`,
      value,
      newData.sslc.resultFormat
    );
    setErrors((prev) => ({ ...prev, [`sslc.${field}`]: error }));
    setSslcFeedback("");
  };

  const updatePreUniversity = (field: string, value: string) => {
    const newData = {
      ...data,
      preUniversity: { ...data.preUniversity, [field]: value },
    };
    onChange(newData);

    const error = validateField(
      `preUniversity.${field}`,
      value,
      newData.preUniversity.resultFormat
    );
    setErrors((prev) => ({ ...prev, [`preUniversity.${field}`]: error }));
    setPuFeedback("");
  };

  const updateHigherEducation = (
    id: string,
    field: string,
    value: string | boolean
  ) => {
    const updatedEducation = data.higherEducation.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );

    onChange({
      ...data,
      higherEducation: updatedEducation,
    });

    setHigherEduFeedback((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    const edu = updatedEducation.find((e) => e.id === id) as HigherEducation;

    const fieldError = validateField(
      `higherEducation.${id}.${field}`,
      value,
      edu?.resultFormat
    );
    setErrors((prev) => ({
      ...prev,
      [`higherEducation.${id}.${field}`]: fieldError,
    }));

    if (
      edu &&
      (field === "startYear" ||
        field === "endYear" ||
        field === "currentlyPursuing")
    ) {
      const currentEndYear =
        field === "currentlyPursuing" && value === true ? "" : edu.endYear;

      const dateError = validateDateRange(
        edu.startYear,
        currentEndYear,
        edu.currentlyPursuing
      );
      setErrors((prev) => ({
        ...prev,
        [`higherEducation.${id}.endYear`]: dateError,
      }));
    }
  };

  const addHigherEducation = () => {
    const newEdu: HigherEducation = {
      id: Date.now().toString(),
      degree: "",
      fieldOfStudy: "",
      instituteName: "",
      universityBoard: "",
      startYear: "",
      endYear: "",
      resultFormat: "",
      result: "",
      currentlyPursuing: false,
      education_id: null,
    };
    onChange({
      ...data,
      higherEducation: [...data.higherEducation, newEdu],
    });
    setHigherEducationCollapsed(false);
  };

  const removeHigherEducation = async (id: string) => {
    const eduToRemove = data.higherEducation.find((edu) => edu.id === id);

    if (eduToRemove && eduToRemove.education_id) {
      try {
        setHigherEduFeedback((prev) => ({ ...prev, [id]: "Deleting..." }));
        await deleteEducation(userId, token, eduToRemove.education_id);
        setDeleteEducationIds((prev) => [
          ...prev,
          eduToRemove.education_id as number,
        ]);
        setHigherEduFeedback((prev) => ({
          ...prev,
          [id]: "Deleted successfully! ",
        }));
        setTimeout(
          () =>
            setHigherEduFeedback((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            }),
          3000
        );
      } catch (error) {
        console.error("Error deleting education:", error);
        setHigherEduFeedback((prev) => ({
          ...prev,
          [id]: "Failed to delete ",
        }));
        setTimeout(
          () =>
            setHigherEduFeedback((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            }),
          3000
        );
        return;
      }
    }

    onChange({
      ...data,
      higherEducation: data.higherEducation.filter((edu) => edu.id !== id),
    });

    initialDataRef.current = {
      ...initialDataRef.current,
      higherEducation: initialDataRef.current.higherEducation.filter(
        (e) => e.id !== id
      ),
    };
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(id)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const handleClearEducationSSLC = () => {
    const clearedData = {
      ...initialResumeData.education.sslc,
      education_id: data.sslc.education_id,
    };
    onChange((prev) => ({ ...prev, sslc: clearedData }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated["sslc.result"];
      delete updated["sslc.instituteName"];
      return updated;
    });
    setSslcFeedback("");
  };

  const handleClearEducationPreUniversity = () => {
    const clearedData = {
      ...initialResumeData.education.preUniversity,
      education_id: data.preUniversity.education_id,
    };
    onChange((prev) => ({ ...prev, preUniversity: clearedData }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated["preUniversity.result"];
      delete updated["preUniversity.instituteName"];
      return updated;
    });
    setPuFeedback("");
  };

  const handleClearHigherEducation = (id: string) => {
    const eduIndex = data.higherEducation.findIndex((e) => e.id === id);
    if (eduIndex === -1) return;

    const clearedData: HigherEducation = {
      ...initialResumeData.education.higherEducation[0],
      id: id,
      education_id: data.higherEducation[eduIndex].education_id,
    };

    onChange((prev) => ({
      ...prev,
      higherEducation: prev.higherEducation.map((edu) =>
        edu.id === id ? clearedData : edu
      ),
    }));

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`higherEducation.${id}.result`];
      delete updated[`higherEducation.${id}.instituteName`];
      delete updated[`higherEducation.${id}.universityBoard`];
      delete updated[`higherEducation.${id}.endYear`];
      return updated;
    });
    setHigherEduFeedback((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const renderEducationCard = (education: HigherEducation, index: number) => {
    const id = education.id;
    const hasChanged = getHigherEduChangedStatus(education);
    const feedback = higherEduFeedback[id];
    const isNewCard = !education.education_id;

    const isCollapsed = higherEducationCollapsed;

    return (
      <div
        key={id}
        className={`${index > 0 ? "mt-6 pt-6 border-t border-gray-200" : ""}`}
      >
        {data.higherEducation.length > 1 && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Education {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeHigherEducation(id)}
              className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mb-4">
          {feedback && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                feedback.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedback}
            </span>
          )}
          {hasChanged && (
            <button
              type="button"
              onClick={() => handleSaveHigherEducation(education)}
              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
              title={isNewCard ? "Save new education" : "Save changes"}
            >
              <Save
                className="w-3 h-3 text-green-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Degree"
              placeholder="Select Degree"
              value={education.degree}
              onChange={(v) => updateHigherEducation(id, "degree", v)}
              options={degrees}
            />
            <FormInput
              label="Field of Study"
              placeholder="Enter Field of Study"
              value={education.fieldOfStudy}
              onChange={(v) => updateHigherEducation(id, "fieldOfStudy", v)}
              error={errors[`higherEducation.${id}.fieldOfStudy`]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Institute Name"
              placeholder="Enter Institute Name"
              value={education.instituteName}
              onChange={(v) => updateHigherEducation(id, "instituteName", v)}
              error={errors[`higherEducation.${id}.instituteName`]}
            />
            <FormInput
              label="University / Board"
              placeholder="Enter University / Board"
              value={education.universityBoard}
              onChange={(v) => updateHigherEducation(id, "universityBoard", v)}
              error={errors[`higherEducation.${id}.universityBoard`]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Year
              </label>
              <input
                type="month"
                value={education.startYear}
                onChange={(e) =>
                  updateHigherEducation(id, "startYear", e.target.value)
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Year
              </label>
              <input
                type="month"
                value={education.currentlyPursuing ? "" : education.endYear}
                onChange={(e) =>
                  updateHigherEducation(id, "endYear", e.target.value)
                }
                disabled={education.currentlyPursuing}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm disabled:bg-gray-100 ${
                  errors[`higherEducation.${id}.endYear`]
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                }`}
              />
              {errors[`higherEducation.${id}.endYear`] && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[`higherEducation.${id}.endYear`]}
                </p>
              )}
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={education.currentlyPursuing}
                  onChange={(e) =>
                    updateHigherEducation(
                      id,
                      "currentlyPursuing",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
                />
                Currently Pursuing
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Result Format"
              placeholder="Format"
              value={education.resultFormat}
              onChange={(v) => updateHigherEducation(id, "resultFormat", v)}
              options={resultFormats}
            />
            <FormInput
              label="Result"
              placeholder="Result"
              value={education.result}
              onChange={(v) => updateHigherEducation(id, "result", v)}
              error={errors[`higherEducation.${id}.result`]}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <FormSection
        title="SSLC (10th Standard)"
        required={false}
        enabled={data.sslcEnabled}
        onToggle={(enabled) => onChange({ ...data, sslcEnabled: enabled })}
        showActions={true}
        isCollapsed={sslcCollapsed}
        onCollapseToggle={() => setSslcCollapsed(!sslcCollapsed)}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          {sslcFeedback && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                sslcFeedback.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {sslcFeedback}
            </span>
          )}
          {hasSslcChanged() && (
            <button
              type="button"
              onClick={handleSaveSslc}
              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
              title={data.sslc.education_id ? "Update SSLC" : "Save SSLC"}
            >
              <Save
                className="w-3 h-3 text-green-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>

        <FormInput
          label="Institution Name"
          placeholder="Enter Institute Name"
          value={data.sslc.instituteName}
          onChange={(v) => updateSSLC("instituteName", v)}
          error={errors["sslc.instituteName"]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormSelect
            label="Board Type"
            placeholder="Select Board Type"
            value={data.sslc.boardType}
            onChange={(v) => updateSSLC("boardType", v)}
            options={boardTypes}
          />
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Year of Passing
            </label>
            <input
              type="month"
              value={data.sslc.yearOfPassing}
              onChange={(e) => updateSSLC("yearOfPassing", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormSelect
            label="Result Format"
            placeholder="Select Result Format"
            value={data.sslc.resultFormat}
            onChange={(v) => updateSSLC("resultFormat", v)}
            options={resultFormats}
          />
          <FormInput
            label="Result"
            placeholder="Enter Result"
            value={data.sslc.result}
            onChange={(v) => updateSSLC("result", v)}
            error={errors["sslc.result"]}
          />
        </div>
      </FormSection>

      <FormSection
        title="Pre University (12th Standard)"
        required={false}
        enabled={data.preUniversityEnabled}
        onToggle={(enabled) =>
          onChange({ ...data, preUniversityEnabled: enabled })
        }
        showActions={true}
        isCollapsed={preUniversityCollapsed}
        onCollapseToggle={() =>
          setPreUniversityCollapsed(!preUniversityCollapsed)
        }
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          {puFeedback && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                puFeedback.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {puFeedback}
            </span>
          )}
          {hasPuChanged() && (
            <button
              type="button"
              onClick={handleSavePu}
              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
              title={
                data.preUniversity.education_id
                  ? "Update Pre University"
                  : "Save Pre University"
              }
            >
              <Save
                className="w-3 h-3 text-green-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>

        <FormInput
          label="Institution Name"
          placeholder="Enter Institute Name"
          value={data.preUniversity.instituteName}
          onChange={(v) => updatePreUniversity("instituteName", v)}
          error={errors["preUniversity.instituteName"]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormSelect
            label="Board Type"
            placeholder="Select Board Type"
            value={data.preUniversity.boardType}
            onChange={(v) => updatePreUniversity("boardType", v)}
            options={boardTypes}
          />
          <FormSelect
            label="Subject Stream"
            placeholder="Select Subject Stream"
            value={data.preUniversity.subjectStream}
            onChange={(v) => updatePreUniversity("subjectStream", v)}
            options={subjectStreams}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Year of Passing
            </label>
            <input
              type="month"
              value={data.preUniversity.yearOfPassing}
              onChange={(e) =>
                updatePreUniversity("yearOfPassing", e.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            />
          </div>
          <FormSelect
            label="Result Format"
            placeholder="Result Format"
            value={data.preUniversity.resultFormat}
            onChange={(v) => updatePreUniversity("resultFormat", v)}
            options={resultFormats}
          />
          <FormInput
            label="Result"
            placeholder="Enter Result"
            value={data.preUniversity.result}
            onChange={(v) => updatePreUniversity("result", v)}
            error={errors["preUniversity.result"]}
          />
        </div>
      </FormSection>

      <FormSection
        title="Higher Education"
        required={false}
        enabled={data.higherEducationEnabled}
        onToggle={(enabled) =>
          onChange({ ...data, higherEducationEnabled: enabled })
        }
        showActions={true}
        isCollapsed={higherEducationCollapsed}
        onCollapseToggle={() =>
          setHigherEducationCollapsed(!higherEducationCollapsed)
        }
      >
        {data.higherEducation.map((edu, index) =>
          renderEducationCard(edu as HigherEducation, index)
        )}
      </FormSection>

      <div className="bg-white border border-gray-200 rounded-xl">
        <AddButton onClick={addHigherEducation} label="Add Education" />
      </div>
    </div>
  );
};

export default EducationDetailsForm;
