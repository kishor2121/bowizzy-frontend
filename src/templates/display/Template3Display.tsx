import React from 'react';
import DOMPurify from 'dompurify';
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

  // Show education if any of the education subsections have data
  const hasEducation = (
    (education.higherEducationEnabled && education.higherEducation.length > 0) ||
    (education.sslcEnabled && !!education.sslc?.instituteName) ||
    (education.preUniversityEnabled && !!education.preUniversity?.instituteName)
  );

  // Pre-University label: always show a consistent heading regardless of subject stream
  const preUniversityLabel = 'Pre University';

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
                  justifyContent: 'center'
                }}>
                  <img src="/icons/user.svg" alt="Profile" style={{ width: 48, height: 48, color: '#999999' }} />
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
              <img src="/icons/phone.svg" alt="Contact" style={{ width: 18, height: 18 }} />
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
                <img src="/icons/phone.svg" alt="Mobile" style={{ width: 12, height: 12, marginTop: 2 }} />
                <span>{personal.mobileNumber || '+123-456-7890'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <img src="/icons/mail.svg" alt="Email" style={{ width: 12, height: 12, marginTop: 2 }} />
                <span style={{ wordBreak: 'break-all' }}>{personal.email || 'hello@reallygreatsite.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <img src="/icons/location.svg" alt="Location" style={{ width: 12, height: 12, marginTop: 2 }} />
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
                <img src="/icons/user.svg" alt="About" style={{ width: 18, height: 18 }} />
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
              <div style={{ 
                fontSize: '10px',
                paddingLeft: '0',
                paddingTop: '12px',
                borderTop: `1px solid ${dividerColor}`,
                textAlign: 'justify',
                lineHeight: '1.5',
                margin: '0',
                color: sidebarHeaderColor
              }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(personal.aboutCareerObjective || '') }}
              />
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
                <img src="/icons/skills.svg" alt="Skills" style={{ width: 18, height: 18 }} />
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
        {hasEducation && (
          <div className="resume-section" style={{ marginBottom: '35px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${dividerColor}`
            }}>
              <img src="/icons/edu.svg" alt="Education" style={{ width: 20, height: 20 }} />
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
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '3.5px',
                top: '5px',
                bottom: '20px',
                width: '2px',
                backgroundColor: accentColor
              }}></div>
              
              {education.higherEducation.map((edu, idx) => (
                <div key={idx} className="education-item" style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      marginTop: '5px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1
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
              {/* Pre-University (PUC/Diploma) - placed before SSLC to follow order: Higher Ed → PUC/Diploma → SSLC */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <div className="education-item" style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      marginTop: '5px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        color: darkTextColor,
                        margin: '0 0 4px 0'
                      }}>
                        {preUniversityLabel}
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

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <div className="education-item" style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      marginTop: '5px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1
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
            </div>
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
              <img src="/icons/briefcase.svg" alt="Experience" style={{ width: 20, height: 20 }} />
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
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '3.5px',
                top: '5px',
                bottom: '20px',
                width: '2px',
                backgroundColor: accentColor
              }}></div>
              
              {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
                <div key={idx} className="work-item" style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      marginTop: '5px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1
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
                        <div style={{ 
                          fontSize: '10px',
                          color: mediumTextColor,
                          margin: '0',
                          lineHeight: '1.6',
                          textAlign: 'justify'
                        }}
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications block moved below Projects to match desired order: Education → Experience → Projects → Certifications */}

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
              <img src="/icons/project.svg" alt="Projects" style={{ width: 20, height: 20 }} />
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
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '3.5px',
                top: '5px',
                bottom: '20px',
                width: '2px',
                backgroundColor: accentColor
              }}></div>
              
              {projects.filter(p => p.enabled && p.projectTitle).map((project, idx) => (
                <div key={idx} className="project-item" style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      marginTop: '5px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1
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
                        <div style={{ 
                          fontSize: '10px',
                          color: mediumTextColor,
                          margin: '0',
                          lineHeight: '1.6',
                          textAlign: 'justify'
                        }}
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.description || '') }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications (formatted like design: header + two-column list with muted dates) */}
        {certifications && certifications.length > 0 && certifications.some(c => c.enabled && c.certificateTitle) && (
          <div className="resume-section" style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              paddingBottom: '6px',
              borderBottom: `1px solid ${dividerColor}`
            }}>
              <span style={{ fontSize: '20px' }}>🏅</span>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: mainHeaderColor,
                letterSpacing: '0.5px',
                margin: '0'
              }}>
                Certifications
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', paddingTop: '8px' }}>
              {certifications.filter(c => c.enabled && c.certificateTitle).map((c, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: darkTextColor }}>
                  <div style={{ fontSize: '11px', color: darkTextColor, marginBottom: '6px' }}>{c.certificateTitle}</div>
                  <div style={{ fontSize: '10px', color: lightTextColor }}>{c.date ? c.date : ''}</div>
                </div>
              ))}
            </div>
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
              <img src="/icons/tech.svg" alt="Technical Summary" style={{ width: 20, height: 20 }} />
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
            <div style={{ 
              fontSize: '10px',
              color: mediumTextColor,
              lineHeight: '1.6',
              textAlign: 'justify',
              margin: '0'
            }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(skillsLinks.technicalSummary || '') }} />
          </div>
        )}

        {/* Certifications (replaces References) */}
        {/* Removed duplicate Certifications block to avoid showing the section twice. The two-column grid version above is kept. */}

        {/* Verification / Declaration */}
        {(personal.verificationEnabled || personal.verificationText) && (
          <div className="resume-section" style={{ marginTop: '20px', paddingTop: '10px', borderTop: `1px solid ${dividerColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>✔️</span>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: mainHeaderColor, margin: 0 }}>
                Verification
              </h2>
            </div>
            <p style={{ fontSize: '10px', color: mediumTextColor, lineHeight: '1.6', margin: 0 }}>
              {personal.verificationText || 'I hereby declare that the information provided above is true to the best of my knowledge.'}
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: darkTextColor }}>{personal.firstName} {personal.lastName}</div>
              <div style={{ fontSize: '11px', color: lightTextColor }}>{personal.verificationDate ? personal.verificationDate : new Date().toLocaleDateString()}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Template3Display;