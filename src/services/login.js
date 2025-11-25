import api from "../api";

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth", {
      type: "login",
      email,
      password,
    });

    return response.data; 
  } catch (error) {
    throw error;
  }
};
