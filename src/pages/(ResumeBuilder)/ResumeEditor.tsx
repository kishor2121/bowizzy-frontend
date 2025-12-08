import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProfileStepper from "./components/ui/ProfileStepper";
import ProfileStepper from "./components/ui/ProfileStepper";
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
import PageBreakMarkers from "./components/PageBreakMarkers";
import { usePageMarkers } from "@/hooks/usePageMarkers";
import { getPersonalDetailsByUserId } from "@/services/personalService";
import { getEducationByUserId } from "@/services/educationService";
import { getExperienceByUserId } from "@/services/experienceService";
import { getProjectsByUserId } from "@/services/projectService";
import { getCertificatesByUserId } from "@/services/certificateService";
import {
  getSkillsByUserId,
  getLinksByUserId,
  getTechnicalSummary,
} from "@/services/skillsLinksService";

// Import print styles
import "@/styles/print.css";

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

// Helper functions for API mapping (keep your existing mapping functions)
const mapEducationApiToLocal = (apiData: any[]) => {
  const educationData = JSON.parse(JSON.stringify(initialResumeData.education));
  const idMap: Record<string, number> = {};
  const higherEducations: any[] = [];

  apiData.forEach((item) => {
    const localId = item.education_id.toString();
    idMap[localId] = item.education_id;

    const baseData = {
      education_id: item.education_id,
      instituteName: item.institution_name || "",
      boardType: item.board_type || "",
      resultFormat: item.result_format
        ? item.result_format.charAt(0).toUpperCase() + item.result_format.slice(1)
        : "",
      result: item.result?.toString() || "",
    };

    if (item.education_type === "sslc") {
      educationData.sslc = { ...educationData.sslc, ...baseData, yearOfPassing: item.end_year || "" };
      educationData.sslcEnabled = true;
    } else if (item.education_type === "puc") {
      educationData.preUniversity = {
        ...educationData.preUniversity,
        ...baseData,
        subjectStream: item.subject_stream || "",
        yearOfPassing: item.end_year || "",
      };
      educationData.preUniversityEnabled = true;
    } else if (item.education_type === "higher") {
      higherEducations.push({
        id: localId,
        education_id: item.education_id,
        degree: item.degree || "",
        fieldOfStudy: item.field_of_study || "",
        instituteName: item.institution_name || "",
        universityBoard: item.university_name || "",
        startYear: item.start_year || "",
        endYear: item.end_year || "",
        resultFormat: item.result_format
          ? item.result_format.charAt(0).toUpperCase() + item.result_format.slice(1)
          : "",
        result: item.result?.toString() || "",
        currentlyPursuing: item.currently_working_here || false,
      });
      educationData.higherEducationEnabled = true;
    }
  });

  educationData.higherEducation = higherEducations;
  return { educationData, idMap, deleteIds: [] };
};

const mapExperienceApiToLocal = (apiData: any) => {
  const experiences = apiData.experiences.map((item: any) => ({
    id: item.experience_id.toString(),
    experience_id: item.experience_id,
    companyName: item.company_name || "",
    jobTitle: item.job_title || "",
    employmentType: item.employment_type || "",
    location: item.location || "",
    workMode: item.work_mode || "",
    startDate: item.start_date ? item.start_date.substring(0, 7) : "",
    endDate: item.end_date ? item.end_date.substring(0, 7) : "",
    currentlyWorking: item.currently_working_here || false,
    description: item.description || "",
    enabled: true,
  }));

  const idMap = experiences.reduce((acc: any, exp: any) => {
    acc[exp.id] = exp.experience_id;
    return acc;
  }, {});

  return {
    experienceData: {
      jobRole: apiData.job_role || "",
      workExperiences: experiences.length > 0 ? experiences : initialResumeData.experience.workExperiences,
      experienceEnabled: true,
    },
    idMap,
  };
};

const mapProjectsApiToLocal = (apiData: any[]) => {
  if (!apiData || apiData.length === 0) {
    return [{ ...initialResumeData.projects[0] }];
  }

  return apiData.map((item) => ({
    id: item.project_id.toString(),
    project_id: item.project_id,
    projectTitle: item.project_title || "",
    projectType: item.project_type || "",
    startDate: item.start_date ? item.start_date.substring(0, 7) : "",
    endDate: item.end_date ? item.end_date.substring(0, 7) : "",
    currentlyWorking: item.currently_working || false,
    description: item.description || "",
    rolesResponsibilities: item.roles_responsibilities || "",
    enabled: true,
  }));
};

const mapCertificatesApiToLocal = (apiData: any[]) => {
  if (!apiData || apiData.length === 0) {
    return [{ ...initialResumeData.certifications[0] }];
  }

  return apiData.map((item) => ({
    id: item.certificate_id.toString(),
    certificate_id: item.certificate_id,
    certificateType: item.certificate_type || "",
    certificateTitle: item.certificate_title || "",
    domain: item.domain || "",
    providedBy: item.certificate_provided_by || "",
    date: item.date ? item.date.substring(0, 7) : "",
    description: item.description || "",
    certificateUrl: item.file_url || "",
    uploadedFileName: item.file_url ? item.file_url.split("/").pop() : "",
    enabled: true,
  }));
};

const mapSkillsApiToLocal = (apiData: any[]) => {
  if (!apiData || apiData.length === 0) {
    return [{ id: "1", skillName: "", skillLevel: "", enabled: true }];
  }

  return apiData.map((item) => ({
    id: item.skill_id.toString(),
    skill_id: item.skill_id,
    skillName: item.skill_name || "",
    skillLevel: item.skill_level || "",
    enabled: true,
  }));
};

const mapLinksApiToLocal = (apiData: any[]) => {
  const linksObject: any = {
    linkedinProfile: "",
    githubProfile: "",
    portfolioUrl: "",
    portfolioDescription: "",
    publicationUrl: "",
    publicationDescription: "",
    linkedinEnabled: false,
    githubEnabled: false,
    portfolioEnabled: false,
    publicationEnabled: false,
    link_id_linkedin: undefined,
    link_id_github: undefined,
    link_id_portfolio: undefined,
    link_id_publication: undefined,
  };

  if (!apiData || apiData.length === 0) {
    return linksObject;
  }

  apiData.forEach((item) => {
    switch (item.link_type) {
      case "linkedin":
        linksObject.linkedinProfile = item.url || "";
        linksObject.linkedinEnabled = true;
        linksObject.link_id_linkedin = item.link_id?.toString();
        break;
      case "github":
        linksObject.githubProfile = item.url || "";
        linksObject.githubEnabled = true;
        linksObject.link_id_github = item.link_id?.toString();
        break;
      case "portfolio":
        linksObject.portfolioUrl = item.url || "";
        linksObject.portfolioDescription = item.description || "";
        linksObject.portfolioEnabled = true;
        linksObject.link_id_portfolio = item.link_id?.toString();
        break;
      case "publication":
        linksObject.publicationUrl = item.url || "";
        linksObject.publicationDescription = item.description || "";
        linksObject.publicationEnabled = true;
        linksObject.link_id_publication = item.link_id?.toString();
        break;
    }
  });

  return linksObject;
};

export const ResumeEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [personalDetailsId, setPersonalDetailsId] = useState<string | null>(null);
  const [educationDataIdMap, setEducationDataIdMap] = useState<Record<string, number>>({});
  const [deleteEducationIds, setDeleteEducationIds] = useState<number[]>([]);
  const [experienceDataIdMap, setExperienceDataIdMap] = useState<Record<string, number>>({});
  const [deleteExperienceIds, setDeleteExperienceIds] = useState<number[]>([]);
  const [technicalSummaryId, setTechnicalSummaryId] = useState<number | null>(
    null
  );

  // Ref for preview content to calculate page markers
  const previewContentRef = useRef<HTMLDivElement>(null);
  const { markers, totalPages } = usePageMarkers(previewContentRef, [resumeData, selectedTemplate]);

  // User and token check
  useEffect(() => {
    const userDataStr = localStorage.getItem("user");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUserId(userData.user_id);
        setToken(userData.token);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Template loading
  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      setSelectedTemplate(template);
    }
  }, [templateId]);

  // Fetch all data
  const fetchAllData = useCallback(
    async (currentUserId: string, currentToken: string) => {
      if (!currentUserId || !currentToken) return;

      setLoading(true);

      try {
        // Personal Details
        const personalResponse = await getPersonalDetailsByUserId(currentUserId, currentToken);
        if (personalResponse) {
          const personalData = {
            profilePhotoUrl: personalResponse.profile_photo_url || "",
            firstName: personalResponse.first_name || "",
            middleName: personalResponse.middle_name || "",
            lastName: personalResponse.last_name || "",
            email: personalResponse.email || "",
            mobileNumber: personalResponse.mobile_number || "",
            dateOfBirth: personalResponse.date_of_birth || "",
            gender: personalResponse.gender
              ? personalResponse.gender.charAt(0).toUpperCase() + personalResponse.gender.slice(1)
              : "",
            languagesKnown: personalResponse.languages_known || [],
            address: personalResponse.address || "",
            country: personalResponse.country || "India",
            state: personalResponse.state || "",
            city: personalResponse.city || "",
            pincode: personalResponse.pincode || "",
            nationality: personalResponse.nationality || "",
            passportNumber: personalResponse.passport_number || "",
            aboutCareerObjective: personalResponse.about || "",
          };
          setResumeData((prev) => ({ ...prev, personal: personalData }));
          setPersonalDetailsId(personalResponse.personal_id || null);
        }

        // Education Details
        const educationResponse = await getEducationByUserId(currentUserId, currentToken);
        if (educationResponse && educationResponse.length > 0) {
          const { educationData, idMap } = mapEducationApiToLocal(educationResponse);
          setResumeData((prev) => ({ ...prev, education: educationData }));
          setEducationDataIdMap(idMap);
        }

        // Experience Details
        const experienceResponse = await getExperienceByUserId(currentUserId, currentToken);
        if (experienceResponse && experienceResponse.experiences) {
          const { experienceData, idMap } = mapExperienceApiToLocal(experienceResponse);
          setResumeData((prev) => ({ ...prev, experience: experienceData }));
          setExperienceDataIdMap(idMap);
        }

        // Projects
        const projectsResponse = await getProjectsByUserId(currentUserId, currentToken);
        const projectsData = mapProjectsApiToLocal(projectsResponse);
        setResumeData((prev) => ({ ...prev, projects: projectsData }));

        // Skills
        const skillsResponse = await getSkillsByUserId(currentUserId, currentToken);
        const skillsData = mapSkillsApiToLocal(skillsResponse);
        setResumeData((prev) => ({
          ...prev,
          skillsLinks: { ...prev.skillsLinks, skills: skillsData },
        }));

        // Links
        const linksResponse = await getLinksByUserId(currentUserId, currentToken);
        const linksData = mapLinksApiToLocal(linksResponse);
        setResumeData((prev) => ({
          ...prev,
          skillsLinks: { ...prev.skillsLinks, links: linksData },
        }));

        // Technical Summary
        const summaryResponse = await getTechnicalSummary(currentUserId, currentToken);
        if (summaryResponse) {
          setResumeData((prev) => ({
            ...prev,
            skillsLinks: {
              ...prev.skillsLinks,
              technicalSummary: summaryResponse.summary || "",
              technicalSummaryEnabled: !!summaryResponse.summary,
            },
          }));
          setTechnicalSummaryId(summaryResponse.summary_id || null);
        }

        // Certificates
        const certificatesResponse = await getCertificatesByUserId(currentUserId, currentToken);
        const certificatesData = mapCertificatesApiToLocal(certificatesResponse);
        setResumeData((prev) => ({ ...prev, certifications: certificatesData }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (userId && token) {
      fetchAllData(userId, token);
    }
  }, [userId, token, fetchAllData]);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPreviewModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-400"></div>
            <p className="mt-4 text-gray-600">Loading details...</p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <PersonalDetailsForm
            data={resumeData.personal}
            onChange={updatePersonalData}
            userId={userId}
            token={token}
            personalDetailsId={personalDetailsId}
          />
        );
      case 1:
        return (
          <EducationDetailsForm
            data={resumeData.education}
            onChange={updateEducationData}
            userId={userId}
            token={token}
            educationDataIdMap={educationDataIdMap}
            setEducationDataIdMap={setEducationDataIdMap}
            deleteEducationIds={deleteEducationIds}
            setDeleteEducationIds={setDeleteEducationIds}
          />
        );
      case 2:
        return (
          <ExperienceDetailsForm
            data={resumeData.experience}
            onChange={updateExperienceData}
            userId={userId}
            token={token}
            experienceDataIdMap={experienceDataIdMap}
            setExperienceDataIdMap={setExperienceDataIdMap}
            deleteExperienceIds={deleteExperienceIds}
            setDeleteExperienceIds={setDeleteExperienceIds}
          />
        );
      case 3:
        return (
          <ProjectsForm
            data={resumeData.projects}
            onChange={updateProjectsData}
            userId={userId}
            token={token}
          />
        );
      case 4:
        return (
          <SkillsLinksForm
            data={resumeData.skillsLinks}
            onChange={updateSkillsLinksData}
            userId={userId}
            token={token}
            technicalSummaryId={technicalSummaryId}
          />
        );
      case 5:
        return (
          <CertificationsForm
            data={resumeData.certifications}
            onChange={updateCertificationsData}
            userId={userId}
            token={token}
          />
        );
      default:
        return null;
    }
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No template selected</p>
        </div>
      );
    }

    const DisplayComponent = selectedTemplate.displayComponent || selectedTemplate.component;
    return <DisplayComponent data={resumeData} />;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-['Baloo_2'] overflow-hidden">
      <DashNav heading="Resume Builder" />

      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden">
          <div className="bg-white">
            <ProfileStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              validationErrors={validationErrors}
            />
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 lg:w-[50%] overflow-auto scrollbar-hide">
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-[#1A1A43] mb-5">
                  {stepTitles[currentStep]}
                </h2>

                <div className="mb-6">{renderCurrentForm()}</div>

                <div className="flex items-center justify-center gap-4 py-4">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="px-6 py-2.5 text-sm font-medium text-orange-500 bg-white border border-orange-400 rounded-full hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-orange-400 rounded-full hover:bg-orange-500 transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : nextButtonLabels[currentStep]}
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:w-[50%] bg-white overflow-auto scrollbar-hide">
              <div className="flex-1 p-4 overflow-auto scrollbar-hide border border-gray-300 m-4 rounded-lg">
                <div className="relative w-full h-full flex items-start justify-center">
                  {/* Page info */}
                  {totalPages > 1 && (
                    <div className="absolute top-2 right-4 bg-white px-3 py-1 rounded-full shadow-md text-sm font-medium z-10">
                      {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                    </div>
                  )}

                  {/* Preview content with markers */}
                  <div className="relative transform scale-75 origin-top -mt-4">
                    <div ref={previewContentRef} className="relative">
                      {renderTemplatePreview()}
                      <PageBreakMarkers markers={markers} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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