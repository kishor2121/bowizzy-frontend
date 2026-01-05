import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashNav from "@/components/dashnav/dashnav";
import { Check, X } from "lucide-react";
import * as subscriptionService from "@/services/subscriptionService";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  duration: string;
  description: string;
  badge: string;
  features: string[];
  buttonText: string;
  buttonStyle: "primary" | "secondary" | "highlight";
}

const plans: Plan[] = [
  {
    id: "free",
    name: "STARTER PLAN",
    price: 0,
    currency: "₹",
    period: "/month",
    duration: "Forever free",
    description: "Get started with a free trial of our services",
    badge: "●",
    features: [
      "3 Resume templates",
      "Basic profile creation",
      "Interview preparation basics",
      "Limited mock interviews",
      "Email support",
      "Community access",
    ],
    buttonText: "Continue for free",
    buttonStyle: "secondary",
  },
  {
    id: "premium",
    name: "PREMIUM PLAN",
    price: 499,
    currency: "₹",
    period: "/month",
    duration: "3 Month access. Cancel Anytime.",
    description: "Unlock premium features for your career growth",
    badge: "◆",
    features: [
      "6 Resume templates",
      "Advanced profile optimization",
      "Unlimited mock interviews",
      "AI-powered interview feedback",
      "Priority email support",
      "LinkedIn optimization tools",
    ],
    buttonText: "Choose Premium",
    buttonStyle: "primary",
  },
  {
    id: "premium-plus",
    name: "PREMIUM+ PLAN",
    price: 1199,
    currency: "₹",
    period: "/month",
    duration: "6 Month access",
    description: "Complete career acceleration package",
    badge: "🔥",
    features: [
      "All 9 Resume templates",
      "Full profile customization",
      "Unlimited everything",
      "1-on-1 career coaching",
      "24/7 priority support",
      "Career guidance sessions",
    ],
    buttonText: "Choose Premium+",
    buttonStyle: "highlight",
  },
];

type PremiumProps = {
  modal?: boolean;
  onClose?: () => void;
};

export default function Premium({ modal = false, onClose }: PremiumProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUserInfo(parsed);
      } catch {
        setUserInfo(null);
      }
    }
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      // Free plan doesn't require payment, just navigate back
      navigate("/dashboard");
      return;
    }

    if (!userInfo) {
      navigate("/login");
      return;
    }

    setLoading(planId);

    try {
      const userId = userInfo.user_id || userInfo.id || userInfo.userId;
      const token = userInfo.token || localStorage.getItem("token");

      if (!userId || !token) {
        navigate("/login");
        return;
      }

      // Call subscription service to create/update subscription
      const planType = planId === "premium" ? "premium" : "premium_plus";
      const durationMonths = planId === "premium" ? 3 : 6;

      // If we were navigated from TemplateSelection with pendingTemplates, include them in subscription creation
      const params = new URLSearchParams(location.search);
      const pending = params.get("pendingTemplates");
      let pendingArr: number[] | undefined = undefined;
      if (pending) {
        try {
          const parsedPending = JSON.parse(pending);
          if (Array.isArray(parsedPending)) {
            pendingArr = parsedPending.map(Number).filter((n) => !Number.isNaN(n));
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      const subscription = await subscriptionService.subscribeUser(
        userId,
        planType,
        durationMonths,
        token,
        pendingArr
      );

      if (subscription && subscription.id) {
        // Update localStorage with new subscription
        const updatedUser = {
          ...userInfo,
          subscription_id: subscription.id,
          plan_type: planType,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // If rendered as a modal, close the modal first so it doesn't stay on top
        if (modal && onClose) {
          try { onClose(); } catch (e) { /* ignore */ }
        }

        // Navigate to templates or dashboard
        // After subscribing, send user to template selection so they can pick paid extras
        // Preserve any pendingTemplates that were passed in (so they are auto-saved)
        const params = new URLSearchParams(location.search);
        const pending = params.get("pendingTemplates");
        let path = `/template-selection?selectTemplates=true&plan=${planType}`;
        if (pending) {
          path += `&pendingTemplates=${encodeURIComponent(pending)}`;
        }
        navigate(path);
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.message || "Failed to process subscription");
    } finally {
      setLoading(null);
    }
  };

  // If rendered as a modal, return compact panel without the DashNav/layout
  const content = (
    <div className="w-full max-w-4xl">
      {/* If coming from template selection after save, show confirmation */}
      {new URLSearchParams(location.search).get("saved") && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">
          Templates saved successfully. Continue to choose your plan.
        </div>
      )}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">SELECT A PLAN</h1>
        <p className="text-gray-600 text-sm">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl overflow-hidden transition-all ${
              plan.buttonStyle === "highlight"
                ? "md:scale-105 ring-2 ring-orange-400 shadow-2xl"
                : "shadow-lg hover:shadow-xl"
            } bg-white`}
          >
            {plan.buttonStyle === "highlight" && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">MOST POPULAR</div>
            )}

            <div className="p-6 md:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{plan.badge}</span>
                  <span className="text-sm font-semibold text-gray-600">{plan.name}</span>
                </div>

                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{plan.price === 0 ? "FREE" : plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-gray-600">{plan.period}</span>}
                </div>

                <p className="text-sm text-gray-600 mb-3">{plan.duration}</p>
                <p className="text-xs text-gray-500 mb-6">{plan.description}</p>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading !== null && loading !== plan.id}
                className={`w-full py-3 rounded-lg font-semibold text-sm mb-8 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  plan.buttonStyle === "primary" || plan.buttonStyle === "highlight"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {loading === plan.id && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {!loading || loading !== plan.id ? plan.buttonText : "Processing..."}
              </button>

              {plan.id !== 'free' && (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      // If this Premium is rendered as a modal, close it first
                      if (modal && onClose) {
                        try { onClose(); } catch (e) { /* ignore */ }
                      }
                      navigate(`/template-selection?selectTemplates=true&plan=${plan.id}`);
                    }}
                    className="w-full py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    Customize templates
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">No credit card required for free plan. <span className="text-orange-500 font-semibold">Cancel your subscription anytime.</span></p>
      </div>
    </div>
  );

  if (modal) {
    return (
      <div className="relative">
        <button onClick={() => onClose && onClose()} className="absolute top-2 right-2 p-2 rounded-full bg-white text-gray-700 z-50">
          <X size={18} />
        </button>
        <div className="bg-white rounded-lg p-6 shadow-2xl">{content}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-['Baloo_2']">
      <DashNav heading="Select a Plan" />
      <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center p-4 md:p-8">{content}</div>
    </div>
  );
}
