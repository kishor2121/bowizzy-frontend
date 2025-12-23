import React, { useState, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';
import DashNav from '@/components/dashnav/dashnav';
import { useNavigate, useSearchParams, useParams } from "react-router-dom";

import { motion } from "framer-motion";
import {
    createInterviewSlot,
    confirmInterviewSlotPayment
} from "@/services/interviewPrepService";
import { getResumeTemplates, getResumeTemplateById } from '@/services/resumeServices';
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
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
    const [apiError, setApiError] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const { slotId } = useParams();

    const [cloudinaryData, setCloudinaryData] = useState({
        url: '',
        deleteToken: null,
    });
    const [resumeTemplates, setResumeTemplates] = useState([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [selectedTemplateDetail, setSelectedTemplateDetail] = useState(null);

    const resolveTemplateId = (t) => {
        if (!t) return null;
        // look for numeric id in several possible fields, including nested objects
        const candidates = [
            t.resume_template_id,
            t.template_id,
            t.id,
            t.templateId,
            t.resumeTemplateId,
            t.template?.id,
            t.template?.resume_template_id,
            t.template?.template_id,
            t.template?.templateId,
        ];

        for (const c of candidates) {
            if (c === undefined || c === null) continue;
            if (typeof c === 'number' && Number.isFinite(c)) return c;
            if (typeof c === 'string') {
                // if string only digits
                if (/^\d+$/.test(c)) return Number(c);
                // try to extract first number occurrence (fallback)
                const m = c.match(/(\d+)/);
                if (m) return Number(m[1]);
            }
        }

        return null;
    };

    const resolveTemplateUrl = (t) => {
        if (!t) return '';
        return t.template_file_url ?? t.template_file ?? t.url ?? t.file_url ?? t.download_url ?? t.template_url ?? t.template?.template_file_url ?? t.template?.url ?? '';
    };

    const getSelectedTemplate = () => {
        if (!resumeTemplates || resumeTemplates.length === 0) return null;
        return resumeTemplates.find(t => (resolveTemplateId(t) ?? null) === bookingData.selectedResume) ?? null;
    };

    const handleSelectTemplate = async (template) => {
        if (bookingData.uploadedResumeFile) {
            await handleRemoveUploadedResume();
        }

        const tid = resolveTemplateId(template);
        const url = template?.template_file_url ?? template?.template_file ?? resolveTemplateUrl(template);

        setBookingData(prev => ({
            ...prev,
            selectedResume: tid,
            uploadedResumeFile: null,
            resumeUrl: url || `TEMPLATE_${tid}`
        }));

        setCloudinaryData({ url: '', deleteToken: null });

        // fetch details for selected template
        if (tid && userId && token) {
            try {
                const resp = await getResumeTemplateById(userId, token, tid);
                const d = resp?.data ?? resp;
                setSelectedTemplateDetail(d || null);
                // fallback: if response contains url, ensure bookingData updated
                const respUrl = d?.template_file_url ?? d?.template_file ?? d?.url ?? d?.file_url ?? d?.download_url ?? null;
                if (respUrl) {
                    setBookingData(prev => ({ ...prev, resumeUrl: respUrl }));
                }
            } catch (err) {
                console.error('Failed to fetch template detail', err);
            }
        }
    };

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

            // Special-case: allow selecting 0 for freshers. Selecting 0 sets yearsExp to [0].
            if (year === 0) {
                if (prev.yearsExp.includes(0) && prev.yearsExp[prev.yearsExp.length - 1] === 0) {
                    newYearsExp = prev.yearsExp.filter(y => y < 0); // becomes []
                } else {
                    newYearsExp = [0];
                }
            } else {
                if (prev.yearsExp.includes(year) && year === prev.yearsExp[prev.yearsExp.length - 1]) {
                    newYearsExp = prev.yearsExp.filter(y => y < year);
                } else {
                    newYearsExp = Array.from({ length: year }, (_, i) => i + 1);
                }
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
            // Allow selecting 0 months for freshers. Selecting 0 sets monthsExp to [0].
            if (month === 0) {
                if (prev.monthsExp.includes(0) && prev.monthsExp[prev.monthsExp.length - 1] === 0) {
                    newMonthsExp = prev.monthsExp.filter(m => m < 0); // becomes []
                } else {
                    newMonthsExp = [0];
                }
            } else {
                if (prev.monthsExp.includes(month) && month === prev.monthsExp[prev.monthsExp.length - 1]) {
                    newMonthsExp = prev.monthsExp.filter(m => m < month);
                } else {
                    newMonthsExp = Array.from({ length: month }, (_, i) => i + 1);
                }
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

    const fetchResumeTemplates = useCallback(async () => {
        if (!userId || !token) return;
        try {
            setLoadingResumes(true);
            const templates = await getResumeTemplates(userId, token);
            setResumeTemplates(Array.isArray(templates) ? templates : []);
        } catch (err) {
            console.error('Failed to fetch resume templates', err);
        } finally {
            setLoadingResumes(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        fetchResumeTemplates();
    }, [fetchResumeTemplates]);

    const selectTemplateById = useCallback(async (templateId) => {
        if (!userId || !token || !templateId) return;
        try {
            setLoadingResumes(true);
            const resp = await getResumeTemplateById(userId, token, templateId);
            const data = resp?.data ?? resp;
            setSelectedTemplateDetail(data || null);

            const url = data?.url ?? data?.file_url ?? data?.download_url ?? resolveTemplateUrl(data) ?? null;

            setBookingData(prev => ({
                ...prev,
                selectedResume: Number(templateId),
                uploadedResumeFile: null,
                resumeUrl: url || `TEMPLATE_${templateId}`
            }));
            setCloudinaryData({ url: '', deleteToken: null });
        } catch (err) {
            console.error('Failed to select template by id', err);
        } finally {
            setLoadingResumes(false);
        }
    }, [userId, token]);

    useEffect(() => {
        const raw = searchParams.get('resume_template_id') || searchParams.get('resume_template') || searchParams.get('template_id');
        if (raw) {
            const id = Number(raw);
            if (!Number.isNaN(id)) {
                selectTemplateById(id);
            }
        }
    }, [searchParams, selectTemplateById]);


    useEffect(() => {
        if (slotId) {
            setBookingData(prev => ({
                ...prev,
                interviewId: slotId
            }));
            setCurrentScreen('payment');
        }
    }, [slotId]);


    // create a preview URL for the uploaded resume (object URL for local File, or cloud url)
    useEffect(() => {
        let objUrl;

        if (bookingData.uploadedResumeFile) {
            try {
                objUrl = URL.createObjectURL(bookingData.uploadedResumeFile);
                setUploadedPreviewUrl(objUrl);
            } catch (e) {
                setUploadedPreviewUrl('');
            }
        } else if (cloudinaryData.url) {
            setUploadedPreviewUrl(cloudinaryData.url);
        } else {
            setUploadedPreviewUrl('');
        }

        return () => {
            if (objUrl) {
                try { URL.revokeObjectURL(objUrl); } catch (e) {}
            }
        };
    }, [bookingData.uploadedResumeFile, cloudinaryData.url]);

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
        // Require experience only if the user hasn't explicitly selected years or months.
        // Users who selected 0 (freshers) will have yearsExp or monthsExp length > 0 and are allowed.
        const hasSelectedExperience = (Array.isArray(bookingData.yearsExp) && bookingData.yearsExp.length > 0) || (Array.isArray(bookingData.monthsExp) && bookingData.monthsExp.length > 0);
        if (!hasSelectedExperience) {
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
            experience_years: Number(totalYears),
            experience_months: Number(totalMonths),
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
            const serverMsg = error?.response?.data?.message || error?.response?.data?.error || error?.response?.data?.detail;
            const displayMsg = serverMsg || error?.message || 'Server error';
                const friendlyMsg = mapBookingErrorMessage(displayMsg);
                setBookingError(friendlyMsg);
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
            setUploadingResume(true);

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
            setUploadingResume(false);
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

    const getUploadedFileName = () => {
        if (bookingData.uploadedResumeFile) return bookingData.uploadedResumeFile.name;
        if (cloudinaryData.url) {
            try {
                const parts = cloudinaryData.url.split('/');
                const last = parts[parts.length - 1] || '';
                return decodeURIComponent(last.split('?')[0]);
            } catch (e) {
                return 'Uploaded Resume';
            }
        }
        return '';
    };

    const mapBookingErrorMessage = (msg) => {
        if (!msg) return 'Server error';
        const m = String(msg).toLowerCase();

        if (m.includes('slot_overlap') || m.includes('slot overlap') || m.includes('slot already') || m.includes('already booked') || m.includes('alredy booked') || m.includes('slot alredy')) {
            return 'This slot is already booked. Please choose a different time.';
        }
        return msg;
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


    
      const notes = [
        "The job role and experience for your interview will be based on your profile. To schedule an interview for a different role, please create a new role in your profile section.",
        "Once your payment is complete, your interview request will be forwarded to our professionals, who will conduct the interview according to the available time slots.",
        "You will receive a notification 2 hours before your interview and a reminder 30 minutes prior.",
        "If you cancel the interview 3–4 hours in advance, you are eligible for a 50% refund. Cancellations made within 3 hours of the interview are non-refundable."
    ];



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

    const NoteCard = () => (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-[#F26D3A] text-base font-semibold mb-4">Note</h3>
            <ul className="space-y-4 text-xs text-[#3A3A3A] leading-relaxed">
                <li className="flex gap-3">
                    <span className="text-[#FF8351] mt-1">•</span>
                    <span>The job role and experience for your interview will be based on your profile. To schedule an interview for a different role, please create a new role in your profile section.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-[#FF8351] mt-1">•</span>
                    <span>Once your payment is complete, your interview request will be forwarded to our professionals, who will conduct the interview according to the available time slots.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-[#FF8351] mt-1">•</span>
                    <span>You will receive a notification 2 hours before your interview and a reminder 30 minutes prior.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-[#FF8351] mt-1">•</span>
                    <span>If you cancel the interview 3-4 hours in advance, you are eligible for a 50% refund. Cancellations made within 3 hours of the interview are non-refundable, as per our policy.</span>
                </li>
            </ul>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">

                <div className="lg:col-span-3 space-y-5">
                    
                    <div className="bg-white rounded-[20px] pt-5 px-5 pb-0">

                        <div className="flex items-center justify-between">
                            <h2 className="text-[#3A3A3A] text-2xl font-bold">Job Role : {bookingData.role}</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-[20px] pt-5 px-5 pb-0">
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
                                    {Array.from({ length: 21 }, (_, i) => i).map((year) => (
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
                                    {Array.from({ length: 12 }, (_, i) => i).map((month) => (
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
                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[#3A3A3A] text-xl font-semibold tracking-wide">
                                RESUME
                            </h2>
                            <span className="text-[10px] text-[#3A3A3A]">
                                Your resumes are taken from the "My Resumes" section.
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">

                            {/* LEFT SIDE – Resume Cards */}
                            <div className="flex-1 mb-0">
                                <div className="flex items-center gap-4">
                                    {loadingResumes ? (
                                        <div className="text-sm text-gray-500">Loading resumes...</div>
                                    ) : resumeTemplates.length > 0 ? (
                                        resumeTemplates.map((t, idx) => {
                                            const tid = resolveTemplateId(t) ?? idx;
                                            const title = t?.template_name ?? t?.title ?? t?.name ?? `Resume ${idx + 1}`;
                                            return (
                                                <div
                                                    key={tid}
                                                    onClick={() => handleSelectTemplate(t)}
                                                    className={`w-40 h-56 rounded-xl bg-white shadow-sm border cursor-pointer relative overflow-hidden transition flex-shrink-0 ${
                                                        bookingData.selectedResume === tid && !bookingData.uploadedResumeFile
                                                            ? 'border-[#F26D3A]'
                                                            : 'border-gray-200'
                                                    }`}
                                                >
                                                    <img src="/resume-placeholder.png" className="w-full h-full object-cover opacity-90" />

                                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-gray-400 bg-white flex items-center justify-center">
                                                        {bookingData.selectedResume === tid && !bookingData.uploadedResumeFile ? (
                                                            <div className="w-3 h-3 rounded-full bg-[#F26D3A]" />
                                                        ) : null}
                                                    </div>

                                                    <div className="absolute bottom-2 left-2 right-2 text-[11px] leading-tight text-[#3A3A3A] font-medium">
                                                        {title}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        [0, 1].map((idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSelectDefaultResume(idx)}
                                                className={`w-40 h-56 rounded-xl bg-white shadow-sm border cursor-pointer relative overflow-hidden transition flex-shrink-0 ${
                                                    bookingData.selectedResume === idx && !bookingData.uploadedResumeFile
                                                        ? 'border-[#F26D3A]'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <img src="/resume-placeholder.png" className="w-full h-full object-cover opacity-90" />
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-gray-400 bg-white flex items-center justify-center">
                                                    {bookingData.selectedResume === idx && !bookingData.uploadedResumeFile ? (
                                                        <div className="w-3 h-3 rounded-full bg-[#F26D3A]" />
                                                    ) : null}
                                                </div>
                                                <div className="absolute bottom-2 left-2 right-2 text-[11px] leading-tight text-[#3A3A3A] font-medium">
                                                    Aarav-Mehta-Python-Developer-{idx + 1}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* DOTS */}
                                <div className="flex justify-center gap-2 mt-2">
                                    {resumeTemplates.length > 0 ? (
                                        resumeTemplates.map((t, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${
                                                    bookingData.selectedResume === (resolveTemplateId(t) ?? i) && !bookingData.uploadedResumeFile
                                                        ? 'bg-[#F26D3A]'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                        ))
                                    ) : (
                                        [0, 1].map((i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${
                                                    bookingData.selectedResume === i && !bookingData.uploadedResumeFile
                                                        ? 'bg-[#F26D3A]'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* OR DIVIDER */}
                            <div className="hidden md:flex flex-col items-center justify-center px-4">
                                <div className="w-px h-30 bg-gray-200" />
                                <p className="text-xs my-2 text-gray-400">OR</p>
                                <div className="w-px h-30 bg-gray-200" />
                            </div>

                            {/* RIGHT SIDE – Buttons */}
                                <div className="w-full md:w-1/3 flex flex-col gap-4">  
                                    {/* UPLOAD RESUME BUTTON */}
                                    {!bookingData.uploadedResumeFile && (
                                        <>
                                            <input
                                                type="file"
                                                id="resumeUpload"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleResumeUpload}
                                                className="hidden"
                                                disabled={loading || uploadingResume}
                                            />

                                            <label
                                                htmlFor="resumeUpload"
                                                className={`w-full py-8 px-5 rounded-xl border-2 border-gray-300 
                                                        ${uploadingResume ? 'cursor-not-allowed opacity-80' : 'hover:border-[#FF8351] hover:text-[#FF8351] cursor-pointer'} 
                                                        text-gray-700 flex items-center gap-3 transition`}
                                            >
                                                {uploadingResume ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                        </svg>
                                                        <span className="text-sm font-medium">Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={20} />
                                                        <span className="text-sm font-medium">Upload Resume</span>
                                                    </>
                                                )}
                                            </label>
                                        </>
                                    )}

                                    {(() => {
                                        const selTemplate = getSelectedTemplate();
                                        const isUploaded = !!bookingData.uploadedResumeFile || !!cloudinaryData.url;
                                        const hasSelectedTemplate = !!selectedTemplateDetail || !!selTemplate || (bookingData.selectedResume !== null && bookingData.selectedResume !== 0);
                                        const shouldShow = isUploaded || hasSelectedTemplate;

                                        if (!shouldShow) return null;

                                        const displayName = isUploaded
                                            ? getUploadedFileName()
                                            : (selectedTemplateDetail?.template_name ?? selectedTemplateDetail?.title ?? selTemplate?.template_name ?? selTemplate?.title ?? selTemplate?.name ?? 'Selected Resume');

                                        const viewUrl = cloudinaryData.url || selectedTemplateDetail?.template_file_url || selectedTemplateDetail?.template_file || selectedTemplateDetail?.url || resolveTemplateUrl(selTemplate) || bookingData.resumeUrl;

                                        return (
                                            <div className="mt-3 flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 11h6m-3 8h.01M3 7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"></path></svg>
                                                    <div className="text-sm text-[#3A3A3A] max-w-[12rem] truncate" title={displayName}>
                                                        {displayName}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {viewUrl && (
                                                        <a href={viewUrl} target="_blank" rel="noreferrer" className="text-xs text-[#3B82F6] underline">View</a>
                                                    )}

                                                    {isUploaded ? (
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveUploadedResume}
                                                            disabled={loading}
                                                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                                            title="Delete uploaded resume"
                                                        >
                                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"></path></svg>
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <div className="w-full h-px bg-gray-200 my-2 rounded-full" />
                                    {/* CREATE RESUME BUTTON */}
                                    <button
                                        type="button"
                                        className="w-full py-8 px-5 rounded-xl border-2 border-gray-300 
                                                hover:border-[#FF8351] hover:text-[#FF8351] 
                                                text-gray-700 flex items-center gap-3 transition"
                                        disabled={loading}
                                        onClick={() => navigate('/ResumeBuilder')}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                        </svg>

                                        <span className="text-sm font-medium">Create Resume in BoWizzy</span>
                                    </button>
                                </div>

                        </div>
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
                            className={`flex-1 py-3 rounded-lg text-sm font-semibold text-white ${
                                (loading || !(bookingData.uploadedResumeFile || cloudinaryData.url || selectedTemplateDetail || getSelectedTemplate())) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            style={{
                                background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                            }}
                            disabled={loading || !(bookingData.uploadedResumeFile || cloudinaryData.url || selectedTemplateDetail || getSelectedTemplate())}
                            title={!(bookingData.uploadedResumeFile || cloudinaryData.url || selectedTemplateDetail || getSelectedTemplate()) ? 'Please upload or select a resume to enable booking' : ''}
                        >
                            {loading ? 'Booking...' : 'Book Mock Interview'}
                        </button>
                    </div>
                </div>
                <div className="w-full lg:w-[320px] flex-shrink-0">
                        <NoteSidebar notes={notes} />
                    </div>

            </div>
        </div>
    );
        const PaymentScreen = () => (
        <div className="max-w-[1400px] mx-auto">
            <IntroBanner />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
                <div className="bg-white rounded-[24px] px-8 py-6">
                <h2 className="text-[#F26D3A] text-xl font-semibold mb-6">
                    Details
                </h2>
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="flex gap-4">
                    <div>
                        <p className="text-xs font-semibold text-[#3A3A3A] mb-2">
                        Date
                        </p>
                        <div className="w-[90px] border border-[#FFE5D1] rounded-xl p-3 text-center">
                        <p className="text-[11px] text-gray-500">
                            {bookingData.selectedDate?.day || "SAT"}
                        </p>
                        <p className="text-xl font-bold text-[#3A3A3A]">
                            {bookingData.selectedDate?.date || "23"}
                        </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#3A3A3A] mb-2">
                        Time
                        </p>
                        <div className="w-[110px] border border-[#FFE5D1] rounded-xl p-4 text-center">
                        <p className="text-sm font-semibold text-[#3A3A3A]">
                            {bookingData.selectedTime || "10:00 AM"}
                        </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#3A3A3A] mb-2">
                        Mode
                        </p>
                        <div className="w-[110px] border border-[#FFE5D1] rounded-xl p-4 text-center">
                        <p className="text-sm font-semibold text-[#3A3A3A]">
                            Online
                        </p>
                        </div>
                    </div>
                    </div>

                    <div className="hidden lg:block w-[1px] bg-[#E5E5E5]" />
                    <div>
                    <p className="text-[#F26D3A] text-xl font-bold mb-1">
                        Job Role : {bookingData.role}
                    </p>

                    <p className="text-xl text-[#3A3A3A]">
                        Experience : {bookingData.experience}
                    </p>
                    </div>
                </div>
                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#3A3A3A] mb-4">
                    SKILL(S) SELECTED FOR MOCK INTERVIEW
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {bookingData.selectedSkills.slice(0, 7).map((skill, idx) => (
                        <div
                        key={idx}
                        className="border border-[#E5E5E5] rounded-lg py-2 px-3 text-center text-sm text-[#3A3A3A]"
                        >
                        {skill}
                        </div>
                    ))}
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="h-[1px] bg-[#E5E5E5] mb-6" />

                {/* AMOUNT */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-base font-semibold text-[#3A3A3A]">
                    Amount :
                    </span>
                    <span className="text-xl font-bold text-[#3A3A3A]">
                    ₹ 399.00 /-
                    </span>
                </div>

                {/* PAY BUTTON */}
                <button
                    onClick={handlePayAndConfirm}
                    disabled={loading}
                    className="w-full h-[52px] rounded-xl text-white font-semibold text-base"
                    style={{
                    background:
                        "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                    }}
                >
                    {loading ? "Initiating Payment..." : "Pay and Confirm"}
                </button>
                </div>
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-1">
                <div className="hidden lg:block w-[320px]">
                <NoteSidebar notes={notes} />
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
            {/* Note sidebar intentionally removed from Success screen per request */}
        </div>
    );


    return (
        <div className="flex flex-col h-screen font-['Baloo_2']">

            <DashNav heading="Give Mock Interview" />

            {bookingError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-30" onClick={() => setBookingError('')} />
                    <div className="bg-white rounded-lg p-6 z-60 w-full max-w-md mx-4 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Booking Error</h3>
                        <p className="text-sm mb-4 whitespace-pre-wrap">{bookingError}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setBookingError('')}
                                className="px-4 py-2 rounded-lg text-white font-semibold"
                                style={{
                                    background: "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 max-h-screen overflow-auto bg-[#F0FF0] p-6">
                {currentScreen === 'form' && <FormScreen />}
                {currentScreen === 'payment' && <PaymentScreen />}
                {currentScreen === 'success' && <SuccessScreen />}
            </div>
        </div>
    );
};

export default GiveMockInterview;