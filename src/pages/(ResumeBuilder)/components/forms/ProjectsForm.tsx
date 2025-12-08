import React, { useState, useEffect, useRef } from "react";
import type { Project } from "src/types/resume";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSection,
  AddButton,
} from "@/pages/(ResumeBuilder)/components/ui";
import RichTextEditor from "@/pages/(ResumeBuilder)/components/ui/RichTextEditor";
import { Save, RotateCcw } from "lucide-react";
import {
  saveProjectsDetails,
  updateProjectDetails,
  deleteProject,
} from "@/services/projectService";

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
  userId: string;
  token: string;
}

const projectTypes = [
  { value: "Personal", label: "Personal" },
  { value: "Academic", label: "Academic" },
  { value: "Professional", label: "Professional" },
  { value: "Open Source", label: "Open Source" },
  { value: "Freelance", label: "Freelance" },
  { value: "Research", label: "Research" },
];

export const ProjectsForm: React.FC<ProjectsFormProps> = ({
  data,
  onChange,
  userId,
  token,
}) => {
  // Collapse state for each project
  const [collapsedStates, setCollapsedStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // State for tracking feedback
  const [projectFeedback, setProjectFeedback] = useState<
    Record<string, string>
  >({});

  // Refs for tracking initial data
  const initialProjectsRef = useRef<Record<string, Project>>({});

  // Initialize refs on mount and when data changes from parent
  useEffect(() => {
    data.forEach((p) => {
      if (!initialProjectsRef.current[p.id]) {
        initialProjectsRef.current[p.id] = { ...p };
      }
    });
  }, [data]);

  // Check if a specific project has changes
  const getProjectChangedStatus = (current: Project): boolean => {
    const initial = initialProjectsRef.current[current.id];

    if (!initial) {
      return !!(current.projectTitle || current.projectType);
    }

    return (
      current.projectTitle !== (initial.projectTitle || "") ||
      current.projectType !== (initial.projectType || "") ||
      current.startDate !== (initial.startDate || "") ||
      current.endDate !== (initial.endDate || "") ||
      current.currentlyWorking !== (initial.currentlyWorking || false) ||
      current.description !== (initial.description || "") ||
      current.rolesResponsibilities !== (initial.rolesResponsibilities || "")
    );
  };

  const toggleCollapse = (id: string) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Validation functions
  const validateProjectTitle = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.,-]+$/.test(value)) {
      return "Invalid characters in project title";
    }
    if (value && !/[a-zA-Z]/.test(value)) {
      return "Project title must include at least one letter";
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
    if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val))
      return `${val}-01`;
    return val;
  };

  const updateProject = (
    id: string,
    field: string,
    value: string | boolean
  ) => {
    const updatedProjects = data.map((proj) =>
      proj.id === id ? { ...proj, [field]: value } : proj
    );

    onChange(updatedProjects);

    // Find the updated project for validation
    const updatedProj = updatedProjects.find((proj) => proj.id === id);

    // Validate fields
    if (field === "projectTitle" && typeof value === "string") {
      const error = validateProjectTitle(value);
      setErrors((prev) => ({ ...prev, [`project-${id}-projectTitle`]: error }));
    } else if (
      field === "startDate" &&
      typeof value === "string" &&
      updatedProj
    ) {
      const error = validateDateRange(value, updatedProj.endDate);
      setErrors((prev) => ({ ...prev, [`project-${id}-endDate`]: error }));
    } else if (
      field === "endDate" &&
      typeof value === "string" &&
      updatedProj
    ) {
      const error = validateDateRange(updatedProj.startDate, value);
      setErrors((prev) => ({ ...prev, [`project-${id}-endDate`]: error }));
    }

    // Clear end date error if currently working is checked
    if (field === "currentlyWorking" && value === true) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`project-${id}-endDate`];
        return newErrors;
      });
    }
    // If projectType is changed, ensure it's not purely numeric
    if (field === "projectType" && typeof value === "string") {
      if (value && !/[a-zA-Z]/.test(value)) {
        setErrors((prev) => ({ ...prev, [`project-${id}-projectType`]: "Project type must include at least one letter" }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[`project-${id}-projectType`];
          return updated;
        });
      }
    }
  };

  // Handler for saving individual Project card (PUT/POST call)
  const handleSaveProject = async (project: Project) => {
    const isNew = !project.project_id;

    // Check local validation errors
    if (
      errors[`project-${project.id}-projectTitle`] ||
      errors[`project-${project.id}-endDate`]
    )
      return;

    // Check if there are actually changes to save
    if (!getProjectChangedStatus(project) && !isNew) {
      setProjectFeedback((prev) => ({
        ...prev,
        [project.id]: "No changes to save.",
      }));
      setTimeout(
        () =>
          setProjectFeedback((prev) => {
            const updated = { ...prev };
            delete updated[project.id];
            return updated;
          }),
        3000
      );
      return;
    }

    try {
      if (isNew) {
        // New record, construct full payload for POST
        const projectPayload = {
          project_title: project.projectTitle || "",
          project_type: project.projectType || "",
          start_date: normalizeMonthToDate(project.startDate),
          end_date: normalizeMonthToDate(project.endDate),
          currently_working: project.currentlyWorking,
          description: project.description || "",
          roles_responsibilities: project.rolesResponsibilities || "",
        };

        // Skip saving empty new cards
        if (!project.projectTitle) {
          setProjectFeedback((prev) => ({
            ...prev,
            [project.id]: "Project Title is required to save.",
          }));
          setTimeout(
            () =>
              setProjectFeedback((prev) => {
                const updated = { ...prev };
                delete updated[project.id];
                return updated;
              }),
            3000
          );
          return;
        }

        const response = await saveProjectsDetails(userId, token, [
          projectPayload,
        ]);

        // The API POST response is an array of created objects
        const newProjectId = response?.[0]?.project_id;

        if (newProjectId) {
          const updatedProject: Project = {
            ...project,
            project_id: newProjectId,
          };

          // Update local state and refs
          const updatedProjects = data.map((p) =>
            p.id === project.id ? updatedProject : p
          );
          onChange(updatedProjects);
          initialProjectsRef.current[project.id] = updatedProject;

          setProjectFeedback((prev) => ({
            ...prev,
            [project.id]: "Saved successfully!",
          }));
        } else {
          console.warn(
            "POST successful but failed to retrieve new project_id."
          );
          setProjectFeedback((prev) => ({
            ...prev,
            [project.id]:
              "Saved successfully, but ID retrieval failed (relying on next step sync).",
          }));
        }
      } else {
        // Existing record (PUT logic)
        const initial = initialProjectsRef.current[project.id];
        const minimalPayload: Record<string, any> = {};

        // Build minimal payload with only changed fields
        if (project.projectTitle !== (initial?.projectTitle || "")) {
          minimalPayload.project_title = project.projectTitle;
        }
        if (project.projectType !== (initial?.projectType || "")) {
          minimalPayload.project_type = project.projectType;
        }
        if (project.startDate !== (initial?.startDate || "")) {
          minimalPayload.start_date = normalizeMonthToDate(project.startDate);
        }
        if (project.endDate !== (initial?.endDate || "")) {
          minimalPayload.end_date = normalizeMonthToDate(project.endDate);
        }
        if (project.description !== (initial?.description || "")) {
          minimalPayload.description = project.description;
        }
        if (
          project.rolesResponsibilities !==
          (initial?.rolesResponsibilities || "")
        ) {
          minimalPayload.roles_responsibilities = project.rolesResponsibilities;
        }
        if (project.currentlyWorking !== (initial?.currentlyWorking || false)) {
          minimalPayload.currently_working = project.currentlyWorking;
        }

        // Handle date logic when currentlyWorking changes
        if (minimalPayload.currently_working === true) {
          minimalPayload.end_date = null;
        } else if (minimalPayload.currently_working === false) {
          minimalPayload.end_date = normalizeMonthToDate(project.endDate);
        }

        if (Object.keys(minimalPayload).length > 0) {
          await updateProjectDetails(
            userId,
            token,
            project.project_id!,
            minimalPayload
          );

          // Update local state and refs
          initialProjectsRef.current[project.id] = { ...project };
          setProjectFeedback((prev) => ({
            ...prev,
            [project.id]: "Updated successfully!",
          }));
        }
      }

      // Clear general feedback after 3 seconds
      setTimeout(() => {
        setProjectFeedback((prev) => {
          const updated = { ...prev };
          delete updated[project.id];
          return updated;
        });
      }, 3000);
    } catch (error) {
      console.error("Error saving project:", error);
      const feedback = isNew ? "Failed to save." : "Failed to update.";
      setProjectFeedback((prev) => ({ ...prev, [project.id]: feedback }));
      setTimeout(
        () =>
          setProjectFeedback((prev) => {
            const updated = { ...prev };
            delete updated[project.id];
            return updated;
          }),
        3000
      );
    }
  };

  // Handler for clearing individual card data (reverting to initial values)
  const resetProject = (id: string) => {
    const initial = initialProjectsRef.current[id];
    if (!initial) return;

    const updatedProjects = data.map((proj) =>
      proj.id === id
        ? {
            ...proj,
            projectTitle: initial.projectTitle || "",
            projectType: initial.projectType || "",
            startDate: initial.startDate || "",
            endDate: initial.endDate || "",
            currentlyWorking: initial.currentlyWorking || false,
            description: initial.description || "",
            rolesResponsibilities: initial.rolesResponsibilities || "",
          }
        : proj
    );

    onChange(updatedProjects);

    // Clear errors for this project
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`project-${id}-projectTitle`];
      delete newErrors[`project-${id}-endDate`];
      return newErrors;
    });
    setProjectFeedback((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      projectTitle: "",
      projectType: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      rolesResponsibilities: "",
      enabled: true,
    };
    onChange([...data, newProject]);
  };

  const removeProject = async (id: string) => {
    if (data.length <= 1) return;

    const project = data.find((p) => p.id === id);
    if (!project) return;

    if (project.project_id) {
      try {
        await deleteProject(userId, token, project.project_id);
        setProjectFeedback((prev) => ({
          ...prev,
          [project.id]: "Deleted successfully!",
        }));
        setTimeout(
          () =>
            setProjectFeedback((prev) => {
              const updated = { ...prev };
              delete updated[project.id];
              return updated;
            }),
          3000
        );
      } catch (error) {
        console.error("Error deleting project:", error);
        setProjectFeedback((prev) => ({
          ...prev,
          [project.id]: "Failed to delete.",
        }));
        setTimeout(
          () =>
            setProjectFeedback((prev) => {
              const updated = { ...prev };
              delete updated[project.id];
              return updated;
            }),
          3000
        );
        return; // Stop removal if API call fails
      }
    }

    // Remove from state and clear associated data/errors
    onChange(data.filter((proj) => proj.id !== id));
    delete initialProjectsRef.current[id];

    // Clean up collapsed state
    setCollapsedStates((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });

    // Clean up errors for removed project
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`project-${id}-projectTitle`];
      delete newErrors[`project-${id}-endDate`];
      return newErrors;
    });
  };

  const toggleProject = (id: string, enabled: boolean) => {
    onChange(
      data.map((proj) => (proj.id === id ? { ...proj, enabled } : proj))
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {data.map((project, index) => {
        const changed = getProjectChangedStatus(project);
        const feedback = projectFeedback[project.id];

        return (
          <FormSection
            key={project.id}
            title={`Project ${data.length > 1 ? index + 1 : ""}`}
            showToggle={true}
            enabled={project.enabled}
            onToggle={(enabled) => toggleProject(project.id, enabled)}
            onRemove={
              data.length > 1 ? () => removeProject(project.id) : undefined
            }
            showActions={true}
            isCollapsed={collapsedStates[project.id] || false}
            onCollapseToggle={() => toggleCollapse(project.id)}
          >
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
              {changed && (
                <button
                  type="button"
                  onClick={() => handleSaveProject(project)}
                  className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                  title={
                    project.project_id ? "Update changes" : "Save new project"
                  }
                >
                  <Save
                    className="w-3 h-3 text-green-600 cursor-pointer"
                    strokeWidth={2.5}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={() => resetProject(project.id)}
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
                title="Reset to saved values"
              >
                <RotateCcw
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            <FormInput
              label="Project Title"
              placeholder="Enter Project Title"
              value={project.projectTitle}
              onChange={(v) => updateProject(project.id, "projectTitle", v)}
              error={errors[`project-${project.id}-projectTitle`]}
            />

            <div className="mt-4">
              <FormSelect
                label="Project Type"
                placeholder="Select Project Type"
                value={project.projectType}
                onChange={(v) => updateProject(project.id, "projectType", v)}
                options={projectTypes}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Start Date"
                placeholder="Select Start Date"
                value={project.startDate}
                onChange={(v) => updateProject(project.id, "startDate", v)}
                type="month"
              />
              <FormInput
                label="End Date"
                placeholder="Select End Date"
                value={project.endDate}
                onChange={(v) => updateProject(project.id, "endDate", v)}
                type="month"
                disabled={project.currentlyWorking}
                error={errors[`project-${project.id}-endDate`]}
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id={`currentlyWorking-${project.id}`}
                checked={project.currentlyWorking}
                onChange={(e) =>
                  updateProject(
                    project.id,
                    "currentlyWorking",
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
              />
              <label
                htmlFor={`currentlyWorking-${project.id}`}
                className="text-sm text-gray-600"
              >
                Currently Working
              </label>
            </div>

            <div className="mt-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium">Description</label>
                <RichTextEditor
                  value={project.description}
                  onChange={(v) => updateProject(project.id, "description", v)}
                  placeholder="Provide Description of your project.."
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium">Roles & Responsibilities</label>
                <RichTextEditor
                  value={project.rolesResponsibilities}
                  onChange={(v) =>
                    updateProject(project.id, "rolesResponsibilities", v)
                  }
                  placeholder="Provide your roles & responsibilities..."
                  rows={4}
                />
              </div>
            </div>
          </FormSection>
        );
      })}

      <div className="bg-white border border-gray-200 rounded-xl">
        <AddButton onClick={addProject} label="Add Project" />
      </div>
    </div>
  );
};

export default ProjectsForm;
