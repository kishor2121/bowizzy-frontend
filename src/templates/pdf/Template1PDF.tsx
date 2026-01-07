import React from "react";
import DOMPurify from 'dompurify';
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 10,
    fontFamily: "Times-Roman",
    backgroundColor: "#ffffff",
  },
  // Header Section
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#6b7280",
    paddingBottom: 16,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameSection: {
    flexDirection: "column",
    flex: 1,
  },
  name: {
    fontSize: 32,
    fontFamily: "Times-Bold",
    color: "#1f2937",
    letterSpacing: 1,
    marginBottom: 0,
  },
  nameDivider: {
    borderBottomWidth: 0,
    width: 0,
  },
  jobTitle: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  verticalSeparator: {
    borderLeftWidth: 1,
    borderLeftColor: "#d1d5db",
    minHeight: 50,
  },
  contactSection: {
    flexDirection: "column",
    alignItems: "flex-end",
    fontSize: 9,
    color: "#4b5563",
    minWidth: 180,
  },
  contactItem: {
    marginBottom: 3,
  },
  // Summary Section
  summary: {
    marginBottom: 18,
    textAlign: "justify",
    break: true,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 10,
    break: true,
  },
  summaryText: {
    fontSize: 10,
    color: "#4a5568",
    lineHeight: 1.6,
    textAlign: "justify",
    break: true,
  },
  // Two Column Layout
  twoColumn: {
    flexDirection: "row",
    gap: 40,
  },
  leftColumn: {
    width: "48%",
  },
  rightColumn: {
    width: "48%",
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 12,
  },
  // Section Styles
  section: {
    marginBottom: 20,
    break: true,
    wrap: false,
    // Ensure at least some space ahead before breaking a section to avoid orphaned headers
    minPresenceAhead: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e0",
  },
  // Education Items
  educationItem: {
    marginBottom: 12,
    break: true,
    wrap: false,
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 9,
    color: "#4a5568",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 8,
    color: "#718096",
  },
  // Skills List
  skillsList: {
    paddingLeft: 0,
    break: true,
    wrap: true,
  },
  skillsText: {
    fontSize: 9,
    color: "#4a5568",
    lineHeight: 1.3,
    textAlign: "left",
    paddingLeft: 10,
  },
  skillItem: {
    fontSize: 10,
    color: "#4a5568",
    marginBottom: 5,
    paddingLeft: 10,
    flexDirection: "row",
  },
  bullet: {
    marginRight: 5,
    marginLeft: -10,
  },
  // Certifications
  certificationItem: {
    marginBottom: 7,
    break: true,
    wrap: false,
  },
  certTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    marginBottom: 2,
  },
  certProvider: {
    fontSize: 8,
    color: "#718096",
    paddingLeft: 10,
  },
  certDescription: {
    fontSize: 8,
    color: "#4a5568",
    paddingLeft: 10,
  },
  // Work Experience
  workItem: {
    marginBottom: 14,
    break: true,
    wrap: false,
  },
  workTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    marginBottom: 2,
  },
  workCompany: {
    fontSize: 9,
    color: "#4a5568",
    fontStyle: "italic",
    marginBottom: 4,
  },
  workDescription: {
    marginTop: 5,
  },
  workDescItem: {
    fontSize: 8,
    color: "#4a5568",
    marginBottom: 3,
    paddingLeft: 10,
    flexDirection: "row",
    lineHeight: 1.4,
    textAlign: "justify",
  },
  // Projects
  projectItem: {
    marginBottom: 12,
    break: true,
    wrap: false,
  },
  projectTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    marginBottom: 2,
  },
  projectDate: {
    fontSize: 8,
    color: "#718096",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 8,
    color: "#4a5568",
    lineHeight: 1.4,
    marginTop: 3,
    textAlign: "justify",
  },
  projectRolesResponsibilities: {
    fontSize: 8,
    color: "#4a5568",
    lineHeight: 1.4,
    marginTop: 3,
    textAlign: "justify",
  },
  // Technical Summary
  technicalText: {
    fontSize: 8,
    color: "#4a5568",
    lineHeight: 1.5,
    textAlign: "justify",
    break: true,
    wrap: false,
  },
});

interface Template1PDFProps {
  data: ResumeData;
}

export const Template1PDF: React.FC<Template1PDFProps> = ({ data }) => {
  const {
    personal,
    education,
    experience,
    projects,
    skillsLinks,
    certifications,
  } = data;

  const htmlToPlainText = (html?: string) => {
    if (!html) return '';
    const sanitized = DOMPurify.sanitize(html || '');
    const withBreaks = sanitized.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n');
    try {
      if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = withBreaks;
        return (tmp.textContent || tmp.innerText || '').trim();
      }
    } catch (e) {
      return withBreaks.replace(/<[^>]+>/g, '').trim();
    }
    return withBreaks.replace(/<[^>]+>/g, '').trim();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>
                {personal.firstName.toUpperCase()} {personal.lastName.toUpperCase()}
              </Text>
              <View style={styles.nameDivider} />
              <Text style={styles.jobTitle}>{experience.jobRole || "Executive Secretary"}</Text>
            </View>

            <View style={styles.contactSection}>
              <Text style={styles.contactItem}>{personal.mobileNumber || "+123-456-7890"}</Text>
              <Text style={styles.contactItem}>{personal.email || "hello@reallygreatsite.com"}</Text>
              <Text style={styles.contactItem}>{personal.address || "123 Anywhere St., Any City"}</Text>
            </View>
          </View>

          {/* Hairline + thick bar (ensure spacing to avoid overlap) */}
          <View style={{ marginTop: 14 }}>
            <View style={styles.headerThin} />
            <View style={styles.headerThick} />
          </View>
        </View>

        {/* Summary */}
        {personal.aboutCareerObjective && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>SUMMARY</Text>
            <View style={{ width: 260, height: 2, backgroundColor: '#cbd5e0', marginTop: 6, marginBottom: 10, alignSelf: 'center' }} />
            <Text style={styles.summaryText}>{htmlToPlainText(personal.aboutCareerObjective)}</Text>
          </View>
        )}

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Education */}
            {education.higherEducationEnabled &&
              education.higherEducation.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>EDUCATION</Text>

                          {/* Higher Education */}
                          {education.higherEducation.map((edu, idx) => (
                    <View key={idx} style={styles.educationItem}>
                      <Text style={styles.itemTitle}>{edu.instituteName}</Text>
                      <Text style={styles.itemSubtitle}>{edu.degree}</Text>
                      <Text style={styles.itemDate}>
                        {edu.startYear} -{" "}
                        {edu.currentlyPursuing ? "Present" : edu.endYear}
                      </Text>
                    </View>
                  ))}
                          {/* Pre-University (show consistent label and same order as display) */}
                          {education.preUniversityEnabled && education.preUniversity.instituteName && (
                            <View style={styles.educationItem}>
                              <Text style={styles.itemTitle}>Pre University</Text>
                              <Text style={styles.itemSubtitle}>{education.preUniversity.instituteName}</Text>
                              <Text style={styles.itemDate}>{education.preUniversity.yearOfPassing}</Text>
                            </View>
                          )}

                          {/* SSLC */}
                          {education.sslcEnabled && education.sslc.instituteName && (
                            <View style={styles.educationItem}>
                              <Text style={styles.itemTitle}>SSLC</Text>
                              <Text style={styles.itemSubtitle}>{education.sslc.instituteName}</Text>
                              <Text style={styles.itemDate}>{education.sslc.yearOfPassing}</Text>
                            </View>
                          )}
                </View>
              )}

            {/* Skills (render directly below Education) */}
            {skillsLinks.skills.length > 0 &&
              skillsLinks.skills.some((s) => s.enabled && s.skillName) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>SKILLS</Text>
                  <View style={styles.skillsList}>
                    <Text style={styles.skillsText}>
                      {skillsLinks.skills
                        .filter((s) => s.enabled && s.skillName)
                        .map((skill) => `• ${skill.skillName}`)
                        .join("\n")}
                    </Text>
                  </View>
                </View>
              )}

            {/* Skills (moved to right column) */}

            {/* Certifications */}
            {certifications.length > 0 &&
              certifications.some((c) => c.enabled && c.certificateTitle) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
                  {certifications
                    .filter((c) => c.enabled && c.certificateTitle)
                    .map((cert, idx) => (
                      <View key={idx} style={styles.certificationItem}>
                        <Text style={styles.certTitle}>
                          • {cert.certificateTitle}
                        </Text>
                        {cert.providedBy && (
                          <Text style={styles.certProvider}>
                            {cert.providedBy} {cert.date && `- ${cert.date}`}
                          </Text>
                        )}
                        {cert.description && cert.description.trim() !== "" && (
                          <Text style={styles.certDescription}>
                            {cert.description}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              )}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Professional Experience */}
            {experience.workExperiences.length > 0 &&
              experience.workExperiences.some((exp) => exp.enabled) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    PROFESSIONAL EXPERIENCE
                  </Text>
                  {experience.workExperiences
                    .filter((exp) => exp.enabled)
                    .map((exp, idx) => (
                      <View key={idx} style={styles.workItem}>
                        <Text style={styles.workTitle}>{exp.jobTitle}</Text>
                        <Text style={styles.workCompany}>
                          {exp.companyName} | {exp.startDate} -{" "}
                          {exp.currentlyWorking ? "Present" : exp.endDate}
                        </Text>
                        {exp.description && (
                          <View style={styles.workDescription}>
                            {htmlToPlainText(exp.description)
                              .split("\n")
                              .filter((line) => line.trim())
                              .map((line, i) => (
                                <View key={i} style={styles.workDescItem}>
                                  <Text style={styles.bullet}>•</Text>
                                  <Text>{line}</Text>
                                </View>
                              ))}
                          </View>
                        )}
                      </View>
                    ))}
                </View>
              )}

            {/* Projects */}
            {projects.length > 0 &&
              projects.some((p) => p.enabled && p.projectTitle) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>PROJECTS</Text>
                  {projects
                    .filter((p) => p.enabled && p.projectTitle)
                    .map((project, idx) => (
                      <View key={idx} style={styles.projectItem}>
                        <Text style={styles.projectTitle}>
                          {project.projectTitle}
                        </Text>
                        <Text style={styles.projectDate}>
                          {project.startDate} -{" "}
                          {project.currentlyWorking
                            ? "Present"
                            : project.endDate}
                        </Text>
                        {project.description && (
                          <Text style={styles.projectDescription}>{htmlToPlainText(project.description)}</Text>
                        )}
                        {project.rolesResponsibilities && project.rolesResponsibilities.trim() !== "" && (
                          <Text style={styles.projectRolesResponsibilities}>
                            <Text style={{ fontFamily: "Times-Bold" }}>Roles & Responsibilities:</Text>{" "}
                            {htmlToPlainText(project.rolesResponsibilities)}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              )}

            {/* Technical Summary */}
            {skillsLinks.technicalSummaryEnabled &&
              skillsLinks.technicalSummary && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>TECHNICAL SUMMARY</Text>
                  <Text style={styles.technicalText}>{htmlToPlainText(skillsLinks.technicalSummary)}</Text>
                </View>
              )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Template1PDF;
