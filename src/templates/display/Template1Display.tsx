import React from 'react';
import type { ResumeData } from '@/types/resume';

interface Template1DisplayProps {
  data: ResumeData;
  showPageBreaks?: boolean;
}

export const Template1Display: React.FC<Template1DisplayProps> = ({ 
  data,
  showPageBreaks = false 
}) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  return (
    <div className="w-[210mm] bg-white" style={{ minHeight: '297mm', fontFamily: 'Times New Roman, serif' }}>
      {/* Header Section */}
      <div style={{ padding: '30px 40px 20px 40px', borderBottom: '3px solid #4a5568' }}>
        <div className="flex justify-between items-start">
          {/* Left - Name and Title */}
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#2d3748',
              letterSpacing: '2px',
              marginBottom: '4px'
            }}>
              {personal.firstName.toUpperCase()} <span style={{ fontWeight: 'normal' }}>{personal.lastName.toUpperCase()}</span>
            </h1>
            <div style={{ 
              borderBottom: '1px solid #2d3748', 
              width: '100%', 
              marginTop: '4px',
              marginBottom: '8px'
            }}></div>
            <p style={{ fontSize: '14px', color: '#4a5568', marginTop: '4px' }}>
              {experience.jobRole}
            </p>
          </div>

          {/* Right - Contact Info */}
          <div className="text-right" style={{ fontSize: '11px', color: '#4a5568' }}>
            <div className="flex items-center justify-end gap-2 mb-2">
              <span>{personal.mobileNumber}</span>
            </div>
            <div className="flex items-center justify-end gap-2 mb-2">
              <span>{personal.email }</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span>{personal.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {personal.aboutCareerObjective && (
        <div className="resume-section" style={{ padding: '20px 40px' }}>
          <h2 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            color: '#2d3748',
            textAlign: 'center',
            letterSpacing: '3px',
            marginBottom: '12px'
          }}>
            SUMMARY
          </h2>
          <p style={{ 
            fontSize: '10px', 
            color: '#4a5568', 
            textAlign: 'justify',
            lineHeight: '1.6'
          }}>
            {personal.aboutCareerObjective}
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex" style={{ padding: '0 40px 30px 40px', gap: '40px' }}>
        {/* Left Column */}
        <div style={{ width: '48%' }}>
          {/* Education Section */}
          {(education.higherEducationEnabled && education.higherEducation.length > 0) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0'
              }}>
                EDUCATION
              </h2>
              {education.higherEducation.map((edu, idx) => (
                <div key={idx} className="education-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {edu.instituteName || 'Ginyard International Co. University'}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>
                    {edu.degree || 'Bachelor Degree in Business Administration'}
                  </p>
                  <p style={{ fontSize: '9px', color: '#718096' }}>
                    {edu.startYear} - {edu.currentlyPursuing ? 'Present' : (edu.endYear || '2020')}
                  </p>
                </div>
              ))}

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <div className="education-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {education.sslc.instituteName}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>
                    SSLC - {education.sslc.boardType}
                  </p>
                  <p style={{ fontSize: '9px', color: '#718096' }}>
                    {education.sslc.yearOfPassing}
                  </p>
                </div>
              )}

              {/* Pre-University */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <div className="education-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {education.preUniversity.instituteName}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>
                    {education.preUniversity.subjectStream} - {education.preUniversity.boardType}
                  </p>
                  <p style={{ fontSize: '9px', color: '#718096' }}>
                    {education.preUniversity.yearOfPassing}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Skills Section */}
          {skillsLinks.skills.length > 0 && skillsLinks.skills.some(s => s.enabled && s.skillName) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0'
              }}>
                SKILLS
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((skill, idx) => (
                  <li key={idx} style={{ 
                    fontSize: '10px', 
                    color: '#4a5568',
                    marginBottom: '6px',
                    paddingLeft: '12px',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: '0', top: '0' }}>•</span>
                    {skill.skillName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && certifications.some(c => c.enabled && c.certificateTitle) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0',
                textAlign: 'justify'
              }}>
                CERTIFICATIONS
              </h2>
              {certifications.filter(c => c.enabled && c.certificateTitle).map((cert, idx) => (
                <div key={idx} className="certification-item" style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '10px', color: '#2d3748', fontWeight: '600', marginBottom: '2px' }}>
                    • {cert.certificateTitle}
                  </p>
                  {cert.providedBy && (
                    <p style={{ fontSize: '9px', color: '#718096', paddingLeft: '12px' }}>
                      {cert.providedBy} {cert.date && `- ${cert.date}`}
                    </p>
                  )}
                  {cert.description && (
                    <p style={{ fontSize: '9px', color: '#718096', paddingLeft: '12px' }}>
                      {cert.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ width: '48%' }}>
          {/* Professional Experience Section */}
          {experience.workExperiences.length > 0 && experience.workExperiences.some(exp => exp.enabled) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0',
                textAlign: 'justify'
                
              }}>
                PROFESSIONAL EXPERIENCE
              </h2>
              {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
                <div key={idx} className="work-item" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {exp.jobTitle}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', fontStyle: 'italic', marginBottom: '4px' }}>
                    {exp.companyName} | {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
                      {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <li key={i} style={{ 
                          fontSize: '9px', 
                          color: '#4a5568',
                          marginBottom: '4px',
                          paddingLeft: '12px',
                          position: 'relative',
                          lineHeight: '1.4',
                          textAlign: 'justify'
                        }}>
                          <span style={{ position: 'absolute', left: '0', top: '0' }}>•</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0'
              }}>
                PROJECTS
              </h2>
              {projects.filter(p => p.enabled && p.projectTitle).map((project, idx) => (
                <div key={idx} className="project-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {project.projectTitle}
                  </h3>
                  <p style={{ fontSize: '9px', color: '#718096', marginBottom: '4px' }}>
                    {project.startDate} - {project.currentlyWorking ? 'Present' : project.endDate}
                  </p>
                  {project.description && (
                    <p style={{ fontSize: '9px', color: '#4a5568', lineHeight: '1.4', marginTop: '4px', textAlign: 'justify' }}>
                      {project.description}
                    </p>
                  )}
                  {project.rolesResponsibilities && (
                    <p style={{ fontSize: '9px', color: '#4a5568', lineHeight: '1.4', marginTop: '4px', textAlign: 'justify' }}>
                      <strong>Roles & Responsibilities:</strong> {project.rolesResponsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Technical Summary */}
          {skillsLinks.technicalSummaryEnabled && skillsLinks.technicalSummary && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0',
                textAlign: 'justify'
              }}>
                TECHNICAL SUMMARY
              </h2>
              <p style={{ fontSize: '9px', color: '#4a5568', lineHeight: '1.5', textAlign: 'justify' }}>
                {skillsLinks.technicalSummary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template1Display;