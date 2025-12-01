import React from 'react';
import type { ResumeSection } from '../../engine/types';
import type { ResumeData } from '../../types/resume';
import {
  ContactSection,
  SkillsSection,
  LanguagesSection,
  AboutSection,
  LinksSection,
  HeaderSection,
  SectionHeadingBordered,
  DateRange,
  splitText,
  formatMonthYear,
} from '../../engine/SectionBuilder';

/**
 * Build all resume sections from data
 * Template-specific section ordering and styling
 */
export const buildModernProfessionalSections = (
  data: ResumeData
): ResumeSection[] => {
  const sections: ResumeSection[] = [];

  // Helper to build full name
  const fullName = [
    data.personal.firstName,
    data.personal.middleName,
    data.personal.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  // Helper to build address
  const address = [
    data.personal.address,
    data.personal.city,
    data.personal.state,
    data.personal.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  // Helper to get job title
  const getJobTitle = () => {
    if (data.experience.jobRole) return data.experience.jobRole;
    if (data.experience.workExperiences?.[0]?.jobTitle)
      return data.experience.workExperiences[0].jobTitle;
    return '';
  };

  // ============ LEFT COLUMN SECTIONS ============

  // Contact
  if (address || data.personal.email || data.personal.mobileNumber) {
    sections.push({
      key: 'left-contact',
      type: 'contact',
      column: 'left',
      content: (
        <ContactSection
          address={address}
          email={data.personal.email}
          phone={data.personal.mobileNumber}
        />
      ),
    });
  }

  // About Me (split into chunks if needed)
  if (data.personal.aboutCareerObjective) {
    const aboutChunks = splitText(data.personal.aboutCareerObjective, 280);
    aboutChunks.forEach((chunk, i) => {
      sections.push({
        key: `left-about-${i}`,
        type: 'about',
        column: 'left',
        content: (
          <AboutSection content={chunk} showHeading={i === 0} />
        ),
      });
    });
  }

  // Skills
  if (data.skillsLinks.skills) {
    sections.push({
      key: 'left-skills',
      type: 'skills',
      column: 'left',
      content: <SkillsSection skills={data.skillsLinks.skills} />,
    });
  }

  // Languages
  if (data.personal.languagesKnown?.length) {
    sections.push({
      key: 'left-languages',
      type: 'languages',
      column: 'left',
      content: <LanguagesSection languages={data.personal.languagesKnown} />,
    });
  }

  // Links
  if (data.skillsLinks.linksEnabled && data.skillsLinks.links) {
    sections.push({
      key: 'left-links',
      type: 'links',
      column: 'left',
      content: <LinksSection links={data.skillsLinks.links} />,
    });
  }

  // ============ RIGHT COLUMN SECTIONS ============

  // Header (Name + Job Title)
  if (fullName) {
    sections.push({
      key: 'right-header',
      type: 'header',
      column: 'right',
      content: <HeaderSection fullName={fullName} jobTitle={getJobTitle()} />,
    });
  }

  // Education
  const hasEducation =
    (data.education.sslcEnabled && data.education.sslc.instituteName) ||
    (data.education.preUniversityEnabled &&
      data.education.preUniversity.instituteName) ||
    (data.education.higherEducationEnabled &&
      data.education.higherEducation.length > 0);

  if (hasEducation) {
    sections.push({
      key: 'right-education',
      type: 'education',
      column: 'right',
      content: (
        <div>
          <SectionHeadingBordered>Education</SectionHeadingBordered>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Higher Education */}
            {data.education.higherEducationEnabled &&
              data.education.higherEducation.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'rgb(17, 24, 39)',
                      }}
                    >
                      {edu.degree}{' '}
                      {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </p>
                    {(edu.startYear || edu.endYear) && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgb(75, 85, 99)',
                        }}
                      >
                        {edu.startYear} {edu.endYear && `- ${edu.endYear}`}
                      </span>
                    )}
                  </div>
                  {edu.instituteName && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(55, 65, 81)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {edu.instituteName}
                    </p>
                  )}
                  {edu.universityBoard && (
                    <p style={{ fontSize: '0.75rem', color: 'rgb(75, 85, 99)' }}>
                      {edu.universityBoard}
                    </p>
                  )}
                  {edu.result && edu.resultFormat && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(75, 85, 99)',
                        marginTop: '0.25rem',
                      }}
                    >
                      {edu.resultFormat}: {edu.result}
                    </p>
                  )}
                </div>
              ))}

            {/* Pre-University */}
            {data.education.preUniversityEnabled &&
              data.education.preUniversity.instituteName && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'rgb(17, 24, 39)',
                      }}
                    >
                      Pre-University / 12th{' '}
                      {data.education.preUniversity.subjectStream &&
                        `(${data.education.preUniversity.subjectStream})`}
                    </p>
                    {data.education.preUniversity.yearOfPassing && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgb(75, 85, 99)',
                        }}
                      >
                        {data.education.preUniversity.yearOfPassing}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgb(55, 65, 81)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {data.education.preUniversity.instituteName}
                  </p>
                  {data.education.preUniversity.boardType && (
                    <p style={{ fontSize: '0.75rem', color: 'rgb(75, 85, 99)' }}>
                      {data.education.preUniversity.boardType}
                    </p>
                  )}
                </div>
              )}

            {/* SSLC */}
            {data.education.sslcEnabled && data.education.sslc.instituteName && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '0.25rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'rgb(17, 24, 39)',
                    }}
                  >
                    SSLC / 10th
                  </p>
                  {data.education.sslc.yearOfPassing && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(75, 85, 99)',
                      }}
                    >
                      {data.education.sslc.yearOfPassing}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgb(55, 65, 81)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {data.education.sslc.instituteName}
                </p>
                {data.education.sslc.boardType && (
                  <p style={{ fontSize: '0.75rem', color: 'rgb(75, 85, 99)' }}>
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

  // Experience
  const hasExperience =
    data.experience.workExperiences &&
    data.experience.workExperiences.some(
      (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
    );

  if (hasExperience) {
    // Add Experience heading
    sections.push({
      key: 'right-experience-header',
      type: 'experience',
      column: 'right',
      content: <SectionHeadingBordered>Experience</SectionHeadingBordered>,
    });

    // Add each experience (split descriptions if needed)
    const experiences = data.experience.workExperiences.filter(
      (exp) => exp.enabled && (exp.companyName || exp.jobTitle)
    );

    experiences.forEach((exp, idx) => {
      const descChunks = splitText(exp.description, 700);

      // First chunk with all experience details
      sections.push({
        key: `right-experience-${idx}-0`,
        type: 'experience',
        column: 'right',
        content: (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.25rem',
              }}
            >
              {exp.jobTitle && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'rgb(17, 24, 39)',
                  }}
                >
                  {exp.jobTitle}
                </p>
              )}
              <DateRange
                startDate={exp.startDate}
                endDate={exp.endDate}
                currentlyActive={exp.currentlyWorking}
                style={{ marginLeft: '0.5rem' }}
              />
            </div>
            {exp.companyName && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgb(55, 65, 81)',
                  marginBottom: '0.25rem',
                }}
              >
                {exp.companyName}
                {exp.location && ` | ${exp.location}`}
              </p>
            )}
            {(exp.employmentType || exp.workMode) && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgb(75, 85, 99)',
                  marginBottom: '0.25rem',
                }}
              >
                {exp.employmentType}
                {exp.employmentType && exp.workMode && ' • '}
                {exp.workMode}
              </p>
            )}
            {descChunks[0] && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgb(75, 85, 99)',
                  lineHeight: '1.5',
                  marginTop: '0.5rem',
                }}
              >
                {descChunks[0]}
              </p>
            )}
          </div>
        ),
      });

      // Additional description chunks
      for (let c = 1; c < descChunks.length; c++) {
        sections.push({
          key: `right-experience-${idx}-desc-${c}`,
          type: 'experience',
          column: 'right',
          content: (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgb(75, 85, 99)',
                lineHeight: '1.5',
                marginTop: '0.25rem',
              }}
            >
              {descChunks[c]}
            </p>
          ),
        });
      }
    });
  }

  // Projects
  const hasProjects =
    data.projects &&
    data.projects.some((proj) => proj.enabled && proj.projectTitle);

  if (hasProjects) {
    sections.push({
      key: 'right-projects-header',
      type: 'projects',
      column: 'right',
      content: <SectionHeadingBordered>Projects</SectionHeadingBordered>,
    });

    const projects = data.projects.filter(
      (proj) => proj.enabled && proj.projectTitle
    );

    projects.forEach((proj, idx) => {
      const descChunks = splitText(proj.description, 700);

      sections.push({
        key: `right-project-${idx}-0`,
        type: 'projects',
        column: 'right',
        content: (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.25rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'rgb(17, 24, 39)',
                }}
              >
                {proj.projectTitle}
              </p>
              <DateRange
                startDate={proj.startDate}
                endDate={proj.endDate}
                currentlyActive={proj.currentlyWorking}
                style={{ marginLeft: '0.5rem' }}
              />
            </div>
            {proj.projectType && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgb(55, 65, 81)',
                  marginBottom: '0.25rem',
                }}
              >
                {proj.projectType}
              </p>
            )}
            {descChunks[0] && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgb(75, 85, 99)',
                  lineHeight: '1.5',
                  marginTop: '0.25rem',
                }}
              >
                {descChunks[0]}
              </p>
            )}
            {proj.rolesResponsibilities && (
              <div style={{ marginTop: '0.5rem' }}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'rgb(31, 41, 55)',
                  }}
                >
                  Roles & Responsibilities:
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgb(75, 85, 99)',
                    lineHeight: '1.5',
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
          type: 'projects',
          column: 'right',
          content: (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgb(75, 85, 99)',
                lineHeight: '1.5',
                marginTop: '0.25rem',
              }}
            >
              {descChunks[c]}
            </p>
          ),
        });
      }
    });
  }

  // Technical Summary
  if (
    data.skillsLinks.technicalSummaryEnabled &&
    data.skillsLinks.technicalSummary
  ) {
    sections.push({
      key: 'right-technical',
      type: 'technical',
      column: 'right',
      content: (
        <div>
          <SectionHeadingBordered>Technical Summary</SectionHeadingBordered>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'rgb(75, 85, 99)',
              lineHeight: '1.5',
            }}
          >
            {data.skillsLinks.technicalSummary}
          </p>
        </div>
      ),
    });
  }

  // Certifications
  const hasCertifications =
    data.certifications &&
    data.certifications.some((cert) => cert.enabled && cert.certificateTitle);

  if (hasCertifications) {
    sections.push({
      key: 'right-certifications',
      type: 'certifications',
      column: 'right',
      content: (
        <div>
          <SectionHeadingBordered>Certifications</SectionHeadingBordered>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {data.certifications
              .filter((cert) => cert.enabled && cert.certificateTitle)
              .map((cert, idx) => (
                <div key={cert.id || idx}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'rgb(17, 24, 39)',
                      }}
                    >
                      {cert.certificateTitle}
                    </p>
                    {cert.date && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgb(75, 85, 99)',
                        }}
                      >
                        {formatMonthYear(cert.date)}
                      </span>
                    )}
                  </div>
                  {cert.providedBy && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(55, 65, 81)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {cert.providedBy}
                      {cert.domain && ` • ${cert.domain}`}
                    </p>
                  )}
                  {cert.certificateType && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(75, 85, 99)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Type: {cert.certificateType}
                    </p>
                  )}
                  {cert.description && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(75, 85, 99)',
                        lineHeight: '1.5',
                      }}
                    >
                      {cert.description}
                    </p>
                  )}
                  {cert.certificateUrl && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgb(37, 99, 235)',
                        marginTop: '0.25rem',
                        wordBreak: 'break-word',
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

  // Publications
  if (
    data.skillsLinks.linksEnabled &&
    data.skillsLinks.links.publicationEnabled &&
    data.skillsLinks.links.publicationUrl
  ) {
    sections.push({
      key: 'right-publications',
      type: 'publications',
      column: 'right',
      content: (
        <div>
          <SectionHeadingBordered>Publications</SectionHeadingBordered>
          <div style={{ fontSize: '0.75rem' }}>
            <p
              style={{
                color: 'rgb(37, 99, 235)',
                wordBreak: 'break-word',
                marginBottom: '0.25rem',
              }}
            >
              {data.skillsLinks.links.publicationUrl}
            </p>
            {data.skillsLinks.links.publicationDescription && (
              <p style={{ color: 'rgb(75, 85, 99)', lineHeight: '1.5' }}>
                {data.skillsLinks.links.publicationDescription}
              </p>
            )}
          </div>
        </div>
      ),
    });
  }

  // Personal Details
  if (
    data.personal.dateOfBirth ||
    data.personal.nationality ||
    data.personal.passportNumber ||
    data.personal.gender
  ) {
    sections.push({
      key: 'right-personal',
      type: 'personal',
      column: 'right',
      content: (
        <div>
          <SectionHeadingBordered>Personal Details</SectionHeadingBordered>
          <div
            style={{
              gap: '0.25rem',
              display: 'flex',
              flexDirection: 'column',
              fontSize: '0.75rem',
              color: 'rgb(55, 65, 81)',
            }}
          >
            {data.personal.dateOfBirth && (
              <p>
                <span style={{ fontWeight: '600' }}>Date of Birth:</span>{' '}
                {new Date(data.personal.dateOfBirth).toLocaleDateString()}
              </p>
            )}
            {data.personal.gender && (
              <p>
                <span style={{ fontWeight: '600' }}>Gender:</span>{' '}
                {data.personal.gender}
              </p>
            )}
            {data.personal.nationality && (
              <p>
                <span style={{ fontWeight: '600' }}>Nationality:</span>{' '}
                {data.personal.nationality}
              </p>
            )}
            {data.personal.passportNumber && (
              <p>
                <span style={{ fontWeight: '600' }}>Passport:</span>{' '}
                {data.personal.passportNumber}
              </p>
            )}
          </div>
        </div>
      ),
    });
  }

  return sections;
};