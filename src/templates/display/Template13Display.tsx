import React from 'react';
import DOMPurify from 'dompurify';

import type { ResumeData } from '@/types/resume';

interface Template13DisplayProps { data: ResumeData }

const htmlToLines = (s?: string) => {
  if (!s) return [] as string[];
  try {
    const text = String(s)
      .replace(/<\/p>|<\/li>/gi, '\n')
      .replace(/<br\s*\/?>(?:\s*)/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&');
    return text.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
  } catch (e) { return [String(s)]; }
};

const formatMonthYear = (s?: string) => {
  if (!s) return '';
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  try {
    const str = String(s).trim();
    const ymd = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (ymd) {
      const year = ymd[1];
      const mm = parseInt(ymd[2], 10);
      if (!isNaN(mm) && mm >= 1 && mm <= 12) return `${months[mm - 1]} ${year}`;
      return year;
    }
    const mY = str.match(/^(\d{2})\/(\d{4})$/);
    if (mY) {
      const mm = parseInt(mY[1], 10);
      const year = mY[2];
      if (!isNaN(mm) && mm >= 1 && mm <= 12) return `${months[mm - 1]} ${year}`;
      return year;
    }
  } catch (e) {}
  return String(s);
};

const formatYear = (s?: string) => {
  if (!s) return '';
  const str = String(s).trim();
  const y = str.match(/(\d{4})/);
  return y ? y[1] : str;
};

const educationPriority = (degree?: string) => {
  if (!degree) return 99;
  const d = degree.toLowerCase();
  if (/(bachelor|b\.?e|btech|b\.tech|be|bsc|ba)/.test(d)) return 1;
  if (/(puc|higher secondary|12th|intermediate)/.test(d)) return 2;
  if (/(ssc|sslc|10th|matric)/.test(d)) return 3;
  return 4;
};

const Template13Display: React.FC<Template13DisplayProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Times New Roman, serif', background: '#fff' }}>
      <div style={{ padding: '28px 36px 8px 36px', textAlign: 'center' }}>
<h1 style={{ margin: 0, marginBottom: 4, fontSize: 28, fontFamily: 'Georgia, serif', fontWeight: 700, lineHeight: 1 }}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</h1>
        <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280' }}>
          {(() => {
            const contactParts = [personal.address && String(personal.address).split(',')[0], personal.email, personal.mobileNumber].filter(Boolean);
            const linkedin = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.linkedinProfile) || (personal as any).linkedinProfile;
            const github = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.githubProfile) || (personal as any).githubProfile;
            return (
              <>
                <span>{contactParts.join(' | ')}</span>
                {(linkedin || github) && <span> | </span>}
                {linkedin && <a href={(skillsLinks as any).links?.linkedinProfile || (personal as any).linkedinProfile} target="_blank" rel="noreferrer" style={{ color: '#6b7280', textDecoration: 'none' }}>{(skillsLinks as any).links?.linkedinProfile || (personal as any).linkedinProfile}</a>}
                {linkedin && github && <span> | </span>}
                {github && <a href={(skillsLinks as any).links?.githubProfile || (personal as any).githubProfile} target="_blank" rel="noreferrer" style={{ color: '#6b7280', textDecoration: 'none' }}>{(skillsLinks as any).links?.githubProfile || (personal as any).githubProfile}</a>}
              </>
            );
          })()}
        </div>
        <div style={{ height: 1, background: '#cfcfcf', marginTop: 12, width: '100%' }} />
      </div>

      <div style={{ padding: '0 36px 36px 36px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 16px', alignItems: 'start' }}>
          <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>SUMMARY</div>
            <div style={{ height: 1, background: '#cfcfcf', marginTop: 0, marginBottom: 0, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 0 }}>
            {personal.aboutCareerObjective && (<div style={{ color: '#444', lineHeight: 1.4 }}>{htmlToLines(personal.aboutCareerObjective).join(' ')}</div>)}
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>EXPERIENCE</div>
            <div style={{ height: 1, background: '#cfcfcf', marginTop: 0, marginBottom: 0, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 0 }}>
            {experience.workExperiences.filter(e => e.enabled).map((w, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{w.jobTitle} — <span style={{ fontWeight: 700 }}>{w.companyName}</span></div>
                  <div style={{ fontSize: 11, color: '#111827', fontWeight: 700 }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</div>
                </div>
                {w.description && (
                  <div style={{ marginTop: 2, color: '#444' }}>
                    {htmlToLines(w.description).map((ln, idx) => <div key={idx} style={{ marginTop: 2 }}>• {ln}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>EDUCATION</div>
            <div style={{ height: 1, background: '#cfcfcf', marginTop: 0, marginBottom: 0, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 0 }}>
            {/* Higher Education (BE/Bachelor etc.) */}
            {education.higherEducationEnabled && education.higherEducation.slice().sort((a,b) => educationPriority(a.degree) - educationPriority(b.degree)).map((edu, i) => (
              <div key={`he-${i}`} style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{edu.instituteName}</div>
                <div style={{ fontSize: 11, color: '#111827', fontWeight: 700 }}>{edu.degree} — {edu.currentlyPursuing ? 'Present' : formatYear(edu.endYear)}</div>
                {edu.resultFormat && edu.result && (<div style={{ marginTop: 2, color: '#444' }}>{edu.resultFormat}: {edu.result}</div>)}
              </div>
            ))}

            {/* Pre University (12th) */}
            {education.preUniversityEnabled && education.preUniversity && (education.preUniversity.instituteName || education.preUniversity.yearOfPassing) && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{education.preUniversity.instituteName || 'Pre University'}</div>
                <div style={{ fontSize: 11, color: '#111827', fontWeight: 700 }}>Pre University (12th Standard) — {formatYear(education.preUniversity.yearOfPassing)}</div>
                {education.preUniversity.resultFormat && education.preUniversity.result && (<div style={{ marginTop: 2, color: '#444' }}>{education.preUniversity.resultFormat}: {education.preUniversity.result}</div>)}
              </div>
            )}

            {/* SSLC (10th) */}
            {education.sslcEnabled && education.sslc && (education.sslc.instituteName || education.sslc.yearOfPassing) && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{education.sslc.instituteName || 'SSLC'}</div>
                <div style={{ fontSize: 11, color: '#111827', fontWeight: 700 }}>SSLC (10th Standard) — {formatYear(education.sslc.yearOfPassing)}</div>
                {education.sslc.resultFormat && education.sslc.result && (<div style={{ marginTop: 2, color: '#444' }}>{education.sslc.resultFormat}: {education.sslc.result}</div>)}
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>SKILLS</div>
            <div style={{ height: 1, background: '#cfcfcf', marginTop: 0, marginBottom: 0, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 0 }}>
            <div>{skillsLinks.skills.filter(s => s.enabled && s.skillName).map(s => s.skillName).join(', ')}</div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>CERTIFICATIONS</div>
            <div style={{ height: 1, background: '#cfcfcf', marginTop: 0, marginBottom: 0, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 0 }}>
            <div>{certifications.filter(c => c.enabled && c.certificateTitle).map(c => c.certificateTitle).join(', ')}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Template13Display;