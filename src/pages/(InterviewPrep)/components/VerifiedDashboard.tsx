import { useState, useEffect } from "react";
import api from '../../../api';
import InterviewCard from "./InterviewCard";
import SavedInterviewCard from "./SavedInterviewCard";
import InterviewDetailsView from "./InterviewDetailsView";
import VerifiedDashboardHeader from "./VerifiedDashboardHeader";
import { saveInterviewSlot, getSavedInterviewSlots, removeSavedInterviewSlot } from '@/services/interviewPrepService';

interface Interview {
  id: string;
  job_role?: string;
  title: string;
  experience: string;
  date: string;
  time: string;
  credits?: number;
  priority?: string;
  interview_slot_id?: string;
  interview_schedule_id?: string;
  start_time_utc?: string;
  end_time_utc?: string;
  skills?: string[];
  resume_url?: string;
  interview_code?: string;
  interview_mode?: string;
  candidate_id?: string | number;
  is_payment_done?: boolean;
}

interface VerifiedDashboardProps {
  onViewDetails?: (interview: Interview, type: 'scheduled' | 'available' | 'saved') => void;
}

const VerifiedDashboard = ({ onViewDetails: externalOnViewDetails }: VerifiedDashboardProps) => {
  const [showAllScheduled, setShowAllScheduled] = useState(false);
  const [showAllAvailable, setShowAllAvailable] = useState(true);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [viewType, setViewType] = useState<'scheduled' | 'available' | 'saved' | null>(null);
  
  // Saved interviews state (loaded from API)
  const [savedInterviews, setSavedInterviews] = useState<Interview[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState<boolean>(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  // Scheduled interviews - fetched from API
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [isScheduledLoading, setIsScheduledLoading] = useState(false);
  const [scheduledError, setScheduledError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchSaved = async () => {
      setIsSavedLoading(true);
      setSavedError(null);
      try {
        const parsed = JSON.parse(localStorage.getItem("user") || "{}");
        const token = parsed?.token || localStorage.getItem("token");
        const userId = parsed?.user_id || parsed?.userId || parsed?.id || localStorage.getItem("user_id");
        if (!userId || !token) {
          setSavedInterviews([]);
        } else {
          const data = await getSavedInterviewSlots(userId, token);
          const items: any[] = Array.isArray(data) ? data : (data?.saved_interview_slots ? data.saved_interview_slots : (data || []));
          const now = Date.now();
          const normalize = (item: any): Interview => {
            const slot = item.interview_slot || item;
            const get = (k: string) => slot[k];
            const start = get('start_time_utc') ?? get('start_time') ?? slot.date ?? null;
            const end = get('end_time_utc') ?? get('end_time') ?? null;
            return {
              id: String(slot.interview_slot_id ?? slot.id ?? item.saved_slot_id ?? Math.random()),
              interview_slot_id: String(slot.interview_slot_id ?? slot.id ?? ''),
              interview_code: slot.interview_code ?? slot.code ?? undefined,
              job_role: slot.job_role ?? slot.title ?? undefined,
              title: slot.job_role ?? slot.title ?? 'Interview',
              experience: slot.experience ?? slot.experienceLevel ?? '',
              date: start ? new Date(start).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : (slot.date ?? ''),
              time: start ? `${new Date(start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}${end ? ' - ' + new Date(end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}` : (slot.time ?? ''),
              start_time_utc: start ?? undefined,
              end_time_utc: end ?? undefined,
              skills: slot.skills ?? [],
              resume_url: slot.resume_url ?? slot.resumeUrl ?? undefined,
              interview_mode: slot.interview_mode ?? slot.mode ?? undefined,
              candidate_id: slot.candidate_id ?? slot.candidateId ?? undefined,
              is_payment_done: slot.is_payment_done ?? slot.isPaymentDone ?? undefined,
              priority: slot.priority ?? undefined,
            } as Interview;
          };

          const mapped = items
            .map(normalize)
            .filter(i => {
              const end = i.end_time_utc ? new Date(i.end_time_utc) : (i.start_time_utc ? new Date(i.start_time_utc) : null);
              return !(end && end.getTime() < now);
            });

          setSavedInterviews(mapped);
        }
      } catch (err: unknown) {
        setSavedError((err as Error)?.message ?? 'Failed to load saved interviews');
      } finally {
        setIsSavedLoading(false);
      }
    };

    fetchSaved();

    const fetchScheduled = async () => {
      setIsScheduledLoading(true);
      setScheduledError(null);
      try {
        const parsed = JSON.parse(localStorage.getItem("user") || "{}");
        const token = parsed?.token || localStorage.getItem("token");
        const userId = parsed?.user_id || parsed?.userId || parsed?.id || localStorage.getItem("user_id");
        const path = userId ? `/users/${userId}/mock-interview/interview-schedule` : `/users/mock-interview/interview-schedule`;
        const res = await api.get(path, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = res?.data ?? [];

        const mapSlot = (slot: unknown): Interview => {
          const s = slot as Record<string, unknown>;
          const get = (k: string) => s[k] as unknown;
          return {
            interview_slot_id: String(
              get('interview_slot_id') ?? get('interviewSlotId') ?? get('slotId') ?? get('slot_id') ?? get('id') ?? get('_id') ?? Math.random()
            ),
            start_time_utc: (get('start_time_utc') ?? get('start_time') ?? get('startTime') ?? get('ts_range') ?? get('start')) as string | undefined,
            end_time_utc: (get('end_time_utc') ?? get('end_time') ?? get('endTime')) as string | undefined,
            skills: (get('skills') ?? get('skill') ?? []) as string[] | undefined,
            resume_url: (get('resume_url') ?? get('resumeUrl') ?? get('resume') ?? get('resumeUrl')) as string | undefined,
            interview_code: (get('interview_code') ?? get('code') ?? get('interviewCode')) as string | undefined,
            interview_mode: (get('interview_mode') ?? get('mode') ?? get('interviewMode')) as string | undefined,
            candidate_id: (get('candidate_id') ?? get('candidateId') ?? get('candidate')) as string | number | undefined,
            is_payment_done: (get('is_payment_done') ?? get('isPaymentDone') ?? get('payment_done')) as boolean | undefined,
            interview_schedule_id: String(
              get('interview_schedule_id') ?? get('interviewScheduleId') ?? get('scheduleId') ?? get('schedule_id') ?? ''
            ),
            id: String(get('id') ?? get('_id') ?? get('slotId') ?? get('slot_id') ?? Math.random()),
            job_role: (get('job_role') ?? get('title') ?? get('role') ?? get('position') ?? get('jobTitle')) as string | undefined,
            title: (get('job_role') ?? get('title') ?? get('role') ?? get('position') ?? get('jobTitle') ?? 'Interview') as string,
            experience: (get('experience') ?? get('experienceLevel') ?? '') as string,
            date: (get('date') ?? get('slotDate') ?? get('startDate') ?? get('day') ?? '') as string,
            time: (get('time') ?? get('slotTime') ?? get('startTime') ?? '') as string,
            credits: (get('credits') ?? get('credit')) as number | undefined,
            priority: (get('priority') ?? get('priorityLevel')) as string | undefined,
          };
        };

        if (mounted) {
            if (Array.isArray(data)) {
              const mapped = data.map(mapSlot).filter(slot => {
                const end = slot.end_time_utc ? new Date(slot.end_time_utc) : (slot.start_time_utc ? new Date(slot.start_time_utc) : null);
                return !(end && end.getTime() < Date.now());
              });
              setScheduledInterviews(mapped);
            } else {
              const arr = Array.isArray(data.schedules) ? data.schedules : (Array.isArray(data.slots) ? data.slots : []);
              const mapped = arr.map(mapSlot).filter(slot => {
                const end = slot.end_time_utc ? new Date(slot.end_time_utc) : (slot.start_time_utc ? new Date(slot.start_time_utc) : null);
                return !(end && end.getTime() < Date.now());
              });
              setScheduledInterviews(mapped);
            }
        }
          } catch (err: unknown) {
        setScheduledError((err as Error)?.message ?? 'Failed to load scheduled interviews');
      } finally {
        if (mounted) setIsScheduledLoading(false);
      }
    };

    fetchScheduled();
    return () => {
      mounted = false;
    };
  }, []);

  const [availableInterviews, setAvailableInterviews] = useState<Interview[]>([]);
  const [isAvailableLoading, setIsAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchSlots = async () => {
      setIsAvailableLoading(true);
      setAvailableError(null);
      try {
        const parsed = JSON.parse(localStorage.getItem("user") || "{}");
        const token = parsed?.token || localStorage.getItem("token");
        const res = await api.get('/users/mock-interview/interview-slots', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = res?.data ?? [];

        const mapSlot = (slot: unknown): Interview => {
          const s = slot as Record<string, unknown>;
          const get = (k: string) => s[k] as unknown;
          return {
            interview_slot_id: String(
              get('interview_slot_id') ?? get('interviewSlotId') ?? get('slotId') ?? get('slot_id') ?? get('id') ?? get('_id') ?? Math.random()
            ),
            start_time_utc: (get('start_time_utc') ?? get('start_time') ?? get('startTime') ?? get('ts_range') ?? get('start')) as string | undefined,
            end_time_utc: (get('end_time_utc') ?? get('end_time') ?? get('endTime')) as string | undefined,
            skills: (get('skills') ?? get('skill') ?? []) as string[] | undefined,
            resume_url: (get('resume_url') ?? get('resumeUrl') ?? get('resume') ?? get('resumeUrl')) as string | undefined,
            interview_code: (get('interview_code') ?? get('code') ?? get('interviewCode')) as string | undefined,
            interview_mode: (get('interview_mode') ?? get('mode') ?? get('interviewMode')) as string | undefined,
            candidate_id: (get('candidate_id') ?? get('candidateId') ?? get('candidate')) as string | number | undefined,
            is_payment_done: (get('is_payment_done') ?? get('isPaymentDone') ?? get('payment_done')) as boolean | undefined,
            id: String(get('id') ?? get('_id') ?? get('slotId') ?? get('slot_id') ?? Math.random()),
            job_role: (get('job_role') ?? get('title') ?? get('role') ?? get('position') ?? get('jobTitle')) as string | undefined,
            title: (get('title') ?? get('role') ?? get('position') ?? get('jobTitle') ?? 'Interview') as string,
            experience: (get('experience') ?? get('experienceLevel') ?? '') as string,
            date: (get('date') ?? get('slotDate') ?? get('startDate') ?? get('day') ?? '') as string,
            time: (get('time') ?? get('slotTime') ?? get('startTime') ?? '') as string,
            credits: (get('credits') ?? get('credit')) as number | undefined,
            priority: (get('priority') ?? get('priorityLevel')) as string | undefined,
          };
        };

        if (mounted) {
            if (Array.isArray(data)) {
            const mapped = data.map(mapSlot).filter(slot => {
              const end = slot.end_time_utc ? new Date(slot.end_time_utc) : (slot.start_time_utc ? new Date(slot.start_time_utc) : null);
              return !(end && end.getTime() < Date.now());
            });
            setAvailableInterviews(mapped);
          } else {
            const arr = Array.isArray(data.slots) ? data.slots : [];
            const mapped = arr.map(mapSlot).filter(slot => {
              const end = slot.end_time_utc ? new Date(slot.end_time_utc) : (slot.start_time_utc ? new Date(slot.start_time_utc) : null);
              return !(end && end.getTime() < Date.now());
            });
            setAvailableInterviews(mapped);
          }
        }
      } catch (err: unknown) {
        setAvailableError((err as Error)?.message ?? 'Failed to load available interviews');
      } finally {
        if (mounted) setIsAvailableLoading(false);
      }
    };

    fetchSlots();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizeSavedItem = (item: any): Interview => {
    const slot = item.interview_slot || item;
    const get = (k: string) => slot[k];
    const start = get('start_time_utc') ?? get('start_time') ?? slot.date ?? null;
    const end = get('end_time_utc') ?? get('end_time') ?? null;
    return {
      id: String(slot.interview_slot_id ?? slot.id ?? item.saved_slot_id ?? Math.random()),
      interview_slot_id: String(slot.interview_slot_id ?? slot.id ?? ''),
      // attach saved_slot_id so callers can delete
      // @ts-ignore - dynamic shape
      saved_slot_id: item.saved_slot_id ?? item.id ?? slot.saved_slot_id ?? undefined,
      interview_code: slot.interview_code ?? slot.code ?? undefined,
      job_role: slot.job_role ?? slot.title ?? undefined,
      title: slot.job_role ?? slot.title ?? 'Interview',
      experience: slot.experience ?? slot.experienceLevel ?? '',
      date: start ? new Date(start).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : (slot.date ?? ''),
      time: start ? `${new Date(start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}${end ? ' - ' + new Date(end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}` : (slot.time ?? ''),
      start_time_utc: start ?? undefined,
      end_time_utc: end ?? undefined,
      skills: slot.skills ?? [],
      resume_url: slot.resume_url ?? slot.resumeUrl ?? undefined,
      interview_mode: slot.interview_mode ?? slot.mode ?? undefined,
      candidate_id: slot.candidate_id ?? slot.candidateId ?? undefined,
      is_payment_done: slot.is_payment_done ?? slot.isPaymentDone ?? undefined,
      priority: slot.priority ?? undefined,
    } as Interview;
  };

  const displayedScheduled = showAllScheduled
    ? scheduledInterviews
    : scheduledInterviews.slice(0, 2);
  const displayedAvailable = showAllAvailable
    ? availableInterviews
    : availableInterviews.slice(0, 2);
  const displayedSaved = showAllSaved
    ? savedInterviews
    : savedInterviews.slice(0, 2);

  const handleViewDetails = (interview: Interview, type: 'scheduled' | 'available' | 'saved') => {
    // For scheduled/available, fetch full details from API before showing
    const fetchAndShow = async () => {
      setDetailsError(null);
      setIsDetailsLoading(true);
      try {
        const parsed = JSON.parse(localStorage.getItem("user") || "{}");
        const token = parsed?.token || localStorage.getItem("token");
        const userId = parsed?.user_id || parsed?.userId || parsed?.id || localStorage.getItem("user_id");
        // For scheduled items use interview_schedule_id; for available use interview_slot_id
        // Pick identifier and endpoint based on type
        const slotId = type === 'scheduled'
          ? (interview.interview_schedule_id || interview.id)
          : (interview.interview_slot_id || interview.id);
        let path: string;
        if (type === 'scheduled') {
          path = userId
            ? `/users/${userId}/mock-interview/interview-schedule/${slotId}`
            : `/users/mock-interview/interview-schedule/${slotId}`;
        } else if (type === 'available') {
          // Use public slot endpoint (no /users prefix) per API requirement
          path = `/mock-interview/interview-slot/${slotId}`;
        } else {
          path = userId
            ? `/users/${userId}/mock-interview/interview-slot/${slotId}`
            : `/users/mock-interview/interview-slot/${slotId}`;
        }

        const res = await api.get(path, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = res?.data ?? res;
        const slot = Array.isArray(data) ? data[0] : data;

        const detailed: Interview = {
          interview_slot_id: String(
            slot.interview_slot_id ?? slot.interviewSlotId ?? slot.slotId ?? slot.slot_id ?? slot.id ?? slot._id ?? interview.interview_slot_id ?? interview.id
          ),
          interview_schedule_id: String(
            slot.interview_schedule_id ?? slot.interviewScheduleId ?? slot.scheduleId ?? slot.schedule_id ?? interview.interview_schedule_id ?? ''
          ),
          id: String(slot.id ?? slot._id ?? slot.slotId ?? slot.slot_id ?? interview.id),
          job_role: slot.job_role ?? slot.jobRole ?? slot.role ?? slot.title ?? interview.job_role ?? interview.title,
          title: slot.title ?? slot.role ?? interview.title,
          experience: slot.experience ?? slot.experienceLevel ?? interview.experience,
          date: slot.date ?? slot.slotDate ?? interview.date,
          time: slot.time ?? slot.slotTime ?? interview.time,
          start_time_utc: slot.start_time_utc ?? slot.start_time ?? slot.startTime ?? interview.start_time_utc,
          end_time_utc: slot.end_time_utc ?? slot.end_time ?? slot.endTime ?? interview.end_time_utc,
          skills: slot.skills ?? slot.skill ?? interview.skills,
          resume_url: slot.resume_url ?? slot.resumeUrl ?? interview.resume_url,
          interview_code: slot.interview_code ?? slot.code ?? interview.interview_code,
          interview_mode: slot.interview_mode ?? slot.mode ?? interview.interview_mode,
          candidate_id: slot.candidate_id ?? slot.candidateId ?? interview.candidate_id,
          is_payment_done: slot.is_payment_done ?? slot.isPaymentDone ?? interview.is_payment_done,
          credits: slot.credits ?? slot.credit ?? interview.credits,
          priority: slot.priority ?? slot.priorityLevel ?? interview.priority,
        };

        setSelectedInterview(detailed);
        setViewType(type);
        if (externalOnViewDetails) externalOnViewDetails(detailed, type);
      } catch (err: unknown) {
        setDetailsError((err as Error)?.message ?? 'Failed to load interview details');
      } finally {
        setIsDetailsLoading(false);
      }
    };

    if (type === 'scheduled' || type === 'available') {
      fetchAndShow();
    } else {
      setSelectedInterview(interview);
      setViewType(type);
      if (externalOnViewDetails) {
        externalOnViewDetails(interview, type);
      }
    }
  };

  const handleBack = () => {
    setSelectedInterview(null);
    setViewType(null);
  };

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleBookInterview = () => {
    // After booking, the interview moves to scheduled
    // Return to dashboard
    setSelectedInterview(null);
    setViewType(null);
  };

  // Handle save/unsave interview
  const handleToggleSaveInterview = async (interview: Interview) => {
    const isAlreadySaved = savedInterviews.some(saved => saved.interview_slot_id === (interview.interview_slot_id ?? interview.id) || saved.id === interview.id);

    if (isAlreadySaved) {
      // Remove locally and (optionally) backend removal is handled elsewhere
      setSavedInterviews(savedInterviews.filter(saved => !(saved.interview_slot_id === (interview.interview_slot_id ?? interview.id) || saved.id === interview.id)));
      return;
    }

    // Call backend save API then refresh saved list
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "{}");
      const token = parsed?.token || localStorage.getItem("token");
      const userId = parsed?.user_id || parsed?.userId || parsed?.id || localStorage.getItem("user_id");
      const slotId = interview.interview_slot_id ?? interview.id;
      const payload = {
        interview_slot_id: Number(slotId),
        interview_priority: (interview.priority ?? 'normal')
      };

      if (userId && token) {
        await saveInterviewSlot(userId, token, payload);
        // refresh saved list from API
        try {
          const data = await getSavedInterviewSlots(userId, token);
          const items: any[] = Array.isArray(data) ? data : (data?.saved_interview_slots ? data.saved_interview_slots : (data || []));
          const normalize = (item: any): Interview => {
            const slot = item.interview_slot || item;
            const get = (k: string) => slot[k];
            const start = get('start_time_utc') ?? get('start_time') ?? slot.date ?? null;
            const end = get('end_time_utc') ?? get('end_time') ?? null;
            return {
              id: String(slot.interview_slot_id ?? slot.id ?? item.saved_slot_id ?? Math.random()),
              interview_slot_id: String(slot.interview_slot_id ?? slot.id ?? ''),
              interview_code: slot.interview_code ?? slot.code ?? undefined,
              job_role: slot.job_role ?? slot.title ?? undefined,
              title: slot.job_role ?? slot.title ?? 'Interview',
              experience: slot.experience ?? slot.experienceLevel ?? '',
              date: start ? new Date(start).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : (slot.date ?? ''),
              time: start ? `${new Date(start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}${end ? ' - ' + new Date(end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}` : (slot.time ?? ''),
              start_time_utc: start ?? undefined,
              end_time_utc: end ?? undefined,
              skills: slot.skills ?? [],
              resume_url: slot.resume_url ?? slot.resumeUrl ?? undefined,
              interview_mode: slot.interview_mode ?? slot.mode ?? undefined,
              candidate_id: slot.candidate_id ?? slot.candidateId ?? undefined,
              is_payment_done: slot.is_payment_done ?? slot.isPaymentDone ?? undefined,
              priority: slot.priority ?? undefined,
            } as Interview;
          };
          const mapped = items.map(normalize).filter(i => {
            const now = Date.now();
            const end = i.end_time_utc ? new Date(i.end_time_utc) : (i.start_time_utc ? new Date(i.start_time_utc) : null);
            return !(end && end.getTime() < now);
          });
          setSavedInterviews(mapped);
        } catch (e) {
          console.warn('Failed to refresh saved interviews after save', e);
        }
      } else {
        console.warn('No user token available for saveInterviewSlot; saving locally');
        setSavedInterviews(prev => [...prev, interview]);
      }
    } catch (err) {
      console.error('Failed to save interview slot:', err);
      setSavedInterviews(prev => [...prev, interview]);
    }
  };

  // Check if interview is saved
  const isInterviewSaved = (interviewId: string) => {
    return savedInterviews.some(saved => saved.id === interviewId);
  };

  // If viewing details, show loading / error / InterviewDetailsView
  if (isDetailsLoading && viewType) {
    return (
      <div className="space-y-6">
        <VerifiedDashboardHeader onBack={handleBack} title="Take Mock Interview" />
        <div className="p-6">
          <p className="text-sm text-gray-500">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (detailsError && viewType && !isDetailsLoading) {
    return (
      <div className="space-y-6">
        <VerifiedDashboardHeader onBack={handleBack} title="Take Mock Interview" />
        <div className="p-6">
          <p className="text-sm text-red-500">{detailsError}</p>
        </div>
      </div>
    );
  }

  if (selectedInterview && viewType) {
    return (
      <div className="space-y-6">
        <VerifiedDashboardHeader onBack={handleBack} title="Take Mock Interview" />

        <InterviewDetailsView
          interview={selectedInterview}
          viewType={viewType}
          onBack={handleBack}
          savedInterviews={savedInterviews}
          showAllSaved={showAllSaved}
          onToggleSaved={() => setShowAllSaved(!showAllSaved)}
          onViewDetails={handleViewDetails}
          onBook={handleBookInterview}
          onToggleSaveInterview={handleToggleSaveInterview}
          isInterviewSaved={isInterviewSaved(selectedInterview.id)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8351] hover:bg-[#FF8351] hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Take Mock Interview
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center gap-2 bg-white rounded-md w-80 h-13 text-sm text-gray-700 px-4 py-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">You are verified as Interviewer</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Scheduled Interviews Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-[#FF8351]">
                Scheduled Interview(s)
              </h2>
              <button
                onClick={() => setShowAllScheduled(!showAllScheduled)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    showAllScheduled ? "rotate-0" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {isScheduledLoading ? (
                <p className="text-sm text-gray-500">Loading scheduled interviews...</p>
              ) : scheduledError ? (
                <p className="text-sm text-red-500">{scheduledError}</p>
              ) : displayedScheduled.length === 0 ? (
                <p className="text-sm text-gray-500">No scheduled interviews</p>
              ) : (
                displayedScheduled.map((interview, index) => (
                  <InterviewCard
                    key={index}
                    interview={interview}
                    isScheduled={true}
                    onViewDetails={() => handleViewDetails(interview, 'scheduled')}
                  />
                ))
              )}
            </div>
          </div>

          {/* Available Interviews Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-[#FF8351]">
                Available Interview(s)
              </h2>
              <button
                onClick={() => setShowAllAvailable(!showAllAvailable)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    showAllAvailable ? "rotate-0" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {isAvailableLoading ? (
                <p className="text-sm text-gray-500">Loading available interviews...</p>
              ) : availableError ? (
                <p className="text-sm text-red-500">{availableError}</p>
              ) : displayedAvailable.length === 0 ? (
                <p className="text-sm text-gray-500">No available interviews</p>
              ) : (
                displayedAvailable.map((interview, index) => (
                  <InterviewCard
                    key={index}
                    interview={interview}
                    isScheduled={false}
                    onViewDetails={() => handleViewDetails(interview, 'available')}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Credits Card */}
          <div className="bg-[#FFF9F0] rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              W
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                100 Credit(s) available
              </p>
              <a href="#" className="text-sm text-[#FF8351] font-medium">
                Redeem in store →
              </a>
            </div>
          </div>

          {/* Saved Interviews Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-medium text-[#FF8351]">
                Saved Interview(s)
              </h2>
              <button
                onClick={() => setShowAllSaved(!showAllSaved)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showAllSaved ? "rotate-0" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {displayedSaved.length > 0 ? (
                displayedSaved.map((interview, index) => (
                  <SavedInterviewCard
                    key={index}
                    interview={interview}
                    onViewDetails={() =>
                      handleViewDetails(
                        {
                          ...interview,
                          credits: 15,
                          priority: "HIGH",
                        },
                        'saved'
                      )
                    }
                    onRemove={async (payload) => {
                      try {
                        const parsed = JSON.parse(localStorage.getItem("user") || "{}");
                        const token = parsed?.token || localStorage.getItem("token");
                        const userId = parsed?.user_id || parsed?.userId || parsed?.id || localStorage.getItem("user_id");
                        // Prefer saved_slot_id from the saved item when present, then payload.
                        const resolvedSavedSlotId = (savedInterviews[index] && (savedInterviews[index] as any).saved_slot_id) ?? payload?.saved_slot_id ?? payload?.id ?? payload?.interview_slot_id;
                        console.debug('VerifiedDashboard remove - payload:', payload, 'resolvedSavedSlotId:', resolvedSavedSlotId);
                        if (userId && token && resolvedSavedSlotId) {
                          await removeSavedInterviewSlot(userId, token, resolvedSavedSlotId);
                        }
                      } catch (err) {
                        console.error('Failed to remove saved slot', err);
                      } finally {
                        try {
                          const parsed = JSON.parse(localStorage.getItem("user") || "{}");
                          const token = parsed?.token || localStorage.getItem("token");
                          const userId = parsed?.user_id || parsed?.userId || parsed?.id || localStorage.getItem("user_id");
                          if (userId && token) {
                            const data = await getSavedInterviewSlots(userId, token);
                            const items: any[] = Array.isArray(data) ? data : (data?.saved_interview_slots ? data.saved_interview_slots : (data || []));
                            const mapped = items.map(normalizeSavedItem).filter(i => {
                              const end = i.end_time_utc ? new Date(i.end_time_utc) : (i.start_time_utc ? new Date(i.start_time_utc) : null);
                              return !(end && end.getTime() < Date.now());
                            });
                            setSavedInterviews(mapped);
                          } else {
                            setSavedInterviews([]);
                          }
                        } catch (e) {
                          console.warn('Failed to refresh saved list after removal', e);
                        }
                      }
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No saved interviews
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedDashboard;