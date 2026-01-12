import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Times-Roman', fontSize: 10 },
  header: { textAlign: 'center', marginBottom: 8 },
  name: { fontSize: 22, fontFamily: 'Times-Bold', color: '#000' },
  role: { fontSize: 11, color: '#6b7280', marginTop: 6, fontFamily: 'Times-Bold' },
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

interface Template18PDFProps { data: ResumeData }

const Template18PDF: React.FC<Template18PDFProps> = ({ data }) => {
  const { personal, experience, education, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';
  const contactLine = [personal.email, personal.mobileNumber, (skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) || ''].filter(Boolean).join(' | ');

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
                            <Text style={{ fontSize: 11, color: '#6b7280' }}>{sParts.month}{sParts.month ? ' ' : ''}</Text>
                            <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Times-Bold' }}>{sParts.year}</Text>
                          </>
                        );
                      })()}

                      <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Times-Bold' }}> {' '}-{' '}</Text>

                      {w.currentlyWorking ? (
                        <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Times-Bold' }}>Present</Text>
                      ) : (() => {
                        const eParts = formatMonthYearParts(w.endDate);
                        return (
                          <>
                            <Text style={{ fontSize: 11, color: '#6b7280' }}>{eParts.month}{eParts.month ? ' ' : ''}</Text>
                            <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Times-Bold' }}>{eParts.year}</Text>
                          </>
                        );
                      })()}
                    </View>
                  </View>
                  <Text style={{ marginTop: 6, color: '#444' }}>{w.companyName}{w.location ? ` — ${w.location}` : ''}</Text>
                  {w.description && (
                    <View style={{ marginTop: 6 }}>
                      {htmlToLines(w.description).map((ln:any, idx:number) => (
                        <View key={idx} style={{ flexDirection: 'row', marginBottom: 4 }}>
                          <Text style={{ width: 12 }}>•</Text>
                          <Text style={{ flex: 1, color: '#444' }}>{ln}</Text>
                        </View>
                      ))}
                    </View>
                  )}
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{edu.instituteName}</Text>
                    <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Times-Bold' }}>{edu.endYear ? `Graduated: ${formatYear(edu.endYear)}` : ''}</Text>
                  </View>
                  <Text style={{ marginTop: 6, color: '#6b7280' }}>{edu.degree}</Text>
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
