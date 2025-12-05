import api from "@/api";


export const createInterviewSlot = async (userId, token, slotPayload) => {
    const response = await api.post(`/users/${userId}/mock-interview/interview-slot?mode=online`, slotPayload, {
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

export const getInterviewSlotById = async (userId, token, slotId) => {
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

export const cancelInterviewSlot = async (userId, token, slotId) => {
    const response = await api.delete(`/users/${userId}/mock-interview/interview-slot/${slotId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const confirmInterviewSlotPayment = async (userId, token, slotId) => {
    const response = await api.put(
        `/users/${userId}/mock-interview/interview-slot/${slotId}`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    return response.data;
};

