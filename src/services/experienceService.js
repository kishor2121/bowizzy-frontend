import api from "@/api";

export const saveExperienceDetails = async (userId, token, experiencePayload) => {
  return await api.post(`/users/${userId}/work-experience`, experiencePayload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveExperienceFromForm = async (userId, token, expForm) => {
  if (!expForm) return null;

  const normalizeMonthToDate = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    }
    return val;
  };

  const experiencesList = expForm.workExperiences || expForm.experienceDetails || [];
  const experiencesPayload = [];

  for (const w of experiencesList) {
    if (!w) continue;
    experiencesPayload.push({
      company_name: w.companyName || w.company_name || "",
      job_title: w.jobTitle || w.job_title || "",
      employment_type: w.employmentType || w.employment_type || "",
      location: w.location || "",
      work_mode: w.workMode || w.work_mode || "",
      start_date: normalizeMonthToDate(w.startDate || w.start_date),
      end_date: normalizeMonthToDate(w.endDate || w.end_date),
      currently_working_here: !!w.currentlyWorking || !!w.currently_working_here,
      description: w.description || "",
    });
  }

  if (experiencesPayload.length === 0 && !expForm.jobRole) return null;

  return await saveExperienceDetails(userId, token, {
    job_role: expForm.jobRole || expForm.job_role || "",
    experiences: experiencesPayload,
  });
};
