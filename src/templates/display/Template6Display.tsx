import React from 'react';
import type { ResumeData } from '@/types/resume';

interface Template6DisplayProps {
  data: ResumeData;
}

const Template6Display: React.FC<Template6DisplayProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  const htmlToText = (s?: string) => {
    if (!s) return '';
    try {
      return String(s)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();
    } catch (e) {
      return s || '';
    }
  };

  const sanitizeLine = (line: string) => {
    try {
      return String(line).replace(/^\s*>+\s*/, '');
    } catch (e) {
      return line;
    }
  };

  const SectionTitle: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <div style={{ background: '#e6e6e6', padding: '8px 14px', marginBottom: 10, borderRadius: 4, display: 'block', width: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#222' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '210mm', margin: '0 auto', background: '#fff', fontFamily: "Arial, Helvetica, sans-serif", color: '#222' }}>
      <div style={{ padding: 28 }}>
        <header style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>{personal.firstName} {personal.lastName}</div>
              {experience.jobRole && <div style={{ fontSize: 14, fontStyle: 'italic', marginTop: 6 }}>{experience.jobRole}</div>}
            </div>
            <div style={{ fontSize: 11, color: '#555', textAlign: 'right', minWidth: 180 }}>
              {personal.email && <div>{personal.email}</div>}
              {personal.mobileNumber && <div>{personal.mobileNumber}</div>}
              {personal.address && <div>{personal.address}</div>}
            </div>
          </div>
        </header>

        {/* Summary */}
        {personal.aboutCareerObjective && (
          <section style={{ marginBottom: 14 }}>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>{htmlToText(personal.aboutCareerObjective)}</p>
          </section>
        )}

        {/* Technical skills / Key skills - 3 column layout like the image */}
        {skillsLinks.skills.length > 0 && (
          <section style={{ marginBottom: 14 }}>
            <SectionTitle>Technical Skills</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 20px', marginTop: 8 }}>
              {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                <div key={i} style={{ fontSize: 12 }}>{s.skillName}</div>
              ))}
            </div>
          </section>
        )}

        {/* Professional experience */}
        {experience.workExperiences.length > 0 && (
          <section style={{ marginBottom: 14 }}>
            <SectionTitle>Professional Experience</SectionTitle>
            <div style={{ marginTop: 8 }}>
              {experience.workExperiences.filter(w => w.enabled).map((w, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{w.jobTitle}</div>
                      <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>{w.companyName}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>{w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</div>
                  </div>
                  {w.description && (
                    <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                      {htmlToText(w.description).split(/\n|\r\n/).map((line, idy) => (
                        <li key={idy} style={{ marginBottom: 6, fontSize: 12 }}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (render after Professional Experience) */}
        {projects && projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
          <section style={{ marginBottom: 14 }}>
            <SectionTitle>Projects</SectionTitle>
            <div style={{ marginTop: 8 }}>
              {projects.filter(p => p.enabled && p.projectTitle).map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.projectTitle}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{p.startDate} - {p.currentlyWorking ? 'Present' : p.endDate}</div>
                  </div>
                  {p.description && (
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {htmlToText(p.description).split(/\n|\r\n/).filter(Boolean).map((line, idx) => (
                        <li key={idx} style={{ marginBottom: 6, fontSize: 12 }}>{sanitizeLine ? sanitizeLine(line) : line}</li>
                      ))}
                    </ul>
                  )}

                  {p.rolesResponsibilities && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>Roles & Responsibilities:</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {htmlToText(p.rolesResponsibilities).split(/\n|\r\n/).filter(Boolean).map((line, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>{sanitizeLine ? sanitizeLine(line) : line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.higherEducationEnabled && education.higherEducation.length > 0 && (
          <section style={{ marginBottom: 14 }}>
            <SectionTitle>Education</SectionTitle>
            <div style={{ marginTop: 8 }}>
              {education.higherEducation.map((edu, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{edu.instituteName}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{edu.degree} • {edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</div>
                </div>
              ))}
              {/* Pre University */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{education.preUniversity.instituteName}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>Pre University - {education.preUniversity.boardType} • {education.preUniversity.yearOfPassing}</div>
                </div>
              )}

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{education.sslc.instituteName}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>SSLC - {education.sslc.boardType} • {education.sslc.yearOfPassing}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Additional information */}
        <section>
          <SectionTitle>Additional Information</SectionTitle>
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6 }}>
            {personal.languagesKnown && personal.languagesKnown.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <strong>Languages:</strong> {personal.languagesKnown.join(', ')}
              </div>
            )}
            {certifications.length > 0 && certifications.some(c => c.enabled) && (
              <div style={{ marginBottom: 8 }}>
                <strong>Certifications:</strong> {certifications.filter(c => c.enabled && c.certificateTitle).map(c => c.certificateTitle).join(', ')}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Template6Display;
