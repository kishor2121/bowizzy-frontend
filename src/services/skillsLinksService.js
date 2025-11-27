import api from "@/api";

// --- SKILLS API ---

// Get all skill records for a user
export const getSkillsByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/skills`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Create new skill records (POST)
export const saveSkillsDetails = async (userId, token, skillsPayload) => {
    const response = await api.post(`/users/${userId}/skills`, { skills: skillsPayload }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Update existing skill record (PUT)
export const updateSkillDetails = async (userId, token, skillId, skillData) => {
    const response = await api.put(`/users/${userId}/skills/${skillId}`, skillData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Delete skill record by skill_id
export const deleteSkill = async (userId, token, skillId) => {
    const response = await api.delete(`/users/${userId}/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};


// --- LINKS API ---

// Get all link records for a user
export const getLinksByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/links`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Create new link records (POST)
export const saveLinksDetails = async (userId, token, linksPayload) => {
    const response = await api.post(`/users/${userId}/links`, { links: linksPayload }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Update existing link record (PUT)
export const updateLinkDetails = async (userId, token, linkId, linkData) => {
    const response = await api.put(`/users/${userId}/links/${linkId}`, linkData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Delete link record by link_id
export const deleteLink = async (userId, token, linkId) => {
    const response = await api.delete(`/users/${userId}/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};


// --- BULK SAVE FROM FORM (Used by Proceed to Next) ---

// Transform form data to API format and handle bulk save/update/delete
export const saveSkillsAndLinksFromForm = async (userId, token, form, deleteIds) => {
    const { skills, links } = form;
    const { deletedSkillIds, deletedLinkIds } = deleteIds;

    const skillUpdatePromises = [];
    const skillCreatePayloads = [];
    
    // Process existing and new skills
    skills.filter(s => s.skillName).forEach(s => {
        const payload = { 
            skill_name: s.skillName, 
            skill_level: s.skillLevel 
        };
        if (s.skill_id) {
            skillUpdatePromises.push(updateSkillDetails(userId, token, s.skill_id, payload));
        } else {
            skillCreatePayloads.push(payload);
        }
    });

    const linkUpdatePromises = [];
    const linkCreatePayloads = [];

    // Process links (mapping form structure to API objects)
    links.forEach(l => {
        const linkObjects = [
            l.linkedinProfile && { link_type: "linkedin", url: l.linkedinProfile, description: null, link_id: l.link_id_linkedin },
            l.githubProfile && { link_type: "github", url: l.githubProfile, description: null, link_id: l.link_id_github },
            l.portfolioUrl && { link_type: "portfolio", url: l.portfolioUrl, description: l.portfolioDescription, link_id: l.link_id_portfolio },
            l.publicationUrl && { link_type: "publication", url: l.publicationUrl, description: l.publicationDescription, link_id: l.link_id_publication }
        ].filter(Boolean);

        linkObjects.forEach(f => {
            const payload = { url: f.url, link_type: f.link_type, description: f.description };
            
            if (f.link_id) {
                // Assumption: Individual PUTs were handled in the component. Rely on PUT for safety here.
                linkUpdatePromises.push(updateLinkDetails(userId, token, f.link_id, payload));
            } else if (f.url) {
                // New link object
                linkCreatePayloads.push(payload);
            }
        });
    });

    const skillDeletePromises = deletedSkillIds.map(id => deleteSkill(userId, token, id));
    const linkDeletePromises = deletedLinkIds.map(id => deleteLink(userId, token, id));

    const [skillUpdateResults, linkUpdateResults, skillDeleteResults, linkDeleteResults] = await Promise.all([
        Promise.all(skillUpdatePromises),
        Promise.all(linkUpdatePromises),
        Promise.all(skillDeletePromises),
        Promise.all(linkDeletePromises),
    ]);

    let skillCreateResults = null;
    if (skillCreatePayloads.length > 0) {
        skillCreateResults = await saveSkillsDetails(userId, token, skillCreatePayloads);
    }
    
    let linkCreateResults = null;
    if (linkCreatePayloads.length > 0) {
        linkCreateResults = await saveLinksDetails(userId, token, linkCreatePayloads);
    }

    return {
        skills: { created: skillCreateResults, updated: skillUpdateResults, deleted: skillDeleteResults },
        links: { created: linkCreateResults, updated: linkUpdateResults, deleted: linkDeleteResults },
    };
};