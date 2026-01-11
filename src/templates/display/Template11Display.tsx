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

  return (
    <div className="w-[210mm] bg-white" style={{ minHeight: '297mm', fontFamily: 'Times New Roman, serif' }}>
      {/* Header Section - Classic Serif look */}
      <div style={{ padding: '18px 36px 6px 36px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: '1', fontFamily: 'Georgia, serif' }}>{personal.firstName} {personal.middleName ? ' ' + personal.middleName : ''} {personal.lastName}</h1>
        {personal.aboutCareerObjective && (
          <div style={{ fontSize: 11, color: '#444', marginTop: 8, maxWidth: '70%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
            {DOMPurify.sanitize(personal.aboutCareerObjective)}
          </div>
        )}
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 8 }}>
          { [personal.email, personal.mobileNumber, personal.address].filter(Boolean).join(' | ') }
        </div>

        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 12, color: '#6b7280' }}>
          {((skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) || (personal as any).linkedinProfile) && (
            <a href={(skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) || (personal as any).linkedinProfile} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <FiLinkedin /> <span style={{ fontSize: 11 }}>LinkedIn</span>
            </a>
          )}
          {((skillsLinks && skillsLinks.links && skillsLinks.links.githubProfile) || (personal as any).githubProfile) && (
            <a href={(skillsLinks && skillsLinks.links && skillsLinks.links.githubProfile) || (personal as any).githubProfile} target="_blank" rel="noreferrer" style={{ color: '#111', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <FiGithub /> <span style={{ fontSize: 11 }}>GitHub</span>
            </a>
          )}
        </div>
      </div>



      {/* Content - Single column like image */}
      <div style={{ padding: '0 36px 36px 36px' }}>
        {/* Experience Section */}
        {experience.workExperiences.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>EXPERIENCE</h2>
            <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />

            {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.companyName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{formatMonthYear(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatMonthYear(exp.endDate)}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#222', marginBottom: 6 }}>{exp.jobTitle}</div>
                {exp.description && (
                  <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                    {htmlToLines(exp.description).map((ln, i) => (
                      <div key={i}>• {ln}</div>
                    ))}
                  </div>
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
                <div style={{ fontSize: 11, fontWeight: 700 }}>{edu.instituteName}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{edu.degree}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{formatMonthYear(edu.startYear)} - {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</div>
              </div>
            ))}
          </section>
        )}

        {/* Other Section - Skills, Certifications, Languages */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>OTHER</h2>
          <div style={{ height: 1, background: '#333', width: '100%', marginBottom: 12 }} />

          {/* Skills */}
          {skillsLinks.skills.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>Technical Skills:</div>
              <div style={{ fontSize: 11, color: '#444' }}>{skillsLinks.skills.filter(s => s.enabled && s.skillName).map(s => s.skillName).join(', ')}</div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>Certifications & Training:</div>
              <div style={{ fontSize: 11, color: '#444' }}>{certifications.filter(c => c.enabled && c.certificateTitle).map(c => c.certificateTitle).join(', ')}</div>
            </div>
          )}

          {/* Languages */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>Languages:</div>
            <div style={{ fontSize: 11, color: '#444' }}>{personal.languagesKnown && personal.languagesKnown.length > 0 ? personal.languagesKnown.join(', ') : ''}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Template11Display;
