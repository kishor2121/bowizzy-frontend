import api from "@/api";

export const uploadResume = async (userId, file, token) => {
  const formData = new FormData();
  formData.append("file", file);


  return await api.post(`/users/${userId}/resume/extract`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};
