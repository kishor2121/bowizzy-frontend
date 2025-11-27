import DashNav from "@/components/dashnav/dashnav";
import { useEffect, useState } from "react";
import { getProfileProgress } from "@/services/dashboardServices";
import {
  Users,
  Video,
  FileText,
  File,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [profileProgress, setProfileProgress] = useState({
    percentage: 0,
    message: "",
  });
  const gradientColor = "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)";
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    const userId = userData?.user_id;
    const token = userData?.token;

    // console.log("User ID:", userId);
    // console.log("Token:", token);
    getProfileProgress(userId, token).then((res) => {
      setProfileProgress({
        percentage: res.percentage,
        message: res.pendingSectionsList.join(", "),
      });
    });
  }, []);

  const dashboardData = {
    upcomingInterview: {
      title: "Mock Interview",
      date: "August 22nd 2025, 10:00 AM - 11:00 AM",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
    },
    prepSmarter: [
      {
        icon: Users,
        label: "Mock Sessions",
        color: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        icon: Video,
        label: "Video Practice",
        color: "bg-red-100",
        iconColor: "text-red-600",
      },
      {
        icon: FileText,
        label: "Transcript",
        color: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: File,
        label: "Resume",
        color: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        icon: Briefcase,
        label: "Job Role",
        color: "bg-orange-100",
        iconColor: "text-orange-600",
      },
    ],
    linkedInScore: 45,
    resumes: [],
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DashNav heading={"Welcome to BoWizzy"} />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                Profile Progress
              </h2>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#f3f4f6"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        56 *
                        (1 - profileProgress.percentage / 100)
                      }`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#FF9D48" />
                        <stop offset="100%" stopColor="#FF8251" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: "#FF8251" }}
                    >
                      {profileProgress.percentage}%
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      Complete
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-3">
                  {profileProgress.message ||
                    "Complete your profile to improve score"}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="mt-3 px-4 py-1.5 rounded-lg text-white text-sm font-medium shadow-sm cursor-pointer"
                  style={{ background: gradientColor }}
                >
                  Complete Profile
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide">
                    Upcoming Interview
                  </h2>
                  <button className="text-xs" style={{ color: "#FF8251" }}>
                    View All
                  </button>
                </div>
                <div className="flex gap-3">
                  <img
                    src={dashboardData.upcomingInterview.image}
                    alt="Interview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      {dashboardData.upcomingInterview.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {dashboardData.upcomingInterview.date}
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded text-xs text-white font-medium"
                        style={{ background: gradientColor }}
                      >
                        View Details
                      </button>
                      <button className="px-3 py-1 rounded text-xs border border-gray-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                  Prep Smarter
                </h2>
                <div className="grid grid-cols-5 gap-2">
                  {dashboardData.prepSmarter.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}
                        >
                          <Icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <span className="text-xs text-center text-gray-700">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                Career Insights
              </h2>
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-center text-sm text-gray-700 mb-3">
                  Get expert tips, growth strategies, and domain guidance
                  tailored to your career path.
                </p>
                <button
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border"
                  style={{ color: "#FF8251", borderColor: "#FF8251" }}
                >
                  Explore
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                Boost Your LinkedIn Presence
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#f3f4f6"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="url(#gradient2)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        32 *
                        (1 - dashboardData.linkedInScore / 100)
                      }`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient2"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#FF9D48" />
                        <stop offset="100%" stopColor="#FF8251" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xl font-bold"
                      style={{ color: "#FF8251" }}
                    >
                      {dashboardData.linkedInScore}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">
                    Your score: {dashboardData.linkedInScore}/100.
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Optimize to attract recruiters.
                  </p>
                  <button
                    className="px-4 py-1.5 rounded-lg text-white text-sm font-medium"
                    style={{ background: gradientColor }}
                  >
                    Optimize Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                Resume at a Glance
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {dashboardData.resumes.length > 0 ? (
                  dashboardData.resumes.map((resume, index) => (
                    <div
                      key={index}
                      className="aspect-[8.5/11] bg-gray-100 rounded shadow-sm overflow-hidden"
                    >
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {[1, 2, 3, 4].map((_, index) => (
                      <div
                        key={index}
                        className="aspect-[8.5/11] bg-gray-100 rounded shadow-sm flex items-center justify-center"
                      >
                        <FileText className="w-6 h-6 text-gray-300" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                Connect & Grow
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                Join NammaQA's community and upcoming NConnect event. Network,
                learn, and grow.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-1.5 rounded-lg text-white text-sm font-medium"
                  style={{ background: gradientColor }}
                >
                  Join Community
                </button>
                <button className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-300">
                  View Event
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-dashed border-gray-200">
              <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Other Features coming soon...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
