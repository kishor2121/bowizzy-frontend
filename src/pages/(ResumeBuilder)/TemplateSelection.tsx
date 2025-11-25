import DashNav from "@/components/dashnav/dashnav";
import { useNavigate } from "react-router-dom";
import { getAllTemplates } from "@/templates/templateRegistry";

export default function TemplateSelection() {
  const navigate = useNavigate();
  const templates = getAllTemplates();

  const handleTemplateSelect = (templateId: string) => {
    // Navigate to editor with selected template
    navigate(`/resume-editor?templateId=${templateId}`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-['Baloo_2']">
      <DashNav heading="Resume Builder" />

      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="bg-white rounded-lg m-3 md:m-5 w-full max-w-[1210px] mx-auto">
          
          <div className="flex items-center justify-between px-4 md:px-5 pt-5 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-[#1A1A43] text-base font-semibold">
                Select a Template to continue
              </span>
              <span className="text-[#7F7F7F] text-sm">
                Choose a template that best fits your professional style
              </span>
            </div>
          </div>

          {templates.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-gray-600">No templates available</p>
              <p className="text-sm text-gray-400 mt-2">Please check back later</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-10 px-4 md:px-5 flex-wrap justify-center md:justify-start">
            {templates.map((template) => (
              <button
                key={template.id}
                className="relative w-[329px] rounded-lg border-0 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden group"
                style={{ boxShadow: "0px 0px 1px #00000040" }}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-[439px] object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6">
                  <span className="text-white text-lg font-semibold mb-3">{template.name}</span>
                  <div className="px-6 py-2 bg-white text-[#1A1A43] rounded-lg font-medium text-sm">
                    Use This Template
                  </div>
                </div>

                {/* Template Name at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 group-hover:opacity-0 transition-opacity">
                  <span className="text-white text-sm font-medium">{template.name}</span>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}