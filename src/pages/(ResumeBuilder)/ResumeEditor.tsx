import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProfileStepper from "./components/ProfileStepper";
import PersonalDetailsForm from "./components/forms/PersonalDetailsForm";
import EducationDetailsForm from "./components/forms/EducationDetailsForm";
import ExperienceDetailsForm from "./components/forms/ExperienceDetailsForm";
import ProjectsForm from "./components/forms/ProjectsForm";
import SkillsLinksForm from "./components/forms/SkillsLinksForm";
import CertificationsForm from "./components/forms/CertificationsForm";
import { initialResumeData } from "../../types/resume";
import type { ResumeData } from "../../types/resume";
import DashNav from "@/components/dashnav/dashnav";
import { getTemplateById } from "@/templates/templateRegistry";
import ResumePreviewModal from "./components/ui/ResumePreviewModal";

const steps = [
  "Personal",
  "Education",
  "Experience",
  "Projects",
  "Skills & Links",
  "Certification",
];

const stepTitles = [
  "Step 1: Personal Details",
  "Step 2: Education Details",
  "Step 3: Experience",
  "Step 4: Projects",
  "Step 5: Skill(s) & Link(s)",
  "Step 6: Certification",
];

const nextButtonLabels = [
  "Proceed to Education",
  "Proceed to Experience",
  "Proceed to Projects",
  "Proceed to Skill(s) & Link(s)",
  "Proceed to Certification",
  "Preview Resume",
];

export const ResumeEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");
  const resumeId = searchParams.get("resumeId");
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);


  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    // Load template
    if (templateId) {
      const template = getTemplateById(templateId);
      setSelectedTemplate(template);
    }

    // Load existing resume data if resumeId exists
    if (resumeId) {
      // TODO: Fetch resume data from API
      // const data = await fetchResumeData(resumeId);
      // setResumeData(data);
    }
  }, [templateId, resumeId]);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - Open Preview Modal
      setShowPreviewModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveResume = () => {
    // TODO: Save resume to backend
    console.log("Saving resume:", resumeData);
    // After save, you can navigate or show success message
  };

  const updatePersonalData = (data: typeof resumeData.personal) => {
    setResumeData({ ...resumeData, personal: data });
  };

  const updateEducationData = (data: typeof resumeData.education) => {
    setResumeData({ ...resumeData, education: data });
  };

  const updateExperienceData = (data: typeof resumeData.experience) => {
    setResumeData({ ...resumeData, experience: data });
  };

  const updateProjectsData = (data: typeof resumeData.projects) => {
    setResumeData({ ...resumeData, projects: data });
  };

  const updateSkillsLinksData = (data: typeof resumeData.skillsLinks) => {
    setResumeData({ ...resumeData, skillsLinks: data });
  };

  const updateCertificationsData = (data: typeof resumeData.certifications) => {
    setResumeData({ ...resumeData, certifications: data });
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalDetailsForm
            data={resumeData.personal}
            onChange={updatePersonalData}
          />
        );
      case 1:
        return (
          <EducationDetailsForm
            data={resumeData.education}
            onChange={updateEducationData}
          />
        );
      case 2:
        return (
          <ExperienceDetailsForm
            data={resumeData.experience}
            onChange={updateExperienceData}
          />
        );
      case 3:
        return (
          <ProjectsForm
            data={resumeData.projects}
            onChange={updateProjectsData}
          />
        );
      case 4:
        return (
          <SkillsLinksForm
            data={resumeData.skillsLinks}
            onChange={updateSkillsLinksData}
          />
        );
      case 5:
        return (
          <CertificationsForm
            data={resumeData.certifications}
            onChange={updateCertificationsData}
          />
        );
      default:
        return null;
    }
  };


  const handlePageChange = (direction: "next" | "prev") => {
    if (!selectedTemplate) return;
    const totalPages = selectedTemplate.pageCount || 1;

    if (direction === "next") {
      setCurrentPreviewPage((prev) =>
        prev < totalPages - 1 ? prev + 1 : prev
      );
    } else {
      setCurrentPreviewPage((prev) =>
        prev > 0 ? prev - 1 : prev
      );
    }
  };


  // Render template preview
  const renderTemplatePreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No template selected</p>
        </div>
      );
    }

    const TemplateComponent = selectedTemplate.component;
      return (
        <TemplateComponent
          data={resumeData}
          page={currentPreviewPage}   // pass page number
        />
      );

  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-['Baloo_2'] overflow-hidden">
      <DashNav heading="Resume Builder" />

      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden">
          {/* Stepper */}
          <div className="bg-white">
            <ProfileStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              validationErrors={validationErrors}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Form Panel */}
            <div className="flex-1 lg:w-[50%] overflow-auto scrollbar-hide">
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-[#1A1A43] mb-5">
                  {stepTitles[currentStep]}
                </h2>

                <div className="mb-6">{renderCurrentForm()}</div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-center gap-4 py-4">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="px-6 py-2.5 text-sm font-medium text-orange-500 bg-white border border-orange-400 rounded-full hover:bg-orange-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-orange-400 rounded-full hover:bg-orange-500 transition-colors"
                  >
                    {nextButtonLabels[currentStep]}
                  </button>
                </div>
              </div>
            </div>

            {/* Resume Preview Panel */}
            <div className="hidden lg:flex lg:w-[50%] bg-white overflow-auto scrollbar-hide">
              <div className="flex-1 p-4 overflow-auto scrollbar-hide border border-gray-300 m-4 rounded-lg">
                <div className="relative w-full h-full flex items-start justify-center">
  
                {/* Pagination Top Right */}
                {selectedTemplate && (
                  <div className="absolute top-2 right-4 flex items-center gap-3 bg-white px-3 py-1 rounded-full shadow-md text-sm font-medium">
                    <button
                      onClick={() => handlePageChange("prev")}
                      className="px-2 py-1 disabled:opacity-30"
                      disabled={currentPreviewPage === 0}
                    >
                      ◀
                    </button>

                    <div>
                      {currentPreviewPage + 1} / {selectedTemplate.pageCount || 1}
                    </div>

                    <button
                      onClick={() => handlePageChange("next")}
                      className="px-2 py-1 disabled:opacity-30"
                      disabled={
                        currentPreviewPage === (selectedTemplate.pageCount || 1) - 1
                      }
                    >
                      ▶
                    </button>
                  </div>
                )}

                {/* Render Resume Template */}
                <div className="transform scale-75 origin-top mt-8">
                  {renderTemplatePreview()}
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <ResumePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        resumeData={resumeData}
        templateId={templateId}
      />
    </div>
  );
};

export default ResumeEditor;
