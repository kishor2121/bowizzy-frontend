import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

// Safe text helper
const safe = (v: any): string =>
  typeof v === "string" || typeof v === "number" ? String(v) : "";

// Month-year formatter
const formatMY = (dt?: string) => {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    padding: 20,
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
  sub: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 3,
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  block: {
    marginBottom: 12,
  },
});

export const ResumePDF = ({ data }: { data: ResumeData }) => {
  // 🛡️ SAFETY DEFAULTS (Fixes when user clears form)
  const personal = data.personal || {};
  const skillsLinks = data.skillsLinks || {};
  const education = data.education || {};
  const experience = data.experience || {};

  const projects = data.projects || [];
  const certifications = data.certifications || [];

  skillsLinks.skills = skillsLinks.skills || [];
  skillsLinks.links = skillsLinks.links || {};

  education.higherEducation = education.higherEducation || [];
  education.preUniversity = education.preUniversity || {};
  education.sslc = education.sslc || {};

  experience.workExperiences = experience.workExperiences || [];

  personal.languagesKnown = personal.languagesKnown || [];

  // Full Name
  const fullName = [
    safe(personal.firstName),
    safe(personal.middleName),
    safe(personal.lastName),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* LEFT COLUMN */}
        <View style={styles.left}>
          {/* CONTACT */}
          {(personal.address ||
            personal.email ||
            personal.mobileNumber) && (
            <View style={styles.block}>
              <Text style={styles.heading}>Contact</Text>

              {safe(personal.address) !== "" && (
                <Text style={styles.text}>{safe(personal.address)}</Text>
              )}
              {safe(personal.city) !== "" && (
                <Text style={styles.text}>{safe(personal.city)}</Text>
              )}
              {safe(personal.state) !== "" && (
                <Text style={styles.text}>{safe(personal.state)}</Text>
              )}
              {safe(personal.pincode) !== "" && (
                <Text style={styles.text}>{safe(personal.pincode)}</Text>
              )}
              {safe(personal.email) !== "" && (
                <Text style={styles.text}>{safe(personal.email)}</Text>
              )}
              {safe(personal.mobileNumber) !== "" && (
                <Text style={styles.text}>{safe(personal.mobileNumber)}</Text>
              )}
            </View>
          )}

          {/* ABOUT ME */}
          {safe(personal.aboutCareerObjective) !== "" && (
            <View style={styles.block}>
              <Text style={styles.heading}>About Me</Text>
              <Text style={styles.text}>
                {safe(personal.aboutCareerObjective)}
              </Text>
            </View>
          )}

          {/* SKILLS */}
          {skillsLinks.skills.some((s: any) => s.enabled) && (
            <View style={styles.block}>
              <Text style={styles.heading}>Skills</Text>

              {skillsLinks.skills
                .filter((s: any) => s.enabled)
                .map((s: any, i: number) => (
                  <Text key={i} style={styles.text}>
                    {safe(s.skillName)}
                    {s.skillLevel ? ` (${safe(s.skillLevel)})` : ""}
                  </Text>
                ))}
            </View>
          )}

          {/* LANGUAGES */}
          {personal.languagesKnown.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.heading}>Languages</Text>

              {personal.languagesKnown.map((lang: any, i: number) => (
                <Text key={i} style={styles.text}>
                  {safe(lang)}
                </Text>
              ))}
            </View>
          )}

          {/* LINKS */}
          {(skillsLinks.links.linkedinProfile ||
            skillsLinks.links.githubProfile ||
            skillsLinks.links.portfolioUrl) && (
            <View style={styles.block}>
              <Text style={styles.heading}>Links</Text>

              {/* LinkedIn */}
              {skillsLinks.links.linkedinEnabled &&
                safe(skillsLinks.links.linkedinProfile) !== "" && (
                  <>
                    <Text style={styles.sub}>LinkedIn</Text>
                    <Text style={styles.text}>
                      {safe(skillsLinks.links.linkedinProfile)}
                    </Text>
                  </>
                )}

              {/* GitHub */}
              {skillsLinks.links.githubEnabled &&
                safe(skillsLinks.links.githubProfile) !== "" && (
                  <>
                    <Text style={styles.sub}>GitHub</Text>
                    <Text style={styles.text}>
                      {safe(skillsLinks.links.githubProfile)}
                    </Text>
                  </>
                )}

              {/* Portfolio */}
              {skillsLinks.links.portfolioEnabled &&
                safe(skillsLinks.links.portfolioUrl) !== "" && (
                  <>
                    <Text style={styles.sub}>Portfolio</Text>
                    <Text style={styles.text}>
                      {safe(skillsLinks.links.portfolioUrl)}
                    </Text>
                  </>
                )}
            </View>
          )}
        </View>

        {/* RIGHT COLUMN */}
        <View style={styles.right}>
          {/* NAME */}
          <View style={styles.block}>
            <Text style={{ fontSize: 22, fontWeight: 700 }}>
              {safe(fullName)}
            </Text>

            {safe(experience.jobRole) !== "" && (
              <Text style={{ fontSize: 12, marginTop: 2 }}>
                {safe(experience.jobRole)}
              </Text>
            )}
          </View>

          {/* EDUCATION */}
          {(education.higherEducation.length > 0 ||
            education.preUniversity.instituteName ||
            education.sslc.instituteName) && (
            <View style={styles.block} wrap>
              <Text style={styles.heading}>Education</Text>

              {/* Higher Education */}
              {education.higherEducation.map((e: any, i: number) => (
                <View key={i} style={{ marginBottom: 6 }} wrap>
                  <Text style={styles.sub}>
                    {safe(e.degree)}
                    {e.fieldOfStudy ? ` in ${safe(e.fieldOfStudy)}` : ""}
                  </Text>

                  {safe(e.instituteName) !== "" && (
                    <Text style={styles.text}>{safe(e.instituteName)}</Text>
                  )}

                  <Text style={styles.text}>
                    {safe(e.startYear)} {e.endYear ? `- ${safe(e.endYear)}` : ""}
                  </Text>

                  {safe(e.universityBoard) !== "" && (
                    <Text style={styles.text}>{safe(e.universityBoard)}</Text>
                  )}

                  {safe(e.result) !== "" && (
                    <Text style={styles.text}>
                      {safe(e.resultFormat)}: {safe(e.result)}
                    </Text>
                  )}
                </View>
              ))}

              {/* PUC */}
              {safe(education.preUniversity.instituteName) !== "" && (
                <View style={{ marginBottom: 6 }} wrap>
                  <Text style={styles.sub}>
                    Pre-University
                    {education.preUniversity.subjectStream
                      ? ` (${safe(education.preUniversity.subjectStream)})`
                      : ""}
                  </Text>

                  <Text style={styles.text}>
                    {safe(education.preUniversity.instituteName)}
                  </Text>

                  <Text style={styles.text}>
                    {safe(education.preUniversity.yearOfPassing)}
                  </Text>
                </View>
              )}

              {/* SSLC */}
              {safe(education.sslc.instituteName) !== "" && (
                <View wrap>
                  <Text style={styles.sub}>SSLC / 10th</Text>

                  <Text style={styles.text}>
                    {safe(education.sslc.instituteName)}
                  </Text>

                  <Text style={styles.text}>
                    {safe(education.sslc.yearOfPassing)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* EXPERIENCE */}
          {experience.workExperiences.some(
            (e: any) => e.enabled && (e.jobTitle || e.companyName)
          ) && (
            <View style={styles.block} wrap>
              <Text style={styles.heading}>Experience</Text>

              {experience.workExperiences
                .filter((e: any) => e.enabled)
                .map((e: any, i: number) => (
                  <View key={i} style={{ marginBottom: 6 }} wrap>
                    <Text style={styles.sub}>{safe(e.jobTitle)}</Text>

                    <Text style={styles.text}>
                      {safe(e.companyName)}
                      {safe(e.location) !== "" && ` | ${safe(e.location)}`}
                    </Text>

                    <Text style={styles.text}>
                      {formatMY(e.startDate)} -{" "}
                      {e.currentlyWorking ? "Present" : formatMY(e.endDate)}
                    </Text>

                    {safe(e.description) !== "" && (
                      <Text style={styles.text}>{safe(e.description)}</Text>
                    )}
                  </View>
                ))}
            </View>
          )}

          {/* PROJECTS */}
          {projects.some((p: any) => p.enabled && p.projectTitle) && (
            <View style={styles.block} wrap>
              <Text style={styles.heading}>Projects</Text>

              {projects
                .filter((p: any) => p.enabled)
                .map((p: any, i: number) => (
                  <View key={i} style={{ marginBottom: 6 }} wrap>
                    <Text style={styles.sub}>{safe(p.projectTitle)}</Text>

                    {safe(p.projectType) !== "" && (
                      <Text style={styles.text}>{safe(p.projectType)}</Text>
                    )}

                    <Text style={styles.text}>
                      {formatMY(p.startDate)} -{" "}
                      {p.currentlyWorking ? "Present" : formatMY(p.endDate)}
                    </Text>

                    {safe(p.description) !== "" && (
                      <Text style={styles.text}>{safe(p.description)}</Text>
                    )}
                  </View>
                ))}
            </View>
          )}

          {/* CERTIFICATIONS */}
          {certifications.some((c: any) => c.enabled) && (
            <View style={styles.block} wrap>
              <Text style={styles.heading}>Certifications</Text>

              {certifications
                .filter((c: any) => c.enabled)
                .map((c: any, i: number) => (
                  <View key={i} style={{ marginBottom: 6 }} wrap>
                    <Text style={styles.sub}>
                      {safe(c.certificateTitle)}
                    </Text>

                    {safe(c.providedBy) !== "" && (
                      <Text style={styles.text}>{safe(c.providedBy)}</Text>
                    )}

                    <Text style={styles.text}>{formatMY(c.date)}</Text>

                    {safe(c.description) !== "" && (
                      <Text style={styles.text}>{safe(c.description)}</Text>
                    )}
                  </View>
                ))}
            </View>
          )}

          {/* PERSONAL DETAILS */}
          {(personal.gender ||
            personal.dateOfBirth ||
            personal.nationality ||
            personal.passportNumber) && (
            <View style={styles.block} wrap>
              <Text style={styles.heading}>Personal Details</Text>

              {safe(personal.dateOfBirth) !== "" && (
                <Text style={styles.text}>
                  Date of Birth:{" "}
                  {new Date(safe(personal.dateOfBirth)).toLocaleDateString()}
                </Text>
              )}

              {safe(personal.gender) !== "" && (
                <Text style={styles.text}>
                  Gender: {safe(personal.gender)}
                </Text>
              )}

              {safe(personal.nationality) !== "" && (
                <Text style={styles.text}>
                  Nationality: {safe(personal.nationality)}
                </Text>
              )}

              {safe(personal.passportNumber) !== "" && (
                <Text style={styles.text}>
                  Passport: {safe(personal.passportNumber)}
                </Text>
              )}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
