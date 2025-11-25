import api from "@/api";

export const saveProjects = async (userId, token, projectsPayload) => {
  return await api.post(
    `/users/${userId}/projects`,
    { projects: projectsPayload },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const saveProjectsFromForm = async (userId, token, projectsForm) => {
  if (!projectsForm) return null;

  const normalizeMonthToDate = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    }
    return val;
  };

  const projectsList = projectsForm.projects || projectsForm.projectDetails || [];
  const projectsPayload = [];

  for (const p of projectsList) {
    if (!p) continue;
    projectsPayload.push({
      project_title: p.projectTitle || p.project_title || "",
      project_type: p.projectType || p.project_type || "",
      start_date: normalizeMonthToDate(p.startDate || p.start_date),
      end_date: normalizeMonthToDate(p.endDate || p.end_date),
      currently_working: !!p.currentlyWorking || !!p.currently_working,
      description: p.description || "",
      roles_responsibilities: p.rolesAndResponsibilities || p.roles_responsibilities || "",
    });
  }

  if (projectsPayload.length === 0) return null;

  return await saveProjects(userId, token, projectsPayload);
};
