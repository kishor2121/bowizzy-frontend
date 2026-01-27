import React from "react";
import DOMPurify from 'dompurify';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 12,
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 10,
    fontFamily: "Times-Roman",
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 6,
    paddingLeft: 36,
    paddingRight: 36,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  nameSection: {
    flexDirection: "column",
    flex: 1,
    alignItems: 'flex-start',
    width: '100%'
  },
  name: {
    fontSize: 28,
    fontFamily: "Times-Bold",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 1.2,
    textAlign: 'left',
    width: '100%',
    alignSelf: 'flex-start'
  },
  jobTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  contactLine: {
    fontSize: 11,
    color: "#111827",
    marginTop: 8,
    letterSpacing: 0.2,
    textAlign: 'left',
    width: '100%'
  },
  contactSection: {
    flexDirection: "column",
    alignItems: "flex-end",
    fontSize: 9,
    color: "#4b5563",
    minWidth: 180,
  },
  objective: {
    fontSize: 10,
    color: '#444',
    marginTop: 6,
  },
  linkText: {
    fontSize: 9,
    color: '#06090fff',
    marginTop: 6,
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: "#111827",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#111827",
    marginBottom: 0,
  },
  itemSubtitle: {
    fontSize: 10,
    color: "#4a5568",
    marginBottom: 0,
  },
  itemDate: {
    fontSize: 9,
    color: "#111827",
    fontFamily: "Times-Bold",
  },
  bulletText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 'normal',
    marginBottom: 4,
  }
});

interface Template11PDFProps {
  data: ResumeData;
}

const Template11PDF: React.FC<Template11PDFProps> = ({ data }) => {
  const {
    personal,
    education,
    experience,
    projects,
    skillsLinks,
    certifications,
  } = data;

  const ICON_PATHS: Record<string, string> = {
    phone: 'M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 3.5A1 1 0 013 2.5H6.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.01l-2.2 2.2z',
    mail: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z',
  };

  const htmlToPlainText = (html?: string) => {
    if (!html) return '';
    const sanitized = DOMPurify.sanitize(html || '');
    const withBreaks = sanitized.replace(/<br\s*\/?/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n');
    try {
      if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = withBreaks;
        return (tmp.textContent || tmp.innerText || '').trim();
      }
    } catch (e) {
      return withBreaks.replace(/<[^>]+>/g, '').trim();
    }
    return withBreaks.replace(/<[^>]+>/g, '').trim();
  };

  // Build contact parts including optional links
  const contactParts = (() => {
    const parts: string[] = [];
    if (personal.email) parts.push(personal.email);
    if (personal.mobileNumber) parts.push(personal.mobileNumber);
    if (personal.address) parts.push(personal.address);
    const links = skillsLinks?.links || {} as any;
    if (links.linkedinProfile) parts.push(links.linkedinProfile);
    if (links.githubProfile) parts.push(links.githubProfile);
    if (links.portfolioUrl) parts.push(links.portfolioUrl);
    return parts.filter(Boolean);
  })();

  const renderBulletedParagraph = (html?: string, textStyle?: any) => {
    if (!html) return null;
    const sanitized = DOMPurify.sanitize(html || '');

    // Try to extract list items first
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    const items: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = liRegex.exec(sanitized)) !== null) {
      let inner = m[1] || '';
      inner = inner.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
      if (inner) items.push(inner);
    }

    // If we found list items, render them as bullets
    if (items.length > 0) {
      return (
        <View style={{ marginTop: 6 }}>
          {items.map((it, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginTop: idx > 0 ? 4 : 0, alignItems: 'flex-start' }}>
              <Text style={{ width: 10, color: '#000000', fontSize: 10 }}>•</Text>
              <Text style={{ flex: 1, color: '#000000', fontSize: 10, lineHeight: 1.3 }}>{it}</Text>
            </View>
          ))}
        </View>
      );
    }

    // Fallback: convert paragraphs and line breaks into lines
    let text = sanitized
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    return (
      <View style={{ marginTop: 6 }}>
        {lines.map((line, idx) => (
          <View key={idx} style={{ marginTop: idx > 0 ? 6 : 0 }}>
            <Text style={{ color: '#000000', fontSize: 10, lineHeight: 1.35 }}>{line}</Text>
          </View>
        ))}
      </View>
    );
  };

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

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formatDate = (s?: string) => {
    if (!s) return '';
    const val = String(s).trim();
    const parts = val.split('-');
    const year = parts[0];
    const monthPart = parts.length > 1 ? parts[1] : undefined;
    if (!monthPart) return year;
    const monthNum = parseInt(monthPart, 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      return `${year} ${monthNames[monthNum - 1]}`;
    }
    return val;
  };

  const formatMonthYear = (s?: string) => {
    if (!s) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    try {
      const str = String(s).trim();
      const ymdMatch = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
      if (ymdMatch) {
        const year = ymdMatch[1];
        const mm = parseInt(ymdMatch[2], 10);
        const mon = months[mm - 1] || String(mm).padStart(2, '0');
        return `${year} ${mon}`;
      }
      const mYMatch = str.match(/^(\d{2})\/(\d{4})$/);
      if (mYMatch) {
        const mm = parseInt(mYMatch[1], 10);
        const year = mYMatch[2];
        const mon = months[mm - 1] || String(mm).padStart(2, '0');
        return `${mon} ${year}`;
      }
      const monthNameMatch = str.match(/^[A-Za-z]{3,}\s+\d{4}$/);
      if (monthNameMatch) return str;
      const yearOnly = str.match(/^(\d{4})$/);
      if (yearOnly) return yearOnly[1];
      return str;
    } catch (e) {
      return String(s);
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        {/* Header Section - Classic Serif look */}
        <View style={{ paddingTop: 18, paddingBottom: 6, paddingLeft: 36, paddingRight: 36 }}>
          <Text style={{ fontSize: 36, fontFamily: 'Times-Bold', color: '#111827', marginBottom: 0, lineHeight: 1, textAlign: 'left' }}>
            {personal.firstName}{personal.middleName ? ' ' + personal.middleName : ''}{personal.lastName ? ' ' + personal.lastName : ''}
          </Text>
          <Text style={{ fontSize: 11, color: '#111827', marginTop: 8, textAlign: 'left' }}>
            {contactParts.join(' | ')}
          </Text>
        </View>

        {/* Content - Single column like image */}
        <View style={{ paddingLeft: 36, paddingRight: 36, paddingBottom: 36 }}>
          {/* About / Career Objective Section */}
          {personal.aboutCareerObjective && personal.aboutCareerObjective.trim() !== '' && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.sectionTitle}>CAREER OBJECTIVE</Text>
              <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 6 }} />
              <Text style={styles.objective}>{htmlToPlainText(personal.aboutCareerObjective)}</Text>
            </View>
          )}

          {/* Experience Section */}
          {experience.workExperiences.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Times-Bold', color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>EXPERIENCE</Text>
              <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 8 }} />
              {experience.workExperiences.filter((w: any) => w.enabled).map((w: any, i: number) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, fontFamily: 'Times-Bold', color: '#111827', flex: 1, marginRight: 8 }}>{w.companyName}</Text>
                      <Text style={{ fontSize: 11, color: '#111827', fontFamily: 'Times-Bold', width: 120, textAlign: 'right' }}>{formatMonthYear(w.startDate)} - {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 11, color: '#000000', fontFamily: 'Times-Bold' }}>{w.jobTitle}</Text>
                      </View>
                      {w.location && <Text style={{ fontSize: 11, color: '#000000', fontFamily: 'Times-Bold', width: 120, textAlign: 'right' }}>{w.location}</Text>}
                    </View>
                    {w.description && (
                      <View style={{ marginLeft: 12 }}>
                        {renderBulletedParagraph(w.description, { fontSize: 11, color: '#000000', fontWeight: 'normal', lineHeight: 1.6 })}
                      </View>
                    )}
                </View>
              ))}
            </View>
          )}

          {/* Education Section */}
          {education.higherEducationEnabled && education.higherEducation.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Times-Bold', color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>EDUCATION</Text>
              <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 6 }} />
              {education.higherEducation.map((edu, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold', color: '#000000', flex: 1, marginRight: 8 }}>{edu.instituteName}</Text>
                    <Text style={{ fontSize: 10, color: '#000000', fontFamily: 'Times-Bold' }}>{formatMonthYear(edu.startYear)} - {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#000000', fontFamily: 'Times-Roman', fontWeight: 'normal', marginTop: 4 }}>
                    {getFullDegreeName(edu.degree)}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Times-Bold', color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>TECHNICAL CERTIFICATIONS</Text>
              <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 8 }} />
              {certifications.filter((c: any) => c.enabled).map((cert: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold', color: '#000000', flex: 1, marginRight: 8 }}>{cert.certificateTitle}</Text>
                    <Text style={{ fontSize: 10, color: '#000000', fontFamily: 'Times-Bold' }}>{cert.date}</Text>
                  </View>
                  {cert.description && (
                    <Text style={{ fontSize: 11, color: '#000000', fontFamily: 'Times-Roman', fontWeight: 'normal', marginTop: 4 }}>
                      {DOMPurify.sanitize(cert.description).replace(/<[^>]+>/g, '')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Other Section - Skills Only (show only if there are enabled skills) */}
          {skillsLinks.skills.filter((s: any) => s.enabled && s.skillName).length > 0 && (
            <View>
              <Text style={{ fontSize: 13, fontFamily: 'Times-Bold', color: '#111827', letterSpacing: 1.2, marginBottom: 8 }}>OTHER</Text>
              <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 12 }} />

              {/* Skills */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Times-Bold', color: '#000000', marginBottom: 4 }}>Technical Skills:</Text>
                <Text style={{ fontSize: 11, color: '#000000', fontWeight: 'normal' }}>
                  {skillsLinks.skills
                    .filter((s: any) => s.enabled && s.skillName)
                    .map((s: any) => s.skillName)
                    .join(', ')}
                </Text>
              </View>

              {/* Languages (commented out for now) */}
              {/* <View style={{ marginBottom: 0 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Times-Bold', color: '#000000', marginBottom: 4 }}>Languages:</Text>
                <Text style={{ fontSize: 11, color: '#000000', fontWeight: 'normal' }}>{personal.languagesKnown && personal.languagesKnown.length > 0 ? personal.languagesKnown.join(', ') : ''}</Text>
              </View> */}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default Template11PDF;
