import api from "../api";

export const getProfileProgress = async (userId, token) => {
  const response = await api.get(`/users/${userId}/profile-progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
