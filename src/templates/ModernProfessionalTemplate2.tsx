import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ResumeData } from "@/types/resume";
import { exportPagesAsPdf } from "@/pages/(ResumeBuilder)/lib/pdfExport";


interface ModernProfessionalTemplateProps {
  data: ResumeData;
}

interface Section {
  key: string;
  content: React.ReactNode;
}

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
      // Push a header for Education
      sections.push({
        key: "right-education-header",
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
              Education
            </h3>
          </div>
        ),
      });

      // Higher education entries as separate sections
      if (data.education.higherEducationEnabled) {
        data.education.higherEducation.forEach((edu, idx) => {
          sections.push({
            key: `right-edu-${idx}`,
            content: (
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
                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
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
            ),
          });
        });
      }

      // Pre-university as its own section
      if (
        data.education.preUniversityEnabled &&
        data.education.preUniversity.instituteName
      ) {
        sections.push({
          key: "right-preuniversity",
          content: (
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
                  Pre-University / 12th {data.education.preUniversity.subjectStream && `(${data.education.preUniversity.subjectStream})`}
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
          ),
        });
      }

      // SSLC as its own section
      if (data.education.sslcEnabled && data.education.sslc.instituteName) {
        sections.push({
          key: "right-sslc",
          content: (
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
          ),
        });
      }
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
        const descChunks = splitText(exp.description, 300);

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
        const descChunks = splitText(proj.description, 300);

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
                    {splitText(proj.rolesResponsibilities, 300)[0]}
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

        // split roles & responsibilities into additional sections if present
        if (proj.rolesResponsibilities) {
          const rolesChunks = splitText(proj.rolesResponsibilities, 300);
          for (let r = 1; r < rolesChunks.length; r++) {
            sections.push({
              key: `right-project-${idx}-roles-${r}`,
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
                    {rolesChunks[r]}
                  </p>
                </div>
              ),
            });
          }
        }
      });
    }

    // TECHNICAL SUMMARY (split into chunks so it can flow across pages)
    if (
      data.skillsLinks.technicalSummaryEnabled &&
      data.skillsLinks.technicalSummary
    ) {
      const techChunks = splitText(data.skillsLinks.technicalSummary, 450);

      // header section
      sections.push({
        key: "right-technical-header",
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
          </div>
        ),
      });

      techChunks.forEach((chunk, i) => {
        sections.push({
          key: `right-technical-${i}`,
          content: (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgb(75, 85, 99)",
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

    // CERTIFICATIONS (split into per-cert sections so they can flow across pages)
    if (
      data.certifications &&
      data.certifications.some((cert) => cert.enabled && cert.certificateTitle)
    ) {
      const certs = data.certifications.filter(
        (cert) => cert.enabled && cert.certificateTitle
      );

      // header section
      sections.push({
        key: "right-certifications-header",
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
          </div>
        ),
      });

      certs.forEach((cert, idx) => {
        const descChunks = splitText(cert.description, 450);

        sections.push({
          key: `right-cert-${idx}-0`,
          content: (
            <div style={{ marginTop: "0.55rem" }}>
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

              {descChunks[0] && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgb(75, 85, 99)",
                    lineHeight: "1.5",
                  }}
                >
                  {descChunks[0]}
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
          ),
        });

        for (let c = 1; c < descChunks.length; c++) {
          sections.push({
            key: `right-cert-${idx}-desc-${c}`,
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

  // PDF export is handled by `exportPagesAsPdf` in `src/lib/pdfExport.ts`

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
          onClick={() => exportPagesAsPdf(renderPage, totalPages)}
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
