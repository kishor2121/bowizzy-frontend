import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 24, paddingLeft: 36, paddingRight: 36, fontSize: 10, fontFamily: 'Times-Roman' },
  header: { textAlign: 'center', marginBottom: 4 },
  name: { fontSize: 28, fontFamily: 'Times-Bold', marginBottom: 4 },
  objective: { fontSize: 10, color: '#444', marginTop: 0, marginBottom: 0, lineHeight: 1.4 },
  contact: { fontSize: 10, color: '#6b7280' },
  divider: { height: 1, backgroundColor: '#cfcfcf', marginTop: 12, marginBottom: 0, width: '100%' },
  grid: { flexDirection: 'row' },
  leftCol: { width: 120, paddingRight: 12 },
  sectionHeading: { fontSize: 11, fontFamily: 'Times-Bold', letterSpacing: 1.5, textTransform: 'uppercase', color: '#111827' },
  rightCol: { flex: 1 },
  itemTitle: { fontSize: 12, fontFamily: 'Times-Bold' },
  itemSub: { fontSize: 11, color: '#111827', fontFamily: 'Times-Bold' },
  bullet: { fontSize: 10, color: '#444', marginTop: 2 },
});

const htmlToPlainText = (html?: string) => {
  if (!html) return '';
  const sanitized = DOMPurify.sanitize(html || '');
  const withBreaks = sanitized.replace(/<br\s*\/?/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n');
  // decode common HTML entities so encoded tags like &lt;div&gt; are normalized
  const decoded = withBreaks.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  try {
    if (typeof document !== 'undefined') {
      const tmp = document.createElement('div');
      tmp.innerHTML = decoded;
      return (tmp.textContent || tmp.innerText || '').trim();
    }
  } catch (e) { /* ignore */ }
  return decoded.replace(/<[^>]+>/g, '').trim();
};

const renderBulletedParagraph = (html?: string) => {
  if (!html) return null;
  const text = htmlToPlainText(html);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <View style={{ marginTop: 2 }}>
      {lines.map((ln, idx) => <Text key={idx} style={styles.bullet}>• {ln}</Text>)}
    </View>
  );
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
  } catch (e) { /* ignore */ }
  return String(s);
};

const formatYear = (s?: string) => {
  if (!s) return '';
  const str = String(s).trim();
  const y = str.match(/(\d{4})/);
  return y ? y[1] : str;
};

const educationPriority = (degree?: string) => {
  if (!degree) return 99;
  const d = degree.toLowerCase();
  if (/(bachelor|b\.?e|btech|b\.tech|be|bsc|ba)/.test(d)) return 1;
  if (/(puc|higher secondary|12th|intermediate)/.test(d)) return 2;
  if (/(ssc|sslc|10th|matric)/.test(d)) return 3;
  return 4;
};

interface Template13PDFProps { data: ResumeData }

const Template13PDF: React.FC<Template13PDFProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;

  const contactParts = [personal.address && String(personal.address).split(',')[0], personal.email, personal.mobileNumber].filter(Boolean);
  const linkedinPresent = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.linkedinProfile) || (personal as any).linkedinProfile;
  const githubPresent = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.githubProfile) || (personal as any).githubProfile;
  const pdfContactLine = [...contactParts, ...(linkedinPresent ? [linkedinPresent] : []), ...(githubPresent ? [githubPresent] : [])].join(' | ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</Text>
          <Text style={styles.contact}>{pdfContactLine}</Text>
          <View style={styles.divider} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>SUMMARY</Text>
          <View style={{ height: 1, backgroundColor: '#cfcfcf', width: '100%', marginTop: 0, marginBottom: 0 }} />
        </View>
        {personal.aboutCareerObjective ? <Text style={[styles.objective, { marginTop: 0, marginBottom: 0 }]}>{htmlToPlainText(personal.aboutCareerObjective)}</Text> : null}

        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionHeading}>EXPERIENCE</Text>
          <View style={{ height: 1, backgroundColor: '#cfcfcf', width: '100%', marginTop: 0, marginBottom: 0 }} />
        </View>
        <View>
            {experience.workExperiences.filter((w: any) => w.enabled).map((w: any, i: number) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.itemTitle}>{w.jobTitle} — {w.companyName}</Text>
                  <Text style={styles.itemSub}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                </View>
                {w.description && renderBulletedParagraph(w.description)}
              </View>
            ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>EDUCATION</Text>
          <View style={{ height: 1, backgroundColor: '#cfcfcf', width: '100%', marginTop: 0, marginBottom: 0 }} />
        </View>
        <View>
            {education.higherEducationEnabled && education.higherEducation.slice().sort((a: any, b: any) => educationPriority(a.degree) - educationPriority(b.degree)).map((edu: any, i: number) => (
              <View key={`he-${i}`} style={{ marginBottom: 6 }}>
                <Text style={styles.itemTitle}>{edu.instituteName}</Text>
                <Text style={styles.itemSub}>{edu.degree} — {edu.currentlyPursuing ? 'Present' : formatYear(edu.endYear)}</Text>
                {edu.resultFormat && edu.result && (<Text style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{edu.resultFormat}: {edu.result}</Text>)}
              </View>
            ))}

            {education.preUniversityEnabled && education.preUniversity && (education.preUniversity.instituteName || education.preUniversity.yearOfPassing) && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.itemTitle}>{education.preUniversity.instituteName || 'Pre University'}</Text>
                <Text style={styles.itemSub}>Pre University (12th Standard) — {formatYear(education.preUniversity.yearOfPassing)}</Text>
                {education.preUniversity.resultFormat && education.preUniversity.result && (<Text style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{education.preUniversity.resultFormat}: {education.preUniversity.result}</Text>)}
              </View>
            )}

            {education.sslcEnabled && education.sslc && (education.sslc.instituteName || education.sslc.yearOfPassing) && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.itemTitle}>{education.sslc.instituteName || 'SSLC'}</Text>
                <Text style={styles.itemSub}>SSLC (10th Standard) — {formatYear(education.sslc.yearOfPassing)}</Text>
                {education.sslc.resultFormat && education.sslc.result && (<Text style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{education.sslc.resultFormat}: {education.sslc.result}</Text>)}
              </View>
            )}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>SKILLS</Text>
          <View style={{ height: 1, backgroundColor: '#cfcfcf', width: '100%', marginTop: 0, marginBottom: 0 }} />
        </View>
        <View><Text style={{ fontSize: 10, color: '#444' }}>{skillsLinks.skills.filter((s: any) => s.enabled && s.skillName).map((s: any) => s.skillName).join(', ')}</Text></View>

        <View style={{ height: 4 }} />
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>CERTIFICATIONS</Text>
          <View style={{ height: 1, backgroundColor: '#cfcfcf', width: '100%', marginTop: 0, marginBottom: 0 }} />
        </View>
        <View><Text style={{ fontSize: 10, color: '#444' }}>{certifications.filter((c: any) => c.enabled && c.certificateTitle).map((c: any) => c.certificateTitle).join(', ')}</Text></View>

      </Page>
    </Document>
  );
};

export default Template13PDF;