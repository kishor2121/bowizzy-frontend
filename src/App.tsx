import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./components/ui/sidebar";
import Bowizzy from "@/assets/bowizzy.png";
import {
  Box,
  Crown,
  FileArchive,
  LayoutDashboard,
  Linkedin,
  LogOut,
  MessageSquare,
  Phone,
  User,
  Video,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import LinkedInOptimization from "./pages/LinkedInOptimization";
import InterviewPrep from "./pages/InterviewPrep";
import InterviewPrepSelection from "./pages/(InterviewPrep)/InterviewPrepSelection";
import MockInterview from "./pages/(InterviewPrep)/MockInterview";
import GiveMockInterview from "./pages/(InterviewPrep)/GiveMockInterview";
import InterviewDetails from "./pages/(InterviewPrep)/InterviewDetails";
import CandidateInformationConnect from "./pages/(InterviewPrep)/CandidateInformationConnect";
import InterviewerEvaluation from "./pages/(InterviewPrep)/InterviewerEvaluation";
import TakeMockInterview from "./pages/(InterviewPrep)/TakeMockInterview";
import ProfileForm from "./pages/(Profile)/ProfileForms";
import ParsingSteps from "./pages/(Profile)/components/ParsingSteps";
import VideoPractice from "./pages/(InterviewPrep)/VideoPractise/VideoPractice";
import InterviewSteps from "./pages/(InterviewPrep)/VideoPractise/Components/InterviewSteps";
import InterviewQuestion from "./pages/(InterviewPrep)/VideoPractise/Components/InterviewQuestion";
import InterviewComplete from "./pages/(InterviewPrep)/VideoPractise/Components/InterviewComplete";
import InterviewReview from "./pages/(InterviewPrep)/VideoPractise/Components/InterviewReview";
import TemplateSelection from "./pages/(ResumeBuilder)/TemplateSelection";
import ResumeEditor from "./pages/(ResumeBuilder)/ResumeEditor";



// const isAuthenticated = () => {
//   return true;
// };

const isAuthenticated = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return !!parsed?.token;
  } catch {
    return false;
  }
};

// const items = [
//   {
//     title: "Home",
//     url: "/",
//     icon: Home,
//   },
//   {
//     title: "Inbox",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ]

const careerMap = [
  {
    href: "/profile",
    icon: <User color="#3B3B3B" size={16} />,
    label: "Profile",
  },
  {
    href: "/ResumeBuilder",
    icon: <FileArchive color="#3B3B3B" size={16} />,
    label: "My resumes",
  },
  {
    href: "/interview-prep",
    icon: <Video color="#3B3B3B" size={16} />,
    label: "Interview Prep",
  },
  {
    href: "/profile",
    icon: <Phone color="#3B3B3B" size={16} />,
    label: "Career guidance",
  },
  {
    href: "/linkedin-optimization",
    icon: <Linkedin color="#3B3B3B" size={16} />,
    label: "LinkedIn optimization",
  },
];

const bowizzy = [
  {
    href: "/digital-product",
    icon: <Box color="#3B3B3B" size={16} />,
    label: "Digital product",
  },
  {
    href: "/premium",
    icon: <Crown color="#3B3B3B" size={16} />,
    label: "Go premium",
  },
  {
    href: "/feeedback",
    icon: <MessageSquare color="#3B3B3B" size={16} />,
    label: "Feedback",
  },
];

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar className="overflow-y-auto">
        <SidebarHeader>
          <div className="flex items-center justify-center p-6">
            <img src={Bowizzy} alt="Bowizzard Logo" />
          </div>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key={"Dashboard"}>
                <SidebarMenuButton asChild className="p-5 flex items-center">
                  <a href={"/dashboard"}>
                    <LayoutDashboard color="#3B3B3B" size={16} />
                    <span className="ml-4" style={{ fontSize: "14px" }}>
                      Dashboard
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="p-5">Career</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {careerMap.map((item, idx) => (
                <SidebarMenuButton
                  asChild
                  className="p-5 flex items-center"
                  key={item.label + idx}
                >
                  <a href={item.href}>
                    {item.icon}
                    <span className="ml-4" style={{ fontSize: "14px" }}>
                      {item.label}
                    </span>
                  </a>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="p-5">Bowizzy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bowizzy.map((item, idx) => (
                <SidebarMenuButton
                  asChild
                  className="p-5 flex items-center"
                  key={item.label + idx}
                >
                  <a href={item.href}>
                    {item.icon}
                    <span className="ml-4" style={{ fontSize: "14px" }}>
                      {item.label}
                    </span>
                  </a>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto mb-4">
          <SidebarMenuButton
            asChild
            className="p-5 flex items-center border-2 border-[#FF0000]"
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                try {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                } catch {
                  /* ignore */
                }
                window.location.href = "/login";
                window.location.reload();
              }}
            >
              <LogOut color="#FF0000" size={16} />
              <span
                className="ml-4"
                style={{ fontSize: "14px", color: "#FF0000" }}
              >
                Logout
              </span>
            </a>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <main className="bg-[#F0F0F0] min-h-screen flex-1">{children}</main>
    </SidebarProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}



function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: () => <Navigate to="/login" />,   // Redirect to login
    },
    {
      path: "login",
      Component: () => <Login />,                  // ⬅ LOGIN ROUTE ADDED
    },
    {
      path: "signup",
      Component: () => <Register />,
    },
    {
      path: "/",
      Component: () => <Home />,
    },
    {
      path: "dashboard",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <Dashboard />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "profile",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <Profile />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "linkedin-optimization",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <LinkedInOptimization />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "interview-prep",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewPrep />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "interview-prep/select",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewPrepSelection />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },

    {
      path: "interview-prep/mock-interview",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <MockInterview />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },

    // ⭐ VIDEO PRACTICE MAIN PAGE
    {
      path: "interview-prep/video-practice",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <VideoPractice />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },

    // ⭐ NEW: INTERVIEW STEPS PAGE
    {
      path: "interview-prep/video-practice/steps",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewSteps />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },

    // ⭐ QUESTION PAGE
    {
      path: "interview-prep/video-practice/question",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewQuestion />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },

    // ⭐ NEW: INTERVIEW COMPLETE PAGE
    {
      path: "interview-prep/video-practice/complete",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewComplete />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },

    {
      path: "interview-prep/video-practice/review",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewReview />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },


    // OTHER EXISTING ROUTES...
    {
      path: "interview-prep/give-mock-interview",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <GiveMockInterview />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "interview-prep/interview-details",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewDetails />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "interview-prep/candidate-information-connect",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <CandidateInformationConnect />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "interview-prep/interviewer-evaluation",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <InterviewerEvaluation />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "interview-prep/take-mock-interview",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <TakeMockInterview />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "profile/form",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <ProfileForm />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "profile/parsing",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <ParsingSteps />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "ResumeBuilder",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <ResumeBuilder />
          </LayoutWrapper>
        </ProtectedRoute>
      ),
    },
    {
      path: "template-selection",

      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <TemplateSelection />
          </LayoutWrapper>
        </ProtectedRoute>
      )
    },
    {
      path: "resume-editor",
      Component: () => (
        <ProtectedRoute>
          <LayoutWrapper>
            <ResumeEditor />
          </LayoutWrapper>
        </ProtectedRoute>
      )
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
