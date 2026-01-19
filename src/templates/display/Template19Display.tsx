import React from 'react';
import DOMPurify from 'dompurify';
import type { ResumeData } from '@/types/resume';

interface Template19DisplayProps { data: ResumeData }

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

const Template19Display: React.FC<Template19DisplayProps> = ({ data }) => {
  const { personal, experience, education, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';
  const contactLine = [personal.email, personal.mobileNumber, (skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) || ''].filter(Boolean).join(' | ');

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Georgia, serif', background: '#fff', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ background: '#f3f4f6', padding: '18px 24px', marginBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontFamily: 'Georgia, serif', letterSpacing: 1 }}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</h1>
            {role && <div style={{ marginTop: 4, color: '#6b7280', fontSize: 12, fontWeight: 700 }}>{role}</div>}
          </div>

          <div style={{ textAlign: 'right', color: '#374151', fontSize: 12 }}>
            {personal.email && <div><a href={`mailto:${personal.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{personal.email}</a></div>}
            {personal.mobileNumber && <div style={{ marginTop: 6 }}>{personal.mobileNumber}</div>}
            {personal.address && <div style={{ marginTop: 6 }}>{String(personal.address).split(',')[0]}</div>}
            {personal.dateOfBirth && <div style={{ marginTop: 6 }}>{personal.dateOfBirth}</div>}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 12 }}>
        <section style={{ textAlign: 'center', marginTop: 0 }}>
          <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700, marginBottom: 6 }}>SUMMARY</div>
          <div style={{ height: 1, background: '#ddd', width: '100%' }} />
          <div style={{ marginTop: 12, color: '#444', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>{personal.aboutCareerObjective && <div>{DOMPurify.sanitize(personal.aboutCareerObjective).replace(/<[^>]+>/g, '')}</div>}</div>
        </section>

        <div style={{ display: 'flex', marginTop: 18, gap: 24 }}>
          {/* Left sidebar (fixed width) */}
          <aside style={{ width: 260, paddingRight: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Skills</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '80%' }} />
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              {(skillsLinks.skills || []).filter((s:any)=>s.enabled && s.skillName).map((s:any,i:number)=>(<li key={i} style={{ marginBottom: 6 }}>{s.skillName}</li>))}
            </ul>

            <div style={{ marginTop: 18 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Education</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '80%' }} />
              <div style={{ marginTop: 8 }}>
                {education.higherEducationEnabled && education.higherEducation.slice().map((edu:any,i:number)=>(
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700 }}>{edu.universityBoard || edu.instituteName}</div>
                    <div style={{ color: '#151616', marginTop: 4 }}>{edu.degree}{edu.fieldOfStudy ? ` (${edu.fieldOfStudy})` : ''}</div>
                    {(edu.resultFormat && edu.result) && <div style={{ color: '#151616', marginTop: 4 }}>{edu.resultFormat}: {edu.result}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Language</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '60%' }} />
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                {(((personal as any).languagesKnown || (personal as any).languages || [])).map((l:string, i:number)=>(<li key={i} style={{ marginBottom: 6 }}>{l}</li>))}
              </ul>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Achievements</div>
              <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '80%' }} />
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                {(certifications || []).filter((c:any)=>c.enabled && c.certificateTitle).map((c:any,i:number)=>(<li key={i} style={{ marginBottom: 6 }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</li>))}
              </ul>
            </div>

          </aside>

          {/* Right main content */}
          <div style={{ flex: 1 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#111827', fontWeight: 700 }}>Professional Experience</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 6, width: '100%' }} />

            <div style={{ marginTop: 8 }}>
              {experience.workExperiences.filter((w:any)=>w.enabled).map((w:any,i:number)=> (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800 }}>{w.jobTitle}</div>
                    <div style={{ color: '#6b7280', fontWeight: 800 }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</div>
                  </div>
                  <div style={{ color: '#444', marginTop: 6 }}>{w.companyName}{w.location ? ` — ${w.location}` : ''}</div>
                  {w.description && (
                    <div style={{ marginTop: 6, paddingLeft: 12 }}>
                      {htmlToLines(w.description).map((ln, idx) => <div key={idx} style={{ marginTop: 6 }}>• {ln}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Template19Display;
