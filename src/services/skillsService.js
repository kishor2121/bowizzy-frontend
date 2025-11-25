import api from "@/api";

export const saveSkills = async (userId, token, skillsPayload) => {
  return await api.post(
    `/users/${userId}/skills`,
    { skills: skillsPayload },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const saveSkillsFromForm = async (userId, token, skillsForm) => {
  if (!skillsForm) return null;

  const skillsData = skillsForm || {};
  const skillsList = Array.isArray(skillsData.skills)
    ? skillsData.skills
    : Array.isArray(skillsData)
    ? skillsData
    : [];

  const skillsPayload = skillsList
    .filter((s) => s && (s.skillName || s.skill_name))
    .map((s) => ({
      skill_name: s.skillName || s.skill_name || "",
      skill_level: s.skillLevel || s.skill_level || "",
    }));

  if (skillsPayload.length === 0) return null;

  return await saveSkills(userId, token, skillsPayload);
};
