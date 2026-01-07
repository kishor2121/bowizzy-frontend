import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import type { ResumeData } from '@/types/resume';

interface Template1DisplayProps {
  data: ResumeData;
  showPageBreaks?: boolean;
  supportsPhoto?: boolean;
  onPageCountChange?: (n: number) => void;
  onPageChange?: (i: number) => void;
  pageControllerRef?: React.RefObject<{ goTo: (i: number) => void; next: () => void; prev: () => void }>; 
}

export const Template1Display: React.FC<Template1DisplayProps> = ({
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

  // Pagination disabled: commenting out the paginated renderer to avoid
  // heavy synchronous measurement and potential browser crashes while
  // debugging. To re-enable pagination, restore the PaginatedResume return.
  // if (showPageBreaks) {
  //   return <PaginatedResume data={data} supportsPhoto={supportsPhoto} onPageChange={onPageChange} onPageCountChange={onPageCountChange} controllerRef={pageControllerRef} />;
  // }

  return (
    <div className="w-[210mm] bg-white" style={{ minHeight: '297mm', fontFamily: 'Times New Roman, serif' }}>
      {/* Header Section */}
      <div style={{ padding: '30px 40px 8px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'column', background: 'rgb(231, 235, 235)' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: '0 0 auto' }}>
            <div style={{ display: 'inline-block' }}>
              <h1 style={{ 
                fontSize: '40px', 
                fontWeight: 800, 
                color: 'rgb(26, 23, 23)',
                letterSpacing: '2px',
                marginBottom: '6px',
                lineHeight: '1',
                fontFamily: 'Georgia, serif',
                display: 'inline-block'
              }}>
                {personal.firstName.toUpperCase()} <span style={{ fontWeight: 900 }}>{personal.lastName.toUpperCase()}</span>
              </h1>
              {/* Decorative short underline matching name width (dark rgb) */}
              <div style={{ display: 'inline-block', width: '100%', height: '3px', maxWidth: '360px', background: 'rgb(26, 23, 23)', marginTop: '4px', marginBottom: '8px' }} />
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', letterSpacing: '0.5px', textTransform: 'capitalize' }}>
              {experience.jobRole}
            </p>
          </div>

          {/* Right - Contact Info (react-icons, right aligned) */}
          <div style={{ fontSize: '11px', color: 'rgb(26, 23, 23)', textAlign: 'right', minWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', fontWeight: 600 }}>
              <FiPhone style={{ color: 'rgb(26, 23, 23)', width: '18px', height: '18px' }} aria-hidden />
              <span style={{ fontSize: '12px' }}>{personal.mobileNumber}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMail style={{ color: 'rgb(26, 23, 23)', width: '16px', height: '16px' }} aria-hidden />
              <span style={{ fontSize: '12px' }}>{personal.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMapPin style={{ color: 'rgb(26, 23, 23)', width: '16px', height: '16px' }} aria-hidden />
              <span style={{ fontSize: '12px' }}>{personal.address}</span>
            </div>
          </div>
        </div>

        {/* Thick colored bar across the full width (dark rgb) */}
        <div style={{ width: '100%', marginTop: '14px' }}>
          <div style={{ height: '6px', background: 'rgb(26, 23, 23)', width: '100%' }} />
        </div>
      </div>

      {/* Summary Section */}
      {personal.aboutCareerObjective && (
        <div className="resume-section" style={{ padding: '20px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', letterSpacing: '3px', margin: '0', textAlign: 'center' }}>SUMMARY</h2>
            <div style={{ width: '260px', height: '2px', background: '#cbd5e0', marginTop: '10px' }} />
          </div>

          {/* Render as sanitized HTML so any editor-generated tags are interpreted correctly */}
          <div style={{ 
            fontSize: '10px', 
            color: '#4a5568', 
            textAlign: 'justify',
            lineHeight: '1.6',
            marginTop: '12px'
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(personal.aboutCareerObjective || '') }}
          />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex" style={{ padding: '0 40px 30px 40px', gap: '20px', alignItems: 'stretch' }}>
        {/* Left Column */}
        <div style={{ width: '48%', paddingRight: '24px' }}>
          {/* Education Section */}
          {(education.higherEducationEnabled && education.higherEducation.length > 0) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0'
              }}>
                EDUCATION
              </h2>
              {sortedHigherEducation.map((edu, idx) => (
                <div key={idx} className="education-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {edu.instituteName || 'Ginyard International Co. University'}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>
                    {edu.degree || 'Bachelor Degree in Business Administration'}
                  </p>
                  <p style={{ fontSize: '9px', color: '#718096' }}>
                    {edu.startYear} - {edu.currentlyPursuing ? 'Present' : (edu.endYear || '2020')}
                  </p>
                </div>
              ))}

              {/* SSLC */}
              {/* Pre-University */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <div className="education-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {education.preUniversity.instituteName}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>
                    Pre University  - {education.preUniversity.boardType}
                  </p>
                  <p style={{ fontSize: '9px', color: '#718096' }}>
                    {education.preUniversity.yearOfPassing}
                  </p>
                </div>
              )}

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <div className="education-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {education.sslc.instituteName}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', marginBottom: '2px' }}>
                    SSLC - {education.sslc.boardType}
                  </p>
                  <p style={{ fontSize: '9px', color: '#718096' }}>
                    {education.sslc.yearOfPassing}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Skills Section */}
          {skillsLinks.skills.length > 0 && skillsLinks.skills.some(s => s.enabled && s.skillName) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0'
              }}>
                SKILLS
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((skill, idx) => (
                  <li key={idx} style={{ 
                    fontSize: '10px', 
                    color: '#4a5568',
                    marginBottom: '6px',
                    paddingLeft: '12px',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: '0', top: '0' }}>•</span>
                    {skill.skillName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && certifications.some(c => c.enabled && c.certificateTitle) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0',
                textAlign: 'justify'
              }}>
                CERTIFICATIONS
              </h2>
              {certifications.filter(c => c.enabled && c.certificateTitle).map((cert, idx) => (
                <div key={idx} className="certification-item" style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '10px', color: '#2d3748', fontWeight: '600', marginBottom: '2px' }}>
                    • {cert.certificateTitle}
                  </p>
                  {cert.providedBy && (
                    <p style={{ fontSize: '9px', color: '#718096', paddingLeft: '12px' }}>
                      {cert.providedBy} {cert.date && `- ${cert.date}`}
                    </p>
                  )}
                  {cert.description && (
                    <div style={{ paddingLeft: '12px' }}>
                      <div
                        style={{ fontSize: '9px', color: '#718096' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cert.description || '') }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ width: '48%', borderLeft: '1px solid #e5e7eb', paddingLeft: '24px' }}>
          {/* Professional Experience Section */}
          {experience.workExperiences.length > 0 && experience.workExperiences.some(exp => exp.enabled) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0',
                textAlign: 'justify'
                
              }}>
                PROFESSIONAL EXPERIENCE
              </h2>
              {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
                <div key={idx} className="work-item" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {exp.jobTitle}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#4a5568', fontStyle: 'italic', marginBottom: '4px' }}>
                    {exp.companyName} | {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <div style={{ margin: '6px 0 0 0', paddingLeft: '12px', lineHeight: '1.4' }}>
                      {/* Render HTML (sanitized) so editor-generated tags like <div>, <ul>, etc. are interpreted correctly */}
                      <div
                        style={{ fontSize: '9px', color: '#4a5568', textAlign: 'justify' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0'
              }}>
                PROJECTS
              </h2>
              {projects.filter(p => p.enabled && p.projectTitle).map((project, idx) => (
                <div key={idx} className="project-item" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748', marginBottom: '2px' }}>
                    {project.projectTitle}
                  </h3>
                  <p style={{ fontSize: '9px', color: '#718096', marginBottom: '4px' }}>
                    {project.startDate} - {project.currentlyWorking ? 'Present' : project.endDate}
                  </p>
                  {project.description && (
                    <div style={{ marginTop: '4px' }}>
                      <div
                        style={{ fontSize: '9px', color: '#4a5568', lineHeight: '1.4', textAlign: 'justify' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.description || '') }}
                      />
                    </div>
                  )}
                  {project.rolesResponsibilities && (
                    <div style={{ marginTop: '4px' }}>
                      <div
                        style={{ fontSize: '9px', color: '#4a5568', lineHeight: '1.4', textAlign: 'justify' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`<strong>Roles & Responsibilities:</strong> ${project.rolesResponsibilities || ''}`) }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Technical Summary */}
          {skillsLinks.technicalSummaryEnabled && skillsLinks.technicalSummary && (
            <div className="resume-section" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingBottom: '4px',
                borderBottom: '1px solid #cbd5e0',
                textAlign: 'justify'
              }}>
                TECHNICAL SUMMARY
              </h2>
              <div style={{ fontSize: '9px', color: '#4a5568', lineHeight: '1.5', textAlign: 'justify' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(skillsLinks.technicalSummary || '') }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PAGE_HEIGHT = 1123; // px (approx A4 at 96dpi height)
const PAGE_EPSILON = 6; // small safety margin (px) to avoid one-off overflow due to measurement/rounding
const MEASURE_SAFETY_FACTOR = 1.0; // measurement safety factor (set to 1.0 for more accurate packing)

const pageStyle: React.CSSProperties = {
  width: '794px',
  height: `${PAGE_HEIGHT}px`,
  boxSizing: 'border-box',
  overflow: 'hidden',
  position: 'relative',
  background: 'white',
  margin: '16px auto',
  padding: '24px',
  fontFamily: 'Times New Roman, serif',
  color: '#111827'
};

const measureStyle: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: '0',
  width: '794px',
  visibility: 'hidden',
  fontFamily: 'Times New Roman, serif',
  color: '#111827'
};

function escapeHtml(input = '') {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const PaginatedResume: React.FC<{ data: ResumeData; supportsPhoto?: boolean; onPageCountChange?: (n: number) => void; onPageChange?: (i: number) => void; controllerRef?: React.RefObject<{ goTo: (i: number) => void; next: () => void; prev: () => void }> }> = ({ data, onPageCountChange, onPageChange, controllerRef }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<Array<{ headerHtml?: string; leftHtml: string; rightHtml: string }>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const PRINT_PAGE_RENDER_LIMIT = 10; // don't auto-render hidden printable pages beyond this
  const [allowPrintRender, setAllowPrintRender] = useState(false);

  useEffect(() => {
    if (!measureRef.current) return;
    const measure = measureRef.current;
    measure.innerHTML = '';
    // Safety/timeboxing to avoid long synchronous work crashing the browser
    const START_TIME = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const TIMEOUT_MS = 900; // if pagination takes longer than this, bail out to fallback
    const checkTimeout = () => {
      if ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - START_TIME > TIMEOUT_MS) {
        const e: any = new Error('paginate-timeout');
        e.code = 'PAGINATE_TIMEOUT';
        throw e;
      }
    };

    // Header
    const header = document.createElement('div');
    header.className = 'measure-block measure-header';
    header.innerHTML = `
      <div style="padding:25px 40px 20px 40px;border-bottom:2px solid #6b7280;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h1 style="font-size:32px;font-weight:700;color:#1f2937;letter-spacing:1px;margin-bottom:2px;line-height:1">${escapeHtml((personal.firstName || '').toUpperCase())} <span style='font-weight:600'>${escapeHtml((personal.lastName || '').toUpperCase())}</span></h1>
            <p style="font-size:13px;color:#4b5563;margin-top:6px;letter-spacing:0.5px">${escapeHtml(experience.jobRole || '')}</p>
          </div>
              {/* When there are too many pages, avoid creating the large hidden DOM automatically
                  as it can crash some browsers (heavy DOM insertion). Offer a button to render
                  the printable pages on demand. */}
              {pages.length > PRINT_PAGE_RENDER_LIMIT && !allowPrintRender && (
                <div style={{ margin: '8px 0', padding: '6px 10px', background: '#f3eeeeff', color: '#991b1b', borderRadius: 6 }}>
                  Printable pages suppressed ({pages.length} pages). Rendering all pages can be heavy and may crash the browser.
                  <button style={{ marginLeft: 8, padding: '4px 8px' }} onClick={() => setAllowPrintRender(true)}>Render printable pages</button>
                </div>
              )}
          <div style="font-size:10px;color:#4b5563;text-align:right;min-width:150px">
            <div style="margin-bottom:5px">${escapeHtml(personal.mobileNumber || '')}</div>
            <div style="margin-bottom:5px">${escapeHtml(personal.email || '')}</div>
            <div>${escapeHtml(personal.address || '')}</div>
          </div>
        </div>
      </div>
    `;

    // Summary
    const summary = document.createElement('div');
    summary.className = 'measure-block measure-summary';
    summary.innerHTML = personal.aboutCareerObjective ? `
      <div style="padding:20px 40px">
        <h2 style="font-size:14px;font-weight:bold;color:#2d3748;text-align:center;letter-spacing:3px;margin-bottom:12px">SUMMARY</h2>
        <div style="font-size:10px;color:#4a5568;text-align:justify;line-height:1.6">${DOMPurify.sanitize(personal.aboutCareerObjective || '')}</div>
      </div>
    ` : '';

    // Build left and right blocks
    const leftBlocks: HTMLDivElement[] = [];
    const rightBlocks: HTMLDivElement[] = [];

    // Education
    if (education.higherEducationEnabled && education.higherEducation.length) {
      const sec = document.createElement('div');
      sec.className = 'measure-block measure-section';
      sec.setAttribute('data-column', 'left');
      sec.innerHTML = `<h2 style="font-size:13px;font-weight:bold;color:#2d3748;letter-spacing:2px;margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0">EDUCATION</h2>`;
      leftBlocks.push(sec);
      education.higherEducation.forEach((edu) => {
        const item = document.createElement('div');
        item.className = 'measure-block measure-education-item';
        item.setAttribute('data-column', 'left');
        item.innerHTML = `
          <h3 style="font-size:11px;font-weight:bold;color:#2d3748;margin-bottom:2px">${escapeHtml(edu.instituteName || '')}</h3>
          <p style="font-size:10px;color:#4a5568;margin-bottom:2px">${escapeHtml(edu.degree || '')}</p>
          <p style="font-size:9px;color:#718096">${escapeHtml(edu.startYear || '')} - ${escapeHtml(edu.currentlyPursuing ? 'Present' : (edu.endYear || ''))}</p>
        `;
        leftBlocks.push(item);
      });
    }

    // pre/sslc
    if (education.preUniversityEnabled && education.preUniversity.instituteName) {
      const item = document.createElement('div');
      item.className = 'measure-block measure-education-item';
      item.setAttribute('data-column', 'left');
      item.innerHTML = `<h3 style="font-size:11px;font-weight:bold;color:#2d3748;margin-bottom:2px">${escapeHtml(education.preUniversity.instituteName)}</h3>
        <p style="font-size:10px;color:#4a5568;margin-bottom:2px">Pre University  - ${escapeHtml(education.preUniversity.boardType || '')}</p>
        <p style="font-size:9px;color:#718096">${escapeHtml(education.preUniversity.yearOfPassing || '')}</p>`;
      leftBlocks.push(item);
    }
    if (education.sslcEnabled && education.sslc.instituteName) {
      const item = document.createElement('div');
      item.className = 'measure-block measure-education-item';
      item.setAttribute('data-column', 'left');
      item.innerHTML = `<h3 style="font-size:11px;font-weight:bold;color:#2d3748;margin-bottom:2px">${escapeHtml(education.sslc.instituteName)}</h3>
        <p style="font-size:10px;color:#4a5568;margin-bottom:2px">SSLC - ${escapeHtml(education.sslc.boardType || '')}</p>
        <p style="font-size:9px;color:#718096">${escapeHtml(education.sslc.yearOfPassing || '')}</p>`;
      leftBlocks.push(item);
    }

    // Skills
    if (skillsLinks.skills.length > 0 && skillsLinks.skills.some(s => s.enabled && s.skillName)) {
      const sec = document.createElement('div');
      sec.className = 'measure-block measure-section';
      sec.setAttribute('data-column', 'left');
      sec.innerHTML = `<h2 style="font-size:13px;font-weight:bold;color:#2d3748;letter-spacing:2px;margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0">SKILLS</h2>`;
      leftBlocks.push(sec);
      skillsLinks.skills.filter(s => s.enabled && s.skillName).forEach((skill) => {
        const item = document.createElement('div');
        item.className = 'measure-block measure-skill';
        item.setAttribute('data-column', 'left');
        item.innerHTML = `<div style="font-size:10px;color:#4a5568;margin-bottom:6px;padding-left:12px;position:relative"><span style="position:absolute;left:0;top:0">•</span>${escapeHtml(skill.skillName || '')}</div>`;
        leftBlocks.push(item);
      });
    }

    // Certifications
    if (certifications.length > 0 && certifications.some(c => c.enabled && c.certificateTitle)) {
      const sec = document.createElement('div');
      sec.className = 'measure-block measure-section';
      sec.setAttribute('data-column', 'left');
      sec.innerHTML = `<h2 style="font-size:13px;font-weight:bold;color:#2d3748;letter-spacing:2px;margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0;text-align:justify">CERTIFICATIONS</h2>`;
      leftBlocks.push(sec);
      certifications.filter(c => c.enabled && c.certificateTitle).forEach((cert) => {
        const item = document.createElement('div');
        item.className = 'measure-block measure-cert';
        item.setAttribute('data-column', 'left');
        item.innerHTML = `<p style="font-size:10px;color:#2d3748;font-weight:600;margin-bottom:2px">• ${escapeHtml(cert.certificateTitle || '')}</p>
          ${cert.providedBy ? `<p style="font-size:9px;color:#718096;padding-left:12px">${escapeHtml(cert.providedBy || '')} ${cert.date ? `- ${escapeHtml(cert.date)}` : ''}</p>` : ''}
          ${cert.description ? `<div style="padding-left:12px"><div style="font-size:9px;color:#718096">${DOMPurify.sanitize(cert.description || '')}</div></div>` : ''}`;
        leftBlocks.push(item);
      });
    }

    // Experience
    if (experience.workExperiences.length > 0 && experience.workExperiences.some(exp => exp.enabled)) {
      const sec = document.createElement('div');
      sec.className = 'measure-block measure-section';
      sec.setAttribute('data-column', 'right');
      sec.innerHTML = `<h2 style="font-size:13px;font-weight:bold;color:#2d3748;letter-spacing:2px;margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0;text-align:justify">PROFESSIONAL EXPERIENCE</h2>`;
      rightBlocks.push(sec);
      experience.workExperiences.filter(exp => exp.enabled).forEach((exp) => {
        const item = document.createElement('div');
        item.className = 'measure-block measure-work-item';
        item.setAttribute('data-column', 'right');
        item.innerHTML = `<h3 style="font-size:11px;font-weight:bold;color:#2d3748;margin-bottom:2px">${escapeHtml(exp.jobTitle || '')}</h3>
          <p style="font-size:10px;color:#4a5568;font-style:italic;margin-bottom:4px">${escapeHtml(exp.companyName || '')} | ${escapeHtml(exp.startDate || '')} - ${escapeHtml(exp.currentlyWorking ? 'Present' : exp.endDate || '')}</p>
          ${exp.description ? `<div style="margin:6px 0 0 0;padding-left:12px;line-height:1.4"><div style="font-size:9px;color:#4a5568;text-align:justify">${DOMPurify.sanitize(exp.description || '')}</div></div>` : ''}`;
        rightBlocks.push(item);
      });
    }

    // Projects
    if (projects.length > 0 && projects.some(p => p.enabled && p.projectTitle)) {
      const sec = document.createElement('div');
      sec.className = 'measure-block measure-section';
      sec.setAttribute('data-column', 'right');
      sec.innerHTML = `<h2 style="font-size:13px;font-weight:bold;color:#2d3748;letter-spacing:2px;margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0">PROJECTS</h2>`;
      rightBlocks.push(sec);
      projects.filter(p => p.enabled && p.projectTitle).forEach((project) => {
        const item = document.createElement('div');
        item.className = 'measure-block measure-project-item';
        item.setAttribute('data-column', 'right');
        item.innerHTML = `<h3 style="font-size:11px;font-weight:bold;color:#2d3748;margin-bottom:2px">${escapeHtml(project.projectTitle || '')}</h3>
          <p style="font-size:9px;color:#718096;margin-bottom:4px">${escapeHtml(project.startDate || '')} - ${escapeHtml(project.currentlyWorking ? 'Present' : project.endDate || '')}</p>
          ${project.description ? `<div style="margin-top:4px"><div style="font-size:9px;color:#4a5568;line-height:1.4;text-align:justify">${DOMPurify.sanitize(project.description || '')}</div></div>` : ''}
          ${project.rolesResponsibilities ? `<div style="margin-top:4px"><div style="font-size:9px;color:#4a5568;line-height:1.4;text-align:justify">${DOMPurify.sanitize(`<strong>Roles & Responsibilities:</strong> ${project.rolesResponsibilities || ''}`)}</div></div>` : ''}`;
        rightBlocks.push(item);
      });
    }

    // Technical summary
    if (skillsLinks.technicalSummaryEnabled && skillsLinks.technicalSummary) {
      const sec = document.createElement('div');
      sec.className = 'measure-block measure-section';
      sec.setAttribute('data-column', 'right');
      sec.innerHTML = `<h2 style="font-size:13px;font-weight:bold;color:#2d3748;letter-spacing:2px;margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0;text-align:justify">TECHNICAL SUMMARY</h2>
        <div style="font-size:9px;color:#4a5568;line-height:1.5;text-align:justify">${DOMPurify.sanitize(skillsLinks.technicalSummary || '')}</div>`;
      rightBlocks.push(sec);
    }

    // Append measure nodes
    measure.appendChild(header);
    if (summary.innerHTML) measure.appendChild(summary);
    leftBlocks.forEach(b => measure.appendChild(b));
    rightBlocks.forEach(b => measure.appendChild(b));

    // Page geometry (A4 @ ~96dpi)
    const PAGE_WIDTH = 794; // approx px
    const PAGE_PADDING_H = 40 * 2; // left + right padding used in layout
    const PAGE_INNER_WIDTH = PAGE_WIDTH - PAGE_PADDING_H;
    const COLUMN_GAP = 40; // gap between columns
    const COLUMN_WIDTH = Math.floor((PAGE_INNER_WIDTH - COLUMN_GAP) / 2);

    // Heights
    const headerHeight = header.offsetHeight || 0;
    const summaryHeight = summary.offsetHeight || 0;
    // Build queues, splitting any blocks that exceed a single page height
    const measureHtml = (html: string, column: 'left' | 'right' | 'full' = 'full') => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      // constrain width when measuring column content so we estimate the
      // vertical space more accurately (narrower columns increase height)
      if (column === 'left' || column === 'right') tmp.style.width = `${COLUMN_WIDTH}px`;
      else tmp.style.width = `${PAGE_INNER_WIDTH}px`;
      measure.appendChild(tmp);
      const h = tmp.offsetHeight;
      measure.removeChild(tmp);
      return h;
    };

    const splitTextToFit = (text: string, limit: number, wrapperTag = 'div', column: 'left' | 'right' | 'full' = 'full') => {
      const parts: string[] = [];
      let remaining = text.trim();
      const MAX_CHUNKS = 400; // defensive cap to avoid pathological splits
      while (remaining.length > 0) {
        // keep algorithm bounded for pathological inputs
        if (parts.length > MAX_CHUNKS) {
          parts.push(`<${wrapperTag}>${escapeHtml(remaining)}</${wrapperTag}>`);
          break;
        }
        let lo = 0;
        let hi = remaining.length;
        let fit = '';
        while (lo < hi) {
          checkTimeout();
          const mid = Math.ceil((lo + hi) / 2);
          const testStr = remaining.slice(0, mid);
          const wrapper = document.createElement(wrapperTag);
          wrapper.innerHTML = escapeHtml(testStr);
          if (column === 'left' || column === 'right') wrapper.style.width = `${COLUMN_WIDTH}px`;
          else wrapper.style.width = `${PAGE_INNER_WIDTH}px`;
          measure.appendChild(wrapper);
          const h = wrapper.offsetHeight;
          measure.removeChild(wrapper);
          if (h <= limit) {
            lo = mid;
            fit = testStr;
          } else {
            hi = mid - 1;
          }
        }
        if (!fit) fit = remaining.slice(0, 1);
        parts.push(`<${wrapperTag}>${escapeHtml(fit)}</${wrapperTag}>`);
        remaining = remaining.slice(fit.length).trim();
      }
      return parts;
    };

    const splitHtmlToFit = (html: string, limit: number, column: 'left' | 'right' | 'full' = 'full') => {
      const parts: string[] = [];
      const tmp = document.createElement('div');
      tmp.innerHTML = html;

      // try paragraph-like split
      const paras = Array.from(tmp.querySelectorAll('p, div, li')) as HTMLElement[];
      if (paras.length > 1) {
        let chunk = document.createElement('div');
        while (paras.length) {
          checkTimeout();
          const node = paras.shift()!;
          chunk.appendChild(node.cloneNode(true));
          measure.appendChild(chunk);
          const h = chunk.offsetHeight;
          measure.removeChild(chunk);
          if (h <= limit) {
            // keep adding
            continue;
          } else {
            // remove last node and push chunk if not empty
            const last = chunk.lastChild;
            if (last) chunk.removeChild(last);
            if (chunk.childNodes.length) {
              parts.push(chunk.innerHTML);
              chunk = document.createElement('div');
            }
            // split oversized node by text
            const largeText = node.innerText || '';
            const splitParts = splitTextToFit(largeText, limit, node.tagName.toLowerCase(), column);
            parts.push(...splitParts);
          }
        }
        if (chunk.childNodes.length) parts.push(chunk.innerHTML);
        return parts;
      }

      // fallback: split by text
      const fullText = tmp.innerText || '';
      return splitTextToFit(fullText, limit, 'div', column);
    };

    const leftQueue: { html: string; h: number }[] = [];
    try {
      for (const b of leftBlocks) {
        checkTimeout();
        const hMeasured = Math.ceil(measureHtml(b.outerHTML, 'left') * MEASURE_SAFETY_FACTOR);
        if (hMeasured <= PAGE_HEIGHT - PAGE_EPSILON) leftQueue.push({ html: b.outerHTML, h: hMeasured });
        else {
          const parts = splitHtmlToFit(b.outerHTML, PAGE_HEIGHT - PAGE_EPSILON, 'left');
          for (const p of parts) leftQueue.push({ html: p, h: Math.ceil(measureHtml(p, 'left') * MEASURE_SAFETY_FACTOR) });
        }
      }
    } catch (e: any) {
      if (e && e.code === 'PAGINATE_TIMEOUT') {
        console.warn('[Paginate] timeout during left column build, falling back to single page');
        const fallback = [{ headerHtml: header.outerHTML + (summary.innerHTML ? summary.outerHTML : ''), leftHtml: leftBlocks.map(b => b.outerHTML).join(''), rightHtml: rightBlocks.map(b => b.outerHTML).join('') }];
        setPages(fallback);
        onPageCountChange?.(fallback.length);
        return;
      }
      throw e;
    }

    const rightQueue: { html: string; h: number }[] = [];
    try {
      for (const b of rightBlocks) {
        checkTimeout();
        const hMeasured = Math.ceil(measureHtml(b.outerHTML, 'right') * MEASURE_SAFETY_FACTOR);
        if (hMeasured <= PAGE_HEIGHT - PAGE_EPSILON) rightQueue.push({ html: b.outerHTML, h: hMeasured });
        else {
          const parts = splitHtmlToFit(b.outerHTML, PAGE_HEIGHT - PAGE_EPSILON, 'right');
          for (const p of parts) rightQueue.push({ html: p, h: Math.ceil(measureHtml(p, 'right') * MEASURE_SAFETY_FACTOR) });
        }
      }
    } catch (e: any) {
      if (e && e.code === 'PAGINATE_TIMEOUT') {
        console.warn('[Paginate] timeout during right column build, falling back to single page');
        const fallback = [{ headerHtml: header.outerHTML + (summary.innerHTML ? summary.outerHTML : ''), leftHtml: leftBlocks.map(b => b.outerHTML).join(''), rightHtml: rightBlocks.map(b => b.outerHTML).join('') }];
        setPages(fallback);
        onPageCountChange?.(fallback.length);
        return;
      }
      throw e;
    }

    // Build pages while keeping arrays of blocks per column so we can rebalance later
    type Block = { html: string; h: number };
    type PageBlocks = { headerHtml?: string; leftBlocks: Block[]; rightBlocks: Block[]; leftH: number; rightH: number };
    const outPagesBlocks: PageBlocks[] = [];
    let leftIdx = 0;
    let rightIdx = 0;
    let firstPage = true;

    while (leftIdx < leftQueue.length || rightIdx < rightQueue.length) {
      const pageLeftBlocks: Block[] = [];
      const pageRightBlocks: Block[] = [];
      let leftH = 0;
      let rightH = 0;
      const reserved = firstPage ? headerHeight + summaryHeight : 0;

      let progress = true;
      while (progress) {
        progress = false;
        const leftNext = leftIdx < leftQueue.length ? leftQueue[leftIdx] : null;
        const rightNext = rightIdx < rightQueue.length ? rightQueue[rightIdx] : null;

        // Fill the currently shorter column first to keep columns balanced
        const tryLeftFirst = leftH <= rightH;

        if (tryLeftFirst) {
          if (leftNext && Math.max(leftH + leftNext.h, rightH) + reserved <= (PAGE_HEIGHT - PAGE_EPSILON)) {
            pageLeftBlocks.push(leftNext);
            leftH += leftNext.h;
            leftIdx++;
            progress = true;
            continue;
          }
          if (rightNext && Math.max(leftH, rightH + rightNext.h) + reserved <= (PAGE_HEIGHT - PAGE_EPSILON)) {
            pageRightBlocks.push(rightNext);
            rightH += rightNext.h;
            rightIdx++;
            progress = true;
            continue;
          }
        } else {
          if (rightNext && Math.max(leftH, rightH + rightNext.h) + reserved <= (PAGE_HEIGHT - PAGE_EPSILON)) {
            pageRightBlocks.push(rightNext);
            rightH += rightNext.h;
            rightIdx++;
            progress = true;
            continue;
          }
          if (leftNext && Math.max(leftH + leftNext.h, rightH) + reserved <= (PAGE_HEIGHT - PAGE_EPSILON)) {
            pageLeftBlocks.push(leftNext);
            leftH += leftNext.h;
            leftIdx++;
            progress = true;
            continue;
          }
        }

        // If neither side can accept the next block on this page, break and start a new page
        break;
      }

      outPagesBlocks.push({ headerHtml: firstPage ? (header.outerHTML + (summary.innerHTML ? summary.outerHTML : '')) : undefined, leftBlocks: pageLeftBlocks, rightBlocks: pageRightBlocks, leftH, rightH });
      firstPage = false;
    }

    // Iterative rebalance and keep-with-next passes to ensure pages stabilize and grow dynamically if needed
    const BALANCE_THRESHOLD = 80; // px of imbalance that triggers move (lowered to move more aggressively)
    const MAX_REBALANCE_ITERS = 15; // increase iterations to allow cascading to stabilize

    // Debugging hooks - set `window.__PAGINATE_DEBUG = true` in console to view details
    const dbg = typeof window !== 'undefined' && (window as any).__PAGINATE_DEBUG;
    for (let iter = 0; iter < MAX_REBALANCE_ITERS; iter++) {
      let changed = false;

      // Rebalance pass
      for (let i = 0; i < outPagesBlocks.length - 1; i++) {
        const cur = outPagesBlocks[i];
        const next = outPagesBlocks[i + 1];
        if ((cur.rightH - cur.leftH) > BALANCE_THRESHOLD && cur.leftBlocks.length > 0) {
          while (cur.leftBlocks.length > 0 && (cur.rightH - cur.leftH) > BALANCE_THRESHOLD) {
            const move = cur.leftBlocks[cur.leftBlocks.length - 1];
            // don't move if it would overflow the next page
            if (Math.max(next.leftH + move.h, next.rightH) > (PAGE_HEIGHT - PAGE_EPSILON)) break;
            cur.leftBlocks.pop();
            cur.leftH -= move.h;
            next.leftBlocks.unshift(move);
            next.leftH += move.h;
            changed = true;
          }
        }
        // Symmetric: if right column is overflowing (too tall), move some right blocks forward
        if ((cur.rightH - cur.leftH) > BALANCE_THRESHOLD && cur.rightBlocks.length > 0) {
          while (cur.rightBlocks.length > 0 && (cur.rightH - cur.leftH) > BALANCE_THRESHOLD) {
            const move = cur.rightBlocks[cur.rightBlocks.length - 1];
            // move to the start of next.rightBlocks to preserve order
            if (Math.max(cur.leftH, next.rightH + move.h) > (PAGE_HEIGHT - PAGE_EPSILON)) {
              // if next page cannot accept, create a new page after next and move there
              if (i + 2 >= outPagesBlocks.length) {
                outPagesBlocks.push({ headerHtml: undefined, leftBlocks: [], rightBlocks: [], leftH: 0, rightH: 0 });
              }
              outPagesBlocks[i + 2].rightBlocks.unshift(move);
              outPagesBlocks[i + 2].rightH += move.h;
              cur.rightBlocks.pop();
              cur.rightH -= move.h;
              changed = true;
            } else {
              next.rightBlocks.unshift(move);
              next.rightH += move.h;
              cur.rightBlocks.pop();
              cur.rightH -= move.h;
              changed = true;
            }
          }
        }
      }

      // Keep-with-next pass
      for (let i = 0; i < outPagesBlocks.length - 1; i++) {
        const cur = outPagesBlocks[i];
        const next = outPagesBlocks[i + 1];
        if (cur.leftBlocks.length === 0) continue;
        const last = cur.leftBlocks[cur.leftBlocks.length - 1];
        if (/<h2[\s>]/i.test(last.html)) {
          if (next.leftBlocks.length > 0) {
            const headerBlock = cur.leftBlocks.pop()!;
            cur.leftH -= headerBlock.h;
            next.leftBlocks.unshift(headerBlock);
            next.leftH += headerBlock.h;
            changed = true;

            // Cascade any overflow forward
            let j = i + 1;
            while (j < outPagesBlocks.length) {
              const page = outPagesBlocks[j];
              if (page.leftH <= (PAGE_HEIGHT - PAGE_EPSILON) && page.rightH <= (PAGE_HEIGHT - PAGE_EPSILON)) break;
              if (page.leftH > (PAGE_HEIGHT - PAGE_EPSILON) && page.leftBlocks.length > 0) {
                const mv = page.leftBlocks.pop()!;
                page.leftH -= mv.h;
                if (j + 1 >= outPagesBlocks.length) {
                  outPagesBlocks.push({ headerHtml: undefined, leftBlocks: [mv], rightBlocks: [], leftH: mv.h, rightH: 0 });
                } else {
                  outPagesBlocks[j + 1].leftBlocks.unshift(mv);
                  outPagesBlocks[j + 1].leftH += mv.h;
                }
                changed = true;
              }
              if (page.rightH > (PAGE_HEIGHT - PAGE_EPSILON) && page.rightBlocks.length > 0) {
                const mv = page.rightBlocks.pop()!;
                page.rightH -= mv.h;
                if (j + 1 >= outPagesBlocks.length) {
                  outPagesBlocks.push({ headerHtml: undefined, leftBlocks: [], rightBlocks: [mv], leftH: 0, rightH: mv.h });
                } else {
                  outPagesBlocks[j + 1].rightBlocks.unshift(mv);
                  outPagesBlocks[j + 1].rightH += mv.h;
                }
                changed = true;
              }
              j++;
            }
          }
        }
      }

      if (dbg) {
        console.debug('[Paginate] iter', iter, 'changed', changed, 'pages', outPagesBlocks.length);
      }
      if (!changed) break;
    }

    if (dbg) {
      console.debug('[Paginate] leftQueue', leftQueue.length, 'rightQueue', rightQueue.length, 'pagesAfter', outPagesBlocks.length);
    }

    // If any leftover blocks were somehow not consumed (defensive), create pages greedily until all items placed
    while (leftIdx < leftQueue.length || rightIdx < rightQueue.length) {
      const pageLeftBlocks: { html: string; h: number }[] = [];
      const pageRightBlocks: { html: string; h: number }[] = [];
      let leftH = 0;
      let rightH = 0;
      const reserved = 0;

      // Try to add left blocks until no more fit
      while (leftIdx < leftQueue.length) {
        const next = leftQueue[leftIdx];
        if (Math.max(leftH + next.h, rightH) + reserved <= (PAGE_HEIGHT - PAGE_EPSILON)) {
          pageLeftBlocks.push(next);
          leftH += next.h;
          leftIdx++;
        } else break;
      }

      // Then fill right blocks
      while (rightIdx < rightQueue.length) {
        const next = rightQueue[rightIdx];
        if (Math.max(leftH, rightH + next.h) + reserved <= (PAGE_HEIGHT - PAGE_EPSILON)) {
          pageRightBlocks.push(next);
          rightH += next.h;
          rightIdx++;
        } else break;
      }

      // If neither side could accept a block, force-split the largest remaining block to make progress
      if (pageLeftBlocks.length === 0 && pageRightBlocks.length === 0) {
        if (leftIdx < leftQueue.length) {
          const b = leftQueue[leftIdx];
          const parts = splitHtmlToFit(b.html, PAGE_HEIGHT - PAGE_EPSILON);
          leftQueue.splice(leftIdx, 1, ...parts.map(p => ({ html: p, h: Math.ceil(measureHtml(p) * MEASURE_SAFETY_FACTOR) })));
          continue; // reattempt
        }
        if (rightIdx < rightQueue.length) {
          const b = rightQueue[rightIdx];
          const parts = splitHtmlToFit(b.html, PAGE_HEIGHT - PAGE_EPSILON);
          rightQueue.splice(rightIdx, 1, ...parts.map(p => ({ html: p, h: Math.ceil(measureHtml(p) * MEASURE_SAFETY_FACTOR) })));
          continue; // reattempt
        }
      }

      outPagesBlocks.push({ headerHtml: undefined, leftBlocks: pageLeftBlocks, rightBlocks: pageRightBlocks, leftH, rightH });
    }

    // Convert blocks back to html strings for rendering
    let outPages = outPagesBlocks.map(p => ({ headerHtml: p.headerHtml, leftHtml: p.leftBlocks.map(b => b.html).join(''), rightHtml: p.rightBlocks.map(b => b.html).join('') }));

    // Remove consecutive duplicate pages (can happen from aggressive rebalance/splits)
    const deduped: Array<{ headerHtml?: string; leftHtml: string; rightHtml: string }> = [];
    for (const p of outPages) {
      const key = `${p.headerHtml || ''}||${p.leftHtml}||${p.rightHtml}`;
      if (deduped.length === 0) {
        deduped.push(p);
        continue;
      }
      const last = deduped[deduped.length - 1];
      const lastKey = `${last.headerHtml || ''}||${last.leftHtml}||${last.rightHtml}`;
      if (key !== lastKey) deduped.push(p);
    }

    // Trim trailing fully-empty pages (no left/right content and no header)
    while (deduped.length > 1) {
      const last = deduped[deduped.length - 1];
      if ((last.leftHtml || '').trim() === '' && (last.rightHtml || '').trim() === '' && !(last.headerHtml || '').trim()) {
        deduped.pop();
      } else break;
    }

    const finalPages = deduped.length ? deduped : [{ headerHtml: header.outerHTML + (summary.innerHTML ? summary.outerHTML : ''), leftHtml: '', rightHtml: '' }];
    setPages(finalPages);
    onPageCountChange?.(finalPages.length);
  }, [data]);

  useEffect(() => {
    const onResize = () => setPages(p => [...p]);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // notify parent when current page changes
  useEffect(() => {
    onPageChange?.(currentPage + 1); // 1-based
  }, [currentPage]);

  // ensure currentPage is within bounds when pages change
  useEffect(() => {
    if (currentPage >= pages.length) setCurrentPage(Math.max(0, pages.length - 1));
  }, [pages]);

  const goTo = (i: number) => setCurrentPage(Math.max(0, Math.min(pages.length - 1, i)));
  const next = () => setCurrentPage(p => Math.min(p + 1, pages.length - 1));
  const prev = () => setCurrentPage(p => Math.max(0, p - 1));

  // expose controller methods on controllerRef if provided
  useEffect(() => {
    if (!controllerRef) return;
    controllerRef.current = {
      goTo: (i: number) => goTo(i),
      next: () => next(),
      prev: () => prev(),
    };
  }, [controllerRef, pages.length]);

  return (
    <div>
      {pages.length > 0 ? (
        <div>
          <div className="page" style={pageStyle}>
            {pages[currentPage].headerHtml && <div dangerouslySetInnerHTML={{ __html: pages[currentPage].headerHtml }} />}
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ width: '48%', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: pages[currentPage].leftHtml }} />
              <div style={{ width: '48%', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: pages[currentPage].rightHtml }} />
            </div>
          </div>

          {/* Pagination controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <button onClick={() => prev()} disabled={currentPage === 0} style={{ padding: '8px 12px', borderRadius: '6px' }}>« Prev</button>
            {/* compact page buttons */}
            {(() => {
              const total = pages.length;
              const buttons: React.ReactNode[] = [];
              const pushBtn = (i: number) => buttons.push(
                <button key={i} onClick={() => goTo(i)} aria-current={i === currentPage} style={{
                  padding: '8px 12px', borderRadius: '6px', background: i === currentPage ? '#0ea5e9' : '#f3f4f6', color: i === currentPage ? 'white' : '#111827', border: 'none'
                }}>{i + 1}</button>
              );

              if (total <= 7) {
                for (let i = 0; i < total; i++) pushBtn(i);
              } else {
                pushBtn(0);
                if (currentPage > 3) buttons.push(<span key="e1">&hellip;</span>);
                const start = Math.max(1, currentPage - 1);
                const end = Math.min(total - 2, currentPage + 1);
                for (let i = start; i <= end; i++) pushBtn(i);
                if (currentPage < total - 4) buttons.push(<span key="e2">&hellip;</span>);
                pushBtn(total - 1);
              }
              return buttons;
            })()}
            <button onClick={() => next()} disabled={currentPage === pages.length - 1} style={{ padding: '8px 12px', borderRadius: '6px' }}>Next »</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>No content to paginate</div>
      )}

      <div ref={measureRef} style={measureStyle} aria-hidden />
      {/* Hidden printable pages (used for generating pixel-perfect PDFs). Not display:none because html2canvas needs to render it. */}
      {(allowPrintRender || pages.length <= PRINT_PAGE_RENDER_LIMIT) ? (
        <div className="pdf-print-pages" style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
          {pages.map((pg, idx) => (
            <div key={`pdf-${idx}`} className="page pdf-print-page" style={pageStyle} dangerouslySetInnerHTML={{ __html: (pg.headerHtml || '') + `<div style="display:flex;gap:40px"><div style="width:48%">${pg.leftHtml}</div><div style="width:48%">${pg.rightHtml}</div></div>` }} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Template1Display;