import React, { useState } from "react";
import DashNav from "@/components/dashnav/dashnav";
import { ChevronDown, Share2, Trash2 } from "lucide-react";

const InterviewReview: React.FC = () => {
    const tabs = Array.from({ length: 10 }, (_, i) => `Question ${i + 1}`);
    const [activeTab, setActiveTab] = useState(0);
    const [openNotes, setOpenNotes] = useState(false);

    return (
        <div className="flex flex-col min-h-screen font-['Baloo_2'] bg-[#F5F5F5]">

            {/* NAV */}
            <div className="bg-white shadow-sm">
                <DashNav heading="Past Performance" />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 px-4 py-6 flex justify-center">

                {/* ⭐ WIDER WHITE AREA */}
                <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl">

                    {/* TOP ROW — TITLE + ICONS */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold mb-1">
                                Video Interview Practice - VIDINP001
                            </h2>
                            <p className="text-gray-500 text-xs">
                                1 day ago • Beginner • 20 mins
                            </p>
                        </div>

                        {/* ⭐ ICONS (BO, SHARE, DELETE) */}
                        <div className="flex items-center gap-3">
                            <button className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold text-xs">
                                BO
                            </button>

                            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <Share2 size={16} className="text-gray-600" />
                            </button>

                            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <Trash2 size={16} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* QUESTION TABS */}
                    <div className="flex flex-wrap gap-3 py-3 mt-4">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap 
                                    ${activeTab === idx
                                        ? "bg-[#FF8251] text-white"
                                        : "bg-gray-100 text-gray-600"
                                    }
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="border-t my-4"></div>

                    {/* QUESTION DETAILS */}
                    <h3 className="text-sm font-semibold mb-2">QUESTION {activeTab + 1}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Question Text: Lorem ipsum dolor sit amet consectetur. Velit aliquet et sed aenean.
                    </p>

                    {/* ANSWER SECTION */}
                    <h4 className="text-xs font-semibold mb-2">YOUR ANSWER</h4>

                    {/* ⭐ EQUAL SIZED BOXES */}
                    <div className="flex gap-4 mb-6">

                        {/* BLUE AUDIO CARD */}
                        <div className="w-1/2 bg-[#5A0FF0] rounded-xl p-6 text-white flex flex-col justify-between min-h-[180px]">
                            <div className="text-center text-xl font-bold">AM</div>
                            <p className="text-center">Aarav Mehta</p>

                            <div className="mt-4 flex items-center justify-between">
                                <button className="p-2">▶</button>
                                <span>05:40</span>
                                <button className="p-2">⟳</button>
                            </div>
                        </div>

                        {/* ⭐ LOCKED FEEDBACK — NOW WITH GRADIENT HOVER */}
                        <div
                            className="
                                w-1/2
                                bg-gray-100
                                rounded-xl
                                p-6
                                flex
                                flex-col
                                justify-center
                                items-center
                                transition-all
                                duration-300
                                cursor-pointer

                                hover:bg-gradient-to-r
                                hover:from-[#FEE0B4]
                                hover:to-[#FF9F73]
                                hover:shadow-md
                            "
                        >
                            <div className="text-orange-500 text-2xl mb-2">🔒</div>
                            <p className="text-xs text-center text-gray-600">
                                Upgrade and unlock AI feedback
                            </p>
                        </div>

                    </div>

                    {/* COLLAPSIBLE NOTES */}
                    <div
                        className="border rounded-lg p-3 cursor-pointer flex justify-between items-center bg-gray-50"
                        onClick={() => setOpenNotes(!openNotes)}
                    >
                        <span className="text-sm font-medium">Notes & Feedback</span>

                        <ChevronDown
                            size={18}
                            className={`transition-transform ${openNotes ? "rotate-180" : ""}`}
                        />
                    </div>

                    {openNotes && (
                        <div className="mt-4 border rounded-lg p-4 bg-white">

                            {/* NOTES */}
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold mb-1">YOUR NOTES</h4>
                                <textarea
                                    className="w-full border p-2 rounded-md text-sm"
                                    rows={3}
                                    placeholder="Write your notes here..."
                                />
                            </div>

                            {/* FEEDBACK */}
                            <div>
                                <h4 className="text-xs font-semibold mb-1">FEEDBACK</h4>
                                <textarea
                                    className="w-full border p-2 rounded-md text-sm"
                                    rows={3}
                                    placeholder="Write feedback here..."
                                />
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default InterviewReview;
