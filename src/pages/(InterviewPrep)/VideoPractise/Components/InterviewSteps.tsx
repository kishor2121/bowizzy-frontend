// import React from "react";
import DashNav from "@/components/dashnav/dashnav";

const steps = [
    "Parsing Resume",
    "Identifying Job Title",
    "Identifying About",
    "Identifying Experience",
    "Identifying Education",
    "Identifying Project(s)",
    "Identifying Certificate(s)",
    "Setting up interview questions",
];

const InterviewSteps = () => {
    return (
        <div className="flex flex-col h-screen font-['Baloo_2'] bg-[#F0F0F0] overflow-y-auto">
            <DashNav heading="Video Interview Practice" />

            <div className="max-w-5xl mx-auto bg-white mt-20 p-10 rounded-xl shadow-sm">

                {/* STRAIGHT COLUMN - NO ARROWS, NO SCROLL */}
                <div className="flex flex-col gap-6">

                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3"
                        >
                            <div className="w-4 h-4 rounded-full border border-gray-500"></div>

                            {/* Text now allowed to wrap normally */}
                            <p className="text-[15px] text-gray-700">
                                {step}
                            </p>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
};

export default InterviewSteps;
