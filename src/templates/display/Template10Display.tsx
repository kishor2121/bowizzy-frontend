import React from 'react';
import type { ResumeData } from '@/types/resume';

interface Template10DisplayProps {
  data: ResumeData;
}

const Template10Display: React.FC<Template10DisplayProps> = ({ data }) => {
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

  const sanitizeLine = (line?: string) => {
    if (!line) return '';
    try {
      return String(line).replace(/^\s*>+\s*/, '');
    } catch (e) {
      return line || '';
    }
  };

  return (
    <div className="w-[210mm] bg-white" style={{ minHeight: '297mm', fontFamily: 'Georgia, serif', color: '#222' }}>
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left Sidebar - Photo + Contact */}
        <aside style={{ width: '35%', boxSizing: 'border-box', padding: '36px 20px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {personal.profilePhotoUrl && (
              <img src={personal.profilePhotoUrl} alt="photo" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '9999px', border: '8px solid #ccc', marginBottom: 16 }} />
            )}
          </div>

          {/* Contact Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 10, color: '#fff', backgroundColor: '#444', textTransform: 'uppercase', fontWeight: 800, padding: '10px 14px', margin: '0 0 12px 0', borderRadius: 28, letterSpacing: 1.5, display: 'inline-block' }}>Contact Me</h3>
            <div style={{ fontSize: 9, lineHeight: 1.8, color: '#333', marginTop: 8 }}>
              {personal.mobileNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11 }}>📱</span>
                  <span>{personal.mobileNumber}</span>
                </div>
              )}
              {personal.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11 }}>📧</span>
                  <span>{personal.email}</span>
                </div>
              )}
              {/* {personal.websiteURL && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11 }}>🌐</span>
                  <span>{personal.websiteURL}</span>
                </div>
              )} */}
              {personal.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11 }}>📍</span>
                  <span>{personal.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education Section */}
          {education.higherEducationEnabled && education.higherEducation.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 9.5, color: '#fff', backgroundColor: '#444', textTransform: 'uppercase', fontWeight: 700, padding: '10px 14px', margin: '0 0 12px 0', borderRadius: 24, letterSpacing: 1.2, display: 'inline-block' }}>Education</h3>
              <div style={{ fontSize: 9, lineHeight: 1.7 }}>
                {education.higherEducation.map((edu, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#222', fontSize: 10 }}>{edu.degree}</div>
                    {edu.instituteName && <div style={{ color: '#666', fontSize: 8.5 }}>{edu.instituteName}</div>}
                    <div style={{ color: '#999', fontSize: 8 }}>{edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</div>
                  </div>
                ))}
                {/* Pre University */}
                {education.preUniversityEnabled && education.preUniversity.instituteName && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#222', fontSize: 10 }}>Pre University</div>
                    <div style={{ color: '#666', fontSize: 8.5 }}>{education.preUniversity.instituteName}</div>
                    <div style={{ color: '#999', fontSize: 8 }}>{education.preUniversity.yearOfPassing}</div>
                  </div>
                )}

                {/* SSLC */}
                {education.sslcEnabled && education.sslc.instituteName && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#222', fontSize: 10 }}>SSLC</div>
                    <div style={{ color: '#666', fontSize: 8.5 }}>{education.sslc.instituteName}</div>
                    <div style={{ color: '#999', fontSize: 8 }}>{education.sslc.yearOfPassing}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {skillsLinks.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: 9.5, color: '#fff', backgroundColor: '#444', textTransform: 'uppercase', fontWeight: 700, padding: '10px 14px', margin: '0 0 12px 0', borderRadius: 24, letterSpacing: 1.2, display: 'inline-block' }}>Skills</h3>
              <ul style={{ paddingLeft: 14, margin: 0, color: '#333', fontSize: 9, lineHeight: 1.8 }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>• {s.skillName}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Right Content - Name + Job + Work Experience + References */}
        <main style={{ width: '65%', boxSizing: 'border-box', padding: '36px 32px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 32, margin: '0', color: '#222', lineHeight: 1.1, fontWeight: 700 }}>{personal.firstName}</h1>
            <h1 style={{ fontSize: 32, margin: '2px 0 10px 0', color: '#222', lineHeight: 1.1, fontWeight: 700 }}>{personal.lastName}</h1>
            <div style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>{experience.jobRole || ''}</div>
          </div>
          {/* Work Experience */}
          {experience.workExperiences.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, color: '#222', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Work Experience</h2>
                <div style={{ flex: 1, height: 1, background: '#999' }} />
              </div>
              {experience.workExperiences.filter(w => w.enabled).map((w, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#222' }}>{w.jobTitle}</div>
                    <div style={{ fontSize: 10, color: '#999' }}>{w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#555', marginBottom: 8 }}>{w.companyName}</div>
                  {w.description && (
                    <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
                      {htmlToText(w.description).split('\n').map((line, idx) => (
                        line.trim() && <div key={idx} style={{ marginBottom: 6 }}>• {line.trim()}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, color: '#222', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Projects</h2>
                <div style={{ flex: 1, height: 1, background: '#999' }} />
              </div>
              {projects.filter(p => p.enabled && p.projectTitle).map((p, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#222' }}>{p.projectTitle}</div>
                    <div style={{ fontSize: 10, color: '#999' }}>{p.startDate} - {p.currentlyWorking ? 'Present' : p.endDate}</div>
                  </div>
                  {p.description && (
                    <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
                      {htmlToText(p.description).split(/\n|\r\n/).filter(Boolean).map((line, idx) => (
                        <div key={idx} style={{ marginBottom: 6 }}>• {sanitizeLine(line)}</div>
                      ))}
                    </div>
                  )}

                  {p.rolesResponsibilities && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Roles & Responsibilities</div>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {htmlToText(p.rolesResponsibilities).split(/\n|\r\n/).filter(Boolean).map((line, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>{sanitizeLine(line)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* References / Certifications */}
          {certifications.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, color: '#222', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>References</h2>
                <div style={{ flex: 1, height: 1, background: '#999' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                {certifications.filter(c => c.enabled && c.certificateTitle).map((c, i) => (
                  <div key={i}>
                    <div style={{ fontWeight: 700, color: '#222', fontSize: 10.5, marginBottom: 4 }}>{c.certificateTitle}</div>
                    {/* <div style={{ color: '#666', fontSize: 9, marginBottom: 6 }}>{c.certificateIssuingOrganization || 'Organization'}</div> */}
                    {/* {c.certificateIssuingOrganization && <div style={{ color: '#999', fontSize: 8.5 }}>Position / Role</div>} */}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template10Display;
