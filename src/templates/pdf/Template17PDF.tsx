import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { flexDirection: 'row', padding: 0, fontFamily: 'Times-Roman', fontSize: 10 },
  sidebar: { width: 220, backgroundColor: '#f3f4f6', padding: 18 },
  name: { fontSize: 20, fontFamily: 'Times-Bold', color: '#0f172a' },
  role: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  sectionHeading: { fontSize: 10, fontFamily: 'Times-Bold', letterSpacing: 1.2, textTransform: 'uppercase', color: '#111827' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 6, width: '100%' },
  content: { flex: 1, padding: 18, paddingLeft: 24 }
});

const htmlToPlainText = (html?: string) => {
  if (!html) return '';
  const sanitized = DOMPurify.sanitize(html || '');
  const withBreaks = sanitized.replace(/<br\s*\/?/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n');
  const decoded = withBreaks.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  try {
    if (typeof document !== 'undefined') {
      const tmp = document.createElement('div');
      tmp.innerHTML = decoded;
      return (tmp.textContent || tmp.innerText || '').trim();
    }
  } catch (e) { }
  return decoded.replace(/<[^>]+>/g, '').trim();
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

const formatYear = (s?: string) => {
  if (!s) return '';
  const str = String(s).trim();
  const y = str.match(/(\d{4})/);
  return y ? y[1] : str;
};

interface Template17PDFProps { data: ResumeData }

const Template17PDF: React.FC<Template17PDFProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</Text>
          {role && <Text style={styles.role}>{role}</Text>}

          <View style={{ marginTop: 12 }}>
            {personal.email && <Text style={{ fontSize: 10, color: '#374151' }}>{personal.email}</Text>}
            {personal.mobileNumber && <Text style={{ fontSize: 10, color: '#374151', marginTop: 6 }}>{personal.mobileNumber}</Text>}
            {personal.address && <Text style={{ fontSize: 10, color: '#374151', marginTop: 6 }}>{String(personal.address).split(',')[0]}</Text>}
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeading}>Skills</Text>
            <View style={styles.divider} />
            { (skillsLinks.skills || []).filter((s:any)=>s.enabled && s.skillName).slice(0,6).map((s:any,i:number)=>(<Text key={i} style={{ marginTop: 6, fontSize: 10, color: '#374151' }}>• {s.skillName}</Text>)) }
          </View>

          <View style={{ marginTop: 14 }}>
            <Text style={styles.sectionHeading}>Languages</Text>
            <View style={styles.divider} />
            {(((personal as any).languagesKnown || (personal as any).languages || [])).map((l:string,i:number)=>(<Text key={i} style={{ marginTop: 6, fontSize: 10, color: '#374151' }}>• {l}</Text>))}
          </View>

        </View>

        <View style={styles.content}>
          <View>
            <Text style={styles.sectionHeading}>Summary</Text>
            <View style={{ height: 1, backgroundColor: '#ddd', marginTop: 6, width: '100%' }} />
            {personal.aboutCareerObjective ? <Text style={{ marginTop: 8, color: '#444' }}>{htmlToPlainText(personal.aboutCareerObjective)}</Text> : null}
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeading}>Experience</Text>
            <View style={{ height: 1, backgroundColor: '#ddd', marginTop: 6, width: '100%' }} />
            <View style={{ marginTop: 8 }}>
              {experience.workExperiences.filter((w:any)=>w.enabled).map((w:any,i:number)=>(
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{w.jobTitle}</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280' }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                  </View>
                  <Text style={{ marginTop: 6, color: '#444' }}>{w.companyName}{w.location ? ` — ${w.location}` : ''}</Text>
                  {w.description && <Text style={{ marginTop: 6, color: '#444' }}>{htmlToPlainText(w.description)}</Text>}
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeading}>Education</Text>
            <View style={{ height: 1, backgroundColor: '#ddd', marginTop: 6, width: '100%' }} />
            <View style={{ marginTop: 8 }}>
              {education.higherEducationEnabled && education.higherEducation.slice().map((edu:any, i:number) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{edu.instituteName}</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280' }}>{formatYear(edu.endYear)}</Text>
                  </View>
                  <Text style={{ marginTop: 6, color: '#6b7280' }}>{edu.degree}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeading}>Achievements</Text>
            <View style={{ height: 1, backgroundColor: '#ddd', marginTop: 6, width: '100%' }} />
            <View style={{ marginTop: 8 }}>{(certifications || []).filter((c:any)=>c.enabled && c.certificateTitle).map((c:any,i:number)=>(<Text key={i} style={{ marginBottom: 6 }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</Text>))}</View>
          </View>

        </View>
      </Page>
    </Document>
  );
};

export default Template17PDF;
