import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ResumeData } from "@/types/resume";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";

interface ModernProfessionalTemplateProps {
  data: ResumeData;
}

interface Section {
  key: string;
  content: React.ReactNode;
}

// ---------------- PDF STYLES (for react-pdf) ----------------

const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    flexDirection: "column",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerBoxWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  headerBox: {
    borderWidth: 1,
    borderColor: "#7C3AED", // purple border
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 220,
    alignItems: "center",
  },
  headerName: {
    fontSize: 18,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 10,
    marginTop: 4,
  },
  contentRow: {
    flexDirection: "row",
    flexGrow: 1,
  },
  left: {
    width: "35%",
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#111827", // vertical divider
  },
  right: {
    width: "65%",
    paddingLeft: 16,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  subHeading: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 2,
  },
  text: {
    fontSize: 9,
    marginBottom: 2,
  },
  mutedText: {
    fontSize: 9,
    marginBottom: 2,
    color: "#4B5563",
  },
});

// ---------------- PDF DOCUMENT (for download via react-pdf if needed) ----------------

export const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  const fullName = [
    data.personal.firstName,
    data.personal.middleName,
    data.personal.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const formatMonthYear = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const buildAddress = () => {
    const parts: string[] = [];
    if (data.personal.address) parts.push(data.personal.address);
    if (data.personal.city) parts.push(data.personal.city);
    if (data.personal.state) parts.push(data.personal.state);
    if (data.personal.pincode) parts.push(data.personal.pincode);
    return parts.join(", ");
  };

  const address = buildAddress();

  const jobTitle =
    data.experience.jobRole ||
    data.experience.workExperiences?.[0]?.jobTitle ||
    "";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        {/* HEADER / NAME BOX */}
        <View style={pdfStyles.headerBoxWrapper}>
          <View style={pdfStyles.headerBox}>
            <Text style={pdfStyles.headerName}>{fullName}</Text>
            {jobTitle ? (
              <Text style={pdfStyles.headerTitle}>{jobTitle}</Text>
            ) : null}
          </View>
        </View>

        {/* CONTENT ROW: LEFT + RIGHT */}
        <View style={pdfStyles.contentRow}>
          {/* LEFT COLUMN - PDF (About, Contact, Skills, Languages, Links) */}
          <View style={pdfStyles.left}>
            {/* ABOUT ME */}
            {data.personal.aboutCareerObjective && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.heading}>About Me</Text>
                <Text style={pdfStyles.text}>
                  {data.personal.aboutCareerObjective}
                </Text>
              </View>
            )}

            {/* CONTACT */}
            {(address ||
              data.personal.email ||
              data.personal.mobileNumber) && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.heading}>Contact</Text>
                {address ? (
                  <Text style={pdfStyles.text}>Address: {address}</Text>
                ) : null}
                {data.personal.email ? (
                  <Text style={pdfStyles.text}>Email: {data.personal.email}</Text>
                ) : null}
                {data.personal.mobileNumber ? (
                  <Text style={pdfStyles.text}>
                    Phone: {data.personal.mobileNumber}
                  </Text>
                ) : null}
              </View>
            )}

            {/* SKILLS */}
            {data.skillsLinks.skills &&
              data.skillsLinks.skills.some(
                (s) => s.enabled && s.skillName.trim()
              ) && (
                <View style={pdfStyles.section}>
                  <Text style={pdfStyles.heading}>Skills</Text>
                  {data.skillsLinks.skills
                    .filter((s) => s.enabled && s.skillName.trim())
                    .map((s, i) => (
                      <Text key={i} style={pdfStyles.text}>
                        • {s.skillName}
                        {s.skillLevel ? ` (${s.skillLevel})` : ""}
                      </Text>
                    ))}
                </View>
              )}

            {/* LANGUAGES */}
            {data.personal.languagesKnown &&
              data.personal.languagesKnown.length > 0 && (
                <View style={pdfStyles.section}>
                  <Text style={pdfStyles.heading}>Languages</Text>
                  {data.personal.languagesKnown.map((lang, i) => (
                    <Text key={i} style={pdfStyles.text}>
                      • {lang}
                    </Text>
                  ))}
                </View>
              )}

            {/* LINKS */}
            {data.skillsLinks.linksEnabled &&
              (data.skillsLinks.links.linkedinProfile ||
                data.skillsLinks.links.githubProfile ||
                data.skillsLinks.links.portfolioUrl) && (
                <View style={pdfStyles.section}>
                  <Text style={pdfStyles.heading}>Links</Text>
                  {data.skillsLinks.links.linkedinEnabled &&
                    data.skillsLinks.links.linkedinProfile && (
                      <View>
                        <Text style={pdfStyles.subHeading}>LinkedIn</Text>
                        <Text style={pdfStyles.mutedText}>
                          {data.skillsLinks.links.linkedinProfile}
                        </Text>
                      </View>
                    )}
                  {data.skillsLinks.links.githubEnabled &&
                    data.skillsLinks.links.githubProfile && (
                      <View>
                        <Text style={pdfStyles.subHeading}>GitHub</Text>
                        <Text style={pdfStyles.mutedText}>
                          {data.skillsLinks.links.githubProfile}
                        </Text>
                      </View>
                    )}
                  {data.skillsLinks.links.portfolioEnabled &&
                    data.skillsLinks.links.portfolioUrl && (
                      <View>
                        <Text style={pdfStyles.subHeading}>Portfolio</Text>
                        <Text style={pdfStyles.mutedText}>
                          {data.skillsLinks.links.portfolioUrl}
                        </Text>
                      </View>
                    )}
                </View>
              )}
          </View>

          {/* RIGHT COLUMN - PDF */}
          <View style={pdfStyles.right}>
            {/* EDUCATION */}
            {(data.education.higherEducationEnabled &&
              data.education.higherEducation.length > 0) ||
            (data.education.preUniversityEnabled &&
              data.education.preUniversity.instituteName) ||
            (data.education.sslcEnabled &&
              data.education.sslc.instituteName) ? (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.heading}>Education</Text>

                {data.education.higherEducationEnabled &&
                  data.education.higherEducation.map((edu, i) => (
                    <View key={edu.id || i} wrap>
                      <Text style={pdfStyles.subHeading}>
                        {edu.degree}
                        {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                      </Text>
                      {edu.instituteName && (
                        <Text style={pdfStyles.mutedText}>
                          {edu.instituteName}
                        </Text>
                      )}
                      {(edu.startYear || edu.endYear) && (
                        <Text style={pdfStyles.mutedText}>
                          {edu.startYear}
                          {edu.endYear ? ` - ${edu.endYear}` : ""}
                        </Text>
                      )}
                      {edu.universityBoard && (
                        <Text style={pdfStyles.mutedText}>
                          {edu.universityBoard}
                        </Text>
                      )}
                      {edu.result && edu.resultFormat && (
                        <Text style={pdfStyles.mutedText}>
                          {edu.resultFormat}: {edu.result}
                        </Text>
                      )}
                    </View>
                  ))}

                {data.education.preUniversityEnabled &&
                  data.education.preUniversity.instituteName && (
                    <View wrap>
                      <Text style={pdfStyles.subHeading}>
                        Pre-University / 12th
                        {data.education.preUniversity.subjectStream
                          ? ` (${data.education.preUniversity.subjectStream})`
                          : ""}
                      </Text>
                      <Text style={pdfStyles.mutedText}>
                        {data.education.preUniversity.instituteName}
                      </Text>
                      {data.education.preUniversity.yearOfPassing && (
                        <Text style={pdfStyles.mutedText}>
                          {data.education.preUniversity.yearOfPassing}
                        </Text>
                      )}
                    </View>
                  )}

                {data.education.sslcEnabled &&
                  data.education.sslc.instituteName && (
                    <View wrap>
                      <Text style={pdfStyles.subHeading}>SSLC / 10th</Text>
                      <Text style={pdfStyles.mutedText}>
                        {data.education.sslc.instituteName}
                      </Text>
                      {data.education.sslc.yearOfPassing && (
                        <Text style={pdfStyles.mutedText}>
                          {data.education.sslc.yearOfPassing}
                        </Text>
                      )}
                    </View>
                  )}
              </View>
            ) : null}

            {/* EXPERIENCE */}
            {data.experience.workExperiences &&
              data.experience.workExperiences.some(
                (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
              ) && (
                <View style={pdfStyles.section} wrap>
                  <Text style={pdfStyles.heading}>Experience</Text>
                  {data.experience.workExperiences
                    .filter(
                      (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
                    )
                    .map((exp, i) => (
                      <View key={exp.id || i} wrap>
                        {exp.jobTitle && (
                          <Text style={pdfStyles.subHeading}>
                            {exp.jobTitle}
                          </Text>
                        )}
                        {exp.companyName && (
                          <Text style={pdfStyles.mutedText}>
                            {exp.companyName}
                            {exp.location ? ` | ${exp.location}` : ""}
                          </Text>
                        )}
                        {(exp.startDate ||
                          exp.endDate ||
                          exp.currentlyWorking) && (
                          <Text style={pdfStyles.mutedText}>
                            {exp.startDate
                              ? formatMonthYear(exp.startDate)
                              : ""}{" "}
                            -{" "}
                            {exp.currentlyWorking
                              ? "Present"
                              : exp.endDate
                              ? formatMonthYear(exp.endDate)
                              : ""}
                          </Text>
                        )}
                        {exp.description &&
                          exp.description.split("•").map((line, j) =>
                            line.trim() ? (
                              <Text key={j} style={pdfStyles.text} wrap>
                                • {line.trim()}
                              </Text>
                            ) : null
                          )}
                      </View>
                    ))}
                </View>
              )}

            {/* PROJECTS */}
            {data.projects &&
              data.projects.some((proj) => proj.enabled && proj.projectTitle) && (
                <View style={pdfStyles.section} wrap>
                  <Text style={pdfStyles.heading}>Projects</Text>
                  {data.projects
                    .filter((proj) => proj.enabled && proj.projectTitle)
                    .map((proj, i) => (
                      <View key={proj.id || i} wrap>
                        <Text style={pdfStyles.subHeading}>
                          {proj.projectTitle}
                        </Text>
                        {proj.projectType && (
                          <Text style={pdfStyles.mutedText}>
                            {proj.projectType}
                          </Text>
                        )}
                        {(proj.startDate ||
                          proj.endDate ||
                          proj.currentlyWorking) && (
                          <Text style={pdfStyles.mutedText}>
                            {proj.startDate
                              ? formatMonthYear(proj.startDate)
                              : ""}{" "}
                            -{" "}
                            {proj.currentlyWorking
                              ? "Present"
                              : proj.endDate
                              ? formatMonthYear(proj.endDate)
                              : ""}
                          </Text>
                        )}
                        {proj.description && (
                          <Text style={pdfStyles.text}>{proj.description}</Text>
                        )}
                      </View>
                    ))}
                </View>
              )}

            {/* CERTIFICATIONS */}
            {data.certifications &&
              data.certifications.some(
                (cert) => cert.enabled && cert.certificateTitle
              ) && (
                <View style={pdfStyles.section} wrap>
                  <Text style={pdfStyles.heading}>Certifications</Text>
                  {data.certifications
                    .filter((cert) => cert.enabled && cert.certificateTitle)
                    .map((cert, i) => (
                      <View key={cert.id || i} wrap>
                        <Text style={pdfStyles.subHeading}>
                          {cert.certificateTitle}
                        </Text>
                        {cert.providedBy && (
                          <Text style={pdfStyles.mutedText}>
                            {cert.providedBy}
                          </Text>
                        )}
                        {cert.date && (
                          <Text style={pdfStyles.mutedText}>
                            {formatMonthYear(cert.date)}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              )}

            {/* PERSONAL DETAILS */}
            {(data.personal.dateOfBirth ||
              data.personal.gender ||
              data.personal.nationality ||
              data.personal.passportNumber) && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.heading}>Personal Details</Text>
                {data.personal.dateOfBirth && (
                  <Text style={pdfStyles.text}>
                    Date of Birth:{" "}
                    {new Date(
                      data.personal.dateOfBirth
                    ).toLocaleDateString()}
                  </Text>
                )}
                {data.personal.gender && (
                  <Text style={pdfStyles.text}>
                    Gender: {data.personal.gender}
                  </Text>
                )}
                {data.personal.nationality && (
                  <Text style={pdfStyles.text}>
                    Nationality: {data.personal.nationality}
                  </Text>
                )}
                {data.personal.passportNumber && (
                  <Text style={pdfStyles.text}>
                    Passport: {data.personal.passportNumber}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// ---------------- WEB PREVIEW (multi-page A4) + HTML2CANVAS DOWNLOAD ----------------

export const ModernProfessionalTemplate: React.FC<
  ModernProfessionalTemplateProps
> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [leftPages, setLeftPages] = useState<number[][]>([]);
  const [rightPages, setRightPages] = useState<number[][]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const leftMeasureRef = useRef<HTMLDivElement | null>(null);
  const rightMeasureRef = useRef<HTMLDivElement | null>(null);
  const pageWrapperRef = useRef<HTMLDivElement | null>(null);

  const fullName = useMemo(
    () =>
      [
        data.personal.firstName,
        data.personal.middleName,
        data.personal.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase(),
    [data.personal.firstName, data.personal.middleName, data.personal.lastName]
  );

  const formatMonthYear = useCallback((dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }, []);

  const buildAddress = useCallback(() => {
    const parts: string[] = [];
    if (data.personal.address) parts.push(data.personal.address);
    if (data.personal.city) parts.push(data.personal.city);
    if (data.personal.state) parts.push(data.personal.state);
    if (data.personal.pincode) parts.push(data.personal.pincode);
    return parts.join(", ");
  }, [
    data.personal.address,
    data.personal.city,
    data.personal.state,
    data.personal.pincode,
  ]);

  const address = buildAddress();

  const getJobTitle = useCallback(() => {
    if (data.experience.jobRole) return data.experience.jobRole;
    if (data.experience.workExperiences?.[0]?.jobTitle)
      return data.experience.workExperiences[0].jobTitle;
    return "";
  }, [data.experience]);

  const splitText = (text?: string, chunkSize = 400): string[] => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > chunkSize) {
        if (cur.trim()) chunks.push(cur.trim());
        cur = w;
      } else {
        cur = (cur + " " + w).trim();
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks;
  };

  // -------- LEFT SECTIONS (web preview) --------

  const leftSections: Section[] = useMemo(() => {
    const sections: Section[] = [];

    // ABOUT ME
    if (data.personal.aboutCareerObjective) {
      const aboutChunks = splitText(data.personal.aboutCareerObjective, 280);
      aboutChunks.forEach((chunk, i) => {
        sections.push({
          key: `left-about-${i}`,
          content: (
            <div>
              {i === 0 && (
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    color: "rgb(17, 24, 39)",
                    textTransform: "uppercase",
                  }}
                >
                  About Me
                </h3>
              )}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgb(55, 65, 81)",
                  lineHeight: "1.5",
                }}
              >
                {chunk}
              </p>
            </div>
          ),
        });
      });
    }

    // CONTACT
    if (address || data.personal.email || data.personal.mobileNumber) {
      sections.push({
        key: "left-contact",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
              }}
            >
              Contact
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "rgb(55, 65, 81)",
              }}
            >
              {data.personal.mobileNumber && (
                <p style={{ display: "flex", gap: "0.35rem" }}>
                  <span>📞</span>
                  <span>{data.personal.mobileNumber}</span>
                </p>
              )}
              {data.personal.email && (
                <p style={{ display: "flex", gap: "0.35rem" }}>
                  <span>✉️</span>
                  <span style={{ wordBreak: "break-word" }}>
                    {data.personal.email}
                  </span>
                </p>
              )}
              {address && (
                <p style={{ display: "flex", gap: "0.35rem" }}>
                  <span>📍</span>
                  <span style={{ lineHeight: "1.5", wordBreak: "break-word" }}>
                    {address}
                  </span>
                </p>
              )}
            </div>
          </div>
        ),
      });
    }

    // SKILLS
    if (
      data.skillsLinks.skills &&
      data.skillsLinks.skills.some((s) => s.enabled && s.skillName.trim())
    ) {
      sections.push({
        key: "left-skills",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
              }}
            >
              Skills
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {data.skillsLinks.skills
                .filter((s) => s.enabled && s.skillName.trim())
                .map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: "0.75rem",
                      color: "rgb(55, 65, 81)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>• {skill.skillName}</span>
                    {skill.skillLevel && (
                      <span
                        style={{
                          fontSize: "0.625rem",
                          color: "rgb(107, 114, 128)",
                        }}
                      >
                        {skill.skillLevel}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ),
      });
    }

    // LANGUAGES
    if (
      data.personal.languagesKnown &&
      data.personal.languagesKnown.length > 0
    ) {
      sections.push({
        key: "left-languages",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
              }}
            >
              Languages
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {data.personal.languagesKnown.map((lang, idx) => (
                <div
                  key={idx}
                  style={{ fontSize: "0.75rem", color: "rgb(55, 65, 81)" }}
                >
                  • {lang}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    // LINKS
    if (
      data.skillsLinks.linksEnabled &&
      (data.skillsLinks.links.linkedinProfile ||
        data.skillsLinks.links.githubProfile ||
        data.skillsLinks.links.portfolioUrl)
    ) {
      sections.push({
        key: "left-links",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
              }}
            >
              Links
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "rgb(55, 65, 81)",
              }}
            >
              {data.skillsLinks.links.linkedinEnabled &&
                data.skillsLinks.links.linkedinProfile && (
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "rgb(31, 41, 55)",
                      }}
                    >
                      LinkedIn
                    </p>
                    <p
                      style={{
                        wordBreak: "break-word",
                        color: "rgb(37, 99, 235)",
                      }}
                    >
                      {data.skillsLinks.links.linkedinProfile}
                    </p>
                  </div>
                )}
              {data.skillsLinks.links.githubEnabled &&
                data.skillsLinks.links.githubProfile && (
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "rgb(31, 41, 55)",
                      }}
                    >
                      GitHub
                    </p>
                    <p
                      style={{
                        wordBreak: "break-word",
                        color: "rgb(37, 99, 235)",
                      }}
                    >
                      {data.skillsLinks.links.githubProfile}
                    </p>
                  </div>
                )}
              {data.skillsLinks.links.portfolioEnabled &&
                data.skillsLinks.links.portfolioUrl && (
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "rgb(31, 41, 55)",
                      }}
                    >
                      Portfolio
                    </p>
                    <p
                      style={{
                        wordBreak: "break-word",
                        color: "rgb(37, 99, 235)",
                      }}
                    >
                      {data.skillsLinks.links.portfolioUrl}
                    </p>
                    {data.skillsLinks.links.portfolioDescription && (
                      <p
                        style={{
                          marginTop: "0.25rem",
                          color: "rgb(75, 85, 99)",
                        }}
                      >
                        {data.skillsLinks.links.portfolioDescription}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        ),
      });
    }

    return sections;
  }, [address, data.personal, data.skillsLinks]);

  // -------- RIGHT SECTIONS (web preview) --------

  const rightSections: Section[] = useMemo(() => {
    const sections: Section[] = [];

    // HEADER NAME BOX
    if (fullName) {
      sections.push({
        key: "right-header",
        content: (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                border: "1px solid rgb(124, 58, 237)", // purple
                padding: "0.75rem 2.5rem",
                textAlign: "center",
                minWidth: "60%",
              }}
            >
              <h1
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "rgb(17, 24, 39)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                {fullName}
              </h1>
              {getJobTitle() && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgb(55, 65, 81)",
                  }}
                >
                  {getJobTitle()}
                </p>
              )}
            </div>
          </div>
        ),
      });
    }

    // EDUCATION
    if (
      (data.education.sslcEnabled && data.education.sslc.instituteName) ||
      (data.education.preUniversityEnabled &&
        data.education.preUniversity.instituteName) ||
      (data.education.higherEducationEnabled &&
        data.education.higherEducation.length > 0)
    ) {
      sections.push({
        key: "right-education",
        content: (
          <div>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgb(17, 24, 39)",
                paddingBottom: "0.25rem",
              }}
            >
              Education
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              {data.education.higherEducationEnabled &&
                data.education.higherEducation.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        {edu.degree}{" "}
                        {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      </p>
                      {(edu.startYear || edu.endYear) && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgb(75, 85, 99)",
                          }}
                        >
                          {edu.startYear} {edu.endYear && `- ${edu.endYear}`}
                        </span>
                      )}
                    </div>
                    {edu.instituteName && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(55, 65, 81)",
                          marginBottom: "0.15rem",
                        }}
                      >
                        {edu.instituteName}
                      </p>
                    )}
                    {edu.universityBoard && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "rgb(75, 85, 99)",
                        }}
                      >
                        {edu.universityBoard}
                      </p>
                    )}
                    {edu.result && edu.resultFormat && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "rgb(75, 85, 99)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {edu.resultFormat}: {edu.result}
                      </p>
                    )}
                  </div>
                ))}
              {data.education.preUniversityEnabled &&
                data.education.preUniversity.instituteName && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        Pre-University / 12th{" "}
                        {data.education.preUniversity.subjectStream &&
                          `(${data.education.preUniversity.subjectStream})`}
                      </p>
                      {data.education.preUniversity.yearOfPassing && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgb(75, 85, 99)",
                          }}
                        >
                          {data.education.preUniversity.yearOfPassing}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgb(55, 65, 81)",
                        marginBottom: "0.15rem",
                      }}
                    >
                      {data.education.preUniversity.instituteName}
                    </p>
                    {data.education.preUniversity.boardType && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "rgb(75, 85, 99)",
                        }}
                      >
                        {data.education.preUniversity.boardType}
                      </p>
                    )}
                  </div>
                )}
              {data.education.sslcEnabled &&
                data.education.sslc.instituteName && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        SSLC / 10th
                      </p>
                      {data.education.sslc.yearOfPassing && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgb(75, 85, 99)",
                          }}
                        >
                          {data.education.sslc.yearOfPassing}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgb(55, 65, 81)",
                        marginBottom: "0.15rem",
                      }}
                    >
                      {data.education.sslc.instituteName}
                    </p>
                    {data.education.sslc.boardType && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "rgb(75, 85, 99)",
                        }}
                      >
                        {data.education.sslc.boardType}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        ),
      });
    }

    // EXPERIENCE
    if (
      data.experience.workExperiences &&
      data.experience.workExperiences.some(
        (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
      )
    ) {
      sections.push({
        key: "right-experience-header",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgb(17, 24, 39)",
                paddingBottom: "0.25rem",
              }}
            >
              Experience
            </h3>
          </div>
        ),
      });

      const exps = data.experience.workExperiences.filter(
        (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
      );

      exps.forEach((exp, idx) => {
        const descChunks = splitText(exp.description, 700);

        sections.push({
          key: `right-experience-${idx}-0`,
          content: (
            <div style={{ marginTop: "0.35rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.2rem",
                }}
              >
                {exp.jobTitle && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "rgb(17, 24, 39)",
                    }}
                  >
                    {exp.jobTitle}
                  </p>
                )}
                {(exp.startDate || exp.endDate || exp.currentlyWorking) && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "rgb(75, 85, 99)",
                      whiteSpace: "nowrap",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {exp.startDate && formatMonthYear(exp.startDate)}{" - "}
                    {exp.currentlyWorking
                      ? "Present"
                      : exp.endDate
                      ? formatMonthYear(exp.endDate)
                      : ""}
                  </span>
                )}
              </div>
              {exp.companyName && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(55, 65, 81)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {exp.companyName}
                  {exp.location && ` | ${exp.location}`}
                </p>
              )}
              {(exp.employmentType || exp.workMode) && (
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "rgb(75, 85, 99)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {exp.employmentType}
                  {exp.employmentType && exp.workMode && " • "}
                  {exp.workMode}
                </p>
              )}
              {descChunks[0] && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(75, 85, 99)",
                    lineHeight: "1.5",
                    marginTop: "0.35rem",
                  }}
                >
                  {descChunks[0]}
                </p>
              )}
            </div>
          ),
        });

        for (let c = 1; c < descChunks.length; c++) {
          sections.push({
            key: `right-experience-${idx}-desc-${c}`,
            content: (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(75, 85, 99)",
                    lineHeight: "1.5",
                    marginTop: "0.25rem",
                  }}
                >
                  {descChunks[c]}
                </p>
              </div>
            ),
          });
        }
      });
    }

    // PROJECTS
    if (
      data.projects &&
      data.projects.some((proj) => proj.enabled && proj.projectTitle)
    ) {
      sections.push({
        key: "right-projects-header",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgb(17, 24, 39)",
                paddingBottom: "0.25rem",
              }}
            >
              Projects
            </h3>
          </div>
        ),
      });

      const projs = data.projects.filter(
        (proj) => proj.enabled && proj.projectTitle
      );

      projs.forEach((proj, idx) => {
        const descChunks = splitText(proj.description, 700);

        sections.push({
          key: `right-project-${idx}-0`,
          content: (
            <div style={{ marginTop: "0.35rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.2rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "rgb(17, 24, 39)",
                  }}
                >
                  {proj.projectTitle}
                </p>
                {(proj.startDate || proj.endDate || proj.currentlyWorking) && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "rgb(75, 85, 99)",
                      whiteSpace: "nowrap",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {proj.startDate && formatMonthYear(proj.startDate)}{" - "}
                    {proj.currentlyWorking
                      ? "Present"
                      : proj.endDate
                      ? formatMonthYear(proj.endDate)
                      : ""}
                  </span>
                )}
              </div>
              {proj.projectType && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(55, 65, 81)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {proj.projectType}
                </p>
              )}
              {descChunks[0] && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(75, 85, 99)",
                    lineHeight: "1.5",
                    marginTop: "0.35rem",
                  }}
                >
                  {descChunks[0]}
                </p>
              )}
              {proj.rolesResponsibilities && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "rgb(31, 41, 55)",
                    }}
                  >
                    Roles & Responsibilities:
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgb(75, 85, 99)",
                      lineHeight: "1.5",
                    }}
                  >
                    {proj.rolesResponsibilities}
                  </p>
                </div>
              )}
            </div>
          ),
        });

        for (let c = 1; c < descChunks.length; c++) {
          sections.push({
            key: `right-project-${idx}-desc-${c}`,
            content: (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(75, 85, 99)",
                    lineHeight: "1.5",
                    marginTop: "0.25rem",
                  }}
                >
                  {descChunks[c]}
                </p>
              </div>
            ),
          });
        }
      });
    }

    // TECHNICAL SUMMARY
    if (
      data.skillsLinks.technicalSummaryEnabled &&
      data.skillsLinks.technicalSummary
    ) {
      sections.push({
        key: "right-technical",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgb(17, 24, 39)",
                paddingBottom: "0.25rem",
              }}
            >
              Technical Summary
            </h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgb(75, 85, 99)",
                lineHeight: "1.5",
              }}
            >
              {data.skillsLinks.technicalSummary}
            </p>
          </div>
        ),
      });
    }

    // CERTIFICATIONS
    if (
      data.certifications &&
      data.certifications.some(
        (cert) => cert.enabled && cert.certificateTitle
      )
    ) {
      sections.push({
        key: "right-certifications",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgb(17, 24, 39)",
                paddingBottom: "0.25rem",
              }}
            >
              Certifications
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
              }}
            >
              {data.certifications
                .filter((cert) => cert.enabled && cert.certificateTitle)
                .map((cert, idx) => (
                  <div key={cert.id || idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        {cert.certificateTitle}
                      </p>
                      {cert.date && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgb(75, 85, 99)",
                          }}
                        >
                          {formatMonthYear(cert.date)}
                        </span>
                      )}
                    </div>
                    {cert.providedBy && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(55, 65, 81)",
                          marginBottom: "0.15rem",
                        }}
                      >
                        {cert.providedBy}
                        {cert.domain && ` • ${cert.domain}`}
                      </p>
                    )}
                    {cert.certificateType && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "rgb(75, 85, 99)",
                          marginBottom: "0.15rem",
                        }}
                      >
                        Type: {cert.certificateType}
                      </p>
                    )}
                    {cert.description && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(75, 85, 99)",
                          lineHeight: "1.5",
                        }}
                      >
                        {cert.description}
                      </p>
                    )}
                    {cert.certificateUrl && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(37, 99, 235)",
                          marginTop: "0.25rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {cert.certificateUrl}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ),
      });
    }

    // PERSONAL DETAILS
    if (
      data.personal.dateOfBirth ||
      data.personal.nationality ||
      data.personal.passportNumber ||
      data.personal.gender
    ) {
      sections.push({
        key: "right-personal",
        content: (
          <div style={{ marginTop: "0.75rem" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "rgb(17, 24, 39)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgb(17, 24, 39)",
                paddingBottom: "0.25rem",
              }}
            >
              Personal Details
            </h3>
            <div
              style={{
                gap: "0.25rem",
                display: "flex",
                flexDirection: "column",
                fontSize: "0.75rem",
                color: "rgb(55, 65, 81)",
              }}
            >
              {data.personal.dateOfBirth && (
                <p>
                  <span style={{ fontWeight: 600 }}>Date of Birth:</span>{" "}
                  {new Date(data.personal.dateOfBirth).toLocaleDateString()}
                </p>
              )}
              {data.personal.gender && (
                <p>
                  <span style={{ fontWeight: 600 }}>Gender:</span>{" "}
                  {data.personal.gender}
                </p>
              )}
              {data.personal.nationality && (
                <p>
                  <span style={{ fontWeight: 600 }}>Nationality:</span>{" "}
                  {data.personal.nationality}
                </p>
              )}
              {data.personal.passportNumber && (
                <p>
                  <span style={{ fontWeight: 600 }}>Passport:</span>{" "}
                  {data.personal.passportNumber}
                </p>
              )}
            </div>
          </div>
        ),
      });
    }

    return sections;
  }, [data, fullName, formatMonthYear, getJobTitle]);

  // -------- PAGE SPLITTING BASED ON HEIGHT --------

  useEffect(() => {
    const buildPagesFromHeights = (heights: number[], pageHeight: number) => {
      const pages: number[][] = [];
      let current: number[] = [];
      let currentHeight = 0;

      heights.forEach((h, idx) => {
        if (currentHeight + h > pageHeight && current.length > 0) {
          pages.push(current);
          current = [];
          currentHeight = 0;
        }
        current.push(idx);
        currentHeight += h;
      });

      if (current.length > 0) {
        pages.push(current);
      }

      return pages.length > 0 ? pages : [[]];
    };

    const leftContainer = leftMeasureRef.current;
    const rightContainer = rightMeasureRef.current;

    if (!leftContainer || !rightContainer) return;

    // A4 height at 96dpi in px
    const pageHeight = 1122;

    const leftHeights: number[] = leftSections.map((_, idx) => {
      const el = leftContainer.children[idx] as HTMLElement | undefined;
      return el ? el.offsetHeight : 0;
    });

    const rightHeights: number[] = rightSections.map((_, idx) => {
      const el = rightContainer.children[idx] as HTMLElement | undefined;
      return el ? el.offsetHeight : 0;
    });

    const leftPagesLocal =
      leftSections.length > 0
        ? buildPagesFromHeights(leftHeights, pageHeight)
        : [[]];

    const rightPagesLocal =
      rightSections.length > 0
        ? buildPagesFromHeights(rightHeights, pageHeight)
        : [[]];

    const pagesCount = Math.max(
      leftPagesLocal?.length || 1,
      rightPagesLocal?.length || 1
    );

    setTotalPages(pagesCount);
    setLeftPages(leftPagesLocal);
    setRightPages(rightPagesLocal);
    setCurrentPage(0);
  }, [leftSections, rightSections]);

  // -------- HTML2CANVAS + jsPDF DOWNLOAD (current preview page) --------

const handleDownloadPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  for (let i = 0; i < totalPages; i++) {
    const temp = document.createElement("div");
    temp.style.width = "210mm";
    temp.style.minHeight = "297mm";
    temp.style.padding = "0";
    temp.style.position = "absolute";
    temp.style.left = "-9999px";
    temp.style.top = "0";
    temp.style.background = "white";
    document.body.appendChild(temp);

    // Render the page inside a wrapper
    const wrapper = document.createElement("div");
    temp.appendChild(wrapper);

    // Convert React element to DOM by rendering temporarily
    const pageElement = renderPage(i);

    const container = document.createElement("div");
    wrapper.appendChild(container);

    // Render using ReactDOM
    // IMPORTANT
    // You MUST import:  import { createRoot } from "react-dom/client";
    const root = window.__tempRoot || createRoot(container);
    window.__tempRoot = root;
    root.render(pageElement);

    // Wait a tick for layout
    await new Promise((res) => setTimeout(res, 50));

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (i !== 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

    document.body.removeChild(temp);
  }

  pdf.save("resume.pdf");
};




  // -------- RENDER A SINGLE PAGE (web preview) --------

  const renderPage = (pageIndex: number) => {
  const leftIndexes = leftPages[pageIndex] || [];
  const rightIndexes = rightPages[pageIndex] || [];

  return (
    <div
      style={{
        width: "210mm",
        height: "297mm",
        backgroundColor: "white",
        margin: "0 auto",
        boxShadow: "0 0 8px rgba(0,0,0,0.15)",
        display: "flex",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* LEFT COLUMN */}
      <div
        style={{
          width: "35%",
          backgroundColor: "white",
          padding: "1.5rem 1.25rem 1.5rem 1.5rem",
          boxSizing: "border-box",
          height: "297mm",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgb(17,24,39)",
        }}
      >
        {leftIndexes.map((idx) => {
          const section = leftSections[idx];
          return section ? <div key={section.key}>{section.content}</div> : null;
        })}
      </div>

      {/* RIGHT COLUMN */}
      <div
        style={{
          width: "65%",
          padding: "1.5rem",
          boxSizing: "border-box",
          height: "297mm",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rightIndexes.map((idx) => {
          const section = rightSections[idx];
          return section ? <div key={section.key}>{section.content}</div> : null;
        })}
      </div>
    </div>
  );
};


  // -------- MAIN RENDER (hidden measurer + visible preview + pagination + download) --------

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        alignItems: "center",
        padding: "1.5rem",
      }}
    >
      {/* Hidden measurement container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: -9999,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "210mm",
            height: "297mm",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            ref={leftMeasureRef}
            style={{
              width: "35%",
              padding: "1.5rem 1.25rem 1.5rem 1.5rem",
              backgroundColor: "white",
              display: "flex",
              height: "297mm",
              flexDirection: "column",
              gap: "0.75rem",
              boxSizing: "border-box",
              borderRight: "1px solid rgb(17, 24, 39)",
            }}
          >
            {leftSections.map((section) => (
              <div key={section.key}>{section.content}</div>
            ))}
          </div>

          <div
            ref={rightMeasureRef}
            style={{
              width: "65%",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              height: "297mm",
              boxSizing: "border-box",
            }}
          >
            {rightSections.map((section) => (
              <div key={section.key}>{section.content}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Visible page (wrapped for PDF export) */}
      <div
        ref={pageWrapperRef}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        {renderPage(currentPage)}
      </div>

      {/* Pagination + Download controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          style={{
            padding: "0.5rem 0.75rem",
            backgroundColor: currentPage === 0 ? "#d1d5db" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          ← Prev
        </button>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                padding: "0.5rem 0.75rem",
                backgroundColor: currentPage === i ? "#1f2937" : "#e5e7eb",
                color: currentPage === i ? "white" : "rgb(55, 65, 81)",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: currentPage === i ? 700 : 600,
                minWidth: "2.5rem",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
          }
          disabled={currentPage === totalPages - 1}
          style={{
            padding: "0.5rem 0.75rem",
            backgroundColor:
              currentPage === totalPages - 1 ? "#d1d5db" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor:
              currentPage === totalPages - 1 ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Next →
        </button>

        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "rgb(55, 65, 81)",
            marginLeft: "0.5rem",
          }}
        >
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          onClick={handleDownloadPDF}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginLeft: "0.5rem",
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ModernProfessionalTemplate;
