import DashNav from "@/components/dashnav/dashnav";
import { useNavigate } from "react-router-dom";
import { getAllTemplates } from "@/templates/templateRegistry";
import { useEffect, useState } from "react";
import { Lock, Crown } from "lucide-react";
import { getSubscriptionByUserId } from "@/services/subscriptionService";

export default function TemplateSelection() {
  const navigate = useNavigate();
  const templates = getAllTemplates();
  const [loadingSub, setLoadingSub] = useState(true);
  const [planType, setPlanType] = useState<string>("");

  const handleTemplateSelect = (templateId: string, locked: boolean) => {
    if (locked) return;
    // Navigate to editor with selected template
    navigate(`/resume-editor?templateId=${templateId}`);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setPlanType("");
      setLoadingSub(false);
      return;
    }

    try {
      const parsed = JSON.parse(userStr);
      const userId = parsed.user_id || parsed.id || parsed.userId;
      const token = parsed.token || localStorage.getItem("token");
      if (!userId || !token) {
        setPlanType("");
        setLoadingSub(false);
        return;
      }

      (async () => {
        setLoadingSub(true);
        const sub = await getSubscriptionByUserId(userId, token);
        if (sub && sub.plan_type && sub.status === "active") {
          setPlanType(String(sub.plan_type).toLowerCase());
        } else if (sub && sub.plan_type) {
          // If status not active but plan_type present, still use it (non-active treated as lower access)
          setPlanType(String(sub.plan_type).toLowerCase());
        } else {
          // unknown
          setPlanType("");
        }
        setLoadingSub(false);
      })();
    } catch (err) {
      setPlanType("");
      setLoadingSub(false);
    }
  }, []);

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
              <div className="flex items-center gap-3">
                <span className="text-[#7F7F7F] text-sm">
                  Choose a template that best fits your professional style
                </span>
                {/* Plan badge */}
                {loadingSub ? (
                  <span className="text-sm text-gray-400">Checking plan...</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-md bg-[#F3F4F6] text-[#374151]">{planType ? planType.toUpperCase() : 'FREE'}</span>
                )}
              </div>
            </div>
          </div>

          {templates.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-gray-600">No templates available</p>
              <p className="text-sm text-gray-400 mt-2">Please check back later</p>
            </div>
          )}

          {/* Templates grid (scrollable) */}
          <div className="px-4 md:px-5 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 p-4 max-h-[70vh] overflow-auto" style={{ paddingBottom: 12 }}>

              {templates.map((template) => {
                // Determine allowed templates based on planType
                const freeList = ["template1", "template2", "template3", "template4", "template5", "template6", "template7", "template8", "template9", "template10"];
                const plusList = ["template1", "template2", "template3", "template4", "template5", "template6"];
                let allowedTemplates: string[] = freeList;
                const plan = (planType || "").toLowerCase();
                if (plan === "premium") {
                  allowedTemplates = templates.map((t) => t.id);
                } else if (plan === "plus") {
                  allowedTemplates = plusList;
                } else if (plan === "free") {
                  allowedTemplates = freeList;
                } else {
                  // unknown plan -> conservative: treat as free
                  allowedTemplates = freeList;
                }

                const locked = !allowedTemplates.includes(template.id);

                return (
                  <button
                    key={template.id}
                    className={`relative w-full rounded-lg border-0 transition-all overflow-hidden group ${locked ? "opacity-70" : "hover:shadow-xl hover:scale-[1.02]"}`}
                    style={{ boxShadow: "0px 0px 1px #00000040" }}
                    onClick={() => handleTemplateSelect(template.id, locked)}
                    disabled={locked}
                  >
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-[260px] md:h-[320px] lg:h-[439px] object-cover"
                    />

                    {/* Hover Overlay (only when not locked) */}
                    {!locked && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6 cursor-pointer">
                        <span className="text-white text-lg font-semibold mb-3">{template.name}</span>
                        <div className="px-6 py-2 bg-white text-[#1A1A43] rounded-lg font-medium text-sm cursor-pointer">
                          Use This Template
                        </div>
                      </div>
                    )}

                    {/* Template Name at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 group-hover:opacity-0 transition-opacity cursor-pointer">
                      <span className="text-white text-sm font-medium">{template.name}</span>
                    </div>

                    {/* Locked overlay */}
                    {locked && (
                      <>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                          <div className="flex flex-col items-center text-white">
                            <Lock size={36} />
                            <span className="mt-2 text-sm font-semibold">Premium</span>
                            <span className="text-xs text-gray-200 mt-1">Upgrade to use</span>
                          </div>
                        </div>

                        {/* Premium crown badge in top-right */}
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white shadow-md">
                            <Crown size={16} />
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}