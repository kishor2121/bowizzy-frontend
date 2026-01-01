import React from 'react';
import type { ResumeData } from '@/types/resume';

interface Template5DisplayProps {
  data: ResumeData;
}

const Template5Display: React.FC<Template5DisplayProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  const htmlToText = (s?: string) => {
    if (!s) return '';
    try {
      return String(s)
        .replace(/<br\s*\/?>>/gi, '\n')
        .replace(/<br\s*\/?/gi, '\n')
        .replace(/<\\/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
    } catch (e) {
      return s || '';
    }
  };

  const sanitizeLine = (line: string) => {
    // Remove leading '>' quote markers (often created by pasted blockquotes) from each line
    try {
      return String(line).replace(/^\s*>+\s*/, '');
    } catch (e) {
      return line;
    }
  };

  return (
    <div style={{ maxWidth: '210mm', margin: '0 auto', background: '#fff', fontFamily: 'Times New Roman, serif' }}>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <header style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#6b2720', fontFamily: 'Times New Roman, serif' }}>{personal.firstName} {personal.lastName}</div>
          <div style={{ fontSize: 16, fontStyle: 'italic', color: '#6b2720', marginTop: 6 }}>{experience.jobRole}</div>

          <div style={{ marginTop: 12, border: '1px solid #ddd6cf', padding: '8px 10px', display: 'flex', gap: 18, alignItems: 'center', maxWidth: 760 }}>
            {personal.email && <div style={{ fontSize: 13 }}>{personal.email}</div>}
            {personal.mobileNumber && <div style={{ fontSize: 13 }}>{personal.mobileNumber}</div>}
            {personal.address && <div style={{ fontSize: 13 }}>{personal.address.split(',')[0]}</div>}
          </div>
        </header>

        {/* Summary */}
        {personal.aboutCareerObjective && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b2720', letterSpacing: 3, textTransform: 'uppercase' }}>Summary</h2>
            <p style={{ fontSize: 12, color: '#333', lineHeight: 1.6, marginTop: 8 }}>{htmlToText(personal.aboutCareerObjective)}</p>
          </section>
        )}

        {/* Experience */}
        {experience.workExperiences.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b2720', letterSpacing: 3, textTransform: 'uppercase' }}>Experience</h2>
            {experience.workExperiences.filter(w => w.enabled).map((w, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{w.jobTitle}</div>
                    <div style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>{w.companyName}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#a84f3b', textAlign: 'right' }}>{w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</div>
                </div>
                {w.description && (
                  <ul style={{ marginTop: 8, paddingLeft: 18, color: '#444' }}>
                    {htmlToText(w.description).split(/\n|\r\n/).map((line, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b2720', letterSpacing: 3, textTransform: 'uppercase' }}>Projects</h2>
            {projects.filter(p => p.enabled && p.projectTitle).map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.projectTitle}</div>
                  <div style={{ fontSize: 11, color: '#a84f3b' }}>{p.startDate} - {p.currentlyWorking ? 'Present' : p.endDate}</div>
                </div>
                {p.description && (
                  // Render multiline descriptions as bullet list to match experience formatting
                  <ul style={{ marginTop: 8, paddingLeft: 18, color: '#444', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {htmlToText(p.description).split(/\n|\r\n/).filter(Boolean).map((line, idx) => (
                      <li key={idx} style={{ marginBottom: 6, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{sanitizeLine(line)}</li>
                    ))}
                  </ul>
                )}

                {p.rolesResponsibilities && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Roles & Responsibilities:</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18, color: '#444', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {htmlToText(p.rolesResponsibilities).split(/\n|\r\n/).filter(Boolean).map((line, idx) => (
                        <li key={idx} style={{ marginBottom: 6, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{sanitizeLine(line)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education and Skills (two column-like layout) */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            {education.higherEducationEnabled && education.higherEducation.length > 0 && (
              <section style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b2720', letterSpacing: 3, textTransform: 'uppercase' }}>Education</h2>
                {education.higherEducation.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{edu.instituteName}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>{edu.degree} • {edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</div>
                  </div>
                ))}
                {/* Pre University */}
                {education.preUniversityEnabled && education.preUniversity.instituteName && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{education.preUniversity.instituteName}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>Pre University - {education.preUniversity.boardType} • {education.preUniversity.yearOfPassing}</div>
                  </div>
                )}

                {/* SSLC */}
                {education.sslcEnabled && education.sslc.instituteName && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{education.sslc.instituteName}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>SSLC - {education.sslc.boardType} • {education.sslc.yearOfPassing}</div>
                  </div>
                )}
              </section>
            )}

            {skillsLinks.skills.length > 0 && (
              <section style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b2720', letterSpacing: 3, textTransform: 'uppercase' }}>Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '6px 8px', borderRadius: 4, border: '1px solid #e6e1d8' }}>{s.skillName}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications moved here so they appear right after Education */}
            {certifications.length > 0 && (
              <section style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b2720', letterSpacing: 3, textTransform: 'uppercase' }}>Certifications</h2>
                {certifications.filter(c => c.enabled).map((c, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    {c.certificateTitle && <div style={{ fontSize: 11, fontWeight: 700 }}>{c.certificateTitle}</div>}
                    {(c as any).startDate && <div style={{ fontSize: 10, color: '#a84f3b' }}>{(c as any).startDate} - {(c as any).endDate}</div>}
                    {c.description && <div style={{ fontSize: 11 }}>{htmlToText(c.description)}</div>}
                  </div>
                ))}
              </section>
            )}
          </div>

          <div style={{ flex: '0 0 220px', minWidth: 180 }}>
            {/* Right column reserved for small extras (kept empty or used later) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5Display;
