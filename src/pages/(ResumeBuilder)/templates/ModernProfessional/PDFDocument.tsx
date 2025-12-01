import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '../../types/resume';

/**
 * PDF Export Component for Modern Professional Template
 * 
 * Note: react-pdf has different capabilities than web rendering
 * - No automatic pagination (must use wrap prop)
 * - Limited CSS support
 * - Different styling approach
 */

// PDF-specific styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: 'row',
    fontFamily: 'Helvetica',
  },
  leftColumn: {
    width: '35%',
    backgroundColor: '#F5E6D3',
    padding: 16,
  },
  rightColumn: {
    width: '65%',
    padding: 16,
  },
  
  // Typography
  mainHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  subHeading: {
    fontSize: 11,
    fontWeight: 'semibold',
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  smallText: {
    fontSize: 9,
    marginBottom: 2,
    color: '#4B5563',
  },
  
  // Spacing
  section: {
    marginTop: 10,
  },
  subsection: {
    marginBottom: 8,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  link: {
    color: '#2563EB',
    textDecoration: 'none',
  },
});

interface PDFDocumentProps {
  data: ResumeData;
}

/**
 * Utility function to format dates for PDF
 */
const formatMonthYear = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
};

/**
 * Modern Professional Resume PDF Component
 */
export const ModernProfessionalPDF: React.FC<PDFDocumentProps> = ({ data }) => {
  // Build full name
  const fullName = [
    data.personal.firstName,
    data.personal.middleName,
    data.personal.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  // Build address
  const addressParts = [
    data.personal.address,
    data.personal.city,
    data.personal.state,
    data.personal.pincode,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        {/* LEFT COLUMN */}
        <View style={pdfStyles.leftColumn}>
          {/* Contact Section */}
          {(addressParts.length > 0 ||
            data.personal.email ||
            data.personal.mobileNumber) && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeading}>Contact</Text>
              {addressParts.map((part, idx) => (
                <Text key={idx} style={pdfStyles.bodyText}>
                  {part}
                </Text>
              ))}
              {data.personal.email && (
                <Text style={pdfStyles.bodyText}>{data.personal.email}</Text>
              )}
              {data.personal.mobileNumber && (
                <Text style={pdfStyles.bodyText}>
                  {data.personal.mobileNumber}
                </Text>
              )}
            </View>
          )}

          {/* About Me Section */}
          {data.personal.aboutCareerObjective && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionHeading}>About Me</Text>
              <Text style={pdfStyles.bodyText}>
                {data.personal.aboutCareerObjective}
              </Text>
            </View>
          )}

          {/* Skills Section */}
          {data.skillsLinks.skills &&
            data.skillsLinks.skills.some(
              (s) => s.enabled && s.skillName.trim()
            ) && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionHeading}>Skills</Text>
                {data.skillsLinks.skills
                  .filter((s) => s.enabled && s.skillName.trim())
                  .map((skill, idx) => (
                    <Text key={idx} style={pdfStyles.bodyText}>
                      {skill.skillName}
                      {skill.skillLevel ? ` (${skill.skillLevel})` : ''}
                    </Text>
                  ))}
              </View>
            )}

          {/* Languages Section */}
          {data.personal.languagesKnown &&
            data.personal.languagesKnown.length > 0 && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionHeading}>Languages</Text>
                {data.personal.languagesKnown.map((lang, idx) => (
                  <Text key={idx} style={pdfStyles.bodyText}>
                    {lang}
                  </Text>
                ))}
              </View>
            )}

          {/* Links Section */}
          {data.skillsLinks.linksEnabled &&
            (data.skillsLinks.links.linkedinProfile ||
              data.skillsLinks.links.githubProfile ||
              data.skillsLinks.links.portfolioUrl) && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionHeading}>Links</Text>
                
                {data.skillsLinks.links.linkedinEnabled &&
                  data.skillsLinks.links.linkedinProfile && (
                    <View style={pdfStyles.subsection}>
                      <Text style={pdfStyles.subHeading}>LinkedIn</Text>
                      <Text style={[pdfStyles.smallText, pdfStyles.link]}>
                        {data.skillsLinks.links.linkedinProfile}
                      </Text>
                    </View>
                  )}

                {data.skillsLinks.links.githubEnabled &&
                  data.skillsLinks.links.githubProfile && (
                    <View style={pdfStyles.subsection}>
                      <Text style={pdfStyles.subHeading}>GitHub</Text>
                      <Text style={[pdfStyles.smallText, pdfStyles.link]}>
                        {data.skillsLinks.links.githubProfile}
                      </Text>
                    </View>
                  )}

                {data.skillsLinks.links.portfolioEnabled &&
                  data.skillsLinks.links.portfolioUrl && (
                    <View style={pdfStyles.subsection}>
                      <Text style={pdfStyles.subHeading}>Portfolio</Text>
                      <Text style={[pdfStyles.smallText, pdfStyles.link]}>
                        {data.skillsLinks.links.portfolioUrl}
                      </Text>
                      {data.skillsLinks.links.portfolioDescription && (
                        <Text style={pdfStyles.smallText}>
                          {data.skillsLinks.links.portfolioDescription}
                        </Text>
                      )}
                    </View>
                  )}
              </View>
            )}
        </View>

        {/* RIGHT COLUMN */}
        <View style={pdfStyles.rightColumn}>
          {/* Header - Name & Job Title */}
          <View>
            <Text style={pdfStyles.mainHeading}>{fullName}</Text>
            {data.experience.jobRole && (
              <Text style={pdfStyles.subHeading}>
                {data.experience.jobRole}
              </Text>
            )}
          </View>

          {/* Education Section */}
          {((data.education.higherEducationEnabled &&
            data.education.higherEducation.length > 0) ||
            (data.education.preUniversityEnabled &&
              data.education.preUniversity.instituteName) ||
            (data.education.sslcEnabled &&
              data.education.sslc.instituteName)) && (
            <View style={pdfStyles.section} wrap>
              <Text style={pdfStyles.sectionHeading}>Education</Text>

              {/* Higher Education */}
              {data.education.higherEducationEnabled &&
                data.education.higherEducation.map((edu, idx) => (
                  <View key={edu.id || idx} style={pdfStyles.subsection} wrap>
                    <Text style={pdfStyles.subHeading}>
                      {edu.degree}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </Text>
                    {edu.instituteName && (
                      <Text style={pdfStyles.bodyText}>
                        {edu.instituteName}
                      </Text>
                    )}
                    {(edu.startYear || edu.endYear) && (
                      <Text style={pdfStyles.smallText}>
                        {edu.startYear}
                        {edu.endYear ? ` - ${edu.endYear}` : ''}
                      </Text>
                    )}
                    {edu.universityBoard && (
                      <Text style={pdfStyles.smallText}>
                        {edu.universityBoard}
                      </Text>
                    )}
                    {edu.result && edu.resultFormat && (
                      <Text style={pdfStyles.smallText}>
                        {edu.resultFormat}: {edu.result}
                      </Text>
                    )}
                  </View>
                ))}

              {/* Pre-University */}
              {data.education.preUniversityEnabled &&
                data.education.preUniversity.instituteName && (
                  <View style={pdfStyles.subsection} wrap>
                    <Text style={pdfStyles.subHeading}>
                      Pre-University / 12th
                      {data.education.preUniversity.subjectStream &&
                        ` (${data.education.preUniversity.subjectStream})`}
                    </Text>
                    <Text style={pdfStyles.bodyText}>
                      {data.education.preUniversity.instituteName}
                    </Text>
                    {data.education.preUniversity.yearOfPassing && (
                      <Text style={pdfStyles.smallText}>
                        {data.education.preUniversity.yearOfPassing}
                      </Text>
                    )}
                    {data.education.preUniversity.boardType && (
                      <Text style={pdfStyles.smallText}>
                        {data.education.preUniversity.boardType}
                      </Text>
                    )}
                  </View>
                )}

              {/* SSLC */}
              {data.education.sslcEnabled &&
                data.education.sslc.instituteName && (
                  <View style={pdfStyles.subsection} wrap>
                    <Text style={pdfStyles.subHeading}>SSLC / 10th</Text>
                    <Text style={pdfStyles.bodyText}>
                      {data.education.sslc.instituteName}
                    </Text>
                    {data.education.sslc.yearOfPassing && (
                      <Text style={pdfStyles.smallText}>
                        {data.education.sslc.yearOfPassing}
                      </Text>
                    )}
                    {data.education.sslc.boardType && (
                      <Text style={pdfStyles.smallText}>
                        {data.education.sslc.boardType}
                      </Text>
                    )}
                  </View>
                )}
            </View>
          )}

          {/* Experience Section */}
          {data.experience.workExperiences &&
            data.experience.workExperiences.some(
              (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
            ) && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.sectionHeading}>Experience</Text>
                {data.experience.workExperiences
                  .filter(
                    (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
                  )
                  .map((exp, idx) => (
                    <View key={exp.id || idx} style={pdfStyles.subsection} wrap>
                      {exp.jobTitle && (
                        <Text style={pdfStyles.subHeading}>
                          {exp.jobTitle}
                        </Text>
                      )}
                      {exp.companyName && (
                        <Text style={pdfStyles.bodyText}>
                          {exp.companyName}
                          {exp.location ? ` | ${exp.location}` : ''}
                        </Text>
                      )}
                      {(exp.startDate || exp.endDate || exp.currentlyWorking) && (
                        <Text style={pdfStyles.smallText}>
                          {exp.startDate ? formatMonthYear(exp.startDate) : ''}{' '}
                          -{' '}
                          {exp.currentlyWorking
                            ? 'Present'
                            : exp.endDate
                            ? formatMonthYear(exp.endDate)
                            : ''}
                        </Text>
                      )}
                      {(exp.employmentType || exp.workMode) && (
                        <Text style={pdfStyles.smallText}>
                          {exp.employmentType}
                          {exp.employmentType && exp.workMode && ' • '}
                          {exp.workMode}
                        </Text>
                      )}
                      {exp.description && (
                        <Text style={pdfStyles.bodyText}>
                          {exp.description}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            )}

          {/* Projects Section */}
          {data.projects &&
            data.projects.some((proj) => proj.enabled && proj.projectTitle) && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.sectionHeading}>Projects</Text>
                {data.projects
                  .filter((proj) => proj.enabled && proj.projectTitle)
                  .map((proj, idx) => (
                    <View key={proj.id || idx} style={pdfStyles.subsection} wrap>
                      <Text style={pdfStyles.subHeading}>
                        {proj.projectTitle}
                      </Text>
                      {proj.projectType && (
                        <Text style={pdfStyles.bodyText}>
                          {proj.projectType}
                        </Text>
                      )}
                      {(proj.startDate || proj.endDate || proj.currentlyWorking) && (
                        <Text style={pdfStyles.smallText}>
                          {proj.startDate ? formatMonthYear(proj.startDate) : ''}{' '}
                          -{' '}
                          {proj.currentlyWorking
                            ? 'Present'
                            : proj.endDate
                            ? formatMonthYear(proj.endDate)
                            : ''}
                        </Text>
                      )}
                      {proj.description && (
                        <Text style={pdfStyles.bodyText}>
                          {proj.description}
                        </Text>
                      )}
                      {proj.rolesResponsibilities && (
                        <View>
                          <Text style={pdfStyles.subHeading}>
                            Roles & Responsibilities:
                          </Text>
                          <Text style={pdfStyles.bodyText}>
                            {proj.rolesResponsibilities}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            )}

          {/* Technical Summary Section */}
          {data.skillsLinks.technicalSummaryEnabled &&
            data.skillsLinks.technicalSummary && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.sectionHeading}>
                  Technical Summary
                </Text>
                <Text style={pdfStyles.bodyText}>
                  {data.skillsLinks.technicalSummary}
                </Text>
              </View>
            )}

          {/* Certifications Section */}
          {data.certifications &&
            data.certifications.some(
              (cert) => cert.enabled && cert.certificateTitle
            ) && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.sectionHeading}>Certifications</Text>
                {data.certifications
                  .filter((cert) => cert.enabled && cert.certificateTitle)
                  .map((cert, idx) => (
                    <View key={cert.id || idx} style={pdfStyles.subsection} wrap>
                      <Text style={pdfStyles.subHeading}>
                        {cert.certificateTitle}
                      </Text>
                      {cert.providedBy && (
                        <Text style={pdfStyles.bodyText}>
                          {cert.providedBy}
                          {cert.domain && ` • ${cert.domain}`}
                        </Text>
                      )}
                      {cert.date && (
                        <Text style={pdfStyles.smallText}>
                          {formatMonthYear(cert.date)}
                        </Text>
                      )}
                      {cert.certificateType && (
                        <Text style={pdfStyles.smallText}>
                          Type: {cert.certificateType}
                        </Text>
                      )}
                      {cert.description && (
                        <Text style={pdfStyles.bodyText}>
                          {cert.description}
                        </Text>
                      )}
                      {cert.certificateUrl && (
                        <Text style={[pdfStyles.smallText, pdfStyles.link]}>
                          {cert.certificateUrl}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            )}

          {/* Publications Section */}
          {data.skillsLinks.linksEnabled &&
            data.skillsLinks.links.publicationEnabled &&
            data.skillsLinks.links.publicationUrl && (
              <View style={pdfStyles.section} wrap>
                <Text style={pdfStyles.sectionHeading}>Publications</Text>
                <Text style={[pdfStyles.bodyText, pdfStyles.link]}>
                  {data.skillsLinks.links.publicationUrl}
                </Text>
                {data.skillsLinks.links.publicationDescription && (
                  <Text style={pdfStyles.bodyText}>
                    {data.skillsLinks.links.publicationDescription}
                  </Text>
                )}
              </View>
            )}

          {/* Personal Details Section */}
          {(data.personal.dateOfBirth ||
            data.personal.gender ||
            data.personal.nationality ||
            data.personal.passportNumber) && (
            <View style={pdfStyles.section} wrap>
              <Text style={pdfStyles.sectionHeading}>Personal Details</Text>
              {data.personal.dateOfBirth && (
                <Text style={pdfStyles.bodyText}>
                  Date of Birth:{' '}
                  {new Date(data.personal.dateOfBirth).toLocaleDateString()}
                </Text>
              )}
              {data.personal.gender && (
                <Text style={pdfStyles.bodyText}>
                  Gender: {data.personal.gender}
                </Text>
              )}
              {data.personal.nationality && (
                <Text style={pdfStyles.bodyText}>
                  Nationality: {data.personal.nationality}
                </Text>
              )}
              {data.personal.passportNumber && (
                <Text style={pdfStyles.bodyText}>
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

export default ModernProfessionalPDF;