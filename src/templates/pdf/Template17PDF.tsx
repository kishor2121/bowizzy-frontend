import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { flexDirection: 'row', padding: 0, fontFamily: 'Times-Roman', fontSize: 10 },
  sidebar: { width: 220, backgroundColor: '#f3f4f6', padding: 18 },
  name: { fontSize: 20, fontFamily: 'Times-Bold', color: '#0f172a' },
  role: { fontSize: 11, color: '#000', marginTop: 6, fontFamily: 'Times-Bold' },
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

const IconEmail = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="#374151" strokeWidth="1.5" />
    <Path d="M20 6l-8 5-8-5" stroke="#374151" strokeWidth="1.5" fill="none" />
  </Svg>
);

const IconPhone = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
    <Path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 3.5A1 1 0 013 2.5H6.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.01l-2.2 2.2z" fill="none" stroke="#374151" strokeWidth="1.5" />
  </Svg>
);

const IconLocation = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" fill="none" stroke="#374151" strokeWidth="1.5" />
  </Svg>
);

const StarIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#374151" />
  </Svg>
);

const getSkillStars = (level?: string) => {
  const normalizedLevel = String(level || '').toLowerCase().trim();
  switch (normalizedLevel) {
    case 'beginner': return '*';
    case 'intermediate': return '**';
    case 'advanced': return '****';
    case 'expert': return '*****';
    default: return '';
  }
};

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
            <Text style={{ fontSize: 11, fontFamily: 'Times-Bold', letterSpacing: 1, color: '#000', marginBottom: 6 }}>DETAILS</Text>
            <View style={{ height: 1, backgroundColor: '#999', marginBottom: 8 }} />
            {personal.email && <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}><IconEmail /><Text style={{ fontSize: 10, color: '#000' }}>{personal.email}</Text></View>}
            {personal.mobileNumber && <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}><IconPhone /><Text style={{ fontSize: 10, color: '#000' }}>{personal.mobileNumber}</Text></View>}
            {personal.address && <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}><IconLocation /><Text style={{ fontSize: 10, color: '#000' }}>{String(personal.address).split(',')[0]}</Text></View>}
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeading}>Skills</Text>
            <View style={{ ...styles.divider, backgroundColor: '#999' }} />
            { (skillsLinks.skills || []).filter((s:any)=>s.enabled && s.skillName).slice(0,6).map((s:any,i:number)=>(<View key={i} style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 10, color: '#000', flex: 1 }}>• {s.skillName}</Text><Text style={{ fontSize: 10, color: '#000' }}>{getSkillStars(s.skillLevel)}</Text></View>)) }
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeading}>Languages</Text>
            <View style={{ ...styles.divider, backgroundColor: '#999' }} />
            {(((personal as any).languagesKnown || (personal as any).languages || [])).map((l:string,i:number)=>(<Text key={i} style={{ marginTop: 6, fontSize: 10, color: '#000' }}>• {l}</Text>))}
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
                    <Text style={{ fontSize: 10, color: '#000' }}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                  </View>
                  <Text style={{ marginTop: 6, color: '#000' }}>{w.companyName}{w.location ? ` — ${w.location}` : ''}</Text>
                  {w.description && <View style={{ marginTop: 6, paddingLeft: 10 }}>{htmlToPlainText(w.description).split('\n').filter(Boolean).map((line, idx) => <Text key={idx} style={{ fontSize: 10, color: '#444', marginTop: 6 }}>• {line}</Text>)}</View>}
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
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</Text>
                    <Text style={{ fontSize: 10, color: '#000' }}>{formatYear(edu.endYear)}</Text>
                  </View>
                  <Text style={{ marginTop: 6, color: '#000' }}>{edu.instituteName}</Text>
                  {edu.resultFormat && edu.result ? (
                    <Text style={{ fontSize: 10, color: '#444', fontFamily: 'Times-Bold', marginTop: 4 }}>{edu.resultFormat}: {edu.result}</Text>
                  ) : null}
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
