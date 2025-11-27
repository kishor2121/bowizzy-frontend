import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Trash2, Plus, Save } from "lucide-react";
import { 
  updateExperienceDetails, 
  saveExperienceDetails, 
  deleteExperience,
  updateJobRole // NEW IMPORT
} from "@/services/experienceService";

interface ExperienceDetailsFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  userId: string;
  token: string;
}

interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  workMode: string;
  startDate: string;
  endDate: string;
  description: string;
  currentlyWorking: boolean;
  isExpanded: boolean;
  experience_id?: number;
}

export default function ExperienceDetailsForm({
  onNext,
  onBack,
  initialData = {},
  userId,
  token,
}: ExperienceDetailsFormProps) {
  // State for Job Role (single value)
  const [jobRole, setJobRole] = useState(initialData.jobRole || "");
  const [jobRoleExpanded, setJobRoleExpanded] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize work experiences, ensuring at least one card is present
  const initialExperiences: WorkExperience[] = initialData.workExperiences && initialData.workExperiences.length > 0 
    ? initialData.workExperiences.map((exp: any) => ({
        ...exp,
        id: exp.id || exp.experience_id?.toString() || Date.now().toString(),
        isExpanded: exp.isExpanded ?? false,
      }))
    : [{
        id: "1",
        companyName: "",
        jobTitle: "",
        employmentType: "",
        location: "",
        workMode: "",
        startDate: "",
        endDate: "",
        description: "",
        currentlyWorking: false,
        isExpanded: true, // Expand first empty card
      }];

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(initialExperiences);
  
  // State for tracking changes and feedback
  const [jobRoleChanged, setJobRoleChanged] = useState(false);
  const [jobRoleFeedback, setJobRoleFeedback] = useState("");
  const [experienceChanges, setExperienceChanges] = useState<Record<string, string[]>>({});
  const [experienceFeedback, setExperienceFeedback] = useState<Record<string, string>>({});
  
  // Refs for tracking initial data and deleted IDs
  const initialJobRole = useRef(jobRole);
  const initialExperiencesRef = useRef<Record<string, WorkExperience>>({});
  const deletedExperienceIds = useRef<number[]>([]);

  // Initialize refs on mount
  useEffect(() => {
    workExperiences.forEach(exp => {
      initialExperiencesRef.current[exp.id] = { ...exp };
    });
  }, []);

  // Check Job Role change
  useEffect(() => {
    setJobRoleChanged(jobRole !== initialJobRole.current);
  }, [jobRole]);

  // Check Work Experience changes
  useEffect(() => {
    const changes: Record<string, string[]> = {};
    workExperiences.forEach(current => {
      const initial = initialExperiencesRef.current[current.id];
      const changedFields: string[] = [];
      
      // Compare fields (handling undefined/null/empty string)
      if (current.companyName !== (initial?.companyName || "")) changedFields.push('companyName');
      if (current.jobTitle !== (initial?.jobTitle || "")) changedFields.push('jobTitle');
      if (current.employmentType !== (initial?.employmentType || "")) changedFields.push('employmentType');
      if (current.location !== (initial?.location || "")) changedFields.push('location');
      if (current.workMode !== (initial?.workMode || "")) changedFields.push('workMode');
      if (current.startDate !== (initial?.startDate || "")) changedFields.push('startDate');
      if (current.endDate !== (initial?.endDate || "")) changedFields.push('endDate');
      if (current.description !== (initial?.description || "")) changedFields.push('description');
      if (current.currentlyWorking !== (initial?.currentlyWorking || false)) changedFields.push('currentlyWorking');
      
      if (changedFields.length > 0) {
        changes[current.id] = changedFields;
      } else if (!current.experience_id && (current.companyName || current.jobTitle)) {
         // Treat new/unsaved card as 'changed' if fields are filled
         changes[current.id] = ['new'];
      }
    });
    setExperienceChanges(changes);
  }, [workExperiences]);

  // Validation functions
  const validateCompanyName = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,&'-]+$/.test(value)) {
      return "Invalid characters in company name";
    }
    return "";
  };

  const validateJobTitle = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s./-]+$/.test(value)) {
      return "Invalid characters in job title";
    }
    return "";
  };

  const validateDateRange = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      if (endDate < startDate) {
        return "End date cannot be before start date";
      }
    }
    return "";
  };
  
  // Helper to format date for API payload (YYYY-MM to YYYY-MM-01)
  const normalizeMonthToDate = (val: string): string | null => {
    if (!val) return null;
    if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
    return val;
  };

  // Handler for Job Role change
  const handleJobRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobRole(e.target.value);
  };

  // Handler for saving Job Role (PUT call to new endpoint)
  const handleSaveJobRole = async () => {
    if (!jobRoleChanged) {
      setJobRoleFeedback("No changes to save.");
      setTimeout(() => setJobRoleFeedback(""), 3000);
      return;
    }
    
    try {
        // Use the new dedicated API for job role update
        await updateJobRole(userId, token, { job_role: jobRole });
        
        initialJobRole.current = jobRole;
        setJobRoleChanged(false);
        setJobRoleFeedback("Job Role updated successfully!");
        setTimeout(() => setJobRoleFeedback(""), 3000);
    } catch (error) {
        console.error("Error saving Job Role:", error);
        setJobRoleFeedback("Failed to update Job Role.");
        setTimeout(() => setJobRoleFeedback(""), 3000);
    }
  };

  // Handler for individual Work Experience card changes
  const handleExperienceChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value, isExpanded: true };
    
    // Special handling for currentlyWorking toggling endDate
    if (field === 'currentlyWorking' && value === true) {
        updated[index].endDate = "";
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`exp-${index}-endDate`];
            return newErrors;
        });
    }

    setWorkExperiences(updated);

    // Validation logic
    if (field === "companyName" && typeof value === "string") {
      const error = validateCompanyName(value);
      setErrors((prev) => ({ ...prev, [`exp-${index}-companyName`]: error }));
    } else if (field === "jobTitle" && typeof value === "string") {
      const error = validateJobTitle(value);
      setErrors((prev) => ({ ...prev, [`exp-${index}-jobTitle`]: error }));
    } else if (field === "startDate" && typeof value === "string") {
      const error = validateDateRange(value, updated[index].endDate);
      setErrors((prev) => ({ ...prev, [`exp-${index}-endDate`]: error }));
    } else if (field === "endDate" && typeof value === "string") {
      const error = validateDateRange(updated[index].startDate, value);
      setErrors((prev) => ({ ...prev, [`exp-${index}-endDate`]: error }));
    }
  };

  // Handler for saving individual Work Experience card (PUT/POST call)
  const handleSaveExperience = async (exp: WorkExperience) => {
    const isNew = !exp.experience_id; 
    const expChanges = experienceChanges[exp.id];
    const index = workExperiences.findIndex(e => e.id === exp.id);
    const prefix = `exp-${index}`;
    
    // Check local validation errors
    if (errors[`${prefix}-companyName`] || errors[`${prefix}-jobTitle`] || errors[`${prefix}-endDate`]) return;

    try {
      let payload: Record<string, any> = {};

      if (isNew) {
        // New record, construct full payload for bulk POST
        payload = {
            job_role: jobRole,
            experiences: [{
                company_name: exp.companyName || "",
                job_title: exp.jobTitle || "",
                employment_type: exp.employmentType || "",
                location: exp.location || "",
                work_mode: exp.workMode || "",
                start_date: normalizeMonthToDate(exp.startDate),
                end_date: normalizeMonthToDate(exp.endDate),
                currently_working_here: exp.currentlyWorking,
                description: exp.description || "",
            }]
        };

        // Skip saving empty new cards
        if (!exp.companyName || !exp.jobTitle) {
            setExperienceFeedback(prev => ({ ...prev, [exp.id]: "Company Name and Job Title are required to save." }));
            setTimeout(() => setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; }), 3000);
            return;
        }

        const response = await saveExperienceDetails(userId, token, payload);
        
        // Correctly extract the experience_id from the POST response structure
        const newExperienceId = response?.experiences?.[0]?.experience_id;

        if (newExperienceId) {
            const updatedExp: WorkExperience = { ...exp, experience_id: newExperienceId };
            
            // Update local state and refs
            setWorkExperiences(prev => prev.map(e => e.id === exp.id ? updatedExp : e));
            initialExperiencesRef.current[exp.id] = updatedExp;
            
            setExperienceFeedback(prev => ({ ...prev, [exp.id]: "Saved successfully!" }));
        } else {
            console.warn("POST successful but failed to retrieve new experience_id. Relying on local state sync.");
            setExperienceFeedback(prev => ({ ...prev, [exp.id]: "Saved successfully, but ID retrieval failed (relying on next step sync)." }));
        }

        setExperienceChanges(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; });
        

      } else {
        // Existing record (PUT logic)
        if (!expChanges || expChanges.length === 0) {
            setExperienceFeedback(prev => ({ ...prev, [exp.id]: "No changes to save." }));
            setTimeout(() => setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; }), 3000);
            return;
        }

        const minimalPayload: Record<string, any> = {};
        
        // FIX: EXCLUDE job_role from the PUT payload to avoid 500 Internal Server Error
        // minimalPayload.job_role = jobRole; // REMOVED

        expChanges.forEach(field => {
          switch(field) {
            case 'companyName': minimalPayload.company_name = exp.companyName; break;
            case 'jobTitle': minimalPayload.job_title = exp.jobTitle; break;
            case 'employmentType': minimalPayload.employment_type = exp.employmentType; break;
            case 'location': minimalPayload.location = exp.location; break;
            case 'workMode': minimalPayload.work_mode = exp.workMode; break;
            case 'startDate': minimalPayload.start_date = normalizeMonthToDate(exp.startDate); break;
            case 'endDate': minimalPayload.end_date = normalizeMonthToDate(exp.endDate); break;
            case 'description': minimalPayload.description = exp.description; break;
            case 'currentlyWorking': minimalPayload.currently_working_here = exp.currentlyWorking; break;
          }
        });
        
        // Check if only the currently_working_here field changed, requiring end_date to be removed if true
        if (minimalPayload.currently_working_here === true) {
             minimalPayload.end_date = null;
        } else if (minimalPayload.currently_working_here === false) {
             // If currently_working_here changed to false, ensure end_date is set to the current end date value
             minimalPayload.end_date = normalizeMonthToDate(exp.endDate);
        }
        
        await updateExperienceDetails(userId, token, exp.experience_id!, minimalPayload);
        
        // Update local state and refs
        initialExperiencesRef.current[exp.id] = { ...exp };
        setExperienceChanges(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; });
        setExperienceFeedback(prev => ({ ...prev, [exp.id]: "Updated successfully!" }));
      }

      // Clear general feedback after 3 seconds
      setTimeout(() => {
        setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; });
      }, 3000);

    } catch (error) {
      console.error("Error saving experience:", error);
      const feedback = isNew ? "Failed to save." : "Failed to update.";
      setExperienceFeedback(prev => ({ ...prev, [exp.id]: feedback }));
      setTimeout(() => setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; }), 3000);
    }
  };

  // Handler for expanding/collapsing individual card
  const toggleExperienceExpanded = (index: number) => {
    const updated = [...workExperiences];
    updated[index] = {
      ...updated[index],
      isExpanded: !updated[index].isExpanded,
    };
    setWorkExperiences(updated);
  };

  // Handler for clearing individual card data (reverting to initial values)
  const resetExperience = (index: number) => {
    const exp = workExperiences[index];
    const updated = [...workExperiences];
    updated[index] = {
      ...exp,
      companyName: initialExperiencesRef.current[exp.id]?.companyName || "",
      jobTitle: initialExperiencesRef.current[exp.id]?.jobTitle || "",
      employmentType: initialExperiencesRef.current[exp.id]?.employmentType || "",
      location: initialExperiencesRef.current[exp.id]?.location || "",
      workMode: initialExperiencesRef.current[exp.id]?.workMode || "",
      startDate: initialExperiencesRef.current[exp.id]?.startDate || "",
      endDate: initialExperiencesRef.current[exp.id]?.endDate || "",
      description: initialExperiencesRef.current[exp.id]?.description || "",
      currentlyWorking: initialExperiencesRef.current[exp.id]?.currentlyWorking || false,
    };
    setWorkExperiences(updated);

    // Clear changes and errors for this experience
    setExperienceChanges(prev => { const updatedChanges = { ...prev }; delete updatedChanges[exp.id]; return updatedChanges; });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`exp-${index}-companyName`];
      delete newErrors[`exp-${index}-jobTitle`];
      delete newErrors[`exp-${index}-endDate`];
      return newErrors;
    });
    setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; });
  };
  
  // Handler for creating a new empty card
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      companyName: "",
      jobTitle: "",
      employmentType: "",
      location: "",
      workMode: "",
      startDate: "",
      endDate: "",
      description: "",
      currentlyWorking: false,
      isExpanded: true,
    };
    setWorkExperiences([...workExperiences, newExp]);
  };

  // Handler for removing an experience card and performing DELETE API call if necessary
  const removeWorkExperience = async (index: number) => {
    const exp = workExperiences[index];
    
    if (workExperiences.length === 1) return; // Cannot delete the last one

    if (exp.experience_id) {
      try {
        await deleteExperience(userId, token, exp.experience_id);
        deletedExperienceIds.current.push(exp.experience_id);
        setExperienceFeedback(prev => ({ ...prev, [exp.id]: "Deleted successfully!" }));
        setTimeout(() => setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; }), 3000);
      } catch (error) {
        console.error("Error deleting experience:", error);
        setExperienceFeedback(prev => ({ ...prev, [exp.id]: "Failed to delete." }));
        setTimeout(() => setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[exp.id]; return updated; }), 3000);
        return; // Stop removal if API call fails
      }
    }
    
    // Remove from state and clear associated data/errors
    const id = exp.id;
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    delete initialExperiencesRef.current[id];
    setExperienceChanges(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
    
    // Clear errors for removed experience
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`exp-${index}-`)) {
              delete newErrors[key];
          }
      });
      return newErrors;
    });
  };

  // Check if there are any unsaved changes in any section
  const hasUnsavedChanges = jobRoleChanged || Object.keys(experienceChanges).length > 0;
  
  // Final submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasUnsavedChanges) {
        setJobRoleFeedback(jobRoleChanged ? "Please save your Job Role changes before proceeding" : "");
        Object.keys(experienceChanges).forEach(id => {
            setExperienceFeedback(prev => ({ ...prev, [id]: "Please save your changes before proceeding" }));
            setTimeout(() => setExperienceFeedback(prev => { const updated = { ...prev }; delete updated[id]; return updated; }), 3000);
        });
        return;
    }
    
    // Filter out completely empty cards before sending to next step
    const validExperiences = workExperiences.filter(exp => exp.companyName || exp.experience_id);
    
    onNext({
      jobRole,
      workExperiences: validExperiences,
      deletedExperienceIds: deletedExperienceIds.current,
    });
  };

  // Render function for all experience cards
  const renderExperienceCard = (
    experience: WorkExperience,
    index: number,
    showDelete: boolean = false
  ) => {
    const changed = experienceChanges[experience.id]?.length > 0;
    const feedback = experienceFeedback[experience.id];

    return (
      <div
        key={experience.id}
        className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            Work Experience {index + 1}
          </h3>
          <div className="flex gap-2 items-center">
            {changed && (
                <button
                    type="button"
                    onClick={() => handleSaveExperience(experience)}
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
              onClick={() => toggleExperienceExpanded(index)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 text-gray-600 transition-transform cursor-pointer ${
                  !experience.isExpanded ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
              />
            </button>
            <button
              type="button"
              onClick={() => resetExperience(index)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw
                className="w-3 h-3 text-gray-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
            {showDelete && (
              <button
                type="button"
                onClick={() => removeWorkExperience(index)}
                className="w-5 h-5 flex items-center justify-center rounded border-2 border-red-500 hover:bg-red-50 transition-colors"
                title="Delete this experience"
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
            feedback.includes("successfully") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {feedback}
          </div>
        )}

        {/* Content */}
        {experience.isExpanded && (
          <div className="p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={experience.companyName}
                  onChange={(e) =>
                    handleExperienceChange(index, "companyName", e.target.value)
                  }
                  placeholder="Enter Company Name"
                  className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    errors[`exp-${index}-companyName`]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                  }`}
                />
                {errors[`exp-${index}-companyName`] && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[`exp-${index}-companyName`]}
                  </p>
                )}
              </div>

              {/* Job Title/Role */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Job Title/ Role
                </label>
                <input
                  type="text"
                  value={experience.jobTitle}
                  onChange={(e) =>
                    handleExperienceChange(index, "jobTitle", e.target.value)
                  }
                  placeholder="Enter Job Title"
                  className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    errors[`exp-${index}-jobTitle`]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                  }`}
                />
                {errors[`exp-${index}-jobTitle`] && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[`exp-${index}-jobTitle`]}
                  </p>
                )}
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Employment Type
                </label>
                <div className="relative">
                  <select
                    value={experience.employmentType}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        "employmentType",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <select
                    value={experience.location}
                    onChange={(e) =>
                      handleExperienceChange(index, "location", e.target.value)
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Location</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Work Mode */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Work Mode
                </label>
                <div className="relative">
                  <select
                    value={experience.workMode}
                    onChange={(e) =>
                      handleExperienceChange(index, "workMode", e.target.value)
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Work Mode</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={experience.startDate}
                    onChange={(e) =>
                      handleExperienceChange(index, "startDate", e.target.value)
                    }
                    placeholder="Select Start Date"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm pr-8"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={experience.endDate}
                    onChange={(e) =>
                      handleExperienceChange(index, "endDate", e.target.value)
                    }
                    placeholder="Select End Date"
                    disabled={experience.currentlyWorking}
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm pr-8 disabled:bg-gray-100 ${
                      errors[`exp-${index}-endDate`]
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors[`exp-${index}-endDate`] && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[`exp-${index}-endDate`]}
                  </p>
                )}
              </div>

              {/* Currently Working Here Checkbox */}
              <div className="sm:col-span-2 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={experience.currentlyWorking}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        "currentlyWorking",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">
                    Currently Working here
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={experience.description}
                  onChange={(e) =>
                    handleExperienceChange(index, "description", e.target.value)
                  }
                  placeholder="Provide Description / Projects of your Work"
                  rows={4}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="max-w-6xl mx-auto">
        {/* Step Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Step 3: Work Details
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Add your professional experience. Include company, role, and
            responsibilities to highlight your career journey. It's recommended
            to add work details that align with a single career path.
          </p>
        </div>

        {/* Job Role Section */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              Job Role*
            </h3>
            <div className="flex gap-2 items-center">
              {jobRoleChanged && (
                <button
                    type="button"
                    onClick={handleSaveJobRole}
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
                onClick={() => setJobRoleExpanded(!jobRoleExpanded)}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 transition-transform cursor-pointer ${
                    !jobRoleExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <button
                type="button"
                onClick={() => setJobRole(initialJobRole.current)} // Revert to initial state
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
          
          {jobRoleFeedback && (
            <div className={`p-4 text-sm ${
              jobRoleFeedback.includes("successfully") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {jobRoleFeedback}
            </div>
          )}

          {/* Content */}
          {jobRoleExpanded && (
            <div className="p-4 sm:p-5 md:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                We'll use your job role to tailor resumes, prep, and interviews
                for you. Make sure it's entered correctly so everything matches.
              </p>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Job Role
                </label>
                <div className="relative">
                  <select
                    value={jobRole}
                    onChange={handleJobRoleChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                  >
                    <option value="">Select Job Role</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Senior Software Engineer">
                      Senior Software Engineer
                    </option>
                    <option value="Full Stack Developer">
                      Full Stack Developer
                    </option>
                    <option value="Frontend Developer">
                      Frontend Developer
                    </option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Work Experience Cards */}
        {workExperiences.map((exp, index) =>
          renderExperienceCard(exp, index, workExperiences.length > 1)
        )}

        {/* Add Work Experience Button */}
        <button
          type="button"
          onClick={addWorkExperience}
          className="flex items-center gap-2 px-4 py-2.5 text-orange-400 hover:text-orange-500 font-medium text-sm transition-colors mb-4 md:mb-5 cursor-pointer"
        >
          <Plus className="w-4 h-4 cursor-pointer" />
          Add Work Experience
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
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            Proceed to next
          </button>
        </div>
      </div>
    </form>
  );
}