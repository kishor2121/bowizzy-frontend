import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  headerName: { fontSize: 28, fontFamily: 'Times-Bold', color: '#6b2720' },
  headerRole: { fontSize: 14, fontStyle: 'italic', color: '#6b2720', marginTop: 6 },
  contactBox: { marginTop: 12, border: '1px solid #ddd6cf', padding: 8, flexDirection: 'row', gap: 8 },
  sectionTitle: { fontSize: 12, fontFamily: 'Times-Bold', color: '#6b2720', marginTop: 14, marginBottom: 8, letterSpacing: 2 },
  text: { fontSize: 10, color: '#333', lineHeight: 1.4 },
  smallMuted: { fontSize: 9, color: '#a84f3b' },
});

interface Template5PDFProps { data: ResumeData }

const Template5PDF: React.FC<Template5PDFProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  const htmlToText = (s?: string) => {
    if (!s) return '';
    try {
      return String(s)
        .replace(/<br\s*\/?/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();
    } catch (e) { return s || ''; }
  };

  // Insert zero-width spaces into very long tokens so PDF layout can wrap them
  const insertSoftBreaks = (t: string, maxLen = 40) => {
    if (!t) return '';
    // Add ZERO WIDTH SPACE (\u200B) after every maxLen consecutive non-space chars
    try {
      const re = new RegExp(`([^\\s]{${maxLen}})`, 'g');
      return t.replace(re, '$1\u200B');
    } catch (e) {
      return t;
    }
  };

  const fmt = (s?: string) => insertSoftBreaks(htmlToText(s));

  const sanitizeLine = (line: string) => {
    try {
      return String(line).replace(/^\s*>+\s*/, '');
    } catch (e) {
      return line;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.headerName}>{personal.firstName} {personal.lastName}</Text>
          <Text style={styles.headerRole}>{experience.jobRole}</Text>

          <View style={styles.contactBox}>
            {personal.email && <Text style={styles.text}>{personal.email}</Text>}
            {personal.mobileNumber && <Text style={styles.text}>{personal.mobileNumber}</Text>}
            {personal.address && <Text style={styles.text}>{personal.address.split(',')[0]}</Text>}
          </View>

          {personal.aboutCareerObjective ? (
            <View>
              <Text style={styles.sectionTitle}>SUMMARY</Text>
              <Text style={styles.text}>{htmlToText(personal.aboutCareerObjective)}</Text>
            </View>
          ) : null}

          {experience.workExperiences.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>EXPERIENCE</Text>
              {experience.workExperiences.filter(w => w.enabled).map((w, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '70%' }}>
                      <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{w.jobTitle}</Text>
                      <Text style={{ fontSize: 10, color: '#4a5568' }}>{w.companyName}</Text>
                    </View>
                    <View>
                      <Text style={styles.smallMuted}>{w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</Text>
                    </View>
                  </View>
                    {w.description && fmt(w.description).split(/\n|\r\n/).map((line, idx) => (
                      line.trim() ? <Text key={idx} style={styles.text}>• {line.trim()}</Text> : null
                    ))}
                </View>
              ))}
            </View>
          )}

          {projects && projects.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>PROJECTS</Text>
              {projects.filter(p => p.enabled && p.projectTitle).map((p, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{p.projectTitle}</Text>
                    <Text style={styles.smallMuted}>{p.startDate} - {p.currentlyWorking ? 'Present' : p.endDate}</Text>
                  </View>
                  {p.description && (
                    <View>
                      {fmt(p.description).split(/\n|\r\n/).map((line, idx) => {
                        const clean = sanitizeLine(line).trim();
                        return clean ? <Text key={idx} style={styles.text}>• {clean}</Text> : null;
                      })}
                    </View>
                  )}

                  {p.rolesResponsibilities && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Times-Bold' }}>Roles & Responsibilities:</Text>
                      {fmt(p.rolesResponsibilities).split(/\n|\r\n/).map((line, idx) => {
                        const clean = sanitizeLine(line).trim();
                        return clean ? <Text key={idx} style={styles.text}>• {clean}</Text> : null;
                      })}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {education.higherEducationEnabled && education.higherEducation.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>EDUCATION</Text>
              {education.higherEducation.map((edu, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{edu.instituteName}</Text>
                  <Text style={styles.text}>{edu.degree} • {edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</Text>
                </View>
              ))}
              {/* Pre University */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{education.preUniversity.instituteName}</Text>
                  <Text style={styles.text}>Pre University - {education.preUniversity.boardType} • {education.preUniversity.yearOfPassing}</Text>
                </View>
              )}

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{education.sslc.instituteName}</Text>
                  <Text style={styles.text}>SSLC - {education.sslc.boardType} • {education.sslc.yearOfPassing}</Text>
                </View>
              )}
            </View>
          )}

          {skillsLinks.skills.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>SKILLS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                  <Text key={i} style={{ fontSize: 10, color: '#4a5568', marginRight: 8 }}>{s.skillName}</Text>
                ))}
              </View>
            </View>
          )}

          {certifications.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
              {certifications.filter(c => c.enabled).map((c, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  {c.certificateTitle && <Text style={{ fontSize: 11, fontFamily: 'Times-Bold' }}>{c.certificateTitle}</Text>}
                  {(c as any).startDate && <Text style={styles.smallMuted}>{(c as any).startDate} - {(c as any).endDate}</Text>}
                  {c.description && <Text style={styles.text}>{htmlToText(c.description)}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default Template5PDF;
