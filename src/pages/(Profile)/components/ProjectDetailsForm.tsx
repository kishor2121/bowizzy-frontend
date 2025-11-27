import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Trash2, Plus, Save } from "lucide-react";
import { 
  getProjectsByUserId,
  saveProjectsDetails, 
  updateProjectDetails, 
  deleteProject
} from "@/services/projectService";

interface ProjectDetailsFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  userId: string;
  token: string;
}

interface Project {
  id: string; // Client-side unique ID
  projectTitle: string;
  projectType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  rolesAndResponsibilities: string;
  isExpanded: boolean;
  project_id?: number; // Database ID
}

export default function ProjectDetailsForm({
  onNext,
  onBack,
  initialData = {},
  userId,
  token,
}: ProjectDetailsFormProps) {
  // Initialize projects, ensuring at least one card is present
  const initialProjects: Project[] = initialData.projects && initialData.projects.length > 0 
    ? initialData.projects.map((p: any) => ({
        ...p,
        id: p.id || p.project_id?.toString() || Date.now().toString(),
        isExpanded: p.isExpanded ?? false,
      }))
    : [{
        id: "1",
        projectTitle: "",
        projectType: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
        rolesAndResponsibilities: "",
        isExpanded: true,
      }];

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // State for tracking changes and feedback
  const [projectChanges, setProjectChanges] = useState<Record<string, string[]>>({});
  const [projectFeedback, setProjectFeedback] = useState<Record<string, string>>({});
  
  // Refs for tracking initial data and deleted IDs
  const initialProjectsRef = useRef<Record<string, Project>>({});
  const deletedProjectIds = useRef<number[]>([]);

  // Initialize refs on mount
  useEffect(() => {
    projects.forEach(p => {
      initialProjectsRef.current[p.id] = { ...p };
    });
  }, []);

  // Check Project changes
  useEffect(() => {
    const changes: Record<string, string[]> = {};
    projects.forEach(current => {
      const initial = initialProjectsRef.current[current.id];
      const changedFields: string[] = [];
      
      // Compare fields
      if (current.projectTitle !== (initial?.projectTitle || "")) changedFields.push('projectTitle');
      if (current.projectType !== (initial?.projectType || "")) changedFields.push('projectType');
      if (current.startDate !== (initial?.startDate || "")) changedFields.push('startDate');
      if (current.endDate !== (initial?.endDate || "")) changedFields.push('endDate');
      if (current.currentlyWorking !== (initial?.currentlyWorking || false)) changedFields.push('currentlyWorking');
      if (current.description !== (initial?.description || "")) changedFields.push('description');
      if (current.rolesAndResponsibilities !== (initial?.rolesAndResponsibilities || "")) changedFields.push('rolesAndResponsibilities');
      
      if (changedFields.length > 0) {
        changes[current.id] = changedFields;
      } else if (!current.project_id && current.projectTitle) {
         // Treat new/unsaved card as 'changed' if title is filled
         changes[current.id] = ['new'];
      }
    });
    setProjectChanges(changes);
  }, [projects]);

  // Validation functions
  const validateProjectTitle = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,-]+$/.test(value)) {
      return "Invalid characters in project title";
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

  // Handler for individual Project card changes
  const handleProjectChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value, isExpanded: true };
    
    if (field === 'currentlyWorking' && value === true) {
        updated[index].endDate = "";
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`project-${index}-endDate`];
            return newErrors;
        });
    }

    setProjects(updated);

    // Validation logic
    if (field === "projectTitle" && typeof value === "string") {
      const error = validateProjectTitle(value);
      setErrors((prev) => ({ ...prev, [`project-${index}-projectTitle`]: error }));
    } else if (field === "startDate" && typeof value === "string") {
      const error = validateDateRange(value, updated[index].endDate);
      setErrors((prev) => ({ ...prev, [`project-${index}-endDate`]: error }));
    } else if (field === "endDate" && typeof value === "string") {
      const error = validateDateRange(updated[index].startDate, value);
      setErrors((prev) => ({ ...prev, [`project-${index}-endDate`]: error }));
    }
  };

  // Handler for saving individual Project card (PUT/POST call)
  const handleSaveProject = async (project: Project) => {
    const isNew = !project.project_id; 
    const projectChangesList = projectChanges[project.id];
    const index = projects.findIndex(p => p.id === project.id);
    const prefix = `project-${index}`;
    
    // Check local validation errors
    if (errors[`${prefix}-projectTitle`] || errors[`${prefix}-endDate`]) return;

    try {
      let payload: Record<string, any> = {};

      if (isNew) {
        // New record, construct full payload for POST
        const projectPayload = {
            project_title: project.projectTitle || "",
            project_type: project.projectType || "",
            start_date: normalizeMonthToDate(project.startDate),
            end_date: normalizeMonthToDate(project.endDate),
            currently_working: project.currentlyWorking,
            description: project.description || "",
            roles_responsibilities: project.rolesAndResponsibilities || "",
        };

        // Skip saving empty new cards
        if (!project.projectTitle) {
            setProjectFeedback(prev => ({ ...prev, [project.id]: "Project Title is required to save." }));
            setTimeout(() => setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; }), 3000);
            return;
        }

        const response = await saveProjectsDetails(userId, token, [projectPayload]);
        
        // The API POST response is an array of created objects
        const newProjectId = response?.[0]?.project_id;

        if (newProjectId) {
            const updatedProject: Project = { ...project, project_id: newProjectId };
            
            // Update local state and refs
            setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
            initialProjectsRef.current[project.id] = updatedProject;
            
            setProjectFeedback(prev => ({ ...prev, [project.id]: "Saved successfully!" }));
        } else {
            console.warn("POST successful but failed to retrieve new project_id.");
            setProjectFeedback(prev => ({ ...prev, [project.id]: "Saved successfully, but ID retrieval failed (relying on next step sync)." }));
        }

        setProjectChanges(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; });
        

      } else {
        // Existing record (PUT logic)
        if (!projectChangesList || projectChangesList.length === 0) {
            setProjectFeedback(prev => ({ ...prev, [project.id]: "No changes to save." }));
            setTimeout(() => setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; }), 3000);
            return;
        }

        const minimalPayload: Record<string, any> = {};
        
        projectChangesList.forEach(field => {
          switch(field) {
            case 'projectTitle': minimalPayload.project_title = project.projectTitle; break;
            case 'projectType': minimalPayload.project_type = project.projectType; break;
            case 'startDate': minimalPayload.start_date = normalizeMonthToDate(project.startDate); break;
            case 'endDate': minimalPayload.end_date = normalizeMonthToDate(project.endDate); break;
            case 'description': minimalPayload.description = project.description; break;
            case 'rolesAndResponsibilities': minimalPayload.roles_responsibilities = project.rolesAndResponsibilities; break;
            case 'currentlyWorking': minimalPayload.currently_working = project.currentlyWorking; break;
          }
        });
        
        // Handle date logic when currentlyWorking changes
        if (minimalPayload.currently_working === true) {
             minimalPayload.end_date = null;
        } else if (minimalPayload.currently_working === false) {
             minimalPayload.end_date = normalizeMonthToDate(project.endDate);
        }
        
        await updateProjectDetails(userId, token, project.project_id!, minimalPayload);
        
        // Update local state and refs
        initialProjectsRef.current[project.id] = { ...project };
        setProjectChanges(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; });
        setProjectFeedback(prev => ({ ...prev, [project.id]: "Updated successfully!" }));
      }

      // Clear general feedback after 3 seconds
      setTimeout(() => {
        setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; });
      }, 3000);

    } catch (error) {
      console.error("Error saving project:", error);
      const feedback = isNew ? "Failed to save." : "Failed to update.";
      setProjectFeedback(prev => ({ ...prev, [project.id]: feedback }));
      setTimeout(() => setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; }), 3000);
    }
  };

  // Handler for expanding/collapsing individual card
  const toggleExpand = (index: number) => {
    const updated = [...projects];
    updated[index] = {
      ...updated[index],
      isExpanded: !updated[index].isExpanded,
    };
    setProjects(updated);
  };

  // Handler for clearing individual card data (reverting to initial values)
  const resetProject = (index: number) => {
    const project = projects[index];
    const initial = initialProjectsRef.current[project.id];
    const updated = [...projects];
    
    updated[index] = {
      ...project,
      projectTitle: initial?.projectTitle || "",
      projectType: initial?.projectType || "",
      startDate: initial?.startDate || "",
      endDate: initial?.endDate || "",
      currentlyWorking: initial?.currentlyWorking || false,
      description: initial?.description || "",
      rolesAndResponsibilities: initial?.rolesAndResponsibilities || "",
    };
    
    setProjects(updated);

    // Clear changes and errors for this project
    setProjectChanges(prev => { const updatedChanges = { ...prev }; delete updatedChanges[project.id]; return updatedChanges; });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`project-${index}-projectTitle`];
      delete newErrors[`project-${index}-endDate`];
      return newErrors;
    });
    setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; });
  };
  
  // Handler for creating a new empty card
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      projectTitle: "",
      projectType: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      rolesAndResponsibilities: "",
      isExpanded: true,
    };
    setProjects([...projects, newProject]);
  };

  // Handler for removing an experience card and performing DELETE API call if necessary
  const removeProject = async (index: number) => {
    const project = projects[index];
    
    if (projects.length === 1) return; 

    if (project.project_id) {
      try {
        await deleteProject(userId, token, project.project_id);
        deletedProjectIds.current.push(project.project_id);
        setProjectFeedback(prev => ({ ...prev, [project.id]: "Deleted successfully!" }));
        setTimeout(() => setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; }), 3000);
      } catch (error) {
        console.error("Error deleting project:", error);
        setProjectFeedback(prev => ({ ...prev, [project.id]: "Failed to delete." }));
        setTimeout(() => setProjectFeedback(prev => { const updated = { ...prev }; delete updated[project.id]; return updated; }), 3000);
        return; // Stop removal if API call fails
      }
    }
    
    // Remove from state and clear associated data/errors
    const id = project.id;
    setProjects(projects.filter((_, i) => i !== index));
    delete initialProjectsRef.current[id];
    setProjectChanges(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
    
    // Clear errors for removed project
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`project-${index}-`)) {
              delete newErrors[key];
          }
      });
      return newErrors;
    });
  };

  // Check if there are any unsaved changes in any section
  const hasUnsavedChanges = Object.keys(projectChanges).length > 0;
  
  // Final submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasUnsavedChanges) {
        Object.keys(projectChanges).forEach(id => {
            setProjectFeedback(prev => ({ ...prev, [id]: "Please save your changes before proceeding" }));
            setTimeout(() => setProjectFeedback(prev => { const updated = { ...prev }; delete updated[id]; return updated; }), 3000);
        });
        return;
    }
    
    // Filter out completely empty cards before sending to next step
    const validProjects = projects.filter(p => p.projectTitle || p.project_id);
    
    onNext({
      projects: validProjects,
      deletedProjectIds: deletedProjectIds.current,
    });
  };

  // Render function for all project cards
  const renderProjectCard = (project: Project, index: number) => {
    const changed = projectChanges[project.id]?.length > 0;
    const feedback = projectFeedback[project.id];

    return (
      <div
        key={project.id}
        className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            Project {index + 1}
          </h3>
          <div className="flex gap-2 items-center">
             {changed && (
                <button
                    type="button"
                    onClick={() => handleSaveProject(project)}
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
              onClick={() => toggleExpand(index)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 text-gray-600 transition-transform cursor-pointer ${
                  !project.isExpanded ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
              />
            </button>
            <button
              type="button"
              onClick={() => resetProject(index)}
              className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw
                className="w-3 h-3 text-gray-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="w-5 h-5 flex items-center justify-center rounded border-2 border-red-500 hover:bg-red-50 transition-colors"
                title="Delete this project"
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
        {project.isExpanded && (
          <div className="p-4 sm:p-5 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Project Title */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={project.projectTitle}
                  onChange={(e) =>
                    handleProjectChange(index, "projectTitle", e.target.value)
                  }
                  placeholder="Enter Project Title"
                  className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    errors[`project-${index}-projectTitle`]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                  }`}
                />
                {errors[`project-${index}-projectTitle`] && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[`project-${index}-projectTitle`]}
                  </p>
                )}
              </div>

              {/* Project Type, Start Date, End Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Project Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Project Type
                  </label>
                  <div className="relative">
                    <select
                      value={project.projectType}
                      onChange={(e) =>
                        handleProjectChange(index, "projectType", e.target.value)
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Project Type</option>
                      <option value="Personal">Personal</option>
                      <option value="Academic">Academic</option>
                      <option value="Professional">Professional</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Freelance">Freelance</option>
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
                      value={project.startDate}
                      onChange={(e) =>
                        handleProjectChange(index, "startDate", e.target.value)
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
                      value={project.endDate}
                      onChange={(e) =>
                        handleProjectChange(index, "endDate", e.target.value)
                      }
                      placeholder="Select End Date"
                      disabled={project.currentlyWorking}
                      className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm pr-8 disabled:bg-gray-100 ${
                        errors[`project-${index}-endDate`]
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                      }`}
                    />
                  </div>
                  {errors[`project-${index}-endDate`] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[`project-${index}-endDate`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Currently Working Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.currentlyWorking}
                    onChange={(e) =>
                      handleProjectChange(
                        index,
                        "currentlyWorking",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">
                    Currently Working
                  </span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) =>
                    handleProjectChange(index, "description", e.target.value)
                  }
                  placeholder="Provide Description of your project.."
                  rows={4}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Roles & Responsibilities */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Roles & Responsibilities
                </label>
                <textarea
                  value={project.rolesAndResponsibilities}
                  onChange={(e) =>
                    handleProjectChange(
                      index,
                      "rolesAndResponsibilities",
                      e.target.value
                    )
                  }
                  placeholder="Provide your roles & responsibilities in the project.."
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
            Step 4: Projects
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Showcase academic or personal projects that demonstrate your skills
            and problem-solving ability.
          </p>
        </div>

        {/* Project Cards */}
        {projects.map((project, index) => renderProjectCard(project, index))}

        {/* Add Project Button */}
        <button
          type="button"
          onClick={addProject}
          className="flex items-center gap-2 px-4 py-2.5 text-orange-400 hover:text-orange-500 font-medium text-sm transition-colors mb-4 md:mb-5 cursor-pointer"
        >
          <Plus className="w-4 h-4 cursor-pointer" />
          Add Project
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