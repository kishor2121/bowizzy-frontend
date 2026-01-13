import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet, Svg, Path } from '@react-pdf/renderer';
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
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {personal.address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                <Svg width={10} height={10} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#6b7280"/></Svg>
                <Text style={[styles.contact, { marginLeft: 6 }]}>{String(personal.address).split(',')[0]}</Text>
              </View>
            )}
            {personal.email && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                <Svg width={10} height={10} viewBox="0 0 24 24"><Path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1 .9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" fill="#6b7280"/></Svg>
                <Text style={[styles.contact, { marginLeft: 6 }]}>{personal.email}</Text>
              </View>
            )}
            {personal.mobileNumber && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                <Svg width={10} height={10} viewBox="0 0 24 24"><Path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 21 3 13.93 3 4.5A1 1 0 014 3.5H7.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.01l-2.2 2.2z" fill="#6b7280"/></Svg>
                <Text style={[styles.contact, { marginLeft: 6 }]}>{personal.mobileNumber}</Text>
              </View>
            )}
            {linkedinPresent && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                <Svg width={10} height={10} viewBox="0 0 24 24"><Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1 .9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 14H7.5V10h2v7zM8.5 9.5c-.66 0-1.2-.54-1.2-1.2S7.84 7.1 8.5 7.1s1.2.54 1.2 1.2-.54 1.2-1.2 1.2zM17.5 17h-2v-3.5c0-.93-.03-2.12-1.29-2.12-1.29 0-1.49 1.01-1.49 2.06V17h-2V10h1.92v1.05h.03c.27-.51.94-1.05 1.93-1.05 2.06 0 2.44 1.36 2.44 3.13V17z" fill="#0A66C2"/></Svg>
                <Text style={[styles.contact, { marginLeft: 6 }]}>{linkedinPresent}</Text>
              </View>
            )}
            {githubPresent && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                <Svg width={10} height={10} viewBox="0 0 24 24"><Path d="M12 .5C5.73 .5 .5 5.73 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.55-3.88-1.55-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.21 1.8 1.21 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.45.11-3.02 0 0 .98-.31 3.2 1.17.93-.26 1.93-.39 2.92-.39.99 0 1.99.13 2.92.39 2.22-1.48 3.2-1.17 3.2-1.17.63 1.57.23 2.73.11 3.02.75.8 1.2 1.82 1.2 3.07 0 4.41-2.69 5.39-5.25 5.67.42.36.8 1.08.8 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z" fill="#111827"/></Svg>
                <Text style={[styles.contact, { marginLeft: 6 }]}>{githubPresent}</Text>
              </View>
            )}
          </View>
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