import api from "@/api";

export const createInterviewSlot = async (userId, token, slotPayload, mode = 'online') => {
    const response = await api.post(`/users/${userId}/mock-interview/interview-slot?mode=${mode}`, slotPayload, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const updateInterviewSlotPayment = async (userId, token, slotId) => {
    const response = await api.put(`/users/${userId}/mock-interview/interview-slot/${slotId}`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getAllInterviewSlots = async (token) => {
    const response = await api.get(`/users/mock-interview/interview-slot`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateInterviewSlot = async (userId, token, slotId, payload) => {
    const response = await api.put(
        `/users/${userId}/mock-interview/interview-slot/${slotId}`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};


export const getInterviewSlotById = async (userId, token, slotId) => {
    console.log(userId, token, slotId);
    const response = await api.get(`/users/${userId}/mock-interview/interview-slot/${slotId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getInterviewSlotsByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/mock-interview/interview-slot`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// fetch next upcoming interviews (more detailed endpoint)
export const getNextInterviewsByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/mock-interview/interview-schedule/next-interviews`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getCompletedInterviewsCount = async (userId, token) => {
    const response = await api.get(`/users/${userId}/mock-interview/interview-schedule/count-completed-interviews`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getInterviewScheduleById = async (userId, token, scheduleId) => {
    const response = await api.get(`/users/${userId}/mock-interview/interview-schedule/${scheduleId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const createInterviewSchedule = async (userId, token, payload) => {
    const response = await api.post(`/users/${userId}/mock-interview/interview-schedule`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const cancelInterviewSlot = async (userId, token, slotId) => {
    const payload = { interview_status: 'cancelled' };
    const response = await api.put(
        `/users/${userId}/mock-interview/interview-slot/${slotId}`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};

export const confirmInterviewSlotPayment = async (userId, token, slotId, paid_amount) => {
    const response = await api.put(
        `/users/${userId}/mock-interview/interview-slot/confirm-payment/${slotId}`,
        { paid_amount },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const saveInterviewSlot = async (userId, token, payload) => {
    const response = await api.post(`/users/${userId}/mock-interview/interview-schedule/save-interview-slot`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const getSavedInterviewSlots = async (userId, token) => {
    const response = await api.get(`/users/${userId}/mock-interview/interview-schedule/saved-interview-slots`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const removeSavedInterviewSlot = async (userId, token, savedSlotId) => {
    const response = await api.delete(`/users/${userId}/mock-interview/interview-schedule/remove-interview-slot/${savedSlotId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

