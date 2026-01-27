import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { FiPhone, FiMail, FiMapPin, FiLinkedin, FiGithub } from 'react-icons/fi';
import type { ResumeData } from '@/types/resume';

interface Template11DisplayProps {
  data: ResumeData;
  showPageBreaks?: boolean;
  supportsPhoto?: boolean;
  onPageCountChange?: (n: number) => void;
  onPageChange?: (i: number) => void;
  pageControllerRef?: React.RefObject<{ goTo: (i: number) => void; next: () => void; prev: () => void }>;
}

const Template11Display: React.FC<Template11DisplayProps> = ({
  data,
  showPageBreaks = false,
  supportsPhoto = true,
  onPageCountChange,
  onPageChange,
  pageControllerRef,
}) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;
  const sortedHigherEducation = React.useMemo(() => {
    const parseYearKey = (val: string) => {
      if (!val) return -Infinity;
      const parts = val.split('-');
      const y = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return y * 100 + m;
    };

    return [...(education.higherEducation || [])].sort((a, b) => {
      if (a.currentlyPursuing && !b.currentlyPursuing) return -1;
      if (!a.currentlyPursuing && b.currentlyPursuing) return 1;

      const aKey = parseYearKey(a.endYear || a.startYear || '');
      const bKey = parseYearKey(b.endYear || b.startYear || '');

      return bKey - aKey;
    });
  }, [education.higherEducation]);

  const getYear = (s?: string) => (s ? s.split('-')[0] : '');

  const degreeMap: Record<string, string> = {
    'B.E': 'Bachelor of Technology',
    'B.Tech': 'Bachelor of Technology',
    'B.S': 'Bachelor of Science',
    'BS': 'Bachelor of Science',
    'B.A': 'Bachelor of Arts',
    'BA': 'Bachelor of Arts',
    'M.Tech': 'Master of Technology',
    'M.S': 'Master of Science',
    'MS': 'Master of Science',
    'M.A': 'Master of Arts',
    'MA': 'Master of Arts',
    'MBA': 'Master of Business Administration',
    'M.B.A': 'Master of Business Administration',
    'Ph.D': 'Doctor of Philosophy',
    'PhD': 'Doctor of Philosophy',
  };

  const getFullDegreeName = (degree: string) => {
    return degreeMap[degree] || degree;
  };

  const formatMonthYear = (s?: string) => {
    if (!s) return '';
    // Accepts YYYY-MM, YYYY-MM-DD, MM/YYYY, MonthName YYYY, or plain YYYY
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    try {
      const str = String(s).trim();
      // YYYY-MM or YYYY-MM-DD
      const ymdMatch = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
      if (ymdMatch) {
        const year = ymdMatch[1];
        const mm = parseInt(ymdMatch[2], 10);
        const mon = months[mm - 1] || String(mm).padStart(2, '0');
        return `${year} ${mon}`;
      }
      // MM/YYYY
      const mYMatch = str.match(/^(\d{2})\/(\d{4})$/);
      if (mYMatch) {
        const mm = parseInt(mYMatch[1], 10);
        const year = mYMatch[2];
        const mon = months[mm - 1] || String(mm).padStart(2, '0');
        return `${mon} ${year}`;
      }
      // MonthName YYYY or plain YYYY
      const monthNameMatch = str.match(/^[A-Za-z]{3,}\s+\d{4}$/);
      if (monthNameMatch) return str;
      const yearOnly = str.match(/^(\d{4})$/);
      if (yearOnly) return yearOnly[1];
      return str;
    } catch (e) {
      return String(s);
    }
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

  // Build header contact items including optional links
  const headerContactItems = React.useMemo(() => {
    const items: string[] = [];
    if (personal.email) items.push(personal.email);
    if (personal.mobileNumber) items.push(personal.mobileNumber);
    if (personal.address) items.push(personal.address);

    // links live under skillsLinks.links
    const links = skillsLinks?.links || {} as any;
    if (links.linkedinProfile) items.push(links.linkedinProfile);
    if (links.githubProfile) items.push(links.githubProfile);
    if (links.portfolioUrl) items.push(links.portfolioUrl);

    return items;
  }, [personal, skillsLinks]);

  return (
    <div className="w-[210mm] bg-white" style={{ minHeight: '297mm', fontFamily: 'Times New Roman, serif' }}>
      {/* Header Section - Classic Serif look */}
      <div style={{ padding: '18px 36px 6px 36px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: '1', fontFamily: 'Georgia, serif', textAlign: 'left' }}>{personal.firstName}{personal.middleName ? ' ' + personal.middleName : ''}{personal.lastName ? ' ' + personal.lastName : ''}</h1>
        <div style={{ fontSize: '11px', color: '#111827', marginTop: 8, textAlign: 'left' }}>
          { headerContactItems.filter(Boolean).join(' | ') }
        </div>
      </div>



      {/* Content - Single column like image */}
      <div style={{ padding: '0 36px 36px 36px' }}>
        {/* About / Career Objective Section */}
        {personal.aboutCareerObjective && personal.aboutCareerObjective.trim() !== '' && (
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>CAREER OBJECTIVE</h2>
            <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />
            <div style={{ fontSize: 11, color: '#000000', fontWeight: 'normal', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(personal.aboutCareerObjective || '') }} />
          </section>
        )}

        {/* Experience Section */}
        {experience.workExperiences.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>EXPERIENCE</h2>
            <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />

            {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{exp.companyName}</div>
                  <div style={{ fontSize: 11, color: '#111827', fontWeight: 700 }}>{formatMonthYear(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatMonthYear(exp.endDate)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#000000' }}>{exp.jobTitle}</div>
                  {exp.location && <div style={{ fontSize: 11, fontWeight: 700, color: '#000000' }}>{exp.location}</div>}
                </div>
                {exp.description && (
                  <div style={{ fontSize: 11, color: '#000000', fontWeight: 'normal', lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }}
                  />
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {(education.higherEducationEnabled && education.higherEducation.length > 0) && (
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>EDUCATION</h2>
            <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />
            {sortedHigherEducation.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#000000', flex: 1, marginRight: 8 }}>{edu.instituteName}</div>
                  <div style={{ fontSize: 10, color: '#000000', fontWeight: 700 }}>{formatMonthYear(edu.startYear)} - {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</div>
                </div>
                <div style={{ fontSize: 11, color: '#000000', fontWeight: 'normal', marginTop: 4 }}>
                  {getFullDegreeName(edu.degree)}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>TECHNICAL CERTIFICATIONS</h2>
            <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />
            {certifications.filter(c => c.enabled).map((cert, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#000000', flex: 1, marginRight: 8 }}>{cert.certificateTitle}</div>
                  <div style={{ fontSize: 10, color: '#000000', fontWeight: 700 }}>{cert.date}</div>
                </div>
                {cert.description && (
                  <div style={{ fontSize: 11, color: '#000000', fontWeight: 'normal', marginTop: 4 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cert.description) }} />
                )}
              </div>
            ))}
          </section>
        )}

        {/* Other Section - Skills Only */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>OTHER</h2>
          <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />

          {/* Skills */}
          {skillsLinks.skills.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#000000', marginBottom: 4 }}>Technical Skills:</div>
              <div style={{ fontSize: 11, color: '#000000', fontWeight: 'normal' }}>{skillsLinks.skills.filter(s => s.enabled && s.skillName).map(s => s.skillName).join(', ')}</div>
            </div>
          )}

          {/* Languages */}
          {/* <div style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#000000', marginBottom: 4 }}>Languages:</div>
            <div style={{ fontSize: 11, color: '#000000', fontWeight: 'normal' }}>{personal.languagesKnown && personal.languagesKnown.length > 0 ? personal.languagesKnown.join(', ') : ''}</div>
          </div> */}
        </section>
      </div>
    </div>
  );
};

export default Template11Display;
