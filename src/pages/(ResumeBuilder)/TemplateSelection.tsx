import DashNav from "@/components/dashnav/dashnav";
import { useNavigate } from "react-router-dom";
import { getAllTemplates, getTemplateById } from "@/templates/templateRegistry";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import * as subscriptionService from "@/services/subscriptionService";
import { Lock, Crown } from "lucide-react";
import Premium from "@/pages/Premium";
import { getSubscriptionByUserId } from "@/services/subscriptionService";

export default function TemplateSelection() {
  const navigate = useNavigate();
  const templates = getAllTemplates();
  const [loadingSub, setLoadingSub] = useState(true);
  const [planType, setPlanType] = useState<string>("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const location = useLocation();

  // selection mode for picking templates after subscribing
  const [selectionMode, setSelectionMode] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [savingSelection, setSavingSelection] = useState(false);
  const [ignoredFromBackend, setIgnoredFromBackend] = useState<string[]>([]);
  const [preSelectedTemplates, setPreSelectedTemplates] = useState<string[]>([]);

  const PAID_EXTRA_TEMPLATE_IDS = ["template9", "template10"]; // templates that cost ₹100 each
  const EXTRA_PRICE = 100;
  const DEFAULT_TEMPLATES = ["template1", "template2", "template3", "template4", "template5", "template6", "template7", "template8", "template9","template10", "template11","template12", "template13", "template14", "template15", "template16", "template17", "template18","template19"]; // templates included by default in all plans

  const handleTemplateSelect = (templateId: string, locked: boolean) => {
    if (selectionMode) {
      toggleSelect(templateId);
      return;
    }

    if (locked) return;
    // Navigate to editor with selected template
    navigate(`/resume-editor?templateId=${templateId}`);
  };

  const toggleSelect = (templateId: string) => {
    // Prevent free users from selecting paid extras
    if (PAID_EXTRA_TEMPLATE_IDS.includes(templateId)) {
      const plan = (planType || "").toLowerCase();
      if (!(plan === "premium" || plan === "premium_plus" || plan === "premium-plus")) {
        alert("You need a Premium plan to add paid templates.");
        return;
      }
    }
    // Prevent removing default templates
    if (DEFAULT_TEMPLATES.includes(templateId)) {
      alert("Template 1, 2 and 3 are included by default and cannot be removed.");
      return;
    }

    setSelectedTemplates((prev) => {
      const exists = prev.includes(templateId);
      let next = exists ? prev.filter((t) => t !== templateId) : [...prev, templateId];

      // enforce max 2 paid extras
      const paidCount = next.filter((t) => PAID_EXTRA_TEMPLATE_IDS.includes(t)).length;
      if (paidCount > 2) {
        alert("You can only add up to 2 paid templates (₹100 each).");
        return prev;
      }

      return next;
    });
  };

  const handleSaveSelection = async (overrideNumericPayload?: number[]) => {
    // Persist selected templates to subscription
    try {
      setSavingSelection(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("Not logged in");
      const parsed = JSON.parse(userStr);
      const userId = parsed.user_id || parsed.id || parsed.userId;
      const token = parsed.token || localStorage.getItem("token");
      if (!userId || !token) throw new Error("Missing auth");
      // Before sending, ensure selectedTemplates are normalized and exist in registry
      const normalizedToSend = selectedTemplates
        .map((s) => {
          if (/^[0-9]+$/.test(s)) return `template${s}`;
          return s;
        })
        .filter((s) => !!getTemplateById(s));

      // Ensure defaults are included in payload
      const finalTemplates = Array.from(new Set([...normalizedToSend, ...DEFAULT_TEMPLATES]));

      // Convert to numeric ids for backend: 'template9' -> 9
      const numericPayload = overrideNumericPayload ?? finalTemplates
        .map((s) => {
          const m = String(s).match(/template(\d+)/);
          return m ? Number(m[1]) : null;
        })
        .filter((n): n is number => typeof n === "number" && !Number.isNaN(n));

      // If the user does not have an active subscription, or is free and trying to add paid extras,
      // redirect them to Choose Plan and pass pending templates so they can be auto-saved after subscribing.
      const hasSubscription = !!subscription;
      const hasPaidExtras = numericPayload.some((n) => [9, 10].includes(n));
      const plan = (planType || "").toLowerCase();

      if (!hasSubscription || (hasPaidExtras && !(plan === "premium" || plan === "premium_plus" || plan === "premium-plus"))) {
        // send user to premium page with pendingTemplates
        alert("Please choose a plan to save these selected templates.");
        const q = new URLSearchParams();
        q.set("pendingTemplates", JSON.stringify(numericPayload));
        // preserve selectTemplates flag so they come back to selection flow
        q.set("from", "template-selection");
        navigate(`/premium?${q.toString()}`);
        return;
      }

      // determine plan to send: prefer current planType state, otherwise use plan from URL if present
      const paramsNow = new URLSearchParams(location.search);
      const planFromUrl = paramsNow.get("plan");
      const planToSend = planType || (planFromUrl ? String(planFromUrl) : undefined);

      const updated = await subscriptionService.updateSubscriptionTemplates(userId, numericPayload, token, subscription?.id, planToSend);
      setSubscription(updated || null);

      // Update pre-selected state from server response if available, otherwise from numericPayload
      let serverList: number[] | undefined = undefined;
      if (updated && Array.isArray(updated.selected_templates)) {
        serverList = updated.selected_templates.map(Number).filter((n) => !Number.isNaN(n));
      }

      const toUse = serverList ?? numericPayload;
      const normalizedFromServer = toUse.map((n) => `template${n}`).filter((s) => !!getTemplateById(s));
      setPreSelectedTemplates(normalizedFromServer);
      // reflect saved selection (always include defaults)
      setSelectedTemplates(Array.from(new Set([...DEFAULT_TEMPLATES, ...normalizedFromServer])));
      alert("Templates saved successfully.");
      setSelectionMode(false);
      // If the user arrived here from a plan (e.g. ?plan=premium), go back to that plan page after saving
      const paramsAfter = new URLSearchParams(location.search);
      const cameFromPlan = paramsAfter.get("plan");
      if (cameFromPlan) {
        // pass a small flag to show confirmation on the plan page
        const q = new URLSearchParams();
        q.set("plan", cameFromPlan);
        q.set("saved", "true");
        navigate(`/premium?${q.toString()}`);
        return;
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Failed to save templates");
    } finally {
      setSavingSelection(false);
    }
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
          setPlanType(String(sub.plan_type).toLowerCase());
        } else {
          setPlanType("");
        }

        // store subscription object so we can pre-fill selected templates
        if (sub) {
          setSubscription(sub);

          // Normalize backend selected_templates to registry IDs and filter missing ones
            if (Array.isArray(sub.selected_templates)) {
              const raw: string[] = sub.selected_templates.map(String);
              const normalized: string[] = [];
              const ignored: string[] = [];

              for (const item of raw) {
                // numeric backend ids like "1" -> "template1"
                let candidate = item;
                if (/^[0-9]+$/.test(item)) {
                  candidate = `template${item}`;
                }

                // validate against registry
                if (getTemplateById(candidate)) {
                  if (!normalized.includes(candidate)) normalized.push(candidate);
                } else {
                  ignored.push(item);
                }
              }

              // ensure default templates are always included
              const withDefaults = Array.from(new Set([...DEFAULT_TEMPLATES, ...normalized]));
              setSelectedTemplates(withDefaults);
              setPreSelectedTemplates(withDefaults);
              setIgnoredFromBackend(ignored);
              // If we were navigated here with pendingTemplates (after subscribing), auto-save them
              const params = new URLSearchParams(location.search);
              const pending = params.get("pendingTemplates");
              if (pending) {
                try {
                  const parsedPending: number[] = JSON.parse(pending);
                  if (Array.isArray(parsedPending) && parsedPending.length > 0) {
                    // ensure defaults included and call save with numeric payload
                    const merged = Array.from(new Set([...(parsedPending || []), ...DEFAULT_TEMPLATES.map((d) => Number(d.replace('template','')))]));
                    await handleSaveSelection(merged);
                    // remove pendingTemplates from URL
                    const q = new URLSearchParams();
                    q.set("selectTemplates", "true");
                    if (planType) q.set("plan", String(planType));
                    navigate(`/template-selection?${q.toString()}`, { replace: true });
                  }
                } catch (e) {
                  // ignore parse errors
                }
              }
            } else {
              // No selection from backend — set default templates (1,2,3) for all users
              setSelectedTemplates([...DEFAULT_TEMPLATES]);
            }
        }

        setLoadingSub(false);
      })();
    } catch (err) {
      setPlanType("");
      setLoadingSub(false);
    }
  }, []);

  // read query param to enter selection mode after subscribe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("selectTemplates") === "true") {
      setSelectionMode(true);
    }
  }, [location.search]);

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

            {/* Selection toolbar when in selection mode */}
            {selectionMode && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700">
                  Selected: <strong>{selectedTemplates.length}</strong>
                </div>
                <div className="text-sm text-gray-700">
                  Extras: <strong>{selectedTemplates.filter(t => PAID_EXTRA_TEMPLATE_IDS.includes(t)).length}</strong> (₹{selectedTemplates.filter(t => PAID_EXTRA_TEMPLATE_IDS.includes(t)).length * EXTRA_PRICE})
                </div>
                <button onClick={() => handleSaveSelection()} disabled={savingSelection} className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-semibold">
                  {savingSelection ? 'Saving...' : `Save templates`}
                </button>
                <button onClick={() => setSelectionMode(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                  Cancel
                </button>
              </div>
            )}
            {selectionMode && !subscription && (
              <div className="mt-3 p-3 bg-yellow-50 text-sm rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Note:</strong> You don't have an active subscription yet. Save will only work after subscribing.
                  </div>
                  <div>
                    <button onClick={() => navigate('/premium')} className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm">Choose Plan</button>
                  </div>
                </div>
              </div>
            )}
            {/* Show ignored templates (if any) that backend sent but aren't in registry */}
            {ignoredFromBackend.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 text-sm rounded-md text-red-700">
                <strong>Note:</strong> Some previously saved templates were not found and were ignored: {ignoredFromBackend.join(", ")}
              </div>
            )}
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
                const freeList = [...DEFAULT_TEMPLATES];
                const premiumList = [...DEFAULT_TEMPLATES, "template4", "template5", "template6"];
                let allowedTemplates: string[] = freeList;
                const plan = (planType || "").toLowerCase();

                if (plan === "premium_plus" || plan === "premium-plus") {
                  // Premium+ gets access to all templates
                  allowedTemplates = templates.map((t) => t.id);
                } else if (plan === "premium") {
                  // Premium gets access to templates 1-6
                  allowedTemplates = premiumList;
                } else if (plan === "free") {
                  // Free users only get default templates
                  allowedTemplates = freeList;
                } else {
                  // unknown plan -> conservative: treat as free
                  allowedTemplates = freeList;
                }

                const isPaidExtra = PAID_EXTRA_TEMPLATE_IDS.includes(template.id);
                // For premium users: paid extras are selectable (must be purchased)
                const allowPaidAsPurchase = plan === "premium";
                // Locked if not allowed by plan; paid extras are allowed for purchase by premium
                const locked = !allowedTemplates.includes(template.id) && !(isPaidExtra && allowPaidAsPurchase);
                const selectable = !locked;

                // Render a non-disabled wrapper for locked templates so
                // the inner "Upgrade to use" button remains clickable.
                if (locked && !selectionMode) {
                  return (
                    <div
                      key={template.id}
                      className={`relative w-full rounded-lg border-0 transition-all overflow-hidden group opacity-70`}
                      style={{ boxShadow: "0px 0px 1px #00000040" }}
                    >
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-[260px] md:h-[320px] lg:h-[439px] object-cover"
                      />

                      {/* Template Name at Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity cursor-pointer">
                        <span className="text-white text-sm font-medium">{template.name}</span>
                      </div>

                      {/* Locked overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="flex flex-col items-center text-white gap-4">
                          <Lock size={36} />
                          <div className="text-center">
                            <span className="block text-sm font-semibold">Premium Template</span>
                            <span className="block text-xs text-gray-200 mt-1">Unlock with Premium plan</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log("Opening premium modal...");
                              setShowPremiumModal(true);
                            }}
                            className="px-5 py-2 bg-white text-[#1A1A43] rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            Upgrade to use
                          </button>
                        </div>
                      </div>

                      {/* Premium crown badge in top-right */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white shadow-md">
                          <Crown size={16} />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Unlocked template: clickable button to open editor
                return (
                  <button
                    key={template.id}
                    className={`relative w-full rounded-lg border-0 transition-all overflow-hidden group hover:shadow-xl hover:scale-[1.02]`}
                    style={{ boxShadow: "0px 0px 1px #00000040" }}
                    onClick={() => handleTemplateSelect(template.id, locked)}
                  >
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-[260px] md:h-[320px] lg:h-[439px] object-cover"
                    />
                    {/* Selection checkbox (top-left) when in selection mode */}
                    {selectionMode && (
                      <div className="absolute top-3 left-3 z-20">
                        {DEFAULT_TEMPLATES.includes(template.id) ? (
                              // Default templates - show included (disabled)
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 bg-orange-500 border-orange-500 text-white`} title="Included in all plans">
                                <Check size={16} />
                              </div>
                            ) : (
                              !locked && (
                                // Distinguish pre-saved vs newly selected
                                (preSelectedTemplates.includes(template.id) ? (
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 bg-gray-200 border-gray-200 text-gray-700`} title="Saved">
                                    <Check size={16} />
                                  </div>
                                ) : (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSelect(template.id);
                                    }}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${selectedTemplates.includes(template.id) ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                                  >
                                    {selectedTemplates.includes(template.id) ? <Check size={16} /> : <div className="w-2 h-2 rounded-full" />}
                                  </div>
                                ))
                              )
                            )}
                      </div>
                    )}

                    {/* Price badge for paid extras */}
                    {PAID_EXTRA_TEMPLATE_IDS.includes(template.id) && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="px-3 py-1 rounded-full bg-white text-sm font-semibold">₹{EXTRA_PRICE}</div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6 cursor-pointer">
                      <span className="text-white text-lg font-semibold mb-3">{template.name}</span>
                      <div className="px-6 py-2 bg-white text-[#1A1A43] rounded-lg font-medium text-sm cursor-pointer">
                        Use This Template
                      </div>
                    </div>

                    {/* Template Name at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 group-hover:opacity-0 transition-opacity cursor-pointer">
                      <span className="text-white text-sm font-medium">{template.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

            {/* Premium Modal (backdrop + panel) */}
            {showPremiumModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setShowPremiumModal(false)}
                />
                <div className="relative z-10 p-4 w-full max-w-4xl">
                  <Premium modal onClose={() => setShowPremiumModal(false)} />
                </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}