import React, { useState } from "react";
import type { PersonalDetails } from "src/types/resume";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  TagInput,
  FormSection,
} from "@/pages/(ResumeBuilder)/components/ui";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Lock } from "lucide-react";

interface PersonalDetailsFormProps {
  data: PersonalDetails;
  onChange: (data: PersonalDetails) => void;
}

const countries = [
  { value: "India", label: "India" },
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
];

const indianStates = [
  { value: "Karnataka", label: "Karnataka" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Delhi", label: "Delhi" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "West Bengal", label: "West Bengal" },
];

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  data,
  onChange,
}) => {
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [personalInfoCollapsed, setPersonalInfoCollapsed] =
    React.useState(false);
  const [locationDetailsCollapsed, setLocationDetailsCollapsed] =
    React.useState(false);
  const [careerObjectiveCollapsed, setCareerObjectiveCollapsed] =
    React.useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation function
  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;

      case "middleName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format";
        }
        break;

      case "mobileNumber":
        if (value && !/^\d{0,10}$/.test(value)) {
          error = "Only 10 digits allowed";
        } else if (value && value.length > 0 && value.length < 10) {
          error = "Must be 10 digits";
        }
        break;
    }

    return error;
  };

  const updateField = <K extends keyof PersonalDetails>(
    field: K,
    value: PersonalDetails[K]
  ) => {
    // Special handling for mobile number - prevent input if over 10 digits
    if (
      field === "mobileNumber" &&
      typeof value === "string" &&
      value.length > 10
    ) {
      return;
    }

    onChange({ ...data, [field]: value });

    // Validate on change for string fields
    if (typeof value === "string") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Photo Upload Notice */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
          <Lock size={20} className="text-gray-500" />
        </div>
        <span className="text-sm text-gray-600">
          This Template does not support photo upload
        </span>
      </div>

      {/* Personal Info Section */}
      <FormSection
        title="Personal Info"
        required
        showToggle={false}
        showActions={true}
        isCollapsed={personalInfoCollapsed}
        onCollapseToggle={() =>
          setPersonalInfoCollapsed(!personalInfoCollapsed)
        }
      >
        {!personalInfoCollapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="First Name"
                placeholder="Aarav"
                value={data.firstName}
                onChange={(v) => updateField("firstName", v)}
                error={errors.firstName}
              />
              <FormInput
                label="Middle Name"
                placeholder="Enter Middle Name"
                value={data.middleName}
                onChange={(v) => updateField("middleName", v)}
                error={errors.middleName}
              />
              <FormInput
                label="Last Name"
                placeholder="Mehta"
                value={data.lastName}
                onChange={(v) => updateField("lastName", v)}
                error={errors.lastName}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Email"
                placeholder="aarav.m@gmail.com"
                value={data.email}
                onChange={(v) => updateField("email", v)}
                type="email"
                error={errors.email}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <FormSelect
                    label=""
                    value="+91"
                    onChange={() => {}}
                    options={[{ value: "+91", label: "+91" }]}
                    className="w-20"
                  />
                  <FormInput
                    label=""
                    placeholder="88888 88888"
                    value={data.mobileNumber}
                    onChange={(v) => updateField("mobileNumber", v)}
                    className="flex-1"
                    error={errors.mobileNumber}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <TagInput
                label="Language(s) Known"
                placeholder="Add Languages known to you..."
                tags={data.languagesKnown}
                onChange={(v) => updateField("languagesKnown", v)}
              />
            </div>
          </>
        )}
      </FormSection>

      {/* Location Details Section */}
      <FormSection
        title="Location Details"
        enabled={locationEnabled}
        onToggle={setLocationEnabled}
        showActions={true}
        isCollapsed={locationDetailsCollapsed}
        onCollapseToggle={() =>
          setLocationDetailsCollapsed(!locationDetailsCollapsed)
        }
      >
        {!locationDetailsCollapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Country"
                placeholder="Select Country"
                value={data.country}
                onChange={(v) => updateField("country", v)}
                options={countries}
              />
              <FormSelect
                label="State"
                placeholder="Select State"
                value={data.state}
                onChange={(v) => updateField("state", v)}
                options={indianStates}
              />
            </div>

            <div className="mt-4">
              <FormSelect
                label="City"
                placeholder="Select City"
                value={data.city}
                onChange={(v) => updateField("city", v)}
                options={[
                  { value: "Bengaluru", label: "Bengaluru" },
                  { value: "Mumbai", label: "Mumbai" },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Chennai", label: "Chennai" },
                  { value: "Hyderabad", label: "Hyderabad" },
                ]}
              />
            </div>
          </>
        )}
      </FormSection>

      {/* About / Career Objective Section */}
      <FormSection
        title="About / Career Objective"
        required
        showToggle={false}
        showActions={true}
        isCollapsed={careerObjectiveCollapsed}
        onCollapseToggle={() =>
          setCareerObjectiveCollapsed(!careerObjectiveCollapsed)
        }
      >
        {!careerObjectiveCollapsed && (
          <RichTextEditor
            value={data.aboutCareerObjective}
            onChange={(v) => updateField("aboutCareerObjective", v)}
            placeholder="Provide Career Objective"
            rows={5}
          />
        )}
      </FormSection>
    </div>
  );
};

export default PersonalDetailsForm;
