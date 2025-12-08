import  { useState } from "react";
import DashNav from "@/components/dashnav/dashnav";
import { useNavigate } from "react-router-dom";
import { getAllTemplates } from "@/templates/templateRegistry";

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const templates = getAllTemplates();

  const [userResumes, setUserResumes] = useState([
    { id: 1, thumbnail: "url_to_thumbnail", pdfUrl: "url_to_pdf", name: "My Resume 1" },
    { id: 2, thumbnail: "url_to_thumbnail", pdfUrl: "url_to_pdf", name: "My Resume 2" }
  ]);

  const handleNewResume = () => {
    navigate('/template-selection');
  };

  const handleResumeClick = (resume: any) => {
    // Navigate to editor with existing resume ID
    navigate(`/resume-editor?resumeId=${resume.id}`);
  };

  const handleTemplateClick = (templateId: string) => {
    // Navigate to template selection or directly to editor
    navigate(`/template-selection`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-['Baloo_2']">
      <DashNav heading="Resume Builder" />

      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="bg-white rounded-lg m-3 md:m-5 w-full max-w-[1210px] mx-auto">
          
          <div className="flex flex-col mt-5 mb-10 gap-2 px-4 md:px-5">
            <span className="text-[#1A1A43] text-base font-semibold">
              Your Resume(s)
            </span>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white">
              
              <button
                className="flex flex-col items-center w-[150px] py-4 px-5 rounded-lg border-0 gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(180deg, #FFE29FDE, #FFA99F)",
                }}
                onClick={handleNewResume}
              >
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/qhRmgt2LET/4ie3c11r_expires_30_days.png"
                  className="w-[114px] h-[140px] rounded-lg object-fill"
                  alt="New Resume"
                />
                <span className="text-[#3A3A3A] text-sm">New Resume</span>
              </button>

              {userResumes.map((resume) => (
                <button
                  key={resume.id}
                  className="flex flex-col items-center w-[150px] py-4 px-5 rounded-lg border border-gray-200 gap-2 hover:shadow-md transition-shadow bg-white"
                  onClick={() => handleResumeClick(resume)}
                >
                  <img
                    src={resume.thumbnail}
                    alt={resume.name}
                    className="w-[114px] h-[140px] rounded-lg object-cover border border-gray-100"
                  />
                  <span className="text-[#3A3A3A] text-sm font-medium truncate w-full text-center">
                    {resume.name}
                  </span>
                </button>
              ))}

              {userResumes.length === 0 && (
                <>
                  <div className="hidden md:block bg-[#7F7F7F] w-[1px] h-[200px]" />
                  <div className="flex flex-col items-center md:items-start md:w-[877px] md:px-[111px] text-center md:text-left">
                    <span className="text-[#3A3A3A] text-lg md:text-xl">
                      You don't have any resume(s) created. Create one now by selecting a template!!
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mb-5 px-4 md:px-5">
            <span className="text-[#1A1A43] text-base font-semibold">Our Recommended Templates</span>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-10 px-4 md:px-5 flex-wrap justify-center md:justify-start">
            {templates.slice(0, 3).map((template) => (
              <button
                key={template.id}
                className="relative w-[329px] rounded-lg shadow-sm border-0 hover:shadow-lg transition-shadow overflow-hidden"
                style={{ boxShadow: "0px 0px 1px #00000040" }}
                onClick={() => handleTemplateClick(template.id)}
              >
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-[439px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-white text-sm font-medium">{template.name}</span>
                </div>
              </button>
            ))}
          </div>

          {templates.length > 3 && (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-10 px-4 md:px-5 flex-wrap justify-center md:justify-start">
              {templates.slice(3, 6).map((template) => (
                <button
                  key={template.id}
                  className="relative w-[329px] rounded-lg shadow-sm border-0 hover:shadow-lg transition-shadow overflow-hidden"
                  style={{ boxShadow: "0px 0px 1px #00000040" }}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-[439px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className="text-white text-sm font-medium">{template.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}