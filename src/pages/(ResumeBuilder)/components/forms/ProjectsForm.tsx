import React from 'react';
import type { Project } from 'src/types/resume';
import { FormInput, FormSelect, FormTextarea, FormSection, AddButton } from '@/pages/(ResumeBuilder)/components/ui';
import RichTextEditor from "@/components/ui/RichTextEditor";

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const projectTypes = [
  { value: 'Personal', label: 'Personal' },
  { value: 'Academic', label: 'Academic' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Open Source', label: 'Open Source' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Research', label: 'Research' },
];

export const ProjectsForm: React.FC<ProjectsFormProps> = ({ data, onChange }) => {
  // Collapse state for each project
  const [collapsedStates, setCollapsedStates] = React.useState<{ [key: string]: boolean }>({});
  
  // Validation errors state
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const toggleCollapse = (id: string) => {
    setCollapsedStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const updateProject = (id: string, field: string, value: string | boolean) => {
    const updatedProjects = data.map((proj) => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    
    onChange(updatedProjects);

    // Find the updated project for validation
    const updatedProj = updatedProjects.find(proj => proj.id === id);

    // Validate fields
    if (field === "projectTitle" && typeof value === "string") {
      const error = validateProjectTitle(value);
      setErrors((prev) => ({ ...prev, [`project-${id}-projectTitle`]: error }));
    } else if (field === "startDate" && typeof value === "string" && updatedProj) {
      const error = validateDateRange(value, updatedProj.endDate);
      setErrors((prev) => ({ ...prev, [`project-${id}-endDate`]: error }));
    } else if (field === "endDate" && typeof value === "string" && updatedProj) {
      const error = validateDateRange(updatedProj.startDate, value);
      setErrors((prev) => ({ ...prev, [`project-${id}-endDate`]: error }));
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      projectTitle: '',
      projectType: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      rolesResponsibilities: '',
      enabled: true,
    };
    onChange([...data, newProject]);
  };

  const removeProject = (id: string) => {
    if (data.length > 1) {
      onChange(data.filter((proj) => proj.id !== id));
      // Clean up collapsed state
      setCollapsedStates(prev => {
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
    }
  };

  const toggleProject = (id: string, enabled: boolean) => {
    onChange(
      data.map((proj) => (proj.id === id ? { ...proj, enabled } : proj))
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {data.map((project, index) => (
        <FormSection
          key={project.id}
          title={`Project ${data.length > 1 ? index + 1 : ''}`}
          showToggle={true}
          enabled={project.enabled}
          onToggle={(enabled) => toggleProject(project.id, enabled)}
          onRemove={data.length > 1 ? () => removeProject(project.id) : undefined}
          showActions={true}
          isCollapsed={collapsedStates[project.id] || false}
          onCollapseToggle={() => toggleCollapse(project.id)}
        >
          <FormInput
            label="Project Title"
            placeholder="Enter Project Title"
            value={project.projectTitle}
            onChange={(v) => updateProject(project.id, 'projectTitle', v)}
            error={errors[`project-${project.id}-projectTitle`]}
          />

          <div className="mt-4">
            <FormSelect
              label="Project Type"
              placeholder="Select Project Type"
              value={project.projectType}
              onChange={(v) => updateProject(project.id, 'projectType', v)}
              options={projectTypes}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput
              label="Start Date"
              placeholder="Select Start Date"
              value={project.startDate}
              onChange={(v) => updateProject(project.id, 'startDate', v)}
              type="month"
            />
            <FormInput
              label="End Date"
              placeholder="Select End Date"
              value={project.endDate}
              onChange={(v) => updateProject(project.id, 'endDate', v)}
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
              onChange={(e) => updateProject(project.id, 'currentlyWorking', e.target.checked)}
              className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
            />
            <label htmlFor={`currentlyWorking-${project.id}`} className="text-sm text-gray-600">
              Currently Working
            </label>
          </div>

          <div className="mt-4">
            <RichTextEditor
              label="Description"
              value={project.description}
              onChange={(v) => updateProject(project.id, "description", v)}
              placeholder="Provide Description of your project.."
              rows={4}
              showAiButton={true}
            />
          </div>

          <div className="mt-4">
            <RichTextEditor
              label="Roles & Responsibilities"
              value={project.rolesResponsibilities}
              onChange={(v) => updateProject(project.id, "rolesResponsibilities", v)}
              placeholder="Provide your roles & responsibilities..."
              rows={4}
              showAiButton={true}
            />
          </div>
        </FormSection>
      ))}

      <div className="bg-white border border-gray-200 rounded-xl">
        <AddButton onClick={addProject} label="Add Project" />
      </div>
    </div>
  );
};

export default ProjectsForm;