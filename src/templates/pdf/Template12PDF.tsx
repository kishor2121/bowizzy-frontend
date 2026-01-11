import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  header: {
    textAlign: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 28, fontFamily: 'Times-Bold', marginBottom: 6 },
  summary: { fontSize: 10, color: '#333', marginBottom: 6 },
  contact: { fontSize: 10, color: '#6b7280' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 12 },

  grid: { flexDirection: 'row' },
  leftCol: { width: 120, paddingRight: 12 },
  sectionHeading: { fontSize: 11, fontFamily: 'Times-Bold', letterSpacing: 1.2, textTransform: 'uppercase', color: '#111827' },
  rightCol: { flex: 1 },

  sectionTitle: { fontSize: 11, fontFamily: 'Times-Bold', marginBottom: 6 },
  itemTitle: { fontSize: 11, fontFamily: 'Times-Bold' },
  itemSub: { fontSize: 10, color: '#6b7280' },
  bullet: { fontSize: 10, color: '#444', marginTop: 4 },
});

interface Template12PDFProps { data: ResumeData }

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
  } catch (e) { /* ignore */ }
  return withBreaks.replace(/<[^>]+>/g, '').trim();
};

const renderBulletedParagraph = (html?: string) => {
  if (!html) return null;
  const text = htmlToPlainText(html);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((ln, idx) => <Text key={idx} style={styles.bullet}>• {ln}</Text>);
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

const Template12PDF: React.FC<Template12PDFProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</Text>
          {personal.aboutCareerObjective ? <Text style={styles.summary}>{htmlToPlainText(personal.aboutCareerObjective)}</Text> : null}
          <Text style={styles.contact}>{[personal.email, personal.mobileNumber, personal.address].filter(Boolean).join(' | ')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          <View style={styles.leftCol}>
            <Text style={styles.sectionHeading}>WORK EXPERIENCE</Text>
          </View>
          <View style={styles.rightCol}>
            {experience.workExperiences.filter(w => w.enabled).map((w: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.itemTitle}>{w.jobTitle} — {w.companyName}</Text>
                  <Text style={styles.itemSub}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                </View>
                {w.description && renderBulletedParagraph(w.description)}
              </View>
            ))}
          </View>
        </View>

        {/* divider after work experience */}
        <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginVertical: 12 }} />

        {/* Education */}
        <View style={{ height: 12 }} />
        <View style={styles.grid}>
          <View style={styles.leftCol}>
            <Text style={styles.sectionHeading}>EDUCATION</Text>
          </View>
          <View style={styles.rightCol}>
            {education.higherEducationEnabled && education.higherEducation.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.itemTitle}>{edu.instituteName}</Text>
                <Text style={styles.itemSub}>{edu.degree} — {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</Text>
                {edu.resultFormat && edu.result && (
                  <Text style={{ fontSize: 10, color: '#444', marginTop: 4 }}>{edu.resultFormat}: {edu.result}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* divider before skills */}
        <View style={{ height: 1, backgroundColor: '#333', width: '100%', marginVertical: 12 }} />

        {/* Other sections */}
        <View style={{ height: 12 }} />
        <View style={styles.grid}>
          <View style={styles.leftCol}><Text style={styles.sectionHeading}>SKILLS</Text></View>
          <View style={styles.rightCol}><Text>{skillsLinks.skills.filter((s: any) => s.enabled && s.skillName).map((s: any) => s.skillName).join(', ')}</Text></View>
        </View>

        <View style={{ height: 8 }} />
        <View style={styles.grid}>
          <View style={styles.leftCol}><Text style={styles.sectionHeading}>CERTIFICATIONS</Text></View>
          <View style={styles.rightCol}><Text>{certifications.filter((c: any) => c.enabled && c.certificateTitle).map((c: any) => c.certificateTitle).join(', ')}</Text></View>
        </View>

      </Page>
    </Document>
  );
};

export default Template12PDF;