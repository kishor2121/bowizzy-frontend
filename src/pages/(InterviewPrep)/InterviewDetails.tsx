import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Bookmark, X } from "lucide-react";
import DashNav from "@/components/dashnav/dashnav";
import { useNavigate, useParams } from "react-router-dom";
import { 
    getInterviewSlotById, 
    cancelInterviewSlot 
} from "@/services/interviewPrepService";

// Helper function to format the time duration
const formatDuration = (startTimeUtc, endTimeUtc) => {
    if (!startTimeUtc || !endTimeUtc) return "N/A";

    try {
        const start = new Date(startTimeUtc);
        const end = new Date(endTimeUtc);

        const startTime = start.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        const endTime = end.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        return `${startTime} - ${endTime}`;
    } catch (e) {
        return "Invalid Time Range";
    }
};

const formatExp = (expInMonths) => {
    const years = Math.floor(expInMonths / 12);
    const months = expInMonths % 12;
    return { years, months };
};

// Note Sidebar Component
const NoteSidebar = ({ notes }) => {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm sticky top-6">
            <h3 className="text-[#FF8351] text-base font-semibold mb-4">Note</h3>
            <ul className="space-y-4">
                {notes.map((note, idx) => (
                    <li key={idx} className="text-[#3A3A3A] text-sm leading-relaxed">
                        <span className="font-medium">• </span>
                        {note}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InterviewDetails = () => {
    const navigate = useNavigate();
    const { id: interviewSlotId } = useParams();

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.user_id;
    const token = userData?.token;

    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [bookingData, setBookingData] = useState({
        interviewId: '',
        role: 'N/A',
        selectedDate: 'N/A',
        selectedTime: 'N/A',
        yearsExp: 0,
        monthsExp: 0,
        selectedPrimarySkills: [],
        selectedSecondarySkills: [],
        resumeUrl: null,
        resumePages: 1
    });

    const fetchDetails = useCallback(async () => {
        if (!userId || !token || !interviewSlotId) {
            setError("Missing user data, token, or interview slot ID.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getInterviewSlotById(userId, token, interviewSlotId);

            const { years, months } = formatExp(data.experience_in_months || 0);

            const selectedDate = data.start_time_utc 
                ? new Date(data.start_time_utc).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric' 
                }).toUpperCase().replace(',', '')
                : 'N/A';
            
            setBookingData({
                interviewId: `#${data.interview_slot_id}`,
                role: data.job_role || 'General Mock Interview',
                selectedDate: selectedDate,
                selectedTime: formatDuration(data.start_time_utc, data.end_time_utc),
                yearsExp: years,
                monthsExp: months,
                selectedPrimarySkills: data.primary_skills || [],
                selectedSecondarySkills: data.secondary_skills || [],
                resumeUrl: data.resume_url || null, 
                resumePages: 2 // Mocked, as page count is not in API response
            });

        } catch (err) {
            console.error("Failed to fetch interview details:", err);
            setError("Failed to load interview details.");
        } finally {
            setLoading(false);
        }
    }, [userId, token, interviewSlotId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleCancelInterview = async () => {
        try {
            await cancelInterviewSlot(userId, token, interviewSlotId);
            setShowCancelModal(false);
            navigate('/interview-prep');
        } catch (error) {
            console.error("Cancellation failed:", error);
            alert("Failed to cancel the interview slot.");
        }
    };

    const notes = [
        "The job role and experience for your interview will be based on your profile. To schedule an interview for a different role, please create a new role in your profile section.",
        "Once your payment is complete, your interview request will be forwarded to our professionals, who will conduct the interview according to the available time slots.",
        "You will receive a notification 2 hours before your interview and a reminder 30 minutes prior.",
        "If you cancel the interview 3-4 hours in advance, you are eligible for a 50% refund. Cancellations within 3 hours of the interview are non-refundable, as per our policy."
    ];

    if (loading) {
        return (
            <div className="flex flex-col h-screen font-['Baloo_2']">
                <DashNav heading="Mock Interview Details" />
                <div className="flex-1 flex items-center justify-center bg-[#F0F0F0]">
                    <p className="text-[#7F7F7F] text-xl">Loading interview details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-screen font-['Baloo_2']">
                <DashNav heading="Mock Interview Details" />
                <div className="flex-1 flex items-center justify-center bg-[#F0F0F0]">
                    <p className="text-red-500 text-xl">Error: {error}</p>
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-screen bg-[#F0F0F0] font-['Baloo_2']">
            <DashNav heading="Mock Interview Details" />

            <div className="flex-1 overflow-hidden relative">
                {/* Cancel Interview Modal */}
                {showCancelModal && (
                    <>
                        {/* Backdrop overlay */}
                        <div 
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
                            onClick={() => setShowCancelModal(false)}
                        />
                        
                        {/* Modal Container */}
                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col bg-white rounded-[20px] w-[502px] h-[502px] shadow-2xl pointer-events-auto">
                                {/* Close button with circle */}
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="self-end mt-5 mr-5 w-8 h-8 rounded-full border-2 border-[#333333] flex items-center justify-center text-[#333333] hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>

                                {/* Content */}
                                <div className="flex flex-col items-center flex-1 justify-between pb-10">
                                    <div className="flex flex-col items-center">
                                        {/* Warning Icon */}
                                        <div className="w-[151px] h-[151px] mb-[62px] flex items-center justify-center">
                                            <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center relative"
                                                style={{
                                                    background: 'linear-gradient(180deg, #FDB854 0%, #F9A825 100%)',
                                                    border: '8px solid #E8E8E8'
                                                }}
                                            >
                                                <span className="text-[#666666] text-7xl font-bold leading-none pb-3" style={{ fontFamily: 'Arial, sans-serif' }}>!</span>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="mb-[63px]">
                                            <p className="text-[#3A3A3A] text-2xl text-center whitespace-pre-line">
                                                {"Are you sure you want to cancel this\nMock Interview?"}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-start gap-[11px]">
                                            <button
                                                onClick={() => setShowCancelModal(false)}
                                                className="py-2 px-[55px] bg-white border border-solid border-[#F26D3A] rounded-xl cursor-pointer"
                                            >
                                                <span className="text-[#F26D3A] text-xl font-bold">
                                                    Go Back
                                                </span>
                                            </button>
                                            <button
                                                onClick={handleCancelInterview}
                                                className="py-2 px-4 rounded-xl border-0 cursor-pointer"
                                                style={{
                                                    background: "linear-gradient(180deg, #FF9D48, #FF8251)"
                                                }}
                                            >
                                                <span className="text-white text-xl font-bold cursor-pointer">
                                                    Cancel Interview
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="h-full overflow-auto">
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content - 2/3 width - Scrollable */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-[#FF8351] text-base font-semibold uppercase tracking-wide">
                                            INTERVIEW ID: {bookingData.interviewId}
                                        </h2>
                                        <button
                                            onClick={() => setIsBookmarked(!isBookmarked)}
                                            className={`p-2 rounded-lg ${isBookmarked ? 'text-[#FF8351]' : 'text-[#7F7F7F]'} hover:bg-[#FFF9F5]`}
                                        >
                                            <Bookmark size={20} fill={isBookmarked ? '#FF8351' : 'none'} />
                                        </button>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E5E5E5]">
                                        <div className="flex items-center gap-2 text-[#3A3A3A]">
                                            <Calendar size={20} />
                                            <span className="font-medium">{bookingData.selectedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#3A3A3A]">
                                            <Clock size={20} />
                                            <span className="font-medium">{bookingData.selectedTime}</span>
                                        </div>
                                    </div>

                                    {/* Candidate Details */}
                                    <div className="mb-6">
                                        <h3 className="text-[#7F7F7F] text-xs font-semibold uppercase tracking-wide mb-4">
                                            CANDIDATE DETAILS
                                        </h3>
                                        <h4 className="text-[#3A3A3A] text-2xl font-semibold mb-3">
                                            Domain: {bookingData.role}
                                        </h4>
                                        <p className="text-[#3A3A3A] text-base">
                                            Experience: {bookingData.yearsExp} Year(s), {bookingData.monthsExp} Month(s)
                                        </p>
                                    </div>

                                    {/* Primary Skills */}
                                    <div className="mb-6">
                                        <h3 className="text-[#7F7F7F] text-xs font-semibold uppercase tracking-wide mb-4">
                                            PRIMARY SKILLS TO EVALUATE
                                        </h3>
                                        <div className="grid grid-cols-5 gap-3">
                                            {bookingData.selectedPrimarySkills.map((skill, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-4 py-3 text-center text-[#3A3A3A] text-sm font-medium"
                                                >
                                                    {skill}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Secondary Skills */}
                                    <div className="mb-6">
                                        <h3 className="text-[#7F7F7F] text-xs font-semibold uppercase tracking-wide mb-4">
                                            SECONDARY SKILLS TO EVALUATE
                                        </h3>
                                        <div className="grid grid-cols-5 gap-3">
                                            {bookingData.selectedSecondarySkills.map((skill, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg px-4 py-3 text-center text-[#3A3A3A] text-sm font-medium"
                                                >
                                                    {skill}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resume Section */}
                                    <div className="mb-6">
                                        <h3 className="text-[#7F7F7F] text-xs font-semibold uppercase tracking-wide mb-4">
                                            RESUME
                                        </h3>
                                        
                                        {/* Resume Preview Container */}
                                        <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl p-6">
                                            <div className="flex gap-6">
                                                {/* Pages Navigation */}
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-[#7F7F7F] text-xs font-medium mb-2">Pages</p>
                                                    <div className="space-y-2">
                                                        {Array.from({ length: bookingData.resumePages }).map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`w-16 h-20 bg-white rounded cursor-pointer ${
                                                                    idx === 0 ? 'border-2 border-[#FF8351]' : 'border border-[#E5E5E5] opacity-60'
                                                                }`}
                                                            >
                                                                {/* PDF thumbnail will be rendered here when API is integrated */}
                                                                <div className="w-full h-full flex items-center justify-center text-xs text-[#7F7F7F]">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Main Resume Display - A4 Size */}
                                                <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                                                    {bookingData.resumeUrl ? (
                                                        // When API is integrated, render PDF here
                                                        <iframe
                                                            src={bookingData.resumeUrl}
                                                            className="w-full h-[842px]"
                                                            style={{ aspectRatio: '210/297' }}
                                                            title="Resume Preview"
                                                        />
                                                    ) : (
                                                        // Placeholder for PDF - Mock resume design (A4 proportions)
                                                        <div className="p-8 h-[842px] overflow-hidden" style={{ aspectRatio: '210/297' }}>
                                                            {/* Resume Header */}
                                                            <div className="mb-6 pb-6 border-b-4 border-[#003366]">
                                                                <h2 className="text-3xl font-bold text-[#003366] mb-2">John Smith</h2>
                                                                <p className="text-lg text-[#003366] font-medium mb-3">IT Project Manager</p>
                                                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-[#3A3A3A]">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[#003366]">📞</span>
                                                                        <span>774-697-4598</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[#003366]">🌐</span>
                                                                        <span>linkedin.com/jsmith</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[#003366]">✉️</span>
                                                                        <span>j_smith@email.com</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[#003366]">📍</span>
                                                                        <span>Boston, MA</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Professional Summary */}
                                                            <div className="mb-6">
                                                                <p className="text-sm text-[#3A3A3A] leading-relaxed">
                                                                    <span className="font-semibold">IT Professional with over 10 years of experience</span> specializing in IT department management for international logistics companies. I can drive team-generated workflow efficiencies and foster excellent team culture that promotes seamless operations and business awareness, which enables me to permanently streamline infrastructure and operations.
                                                                </p>
                                                            </div>

                                                            {/* Experience Section */}
                                                            <div className="mb-6">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                                                                        1
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-[#003366]">Experience</h3>
                                                                </div>

                                                                <div className="ml-5 border-l-2 border-[#E5E5E5] pl-8 space-y-6">
                                                                    <div>
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h4 className="text-base font-bold text-[#3A3A3A]">Senior Project Manager</h4>
                                                                            <span className="text-sm text-[#7F7F7F]">2018-10 - Present</span>
                                                                        </div>
                                                                        <p className="text-sm text-[#7F7F7F] mb-2">Company Name</p>
                                                                        <ul className="list-disc list-inside text-sm text-[#3A3A3A] space-y-1">
                                                                            <li>Oversaw day-to-day IT support team (6 people) in international logistics company.</li>
                                                                            <li>Successfully transitioned company operations to fully remote model.</li>
                                                                            <li>Reduced annual IT costs significantly through strategic planning.</li>
                                                                        </ul>
                                                                    </div>

                                                                    <div>
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h4 className="text-base font-bold text-[#3A3A3A]">Junior Project Manager</h4>
                                                                            <span className="text-sm text-[#7F7F7F]">2016-02 - 2018-10</span>
                                                                        </div>
                                                                        <p className="text-sm text-[#7F7F7F] mb-2">Company Name</p>
                                                                        <ul className="list-disc list-inside text-sm text-[#3A3A3A] space-y-1">
                                                                            <li>Supported production and technology workflows.</li>
                                                                            <li>Implemented new software and technology rollouts.</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Education Section */}
                                                            <div className="mb-6">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                                                                        2
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-[#003366]">Education</h3>
                                                                </div>

                                                                <div className="ml-5 border-l-2 border-[#E5E5E5] pl-8">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div>
                                                                            <h4 className="text-base font-bold text-[#3A3A3A]">BS/BA in Computer Science, University of Maryland</h4>
                                                                            <p className="text-sm text-[#7F7F7F]">College Park, MD</p>
                                                                        </div>
                                                                        <span className="text-sm text-[#7F7F7F]">2012-06 - 2016-05</span>
                                                                    </div>
                                                                    <ul className="list-disc list-inside text-sm text-[#3A3A3A] space-y-1 mt-2">
                                                                        <li>Member of Student Association of Computer Science</li>
                                                                        <li>Organized student-industry events</li>
                                                                    </ul>
                                                                </div>
                                                            </div>

                                                            {/* Skills Section */}
                                                            <div className="mb-6">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                                                                        3
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-[#003366]">Software</h3>
                                                                </div>

                                                                <div className="ml-5 pl-8">
                                                                    <div className="grid grid-cols-2 gap-4 text-sm text-[#3A3A3A]">
                                                                        <div>
                                                                            <p className="font-semibold mb-1">Business Process Management</p>
                                                                            <p className="font-semibold mb-1">Facilities management software</p>
                                                                            <p className="font-semibold mb-1">Data Analysis</p>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span>MS Office Suite</span>
                                                                                <div className="flex gap-1">
                                                                                    {[1,2,3,4,5].map(i => (
                                                                                        <div key={i} className={`w-3 h-3 rounded-full ${i <= 4 ? 'bg-[#003366]' : 'bg-[#E5E5E5]'}`}></div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span>SAP Success Factors</span>
                                                                                <div className="flex gap-1">
                                                                                    {[1,2,3,4,5].map(i => (
                                                                                        <div key={i} className={`w-3 h-3 rounded-full ${i <= 3 ? 'bg-[#003366]' : 'bg-[#E5E5E5]'}`}></div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Certifications */}
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                                                                        4
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-[#003366]">Certifications</h3>
                                                                </div>

                                                                <div className="ml-5 pl-8 text-sm text-[#3A3A3A] space-y-2">
                                                                    <p>• PMP - Project Management Institute</p>
                                                                    <p>• PSM-I/CSM - Professional Scrum Master</p>
                                                                    <p>• PRINCE2 Foundation</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Note */}
                                    <div className="mt-6 p-4 bg-[#FFF9F5] rounded-lg">
                                        <p className="text-[#7F7F7F] text-xs italic">
                                            Note: Interview details will reflect once the interview begins to ensure a truly unbiased evaluation.
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 mt-6">
                                        <button 
                                            onClick={() => setShowCancelModal(true)}
                                            className="flex-1 py-3 bg-white border border-[#FFD4D4] text-[#FF6B6B] rounded-lg font-semibold hover:bg-red-50 cursor-pointer"
                                        >
                                            Cancel Interview
                                        </button>
                                        <button 
                                            onClick={() => navigate('/interview-prep/candidate-information-connect')}
                                            className="flex-1 py-3 rounded-lg text-white font-semibold cursor-pointer"
                                            style={{
                                                background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                                            }}
                                        >
                                            Starts in 23:15:20
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - 1/3 width - Fixed */}
                            <div className="lg:col-span-1">
                                <NoteSidebar notes={notes} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetails;