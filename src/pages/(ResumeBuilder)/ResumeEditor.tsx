import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProfileStepper from "./components/ProfileStepper";
import PersonalDetailsForm from "./components/forms/PersonalDetailsForm";
import EducationDetailsForm from "./components/forms/EducationDetailsForm";
import ExperienceDetailsForm from "./components/forms/ExperienceDetailsForm";
import ProjectsForm from "./components/forms/ProjectsForm";
import SkillsLinksForm from "./components/forms/SkillsLinksForm";
import CertificationsForm from "./components/forms/CertificationsForm";
import { initialResumeData } from "../../types/resume";
import type {
  ResumeData,
  EducationDetails,
  HigherEducation,
  WorkExperience,
  Project,
  Certificate,
} from "../../types/resume";
import DashNav from "@/components/dashnav/dashnav";
import { getTemplateById } from "@/templates/templateRegistry";
import ResumePreviewModal from "./components/ui/ResumePreviewModal";
import { getPersonalDetailsByUserId } from "@/services/personalService";
import { getEducationByUserId } from "@/services/educationService";
import { getExperienceByUserId } from "@/services/experienceService";
import { getProjectsByUserId } from "@/services/projectService";
import { getCertificatesByUserId } from "@/services/certificateService";
import {
  getSkillsByUserId,
  getLinksByUserId,
} from "@/services/skillsLinksService";

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

const mapEducationApiToLocal = (
  apiData: any[]
): {
  educationData: EducationDetails;
  idMap: Record<string, number>;
  deleteIds: number[];
} => {
  const educationData: EducationDetails = JSON.parse(
    JSON.stringify(initialResumeData.education)
  );
  const idMap: Record<string, number> = {};
  const higherEducations: HigherEducation[] = [];

  apiData.forEach((item) => {
    const localId = item.education_id.toString();
    idMap[localId] = item.education_id;

    const baseData = {
      education_id: item.education_id,
      instituteName: item.institution_name || "",
      boardType: item.board_type || "",
      resultFormat: item.result_format
        ? item.result_format.charAt(0).toUpperCase() +
          item.result_format.slice(1)
        : "",
      result: item.result?.toString() || "",
    };

    if (item.education_type === "sslc") {
      educationData.sslc = {
        ...educationData.sslc,
        ...baseData,
        yearOfPassing: item.end_year || "",
      };
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
          ? item.result_format.charAt(0).toUpperCase() +
            item.result_format.slice(1)
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

const mapExperienceApiToLocal = (apiData: {
  job_role: string;
  experiences: any[];
}): {
  experienceData: typeof initialResumeData.experience;
  idMap: Record<string, number>;
} => {
  const experiences: WorkExperience[] = apiData.experiences.map((item) => ({
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

  const idMap = experiences.reduce((acc, exp) => {
    acc[exp.id] = exp.experience_id as number;
    return acc;
  }, {} as Record<string, number>);

  return {
    experienceData: {
      jobRole: apiData.job_role || "",
      workExperiences:
        experiences.length > 0
          ? experiences
          : initialResumeData.experience.workExperiences,
      experienceEnabled: true,
    },
    idMap,
  };
};

const mapProjectsApiToLocal = (apiData: any[]): Project[] => {
  if (!apiData || apiData.length === 0) {
    return [
      {
        id: "1",
        project_id: undefined,
        projectTitle: "",
        projectType: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
        rolesResponsibilities: "",
        enabled: true,
      },
    ];
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

const mapCertificatesApiToLocal = (apiData: any[]): Certificate[] => {
  if (!apiData || apiData.length === 0) {
    return [
      {
        id: "1",
        certificate_id: undefined,
        certificateType: "",
        certificateTitle: "",
        domain: "",
        providedBy: "",
        date: "",
        description: "",
        certificateUrl: "",
        uploadedFileName: "",
        enabled: true,
      },
    ];
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
    return [
      {
        id: "1",
        skillName: "",
        skillLevel: "",
        enabled: true,
      },
    ];
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
  const linksObject = {
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
    link_id_linkedin: undefined as string | undefined,
    link_id_github: undefined as string | undefined,
    link_id_portfolio: undefined as string | undefined,
    link_id_publication: undefined as string | undefined,
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
  const resumeId = searchParams.get("resumeId");
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [personalDetailsId, setPersonalDetailsId] = useState<string | null>(
    null
  );

  const [educationDataIdMap, setEducationDataIdMap] = useState<
    Record<string, number>
  >({});
  const [deleteEducationIds, setDeleteEducationIds] = useState<number[]>([]);

  const [experienceDataIdMap, setExperienceDataIdMap] = useState<
    Record<string, number>
  >({});
  const [deleteExperienceIds, setDeleteExperienceIds] = useState<number[]>([]);

  // 1. Initial user and token check
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

  // 2. Template loading
  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      setSelectedTemplate(template);
    }
  }, [templateId]);

  // Function to fetch all data on mount
  const fetchAllData = useCallback(
    async (currentUserId: string, currentToken: string) => {
      if (!currentUserId || !currentToken) return;

      setLoading(true);
      let isError = false;

      // --- Personal Details ---
      try {
        const response = await getPersonalDetailsByUserId(
          currentUserId,
          currentToken
        );
        console.log("Fetched Personal Details:", response);
        if (response) {
          const personalData = {
            profilePhotoUrl: response.profile_photo_url || "",
            firstName: response.first_name || "",
            middleName: response.middle_name || "",
            lastName: response.last_name || "",
            email: response.email || "",
            mobileNumber: response.mobile_number || "",
            dateOfBirth: response.date_of_birth || "",
            gender: response.gender
              ? response.gender.charAt(0).toUpperCase() +
                response.gender.slice(1)
              : "",
            languagesKnown: response.languages_known || [],
            address: response.address || "",
            country: response.country || "India",
            state: response.state || "",
            city: response.city || "",
            pincode: response.pincode || "",
            nationality: response.nationality || "",
            passportNumber: response.passport_number || "",
            aboutCareerObjective: response.about || "",
          };

          setResumeData((prev) => ({
            ...prev,
            personal: personalData,
          }));

          setPersonalDetailsId(response.personal_id || null);
        }
      } catch (error) {
        console.error("Error fetching personal details:", error);
        isError = true;
      }

      // --- Education Details ---
      try {
        const apiResponse = await getEducationByUserId(
          currentUserId,
          currentToken
        );
        console.log("Fetched Education Details:", apiResponse);

        if (apiResponse && apiResponse.length > 0) {
          const { educationData, idMap } = mapEducationApiToLocal(apiResponse);
          setResumeData((prev) => ({ ...prev, education: educationData }));
          setEducationDataIdMap(idMap);
        } else {
          setResumeData((prev) => ({
            ...prev,
            education: initialResumeData.education,
          }));
          setEducationDataIdMap({});
        }
      } catch (error) {
        console.error("Error fetching education details:", error);
        isError = true;
      }

      // --- Experience Details ---
      try {
        const apiResponse = await getExperienceByUserId(
          currentUserId,
          currentToken
        );
        console.log("Fetched Experience Details:", apiResponse);

        if (apiResponse && apiResponse.experiences) {
          const { experienceData, idMap } =
            mapExperienceApiToLocal(apiResponse);
          setResumeData((prev) => ({ ...prev, experience: experienceData }));
          setExperienceDataIdMap(idMap);
        } else {
          setResumeData((prev) => ({
            ...prev,
            experience: initialResumeData.experience,
          }));
          setExperienceDataIdMap({});
        }
      } catch (error) {
        console.error("Error fetching experience details:", error);
        isError = true;
      }

      // --- Projects Details ---
      try {
        const apiResponse = await getProjectsByUserId(
          currentUserId,
          currentToken
        );
        console.log("Fetched Projects Details:", apiResponse);

        const projectsData = mapProjectsApiToLocal(apiResponse);
        setResumeData((prev) => ({ ...prev, projects: projectsData }));
      } catch (error) {
        console.error("Error fetching projects details:", error);
        isError = true;
        setResumeData((prev) => ({
          ...prev,
          projects: initialResumeData.projects,
        }));
      }

      // --- Skills Details ---
      try {
        const apiResponse = await getSkillsByUserId(
          currentUserId,
          currentToken
        );
        console.log("Fetched Skills Details:", apiResponse);

        const skillsData = mapSkillsApiToLocal(apiResponse);
        setResumeData((prev) => ({
          ...prev,
          skillsLinks: { ...prev.skillsLinks, skills: skillsData },
        }));
      } catch (error) {
        console.error("Error fetching skills details:", error);
        isError = true;
      }

      // --- Links Details ---
      try {
        const apiResponse = await getLinksByUserId(currentUserId, currentToken);
        console.log("Fetched Links Details:", apiResponse);

        const linksData = mapLinksApiToLocal(apiResponse);
        setResumeData((prev) => ({
          ...prev,
          skillsLinks: { ...prev.skillsLinks, links: linksData },
        }));
      } catch (error) {
        console.error("Error fetching links details:", error);
        isError = true;
      }

      // --- Certificates Details ---
      try {
        const apiResponse = await getCertificatesByUserId(
          currentUserId,
          currentToken
        );
        console.log("Fetched Certificates Details:", apiResponse);

        const certificatesData = mapCertificatesApiToLocal(apiResponse);
        setResumeData((prev) => ({
          ...prev,
          certifications: certificatesData,
        }));
      } catch (error) {
        console.error("Error fetching certificates details:", error);
        isError = true;
        setResumeData((prev) => ({
          ...prev,
          certifications: initialResumeData.certifications,
        }));
      }

      // --- Skills & Links (No API call, using initial data or relying on local state for now) ---
      // Assuming Skills & Links data is handled client-side if no dedicated API exists.
      // If there was an API, it would be called here.

      setLoading(false);
    },
    []
  );

  // 3. Effect to call fetchAllData when userId and token are available
  useEffect(() => {
    if (userId && token) {
      fetchAllData(userId, token);
    }
  }, [userId, token, fetchAllData]);

  // Removed individual fetch effects that were dependent on currentStep, as all data is fetched on mount now.

  const handleStepClick = (stepIndex: number) => {
    // We can still set loading briefly if navigating to a step that involves significant rendering or if we add a debounce/throttle to the form logic.
    // However, since data is already fetched, we primarily just change the step.
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

  const handleSaveResume = () => {
    console.log("Saving resume:", resumeData);
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

  const handlePageChange = (direction: "next" | "prev") => {
    if (!selectedTemplate) return;
    const totalPages = selectedTemplate.pageCount || 1;

    if (direction === "next") {
      setCurrentPreviewPage((prev) =>
        prev < totalPages - 1 ? prev + 1 : prev
      );
    } else {
      setCurrentPreviewPage((prev) => (prev > 0 ? prev - 1 : prev));
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

    const TemplateComponent = selectedTemplate.component;
    return <TemplateComponent data={resumeData} page={currentPreviewPage} />;
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
                      className="px-6 py-2.5 text-sm font-medium text-orange-500 bg-white border border-orange-400 rounded-full hover:bg-orange-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-orange-400 rounded-full hover:bg-orange-500 transition-colors"
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
                        {currentPreviewPage + 1} /{" "}
                        {selectedTemplate.pageCount || 1}
                      </div>

                      <button
                        onClick={() => handlePageChange("next")}
                        className="px-2 py-1 disabled:opacity-30"
                        disabled={
                          currentPreviewPage ===
                          (selectedTemplate.pageCount || 1) - 1
                        }
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  <div className="transform scale-75 origin-top mt-8">
                    {renderTemplatePreview()}
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
