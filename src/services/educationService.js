import api from "@/api";

// Get all education records for a user
export const getEducationByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/education`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Get single education record by education_id
export const getEducationById = async (userId, token, educationId) => {
    const response = await api.get(`/users/${userId}/education/${educationId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Create new education records (POST)
export const saveEducationDetails = async (userId, token, educationArray) => {
    const response = await api.post(`/users/${userId}/education`, educationArray, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Update existing education record (PUT)
export const updateEducationDetails = async (userId, token, educationId, educationData) => {
    console.log("Updating education:", educationId, educationData);
    //   console.log("With token:", token);
    //   console.log("For user:", userId);
    const response = await api.put(`/users/${userId}/education/${educationId}`, educationData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete education record by education_id
export const deleteEducation = async (userId, token, educationId) => {
    const response = await api.delete(`/users/${userId}/education/${educationId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Transform form data to API format and save/update/delete
// ADDED: deleteEducationIds parameter
export const saveEducationFromForm = async (userId, token, educationForm, deleteEducationIds = []) => {
    const buildYear = (val) => {
        if (val === undefined || val === null || val === "") return null;

        // Handle date string format (YYYY-MM or YYYY-MM-DD)
        if (typeof val === "string") {
            if (val.includes("-")) {
                // Extract year-month (YYYY-MM) or just year (YYYY)
                const parts = val.split("-");
                if (parts.length >= 2) {
                    // Return as "YYYY-MM" format
                    return `${parts[0]}-${parts[1]}`;
                }
                return parts[0]; // Just year
            }
        }

        const n = parseInt(val, 10);
        return isNaN(n) ? val : n;
    };

    const educationArray = [];
    const updatePromises = [];
    const deletePromises = []; // ADDED: deletePromises array

    // Process SSLC
    const sslc = educationForm?.sslc;
    // Check if SSLC should be processed (only if some data exists or if it has an ID, which might indicate an existing record to be cleared/updated)
    if (sslc && (sslc.institutionName || sslc.result || sslc.yearOfPassing || sslc.education_id)) {
        const sslcData = {
            education_type: "sslc",
            institution_name: sslc.institutionName || "",
            board_type: sslc.boardType || "",
            end_year: buildYear(sslc.yearOfPassing),
            result_format: (sslc.resultFormat || "").toLowerCase(),
            result: sslc.result || "",
        };

        if (sslc.education_id) {
            // Update existing
            updatePromises.push(
                updateEducationDetails(userId, token, sslc.education_id, sslcData)
            );
        } else {
            // Create new
            educationArray.push(sslcData);
        }
    }

    // Process PUC
    const puc = educationForm?.pu;
    // Check if PUC should be processed
    if (puc && (puc.institutionName || puc.result || puc.yearOfPassing || puc.education_id)) {
        const pucData = {
            education_type: "puc",
            institution_name: puc.institutionName || "",
            board_type: puc.boardType || "",
            subject_stream: puc.subjectStream || "",
            end_year: buildYear(puc.yearOfPassing),
            result_format: (puc.resultFormat || "").toLowerCase(),
            result: puc.result || "",
        };

        if (puc.education_id) {
            // Update existing
            updatePromises.push(
                updateEducationDetails(userId, token, puc.education_id, pucData)
            );
        } else {
            // Create new
            educationArray.push(pucData);
        }
    }

    // Process Higher Education
    const higherList = [
        ...(educationForm?.higherEducations || []),
        ...(educationForm?.extraEducations || []),
    ];

    for (const he of higherList) {
        // Check if the education object is non-empty or has an ID (might be an existing record to update)
        if (!he || (!he.degree && !he.institutionName && !he.fieldOfStudy && !he.education_id)) continue;

        const higherData = {
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
        };

        if (he.education_id) {
            // Update existing
            updatePromises.push(
                updateEducationDetails(userId, token, he.education_id, higherData)
            );
        } else {
            // Create new
            educationArray.push(higherData);
        }
    }

    // ADDED: Process deletions
    if (deleteEducationIds.length > 0) {
        for (const id of deleteEducationIds) {
            console.log("Preparing to delete education record with ID:", id);
            deletePromises.push(deleteEducation(userId, token, id));
        }
    }

    // Execute all updates and deletions in parallel
    const [updateResults, deleteResults] = await Promise.all([
        Promise.all(updatePromises),
        Promise.all(deletePromises)
    ]);

    // Create new records if any
    let createResults = null;
    if (educationArray.length > 0) {
        createResults = await saveEducationDetails(userId, token, educationArray);
    }

    // Combine results
    return {
        updated: updateResults,
        created: createResults,
        deleted: deleteResults, // Include delete results for completeness
    };
};