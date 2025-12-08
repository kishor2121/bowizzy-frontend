import { useState } from "react";
import DashNav from "@/components/dashnav/dashnav";
import PersonalDetails from "./components/PersonalDetails";
import EducationDetails from "./components/EducationDetails";
import WorkExperience from "./components/WorkExperience";
import BankDetails from "./components/BankDetails";
import VerificationSubmitted from "./components/VerificationSubmitted";
import VerifiedDashboard from "./components/VerifiedDashboard";
import InterviewDetailsView from "./components/InterviewDetailsView";
import ProgressStepper from "./components/ProgressStepper";

interface Interview {
  id: string;
  title: string;
  experience: string;
  date: string;
  time: string;
  credits?: number;
  priority?: string;
}

const TakeMockInterview = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false); // Set to false for verification flow
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [viewType, setViewType] = useState<'scheduled' | 'available' | 'saved' | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    linkedin: "",
    photo: null,
    educations: [],
    experiences: [],
    accountHolderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "",
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(5);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleViewDetails = (interview: Interview, type: 'scheduled' | 'available' | 'saved') => {
    setSelectedInterview(interview);
    setViewType(type);
  };

  const handleBack = () => {
    setSelectedInterview(null);
    setViewType(null);
  };

  const handleBookInterview = () => {
    // Here you can add logic to move the interview to scheduled
    // For now, just go back to dashboard
    handleBack();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Step 1: Personal Details";
      case 2:
        return "Step 2: Education Details";
      case 3:
        return "Step 3: Work Experience";
      case 4:
        return "Step 4: Bank Details";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Provide your details as per your official records.";
      case 2:
        return "Please enter your educational qualifications. Only provide as mandatory.";
      case 3:
        return "Please enter your work experience details.";
      case 4:
        return "We require your bank details to pay you when you successfully complete an interview.";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-screen font-['Baloo_2']">
      <DashNav heading="Take Mock Interview" />

      <div className="flex-1 max-h-screen overflow-auto bg-[#F0F0F0] p-2 sm:p-4 lg:p-6">
        <div className="w-full mx-auto">
          {isVerified ? (
            selectedInterview ? (
              <InterviewDetailsView
                interview={selectedInterview}
                onBack={handleBack}
                viewType={viewType}
                onBook={handleBookInterview}
              />
            ) : (
              <VerifiedDashboard onViewDetails={handleViewDetails} />
            )
          ) : (
            <>
              {/* Header Section */}
              <div className="flex items-start gap-3 mb-6">
                <button
                  onClick={() => {
                    if (currentStep === 1) {
                      window.history.back();
                    } else {
                      handlePrevious();
                    }
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8351] hover:bg-[#FF8351] hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div>
                  <h2 className="text-xl font-semibold text-[#3A3A3A] mb-1">
                    Take Mock Interview
                  </h2>
                  <p className="text-[#3A3A3A] text-sm leading-relaxed">
                    Conduct interviews to guide aspiring professionals. Share
                    your expertise, support their growth, and earn rewards in
                    return. At the same time, you'll strengthen your credibility
                    and expand your professional network.
                  </p>
                </div>
              </div>

              {currentStep < 5 ? (
                <div className="bg-white rounded-md p-6">
                  <h3 className="text-[#FF8351] text-lg font-semibold mb-2">
                    User Verification
                  </h3>
                  <p className="text-sm text-gray-600 mb-8">
                    To join as an interviewer, your profile and experience will
                    be verified. This helps us maintain trust and connect
                    candidates with genuine professionals.
                  </p>

                  <ProgressStepper currentStep={currentStep} />

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-6"></div>

                  {/* Step Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#3A3A3A] mb-2">
                      {getStepTitle()}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {getStepDescription()}
                    </p>

                    {currentStep === 1 && (
                      <PersonalDetails
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                      />
                    )}

                    {currentStep === 2 && (
                      <EducationDetails
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                      />
                    )}

                    {currentStep === 3 && (
                      <WorkExperience
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                      />
                    )}

                    {currentStep === 4 && (
                      <BankDetails
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <VerificationSubmitted />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeMockInterview;