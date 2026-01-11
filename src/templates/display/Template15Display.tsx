import React from 'react';
import DOMPurify from 'dompurify';

import type { ResumeData } from '@/types/resume';

interface Template15DisplayProps { data: ResumeData }

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

const Template15Display: React.FC<Template15DisplayProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';

  const contactParts = [personal.email, personal.mobileNumber, personal.address && String(personal.address).split(',')[0]].filter(Boolean);
  const linkedin = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.linkedinProfile) || (personal as any).linkedinProfile;
  const github = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.githubProfile) || (personal as any).githubProfile;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Times New Roman, serif', background: '#fff' }}>
      <div style={{ padding: '28px 36px 8px 36px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, color: '#0b60d6', fontFamily: 'Georgia, serif', fontWeight: 800 }}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</h1>
        {role && <div style={{ fontSize: 12, color: '#08306b', marginTop: 6, fontWeight: 600 }}>{role}</div>}
        <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>{contactParts.join(' | ')}{(linkedin || github) && ' | '}{linkedin && <a href={(skillsLinks as any).links?.linkedinProfile || (personal as any).linkedinProfile} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', textDecoration: 'none' }}>LinkedIn</a>}{linkedin && github && ' | '}{github && <a href={(skillsLinks as any).links?.githubProfile || (personal as any).githubProfile} target="_blank" rel="noreferrer" style={{ color: '#111', textDecoration: 'none' }}>GitHub</a>}</div>
        <div style={{ height: 1, background: '#ddd', marginTop: 12, width: '100%' }} />
      </div>

      <div style={{ padding: '0 36px 36px 36px' }}>
        <section style={{ display: 'block' }}>

          <div style={{ marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#0b60d6', fontWeight: 700 }}>OBJECTIVE</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 4, width: '100%' }} />
          </div>

          <div style={{ marginTop: 6 }}>
            {personal.aboutCareerObjective && (<div style={{ color: '#444', lineHeight: 1.4 }}>{DOMPurify.sanitize(personal.aboutCareerObjective).replace(/<[^>]+>/g, '')}</div>)}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#0b60d6', fontWeight: 700 }}>Education</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 4, width: '100%' }} />
          </div>

          <div style={{ marginTop: 8 }}>
            {education.higherEducationEnabled && education.higherEducation.slice().sort((a: any,b: any) => 0).map((edu, i) => (
              <div key={`he-${i}`} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700 }}>{edu.instituteName}</div>
                  <div style={{ color: '#6b7280' }}>{formatMonthYear(edu.startYear)} — {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</div>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{edu.degree}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#0b60d6', fontWeight: 700 }}>Skills</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 4, width: '100%' }} />
          </div>
          <div style={{ marginTop: 6 }}>
            {(() => {
              const skills = skillsLinks.skills.filter((s: any) => s.enabled && s.skillName).map((s: any) => s.skillName);
              const categories: Record<string, string[]> = {
                'Programming Languages': [],
                'Web Development': [],
                'Databases': [],
                'Tools': [],
                'Others': [],
              };
              const langRegex = /(python|java|c\+\+|c#|javascript|typescript|ruby|go|php)/i;
              const webRegex = /(html|css|javascript|react|angular|vue|next|node|express)/i;
              const dbRegex = /(mysql|mongodb|postgres|postgresql|redis|sql)/i;
              const toolsRegex = /(git|docker|jenkins|kubernetes|aws|gcp|azure|terraform|ci|cd)/i;

              skills.forEach(sk => {
                if (langRegex.test(sk)) categories['Programming Languages'].push(sk);
                else if (webRegex.test(sk)) categories['Web Development'].push(sk);
                else if (dbRegex.test(sk)) categories['Databases'].push(sk);
                else if (toolsRegex.test(sk)) categories['Tools'].push(sk);
                else categories['Others'].push(sk);
              });

              return Object.entries(categories).map(([cat, items]) => items.length ? (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#08306b' }}>{cat}</div>
                  <div style={{ marginTop: 4, color: '#444' }}>{items.join(', ')}</div>
                </div>
              ) : null);
            })()}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#0b60d6', fontWeight: 700 }}>Certifications</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 4, width: '100%' }} />
          </div>
          <div style={{ marginTop: 6 }}>{certifications.filter(c => c.enabled && c.certificateTitle).map((c,i) => <div key={i} style={{ marginBottom: 6, color: '#444' }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</div>)}</div>

          <div style={{ marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#0b60d6', fontWeight: 700 }}>Internships</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 4, width: '100%' }} />
          </div>

          <div style={{ marginTop: 8 }}>
            {experience.workExperiences.filter(e => e.enabled).map((w, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700 }}>{w.companyName}{w.location ? `, ${w.location}` : ''}</div>
                  <div style={{ color: '#6b7280' }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</div>
                </div>
                {w.description && (
                  <div style={{ marginTop: 4, color: '#444', paddingLeft: 10 }}>
                    {htmlToLines(w.description).map((ln, idx) => <div key={idx} style={{ marginTop: 4 }}>• {ln}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, color: '#0b60d6', fontWeight: 700 }}>ACADEMIC Projects</div>
            <div style={{ height: 1, background: '#ddd', marginTop: 4, width: '100%' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            {projects.filter((p: any) => p.enabled).map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700 }}>{p.projectTitle}</div>
                  <div style={{ color: '#6b7280' }}>{formatMonthYear(p.startDate)} — {p.currentlyWorking ? 'Present' : formatMonthYear(p.endDate)}</div>
                </div>
                {p.description && (
                  <div style={{ marginTop: 4, color: '#444', paddingLeft: 10 }}>
                    {htmlToLines(p.description).map((ln, idx) => <div key={idx} style={{ marginTop: 4 }}>• {ln}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>
      </div>
    </div>
  );
};

export default Template15Display;