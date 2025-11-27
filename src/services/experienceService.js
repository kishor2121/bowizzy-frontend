import api from "@/api";

// Get all experience records for a user
export const getExperienceByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/work-experience`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // API returns { job_role: ..., experiences: [...] } on GET all
    return response.data; 
};

// Create new experience records (POST)
export const saveExperienceDetails = async (userId, token, experiencePayload) => {
    // API POST returns { job_role: ..., experiences: [{... new exp ...}] }
    const response = await api.post(`/users/${userId}/work-experience`, experiencePayload, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Update existing experience record (PUT)
export const updateExperienceDetails = async (userId, token, experienceId, experienceData) => {
    const response = await api.put(`/users/${userId}/work-experience/${experienceId}`, experienceData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// NEW: Dedicated API call for updating the Job Role
export const updateJobRole = async (userId, token, jobRoleData) => {
    // Note: API URL changed from example to match the structure provided:
    // PUT /users/{userId}/work-experience/job-role
    const response = await api.put(`/users/${userId}/work-experience/job-role`, jobRoleData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete experience record by experience_id
export const deleteExperience = async (userId, token, experienceId) => {
    const response = await api.delete(`/users/${userId}/work-experience/${experienceId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Transform form data to API format and handle bulk save/update/delete on "Proceed to next"
export const saveExperienceFromForm = async (userId, token, expForm, deleteExperienceIds = []) => {
    if (!expForm) return null;

    const normalizeMonthToDate = (val) => {
        if (!val) return null;
        if (typeof val === "string") {
            // Converts YYYY-MM to YYYY-MM-01
            if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`;
            // Keeps YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        }
        return val;
    };

    const experiencesToProcess = expForm.workExperiences || [];
    const createPayloads = [];
    const updatePromises = [];
    const deletePromises = [];

    // The job_role is now handled separately on save or via updateJobRole

    // Process experiences
    for (const exp of experiencesToProcess) {
        // Only process if companyName is present or it's an existing record (via experience_id)
        if (!exp || (!exp.companyName && !exp.experience_id)) continue;

        const experienceData = {
            company_name: exp.companyName || "",
            job_title: exp.jobTitle || "",
            employment_type: exp.employmentType || "",
            location: exp.location || "",
            work_mode: exp.workMode || "",
            start_date: normalizeMonthToDate(exp.startDate),
            end_date: normalizeMonthToDate(exp.endDate),
            currently_working_here: !!exp.currentlyWorking,
            description: exp.description || "",
        };

        if (exp.experience_id) {
            // Update existing (PUT) - NOTE: Job role is NOT included here as it's separate.
            updatePromises.push(
                updateExperienceDetails(userId, token, exp.experience_id, experienceData)
            );
        } else if (exp.companyName) {
            // Create new (POST bulk creation)
            createPayloads.push({ ...experienceData });
        }
    }
    
    // 1. Process Job Role update if changed (even if no experiences exist)
    const jobRoleUpdatePromise = updateJobRole(userId, token, { job_role: expForm.jobRole || "" });

    // 2. Process deletions
    if (deleteExperienceIds.length > 0) {
        for (const id of deleteExperienceIds) {
            deletePromises.push(deleteExperience(userId, token, id));
        }
    }

    // Execute all updates and deletions in parallel
    const [jobRoleResult, updateResults, deleteResults] = await Promise.all([
        jobRoleUpdatePromise,
        Promise.all(updatePromises),
        Promise.all(deletePromises)
    ]);

    // 3. Create new records
    let createResults = null;
    if (createPayloads.length > 0) {
        // NOTE: Job role must be included in the POST payload structure
        const postPayload = { job_role: expForm.jobRole || "", experiences: createPayloads };
        createResults = await saveExperienceDetails(userId, token, postPayload);
    }

    return {
        jobRole: jobRoleResult,
        updated: updateResults,
        created: createResults,
        deleted: deleteResults,
    };
};