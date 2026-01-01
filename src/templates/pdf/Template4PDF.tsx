import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 18,
    paddingRight: 18,
  },
  sidebar: {
    width: '78mm',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    padding: 14,
    boxSizing: 'border-box',
  },
  main: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 8,
    boxSizing: 'border-box',
  },
  name: { fontSize: 18, fontFamily: 'Times-Bold', color: '#ffffff' },
  jobTitle: { fontSize: 10, color: '#ffffff', marginTop: 6 },
  sectionTitle: { fontSize: 11, fontFamily: 'Times-Bold', color: '#2d3748', marginBottom: 6, letterSpacing: 1.5 },
  contactItem: { fontSize: 9, color: '#ffffff', marginBottom: 4 },
  text: { fontSize: 9, color: '#4a5568', lineHeight: 1.4 },
  leftList: { marginTop: 8, fontSize: 9, color: '#ffffff' },
});

interface Template4PDFProps {
  data: ResumeData;
}

const Template4PDF: React.FC<Template4PDFProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  const htmlToText = (s?: string) => {
    if (!s) return '';
    try {
      let t = String(s)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(div|p|li|section|h[1-6])>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\u00A0/g, ' ')
        .replace(/\n\s+\n/g, '\n')
        .trim();
      return t;
    } catch (e) {
      return s || '';
    }
  };

  const sanitizeLines = (s?: string) => {
    if (!s) return '';
    try {
      return String(s).replace(/^\s*>+\s*/gm, '').trim();
    } catch (e) {
      return s || '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{personal.firstName} {personal.lastName}</Text>
          <Text style={styles.jobTitle}>{experience.jobRole}</Text>

          <View style={{ marginTop: 10 }}>
            {personal.mobileNumber && <Text style={styles.contactItem}>{personal.mobileNumber}</Text>}
            {personal.email && <Text style={styles.contactItem}>{personal.email}</Text>}
            {personal.address && <Text style={styles.contactItem}>{personal.address}</Text>}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#ffffff', marginBottom: 6 }}>LANGUAGES</Text>
            {personal.languagesKnown && personal.languagesKnown.length > 0 ? (
              personal.languagesKnown.map((lang, idx) => (
                <Text key={idx} style={styles.leftList}>• {lang}</Text>
              ))
            ) : (
              <Text style={{ fontSize: 9, color: '#e6edf0' }}>No languages added</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#ffffff', marginBottom: 6 }}>CERTIFICATIONS</Text>
            {certifications && certifications.filter(c => c.enabled).length > 0 ? (
              certifications.filter(c => c.enabled).map((c, idx) => {
                const start = (c as any).startDate;
                const end = (c as any).endDate;
                const single = c.date;
                const dateRange = start && end ? `${start} - ${end}` : (single ? single : '');
                return (
                  <View key={idx} style={{ marginBottom: 6 }}>
                    {c.certificateTitle ? <Text style={{ fontSize: 9, fontFamily: 'Times-Bold', color: '#ffffff' }}>{c.certificateTitle}</Text> : null}
                    {dateRange ? <Text style={{ fontSize: 8, color: '#e6edf0' }}>{dateRange}</Text> : null}
                    {c.description ? <Text style={{ fontSize: 9, color: '#ffffff', marginTop: 4 }}>{htmlToText(c.description)}</Text> : null}
                  </View>
                );
              })
            ) : (
              <Text style={{ fontSize: 9, color: '#e6edf0' }}>No certifications added</Text>
            )}
          </View>
        </View>

        <View style={styles.main}>
          {/* Header: job role on its own line, contact items in a single formatted line */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Times-Bold', color: '#0f766e', marginBottom: 6 }}>{experience.jobRole}</Text>
            <Text style={{ fontSize: 9, color: '#4a5568', lineHeight: 1.4 }}>
              {personal.mobileNumber && <Text>Tel: {personal.mobileNumber}</Text>}
              {personal.mobileNumber && personal.email && <Text>     Email: </Text>}
              {personal.email && <Text>{personal.email}</Text>}
              {(personal.mobileNumber || personal.email) && (skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile) && <Text>     LinkedIn Profile</Text>}
              {(personal.mobileNumber || personal.email || (skillsLinks && skillsLinks.links && skillsLinks.links.linkedinProfile)) && personal.address && <Text>     {personal.address.split(',')[0]}</Text>}
            </Text>
          </View>

          {personal.aboutCareerObjective && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Times-Bold', color: '#2d3748', letterSpacing: 2 }}>SUMMARY</Text>
              <Text style={styles.text}>{htmlToText(personal.aboutCareerObjective)}</Text>
            </View>
          )}

          {experience.workExperiences.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>EXPERIENCE</Text>
              {experience.workExperiences.filter(w => w.enabled).map((w, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  {/* keep title+company together, allow description to flow */}
                  <View wrap={false}>
                    <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#2d3748' }}>{w.jobTitle}</Text>
                    <Text style={{ fontSize: 9, color: '#4a5568' }}>{w.companyName} • {w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</Text>
                  </View>
                  {w.description && <Text style={styles.text}>{htmlToText(w.description)}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Projects (render after EXPERIENCE; useful for freshers) */}
          {projects && projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>PROJECTS</Text>
              {projects.filter(p => p.enabled && p.projectTitle).map((project, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <View wrap={false}>
                    <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#2d3748' }}>{project.projectTitle}</Text>
                    <Text style={{ fontSize: 9, color: '#4a5568' }}>{project.startDate} - {project.currentlyWorking ? 'Present' : project.endDate}</Text>
                  </View>
                  {project.description && <Text style={styles.text}>{sanitizeLines(htmlToText(project.description))}</Text>}
                  {project.rolesResponsibilities && <Text style={styles.text}><Text style={{ fontFamily: 'Times-Bold' }}>Roles & Responsibilities: </Text>{sanitizeLines(htmlToText(project.rolesResponsibilities))}</Text>}
                </View>
              ))}
            </View>
          )}

          {education.higherEducationEnabled && education.higherEducation.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>EDUCATION</Text>
              {education.higherEducation.map((edu, idx) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#2d3748' }}>{edu.instituteName}</Text>
                  <Text style={{ fontSize: 9, color: '#4a5568' }}>{edu.degree} • {edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</Text>
                </View>
              ))}
              {/* Pre University */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#2d3748' }}>{education.preUniversity.instituteName}</Text>
                  <Text style={{ fontSize: 9, color: '#4a5568' }}>Pre University - {education.preUniversity.boardType} • {education.preUniversity.yearOfPassing}</Text>
                </View>
              )}

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', color: '#2d3748' }}>{education.sslc.instituteName}</Text>
                  <Text style={{ fontSize: 9, color: '#4a5568' }}>SSLC - {education.sslc.boardType} • {education.sslc.yearOfPassing}</Text>
                </View>
              )}
            </View>
          )}

          {skillsLinks.skills.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>SKILLS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((s, i) => (
                  <View key={i} style={{ borderWidth: 1, borderColor: '#e6edf0', paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4, borderRadius: 2, marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, color: '#4a5568' }}>{s.skillName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {certifications.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
              {certifications.filter(c => c.enabled && c.certificateTitle).map((c, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Times-Bold', color: '#2d3748' }}>{c.certificateTitle}</Text>
                  {c.providedBy && <Text style={{ fontSize: 8, color: '#4a5568' }}>{c.providedBy} {c.date && `• ${c.date}`}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default Template4PDF;
