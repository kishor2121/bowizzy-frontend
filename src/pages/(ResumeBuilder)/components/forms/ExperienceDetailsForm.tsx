import React from 'react';
import type { ExperienceDetails, WorkExperience } from 'src/types/resume';
import { FormInput, FormSelect, FormTextarea, FormSection, AddButton, ToggleSwitch } from '@/pages/(ResumeBuilder)/components/ui';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Calendar } from 'lucide-react';

interface ExperienceDetailsFormProps {
  data: ExperienceDetails;
  onChange: (data: ExperienceDetails) => void;
}

const employmentTypes = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Freelance', label: 'Freelance' },
];

const workModes = [
  { value: 'On-site', label: 'On-site' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
];

const locations = [
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'New York', label: 'New York' },
  { value: 'San Francisco', label: 'San Francisco' },
];

export const ExperienceDetailsForm: React.FC<ExperienceDetailsFormProps> = ({ data, onChange }) => {
  // Collapse state for each work experience
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

  const updateWorkExperience = (id: string, field: string, value: string | boolean) => {
    const updatedExperiences = data.workExperiences.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    
    onChange({
      ...data,
      workExperiences: updatedExperiences,
    });

    // Find the updated experience for validation
    const updatedExp = updatedExperiences.find(exp => exp.id === id);
    
    // Validate fields
    if (field === "companyName" && typeof value === "string") {
      const error = validateCompanyName(value);
      setErrors((prev) => ({ ...prev, [`exp-${id}-companyName`]: error }));
    } else if (field === "jobTitle" && typeof value === "string") {
      const error = validateJobTitle(value);
      setErrors((prev) => ({ ...prev, [`exp-${id}-jobTitle`]: error }));
    } else if (field === "startDate" && typeof value === "string" && updatedExp) {
      const error = validateDateRange(value, updatedExp.endDate);
      setErrors((prev) => ({ ...prev, [`exp-${id}-endDate`]: error }));
    } else if (field === "endDate" && typeof value === "string" && updatedExp) {
      const error = validateDateRange(updatedExp.startDate, value);
      setErrors((prev) => ({ ...prev, [`exp-${id}-endDate`]: error }));
    }
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      companyName: '',
      jobTitle: '',
      employmentType: '',
      location: '',
      workMode: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      enabled: true,
    };
    onChange({
      ...data,
      workExperiences: [...data.workExperiences, newExp],
    });
  };

  const removeWorkExperience = (id: string) => {
    if (data.workExperiences.length > 1) {
      onChange({
        ...data,
        workExperiences: data.workExperiences.filter((exp) => exp.id !== id),
      });
      // Clean up collapsed state
      setCollapsedStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      // Clean up errors for removed experience
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`exp-${id}-companyName`];
        delete newErrors[`exp-${id}-jobTitle`];
        delete newErrors[`exp-${id}-endDate`];
        return newErrors;
      });
    }
  };

  const toggleWorkExperience = (id: string, enabled: boolean) => {
  const updatedExperiences = data.workExperiences.map((exp) =>
    exp.id === id ? { ...exp, enabled } : exp
  );

  onChange({
    ...data,
    workExperiences: updatedExperiences,
  });
};


  return (
    <div className="flex flex-col gap-5">
      {data.workExperiences.map((exp, index) => (
        <FormSection
          key={exp.id}
          title={`Work Experience ${data.workExperiences.length > 1 ? index + 1 : ''}`}
          showToggle={true}
          enabled={exp.enabled}
          onToggle={(enabled) => updateWorkExperience(exp.id, 'enabled', enabled)}
          onRemove={data.workExperiences.length > 1 ? () => removeWorkExperience(exp.id) : undefined}
          showActions={true}
          isCollapsed={collapsedStates[exp.id] || false}
          onCollapseToggle={() => toggleCollapse(exp.id)}
        >
          <FormInput
            label="Company Name"
            placeholder="Enter Company Name"
            value={exp.companyName}
            onChange={(v) => updateWorkExperience(exp.id, 'companyName', v)}
            error={errors[`exp-${exp.id}-companyName`]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput
              label="Job Title / Role"
              placeholder="Enter Job Title"
              value={exp.jobTitle}
              onChange={(v) => updateWorkExperience(exp.id, 'jobTitle', v)}
              error={errors[`exp-${exp.id}-jobTitle`]}
            />
            <FormSelect
              label="Employment Type"
              placeholder="Select Employment Type"
              value={exp.employmentType}
              onChange={(v) => updateWorkExperience(exp.id, 'employmentType', v)}
              options={employmentTypes}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              label="Location"
              placeholder="Select Location"
              value={exp.location}
              onChange={(v) => updateWorkExperience(exp.id, 'location', v)}
              options={locations}
            />
            <FormSelect
              label="Work Mode"
              placeholder="Select Work Mode"
              value={exp.workMode}
              onChange={(v) => updateWorkExperience(exp.id, 'workMode', v)}
              options={workModes}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="relative">
              <FormInput
                label="Start Date"
                placeholder="Select Start Date"
                value={exp.startDate}
                onChange={(v) => updateWorkExperience(exp.id, 'startDate', v)}
                type="month"
              />
            </div>
            <div className="relative">
              <FormInput
                label="End Date"
                placeholder="Select End Date"
                value={exp.endDate}
                onChange={(v) => updateWorkExperience(exp.id, 'endDate', v)}
                type="month"
                disabled={exp.currentlyWorking}
                error={errors[`exp-${exp.id}-endDate`]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id={`currentlyWorking-${exp.id}`}
              checked={exp.currentlyWorking}
              onChange={(e) => updateWorkExperience(exp.id, 'currentlyWorking', e.target.checked)}
              className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
            />
            <label htmlFor={`currentlyWorking-${exp.id}`} className="text-sm text-gray-600">
              Currently Working here
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <RichTextEditor
              value={exp.description}
              onChange={(v) => updateWorkExperience(exp.id, 'description', v)}
              placeholder="Provide Description / Projects of your Work"
              rows={4}
            />
          </div>
        </FormSection>
      ))}

      <div className="bg-white border border-gray-200 rounded-xl">
        <AddButton onClick={addWorkExperience} label="Add Experience" />
      </div>
    </div>
  );
};

export default ExperienceDetailsForm;