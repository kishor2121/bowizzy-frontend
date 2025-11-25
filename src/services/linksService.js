import api from "@/api";

export const saveLinks = async (userId, token, linksPayload) => {
  return await api.post(
    `/users/${userId}/links`,
    { links: linksPayload },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const saveLinksFromForm = async (userId, token, linksForm) => {
  if (!linksForm) return null;

  const linksData = linksForm || {};
  const linksList = Array.isArray(linksData.links)
    ? linksData.links
    : Array.isArray(linksData)
    ? linksData
    : [];

  const linksPayload = [];

  for (const l of linksList) {
    if (!l) continue;
    if (l.linkedinProfile) {
      linksPayload.push({ link_type: "linkedin", url: l.linkedinProfile });
    }
    if (l.githubProfile) {
      linksPayload.push({ link_type: "github", url: l.githubProfile });
    }
    if (l.portfolioUrl) {
      linksPayload.push({
        link_type: "portfolio",
        url: l.portfolioUrl,
        description: l.portfolioDescription || "",
      });
    }
    if (l.publicationUrl) {
      linksPayload.push({
        link_type: "publication",
        url: l.publicationUrl,
        description: l.publicationDescription || "",
      });
    }
  }

  if (linksPayload.length === 0) return null;

  return await saveLinks(userId, token, linksPayload);
};
