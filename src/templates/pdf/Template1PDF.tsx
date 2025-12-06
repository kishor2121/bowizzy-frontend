import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 42,
    paddingRight: 42,
    fontSize: 10,
    fontFamily: "Times-Roman",
    backgroundColor: "#ffffff",
  },
  // Header Section
  header: {
    borderBottomWidth: 3,
    borderBottomColor: "#4a5568",
    paddingBottom: 18,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameSection: {
    flexDirection: "column",
  },
  name: {
    fontSize: 30,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nameDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#2d3748",
    marginTop: 2,
    marginBottom: 6,
    width: "100%",
  },
  jobTitle: {
    fontSize: 12,
    color: "#4a5568",
    marginTop: 4,
  },
  contactSection: {
    flexDirection: "column",
    alignItems: "flex-end",
    fontSize: 10,
    color: "#4a5568",
  },
  contactItem: {
    marginBottom: 4,
  },
  // Summary Section
  summary: {
    marginBottom: 18,
    textAlign: "justify",
    break: true,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 10,
    break: true,
  },
  summaryText: {
    fontSize: 9,
    color: "#4a5568",
    lineHeight: 1.6,
    textAlign: "justify",
    break: true,
  },
  // Two Column Layout
  twoColumn: {
    flexDirection: "row",
    gap: 35,
  },
  leftColumn: {
    width: "48%",
  },
  rightColumn: {
    width: "48%",
  },
  // Section Styles
  section: {
    marginBottom: 20,
    break: true,
    wrap: false,
  },
  sectionTitle: {
    fontSize: 11,
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
    wrap: false,
  },
  skillItem: {
    fontSize: 9,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Text style={styles.name}>
              {personal.firstName.toUpperCase()}{" "}
              {personal.lastName.toUpperCase()}
            </Text>
            <View style={styles.nameDivider} />
            <Text style={styles.jobTitle}>
              {experience.jobRole || "Executive Secretary"}
            </Text>
          </View>
          <View style={styles.contactSection}>
            <Text style={styles.contactItem}>
              {personal.mobileNumber || "+123-456-7890"}
            </Text>
            <Text style={styles.contactItem}>
              {personal.email || "hello@reallygreatsite.com"}
            </Text>
            <Text style={styles.contactItem}>
              {personal.address || "123 Anywhere St., Any City"}
            </Text>
          </View>
        </View>

        {/* Summary */}
        {personal.aboutCareerObjective && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>SUMMARY</Text>
            <Text style={styles.summaryText}>
              {personal.aboutCareerObjective}
            </Text>
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

                  {/* SSLC */}
                  {education.sslcEnabled && education.sslc.instituteName && (
                    <View style={styles.educationItem}>
                      <Text style={styles.itemTitle}>
                        {education.sslc.instituteName}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        SSLC - {education.sslc.boardType}
                      </Text>
                      <Text style={styles.itemDate}>
                        {education.sslc.yearOfPassing}
                      </Text>
                    </View>
                  )}

                  {/* Pre-University */}
                  {education.preUniversityEnabled &&
                    education.preUniversity.instituteName && (
                      <View style={styles.educationItem}>
                        <Text style={styles.itemTitle}>
                          {education.preUniversity.instituteName}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {education.preUniversity.subjectStream} -{" "}
                          {education.preUniversity.boardType}
                        </Text>
                        <Text style={styles.itemDate}>
                          {education.preUniversity.yearOfPassing}
                        </Text>
                      </View>
                    )}
                </View>
              )}

            {/* Skills */}
            {skillsLinks.skills.length > 0 &&
              skillsLinks.skills.some((s) => s.enabled && s.skillName) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>SKILLS</Text>
                  <View style={styles.skillsList}>
                    {skillsLinks.skills
                      .filter((s) => s.enabled && s.skillName)
                      .map((skill, idx) => (
                        <View key={idx} style={styles.skillItem} break>
                          <Text style={styles.bullet}>•</Text>
                          <Text>{skill.skillName}</Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

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
                            {exp.description
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
                          <Text style={styles.projectDescription}>
                            {project.description}
                          </Text>
                        )}
                        {project.rolesResponsibilities &&
                          project.rolesResponsibilities.trim() !== "" && (
                            <Text style={styles.projectRolesResponsibilities}>
                              <Text style={{ fontFamily: "Times-Bold" }}>
                                Roles & Responsibilities:
                              </Text>{" "}
                              {project.rolesResponsibilities}
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
                  <Text style={styles.technicalText}>
                    {skillsLinks.technicalSummary}
                  </Text>
                </View>
              )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Template1PDF;
