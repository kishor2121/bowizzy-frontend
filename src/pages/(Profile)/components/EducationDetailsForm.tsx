import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Trash2, Plus, Save } from "lucide-react";
import { 
  updateEducationDetails, 
  saveEducationDetails, 
  deleteEducation 
} from "@/services/educationService";

interface EducationDetailsFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  userId: string;
  token: string;
}

interface HigherEducation {
  id: string; // Client-side unique ID (timestamp or generated)
  degree: string;
  institutionName: string;
  universityBoard: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  resultFormat: string;
  result: string;
  currentlyPursuing: boolean;
  education_id?: number; // Database ID
}

export default function EducationDetailsForm({
  onNext,
  onBack,
  initialData = {},
  userId,
  token,
}: EducationDetailsFormProps) {
  const [sslcExpanded, setSslcExpanded] = useState(true);
  const [puExpanded, setPuExpanded] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // SSLC Data
  const [sslcData, setSslcData] = useState({
    institutionName: initialData.sslc?.institutionName || "",
    boardType: initialData.sslc?.boardType || "",
    resultFormat: initialData.sslc?.resultFormat || "",
    yearOfPassing: initialData.sslc?.yearOfPassing || "",
    result: initialData.sslc?.result || "",
    education_id: initialData.sslc?.education_id || null,
  });

  // PU Data
  const [puData, setPuData] = useState({
    institutionName: initialData.pu?.institutionName || "",
    boardType: initialData.pu?.boardType || "",
    yearOfPassing: initialData.pu?.yearOfPassing || "",
    resultFormat: initialData.pu?.resultFormat || "",
    subjectStream: initialData.pu?.subjectStream || "",
    result: initialData.pu?.result || "",
    education_id: initialData.pu?.education_id || null,
  });

  // Helper to initialize lists, ensuring at least one Higher Education card exists
  const getInitialHigherEducations = (data: any) => {
    const higherEdus = data.higherEducations || [];
    const extraEdus = data.extraEducations || [];

    // Combine into a single array for state management
    let combined = [...higherEdus, ...extraEdus];

    // Ensure at least one element for the mandatory higher education
    if (combined.length === 0) {
      combined.push({
        id: Date.now().toString(),
        degree: "",
        institutionName: "",
        universityBoard: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
        resultFormat: "",
        result: "",
        currentlyPursuing: false,
      });
    }

    return combined;
  };

  const initialEducations = getInitialHigherEducations(initialData);

  // Split into mandatory (first item) and extra (rest)
  const initialHigherEdu = initialEducations.slice(0, 1);
  const initialExtraEdu = initialEducations.slice(1);

  const getInitialExpanded = (array: HigherEducation[]) =>
    array.reduce((acc, edu) => ({ ...acc, [edu.id]: true }), {});

  const [higherEducations, setHigherEducations] = useState<HigherEducation[]>(initialHigherEdu);
  const [extraEducations, setExtraEducations] = useState<HigherEducation[]>(initialExtraEdu);
  const [higherExpanded, setHigherExpanded] = useState<Record<string, boolean>>(
    getInitialExpanded(initialHigherEdu)
  );
  const [extraExpanded, setExtraExpanded] = useState<Record<string, boolean>>(
    getInitialExpanded(initialExtraEdu)
  );
  
  // Track changes for each education section/card
  const [sslcChanged, setSslcChanged] = useState(false);
  const [puChanged, setPuChanged] = useState(false);
  const [higherChanges, setHigherChanges] = useState<Record<string, string[]>>({});
  const [extraChanges, setExtraChanges] = useState<Record<string, string[]>>({});

  // Feedback messages
  const [sslcFeedback, setSslcFeedback] = useState("");
  const [puFeedback, setPuFeedback] = useState("");
  const [higherFeedback, setHigherFeedback] = useState<Record<string, string>>({});
  const [extraFeedback, setExtraFeedback] = useState<Record<string, string>>({});
  
  // Track IDs of education records marked for deletion (only relevant for existing extra education cards)
  const deletedEducationIds = useRef<number[]>([]);

  // Store initial values for comparison
  const initialSslc = useRef(sslcData);
  const initialPu = useRef(puData);
  const initialHigher = useRef<Record<string, HigherEducation>>({});
  const initialExtra = useRef<Record<string, HigherEducation>>({});

  // Initialize refs for higher and extra educations on mount
  useEffect(() => {
    [...initialHigherEdu, ...initialExtraEdu].forEach(edu => {
      if (edu.id) {
        if (initialHigherEdu.some(e => e.id === edu.id)) {
          initialHigher.current[edu.id] = { ...edu };
        } else {
          initialExtra.current[edu.id] = { ...edu };
        }
      }
    });
  }, []);

  // Check SSLC changes
  useEffect(() => {
    const hasChanged = 
      sslcData.institutionName !== (initialSslc.current.institutionName || "") ||
      sslcData.boardType !== (initialSslc.current.boardType || "") ||
      sslcData.resultFormat !== (initialSslc.current.resultFormat || "") ||
      sslcData.yearOfPassing !== (initialSslc.current.yearOfPassing || "") ||
      sslcData.result !== (initialSslc.current.result || "");
    setSslcChanged(hasChanged);
  }, [sslcData]);

  // Check PU changes
  useEffect(() => {
    const hasChanged = 
      puData.institutionName !== (initialPu.current.institutionName || "") ||
      puData.boardType !== (initialPu.current.boardType || "") ||
      puData.yearOfPassing !== (initialPu.current.yearOfPassing || "") ||
      puData.resultFormat !== (initialPu.current.resultFormat || "") ||
      puData.subjectStream !== (initialPu.current.subjectStream || "") ||
      puData.result !== (initialPu.current.result || "");
    setPuChanged(hasChanged);
  }, [puData]);

  // Check Higher Education changes
  useEffect(() => {
    const changes: Record<string, string[]> = {};
    higherEducations.forEach(edu => {
      const initial = initialHigher.current[edu.id];
      if (initial) {
        const changedFields = getEducationChangedFields(edu, initial);
        if (changedFields.length > 0) {
          changes[edu.id] = changedFields;
        }
      } else if (edu.degree || edu.institutionName) {
        // Treat new/unsaved education card as 'changed' if any field is filled
        changes[edu.id] = ['new'];
      }
    });
    setHigherChanges(changes);
  }, [higherEducations]);

  // Check Extra Education changes
  useEffect(() => {
    const changes: Record<string, string[]> = {};
    extraEducations.forEach(edu => {
      const initial = initialExtra.current[edu.id];
      if (initial) {
        const changedFields = getEducationChangedFields(edu, initial);
        if (changedFields.length > 0) {
          changes[edu.id] = changedFields;
        }
      } else if (edu.degree || edu.institutionName) {
        // Treat new/unsaved education card as 'changed' if any field is filled
        changes[edu.id] = ['new'];
      }
    });
    setExtraChanges(changes);
  }, [extraEducations]);

  // Helper to extract changed fields between current and initial education objects
  const getEducationChangedFields = (current: HigherEducation, initial: HigherEducation): string[] => {
    const changedFields = [];
    if (current.degree !== (initial.degree || "")) changedFields.push('degree');
    if (current.institutionName !== (initial.institutionName || "")) changedFields.push('institutionName');
    if (current.universityBoard !== (initial.universityBoard || "")) changedFields.push('universityBoard');
    if (current.fieldOfStudy !== (initial.fieldOfStudy || "")) changedFields.push('fieldOfStudy');
    if (current.startYear !== (initial.startYear || "")) changedFields.push('startYear');
    if (current.endYear !== (initial.endYear || "")) changedFields.push('endYear');
    if (current.resultFormat !== (initial.resultFormat || "")) changedFields.push('resultFormat');
    if (current.result !== (initial.result || "")) changedFields.push('result');
    if (current.currentlyPursuing !== (initial.currentlyPursuing || false)) changedFields.push('currentlyPursuing');
    return changedFields;
  };

  // Helper function to validate result format
  const validateResult = (value: string, format: string) => {
    if (!value || !format) return "";

    switch (format) {
      case "Percentage":
        const percentage = parseFloat(value);
        if (isNaN(percentage)) return "Must be a number";
        if (percentage < 0 || percentage > 100) return "Must be between 0-100";
        break;
      case "CGPA":
        const cgpa = parseFloat(value);
        if (isNaN(cgpa)) return "Must be a number";
        if (cgpa < 0 || cgpa > 10) return "Must be between 0-10";
        break;
      case "Grade":
        if (!/^[A-F][+-]?$/i.test(value)) return "Enter valid grade (A, B+, etc.)";
        break;
    }
    return "";
  };

  // Helper function to validate institution/board names
  const validateInstitutionName = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,'-]+$/.test(value)) {
      return "Invalid characters in name";
    }
    return "";
  };

  // Helper function to validate date range
  const validateDateRange = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      if (endDate < startDate) {
        return "End date cannot be before start date";
      }
    }
    return "";
  };

  // Helper to format year for API payload
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
    
    const n = parseInt(val as string, 10);
    return isNaN(n) ? val : n;
  };

  // Handler for SSLC data changes
  const handleSslcChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSslcData((prev) => ({ ...prev, [name]: value }));

    if (name === "result") {
      const error = validateResult(value, sslcData.resultFormat);
      setErrors((prev) => ({ ...prev, [`sslc-result`]: error }));
    } else if (name === "resultFormat") {
      const error = validateResult(sslcData.result, value);
      setErrors((prev) => ({ ...prev, [`sslc-result`]: error }));
    } else if (name === "institutionName") {
      const error = validateInstitutionName(value);
      setErrors((prev) => ({ ...prev, [`sslc-institutionName`]: error }));
    }
  };

  // Handler for PU data changes
  const handlePuChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPuData((prev) => ({ ...prev, [name]: value }));

    if (name === "result") {
      const error = validateResult(value, puData.resultFormat);
      setErrors((prev) => ({ ...prev, [`pu-result`]: error }));
    } else if (name === "resultFormat") {
      const error = validateResult(puData.result, value);
      setErrors((prev) => ({ ...prev, [`pu-result`]: error }));
    } else if (name === "institutionName") {
      const error = validateInstitutionName(value);
      setErrors((prev) => ({ ...prev, [`pu-institutionName`]: error }));
    }
  };

  // Handler for Higher/Extra Education card data changes
  const handleEducationChange = (
    id: string,
    field: string,
    value: string | boolean,
    isExtra: boolean
  ) => {
    const setter = isExtra ? setExtraEducations : setHigherEducations;
    const currentList = isExtra ? extraEducations : higherEducations;
    const prefix = isExtra ? `extra-${currentList.findIndex(e => e.id === id)}` : `higher-${currentList.findIndex(e => e.id === id)}`;
    const index = currentList.findIndex(e => e.id === id);

    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Special handling for currentlyPursuing toggling endYear
      if (field === 'currentlyPursuing' && value === true) {
          updated[index].endYear = ""; // Clear end year when pursuing
      } else if (field === 'currentlyPursuing' && value === false) {
          // Clear validation error if checkbox is unchecked
          setErrors((prevErrors) => {
              const newErrors = { ...prevErrors };
              delete newErrors[`${prefix}-endYear`];
              return newErrors;
          });
      }

      return updated;
    });

    // Validation logic
    const updatedEdu = { ...currentList[index], [field]: value };

    if (field === "result" && typeof value === "string") {
      const error = validateResult(value, updatedEdu.resultFormat);
      setErrors((prev) => ({ ...prev, [`${prefix}-result`]: error }));
    } else if (field === "resultFormat" && typeof value === "string") {
      const error = validateResult(updatedEdu.result, value);
      setErrors((prev) => ({ ...prev, [`${prefix}-result`]: error }));
    } else if (field === "institutionName" && typeof value === "string") {
      const error = validateInstitutionName(value);
      setErrors((prev) => ({ ...prev, [`${prefix}-institutionName`]: error }));
    } else if (field === "universityBoard" && typeof value === "string") {
      const error = validateInstitutionName(value);
      setErrors((prev) => ({ ...prev, [`${prefix}-universityBoard`]: error }));
    } else if (field === "startYear" && typeof value === "string") {
      const error = validateDateRange(value, updatedEdu.endYear);
      setErrors((prev) => ({ ...prev, [`${prefix}-endYear`]: error }));
    } else if (field === "endYear" && typeof value === "string") {
      const error = validateDateRange(updatedEdu.startYear, value);
      setErrors((prev) => ({ ...prev, [`${prefix}-endYear`]: error }));
    }
  };

  // Handler for saving SSLC details (PUT/POST call)
  const handleSaveSslc = async () => {
    const currentData = sslcData;
    const initial = initialSslc.current;
    
    // Check for validation errors
    if (errors['sslc-result'] || errors['sslc-institutionName']) return;

    try {
      let payload: Record<string, any> = {};
      let isChanged = false;

      // Build payload with only changed fields for PUT
      if (currentData.institutionName !== (initial.institutionName || "")) {
        payload.institution_name = currentData.institutionName;
        isChanged = true;
      }
      if (currentData.boardType !== (initial.boardType || "")) {
        payload.board_type = currentData.boardType;
        isChanged = true;
      }
      if (currentData.resultFormat !== (initial.resultFormat || "")) {
        payload.result_format = currentData.resultFormat?.toLowerCase();
        isChanged = true;
      }
      if (currentData.yearOfPassing !== (initial.yearOfPassing || "")) {
        payload.end_year = buildYear(currentData.yearOfPassing);
        isChanged = true;
      }
      if (currentData.result !== (initial.result || "")) {
        payload.result = currentData.result;
        isChanged = true;
      }

      if (!isChanged) {
        setSslcFeedback("No changes to save.");
        setTimeout(() => setSslcFeedback(""), 3000);
        return;
      }

      if (currentData.education_id) {
        // Update existing record (PUT)
        await updateEducationDetails(userId, token, currentData.education_id, payload);
        initialSslc.current = { ...currentData };
        setSslcChanged(false);
        setSslcFeedback("SSLC details updated successfully!");
      } else {
        // Create new record (POST) - need full payload
        const fullPayload = {
          education_type: "sslc",
          institution_name: currentData.institutionName || "",
          board_type: currentData.boardType || "",
          end_year: buildYear(currentData.yearOfPassing),
          result_format: (currentData.resultFormat || "").toLowerCase(),
          result: currentData.result || "",
        };
        const response = await saveEducationDetails(userId, token, [fullPayload]);
        if (response && response[0]) {
          setSslcData(prev => ({ ...prev, education_id: response[0].education_id }));
          initialSslc.current = { ...currentData, education_id: response[0].education_id };
        }
        setSslcChanged(false);
        setSslcFeedback("SSLC details saved successfully! ");
      }
      
      setTimeout(() => setSslcFeedback(""), 3000);
    } catch (error) {
      console.error("Error saving SSLC:", error);
      setSslcFeedback("Failed to save SSLC details ");
      setTimeout(() => setSslcFeedback(""), 3000);
    }
  };

  // Handler for saving PU details (PUT/POST call)
  const handleSavePu = async () => {
    const currentData = puData;
    const initial = initialPu.current;
    
    // Check for validation errors
    if (errors['pu-result'] || errors['pu-institutionName']) return;

    try {
      let payload: Record<string, any> = {};
      let isChanged = false;

      // Build payload with only changed fields for PUT
      if (currentData.institutionName !== (initial.institutionName || "")) {
        payload.institution_name = currentData.institutionName;
        isChanged = true;
      }
      if (currentData.boardType !== (initial.boardType || "")) {
        payload.board_type = currentData.boardType;
        isChanged = true;
      }
      if (currentData.subjectStream !== (initial.subjectStream || "")) {
        payload.subject_stream = currentData.subjectStream;
        isChanged = true;
      }
      if (currentData.resultFormat !== (initial.resultFormat || "")) {
        payload.result_format = currentData.resultFormat?.toLowerCase();
        isChanged = true;
      }
      if (currentData.yearOfPassing !== (initial.yearOfPassing || "")) {
        payload.end_year = buildYear(currentData.yearOfPassing);
        isChanged = true;
      }
      if (currentData.result !== (initial.result || "")) {
        payload.result = currentData.result;
        isChanged = true;
      }
      
      if (!isChanged) {
        setPuFeedback("No changes to save.");
        setTimeout(() => setPuFeedback(""), 3000);
        return;
      }

      if (currentData.education_id) {
        // Update existing record (PUT)
        await updateEducationDetails(userId, token, currentData.education_id, payload);
        initialPu.current = { ...currentData };
        setPuChanged(false);
        setPuFeedback("PU details updated successfully! ");
      } else {
        // Create new record (POST) - need full payload
        const fullPayload = {
          education_type: "puc",
          institution_name: currentData.institutionName || "",
          board_type: currentData.boardType || "",
          subject_stream: currentData.subjectStream || "",
          end_year: buildYear(currentData.yearOfPassing),
          result_format: (currentData.resultFormat || "").toLowerCase(),
          result: currentData.result || "",
        };
        const response = await saveEducationDetails(userId, token, [fullPayload]);
        if (response && response[0]) {
          setPuData(prev => ({ ...prev, education_id: response[0].education_id }));
          initialPu.current = { ...currentData, education_id: response[0].education_id };
        }
        setPuChanged(false);
        setPuFeedback("PU details saved successfully! ");
      }
      
      setTimeout(() => setPuFeedback(""), 3000);
    } catch (error) {
      console.error("Error saving PU:", error);
      setPuFeedback("Failed to save PU details ");
      setTimeout(() => setPuFeedback(""), 3000);
    }
  };

  // Handler for saving Higher/Extra Education card details (PUT/POST call)
  const handleSaveHigherEducation = async (edu: HigherEducation, isExtra: boolean) => {
    const eduChanges = isExtra ? extraChanges[edu.id] : higherChanges[edu.id];
    const prefix = isExtra ? `extra-${extraEducations.findIndex(e => e.id === edu.id)}` : `higher-${higherEducations.findIndex(e => e.id === edu.id)}`;

    // Check for validation errors in current card
    if (errors[`${prefix}-result`] || errors[`${prefix}-institutionName`] || errors[`${prefix}-universityBoard`] || errors[`${prefix}-endYear`]) return;
    const isNew = !edu.education_id;
    // Handle initial save or update
    try {
      
      let payload: Record<string, any> = {};

      if (isNew) {
        // New record, construct full payload
        payload = {
          education_type: "higher",
          degree: edu.degree || "",
          field_of_study: edu.fieldOfStudy || "",
          institution_name: edu.institutionName || "",
          university_name: edu.universityBoard || "",
          start_year: buildYear(edu.startYear),
          end_year: buildYear(edu.endYear),
          result_format: (edu.resultFormat || "").toLowerCase(),
          result: edu.result || "",
          currently_pursuing: edu.currentlyPursuing || false,
        };
        
        // Skip saving empty new cards
        if (!edu.degree && !edu.institutionName) {
            const feedbackSetter = isExtra ? setExtraFeedback : setHigherFeedback;
            feedbackSetter(prev => ({ ...prev, [edu.id]: "Cannot save empty card." }));
            setTimeout(() => feedbackSetter(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; }), 3000);
            return;
        }

        const response = await saveEducationDetails(userId, token, [payload]);
        const updatedEdu = { ...edu, education_id: response[0].education_id };
        
        // Update local state and refs
        const setter = isExtra ? setExtraEducations : setHigherEducations;
        setter(prev => prev.map(e => e.id === edu.id ? updatedEdu : e));
        const initialRef = isExtra ? initialExtra : initialHigher;
        initialRef.current[edu.id] = updatedEdu;

        const feedbackSetter = isExtra ? setExtraFeedback : setHigherFeedback;
        feedbackSetter(prev => ({ ...prev, [edu.id]: "Saved successfully! " }));
        
      } else {
        // Existing record, check for changes and build minimal payload (PUT)
        if (!eduChanges || eduChanges.length === 0) {
            const feedbackSetter = isExtra ? setExtraFeedback : setHigherFeedback;
            feedbackSetter(prev => ({ ...prev, [edu.id]: "No changes to save." }));
            setTimeout(() => feedbackSetter(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; }), 3000);
            return;
        }

        eduChanges.forEach(field => {
          switch(field) {
            case 'degree': payload.degree = edu.degree; break;
            case 'fieldOfStudy': payload.field_of_study = edu.fieldOfStudy; break;
            case 'institutionName': payload.institution_name = edu.institutionName; break;
            case 'universityBoard': payload.university_name = edu.universityBoard; break;
            case 'startYear': payload.start_year = buildYear(edu.startYear); break;
            case 'endYear': payload.end_year = buildYear(edu.endYear); break;
            case 'resultFormat': payload.result_format = edu.resultFormat?.toLowerCase(); break;
            case 'result': payload.result = edu.result; break;
            case 'currentlyPursuing': payload.currently_pursuing = edu.currentlyPursuing; break;
          }
        });

        await updateEducationDetails(userId, token, edu.education_id, payload);
        
        // Update local state and refs
        const initialRef = isExtra ? initialExtra : initialHigher;
        initialRef.current[edu.id] = { ...edu };

        const changesSetter = isExtra ? setExtraChanges : setHigherChanges;
        changesSetter(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; });
        
        const feedbackSetter = isExtra ? setExtraFeedback : setHigherFeedback;
        feedbackSetter(prev => ({ ...prev, [edu.id]: "Updated successfully! " }));
      }

      // Clear feedback after 3 seconds
      setTimeout(() => {
        const feedbackSetter = isExtra ? setExtraFeedback : setHigherFeedback;
        feedbackSetter(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; });
      }, 3000);

    } catch (error) {
      console.error("Error saving education:", error);
      const feedback = isNew ? "Failed to save " : "Failed to update ";
      const feedbackSetter = isExtra ? setExtraFeedback : setHigherFeedback;
      feedbackSetter(prev => ({ ...prev, [edu.id]: feedback }));
      setTimeout(() => feedbackSetter(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; }), 3000);
    }
  };


  // Handler to add an extra education card
  const addEducation = () => {
    const newEdu: HigherEducation = {
      id: Date.now().toString(),
      degree: "",
      institutionName: "",
      universityBoard: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
      resultFormat: "",
      result: "",
      currentlyPursuing: false,
    };
    setExtraEducations([...extraEducations, newEdu]);
    setExtraExpanded((prev) => ({ ...prev, [newEdu.id]: true }));
    // A new card is considered 'changed' until saved
    setExtraChanges(prev => ({ ...prev, [newEdu.id]: ['new'] }));
  };

  // Handler to remove an extra education card and perform DELETE API call if necessary
  const removeEducation = async (index: number) => {
    const edu = extraEducations[index];
    
    if (edu.education_id) {
      try {
        await deleteEducation(userId, token, edu.education_id);
        deletedEducationIds.current.push(edu.education_id);
        const feedbackSetter = setExtraFeedback;
        feedbackSetter(prev => ({ ...prev, [edu.id]: "Deleted successfully! " }));
        setTimeout(() => feedbackSetter(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; }), 3000);
      } catch (error) {
        console.error("Error deleting education:", error);
        setExtraFeedback(prev => ({ ...prev, [edu.id]: "Failed to delete " }));
        setTimeout(() => setExtraFeedback(prev => { const updated = { ...prev }; delete updated[edu.id]; return updated; }), 3000);
        return; // Stop removal if API call fails
      }
    }
    
    // Remove from state and clear associated data/errors
    const id = edu.id;
    setExtraEducations(extraEducations.filter((_, i) => i !== index));
    setExtraExpanded((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setExtraChanges((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setErrors((prev) => {
      const updated = { ...prev };
      // Clear errors by matching the prefix pattern for the removed index
      Object.keys(updated).forEach(key => {
          if (key.startsWith(`extra-${index}-`)) {
              delete updated[key];
          }
      });
      return updated;
    });
  };

  // Handler for clearing SSLC form data
  const handleClearEducationSSLC = () => {
    setSslcData(prev => ({
      ...prev,
      institutionName: "",
      boardType: "",
      resultFormat: "",
      yearOfPassing: "",
      result: "",
    }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated["sslc-result"];
      delete updated["sslc-institutionName"];
      return updated;
    });
    setSslcChanged(true);
    setSslcFeedback("");
  };

  // Handler for clearing PU form data
  const handleClearEducationPreUniversity = () => {
    setPuData(prev => ({
      ...prev,
      institutionName: "",
      boardType: "",
      yearOfPassing: "",
      resultFormat: "",
      subjectStream: "",
      result: "",
    }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated["pu-result"];
      delete updated["pu-institutionName"];
      return updated;
    });
    setPuChanged(true);
    setPuFeedback("");
  };

  // Handler for clearing Higher/Extra Education card data
  const handleClearHigherEducation = (id: string, isExtra: boolean) => {
    const setter = isExtra ? setExtraEducations : setHigherEducations;
    const currentList = isExtra ? extraEducations : higherEducations;
    const index = currentList.findIndex(e => e.id === id);
    const prefix = isExtra ? `extra-${index}` : `higher-${index}`;
    
    if (index === -1) return;

    setter((prev) =>
      prev.map((edu, i) =>
        i === index
          ? {
              ...edu,
              degree: "",
              institutionName: "",
              universityBoard: "",
              fieldOfStudy: "",
              startYear: "",
              endYear: "",
              resultFormat: "",
              result: "",
              currentlyPursuing: false,
            }
          : edu
      )
    );
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`${prefix}-result`];
      delete updated[`${prefix}-institutionName`];
      delete updated[`${prefix}-universityBoard`];
      delete updated[`${prefix}-endYear`];
      return updated;
    });
    
    // Mark as changed to re-enable Save button
    const changesSetter = isExtra ? setExtraChanges : setHigherChanges;
    changesSetter(prev => ({ ...prev, [id]: ['cleared'] }));
  };

  // Check if there are any unsaved changes in any section
  const hasUnsavedChanges = sslcChanged || puChanged || Object.keys(higherChanges).length > 0 || Object.keys(extraChanges).length > 0;

  // Final submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasUnsavedChanges) {
      setSslcFeedback(sslcChanged ? "Please save your SSLC changes before proceeding" : "");
      setPuFeedback(puChanged ? "Please save your PU changes before proceeding" : "");
      Object.keys(higherChanges).forEach(id => {
        setHigherFeedback(prev => ({ ...prev, [id]: "Please save your changes before proceeding" }));
        setTimeout(() => setHigherFeedback(prev => { const updated = { ...prev }; delete updated[id]; return updated; }), 3000);
      });
      Object.keys(extraChanges).forEach(id => {
        setExtraFeedback(prev => ({ ...prev, [id]: "Please save your changes before proceeding" }));
        setTimeout(() => setExtraFeedback(prev => { const updated = { ...prev }; delete updated[id]; return updated; }), 3000);
      });
      return;
    }

    onNext({
      sslc: sslcData,
      pu: puData,
      higherEducations: higherEducations.filter(e => e.degree || e.institutionName || e.education_id),
      extraEducations: extraEducations.filter(e => e.degree || e.institutionName || e.education_id),
      deletedEducationIds: deletedEducationIds.current,
    });
  };

  // Render function for all education cards
  const renderEducationCard = (
    education: HigherEducation,
    index: number,
    isExtra: boolean = false,
    isMandatory: boolean = false
  ) => {
    const id = education.id;
    const expanded = isExtra ? extraExpanded[id] : higherExpanded[id];
    const prefix = isExtra ? `extra-${index}` : `higher-${index}`;
    const changed = isExtra ? (extraChanges[id]?.length > 0) : (higherChanges[id]?.length > 0);
    const feedback = isExtra ? extraFeedback[id] : higherFeedback[id];
    const handleSave = () => handleSaveHigherEducation(education, isExtra);
    const handleClear = () => handleClearHigherEducation(id, isExtra);
    const handleChange = (field: string, value: string | boolean) => handleEducationChange(id, field, value, isExtra);

    return (
      <div
        key={id}
        className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            {isExtra ? `Higher Education ${index + 1}` : "Higher Education*"}
          </h3>
          <div className="flex gap-2 items-center">
             {changed && (
                <button
                    type="button"
                    onClick={handleSave}
                    className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                    title="Save changes"
                >
                    <Save
                        className="w-3 h-3 text-green-600 cursor-pointer"
                        strokeWidth={2.5}
                    />
                </button>
            )}
            <button
              type="button"
              onClick={() => handleEducationExpandToggle(id, isExtra)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 text-gray-600 transition-transform cursor-pointer ${
                  expanded ? "" : "rotate-180"
                }`}
                strokeWidth={2.5}
              />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw
                className="w-3 h-3 text-gray-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
            {isExtra && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="w-5 h-5 flex items-center justify-center rounded border-2 border-red-500 hover:bg-red-50 transition-colors"
                title="Delete this education record"
              >
                <Trash2
                  className="w-3 h-3 text-red-500 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        </div>
        
        {feedback && (
          <div className={`p-4 text-sm ${
            feedback.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {feedback}
          </div>
        )}

        {expanded && (
          <div className="p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Degree */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Degree
                </label>
                <div className="relative">
                  <select
                    value={education.degree}
                    onChange={(e) => handleChange("degree", e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Degree</option>
                    <option value="Bachelor">Bachelor's Degree</option>
                    <option value="Master">Master's Degree</option>
                    <option value="Diploma">Diploma</option>
                    <option value="PhD">PhD</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Field Of Study
                </label>
                <div className="relative">
                  <select
                    value={education.fieldOfStudy}
                    onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Field of Study</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Institution Name */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={education.institutionName}
                  onChange={(e) => handleChange("institutionName", e.target.value)}
                  placeholder="Enter Institution Name"
                  className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    errors[`${prefix}-institutionName`]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                  }`}
                />
                {errors[`${prefix}-institutionName`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${prefix}-institutionName`]}</p>
                )}
              </div>

              {/* University Board */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  University/ Board
                </label>
                <input
                  type="text"
                  value={education.universityBoard}
                  onChange={(e) => handleChange("universityBoard", e.target.value)}
                  placeholder="Enter University/ Board Name"
                  className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    errors[`${prefix}-universityBoard`]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                  }`}
                />
                {errors[`${prefix}-universityBoard`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${prefix}-universityBoard`]}</p>
                )}
              </div>

              {/* Start Year */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Start Year
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={education.startYear}
                    onChange={(e) => handleChange("startYear", e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* End Year */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  End Year
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={education.endYear}
                    onChange={(e) => handleChange("endYear", e.target.value)}
                    disabled={education.currentlyPursuing}
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm disabled:bg-gray-100 ${
                      errors[`${prefix}-endYear`]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors[`${prefix}-endYear`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${prefix}-endYear`]}</p>
                )}
              </div>

              {/* Currently Pursuing Checkbox */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={education.currentlyPursuing}
                    onChange={(e) => handleChange("currentlyPursuing", e.target.checked)}
                    className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">
                    Currently Pursuing
                  </span>
                </label>
              </div>

              {/* Result Format */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Result Format
                </label>
                <div className="relative">
                  <select
                    value={education.resultFormat}
                    onChange={(e) => handleChange("resultFormat", e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Result Format</option>
                    <option value="Percentage">Percentage</option>
                    <option value="CGPA">CGPA</option>
                    <option value="Grade">Grade</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Result */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Result
                </label>
                <input
                  type="text"
                  value={education.result}
                  onChange={(e) => handleChange("result", e.target.value)}
                  placeholder="Enter Result"
                  className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    errors[`${prefix}-result`]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                  }`}
                />
                {errors[`${prefix}-result`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`${prefix}-result`]}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper for toggling education card expansion
  const handleEducationExpandToggle = (id: string, isExtra: boolean) => {
    if (isExtra) {
      setExtraExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    } else {
      setHigherExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Step Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Step 2: Education Details
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Add your educational background (SSLC and PUC details are not
            mandatory but included)
          </p>
        </div>

        {/* SSLC (10th Standard) */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              SSLC (10th Standard)*
            </h3>
            <div className="flex gap-2 items-center">
              {sslcChanged && (
                <button
                    type="button"
                    onClick={handleSaveSslc}
                    className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                    title="Save changes"
                >
                    <Save
                        className="w-3 h-3 text-green-600 cursor-pointer"
                        strokeWidth={2.5}
                    />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSslcExpanded(!sslcExpanded)}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 transition-transform cursor-pointer ${
                    sslcExpanded ? "" : "rotate-180"
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <button
                type="button"
                onClick={handleClearEducationSSLC}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
          
          {sslcFeedback && (
              <div className={`p-4 text-sm ${
                sslcFeedback.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {sslcFeedback}
              </div>
            )}

          {sslcExpanded && (
            <div className="p-4 sm:p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={sslcData.institutionName}
                    onChange={handleSslcChange}
                    placeholder="Enter Institute Name"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors["sslc-institutionName"]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors["sslc-institutionName"] && (
                    <p className="mt-1 text-xs text-red-500">{errors["sslc-institutionName"]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Board Type
                  </label>
                  <div className="relative">
                    <select
                      name="boardType"
                      value={sslcData.boardType}
                      onChange={handleSslcChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Board Type</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Year Of Passing
                  </label>
                  <input
                    type="month"
                    name="yearOfPassing"
                    value={sslcData.yearOfPassing}
                    onChange={handleSslcChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Result Format
                  </label>
                  <div className="relative">
                    <select
                      name="resultFormat"
                      value={sslcData.resultFormat}
                      onChange={handleSslcChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Result Format</option>
                      <option value="Percentage">Percentage</option>
                      <option value="CGPA">CGPA</option>
                      <option value="Grade">Grade</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Result
                  </label>
                  <input
                    type="text"
                    name="result"
                    value={sslcData.result}
                    onChange={handleSslcChange}
                    placeholder="Enter Result"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors["sslc-result"]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors["sslc-result"] && (
                    <p className="mt-1 text-xs text-red-500">{errors["sslc-result"]}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pre-University (12th Standard) */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              Pre-university (12th Standard)*
            </h3>
            <div className="flex gap-2 items-center">
              {puChanged && (
                <button
                    type="button"
                    onClick={handleSavePu}
                    className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                    title="Save changes"
                >
                    <Save
                        className="w-3 h-3 text-green-600 cursor-pointer"
                        strokeWidth={2.5}
                    />
                </button>
              )}
              <button
                type="button"
                onClick={() => setPuExpanded(!puExpanded)}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 transition-transform cursor-pointer ${
                    puExpanded ? "" : "rotate-180"
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <button
                type="button"
                onClick={handleClearEducationPreUniversity}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
          
          {puFeedback && (
              <div className={`p-4 text-sm ${
                puFeedback.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {puFeedback}
              </div>
            )}

          {puExpanded && (
            <div className="p-4 sm:p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={puData.institutionName}
                    onChange={handlePuChange}
                    placeholder="Enter Institute Name"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors["pu-institutionName"]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors["pu-institutionName"] && (
                    <p className="mt-1 text-xs text-red-500">{errors["pu-institutionName"]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Board Type
                  </label>
                  <div className="relative">
                    <select
                      name="boardType"
                      value={puData.boardType}
                      onChange={handlePuChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Board Type</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Subject Stream
                  </label>
                  <div className="relative">
                    <select
                      name="subjectStream"
                      value={puData.subjectStream}
                      onChange={handlePuChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Subject Stream</option>
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Year Of Passing
                  </label>
                  <input
                    type="month"
                    name="yearOfPassing"
                    value={puData.yearOfPassing}
                    onChange={handlePuChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Result Format
                  </label>
                  <div className="relative">
                    <select
                      name="resultFormat"
                      value={puData.resultFormat}
                      onChange={handlePuChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Result Format</option>
                      <option value="Percentage">Percentage</option>
                      <option value="CGPA">CGPA</option>
                      <option value="Grade">Grade</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Result
                  </label>
                  <input
                    type="text"
                    name="result"
                    value={puData.result}
                    onChange={handlePuChange}
                    placeholder="Enter Result"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors["pu-result"]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors["pu-result"] && (
                    <p className="mt-1 text-xs text-red-500">{errors["pu-result"]}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Higher Education (Mandatory - First Card) */}
        {higherEducations.map((edu, index) =>
          renderEducationCard(edu, index, false, true)
        )}
        
        {/* Extra Education Cards (Additional Higher Education) */}
        {extraEducations.map((edu, index) =>
          renderEducationCard(edu, index, true, false)
        )}

        {/* Add Education Button */}
        <button
          type="button"
          onClick={addEducation}
          className="flex items-center gap-2 px-4 py-2.5 text-orange-400 hover:text-orange-500 font-medium text-sm transition-colors mb-4 md:mb-5 cursor-pointer"
        >
          <Plus className="w-4 h-4 cursor-pointer" />
          Add Education
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
              background: hasUnsavedChanges ? "#BDBDBD" : "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
            }}
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            Proceed to next
          </button>
        </div>
      </div>
    </form>
  );
}