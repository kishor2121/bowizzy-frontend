import React, { useState } from "react";
import DashNav from "@/components/dashnav/dashnav";
import { RotateCcw, Volume2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InterviewQuestion: React.FC = () => {
    const navigate = useNavigate();

    const questions: string[] = [
        "Tell me about yourself.",
        "What are your strengths?",
        "Describe a challenging situation you handled.",
        "Why should we hire you?",
        "Where do you see yourself in 5 years?"
    ];

    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            navigate("/interview-prep/video-practice/complete");
        }
    };

    const handleSkip = () => {
        handleNext();
    };

    const handleRestart = () => {
        setCurrentIndex(0);
    };

    return (
        <div className="flex flex-col h-screen font-['Baloo_2'] bg-[#F0F0F0] overflow-hidden">

            {/* FIXED HEADER */}
            <div className="flex-none bg-white shadow">
                <DashNav heading="Video Interview Practice" />
            </div>

            {/* PAGE BODY */}
            <div className="flex-1 flex justify-center items-center px-3 sm:px-4">

                {/* ⭐ RESPONSIVE CARD WITH SCROLL */}
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col overflow-y-auto pb-6">

                    {/* TOP SECTION */}
                    <div className="flex items-start gap-3 sm:gap-4 border-b pb-3 sm:pb-4 flex-none">
                        <img
                            src="https://randomuser.me/api/portraits/men/32.jpg"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-md object-cover"
                            alt="Interviewer"
                        />

                        <div className="flex-1">
                            <p className="text-[10px] sm:text-xs text-gray-500 tracking-wide">
                                QUESTION {currentIndex + 1} of {questions.length}
                            </p>

                            <p className="text-gray-800 font-medium text-[12px] sm:text-[14px] leading-snug mt-1">
                                {questions[currentIndex]}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 text-gray-700">
                            <RotateCcw size={18} className="cursor-pointer" onClick={handleRestart} />
                            <Volume2 size={18} className="cursor-pointer" />
                            <Info size={18} className="cursor-pointer" />
                        </div>
                    </div>

                    {/* COUNTDOWN BOX */}
                    <div className="flex justify-center py-6 sm:py-10 mt-2 sm:mt-4">
                        <div
                            className="
                                w-full max-w-xs sm:max-w-md md:max-w-lg
                                h-36 sm:h-48 md:h-60
                                rounded-2xl flex items-center justify-center
                                text-white text-5xl sm:text-6xl md:text-6xl font-semibold
                            "
                            style={{
                                background: "linear-gradient(90deg, #5A0FF0 0%, #7A2CF7 100%)",
                            }}
                        >
                            5
                        </div>
                    </div>

                    {/* BOTTOM SECTION */}
                    <div className="flex flex-col gap-3 sm:gap-4 mt-auto">

                        <div className="flex justify-end">
                            <button
                                onClick={handleRestart}
                                className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 text-[10px] sm:text-xs shadow-sm"
                            >
                                Restart Question
                            </button>
                        </div>

                        <div className="border-t"></div>

                        {/* ⭐ FIXED RESPONSIVENESS — RIGHT ALIGNED ALWAYS */}
                        <div className="
                            flex 
                            justify-between 
                            items-center 
                            mt-2
                        ">

                            {/* Left side */}
                            <button className="text-red-600 font-semibold text-[10px] sm:text-xs">
                                Leave Interview
                            </button>

                            {/* Right side — stays right on all screens */}
                            <div className="
                                flex 
                                items-center 
                                gap-3 
                                sm:gap-4
                                justify-end
                            ">
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-700 text-[10px] sm:text-xs font-medium"
                                >
                                    Skip Question
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="px-4 sm:px-6 py-2 rounded-md text-white text-[10px] sm:text-xs font-semibold shadow-md"
                                    style={{
                                        background:
                                            "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                                    }}
                                >
                                    {currentIndex === questions.length - 1 ? "Done" : "Next Question"}
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InterviewQuestion;
