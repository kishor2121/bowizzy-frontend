import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Times-Roman', fontSize: 10 },
  header: { textAlign: 'center', marginBottom: 8 },
  name: { fontSize: 22, fontFamily: 'Times-Bold', color: '#000' },
  role: { fontSize: 11, color: '#000', marginTop: 6, fontFamily: 'Times-Bold' },
  contact: { fontSize: 10, color: '#374151', marginTop: 6 },
  sectionHeading: { fontSize: 10, fontFamily: 'Times-Bold', letterSpacing: 1.2, textTransform: 'uppercase', color: '#111827' },
  divider: { height: 1, backgroundColor: '#ddd', marginTop: 6, width: '100%' },
  section: { marginTop: 12 }
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

const htmlToLines = (html?: string) => {
  const plain = htmlToPlainText(html);
  if (!plain) return [] as string[];
  return plain.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
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

const formatMonthYearParts = (s?: string) => {
  if (!s) return { month: '', year: '' };
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  try {
    const str = String(s).trim();
    const ymd = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (ymd) return { month: months[parseInt(ymd[2],10)-1], year: ymd[1] };
    const mY = str.match(/^(\d{2})\/(\d{4})$/);
    if (mY) return { month: months[parseInt(mY[1],10)-1], year: mY[2] };
  } catch (e) {}
  const yearMatch = String(s).match(/(\d{4})/);
  if (yearMatch) {
    return { month: String(s).replace(yearMatch[1], '').trim(), year: yearMatch[1] };
  }
  return { month: String(s), year: '' };
};

const formatYear = (s?: string) => {
  if (!s) return '';
  const str = String(s).trim();
  const y = str.match(/(\d{4})/);
  return y ? y[1] : str;
};

const renderBulletedParagraph = (html?: string) => {
  if (!html) return null;
  const sanitized = DOMPurify.sanitize(html || '');
  let text = sanitized
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
  
  const lines = text.split('\n').filter((l) => l.trim());
  
  return (
    <View style={{ marginTop: 6 }}>
      {lines.map((line, idx) => (
        <View key={idx} style={{ flexDirection: 'row', marginTop: idx > 0 ? 2 : 0 }}>
          <Text style={{ width: 12, flexShrink: 0, color: '#444', fontSize: 10 }}>
            {line.startsWith('•') ? '•' : ''}
          </Text>
          <Text style={{ flex: 1, color: '#444', fontSize: 10 }}>
            {line.startsWith('•') ? line.substring(1).trim() : line}
          </Text>
        </View>
      ))}
    </View>
  );
};

interface Template18PDFProps { data: ResumeData }

const Template18PDF: React.FC<Template18PDFProps> = ({ data }) => {
  const { personal, experience, education, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';

  const extractHandle = (s?: string) => {
    if (!s) return '';
    try {
      if (/^https?:\/\//i.test(s)) {
        const u = new URL(s);
        const path = u.pathname.replace(/\/+$|^\//g, '');
        if (!path) return u.hostname;
        const parts = path.split('/');
        return parts[parts.length - 1];
      }
    } catch (e) { }
    return s;
  };

  const formatMobile = (m?: string) => {
    if (!m) return '';
    const trimmed = String(m).trim();
    if (/^\+/.test(trimmed)) return trimmed;
    if ((personal.country || '').toLowerCase() === 'india') return `+91 ${trimmed}`;
    return trimmed;
  };

  const locationPart = personal.city || (personal.address && String(personal.address).split(',')[0]) || '';
  const locNat = [locationPart, personal.nationality].filter(Boolean).join(', ');
  const linkedinLabel = extractHandle((skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) || (personal as any).linkedinProfile);
  const contactLine = [locNat, personal.email, formatMobile(personal.mobileNumber), linkedinLabel].filter(Boolean).join(' | ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</Text>
          {role && <Text style={styles.role}>{role}</Text>}
          {contactLine && <Text style={styles.contact}>{contactLine}</Text>}
        </View>

        <View>
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <View style={styles.divider} />
            {personal.aboutCareerObjective ? <Text style={{ marginTop: 6, color: '#444' }}>{htmlToPlainText(personal.aboutCareerObjective)}</Text> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Work Experience</Text>
            <View style={styles.divider} />
            <View style={{ marginTop: 8 }}>
              {experience.workExperiences.filter((w:any)=>w.enabled).map((w:any,i:number)=> (
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{w.jobTitle}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {(() => {
                        const sParts = formatMonthYearParts(w.startDate);
                        return (
                          <>
                            <Text style={{ fontSize: 11, color: '#000' }}>{sParts.month}{sParts.month ? ' ' : ''}</Text>
                            <Text style={{ fontSize: 11, color: '#000' }}>{sParts.year}</Text>
                          </>
                        );
                      })()}

                      <Text style={{ fontSize: 11, color: '#000' }}> {' '}-{' '}</Text>

                      {w.currentlyWorking ? (
                        <Text style={{ fontSize: 11, color: '#000' }}>Present</Text>
                      ) : (() => {
                        const eParts = formatMonthYearParts(w.endDate);
                        return (
                          <>
                            <Text style={{ fontSize: 11, color: '#000' }}>{eParts.month}{eParts.month ? ' ' : ''}</Text>
                            <Text style={{ fontSize: 11, color: '#000' }}>{eParts.year}</Text>
                          </>
                        );
                      })()}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={{ fontSize: 11, color: '#000' }}>{w.companyName}</Text>
                    <Text style={{ fontSize: 11, color: '#000' }}>{w.location}</Text>
                  </View>
                  {w.description && renderBulletedParagraph(w.description)}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Education</Text>
            <View style={styles.divider} />
            <View style={{ marginTop: 8 }}>
              {education.higherEducationEnabled && education.higherEducation.slice().map((edu:any,i:number)=>(
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={{ marginTop: 6, color: '#000', fontFamily: 'Times-Bold' }}>{edu.degree}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: '#000' }}>{edu.instituteName}</Text>
                  <Text style={{ fontSize: 11, color: '#000' }}>{edu.endYear ? `Graduated: ${formatYear(edu.endYear)}` : ''}</Text>
                </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Skills</Text>
            <View style={styles.divider} />
            <View style={{ marginTop: 8 }}>
              {(skillsLinks.skills || []).filter((s:any)=>s.enabled && s.skillName).map((s:any,i:number)=>(
                <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
                  <Text style={{ width: 12 }}>•</Text>
                  <Text style={{ flex: 1, color: '#444' }}>{s.skillName}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Certifications</Text>
            <View style={styles.divider} />
            <View style={{ marginTop: 8 }}>
              {(certifications || []).filter((c:any)=>c.enabled && c.certificateTitle).map((c:any,i:number)=>(
                <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
                  <Text style={{ width: 12 }}>•</Text>
                  <Text style={{ flex: 1, color: '#444' }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</Text>
                </View>
              ))}
            </View>
          </View>


        </View>
      </Page>
    </Document>
  );
};

export default Template18PDF;
