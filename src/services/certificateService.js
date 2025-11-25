import api from "@/api";

export const saveCertificate = async (userId, token, cert) => {
  const fd = new FormData();

  fd.append("certificate_type", cert.certificateType || "");
  fd.append("certificate_title", cert.certificateTitle || "");
  fd.append("domain", cert.domain || "");
  fd.append("certificate_provided_by", cert.certificateProvidedBy || "");
  fd.append("description", cert.description || "");

  if (cert.uploadedFileUrl) {
    fd.append("file_url", cert.uploadedFileUrl);
  } else if (cert.file instanceof File) {
    fd.append("file", cert.file);
  }
  return await api.post(`/users/${userId}/certificates`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
