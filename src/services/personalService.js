import api from "@/api";

export const savePersonalDetails = async (userId, token, personal) => {
  const fd = new FormData();

  fd.append("user_id", userId);
  fd.append("first_name", personal.firstName || "");
  fd.append("middle_name", personal.middleName || "");
  fd.append("last_name", personal.lastName || "");
  fd.append("email", personal.email || "");
  fd.append("mobile_number", personal.mobileNumber || "");
  fd.append("gender", personal.gender || "");

  if (personal.dateOfBirth) {
    fd.append("date_of_birth", personal.dateOfBirth);
  }

  if (Array.isArray(personal.languages)) {
    personal.languages.forEach((lang) =>
      fd.append("languages_known[]", lang)
    );
  }

  if (personal.uploadedPhotoURL) {
    fd.append("profile_photo_url", personal.uploadedPhotoURL);
  } else if (personal.profilePhoto instanceof File) {
    fd.append("profile_photo_url", personal.profilePhoto);
  } else if (typeof personal.profilePhoto === "string") {
    fd.append("profile_photo_url", personal.profilePhoto);
  }

  fd.append("address", personal.address || "");
  fd.append("country", personal.country || "");
  fd.append("state", personal.state || "");
  fd.append("city", personal.city || "");
  fd.append("pincode", personal.pincode || "");
  fd.append("nationality", personal.nationality || "");
  fd.append("passport_number", personal.passportNumber || "");

  return await api.post(`/users/${userId}/personal-details`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
