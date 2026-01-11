import React from "react";
import DOMPurify from 'dompurify';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 24,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 10,
    fontFamily: "Times-Roman",
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 18,
    paddingBottom: 6,
    marginBottom: 40,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  nameSection: {
    flexDirection: "column",
    flex: 1,
  },
  name: {
    fontSize: 34,
    fontFamily: "Times-Bold",
    color: "#111827",
    marginBottom: 10,
    lineHeight: 1,
  },
  jobTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  contactLine: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 8,
    letterSpacing: 0.2,
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
    color: '#0a66c2',
    marginTop: 6,
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: "#111827",
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: "#4a5568",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 10,
    color: "#718096",
  },
  bulletText: {
    fontSize: 10,
    color: '#4a5568',
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

  const renderBulletedParagraph = (html?: string, textStyle?: any) => {
    if (!html) return null;
    const text = htmlToPlainText(html);
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.map((line, i) => (
      <Text key={i} style={textStyle}> {'\u2022 '}{line}</Text>
    ));
  };

  const getYear = (s?: string) => (s ? s.split('-')[0] : '');

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
        <View style={styles.header}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{personal.firstName} {personal.middleName ? ' ' + personal.middleName : ''} {personal.lastName}</Text>
              {personal.aboutCareerObjective ? <Text style={styles.objective}>{htmlToPlainText(personal.aboutCareerObjective)}</Text> : null}
              <Text style={styles.contactLine}>{[personal.email, personal.mobileNumber, personal.address].filter(Boolean).join(' | ')}</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                {((skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.linkedinProfile) || (personal as any).linkedinProfile) && (
                  <Text style={styles.linkText}>LinkedIn</Text>
                )}
                {((skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.githubProfile) || (personal as any).githubProfile) && (
                  <Text style={[styles.linkText, { color: '#111' }]}>GitHub</Text>
                )}
              </View>
            </View>
        </View>

        {/* Experience */}
        {experience.workExperiences.length > 0 && (
          <View style={{ marginTop: 28, marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 8 }} />
            {experience.workExperiences.filter((w: any) => w.enabled).map((w: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.itemTitle}>{w.companyName}</Text>
                  <Text style={styles.itemDate}>{formatMonthYear(w.startDate)} - {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                </View>
                <Text style={styles.itemSubtitle}>{w.jobTitle}</Text>
                {w.description && renderBulletedParagraph(w.description, styles.bulletText)}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.higherEducationEnabled && education.higherEducation.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 8 }} />
            {education.higherEducation.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <Text style={styles.itemTitle}>{edu.instituteName}</Text>
                <Text style={styles.itemSubtitle}>{edu.degree}</Text>
                <Text style={styles.itemDate}>{formatMonthYear(edu.startYear)} - {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Other: Skills, Certifications, Languages */}
        <View>
          <Text style={styles.sectionTitle}>OTHER</Text>
          <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginBottom: 8 }} />

          {skillsLinks.skills.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>Technical Skills:</Text>
              <Text style={{ fontSize: 10 }}>{skillsLinks.skills.filter((s: any) => s.enabled && s.skillName).map((s: any) => s.skillName).join(', ')}</Text>
            </View>
          )}

          {certifications.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>Certifications & Training:</Text>
              <Text style={{ fontSize: 10 }}>{certifications.filter((c: any) => c.enabled && c.certificateTitle).map((c: any) => c.certificateTitle).join(', ')}</Text>
            </View>
          )}

          <View>
            <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>Languages:</Text>
            <Text style={{ fontSize: 10 }}>{personal.languagesKnown && personal.languagesKnown.length > 0 ? personal.languagesKnown.join(', ') : ''}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Template11PDF;
