import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ResumeData } from "@/types/resume";

// ✅ react-pdf imports
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface ModernProfessionalTemplateProps {
  data: ResumeData;
}

interface Section {
  key: string;
  content: React.ReactNode;
}

// ✅ PDF styles for A4 auto-pagination
const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: "row",
  },
  left: {
    width: "35%",
    backgroundColor: "#F5E6D3",
    padding: 16,
  },
  right: {
    width: "65%",
    padding: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  section: {
    marginTop: 10,
  },
});

// ✅ PDF document component (react-pdf handles page breaks automatically)
const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
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

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        {/* LEFT COLUMN */}
        <View style={pdfStyles.left}>
          {/* Contact */}
          {(data.personal.address ||
            data.personal.email ||
            data.personal.mobileNumber) && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.heading}>Contact</Text>
              {data.personal.address && (
                <Text style={pdfStyles.text}>{data.personal.address}</Text>
              )}
              {data.personal.city && (
                <Text style={pdfStyles.text}>{data.personal.city}</Text>
              )}
              {data.personal.state && (
                <Text style={pdfStyles.text}>{data.personal.state}</Text>
              )}
              {data.personal.pincode && (
                <Text style={pdfStyles.text}>{data.personal.pincode}</Text>
              )}
              {data.personal.email && (
                <Text style={pdfStyles.text}>{data.personal.email}</Text>
              )}
              {data.personal.mobileNumber && (
                <Text style={pdfStyles.text}>{data.personal.mobileNumber}</Text>
              )}
            </View>
          )}

          {/* About Me */}
          {data.personal.aboutCareerObjective && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.heading}>About Me</Text>
              <Text style={pdfStyles.text}>
                {data.personal.aboutCareerObjective}
              </Text>
            </View>
          )}

          {/* Skills */}
          {data.skillsLinks.skills &&
            data.skillsLinks.skills.some(
              (s) => s.enabled && s.skillName.trim()
            ) && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.heading}>Skills</Text>
                {data.skillsLinks.skills
                  .filter((s) => s.enabled)
                  .map((s, i) => (
                    <Text key={i} style={pdfStyles.text}>
                      {s.skillName}
                      {s.skillLevel ? ` (${s.skillLevel})` : ""}
                    </Text>
                  ))}
              </View>
            )}

          {/* Languages */}
          {data.personal.languagesKnown &&
            data.personal.languagesKnown.length > 0 && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.heading}>Languages</Text>
                {data.personal.languagesKnown.map((lang, i) => (
                  <Text key={i} style={pdfStyles.text}>
                    {lang}
                  </Text>
                ))}
              </View>
            )}

          {/* Links */}
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
                      <Text style={pdfStyles.text}>
                        {data.skillsLinks.links.linkedinProfile}
                      </Text>
                    </View>
                  )}
                {data.skillsLinks.links.githubEnabled &&
                  data.skillsLinks.links.githubProfile && (
                    <View>
                      <Text style={pdfStyles.subHeading}>GitHub</Text>
                      <Text style={pdfStyles.text}>
                        {data.skillsLinks.links.githubProfile}
                      </Text>
                    </View>
                  )}
                {data.skillsLinks.links.portfolioEnabled &&
                  data.skillsLinks.links.portfolioUrl && (
                    <View>
                      <Text style={pdfStyles.subHeading}>Portfolio</Text>
                      <Text style={pdfStyles.text}>
                        {data.skillsLinks.links.portfolioUrl}
                      </Text>
                    </View>
                  )}
              </View>
            )}
        </View>

        {/* RIGHT COLUMN */}
        <View style={pdfStyles.right}>
          {/* Header */}
          <View>
            <Text style={{ fontSize: 22, fontWeight: 700 }}>{fullName}</Text>
            {data.experience.jobRole && (
              <Text style={{ fontSize: 12, marginTop: 4 }}>
                {data.experience.jobRole}
              </Text>
            )}
          </View>

          {/* Education */}
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
                      <Text style={pdfStyles.text}>{edu.instituteName}</Text>
                    )}
                    {(edu.startYear || edu.endYear) && (
                      <Text style={pdfStyles.text}>
                        {edu.startYear}
                        {edu.endYear ? ` - ${edu.endYear}` : ""}
                      </Text>
                    )}
                    {edu.universityBoard && (
                      <Text style={pdfStyles.text}>
                        {edu.universityBoard}
                      </Text>
                    )}
                    {edu.result && edu.resultFormat && (
                      <Text style={pdfStyles.text}>
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
                    <Text style={pdfStyles.text}>
                      {data.education.preUniversity.instituteName}
                    </Text>
                    {data.education.preUniversity.yearOfPassing && (
                      <Text style={pdfStyles.text}>
                        {data.education.preUniversity.yearOfPassing}
                      </Text>
                    )}
                  </View>
                )}

              {data.education.sslcEnabled &&
                data.education.sslc.instituteName && (
                  <View wrap>
                    <Text style={pdfStyles.subHeading}>SSLC / 10th</Text>
                    <Text style={pdfStyles.text}>
                      {data.education.sslc.instituteName}
                    </Text>
                    {data.education.sslc.yearOfPassing && (
                      <Text style={pdfStyles.text}>
                        {data.education.sslc.yearOfPassing}
                      </Text>
                    )}
                  </View>
                )}
            </View>
          ) : null}

          {/* Experience */}
          {data.experience.workExperiences &&
            data.experience.workExperiences.some(
              (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
            ) && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.heading}>Experience</Text>
                {data.experience.workExperiences
                  .filter((exp) => exp.enabled && (exp.companyName || exp.jobTitle))
                  .map((exp, i) => (
                    <View key={exp.id || i} wrap>
                      {exp.jobTitle && (
                        <Text style={pdfStyles.subHeading}>{exp.jobTitle}</Text>
                      )}
                      {exp.companyName && (
                        <Text style={pdfStyles.text}>
                          {exp.companyName}
                          {exp.location ? ` | ${exp.location}` : ""}
                        </Text>
                      )}
                      {(exp.startDate ||
                        exp.endDate ||
                        exp.currentlyWorking) && (
                        <Text style={pdfStyles.text}>
                          {exp.startDate ? formatMonthYear(exp.startDate) : ""} -{" "}
                          {exp.currentlyWorking
                            ? "Present"
                            : exp.endDate
                            ? formatMonthYear(exp.endDate)
                            : ""}
                        </Text>
                      )}
                      {exp.description && (
                        <Text style={pdfStyles.text}>{exp.description}</Text>
                      )}
                    </View>
                  ))}
              </View>
            )}

          {/* Projects */}
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
                        <Text style={pdfStyles.text}>{proj.projectType}</Text>
                      )}
                      {(proj.startDate ||
                        proj.endDate ||
                        proj.currentlyWorking) && (
                        <Text style={pdfStyles.text}>
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

          {/* Certifications */}
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
                        <Text style={pdfStyles.text}>{cert.providedBy}</Text>
                      )}
                      {cert.date && (
                        <Text style={pdfStyles.text}>
                          {formatMonthYear(cert.date)}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            )}

          {/* Personal Details */}
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
      </Page>
    </Document>
  );
};

export const ModernProfessionalTemplate: React.FC<
  ModernProfessionalTemplateProps
> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [leftPages, setLeftPages] = useState<number[][]>([]);
  const [rightPages, setRightPages] = useState<number[][]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const leftMeasureRef = useRef<HTMLDivElement | null>(null);
  const rightMeasureRef = useRef<HTMLDivElement | null>(null);

  // Helper functions
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
    const parts = [];
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

  // Split long text into smaller chunks so sections can be paginated
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

  // 🔹 Build LEFT sections (logical blocks)
  const leftSections: Section[] = useMemo(() => {
    const sections: Section[] = [];

    if (address || data.personal.email || data.personal.mobileNumber) {
      sections.push({
        key: "left-contact",
        content: (
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
              }}
            >
              Contact
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "rgb(55, 65, 81)",
              }}
            >
              {address && (
                <p style={{ lineHeight: "1.5", wordBreak: "break-word" }}>
                  {address}
                </p>
              )}
              {data.personal.email && (
                <p style={{ lineHeight: "1.5", wordBreak: "break-word" }}>
                  {data.personal.email}
                </p>
              )}
              {data.personal.mobileNumber && (
                <p>{data.personal.mobileNumber}</p>
              )}
            </div>
          </div>
        ),
      });
    }

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
                    marginBottom: "0.75rem",
                    color: "rgb(17, 24, 39)",
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

    if (
      data.skillsLinks.skills &&
      data.skillsLinks.skills.some((s) => s.enabled && s.skillName.trim())
    ) {
      sections.push({
        key: "left-skills",
        content: (
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
              }}
            >
              Skills
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              }}
            >
              {data.skillsLinks.skills
                .filter((s) => s.enabled)
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
                    <span>{skill.skillName}</span>
                    {skill.skillLevel && (
                      <span
                        style={{
                          fontSize: "10px",
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

    if (
      data.personal.languagesKnown &&
      data.personal.languagesKnown.length > 0
    ) {
      sections.push({
        key: "left-languages",
        content: (
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
              }}
            >
              Languages
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              }}
            >
              {data.personal.languagesKnown.map((lang, idx) => (
                <div
                  key={idx}
                  style={{ fontSize: "0.75rem", color: "rgb(55, 65, 81)" }}
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    if (
      data.skillsLinks.linksEnabled &&
      (data.skillsLinks.links.linkedinProfile ||
        data.skillsLinks.links.githubProfile ||
        data.skillsLinks.links.portfolioUrl)
    ) {
      sections.push({
        key: "left-links",
        content: (
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
              }}
            >
              Links
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "rgb(55, 65, 81)",
              }}
            >
              {data.skillsLinks.links.linkedinEnabled &&
                data.skillsLinks.links.linkedinProfile && (
                  <div>
                    <p
                      style={{
                        fontWeight: "600",
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
                        fontWeight: "600",
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
                        fontWeight: "600",
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

  // 🔹 Build RIGHT sections (logical blocks)
  const rightSections: Section[] = useMemo(() => {
    const sections: Section[] = [];

    if (fullName) {
      sections.push({
        key: "right-header",
        content: (
          <div>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "rgb(17, 24, 39)",
                lineHeight: "1.25",
              }}
            >
              {fullName.split(" ")[0]}
              {fullName.split(" ").length > 1 && (
                <>
                  <br />
                  {fullName.split(" ").slice(1).join(" ")}
                </>
              )}
            </h1>
            {getJobTitle() && (
              <p
                style={{
                  fontSize: "1rem",
                  color: "rgb(55, 65, 81)",
                  marginTop: "0.25rem",
                }}
              >
                {getJobTitle()}
              </p>
            )}
          </div>
        ),
      });
    }

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
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
                paddingBottom: "0.25rem",
              }}
            >
              Education
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {data.education.higherEducationEnabled &&
                data.education.higherEducation.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        {edu.degree}{" "}
                        {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      </p>
                      {(edu.startYear || edu.endYear) && (
                        <span
                          style={{
                            fontSize: "0.75rem",
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
                          marginBottom: "0.25rem",
                        }}
                      >
                        {edu.instituteName}
                      </p>
                    )}
                    {edu.universityBoard && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(75, 85, 99)",
                        }}
                      >
                        {edu.universityBoard}
                      </p>
                    )}
                    {edu.result && edu.resultFormat && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(75, 85, 99)",
                          marginTop: "0.25rem",
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
                        marginBottom: "0.25rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
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
                            fontSize: "0.75rem",
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
                        marginBottom: "0.25rem",
                      }}
                    >
                      {data.education.preUniversity.instituteName}
                    </p>
                    {data.education.preUniversity.boardType && (
                      <p
                        style={{
                          fontSize: "0.75rem",
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
                        marginBottom: "0.25rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        SSLC / 10th
                      </p>
                      {data.education.sslc.yearOfPassing && (
                        <span
                          style={{
                            fontSize: "0.75rem",
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
                        marginBottom: "0.25rem",
                      }}
                    >
                      {data.education.sslc.instituteName}
                    </p>
                    {data.education.sslc.boardType && (
                      <p
                        style={{
                          fontSize: "0.75rem",
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

    if (
      data.experience.workExperiences &&
      data.experience.workExperiences.some(
        (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
      )
    ) {
      // Add a header section for Experience
      sections.push({
        key: "right-experience-header",
        content: (
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
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

        // First chunk includes the header + first chunk of description
        sections.push({
          key: `right-experience-${idx}-0`,
          content: (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.25rem",
                }}
              >
                {exp.jobTitle && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "rgb(17, 24, 39)",
                    }}
                  >
                    {exp.jobTitle}
                  </p>
                )}
                {(exp.startDate || exp.endDate || exp.currentlyWorking) && (
                  <span
                    style={{
                      fontSize: "0.75rem",
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
                    marginBottom: "0.25rem",
                  }}
                >
                  {exp.companyName}
                  {exp.location && ` | ${exp.location}`}
                </p>
              )}
              {(exp.employmentType || exp.workMode) && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(75, 85, 99)",
                    marginBottom: "0.25rem",
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
                    marginTop: "0.5rem",
                  }}
                >
                  {descChunks[0]}
                </p>
              )}
            </div>
          ),
        });

        // Remaining description chunks become separate sections to allow split
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

    if (
      data.projects &&
      data.projects.some((proj) => proj.enabled && proj.projectTitle)
    ) {
      sections.push({
        key: "right-projects-header",
        content: (
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
                paddingBottom: "0.25rem",
              }}
            >
              Projects
            </h3>
          </div>
        ),
      });

      const projs = data.projects.filter((proj) => proj.enabled && proj.projectTitle);
      projs.forEach((proj, idx) => {
        const descChunks = splitText(proj.description, 700);
        // first chunk with header
        sections.push({
          key: `right-project-${idx}-0`,
          content: (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "rgb(17, 24, 39)",
                  }}
                >
                  {proj.projectTitle}
                </p>
                {(proj.startDate || proj.endDate || proj.currentlyWorking) && (
                  <span
                    style={{
                      fontSize: "0.75rem",
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
                    marginBottom: "0.25rem",
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
                    marginTop: "0.25rem",
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
                      fontWeight: "600",
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

    if (
      data.skillsLinks.technicalSummaryEnabled &&
      data.skillsLinks.technicalSummary
    ) {
      sections.push({
        key: "right-technical",
        content: (
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
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

    if (
      data.certifications &&
      data.certifications.some(
        (cert) => cert.enabled && cert.certificateTitle
      )
    ) {
      sections.push({
        key: "right-certifications",
        content: (
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
                paddingBottom: "0.25rem",
              }}
            >
              Certifications
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
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
                        marginBottom: "0.25rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "rgb(17, 24, 39)",
                        }}
                      >
                        {cert.certificateTitle}
                      </p>
                      {cert.date && (
                        <span
                          style={{
                            fontSize: "0.75rem",
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
                          marginBottom: "0.25rem",
                        }}
                      >
                        {cert.providedBy}
                        {cert.domain && ` • ${cert.domain}`}
                      </p>
                    )}
                    {cert.certificateType && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgb(75, 85, 99)",
                          marginBottom: "0.25rem",
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

    if (
      data.skillsLinks.linksEnabled &&
      data.skillsLinks.links.publicationEnabled &&
      data.skillsLinks.links.publicationUrl
    ) {
      sections.push({
        key: "right-publications",
        content: (
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
                paddingBottom: "0.25rem",
              }}
            >
              Publications
            </h3>
            <div style={{ fontSize: "0.75rem" }}>
              <p
                style={{
                  color: "rgb(37, 99, 235)",
                  wordBreak: "break-word",
                  marginBottom: "0.25rem",
                }}
              >
                {data.skillsLinks.links.publicationUrl}
              </p>
              {data.skillsLinks.links.publicationDescription && (
                <p
                  style={{ color: "rgb(75, 85, 99)", lineHeight: "1.5" }}
                >
                  {data.skillsLinks.links.publicationDescription}
                </p>
              )}
            </div>
          </div>
        ),
      });
    }

    if (
      data.personal.dateOfBirth ||
      data.personal.nationality ||
      data.personal.passportNumber ||
      data.personal.gender
    ) {
      sections.push({
        key: "right-personal",
        content: (
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
                color: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(209, 213, 219)",
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
                  <span style={{ fontWeight: "600" }}>Date of Birth:</span>{" "}
                  {new Date(data.personal.dateOfBirth).toLocaleDateString()}
                </p>
              )}
              {data.personal.gender && (
                <p>
                  <span style={{ fontWeight: "600" }}>Gender:</span>{" "}
                  {data.personal.gender}
                </p>
              )}
              {data.personal.nationality && (
                <p>
                  <span style={{ fontWeight: "600" }}>Nationality:</span>{" "}
                  {data.personal.nationality}
                </p>
              )}
              {data.personal.passportNumber && (
                <p>
                  <span style={{ fontWeight: "600" }}>Passport:</span>{" "}
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

  // 🔥 Build pages based on REAL DOM heights
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

    if (!leftContainer && !rightContainer) return;

    const A4_HEIGHT_PX = 1122; // Approx height of A4 at 96dpi (tweak if needed)

    // LEFT heights
    const leftHeights: number[] = leftSections.map((_, idx) => {
      const el = leftContainer?.children[idx] as HTMLElement | undefined;
      return el ? el.offsetHeight : 0;
    });

    // RIGHT heights
    const rightHeights: number[] = rightSections.map((_, idx) => {
      const el = rightContainer?.children[idx] as HTMLElement | undefined;
      return el ? el.offsetHeight : 0;
    });

    const leftPagesLocal =
      leftSections.length > 0
        ? buildPagesFromHeights(leftHeights, A4_HEIGHT_PX)
        : [[]];

    const rightPagesLocal =
      rightSections.length > 0
        ? buildPagesFromHeights(rightHeights, A4_HEIGHT_PX)
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
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            width: "35%",
            backgroundColor: "#F5E6D3",
            padding: "1.5rem",
            boxSizing: "border-box",
            height: "297mm",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden" }}>
            {leftIndexes.map((idx) => {
              const section = leftSections[idx];
              if (!section) return null; // <-- FIX
              return (
                <div key={section.key} style={{ marginBottom: "1rem" }}>
                  {section.content}
                </div>
              );
            })}

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div
          style={{
            width: "65%",
            padding: "1.5rem",
            boxSizing: "border-box",
            height: "297mm",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden" }}>
            {rightIndexes.map((idx) => {
              const section = rightSections[idx];
              if (!section) return null; // <-- FIX
              return (
                <div key={section.key} style={{ marginBottom: "1rem" }}>
                  {section.content}
                </div>
              );
            })}

          </div>
        </div>
      </div>
    );
  };

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
      {/* 🔍 HIDDEN MEASUREMENT AREA */}
      <div
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          height: 0,
          overflow: "hidden",
        }}
      >
        <div
          ref={leftMeasureRef}
          style={{
            width: "210mm",
            padding: "1.5rem",
            boxSizing: "border-box",
          }}
        >
          {leftSections.map((section) => (
            <div key={section.key} style={{ marginBottom: "1rem" }}>
              {section.content}
            </div>
          ))}
        </div>

        <div
          ref={rightMeasureRef}
          style={{
            width: "210mm",
            padding: "1.5rem",
            boxSizing: "border-box",
          }}
        >
          {rightSections.map((section) => (
            <div key={section.key} style={{ marginBottom: "1rem" }}>
              {section.content}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ PDF download (react-pdf auto-pagination) */}
      {/* <div style={{ marginBottom: "1rem" }}>
        <PDFDownloadLink
          document={<ResumePDF data={data} />}
          fileName="resume.pdf"
        >
          {({ loading }) =>
            loading ? "Generating PDF..." : "Download PDF (A4, auto page break)"
          }
        </PDFDownloadLink>
      </div> */}

      {/* Current Page Display */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {renderPage(currentPage)}
      </div>

      {/* Page Navigation Controls */}
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
            fontWeight: "600",
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
                backgroundColor:
                  currentPage === i ? "#1f2937" : "#e5e7eb",
                color: currentPage === i ? "white" : "rgb(55, 65, 81)",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: currentPage === i ? "700" : "600",
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
            fontWeight: "600",
          }}
        >
          Next →
        </button>

        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "rgb(55, 65, 81)",
            marginLeft: "0.5rem",
          }}
        >
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default ModernProfessionalTemplate;
