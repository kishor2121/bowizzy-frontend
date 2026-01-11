import React from 'react';
import DOMPurify from 'dompurify';
import type { ResumeData } from '@/types/resume';

interface Template12DisplayProps {
  data: ResumeData;
}

const Template12Display: React.FC<Template12DisplayProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;

  const formatMonthYear = (s?: string) => {
    if (!s) return '';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    try {
      const str = String(s).trim();
      const ymdMatch = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
      if (ymdMatch) {
        const year = ymdMatch[1];
        const mm = parseInt(ymdMatch[2], 10);
        if (!isNaN(mm) && mm >= 1 && mm <= 12) return `${months[mm - 1]} ${year}`;
        return `${year}`;
      }
      const mYMatch = str.match(/^(\d{2})\/(\d{4})$/);
      if (mYMatch) {
        const mm = parseInt(mYMatch[1], 10);
        const year = mYMatch[2];
        if (!isNaN(mm) && mm >= 1 && mm <= 12) return `${months[mm - 1]} ${year}`;
        return `${year}`;
      }
    } catch (e) {}
    return String(s);
  };

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
    } catch (e) {
      return [String(s)];
    }
  };

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Times New Roman, serif', background: '#fff' }}>
      <div style={{ padding: '20px 36px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontFamily: 'Georgia, serif' }}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</h1>
          {personal.aboutCareerObjective && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#333' }}>{DOMPurify.sanitize(personal.aboutCareerObjective)}</div>
          )}
          <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>{[personal.email, personal.mobileNumber, personal.address].filter(Boolean).join(' | ')}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '18px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', padding: '0 8px' }}>
          <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>Work Experience</div>
          <div>
            {experience.workExperiences.filter(e => e.enabled).map((w, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700 }}>{w.jobTitle} — <span style={{ fontWeight: 700 }}>{w.companyName}</span></div>
                  <div style={{ color: '#6b7280', fontSize: 11 }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</div>
                </div>
                {w.description && (
                  <div style={{ marginTop: 6, color: '#444' }}>
                    {htmlToLines(w.description).map((ln, idx) => <div key={idx}>• {ln}</div>)}
                  </div>
                )}
              </div>
            ))}
            {/* divider after work experience */}
            <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
          </div>

          <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>Education</div>
          <div>
            {education.higherEducationEnabled && education.higherEducation.map((edu, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700 }}>{edu.instituteName}</div>
                <div style={{ color: '#6b7280', fontSize: 11 }}>{edu.degree} — {edu.currentlyPursuing ? 'Present' : edu.endYear}</div>
                {edu.resultFormat && edu.result && (
                  <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{edu.resultFormat}: {edu.result}</div>
                )}
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0', gridColumn: '1 / -1' }} />

          <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>Skills</div>
          <div>
            <div>{skillsLinks.skills.filter(s => s.enabled && s.skillName).map(s => s.skillName).join(', ')}</div>
          </div>

          <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, color: '#111827', fontWeight: 700 }}>Certifications</div>
          <div>
            <div>{certifications.filter(c => c.enabled && c.certificateTitle).map(c => c.certificateTitle).join(', ')}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Template12Display;