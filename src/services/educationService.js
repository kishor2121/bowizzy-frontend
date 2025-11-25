import api from "@/api";

export const saveEducationDetails = async (userId, token, educationArray) => {
  return await api.post(`/users/${userId}/education`, educationArray, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveEducationFromForm = async (userId, token, educationForm) => {
  const buildYear = (val) => {
    if (val === undefined || val === null || val === "") return null;
    if (typeof val === "string" && val.includes("-")) {
      const yearPart = val.split("-")[0];
      const y = parseInt(yearPart, 10);
      return isNaN(y) ? yearPart : y;
    }
    const n = parseInt(val, 10);
    return isNaN(n) ? val : n;
  };

  const educationArray = [];

  const sslc = educationForm?.sslc;
  if (sslc && (sslc.institutionName || sslc.result || sslc.yearOfPassing)) {
    educationArray.push({
      education_type: "sslc",
      institution_name: sslc.institutionName || "",
      board_type: sslc.boardType || "",
      end_year: buildYear(sslc.yearOfPassing),
      result_format: (sslc.resultFormat || "").toLowerCase(),
      result: sslc.result || "",
    });
  }

  const puc = educationForm?.pu;
  if (puc && (puc.institutionName || puc.result || puc.yearOfPassing)) {
    educationArray.push({
      education_type: "puc",
      institution_name: puc.institutionName || "",
      board_type: puc.boardType || "",
      subject_stream: puc.subjectStream || "",
      end_year: buildYear(puc.yearOfPassing),
      result_format: (puc.resultFormat || "").toLowerCase(),
      result: puc.result || "",
    });
  }

  const higherList = [
    ...(educationForm?.higherEducations || []),
    ...(educationForm?.extraEducations || []),
  ];

  for (const he of higherList) {
    if (!he || (!he.degree && !he.institutionName && !he.fieldOfStudy)) continue;
    educationArray.push({
      education_type: "higher",
      degree: he.degree || "",
      field_of_study: he.fieldOfStudy || "",
      institution_name: he.institutionName || "",
      university_name: he.universityBoard || he.universityName || "",
      start_year: buildYear(he.startYear),
      end_year: buildYear(he.endYear),
      result_format: (he.resultFormat || "").toLowerCase(),
      result: he.result || "",
      currently_pursuing: !!he.currentlyPursuing,
    });
  }

  if (educationArray.length === 0) return null;

  return await saveEducationDetails(userId, token, educationArray);
};
