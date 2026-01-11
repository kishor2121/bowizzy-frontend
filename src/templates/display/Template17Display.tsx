import React from 'react';
import DOMPurify from 'dompurify';
import type { ResumeData } from '@/types/resume';

interface Template17DisplayProps { data: ResumeData }

const htmlToLines = (s?: string) => {
  if (!s) return [] as string[];
  try {
    const text = String(s)
      .replace(/<br\s*\/?>/gi, '\n')
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

const Template17Display: React.FC<Template17DisplayProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Times New Roman, serif', background: '#fff' }}>
      <div style={{ display: 'flex' }}>
        {/* Left sidebar */}
        <aside style={{ width: 220, background: '#f3f4f6', padding: 24, boxSizing: 'border-box' }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</h2>
          {role && <div style={{ color: '#6b7280', marginTop: 6 }}>{role}</div>}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#374151' }}>DETAILS</div>
            <div style={{ height: 1, background: '#e5e7eb', marginTop: 6, marginBottom: 8 }} />
            <div style={{ color: '#374151', fontSize: 13 }}>
              {personal.email && <div style={{ marginTop: 8 }}>{personal.email}</div>}
              {personal.mobileNumber && <div style={{ marginTop: 8 }}>{personal.mobileNumber}</div>}
              {personal.address && <div style={{ marginTop: 8 }}>{String(personal.address).split(',')[0]}</div>}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#374151' }}>SKILLS</div>
            <div style={{ height: 1, background: '#e5e7eb', marginTop: 6, marginBottom: 8 }} />
            <ul style={{ paddingLeft: 16, color: '#374151' }}>
              {(skillsLinks.skills || []).filter(s => s.enabled && s.skillName).slice(0,6).map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s.skillName}</li>)}
            </ul>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#374151' }}>LANGUAGES</div>
            <div style={{ height: 1, background: '#e5e7eb', marginTop: 6, marginBottom: 8 }} />
            <ul style={{ paddingLeft: 16, color: '#374151' }}>
              {(((personal as any).languagesKnown || (personal as any).languages || [])).map((l: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>{l}</li>)}
            </ul>
          </div>

        </aside>

        {/* Right content */}
        <main style={{ flex: 1, padding: '24px 36px', boxSizing: 'border-box' }}>
          <section>
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Summary</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
            </div>
            <div style={{ marginTop: 8, color: '#444' }}>{personal.aboutCareerObjective && <div>{DOMPurify.sanitize(personal.aboutCareerObjective).replace(/<[^>]+>/g, '')}</div>}</div>

            <div style={{ marginTop: 18 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Experience</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
            </div>
            <div style={{ marginTop: 8 }}>
              {experience.workExperiences.filter((w:any) => w.enabled).map((w:any,i:number) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700 }}>{w.jobTitle}</div>
                    <div style={{ color: '#6b7280' }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</div>
                  </div>
                  <div style={{ color: '#444', marginTop: 6 }}>{w.companyName}{w.location ? ` — ${w.location}` : ''}</div>
                  {w.description && <div style={{ marginTop: 6, paddingLeft: 10 }}>{htmlToLines(w.description).map((ln, idx) => <div key={idx} style={{ marginTop: 6 }}>• {ln}</div>)}</div>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Education</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
            </div>
            <div style={{ marginTop: 8 }}>
              {education.higherEducationEnabled && education.higherEducation.slice().map((edu:any,i:number) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700 }}>{edu.instituteName}</div>
                    <div style={{ color: '#6b7280' }}>{(edu.endYear ? String(edu.endYear).match(/(\d{4})/)?.[1] : '')}</div>
                  </div>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>{edu.degree}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Achievements</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />
            </div>
            <div style={{ marginTop: 8, color: '#444' }}>{(certifications || []).filter((c:any)=>c.enabled && c.certificateTitle).map((c:any,i:number)=>(<div key={i} style={{ marginBottom: 8 }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</div>))}</div>

          </section>
        </main>
      </div>
    </div>
  );
};

export default Template17Display;
