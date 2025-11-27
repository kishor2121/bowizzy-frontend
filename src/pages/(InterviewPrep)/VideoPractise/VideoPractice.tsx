import React, { useRef, useState } from "react";
import DashNav from "@/components/dashnav/dashnav";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VideoPractice = () => {
    const [selectedResume, setSelectedResume] = useState<number>(0);
    const [level, setLevel] = useState<string>("");

    const sliderRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const resumes = [
        { id: 1, title: "Aarav-Mehta-Python-Developer-1" },
        { id: 2, title: "Aarav-Mehta-Python-Developer-2" },
        { id: 3, title: "Aarav-Mehta-Python-Developer-3" },
        { id: 4, title: "Aarav-Mehta-Python-Developer-4" },
    ];

    const scrollLeft = () => {
        sliderRef.current?.scrollBy({ left: -220, behavior: "smooth" });
    };

    const scrollRight = () => {
        sliderRef.current?.scrollBy({ left: 220, behavior: "smooth" });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) alert("Uploaded: " + file.name);
    };

    const handleStartPractice = () => {
        if (!level) return;

        // ⭐ FIXED NAVIGATION
        navigate("/interview-prep/video-practice/steps");
    };

    return (
        <div className="flex flex-col h-screen font-['Baloo_2'] overflow-y-auto">
            <DashNav heading="Video Interview Practice" />

            <div className="flex-1 bg-[#F0F0F0] px-4 sm:px-6 py-4 overflow-y-auto">
                <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-10">

                    {/* ================= TOP SECTION ================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-md overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=1200"
                                alt="Interview Practice"
                                className="w-full h-64 sm:h-80 lg:h-full object-cover rounded-md"
                            />
                        </div>

                        <div className="bg-white p-6 rounded-md shadow-sm">
                            <h2 className="text-[#FF8251] text-xl sm:text-2xl font-semibold mb-3">
                                Video Interview Practice
                            </h2>

                            <p className="text-[#3A3A3A] text-sm leading-relaxed mb-2">
                                Prepare for interviews with realistic video practice sessions designed
                                to mirror real interview environments.
                            </p>

                            <p className="text-[#3A3A3A] text-sm leading-relaxed">
                                Build confidence, refine your responses, and improve clarity & tone.
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maiores, perferendis? Magni laudantium debitis, ipsum voluptate ducimus aspernatur dolores quam. Soluta ipsum iusto, ab ex tempore atque quia autem beatae asperiores alias odio ipsam, pariatur dolorem delectus ipsa quas, blanditiis tempora magnam. Officia, eum nisi eos laborum possimus nobis dolor, quisquam deleniti, in placeat consequatur nemo molestias voluptates omnis vitae alias voluptas. Est voluptatum beatae commodi soluta fugiat fugit vel distinctio pariatur similique, quisquam, maiores totam consequatur earum unde quaerat ea incidunt expedita animi. Officia, possimus aut! Perferendis ut quibusdam debitis atque dolorem maiores quaerat, asperiores enim ducimus accusamus fugiat delectus!
                            </p>
                        </div>
                    </div>

                    {/* ================= RESUME SECTION ================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div className="col-span-2 bg-white rounded-md p-4 shadow-sm flex flex-col">
                            <h3 className="text-[#3A3A3A] font-semibold mb-3">RESUME</h3>

                            <div className="relative flex items-center justify-center">

                                {/* LEFT ARROW */}
                                <button
                                    onClick={scrollLeft}
                                    className="absolute -left-4 z-50 bg-white p-2 rounded-full shadow hover:scale-105"
                                >
                                    <ArrowLeft size={18} />
                                </button>

                                {/* SLIDER */}
                                <div
                                    ref={sliderRef}
                                    className="flex gap-5 px-12 overflow-x-scroll overflow-y-hidden snap-x snap-mandatory relative"
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                        width: "100%",
                                    }}
                                >
                                    <style>
                                        {`div::-webkit-scrollbar { display:none; }`}
                                    </style>

                                    {resumes.map((res, index) => (
                                        <div
                                            key={res.id}
                                            className={`relative min-w-[180px] max-w-[180px] bg-white border rounded-md p-3 flex flex-col snap-center cursor-pointer transition
                                                ${selectedResume === index
                                                    ? "border-[#FF8251] shadow-md"
                                                    : "border-gray-300"
                                                }`}
                                            onClick={() => setSelectedResume(index)}
                                        >
                                            <div
                                                className={`absolute top-2 right-2 h-4 w-4 rounded-full border bg-white
                                                    ${selectedResume === index
                                                        ? "border-[#FF8251] bg-[#FF8251]"
                                                        : "border-gray-300"
                                                    }`}
                                            />

                                            <div className="h-40 bg-gray-100 rounded mb-2 relative overflow-hidden">
                                                <div className="absolute w-full h-full backdrop-blur-sm bg-white/40"></div>
                                            </div>

                                            <p className="text-xs font-medium text-[#3A3A3A] blur-[2px] text-center">
                                                {res.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* RIGHT ARROW */}
                                <button
                                    onClick={scrollRight}
                                    className="absolute -right-4 z-50 bg-white p-2 rounded-full shadow hover:scale-105"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* RIGHT SECTION */}
                        <div className="bg-white rounded-md p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-3">
                                Your resumes are taken from “My Resumes”.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border border-gray-300 rounded-md p-3 text-center cursor-pointer hover:shadow-md"
                                >
                                    Upload Resume
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx"
                                />

                                <div className="text-center text-gray-500 text-xs">OR</div>

                                <div className="border border-gray-300 rounded-md p-3 text-center cursor-pointer hover:shadow-md">
                                    Create Resume in Bowizzy
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= LEVEL SECTION ================= */}
                    <div className="bg-white rounded-md p-6 shadow-sm">
                        <h3 className="text-[#3A3A3A] font-semibold mb-4">INTERVIEW LEVEL</h3>

                        <div className="grid grid-cols-3 gap-4">
                            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setLevel(lvl)}
                                    className={`py-3 rounded-md text-sm font-semibold border transition
                                        ${level === lvl
                                            ? "bg-[#FF8251] text-white border-[#FF8251]"
                                            : "bg-white text-[#3A3A3A] border-gray-300 hover:bg-gray-100"
                                        }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* START BUTTON */}
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={handleStartPractice}
                            disabled={!level}
                            className="px-10 py-3 w-full sm:w-60 rounded-md text-white font-semibold transition-transform hover:scale-105 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                            }}
                        >
                            Start Practice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPractice;
