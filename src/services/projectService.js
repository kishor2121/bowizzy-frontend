import api from "@/api";

// Get all project records for a user
export const getProjectsByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/projects`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // API returns an array of projects: [{...}, {...}]
    return response.data; 
};

// Create new project records (POST)
export const saveProjectsDetails = async (userId, token, projectsPayload) => {
    // API POST payload needs to be wrapped: { projects: [...] }
    const response = await api.post(`/users/${userId}/projects`, { projects: projectsPayload }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // API returns an array of projects: [{... new project ...}]
    return response.data;
};

// Update existing project record (PUT)
export const updateProjectDetails = async (userId, token, projectId, projectData) => {
    const response = await api.put(`/users/${userId}/projects/${projectId}`, projectData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete project record by project_id
export const deleteProject = async (userId, token, projectId) => {
    const response = await api.delete(`/users/${userId}/projects/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Transform form data to API format and handle bulk save/update/delete on "Proceed to next"
export const saveProjectsFromForm = async (userId, token, projectsForm, deleteProjectIds = []) => {
    if (!projectsForm) return null;

    const normalizeMonthToDate = (val) => {
        if (!val) return null;
        if (typeof val === "string") {
            if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        }
        return val;
    };

    const projectsToProcess = projectsForm.projects || [];
    const createPayloads = [];
    const updatePromises = [];
    const deletePromises = [];

    // Process projects
    for (const p of projectsToProcess) {
        if (!p || (!p.projectTitle && !p.project_id)) continue;

        const projectData = {
            project_title: p.projectTitle || "",
            project_type: p.projectType || "",
            start_date: normalizeMonthToDate(p.startDate),
            end_date: normalizeMonthToDate(p.endDate),
            currently_working: !!p.currentlyWorking,
            description: p.description || "",
            roles_responsibilities: p.rolesAndResponsibilities || "",
        };

        if (p.project_id) {
            // Update existing
            updatePromises.push(
                updateProjectDetails(userId, token, p.project_id, projectData)
            );
        } else if (p.projectTitle) {
            // Create new
            createPayloads.push({ ...projectData });
        }
    }

    // Process deletions
    if (deleteProjectIds.length > 0) {
        for (const id of deleteProjectIds) {
            deletePromises.push(deleteProject(userId, token, id));
        }
    }

    // Execute all updates and deletions in parallel
    const [updateResults, deleteResults] = await Promise.all([
        Promise.all(updatePromises),
        Promise.all(deletePromises)
    ]);

    // Create new records
    let createResults = null;
    if (createPayloads.length > 0) {
        // Pass only the array of project objects as required by saveProjectsDetails
        createResults = await saveProjectsDetails(userId, token, createPayloads);
    }

    return {
        updated: updateResults,
        created: createResults,
        deleted: deleteResults,
    };
};