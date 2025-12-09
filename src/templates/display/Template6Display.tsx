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

  const SectionTitle: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <div style={{ background: '#e6e6e6', borderRadius: 20, padding: '6px 12px', display: 'inline-block', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{children}</div>
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
            <div style={{ textAlign: 'right', minWidth: 180 }}>
              {personal.email && <div style={{ fontSize: 12 }}>{personal.email}</div>}
              {personal.mobileNumber && <div style={{ fontSize: 12 }}>{personal.mobileNumber}</div>}
              {personal.address && <div style={{ fontSize: 12 }}>{personal.address.split(',')[0]}</div>}
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

        {/* Technical skills / Key skills - multi column like the image */}
        {skillsLinks.skills.length > 0 && (
          <section style={{ marginBottom: 14 }}>
            <SectionTitle>Technical Skills</SectionTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                <div key={i} style={{ flex: '1 1 30%', minWidth: 120, fontSize: 12 }}>{s.skillName}</div>
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
            </div>
          </section>
        )}

        {/* Additional information */}
        <section>
          <SectionTitle>Additional Information</SectionTitle>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            {personal.languages && <div style={{ marginBottom: 6 }}><strong>Languages:</strong> {personal.languages}</div>}
            {certifications.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <strong>Certifications:</strong>
                <div style={{ marginTop: 6 }}>
                  {certifications.filter(c => c.enabled).map((c, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>{c.certificateTitle} {((c as any).startDate || (c as any).endDate) ? `• ${(c as any).startDate || ''} ${(c as any).endDate || ''}` : ''}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Template6Display;
