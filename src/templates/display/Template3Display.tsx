import React from 'react';
import type { ResumeData } from '@/types/resume';

interface Template3DisplayProps {
  data: ResumeData;
  showPageBreaks?: boolean;
}

export const Template3Display: React.FC<Template3DisplayProps> = ({ 
  data,
  showPageBreaks = false 
}) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  // Constants based on image analysis
  const primaryColor = '#5B8FB9'; 
  const lightGrayBg = '#E8E8E8';
  const darkTextColor = '#333333';
  const mediumTextColor = '#666666';
  const lightTextColor = '#999999';
  const dividerColor = '#d0d0d0';
  const sidebarHeaderColor = '#4a4a4a';
  const mainHeaderColor = '#4a4a4a';
  const accentColor = primaryColor;
  const sidebarWidth = '35%';
  const mainContentWidth = '65%';
  const padding = '45px 30px';
  const mainContentPadding = '45px 40px 45px 35px';

  return (
    <div className="w-[210mm] bg-white flex relative" style={{ minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar with Diagonal Blue Background */}
      <div style={{ 
        width: sidebarWidth,
        position: 'relative',
        backgroundColor: lightGrayBg
      }}>
        {/* Diagonal Blue Shape */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '150px',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 65%, transparent 65%)`,
          zIndex: 0
        }} />

        {/* Sidebar Content */}
        <div style={{ 
          position: 'relative',
          zIndex: 1,
          padding: padding
        }}>
          {/* Profile Photo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '35px' }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              border: '6px solid #ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {personal.profilePhotoUrl ? (
                <img 
                  src={personal.profilePhotoUrl} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#999999'
                }}>
                  👤
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: primaryColor,
              margin: '0',
              lineHeight: '1.2'
            }}>
              {personal.firstName || 'Lorna'}
            </h1>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: primaryColor,
              margin: '0',
              lineHeight: '1.2'
            }}>
              {personal.lastName || 'Alvarado'}
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: mediumTextColor,
              marginTop: '12px',
              fontWeight: '400'
            }}>
              {experience.jobRole || 'Marketing Manager'}
            </p>
          </div>

          {/* Contact Section */}
          <div className="resume-section" style={{ marginBottom: '32px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '18px' }}>📞</span>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                margin: '0',
                color: sidebarHeaderColor
              }}>
                Contact
              </h2>
            </div>
            <div style={{ 
              paddingLeft: '0', 
              fontSize: '10px',
              borderTop: `1px solid ${dividerColor}`,
              paddingTop: '12px',
              color: sidebarHeaderColor
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', minWidth: '16px', color: primaryColor }}>📞</span>
                <span>{personal.mobileNumber || '+123-456-7890'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', minWidth: '16px', color: primaryColor }}>@</span>
                <span style={{ wordBreak: 'break-all' }}>{personal.email || 'hello@reallygreatsite.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', minWidth: '16px', color: primaryColor }}>📍</span>
                <span>{personal.address || '123 Anywhere St., Any City, ST 12345'}</span>
              </div>
            </div>
          </div>

          {/* About Me Section */}
          {personal.aboutCareerObjective && (
            <div className="resume-section" style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '18px' }}>👤</span>
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  margin: '0',
                  color: sidebarHeaderColor
                }}>
                  About Me
                </h2>
              </div>
              <p style={{ 
                fontSize: '10px',
                paddingLeft: '0',
                paddingTop: '12px',
                borderTop: `1px solid ${dividerColor}`,
                textAlign: 'justify',
                lineHeight: '1.5',
                margin: '0',
                color: sidebarHeaderColor
              }}>
                {personal.aboutCareerObjective}
              </p>
            </div>
          )}

          {/* Skills Section */}
          {skillsLinks.skills.length > 0 && skillsLinks.skills.some(s => s.enabled && s.skillName) && (
            <div className="resume-section" style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '18px' }}>🧩</span>
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  margin: '0',
                  color: sidebarHeaderColor
                }}>
                  Skills
                </h2>
              </div>
              <ul style={{ 
                listStyle: 'none', 
                padding: '0', 
                margin: '0',
                borderTop: `1px solid ${dividerColor}`,
                paddingTop: '12px'
              }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((skill, idx) => (
                  <li key={idx} style={{ 
                    fontSize: '10px',
                    marginBottom: '8px',
                    paddingLeft: '0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    color: sidebarHeaderColor
                  }}>
                    <span>•</span>
                    <span>{skill.skillName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right Content - White */}
      <div style={{ 
        width: mainContentWidth, 
        backgroundColor: '#ffffff',
        color: mediumTextColor,
        padding: mainContentPadding,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Education Section */}
        {education.higherEducationEnabled && education.higherEducation.length > 0 && (
          <div className="resume-section" style={{ marginBottom: '35px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${dividerColor}`
            }}>
              <span style={{ fontSize: '20px' }}>🎓</span>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: mainHeaderColor,
                letterSpacing: '0.5px',
                margin: '0'
              }}>
                Education
              </h2>
            </div>
            {education.higherEducation.map((edu, idx) => (
              <div key={idx} className="education-item" style={{ marginBottom: '20px', marginLeft: '0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    marginTop: '5px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      color: darkTextColor,
                      margin: '0 0 4px 0'
                    }}>
                      {edu.degree || 'Bachelor of Business Management'}
                    </h3>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#777777',
                      fontStyle: 'italic',
                      margin: '0 0 4px 0'
                    }}>
                      {edu.instituteName || 'Borcelle University'}
                    </p>
                    <p style={{ 
                      fontSize: '10px',
                      color: lightTextColor,
                      margin: '0 0 6px 0'
                    }}>
                      {edu.startYear || '2016'} - {edu.currentlyPursuing ? 'Present' : (edu.endYear || '2020')}
                    </p>
                    {edu.resultFormat && edu.result && (
                      <p style={{ 
                        fontSize: '10px',
                        color: mediumTextColor,
                        margin: '0'
                      }}>
                        {edu.resultFormat}: {edu.result}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* SSLC */}
            {education.sslcEnabled && education.sslc.instituteName && (
              <div className="education-item" style={{ marginBottom: '20px', marginLeft: '0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    marginTop: '5px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      color: darkTextColor,
                      margin: '0 0 4px 0'
                    }}>
                      SSLC
                    </h3>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#777777',
                      fontStyle: 'italic',
                      margin: '0 0 4px 0'
                    }}>
                      {education.sslc.instituteName}
                    </p>
                    <p style={{ 
                      fontSize: '10px',
                      color: lightTextColor,
                      margin: '0'
                    }}>
                      {education.sslc.yearOfPassing}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pre-University */}
            {education.preUniversityEnabled && education.preUniversity.instituteName && (
              <div className="education-item" style={{ marginBottom: '20px', marginLeft: '0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    marginTop: '5px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      color: darkTextColor,
                      margin: '0 0 4px 0'
                    }}>
                      {education.preUniversity.subjectStream}
                    </h3>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#777777',
                      fontStyle: 'italic',
                      margin: '0 0 4px 0'
                    }}>
                      {education.preUniversity.instituteName}
                    </p>
                    <p style={{ 
                      fontSize: '10px',
                      color: lightTextColor,
                      margin: '0'
                    }}>
                      {education.preUniversity.yearOfPassing}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Experience Section */}
        {experience.workExperiences.length > 0 && experience.workExperiences.some(exp => exp.enabled) && (
          <div className="resume-section" style={{ marginBottom: '35px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${dividerColor}`
            }}>
              <span style={{ fontSize: '20px' }}>💼</span>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: mainHeaderColor,
                letterSpacing: '0.5px',
                margin: '0'
              }}>
                Experience
              </h2>
            </div>
            {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
              <div key={idx} className="work-item" style={{ marginBottom: '20px', marginLeft: '0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    marginTop: '5px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      color: darkTextColor,
                      margin: '0 0 4px 0'
                    }}>
                      {exp.jobTitle}
                    </h3>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#777777',
                      fontStyle: 'italic',
                      margin: '0 0 4px 0'
                    }}>
                      {exp.companyName}
                    </p>
                    <p style={{ 
                      fontSize: '10px',
                      color: lightTextColor,
                      margin: '0 0 10px 0'
                    }}>
                      {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p style={{ 
                        fontSize: '10px',
                        color: mediumTextColor,
                        margin: '0',
                        lineHeight: '1.6',
                        textAlign: 'justify'
                      }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
          <div className="resume-section" style={{ marginBottom: '35px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${dividerColor}`
            }}>
              <span style={{ fontSize: '20px' }}>📁</span>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: mainHeaderColor,
                letterSpacing: '0.5px',
                margin: '0'
              }}>
                Projects
              </h2>
            </div>
            {projects.filter(p => p.enabled && p.projectTitle).map((project, idx) => (
              <div key={idx} className="project-item" style={{ marginBottom: '20px', marginLeft: '0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    marginTop: '5px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      color: darkTextColor,
                      margin: '0 0 4px 0'
                    }}>
                      {project.projectTitle}
                    </h3>
                    <p style={{ 
                      fontSize: '10px',
                      color: lightTextColor,
                      margin: '0 0 10px 0'
                    }}>
                      {project.startDate} - {project.currentlyWorking ? 'Present' : project.endDate}
                    </p>
                    {project.description && (
                      <p style={{ 
                        fontSize: '10px',
                        color: mediumTextColor,
                        margin: '0',
                        lineHeight: '1.6',
                        textAlign: 'justify'
                      }}>
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical Summary */}
        {skillsLinks.technicalSummaryEnabled && skillsLinks.technicalSummary && (
          <div className="resume-section" style={{ marginBottom: '35px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${dividerColor}`
            }}>
              <span style={{ fontSize: '20px' }}>💻</span>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: mainHeaderColor,
                letterSpacing: '0.5px',
                margin: '0'
              }}>
                Technical Summary
              </h2>
            </div>
            <p style={{ 
              fontSize: '10px',
              color: mediumTextColor,
              lineHeight: '1.6',
              textAlign: 'justify',
              margin: '0'
            }}>
              {skillsLinks.technicalSummary}
            </p>
          </div>
        )}

        {/* References Section */}
        <div className="resume-section">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${dividerColor}`
          }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: mainHeaderColor,
              letterSpacing: '0.5px',
              margin: '0'
            }}>
              References
            </h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '25px',
            marginLeft: '0'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '11px', 
                fontWeight: 'bold',
                color: darkTextColor,
                margin: '0 0 4px 0'
              }}>
                Harumi Kobayashi
              </h3>
              <p style={{ fontSize: '10px', color: mediumTextColor, margin: '0 0 3px 0' }}>
                Wardiere Inc. / CEO
              </p>
              <p style={{ fontSize: '9px', color: lightTextColor, margin: '0 0 2px 0' }}>
                <span style={{ fontWeight: '600' }}>Phone:</span> 123-456-7890
              </p>
              <p style={{ fontSize: '9px', color: lightTextColor, margin: '0', wordBreak: 'break-all' }}>
                <span style={{ fontWeight: '600' }}>Email:</span> hello@reallygreatsite.com
              </p>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '11px', 
                fontWeight: 'bold',
                color: darkTextColor,
                margin: '0 0 4px 0'
              }}>
                Bailey Dupont
              </h3>
              <p style={{ fontSize: '10px', color: mediumTextColor, margin: '0 0 3px 0' }}>
                Wardiere Inc. / CEO
              </p>
              <p style={{ fontSize: '9px', color: lightTextColor, margin: '0 0 2px 0' }}>
                <span style={{ fontWeight: '600' }}>Phone:</span> 123-456-7890
              </p>
              <p style={{ fontSize: '9px', color: lightTextColor, margin: '0', wordBreak: 'break-all' }}>
                <span style={{ fontWeight: '600' }}>Email:</span> hello@reallygreatsite.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template3Display;