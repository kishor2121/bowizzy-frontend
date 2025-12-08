import React, { useState, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';
import DashNav from '@/components/dashnav/dashnav';
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    createInterviewSlot,
    confirmInterviewSlotPayment
} from "@/services/interviewPrepService";
import { getSkillsByUserId } from "@/services/skillsLinksService";
import { getExperienceByUserId } from "@/services/experienceService";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import {deleteFromCloudinary } from "@/utils/deleteFromCloudinary";

const GiveMockInterview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionMode = searchParams.get('mode') ? searchParams.get('mode').toUpperCase() : 'ONLINE';

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.user_id;
    const token = userData?.token;

    const [userRole, setUserRole] = useState('Loading...');
    const [allBackendSkills, setAllBackendSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const [cloudinaryData, setCloudinaryData] = useState({
        url: '',
        deleteToken: null,
    });

    const getNextSevenDays = () => {
        const result = [];
        const today = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            result.push({
                day: formatter.format(date).toUpperCase(),
                date: date.getDate(),
                fullDate: date,
            });
        }
        return result;
    };

    const initialDates = getNextSevenDays();

    const flatTimeSlots = [
        '10:00 AM', '11:00 AM',
        '12:00 PM', '1:00 PM',
        '2:00 PM', '3:00 PM',
        '4:00 PM', '5:00 PM'
    ];

    const [currentScreen, setCurrentScreen] = useState('form');
    const [bookingData, setBookingData] = useState({
        role: '',
        experience: '0 years 0 months',
        selectedDate: initialDates[0],
        selectedTime: flatTimeSlots[0],
        selectedSkills: [],
        yearsExp: [],
        monthsExp: [],
        resumeUrl: '',
        uploadedResumeFile: null,
        selectedResume: 0,
        interviewId: null,
        mode: sessionMode
    });

    const dates = initialDates;

    const isTimeSlotDisabled = (selectedDateObj, timeStr) => {
        const now = new Date();
        const selectedDate = new Date(selectedDateObj.fullDate);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate.getTime() > today.getTime()) {
            return false;
        }

        const [time, period] = timeStr.split(' ');
        let [hour, minute] = time.split(':').map(Number);
        
        if (period === 'PM' && hour < 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }

        const slotTime = new Date();
        slotTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        slotTime.setHours(hour, minute, 0, 0);

        return slotTime.getTime() <= now.getTime();
    };


    const toggleArrayItem = (array, item) => {
        if (array.includes(item)) {
            return array.filter(i => i !== item);
        }
        return [...array, item];
    };
    
    const calculateExperienceString = (yearsArray, monthsArray) => {
        const totalYears = yearsArray.length > 0 ? yearsArray[yearsArray.length - 1] : 0;
        const totalMonths = monthsArray.length > 0 ? monthsArray[monthsArray.length - 1] : 0;
        return `${totalYears} years ${totalMonths} months`;
    };

    const handleYearSelection = (year) => {
        setBookingData(prev => {
            let newYearsExp = [];
            
            if (prev.yearsExp.includes(year) && year === prev.yearsExp[prev.yearsExp.length - 1]) {
                newYearsExp = prev.yearsExp.filter(y => y < year);
            } else if (!prev.yearsExp.includes(year)) {
                newYearsExp = Array.from({ length: year }, (_, i) => i + 1);
            } else {
                newYearsExp = Array.from({ length: year }, (_, i) => i + 1);
            }
            
            const experienceString = calculateExperienceString(newYearsExp, prev.monthsExp);

            return {
                ...prev,
                yearsExp: newYearsExp,
                experience: experienceString
            };
        });
    };

    const handleMonthSelection = (month) => {
        setBookingData(prev => {
            let newMonthsExp = [];
            
            if (prev.monthsExp.includes(month) && month === prev.monthsExp[prev.monthsExp.length - 1]) {
                 newMonthsExp = prev.monthsExp.filter(m => m < month);
            } else if (!prev.monthsExp.includes(month)) {
                newMonthsExp = Array.from({ length: month }, (_, i) => i + 1);
            } else {
                newMonthsExp = Array.from({ length: month }, (_, i) => i + 1);
            }
            
            const experienceString = calculateExperienceString(prev.yearsExp, newMonthsExp);
            
            return {
                ...prev,
                monthsExp: newMonthsExp,
                experience: experienceString
            };
        });
    };

    const fetchUserData = useCallback(async () => {
        if (!userId || !token) {
            setApiError("Authentication failed: User ID or token missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [expResponse, skillResponse] = await Promise.all([
                getExperienceByUserId(userId, token),
                getSkillsByUserId(userId, token)
            ]);

            const role = expResponse?.job_role || 'No Role Found';
            const fetchedSkills = skillResponse.map(skill => skill.skill_name) || [];

            const initialYears = 3;
            const initialMonths = 3;
            const yearsArray = Array.from({ length: initialYears }, (_, i) => i + 1);
            const monthsArray = Array.from({ length: initialMonths }, (_, i) => i + 1);
            const experienceString = calculateExperienceString(yearsArray, monthsArray);

            setUserRole(role);
            setAllBackendSkills(fetchedSkills);

            setBookingData(prev => ({
                ...prev,
                role: role,
                experience: experienceString,
                selectedSkills: fetchedSkills.slice(0, 5),
                yearsExp: yearsArray,
                monthsExp: monthsArray,
                selectedDate: dates[0],
                selectedTime: flatTimeSlots.find(time => !isTimeSlotDisabled(dates[0], time)) || flatTimeSlots[0],
                resumeUrl: `DEFAULT_RESUME_0`,
                mode: sessionMode
            }));

        } catch (err) {
            console.error("API Fetch Error:", err);
            setApiError("Failed to load user data (role, skills).");
        } finally {
            setLoading(false);
        }
    }, [userId, token, sessionMode]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const validateBookingData = () => {
        const errors = [];
        const totalYears = bookingData.yearsExp.length > 0 ? bookingData.yearsExp[bookingData.yearsExp.length - 1] : 0;
        const totalMonths = bookingData.monthsExp.length > 0 ? bookingData.monthsExp[bookingData.monthsExp.length - 1] : 0;
        const totalExpMonths = totalYears * 12 + totalMonths;


        if (!bookingData.role || bookingData.role === 'No Role Found') {
            errors.push('Job Role is required');
        }
        if (!bookingData.selectedDate) {
            errors.push('Date is required');
        }
        if (!bookingData.selectedTime) {
            errors.push('Time is required');
        }
        if (isTimeSlotDisabled(bookingData.selectedDate, bookingData.selectedTime)) {
            errors.push('Selected time slot is unavailable.');
        }
        if (bookingData.selectedSkills.length === 0) {
            errors.push('At least one skill is required');
        }
        if (totalExpMonths === 0) {
            errors.push('Experience is required');
        }
        if (!bookingData.resumeUrl) {
            errors.push('A resume is required (select existing or upload new)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const formatTimeForAPI = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hour, minute] = time.split(':').map(Number);

        if (period === 'PM' && hour < 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    const formatDateForAPI = (dateObj) => {
        const targetDate = dateObj.fullDate;
        const apiYear = targetDate.getFullYear();
        const apiMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
        const apiDay = String(targetDate.getDate()).padStart(2, '0');
        return `${apiYear}-${apiMonth}-${apiDay}`;
    };

    const prepareAPIPayload = () => {
        const totalYears = bookingData.yearsExp.length > 0 ? bookingData.yearsExp[bookingData.yearsExp.length - 1] : 0;
        const totalMonths = bookingData.monthsExp.length > 0 ? bookingData.monthsExp[bookingData.monthsExp.length - 1] : 0;

        return {
            candidate_id: userId,
            job_role: bookingData.role,
            experience: `${totalYears} years ${totalMonths} months`,
            skills: bookingData.selectedSkills,
            resume_url: bookingData.resumeUrl,
            raw_date_string: formatDateForAPI(bookingData.selectedDate),
            raw_time_string: formatTimeForAPI(bookingData.selectedTime)
        };
    };


    const handleBookInterview = async () => {
        if (loading) return;

        const validation = validateBookingData();

        if (!validation.isValid) {
            alert('Please fill in all required fields:\n' + validation.errors.join('\n'));
            return;
        }

        try {
            setLoading(true);
            const payload = prepareAPIPayload();

            const response = await createInterviewSlot(userId, token, payload, {
                mode: sessionMode
            });

            const interviewId = response?.interview_slot_id || 'N/A';

            setBookingData(prev => ({ ...prev, interviewId: interviewId }));
            setCurrentScreen('payment');

        } catch (error) {
            console.error('Booking API Error:', error);
            alert(`Failed to book interview: ${error.message || 'Server error'}`);
        } finally {
            setLoading(false);
        }
    };


    const handlePayAndConfirm = async () => {
        if (loading || !bookingData.interviewId) return;

        try {
            setLoading(true);
            const slotId = bookingData.interviewId;

            await confirmInterviewSlotPayment(userId, token, slotId);

            setCurrentScreen('success');

        } catch (error) {
            console.error('Payment Confirmation API Error:', error);
            alert(`Payment confirmation failed: ${error.message || 'Server error'}`);
        } finally {
            setLoading(false);
        }
    };


    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, DOC, or DOCX file');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            setLoading(true);

            if (cloudinaryData.deleteToken) {
                await deleteFromCloudinary(cloudinaryData.deleteToken);
            }

            const uploadResult = await uploadToCloudinary(file);

            if (uploadResult?.url) {
                setCloudinaryData({
                    url: uploadResult.url,
                    deleteToken: uploadResult.deleteToken,
                });

                setBookingData(prev => ({
                    ...prev,
                    uploadedResumeFile: file,
                    selectedResume: -1,
                    resumeUrl: uploadResult.url,
                }));
            } else {
                throw new Error("Cloudinary upload failed.");
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert(`Failed to upload resume: ${error.message || 'Server error'}`);
            setBookingData(prev => ({ ...prev, uploadedResumeFile: null, selectedResume: 0, resumeUrl: `DEFAULT_RESUME_0` }));
            setCloudinaryData({ url: '', deleteToken: null });

        } finally {
            setLoading(false);
            event.target.value = null;
        }
    };

    const handleRemoveUploadedResume = async () => {
        try {
            setLoading(true);
            if (cloudinaryData.deleteToken) {
                await deleteFromCloudinary(cloudinaryData.deleteToken);
            }
        } catch (error) {
            console.error('Delete Error:', error);
            alert(`Failed to delete resume file from cloud. You can still proceed with a default resume.`);
        } finally {
            setCloudinaryData({ url: '', deleteToken: null });
            setBookingData(prev => ({
                ...prev,
                uploadedResumeFile: null,
                selectedResume: 0,
                resumeUrl: `DEFAULT_RESUME_0`
            }));
            setLoading(false);
        }
    };

    const handleSelectDefaultResume = (idx) => {
        if (bookingData.uploadedResumeFile) {
            handleRemoveUploadedResume();
        }

        setBookingData(prev => ({
            ...prev,
            selectedResume: idx,
            uploadedResumeFile: null,
            resumeUrl: `DEFAULT_RESUME_${idx}`
        }));
        setCloudinaryData({ url: '', deleteToken: null });
    };

    const IntroBanner = () => (
        <div className="w-full bg-white rounded-[20px] p-5 mb-6">
            <p className="text-[#3A3A3A] text-sm text-base sm:text-lg leading-relaxed text-center">
                Gain real interview practice with industry experts. Improve your confidence, sharpen your skills,
                and receive valuable feedback.
            </p>
        </div>
    );

    if (apiError) {
        return (
            <div className="flex flex-col h-screen font-['Baloo_2']">
                <DashNav heading="Give Mock Interview" />
                <div className="flex-1 max-h-screen overflow-auto bg-[#F0F0F0] p-6 flex items-center justify-center">
                    <p className="text-xl text-red-600">{apiError}</p>
                </div>
            </div>
        );
    }
    
    const Separator = () => <div className="bg-[#E8E8E8] h-[1px] my-5"></div>;

    const FormScreen = () => (
        <div className="max-w-[1400px] mx-auto">
            <IntroBanner />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

                <div className="lg:col-span-2 space-y-5">
                    
                    <div className="bg-white rounded-[20px] py-5 px-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[#3A3A3A] text-2xl font-bold">Job Role : {bookingData.role}</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-[20px] py-5 px-5">

                        <h2 className="text-[#F26D3A] text-2xl mb-5">Schedule your Mock Interview</h2>

                        <div className="mb-4">
                            <span className="text-[#3A3A3A] text-base font-medium block mb-3">INTERVIEW MODE</span>
                            <div className="flex gap-4 max-w-sm mx-auto">
                                <button disabled={true} className={`flex-1 text-center px-4 py-2 rounded-lg border text-sm font-semibold cursor-default ${
                                    bookingData.mode === 'ONLINE' ? 'bg-[#FFF0E3] border-[#F26D3A] text-[#F26D3A]' : 'bg-[#EDEDED] border-[#CACACA] text-[#A0A0A0]'
                                }`}>
                                    ONLINE
                                </button>
                                <button disabled={true} className={`flex-1 text-center px-4 py-2 rounded-lg border text-sm font-semibold cursor-default ${
                                    bookingData.mode === 'OFFLINE' ? 'bg-[#FFF0E3] border-[#F26D3A] text-[#F26D3A]' : 'bg-[#EDEDED] border-[#CACACA] text-[#A0A0A0]'
                                }`}>
                                    OFFLINE
                                </button>
                            </div>
                        </div>

                        <Separator />

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-black text-base font-medium">DATE (IST)</span>
                                <span className="text-black text-[10px]">Note: You can book interview(s) for 7 days from today.</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                {dates.map((item) => (
                                    <button
                                        key={`${item.date}-${item.day}`}
                                        onClick={() => setBookingData({ ...bookingData, selectedDate: item, selectedTime: flatTimeSlots.find(time => !isTimeSlotDisabled(item, time)) || flatTimeSlots[0] })}
                                        className={`flex flex-col flex-1 py-3 gap-2 rounded-xl border ${
                                            bookingData.selectedDate?.date === item.date && bookingData.selectedDate?.day === item.day
                                                ? 'bg-[#FFF0E3] border-[#F26D3A]'
                                                : 'bg-white border-[#CACACA]'
                                        }`}
                                        disabled={loading}
                                    >
                                        <span className={`text-[10px] font-bold text-center ${
                                            bookingData.selectedDate?.date === item.date && bookingData.selectedDate?.day === item.day ? 'text-[#3A3A3A]' : 'text-[#7F7F7F]'
                                        }`}>
                                            {item.day}
                                        </span>
                                        <span className="text-black text-xl font-bold text-center">{item.date}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-black text-base font-medium">TIME (IST)</span>
                                <span className="text-black text-[10px]">Note: Each booking is scheduled for 1 hour.</span>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {flatTimeSlots.map((time) => {
                                    const isDisabled = isTimeSlotDisabled(bookingData.selectedDate, time);

                                    return (
                                        <button
                                            key={time}
                                            onClick={() => setBookingData({ ...bookingData, selectedTime: time })}
                                            className={`py-2 px-4 rounded-xl border text-sm ${
                                                isDisabled
                                                    ? 'bg-[#E0E0E0] border-[#C0C0C0] text-[#A0A0A0] cursor-not-allowed'
                                                    : bookingData.selectedTime === time
                                                        ? 'bg-[#FFF0E3] border-[#F26D3A] text-[#3A3A3A]'
                                                        : 'bg-[#EDEDED] border-[#CACACA] text-[#3A3A3A]'
                                            }`}
                                            disabled={loading || isDisabled}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <Separator />

                        <div>
                            <h2 className="text-[#3A3A3A] text-xl font-semibold mb-5">SKILLS</h2>

                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-3 gap-4">
                                    <span className="text-[#3A3A3A] text-sm font-medium">SKILLS FROM YOUR ROLE ({bookingData.role})</span>
                                    <span className="text-[10px] text-[#3A3A3A] text-right">
                                        Select the skills you want to be assessed on during the mock interview.
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {allBackendSkills.map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => setBookingData({
                                                ...bookingData,
                                                selectedSkills: toggleArrayItem(bookingData.selectedSkills, skill)
                                            })}
                                            className={`py-2 px-3 rounded-lg text-sm border ${
                                                bookingData.selectedSkills.includes(skill)
                                                    ? 'bg-[#FFF0E3] border-[#F26D3A] text-[#3A3A3A]'
                                                    : 'bg-white border-[#CACACA] text-[#3A3A3A]'
                                            }`}
                                            disabled={loading}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                    {allBackendSkills.length === 0 && (
                                        <p className="text-sm text-[#7F7F7F] col-span-full">No skills available for your current role. Please update your profile or create a new role.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <Separator />

                        <div>
                            <h2 className="text-[#3A3A3A] text-xl font-semibold mb-5">EXPERIENCE</h2>

                            <div className="mb-5">
                                <span className="text-[#3A3A3A] text-sm font-medium block mb-3">YEARS</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => handleYearSelection(year)}
                                            className={`w-8 h-8 text-xs rounded flex items-center justify-center ${
                                                bookingData.yearsExp.includes(year)
                                                    ? 'bg-[#FF9D48] text-white'
                                                    : bookingData.yearsExp.length > 0 && year < bookingData.yearsExp[bookingData.yearsExp.length - 1]
                                                        ? 'bg-[#FFE5D1] text-[#3A3A3A]'
                                                        : 'bg-[#EDEDED] text-[#3A3A3A]'
                                            }`}
                                            disabled={loading}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                    <span className="text-xs text-[#3A3A3A] ml-2">
                                        {bookingData.yearsExp.length > 0 ? bookingData.yearsExp[bookingData.yearsExp.length - 1] : 0} YEARS
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[#3A3A3A] text-sm font-medium block mb-3">MONTHS</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                        <button
                                            key={month}
                                            onClick={() => handleMonthSelection(month)}
                                            className={`w-8 h-8 text-xs rounded flex items-center justify-center ${
                                                bookingData.monthsExp.includes(month)
                                                    ? 'bg-[#FF9D48] text-white'
                                                    : bookingData.monthsExp.length > 0 && month < bookingData.monthsExp[bookingData.monthsExp.length - 1]
                                                        ? 'bg-[#FFE5D1] text-[#3A3A3A]'
                                                        : 'bg-[#EDEDED] text-[#3A3A3A]'
                                            }`}
                                            disabled={loading}
                                        >
                                            {month}
                                        </button>
                                    ))}
                                    <span className="text-xs text-[#3A3A3A] ml-2">
                                        {bookingData.monthsExp.length > 0 ? bookingData.monthsExp[bookingData.monthsExp.length - 1] : 0} MONTH(S)
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <Separator />

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[#3A3A3A] text-xl font-semibold">RESUME</h2>
                                <span className="text-[10px] text-[#3A3A3A]">Your resume is taken from the "My Resume" section.</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {[0, 1].map((idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectDefaultResume(idx)}
                                        className={`rounded-lg p-3 border-2 ${
                                            bookingData.selectedResume === idx && !bookingData.uploadedResumeFile
                                                ? 'border-[#F26D3A] bg-[#FFF9F5]'
                                                : 'border-[#E5E5E5] bg-white'
                                        }`}
                                        disabled={loading}
                                    >
                                        <div className="w-full h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
                                            <span className="text-xs text-gray-400">Resume Preview</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[#3A3A3A]">{`Aarov-Mehta-Python-Developer-${idx + 1}`}</span>
                                            <svg className={`w-4 h-4 ${bookingData.selectedResume === idx && !bookingData.uploadedResumeFile ? 'text-[#F26D3A]' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <circle cx="10" cy="10" r="5" fill="currentColor" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {bookingData.uploadedResumeFile && (
                                <div className="mb-4 p-4 bg-[#FFF9F5] border-2 border-[#F26D3A] rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FF9D48] rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#3A3A3A]">{bookingData.uploadedResumeFile.name}</p>
                                                <p className="text-xs text-gray-500">{(bookingData.uploadedResumeFile.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveUploadedResume}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={loading}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="text-center my-3">
                                <span className="text-sm text-gray-500">OR</span>
                            </div>

                            <input
                                type="file"
                                id="resumeUpload"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                className="hidden"
                                disabled={loading}
                            />

                            <label
                                htmlFor="resumeUpload"
                                className={`w-full py-3 border-2 border-dashed rounded-lg text-sm flex items-center justify-center gap-2 mb-3 cursor-pointer transition-colors ${loading ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-gray-600 hover:border-[#FF8351] hover:text-[#FF8351]'}`}
                            >
                                <Upload size={16} />
                                {loading && bookingData.uploadedResumeFile === null ? 'Processing upload...' : 'Upload Resume (PDF, DOC, DOCX - Max 5MB)'}
                            </label>

                            <div className="text-center mb-3">
                                <span className="text-sm text-gray-500">OR</span>
                            </div>

                            <button className="w-full py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#FF8351] hover:text-[#FF8351] flex items-center justify-center gap-2 cursor-pointer" disabled={loading}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                                    <path d="M3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                                    <path d="M14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                                Create Resume in BoWizzy
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 rounded-lg text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBookInterview}
                            className="flex-1 py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
                            style={{
                                background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Booking...' : 'Book Mock Interview'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-[#FFF9F5] rounded-[20px] p-5 sticky top-6">
                        <h3 className="text-[#3A3A3A] text-base font-semibold mb-4">Note</h3>
                        <ul className="space-y-3 text-xs text-[#3A3A3A] leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>The job role and experience for your interview will be based on your profile. To schedule an interview for a different role, please create a new role in your profile section.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>Once your payment is complete, your interview request will be forwarded to our professionals, who will conduct the interview according to the available time slots.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>You will receive a notification 2 hours before your interview and a reminder 30 minutes prior.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>If you cancel the interview 3-4 hours in advance, you are eligible for a 50% refund. Cancellations made within 3 hours of the interview are non-refundable, as per our policy.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const PaymentScreen = () => (
        <div className="max-w-[1400px] mx-auto">
            <IntroBanner />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[20px] py-6 px-6">
                        <h2 className="text-[#F26D3A] text-2xl mb-6">Details</h2>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-[#3A3A3A] text-sm font-semibold mb-2">Date</h3>
                                <div className="bg-[#FFF9F5] rounded-lg p-4 border border-[#FFE5D1]">
                                    <div className="text-xs text-[#7F7F7F] mb-1">{bookingData.selectedDate?.day || 'N/A'}</div>
                                    <div className="text-2xl font-bold text-[#3A3A3A]">{bookingData.selectedDate?.date || 'N/A'}</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[#3A3A3A] text-sm font-semibold mb-2">Time</h3>
                                <div className="bg-[#FFF9F5] rounded-lg p-4 border border-[#FFE5D1]">
                                    <div className="text-2xl font-bold text-[#3A3A3A]">{bookingData.selectedTime || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-[#F26D3A] text-lg font-semibold mb-1">Role : {bookingData.role}</h3>
                            <p className="text-[#3A3A3A] text-sm">
                                Experience : {bookingData.experience}
                            </p>
                        </div>


                        <div className="mb-6">
                            <h3 className="text-[#3A3A3A] text-base font-semibold mb-3">SKILL(S) SELECTED FOR MOCK INTERVIEW</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {bookingData.selectedSkills.slice(0, 7).map((skill, idx) => (
                                    <div key={idx} className="bg-[#F5F5F5] rounded-lg py-2 px-3 text-center text-sm text-[#3A3A3A]">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#E8E8E8] h-[1px] my-6"></div>


                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[#3A3A3A] text-lg font-semibold">Amount :</span>
                            <span className="text-[#3A3A3A] text-2xl font-bold">₹ 399.00 /-</span>
                        </div>


                        <button
                            onClick={handlePayAndConfirm}
                            className="w-full py-3 rounded-lg text-base font-semibold text-white cursor-pointer"
                            style={{
                                background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Initiating Payment...' : 'Pay and Confirm'}
                        </button>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                            <div className="bg-[#FFF9E6] rounded-lg p-4">
                                <h4 className="text-[#3A3A3A] font-semibold text-sm mb-2">
                                    One IT Community, Endless Opportunities - NamaQA Community
                                </h4>
                                <button className="mt-2 px-4 py-2 bg-white border border-[#FF9D48] text-[#FF9D48] rounded-lg text-xs font-semibold hover:bg-orange-50">
                                    Join Now →
                                </button>
                            </div>

                            <div className="bg-[#F0F9FF] rounded-lg p-4">
                                <h4 className="text-[#3A3A3A] font-semibold text-sm mb-2">
                                    Create an ATS-Friendly Resume That Gets Past Filters and Reaches Employers
                                </h4>
                                <button className="mt-2 px-4 py-2 bg-white border border-[#3B82F6] text-[#3B82F6] rounded-lg text-xs font-semibold hover:bg-blue-50">
                                    Create Resume
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="lg:col-span-1">
                    <div className="bg-[#FFF9F5] rounded-[20px] p-6 sticky top-6">
                        <h3 className="text-[#3A3A3A] text-base font-semibold mb-4">Note</h3>
                        <ul className="space-y-3 text-xs text-[#3A3A3A] leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>The job role and experience for your interview will be based on your profile. To schedule an interview for a different role, please create a new role in your profile section.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>Once your payment is complete, your interview request will be forwarded to our professionals, who will conduct the interview according to the available time slots.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>You will receive a notification 2 hours before your interview and a reminder 30 minutes prior.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF8351] mt-0.5">•</span>
                                <span>If you cancel the interview 3-4 hours in advance, you are eligible for a 50% refund. Cancellations made within 3 hours of the interview are non-refundable, as per our policy.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );


    const SuccessScreen = () => (
        <div className="max-w-[1400px] mx-auto">
            <IntroBanner />
            <div className="flex items-center justify-center min-h-[50px]">
                <div className="bg-white rounded-[20px] py-12 px-8 text-center max-w w-full">


                    <div className="flex justify-center mb-6">
                        <motion.div
                            className="relative w-24 h-24"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        >

                            <motion.div
                                className="absolute inset-0 rounded-full bg-[#4ADE80] opacity-20"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: [1, 1.5, 1.8], opacity: [0.3, 0.15, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 0.5,
                                    ease: "easeOut"
                                }}
                            />

                            <motion.div
                                className="absolute inset-0 rounded-full bg-[#4ADE80] opacity-20"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: [1, 1.5, 1.8], opacity: [0.3, 0.15, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 0.5,
                                    delay: 0.3,
                                    ease: "easeOut"
                                }}
                            />


                            <motion.div
                                className="absolute inset-0 rounded-full flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)",
                                    boxShadow: "0 10px 40px rgba(74, 222, 128, 0.3)"
                                }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 12,
                                    delay: 0.1
                                }}
                            >

                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <motion.path
                                        d="M10 24L20 34L38 14"
                                        stroke="white"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.4,
                                            ease: "easeOut"
                                        }}
                                    />
                                </svg>
                            </motion.div>

                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-[#4ADE80] rounded-full"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                    }}
                                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        x: Math.cos((i * Math.PI * 2) / 6) * 50,
                                        y: Math.sin((i * Math.PI * 2) / 6) * 50,
                                        opacity: [1, 1, 0],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.6 + i * 0.05,
                                        ease: "easeOut",
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>


                    <motion.h2
                        className="text-[#3A3A3A] text-3xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        Mock Interview Booking Confirmed
                    </motion.h2>


                    <motion.p
                        className="text-[#3A3A3A] text-lg mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                    >
                        Interview ID: <span className="font-semibold">{bookingData.interviewId}</span>
                    </motion.p>


                    <motion.p
                        className="text-[#3A3A3A] text-sm mb-8 max-w-md mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                    >
                        You will receive a notification 2 hours before your interview and a reminder 30 minutes prior the Mock Interview
                    </motion.p>


                    <motion.button
                        onClick={() => navigate('/interview-prep')}
                        className="py-3 px-8 rounded-lg text-base font-semibold text-white cursor-pointer"
                        style={{
                            background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go to Interview Dashboard
                    </motion.button>
                </div>
            </div>
        </div>
    );


    return (
        <div className="flex flex-col h-screen font-['Baloo_2']">

            <DashNav heading="Give Mock Interview" />

            <div className="flex-1 max-h-screen overflow-auto bg-[#F0FF0] p-6">
                {currentScreen === 'form' && <FormScreen />}
                {currentScreen === 'payment' && <PaymentScreen />}
                {currentScreen === 'success' && <SuccessScreen />}
            </div>
        </div>
    );
};

export default GiveMockInterview;