import api from "@/api";

// Get all certificate records for a user
export const getCertificatesByUserId = async (userId, token) => {
    const response = await api.get(`/users/${userId}/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Create new certificate record (POST - accepts FormData or JSON array)
export const saveCertificateDetails = async (userId, token, certificatePayload) => {
    const headers = { Authorization: `Bearer ${token}` };
    let data = certificatePayload;

    if (certificatePayload instanceof FormData) {
         headers['Content-Type'] = 'multipart/form-data';
    } else if (Array.isArray(certificatePayload)) {
         // This path is for bulk creation in case of 'Proceed to next' fallback
         data = { certificates: certificatePayload };
    }
    
    const response = await api.post(`/users/${userId}/certificates`, data, { headers });
    return response.data;
};

// Update existing certificate record (PUT)
export const updateCertificateDetails = async (userId, token, certificateId, certificateData) => {
    const headers = { Authorization: `Bearer ${token}` };

    if (certificateData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
    }
    
    const response = await api.put(`/users/${userId}/certificates/${certificateId}`, certificateData, { headers });
    return response.data;
};

// Delete certificate record by certificate_id
export const deleteCertificate = async (userId, token, certificateId) => {
    const response = await api.delete(`/users/${userId}/certificates/${certificateId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Transform form data for bulk save (used on Proceed to Next)
export const saveCertificatesFromForm = async (userId, token, certForm, deleteCertificateIds = []) => {
    const certificatesToProcess = certForm.certificates || [];
    const updatePromises = [];
    const createPayloads = [];

    // Process certificates
    for (const cert of certificatesToProcess) {
        if (!cert || (!cert.certificateTitle && !cert.certificate_id)) continue;

        // Skip records that were new and had no title, or records that still have client-side file objects 
        if (cert.uploadedFile && !cert.certificate_id) continue;
        
        const certificateData = {
            certificate_type: cert.certificateType || "",
            certificate_title: cert.certificateTitle || "",
            domain: cert.domain || "",
            certificate_provided_by: cert.certificateProvidedBy || "",
            date: cert.date || null,
            description: cert.description || "",
            file_url: cert.uploadedFileUrl || null // Send the existing URL, if any
        };

        if (cert.certificate_id) {
            // Update existing (PUT)
            updatePromises.push(
                updateCertificateDetails(userId, token, cert.certificate_id, certificateData)
            );
        } else if (cert.certificateTitle) {
            // Create new (POST) 
            createPayloads.push(certificateData);
        }
    }

    const deletePromises = deleteCertificateIds.map(id => deleteCertificate(userId, token, id));
    
    // Execute all updates and deletions
    const [updateResults, deleteResults] = await Promise.all([
        Promise.all(updatePromises),
        Promise.all(deletePromises)
    ]);

    // Execute creates (Fallback for users who bypassed individual save)
    let createResults = null;
    if (createPayloads.length > 0) {
        createResults = await saveCertificateDetails(userId, token, createPayloads);
    }

    return {
        updated: updateResults,
        created: createResults,
        deleted: deleteResults,
    };
};