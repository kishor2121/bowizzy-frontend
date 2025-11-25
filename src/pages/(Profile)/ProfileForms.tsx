import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashNav from "@/components/dashnav/dashnav";
import ProfileStepper from "./components/ProfileStepper";
import PersonalDetailsForm from "./components/PersonalDetailsForm";
import EducationDetailsForm from "./components/EducationDetailsForm";
import ExperienceDetailsForm from "./components/ExperienceDetailsForm";
import ProjectDetailsForm from "./components/ProjectDetailsForm";
import SkillsLinksDetailsForm from "./components/SkillsLinksDetailsForm";
import CertificationDetailsForm from "./components/CertificationDetailsForm";
import { savePersonalDetails } from "@/services/personalService";
import { saveEducationFromForm } from "@/services/educationService";
import { saveExperienceFromForm } from "@/services/experienceService";
import { saveProjectsFromForm } from "@/services/projectService";
import { saveSkillsFromForm } from "@/services/skillsService";
import { saveLinksFromForm } from "@/services/linksService";
import { saveCertificate } from "@/services/certificateService";

export default function ProfileForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: {},
    education: {},
    experience: {},
    projects: {},
    skills: {},
    certification: {},
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const parsedData = JSON.parse(localStorage.getItem("user"));


  const steps = [
    "Personal",
    "Education",
    "Experience",
    "Projects",
    "Skills & Links",
    "Certification",
  ];

  const submitAllProfileData = async (data: any) => {
    try {
      const userId = parsedData?.user_id;
      const token = parsedData?.token;
      await savePersonalDetails(userId, token, data.personal || {});
      await saveEducationFromForm(userId, token, data.education);
      await saveExperienceFromForm(userId, token, data.experience);
      await saveProjectsFromForm(userId, token, data.projects);
      await saveSkillsFromForm(userId, token, data.skills);
      await saveLinksFromForm(userId, token, data.skills);
      if (data.certification?.certificates) {
        for (const cert of data.certification.certificates) {
          await saveCertificate(userId, token, cert);
        }
      }
      alert("Profile saved successfully!");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Try again.");
    }
  };

  // Validation function to check if step has any validation errors
  const validateStepData = (stepIndex: number, data: any): boolean => {
    const stepKeys = [
      "personal",
      "education",
      "experience",
      "projects",
      "skills",
      "certification",
    ];
    
    // Basic validation - check if data exists
    if (!data || Object.keys(data).length === 0) {
      return false;
    }

    // Step-specific validation
    switch (stepIndex) {
      case 0: // Personal Details
        if (!data.firstName || !data.lastName) {
          return false;
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          return false;
        }
        if (data.phoneNumber && !/^[0-9]{10,15}$/.test(data.phoneNumber.replace(/[\s-]/g, ''))) {
          return false;
        }
        break;

      case 1: 
        if (data.educationDetails && Array.isArray(data.educationDetails)) {
          const hasValidEducation = data.educationDetails.some(
            (edu: any) => edu.institutionName && edu.degree
          );
          if (!hasValidEducation) {
            return false;
          }
        }
        break;

      case 2:
        if (!data.jobRole) {
          return false;
        }
        break;

      case 3:
        break;

      case 4:
        if (data.skills && Array.isArray(data.skills)) {
          const hasValidSkill = data.skills.some((skill: any) => skill.skillName);
          if (!hasValidSkill) {
            return false;
          }
        }
        break;

      case 5:
        break;
    }

    return true;
  };

  // ⭐⭐⭐ FIXED handleNext — ONLY THIS PART UPDATED ⭐⭐⭐
  const handleNext = async (data: any) => {
    const stepKeys = [
      "personal",
      "education",
      "experience",
      "projects",
      "skills",
      "certification",
    ];

    // Merge current step data
    const updatedFormData = {
      ...formData,
      [stepKeys[currentStep]]: data,
    };

    setFormData(updatedFormData);

    // Validate current step
    const isValid = validateStepData(currentStep, data);
    setValidationErrors((prev) => ({
      ...prev,
      [stepKeys[currentStep]]: !isValid,
    }));

    if (!isValid) return;

    // Not last step → move to next
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Last step → validate all steps
    let hasErrors = false;
    const allErrors: { [key: string]: boolean } = {};

    stepKeys.forEach((key, index) => {
      const stepData = index === currentStep ? data : formData[key];
      const isStepValid = validateStepData(index, stepData);
      if (!isStepValid) {
        hasErrors = true;
        allErrors[key] = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(allErrors);
      console.log("Validation errors found. Please complete all required fields.");
      return;
    }

    await submitAllProfileData(updatedFormData);
  };
 

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.personal}
          />
        );
      case 1:
        return (
          <EducationDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.education}
          />
        );
      case 2:
        return (
          <ExperienceDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.experience}
          />
        );
      case 3:
        return (
          <ProjectDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.projects}
          />
        );
      case 4:
        return (
          <SkillsLinksDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.skills}
          />
        );
      case 5:
        return (
          <CertificationDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.certification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-['Baloo_2']">
      <DashNav heading="Profile" />

      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="bg-white rounded-lg м-3 md:m-5 h-[calc(100vh-110px)] overflow-auto flex flex-col">
          {/* Header Section */}
          <div className="border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 md:py-5">
            <p className="text-sm sm:text-base text-gray-700 mb-3 md:mb-4">
              Providing your details in profile helps us personalize every step
              - from building the right resume to preparing you for interviews
              that matter.
            </p>

            {/* Stepper */}
            <ProfileStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto">{renderStepContent()}</div>
        </div>
      </div>
    </div>
  );
}
