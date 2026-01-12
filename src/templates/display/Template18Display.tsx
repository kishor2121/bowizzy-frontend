import React from 'react';
import DOMPurify from 'dompurify';
import type { ResumeData } from '@/types/resume';

interface Template18DisplayProps { data: ResumeData }

const htmlToLines = (s?: string) => {
  if (!s) return [] as string[];
  try {
    const text = String(s)
      .replace(/<br\s*\/?/gi, '\n')
      .replace(/<\/p>|<\/li>/gi, '\n')
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
    if (ymd) return `${months[parseInt(ymd[2],10)-1]} ${ymd[1]}`;
    const mY = str.match(/^(\d{2})\/(\d{4})$/);
    if (mY) return `${months[parseInt(mY[1],10)-1]} ${mY[2]}`;
  } catch (e) {}
  return String(s);
};

const formatMonthYearParts = (s?: string) => {
  if (!s) return { month: '', year: '' };
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  try {
    const str = String(s).trim();
    const ymd = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (ymd) return { month: months[parseInt(ymd[2],10)-1], year: ymd[1] };
    const mY = str.match(/^(\d{2})\/(\d{4})$/);
    if (mY) return { month: months[parseInt(mY[1],10)-1], year: mY[2] };
  } catch (e) {}
  // Fallback: attempt to split last number group as year
  const yearMatch = String(s).match(/(\d{4})/);
  if (yearMatch) {
    return { month: String(s).replace(yearMatch[1], '').trim(), year: yearMatch[1] };
  }
  return { month: String(s), year: '' };
};

const Template18Display: React.FC<Template18DisplayProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';

  const contactLine = [personal.email, personal.mobileNumber, (skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) || ''].filter(Boolean).join(' | ');

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Times New Roman, serif', background: '#fff', padding: 24, boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 1, color: '#000' }}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</h1>
        {role && <div style={{ marginTop: 6, color: '#6b7280', fontSize: 12, fontWeight: 700 }}>{role}</div>}
        {contactLine && <div style={{ marginTop: 10, color: '#374151', fontSize: 12 }}>{contactLine}</div>}
      </header>

      <main>
        <section style={{ marginTop: 8 }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Professional Summary</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
          </div>
          <div style={{ marginTop: 8, color: '#444' }}>{personal.aboutCareerObjective && <div>{DOMPurify.sanitize(personal.aboutCareerObjective).replace(/<[^>]+>/g, '')}</div>}</div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Work Experience</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            {experience.workExperiences.filter((w:any) => w.enabled).map((w:any,i:number) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800 }}>{w.jobTitle}</div>
                  <div style={{ color: '#6b7280', fontFamily: "'Times New Roman', Times, serif", display: 'flex' }}>
                    {/* Start date */}
                    {(() => {
                      const s = formatMonthYearParts(w.startDate);
                      return (<div style={{ whiteSpace: 'nowrap' }}>{s.month}{s.month ? ' ' : ''}<span style={{ fontWeight: 800 }}>{s.year}</span></div>);
                    })()}
                    <div style={{ margin: '0 6px', fontWeight: 800 }}>—</div>
                    {/* End date or Present */}
                    {w.currentlyWorking ? (<div style={{ fontWeight: 800 }}>Present</div>) : (() => {
                      const e = formatMonthYearParts(w.endDate);
                      return (<div style={{ whiteSpace: 'nowrap' }}>{e.month}{e.month ? ' ' : ''}<span style={{ fontWeight: 800 }}>{e.year}</span></div>);
                    })()}
                  </div>
                </div>
                <div style={{ color: '#444', marginTop: 6 }}>{w.companyName}{w.location ? ` — ${w.location}` : ''}</div>
                {w.description && <div style={{ marginTop: 6, paddingLeft: 10 }}>{htmlToLines(w.description).map((ln, idx) => <div key={idx} style={{ marginTop: 6 }}>• {ln}</div>)}</div>}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Education</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            {education.higherEducationEnabled && education.higherEducation.slice().map((edu:any,i:number)=>(
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700 }}>{edu.instituteName}</div>
                  <div style={{ color: '#6b7280', marginTop: 4, fontWeight: 800, fontFamily: "'Times New Roman', Times, serif" }}>{edu.endYear ? `Graduated: ${String(edu.endYear).match(/(\d{4})/)?.[1]}` : ''}</div>
                </div>
                <div style={{ color: '#6b7280', marginTop: 4 }}>{edu.degree}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Skills</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <ul style={{ paddingLeft: 20, marginTop: 6, color: '#374151', listStyleType: 'disc', listStylePosition: 'outside' }}>
              {(skillsLinks.skills || []).filter((s:any)=>s.enabled && s.skillName).map((s:any,i:number)=>(<li key={i} style={{ marginBottom: 6, lineHeight: 1.4 }}>{s.skillName}</li>))}
            </ul>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Certifications</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <ul style={{ paddingLeft: 20, marginTop: 6, color: '#444', listStyleType: 'disc', listStylePosition: 'outside' }}>
              {(certifications || []).filter((c:any)=>c.enabled && c.certificateTitle).map((c:any,i:number)=>(<li key={i} style={{ marginBottom: 8, lineHeight: 1.4 }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</li>))}
            </ul>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Template18Display;
