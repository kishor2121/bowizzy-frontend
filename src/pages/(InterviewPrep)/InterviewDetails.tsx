import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, X } from "lucide-react";
import DashNav from "@/components/dashnav/dashnav";
import { useNavigate, useParams } from "react-router-dom";
import { 
    getInterviewSlotById, 
    updateInterviewSlot 
} from "@/services/interviewPrepService";
import { getPersonalDetailsByUserId } from "@/services/personalService";

// ---------- FORMATTERS ----------
const formatDate = (utc) => {
    if (!utc) return "N/A";

    const d = new Date(utc);
    return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).toUpperCase();
};

const formatTime = (utc) => {
    if (!utc) return "N/A";

    return new Date(utc).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

const formatDuration = (ms) => {
    if (!ms || ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// ---------- SIDEBAR ----------
const NoteSidebar = ({ notes }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4 min-h-[720px]">
        <h3 className="text-[#FF8351] text-base md:text-lg font-semibold mb-4">Note</h3>
        <ul className="space-y-3">
            {notes.map((txt, i) => (
                <li key={i} className="text-[#3A3A3A] text-sm md:text-base flex items-start">
                    <span className="font-bold mr-2 text-lg md:text-xl">•</span>
                    <span>{txt}</span>
                </li>
            ))}
        </ul>
    </div>
);

const InterviewDetails = () => {
    const navigate = useNavigate();
    const { id: interviewSlotId } = useParams();

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.user_id;
    const token = user?.token;

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const [data, setData] = useState({
        interview_code: "",
        job_role: "",
        experience: "",
        skills: [],
        start: "",
        end: "",
        resume_url: "",
        interview_status: "",
        candidate_name: "",
        candidate_title: "",
        candidate_company: "",
        candidate_image: ""
    });
    

    const [timerLabel, setTimerLabel] = useState("Starts Soon");
    const [meetingState, setMeetingState] = useState("upcoming");

    // ------- API FETCH -------
    const fetchDetails = useCallback(async () => {
        try {
            const res = await getInterviewSlotById(userId, token, interviewSlotId);
            // First set interview-related fields
            setData(prev => ({
                ...prev,
                interview_code: res.interview_code,
                job_role: res.job_role,
                experience: res.experience,
                skills: res.skills || [],
                start: res.start_time_utc,
                end: res.end_time_utc,
                resume_url: res.resume_url,
                interview_status: res.interview_status ?? ""
            }));

            // Then fetch candidate profile from profile API (personal details)
            try {
                const personal = await getPersonalDetailsByUserId(userId, token);
                if (personal) {
                    const fullName = `${personal.first_name || ''} ${personal.last_name || ''}`.trim();
                    setData(prev => ({
                        ...prev,
                        candidate_name: fullName || prev.candidate_name,
                        candidate_title: personal.designation || personal.title || prev.candidate_title,
                        candidate_company: personal.current_company || personal.company || prev.candidate_company,
                        candidate_image: personal.profile_photo_url || personal.profilePhotoUrl || prev.candidate_image
                    }));
                }
            } catch (pErr) {
                console.warn('Failed to fetch personal details:', pErr);
            }
        } catch (err) {
            console.error("Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [userId, token, interviewSlotId]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    // ------- Countdown Logic -------
    useEffect(() => {
        if (!data.start || !data.end) return;

        const startMs = Date.parse(data.start);
        const endMs = Date.parse(data.end);

        const update = () => {
            const now = Date.now();

            if (now < startMs) {
                const diff = startMs - now;
                setTimerLabel(`Starts in ${formatDuration(diff)}`);
                setMeetingState("upcoming");
            } 
            else if (now >= startMs && now < endMs) {
                setTimerLabel("Join Now");
                setMeetingState("ongoing");
            } 
            else {
                setTimerLabel("Interview Ended");
                setMeetingState("ended");
            }
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [data.start, data.end]);

    // ------- CANCEL INTERVIEW -------
    const handleCancel = async () => {
        setCancelling(true);
        try {
            await updateInterviewSlot(userId, token, interviewSlotId, {
                interview_status: "cancelled"
            });

            setData(prev => ({
                ...prev,
                interview_status: "cancelled"
            }));

            setShowCancelModal(false);
            navigate('/interview-prep');
        } catch (e) {
            console.error("Cancel failed", e);
        } finally {
            setCancelling(false);
        }
    };
    const hideCancelButton =
        data.interview_status === "cancelled" || meetingState === "ended";

    const notes = [
        "The job role and experience for your interview will be based on your profile. To schedule an interview for a different role, please create a new role in your profile section.",
        "Once your payment is complete, your interview request will be forwarded to our professionals, who will conduct the interview according to the available time slots.",
        "You will receive a notification 2 hours before your interview and a reminder 30 minutes prior.",
        "If you cancel the interview 3–4 hours in advance, you are eligible for a 50% refund. Cancellations made within 3 hours of the interview are non-refundable."
    ];

    if (loading) {
        return (
            <div className="flex flex-col h-screen font-['Baloo_2']">
                <DashNav heading="Mock Interview Details" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-lg text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F0F0F0] font-['Baloo_2']">
            <DashNav heading="Mock Interview Details" />

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div className="bg-white w-[420px] rounded-2xl shadow-xl p-10 relative text-center">

                        <button
                            onClick={() => setShowCancelModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={22} />
                        </button>

                        <div className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center shadow-inner relative"
                            style={{
                                background: "radial-gradient(circle, #FFF 45%, #FFEFB8 75%)",
                                border: "4px solid #F5CC46",
                                boxShadow: "0 4px 12px rgba(255, 200, 0, 0.4), inset 0 0 12px rgba(255, 220, 0, 0.6)"
                            }}
                        >
                            <span className="text-4xl text-[#555] font-bold">!</span>
                        </div>

                        <p className="text-gray-700 text-lg leading-relaxed mb-8">
                            Are you sure you want to cancel this <br /> Mock Interview?
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-6 py-2 border border-[#FF8351] text-[#FF8351] font-semibold rounded-xl hover:bg-orange-50 transition"
                            >
                                Go Back
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className={`px-6 py-2 text-white font-semibold rounded-xl ${cancelling ? 'opacity-60 cursor-not-allowed' : ''}`}
                                style={{ background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)" }}
                                aria-busy={cancelling}
                            >
                                {cancelling ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                                        Cancelling...
                                    </>
                                ) : (
                                    'Cancel Interview'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">

                    <div className="flex-1 bg-white p-6 rounded-xl shadow-sm">

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[#FF8351] text-sm md:text-base font-semibold tracking-wide uppercase">
                                    INTERVIEW ID: {data.interview_code}
                                </h2>

                                {meetingState === 'ongoing' && data.interview_status !== 'cancelled' && (
                                    <div className="flex-shrink-0">
                                        <button
                                            // onClick={() => navigate('/interview-prep/candidate-information-connect')}
                                            className={`px-4 py-2 text-white font-semibold rounded-full shadow-sm bg-[#FF9D48] hover:bg-[#ff8e2a]`}
                                        >
                                            Connect Now
                                        </button>
                                    </div>
                                )}
                            </div>

                            {meetingState === 'ongoing' && data.interview_status !== 'cancelled' && (
                                <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {data.candidate_image ? (
                                            <img src={data.candidate_image} alt={data.candidate_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-sm text-gray-400">No Image</div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900">{data.candidate_name || "Candidate Name"}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{data.candidate_title || data.job_role}{data.candidate_company ? ` • ${data.candidate_company}` : ""}</p>
                                        <p className="text-sm text-gray-600 mt-1">Experience: {data.experience}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {meetingState === "ongoing" ? (
                            <div className="mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{data.job_role || 'Role'}</h1>
                                <p className="text-sm text-gray-700 mb-3">Experience: {data.experience || 'N/A'}</p>

                                <div className="flex items-center justify-between border-b pb-5 mb-6">
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <Calendar size={20} className="text-gray-600" />
                                        <span className="text-lg md:text-xl font-bold text-gray-900">{formatDate(data.start)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <Clock size={20} className="text-gray-600" />
                                        <span className="text-base md:text-lg font-semibold text-gray-900">{formatTime(data.start)} - {formatTime(data.end)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm text-gray-500 font-semibold mb-3">CANDIDATE DETAILS</h3>
                                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                                    {data.job_role}
                                </h1>
                                <p className="text-lg font-medium text-gray-700 mb-6">Experience: {data.experience}</p>
                            </>
                        )}

                        <h3 className="text-sm text-gray-500 font-semibold mb-3">SKILLS TO EVALUATE</h3>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {data.skills.map((skill, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-lg px-5 py-2 text-center text-sm text-gray-700 shadow-sm min-w-[90px]">
                                    {skill}
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm text-gray-500 font-semibold mb-3">RESUME</h3>
                        <div className="bg-[#F8F8F8] border rounded-xl p-6">
                            {data.resume_url && data.resume_url !== "DEFAULT_RESUME_0" ? (
                                <iframe src={data.resume_url} className="w-full h-[850px]" title="Resume" />
                            ) : (
                                <div className="w-full h-[850px] flex items-center justify-center text-gray-500">
                                    No Resume Uploaded
                                </div>
                            )}
                        </div>

                        {/* BUTTON BAR */}
                        <div className="mt-6 flex gap-4">
                            {!hideCancelButton && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="flex-1 py-3 border border-red-300 text-red-500 rounded-lg font-semibold"
                                >
                                    Cancel Interview
                                </button>
                            )}

                            {data.interview_status !== "cancelled" && (
                                <button
                                    onClick={() => {
                                        if (meetingState === "ongoing") {
                                            // navigate('/interview-prep/candidate-information-connect');
                                        }
                                    }}
                                    className="flex-1 py-3 text-white rounded-lg font-semibold flex items-center justify-center cursor-pointer"
                                    style={{ background: "linear-gradient(180deg, #FF9D48, #FF8251)" }}
                                >
                                    {timerLabel}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[320px] flex-shrink-0">
                        <NoteSidebar notes={notes} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InterviewDetails;
