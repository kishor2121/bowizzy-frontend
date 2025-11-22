import React from "react";
import { useNavigate } from "react-router-dom";
import DashNav from "@/components/dashnav/dashnav";

const InterviewComplete: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen font-['Baloo_2'] bg-white">

            {/* FIXED NAV */}
            <div className="flex-none bg-white shadow-sm">
                <DashNav heading="Video Interview Practice" />
            </div>

            {/* FULL PAGE */}
            <div className="flex-1 flex justify-center items-start px-4 pt-10">
                <div className="text-center max-w-xl mt-[-20px] sm:mt-[-2px]">

                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[#FF8251]">
                        Interview Complete
                    </h1>

                    <p className="text-gray-700 text-sm sm:text-base mb-2">
                        Thank you for Interviewing!!
                    </p>

                    <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
                        You’ve completed all the questions for this session.
                        <br />
                        Your responses have been recorded and can be accessed under{" "}
                        <span className="text-[#FF8251] cursor-pointer underline">
                            Past Performances
                        </span>.
                    </p>

                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm shadow"
                        >
                            Go Home
                        </button>

                        <button
                            onClick={() => navigate("/interview-prep/video-practice/review")}
                            className="px-6 py-2 rounded-md text-white text-sm shadow"
                            style={{
                                background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                            }}
                        >
                            Review your Interview
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default InterviewComplete;
