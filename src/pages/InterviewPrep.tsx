import { useState, useEffect, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import DashNav from "@/components/dashnav/dashnav";
import { useNavigate } from "react-router-dom";
import { 
    getInterviewSlotsByUserId, 
    cancelInterviewSlot,
    getCompletedInterviewsCount,
} from "@/services/interviewPrepService";

const InterviewPrep = () => {
    const navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.user_id;
    const token = userData?.token;
    
    const [allSlots, setAllSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedCount, setCompletedCount] = useState(0);

    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [slotToCancel, setSlotToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const handlePayNow = (slotId) => {
        navigate(`/interview-prep/pay/${slotId}`);
    };


    const formatDateTime = (utcTime) => {
        if (!utcTime) return { date: "N/A", time: "N/A" };
        
        try {
            const dateObj = new Date(utcTime);
            const date = dateObj.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).replace(',', ''); 

            const startTime = dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            const time = `${startTime}`;
            
            return { date, time };
        } catch (e) {
            return { date: "Invalid Date", time: "Invalid Time" };
        }
    };

    const fetchInterviewSlots = useCallback(async () => {
        if (!userId || !token) {
            setError("User data or token missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await getInterviewSlotsByUserId(userId, token);
            console.log(response);

            const normalizedSlots = (response || []).map(slot => {
                const { date, time } = formatDateTime(slot.start_time_utc);

                const now = new Date();
                const endTime = slot.end_time_utc ? new Date(slot.end_time_utc) : (slot.start_time_utc ? new Date(slot.start_time_utc) : null);
                const isExpired = endTime ? endTime < now : false;
                const serverStatus = slot.interview_status || '';
                const pastStatuses = ['cancelled', 'completed', 'expired'];
                const computedStatus = isExpired && !pastStatuses.includes(serverStatus) ? 'expired' : serverStatus;

                return {
                    ...slot,
                    id: slot.interview_slot_id,
                    status: computedStatus,
                    raw_status: slot.interview_status,
                    date: date,
                    end_time_utc: slot.end_time_utc,
                    time: time,
                    type: "Mock Interview",
                    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
                    completedDate: date,
                };
            });
            
            setAllSlots(normalizedSlots);
                // fetch completed interviews count for the stats card
                try {
                    const cnt = await getCompletedInterviewsCount(userId, token);
                    setCompletedCount(cnt?.completed_interviews ?? 0);
                } catch (e) {
                    console.warn('Failed to fetch completed interviews count', e);
                }
        } catch (err) {
            console.error("Failed to fetch interview slots:", err);
            setError("Failed to load interview data.");
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchInterviewSlots();
    }, [fetchInterviewSlots]);

    const PAST_STATUSES = ['cancelled', 'completed', 'expired'];

    const upcomingInterviews = allSlots.filter(slot => !PAST_STATUSES.includes(slot.status));
    const pastInterviews = allSlots.filter(slot => PAST_STATUSES.includes(slot.status));

    const displayedUpcoming = showAllUpcoming
        ? upcomingInterviews
        : upcomingInterviews.slice(0, 4);
    const displayedPast = pastInterviews.slice().sort((a, b) => {
        const aDate = new Date(a.end_time_utc ?? a.start_time_utc ?? a.completedDate);
        const bDate = new Date(b.end_time_utc ?? b.start_time_utc ?? b.completedDate);
        return bDate.getTime() - aDate.getTime(); // most recent first
    });
        
    const openCancelModal = (slot) => {
        setSlotToCancel(slot);
        setShowCancelModal(true);
    };

    const closeCancelModal = () => {
        if (cancelling) return;
        setShowCancelModal(false);
        setSlotToCancel(null);
    };

    const handleCancel = async () => {
        if (!userId || !token || !slotToCancel) {
            closeCancelModal();
            return;
        }

        try {
            setCancelling(true);
            const slotId = slotToCancel.id || slotToCancel.interview_slot_id;
            await cancelInterviewSlot(userId, token, slotId);
            closeCancelModal();
            await fetchInterviewSlots();
            try {
                window.dispatchEvent(new CustomEvent('credits:refresh', { detail: { reason: 'cancel_interview' } }));
            } catch (e) {
            }
        } catch (error) {
            console.error("Cancellation failed:", error);
            alert("Failed to cancel the interview slot.");
        } finally {
            setCancelling(false);
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/interview-prep/interview-details/${id}`);
    };

    const getStatusBadge = (status) => {
        let classes = "px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap uppercase";
        let text = status;

        switch (status) {
            case 'confirmed':
            case 'open':
                classes += " bg-green-100 text-green-700";
                break;
            case 'waiting':
                classes += " bg-[#FFF4E6] text-[#FF9D48]";
                text = "Pending";
                break;
            case 'cancelled':
                classes += " bg-red-100 text-red-700";
                break;
            case 'expired':
                classes += " bg-gray-100 text-gray-700";
                break;
            case 'completed':
                classes += " bg-blue-100 text-blue-700";
                break;
            default:
                classes += " bg-gray-200 text-gray-800";
                break;
        }
        return <span className={classes}>{text}</span>;
    };
    
    const renderUpcomingCardButtons = (interview) => {
        const { is_payment_done, status, id, start_time_utc, end_time_utc } = interview;

        const now = new Date();
        const startTime = start_time_utc ? new Date(start_time_utc) : null;
        const endTime = end_time_utc ? new Date(end_time_utc) : (start_time_utc ? new Date(start_time_utc) : null);
        const hasEnded = endTime ? (endTime < now) : false;
        const hasStarted = startTime ? (now >= startTime && !hasEnded) : false;

        if (is_payment_done === false) {
        return (
            <div className="w-full flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                    onClick={() => handlePayNow(id)}
                    className="w-full sm:w-auto px-4 py-2 rounded-md text-sm font-semibold text-white cursor-pointer"
                    style={{
                        background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)"
                    }}
                >
                    Pay
                </button>
                {!hasEnded && (
                    <button
                        onClick={() => openCancelModal(interview)}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-[#FFD4D4] text-[#FF6B6B] rounded-md text-sm font-medium hover:bg-red-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
            </div>
        );
    }

        if (is_payment_done === true && status === "open") {
            return (
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="px-4 py-2 bg-[#FFF4E6] text-[#FF9D48] rounded-md text-sm font-medium text-center sm:text-left">
                        Waiting for confirmation
                    </div>

                    {!hasEnded && (
                        <button
                            onClick={() => openCancelModal(interview)}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-[#FFD4D4] text-[#FF6B6B] rounded-md text-sm font-medium hover:bg-red-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            );
        }


        if (is_payment_done === true && status === "confirmed") {
            return (
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {hasStarted && (
                            <button
                                onClick={() => handleViewDetails(id)}
                                className="w-full sm:w-auto px-4 py-2 bg-[#4ADE80] text-white rounded-md text-sm font-medium hover:bg-green-500 cursor-pointer"
                            >
                                Join Now
                            </button>
                        )}

                        <button
                            onClick={() => handleViewDetails(id)}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-[#E5E5E5] text-[#3A3A3A] rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer"
                        >
                            View Details
                        </button>
                    </div>

                    {!hasEnded && (
                        <button
                            onClick={() => openCancelModal(interview)}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-[#FFD4D4] text-[#FF6B6B] rounded-md text-sm font-medium hover:bg-red-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            );
        }
        return (
            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="w-full sm:w-auto">
                    {getStatusBadge(status)}
                </div>

                {!hasEnded && (
                    <button
                        onClick={() => openCancelModal(interview)}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-[#FFD4D4] text-[#FF6B6B] rounded-md text-sm font-medium hover:bg-red-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
            </div>
        );

    };

    const EmptyState = () => (
        <div className="flex-1 flex items-center justify-center bg-[#F0F0F0] px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center w-full max-w-5xl">
                <h1 className="text-center mb-4 sm:mb-6 md:mb-10 px-2">
                    <span className="text-[#3A3A3A] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal inline">
                        Turn Interviews Into{" "}
                    </span>
                    <span className="text-[#FF8351] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal underline decoration-[#FF8351] decoration-2 underline-offset-4 inline">
                        Opportunities
                    </span>
                </h1>

                <p className="text-[#3A3A3A] text-sm sm:text-base md:text-lg lg:text-xl text-center mb-6 sm:mb-8 md:mb-10 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-2 leading-relaxed">
                    Practice with AI-driven mock interviews, personalized to your resume
                    and career goals.
                </p>

                <button
                    onClick={() => navigate("/interview-prep/select")}
                    className="flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-white font-semibold text-sm sm:text-base transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    style={{
                        background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                    }}
                >
                    Get Started
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
            </div>
        </div>
    );

    const DashboardWithData = () => (
        <div className="flex-1 overflow-auto bg-[#F0F0F0] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-[#3A3A3A] text-lg font-semibold">
                                    Upcoming Interview(s)
                                </h2>
                                <button
                                    onClick={() => navigate("/interview-prep/select")}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer"
                                    style={{
                                        background:
                                            "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                                    }}
                                >
                                    + New Interview
                                </button>
                            </div>

                            <div className="space-y-3">
                                {displayedUpcoming.length > 0 ? (
                                    displayedUpcoming.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="flex gap-3 p-3 bg-white border border-[#E5E5E5] rounded-xl"
                                        >
                                            <img
                                                src={interview.image || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"}
                                                alt={interview.job_role || interview.type || "Mock Interview"}
                                                className="w-36 h-32 object-cover rounded-lg flex-shrink-0"
                                            />

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-[#3A3A3A] font-semibold text-base mb-1">
                                                        {interview.job_role || interview.type || "Mock Interview"}
                                                    </h3>
                                                    <p className="text-[#7F7F7F] text-sm mb-3">
                                                        Booked for {interview.date || "N/A"}, {interview.time || "N/A"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    {renderUpcomingCardButtons(interview)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-[#7F7F7F] py-4">No upcoming interviews scheduled.</p>
                                )}
                            </div>

                            {upcomingInterviews.length > 4 && (
                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                                        className="text-[#FF8351] text-sm hover:underline"
                                    >
                                        {showAllUpcoming ? "show less" : "see all"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-5">
                            <h2 className="text-[#3A3A3A] text-lg font-semibold mb-4">
                                Interview(s) given till now
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 justify-items-stretch">
                                {[
                                    {
                                        icon: "👥",
                                        count: "Mock Sessions",
                                        label: `${completedCount} sessions`,
                                        bg: "bg-[#EDE7F6]",
                                        iconBg: "bg-[#D1C4E9]",
                                    },
                                    {
                                        icon: "🎥",
                                        count: "Video Practice",
                                        label: "7 sessions",
                                        bg: "bg-[#E3F2FD]",
                                        iconBg: "bg-[#BBDEFB]",
                                    },
                                    {
                                        icon: "📄",
                                        count: "Transcript",
                                        label: "3 sessions",
                                        bg: "bg-[#FFEBEE]",
                                        iconBg: "bg-[#FFCDD2]",
                                    },
                                    {
                                        icon: "💼",
                                        count: "Job Role",
                                        label: "4 sessions",
                                        bg: "bg-[#FFF9C4]",
                                        iconBg: "bg-[#FFF59D]",
                                    },
                                ].map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className={`${stat.bg} rounded-xl p-3 flex flex-col items-center justify-center min-h-[100px] w-full`}
                                    >
                                        <div
                                            className={`w-10 h-10 ${stat.iconBg} rounded-full flex items-center justify-center text-xl mb-2`}
                                        >
                                            {stat.icon}
                                        </div>
                                        <p className="text-sm font-bold text-[#3A3A3A] mb-0.5">
                                            {stat.count}
                                        </p>
                                        <p className="text-[10px] text-[#7F7F7F] text-center">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#FF9D48] to-[#FF8251] rounded-2xl p-6 text-white">
                            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">
                                OFFLINE COURSES
                            </h3>
                            <p className="text-base mb-4 font-medium">
                                Sharpen Your Professional Skill from Offline Courses at NammaQA
                            </p>
                            <button className="px-5 py-2 bg-white text-[#3A3A3A] rounded-lg text-sm font-semibold hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                                Check it Out
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-5">
                            <h2 className="text-[#3A3A3A] text-lg font-semibold mb-4">
                                Past Performance
                            </h2>

                            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
                                {displayedPast.length > 0 ? (
                                    displayedPast.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden"
                                        >
                                            <img
                                                src={interview.image || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"}
                                                alt={interview.job_role || interview.type || "Mock Interview"}
                                                className="w-full h-28 object-cover"
                                            />
                                            <div className="p-3">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-[#3A3A3A] font-semibold text-sm">
                                                        {interview.job_role || interview.type || "Mock Interview"}
                                                    </h3>
                                                    {getStatusBadge(interview.status)}
                                                </div>
                                                <p className="text-[#7F7F7F] text-xs mb-3">
                                                    Completed on {interview.completedDate || "N/A"}
                                                </p>

                                                {(interview.status !== 'cancelled' && interview.status !== 'expired') && (
                                                    <button className="w-full py-2 bg-white border border-[#FF9D48] text-[#FF9D48] rounded-lg text-xs font-semibold hover:bg-orange-50 cursor-pointer">
                                                        Review Feedback
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-[#7F7F7F] py-2 text-sm">No completed interviews yet.</p>
                                )}
                            </div>

                            {/* Removed see all / show less toggle — Past Performance is scrollable */}
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );

    // Confirmation modal for cancelling an interview
    const CancelModal = () => {
        if (!showCancelModal || !slotToCancel) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => closeCancelModal()}
                />

                <div className="relative bg-white rounded-xl w-[min(600px,90%)] p-6 shadow-lg">
                    <button
                        onClick={() => closeCancelModal()}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        aria-label="Close"
                        disabled={cancelling}
                    >
                        ✕
                    </button>

                    <div className="flex flex-col items-center text-center pt-2">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-yellow-50 border-4 border-yellow-300 mb-4">
                            <span className="text-3xl">!</span>
                        </div>

                        <h3 className="text-lg font-medium text-[#3A3A3A] mb-3">
                            Are you sure you want to cancel this
                            <span className="block font-semibold">Mock Interview?</span>
                        </h3>

                        <p className="text-sm text-[#7F7F7F] mb-6">This action cannot be undone.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => closeCancelModal()}
                                className="px-5 py-2 bg-white border border-[#FF9D48] text-[#FF9D48] rounded-lg text-sm font-semibold hover:bg-orange-50"
                                disabled={cancelling}
                            >
                                Go Back
                            </button>

                            <button
                                onClick={() => handleCancel()}
                                className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)' }}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Interview'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen font-['Baloo_2']">
                <DashNav heading="Interview Preparation" />
                <div className="flex-1 flex items-center justify-center bg-[#F0F0F0]">
                    <p className="text-[#7F7F7F] text-xl">Loading interview data...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col h-screen font-['Baloo_2']">
                <DashNav heading="Interview Preparation" />
                <div className="flex-1 flex items-center justify-center bg-[#F0F0F0]">
                    <p className="text-red-500 text-xl">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-['Baloo_2']">
            <DashNav heading="Interview Preparation" />

            {allSlots.length === 0 ? <EmptyState /> : <DashboardWithData />}

            {showCancelModal && <CancelModal />}
        </div>
    );
};

export default InterviewPrep;