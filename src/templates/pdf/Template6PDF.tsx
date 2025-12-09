import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 26, fontWeight: 'bold' },
  role: { fontSize: 12, fontStyle: 'italic', marginTop: 6 },
  contact: { fontSize: 10, marginTop: 8, textAlign: 'right' },
  pillTitle: { backgroundColor: '#e6e6e6', padding: 6, borderRadius: 12, width: 'auto' },
  pillTitleText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginTop: 10 },
  text: { fontSize: 10, lineHeight: 1.4, color: '#222' },
  smallMuted: { fontSize: 9, color: '#666' },
  twoColumn: { flexDirection: 'row', gap: 10 },
  columnLeft: { flex: 1 },
  columnRight: { width: 160 },
});

interface Template6PDFProps { data: ResumeData }

const Template6PDF: React.FC<Template6PDFProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  const htmlToText = (s?: string) => {
    if (!s) return '';
    try {
      return String(s).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
    } catch (e) { return s || ''; }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>{personal.firstName} {personal.lastName}</Text>
              {experience.jobRole && <Text style={styles.role}>{experience.jobRole}</Text>}
            </View>
            <View style={{ textAlign: 'right' }}>
              {personal.email && <Text style={styles.contact}>{personal.email}</Text>}
              {personal.mobileNumber && <Text style={styles.contact}>{personal.mobileNumber}</Text>}
              {personal.address && <Text style={styles.contact}>{personal.address.split(',')[0]}</Text>}
            </View>
          </View>

          {personal.aboutCareerObjective ? (
            <View style={styles.section}>
              <View style={styles.pillTitle}><Text style={styles.pillTitleText}>Summary</Text></View>
              <Text style={[styles.text, { marginTop: 6 }]}>{htmlToText(personal.aboutCareerObjective)}</Text>
            </View>
          ) : null}

          {skillsLinks.skills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.pillTitle}><Text style={styles.pillTitleText}>Technical Skills</Text></View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                  <Text key={i} style={{ marginRight: 8, fontSize: 10 }}>{s.skillName}</Text>
                ))}
              </View>
            </View>
          )}

          {experience.workExperiences.length > 0 && (
            <View style={styles.section}>
              <View style={styles.pillTitle}><Text style={styles.pillTitleText}>Professional Experience</Text></View>
              <View style={{ marginTop: 6 }}>
                {experience.workExperiences.filter(w => w.enabled).map((w, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ width: '70%' }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{w.jobTitle}</Text>
                        <Text style={styles.smallMuted}>{w.companyName}</Text>
                      </View>
                      <View>
                        <Text style={styles.smallMuted}>{w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</Text>
                      </View>
                    </View>
                    {w.description && htmlToText(w.description).split(/\n|\r\n/).map((line, idx) => (
                      <Text key={idx} style={styles.text}>• {line}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}

          {education.higherEducationEnabled && education.higherEducation.length > 0 && (
            <View style={styles.section}>
              <View style={styles.pillTitle}><Text style={styles.pillTitleText}>Education</Text></View>
              <View style={{ marginTop: 6 }}>
                {education.higherEducation.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{edu.instituteName}</Text>
                    <Text style={styles.text}>{edu.degree} • {edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {certifications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.pillTitle}><Text style={styles.pillTitleText}>Additional Information</Text></View>
              <View style={{ marginTop: 6 }}>
                {personal.languages && <Text style={styles.text}>Languages: {personal.languages}</Text>}
                {certifications.filter(c => c.enabled).map((c, i) => (
                  <View key={i} style={{ marginTop: 4 }}>
                    {c.certificateTitle && <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{c.certificateTitle}</Text>}
                    {(c as any).startDate && <Text style={styles.smallMuted}>{(c as any).startDate} - {(c as any).endDate}</Text>}
                    {c.description && <Text style={styles.text}>{htmlToText(c.description)}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default Template6PDF;
