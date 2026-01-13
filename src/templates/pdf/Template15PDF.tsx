import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 24, paddingLeft: 36, paddingRight: 36, fontSize: 10, fontFamily: 'Times-Roman' },
  header: { textAlign: 'center', marginBottom: 6 },
  name: { fontSize: 28, fontFamily: 'Times-Bold', color: '#0b60d6', marginBottom: 4 },
  role: { fontSize: 12, color: '#08306b', marginTop: 2, fontFamily: 'Times-Roman' },
  contact: { fontSize: 10, color: '#6b7280' },
  divider: { height: 1, backgroundColor: '#ddd', marginTop: 12, marginBottom: 0, width: '100%' },
  sectionHeading: { fontSize: 11, fontFamily: 'Times-Bold', letterSpacing: 1.2, textTransform: 'uppercase', color: '#08306b' },
  itemTitle: { fontSize: 12, fontFamily: 'Times-Bold' },
  itemSub: { fontSize: 11, color: '#111827', fontFamily: 'Times-Bold' },
  bullet: { fontSize: 10, color: '#444', marginTop: 4 },
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
  } catch (e) { /* ignore */ }
  return decoded.replace(/<[^>]+>/g, '').trim();
};

const renderBulletedParagraph = (html?: string) => {
  if (!html) return null;
  const text = htmlToPlainText(html);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <View style={{ marginTop: 4 }}>
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

interface Template15PDFProps { data: ResumeData }

const Template15PDF: React.FC<Template15PDFProps> = ({ data }) => {
  const { personal, experience, education, projects, skillsLinks, certifications } = data;
  const role = (experience && (experience as any).jobRole) || (experience.workExperiences && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle) && experience.workExperiences.find((w: any) => w.enabled && w.jobTitle).jobTitle) || '';

  const mobile = personal.mobileNumber;
  const email = personal.email;
  const linkedinPresent = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.linkedinProfile) || (personal as any).linkedinProfile;
  const githubPresent = (skillsLinks && (skillsLinks as any).links && (skillsLinks as any).links.githubProfile) || (personal as any).githubProfile;

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

  const linkedinLabel = linkedinPresent ? extractHandle(linkedinPresent) : null;
  const githubLabel = githubPresent ? extractHandle(githubPresent) : null;
  const pdfContactLine = [mobile, email, linkedinLabel, githubLabel].filter(Boolean).join(' | ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personal.firstName} {(personal.middleName || '')} {personal.lastName}</Text>
          {role && <Text style={styles.role}>{role}</Text>}
          <Text style={styles.contact}>{pdfContactLine}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>OBJECTIVE</Text>
          <View style={{ height: 1, backgroundColor: '#ddd', width: '100%', marginTop: 4, marginBottom: 0 }} />
        </View>
        {personal.aboutCareerObjective ? <Text style={{ fontSize: 10, color: '#444', marginTop: 6 }}>{htmlToPlainText(personal.aboutCareerObjective)}</Text> : null}

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>EDUCATION</Text>
          <View style={{ height: 1, backgroundColor: '#ddd', width: '100%', marginTop: 4, marginBottom: 0 }} />
        </View>

        <View style={{ marginTop: 8 }}>
          {education.higherEducationEnabled && education.higherEducation.slice().map((edu: any, i: number) => (
            <View key={`he-${i}`} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.itemTitle}>{edu.instituteName}</Text>
                <Text style={{ fontSize: 11, color: '#121314ff', fontFamily: 'Times-Bold' }}>{formatMonthYear(edu.startYear)} — {edu.currentlyPursuing ? 'Present' : formatMonthYear(edu.endYear)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 10, color: '#444' }}>{edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}</Text>
                {edu.resultFormat && edu.result ? (
                  <Text style={{ fontSize: 10, color: '#111' }}>{edu.resultFormat}: {edu.result}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>SKILLS</Text>
          <View style={{ height: 1, backgroundColor: '#ddd', width: '100%', marginTop: 4, marginBottom: 0 }} />
        </View>
        <View style={{ marginTop: 6 }}>
          {(() => {
            const skills = (skillsLinks.skills || []).filter((s: any) => s.enabled && s.skillName).map((s: any) => s.skillName);
            const categories: Record<string, string[]> = {
              'Programming Languages': [],
              'Web Development': [],
              'Databases': [],
              'Tools': [],
              'Others': [],
            };
            const langRegex = /(python|java|c\+\+|c#|javascript|typescript|ruby|go|php)/i;
            const webRegex = /(html|css|javascript|react|angular|vue|next|node|express)/i;
            const dbRegex = /(mysql|mongodb|postgres|postgresql|redis|sql)/i;
            const toolsRegex = /(git|docker|jenkins|kubernetes|aws|gcp|azure|terraform|ci|cd)/i;

            skills.forEach(sk => {
              if (langRegex.test(sk)) categories['Programming Languages'].push(sk);
              else if (webRegex.test(sk)) categories['Web Development'].push(sk);
              else if (dbRegex.test(sk)) categories['Databases'].push(sk);
              else if (toolsRegex.test(sk)) categories['Tools'].push(sk);
              else categories['Others'].push(sk);
            });

            return Object.entries(categories).map(([cat, items]) => items.length ? (
              <View key={cat} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#0b60d6' }}>{cat}</Text>
                <Text style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{items.join(', ')}</Text>
              </View>
            ) : null);
          })()}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>CERTIFICATIONS</Text>
          <View style={{ height: 1, backgroundColor: '#ddd', width: '100%', marginTop: 4, marginBottom: 0 }} />
        </View>
        <View style={{ marginTop: 6 }}>
          {(certifications || []).filter((c: any) => c.enabled && c.certificateTitle).map((c: any, i: number) => (
            <Text key={i} style={{ fontSize: 10, color: '#444', marginBottom: 4 }}>{c.certificateTitle}{c.providedBy ? ` — ${c.providedBy}` : ''}</Text>
          ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>INTERNSHIPS</Text>
          <View style={{ height: 1, backgroundColor: '#ddd', width: '100%', marginTop: 4, marginBottom: 0 }} />
        </View>

        <View style={{ marginTop: 8 }}>
          {experience.workExperiences.filter((w: any) => w.enabled).map((w: any, i: number) => (
            <View key={i} style={{ marginBottom: 8 }}>
              {w.jobTitle ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Times-Bold', color: '#08306b' }}>{w.jobTitle}</Text>
                    <Text style={styles.itemSub}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: '#444', fontFamily: 'Times-Bold' }}>{w.companyName}</Text>
                    <Text style={{ fontSize: 10, color: '#111827' }}>{w.location}</Text>
                  </View>
                </>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.itemTitle}>{w.companyName}{w.location ? `, ${w.location}` : ''}</Text>
                  <Text style={styles.itemSub}>{formatMonthYear(w.startDate)} — {w.currentlyWorking ? 'Present' : formatMonthYear(w.endDate)}</Text>
                </View>
              )}

              {w.description && renderBulletedParagraph(w.description)}
            </View>
          ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>ACADEMIC PROJECTS</Text>
          <View style={{ height: 1, backgroundColor: '#ddd', width: '100%', marginTop: 4, marginBottom: 0 }} />
        </View>
        <View style={{ marginTop: 8 }}>
          {projects.filter((p: any) => p.enabled).map((p: any, i: number) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.itemTitle}>{p.projectTitle}</Text>
                <Text style={styles.itemSub}>{formatMonthYear(p.startDate)} — {p.currentlyWorking ? 'Present' : formatMonthYear(p.endDate)}</Text>
              </View>
              {p.description && renderBulletedParagraph(p.description)}
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
};

export default Template15PDF;