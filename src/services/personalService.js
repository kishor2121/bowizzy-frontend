import api from "@/api";

// GET personal details by user_id (without needing personal_details_id)
export const getPersonalDetailsByUserId = async (userId, token) => {
  try {
    const response = await api.get(
      `/users/${userId}/personal-details`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // No data exists yet
      return null;
    }
    console.error("Error fetching personal details:", error);
    throw error;
  }
};

// GET personal details by ID
export const getPersonalDetails = async (userId, token, personalDetailsId) => {
  try {
    const response = await api.get(
      `/users/${userId}/personal-details/${personalDetailsId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching personal details:", error);
    throw error;
  }
};

// POST - Create new personal details
export const savePersonalDetails = async (userId, token, personal) => {
  const payload = {
    profile_photo_url: personal.uploadedPhotoURL || "",
    first_name: personal.firstName || "",
    middle_name: personal.middleName || "",
    last_name: personal.lastName || "",
    email: personal.email || "",
    mobile_number: personal.mobileNumber || "",
    date_of_birth: (personal.dateOfBirth && { date_of_birth: personal.dateOfBirth }),
    gender: personal.gender?.toLowerCase() || "male",
    languages_known: Array.isArray(personal.languages) ? personal.languages : [],
    address: personal.address || "",
    country: personal.country || "",
    state: personal.state || "",
    city: personal.city || "",
    pincode: personal.pincode || "",
    nationality: personal.nationality || "",
    passport_number: personal.passportNumber || "",
  };

  const response = await api.post(`/users/${userId}/personal-details`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  return response.data;
};

// PUT - Update existing personal details (optimized for partial updates)
export const updatePersonalDetails = async (
  userId,
  token,
  personalDetailsId,
  personal
) => {
  // Create payload with only provided fields
  const payload = {};
  
  // Map frontend field names to backend field names, only if they exist
  if (personal.uploadedPhotoURL !== undefined) {
    payload.profile_photo_url = personal.uploadedPhotoURL;
  }
  if (personal.firstName !== undefined) {
    payload.first_name = personal.firstName;
  }
  if (personal.middleName !== undefined) {
    payload.middle_name = personal.middleName;
  }
  if (personal.lastName !== undefined) {
    payload.last_name = personal.lastName;
  }
  if (personal.email !== undefined) {
    payload.email = personal.email;
  }
  if (personal.mobileNumber !== undefined) {
    payload.mobile_number = personal.mobileNumber;
  }
  if (personal.dateOfBirth !== undefined) {
    payload.date_of_birth = personal.dateOfBirth;
  }
  if (personal.gender !== undefined) {
    payload.gender = personal.gender?.toLowerCase();
  }
  if (personal.languages !== undefined) {
    payload.languages_known = Array.isArray(personal.languages) ? personal.languages : [];
  }
  if (personal.languages_known !== undefined) {
    payload.languages_known = personal.languages_known;
  }
  if (personal.address !== undefined) {
    payload.address = personal.address;
  }
  if (personal.country !== undefined) {
    payload.country = personal.country;
  }
  if (personal.state !== undefined) {
    payload.state = personal.state;
  }
  if (personal.city !== undefined) {
    payload.city = personal.city;
  }
  if (personal.pincode !== undefined) {
    payload.pincode = personal.pincode;
  }
  if (personal.nationality !== undefined) {
    payload.nationality = personal.nationality;
  }
  if (personal.passportNumber !== undefined) {
    payload.passport_number = personal.passportNumber;
  }
  if (personal.passport_number !== undefined) {
    payload.passport_number = personal.passport_number;
  }

  console.log("PUT request payload (only changed fields):", payload);

  const response = await api.put(
    `/users/${userId}/personal-details/${personalDetailsId}`,
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