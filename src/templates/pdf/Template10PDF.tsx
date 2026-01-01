import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#222',
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    minHeight: '100%',
  },
  left: {
    width: '35%',
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#f5f5f5',
  },
  right: {
    width: '65%',
    padding: 36,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  nameContainer: {
    marginBottom: 20,
  },
  nameFirst: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  nameLast: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 12,
    color: '#666',
  },
  darkBox: {
    backgroundColor: '#444',
    padding: 10,
    marginBottom: 16,
    borderRadius: 12,
  },
  darkBoxLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  darkBoxText: {
    fontSize: 8,
    color: '#333',
    marginBottom: 5,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#444',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    backgroundColor: '#444',
    color: '#fff',
    padding: 8,
    marginBottom: 10,
    borderRadius: 12,
  },
  text: { fontSize: 8.5, color: '#555', marginBottom: 4 },
  heading: { fontSize: 9.5, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  subtext: { fontSize: 8, color: '#666' },
  rightSectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  rightHeading: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  workRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

interface Template10PDFProps { data: ResumeData }

const Template10PDF: React.FC<Template10PDFProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  const htmlToText = (s?: string) => {
    if (!s) return '';
    try {
      return String(s).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    } catch (e) { return s || ''; }
  };

  const sanitizeLine = (line?: string) => {
    if (!line) return '';
    try {
      return String(line).replace(/^\s*>+\s*/, '');
    } catch (e) {
      return line || '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Left Sidebar - Photo + Contact + Education + Skills */}
          <View style={styles.left}>
            {/* Photo */}
            {personal.profilePhotoUrl && (
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Image src={personal.profilePhotoUrl} style={styles.photo} />
              </View>
            )}

            {/* Contact heading pill */}
            <View style={styles.pill}>
              <Text style={styles.pillText}>Contact Me</Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              {personal.mobileNumber && <Text style={styles.darkBoxText}>📱  {personal.mobileNumber}</Text>}
              {personal.email && <Text style={styles.darkBoxText}>📧  {personal.email}</Text>}
              {/* {personal.websiteURL && <Text style={styles.darkBoxText}>🌐  {personal.websiteURL}</Text>} */}
              {personal.address && <Text style={styles.darkBoxText}>📍  {personal.address}</Text>}
            </View>

            {/* Education */}
            {education.higherEducationEnabled && education.higherEducation.length > 0 && (
              <View style={styles.section}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Education</Text>
                </View>
                {education.higherEducation.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 10 }}>
                    <Text style={styles.heading}>{edu.degree}</Text>
                    {edu.instituteName && <Text style={styles.subtext}>{edu.instituteName}</Text>}
                    <Text style={styles.subtext}>{edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}</Text>
                  </View>
                ))}
                {/* Pre University */}
                {education.preUniversityEnabled && education.preUniversity.instituteName && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.heading}>Pre University</Text>
                    <Text style={styles.subtext}>{education.preUniversity.instituteName}</Text>
                    <Text style={styles.subtext}>{education.preUniversity.yearOfPassing}</Text>
                  </View>
                )}

                {/* SSLC */}
                {education.sslcEnabled && education.sslc.instituteName && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.heading}>SSLC</Text>
                    <Text style={styles.subtext}>{education.sslc.instituteName}</Text>
                    <Text style={styles.subtext}>{education.sslc.yearOfPassing}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Skills */}
            {skillsLinks.skills.length > 0 && (
              <View style={styles.section}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Skills</Text>
                </View>
                {skillsLinks.skills.filter((s: any) => s.enabled && s.skillName).map((s: any, i: number) => (
                  <Text key={i} style={styles.text}>• {s.skillName}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Right Content - Name + Job Title + Work Experience + References */}
          <View style={styles.right}>
            {/* Name and Job Title */}
            <View style={styles.nameContainer}>
              <Text style={styles.nameFirst}>{personal.firstName || ''}</Text>
              <Text style={styles.nameLast}>{personal.lastName || ''}</Text>
              {experience.jobRole && <Text style={styles.jobTitle}>{experience.jobRole}</Text>}
            </View>

            {/* Work Experience */}
            {experience.workExperiences.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.rightSectionLabel}>WORK EXPERIENCE</Text>
                {experience.workExperiences.filter((w: any) => w.enabled).map((w: any, i: number) => (
                  <View key={i} style={{ marginBottom: 14 }}>
                    <View style={styles.workRow}>
                      <Text style={styles.rightHeading}>{w.jobTitle}</Text>
                      <Text style={styles.subtext}>{w.startDate} - {w.currentlyWorking ? 'Present' : w.endDate}</Text>
                    </View>
                    <Text style={{ fontSize: 9, color: '#555', marginBottom: 6 }}>{w.companyName}</Text>
                    {w.description && htmlToText(w.description).split('\n').map((ln, idx) => (
                      ln.trim() && <Text key={idx} style={{ fontSize: 8.5, color: '#666', marginBottom: 4 }}>• {ln.trim()}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

                {/* Projects - render heading together with first project and avoid page breaks inside project blocks */}
                {projects && projects.length > 0 && projects.some((p: any) => p.enabled && p.projectTitle) && (
                  <View>
                    {projects.filter((p: any) => p.enabled && p.projectTitle).map((p: any, i: number) => (
                      <View key={i} wrap={false} style={{ marginBottom: 12 }}>
                        {i === 0 && <Text style={[styles.rightSectionLabel, { marginBottom: 6 }]}>PROJECTS</Text>}
                        <View style={styles.workRow}>
                          <Text style={styles.rightHeading}>{p.projectTitle}</Text>
                          <Text style={styles.subtext}>{p.startDate} - {p.currentlyWorking ? 'Present' : p.endDate}</Text>
                        </View>
                        {p.description && htmlToText(p.description).split(/\n|\r\n/).map((ln, idx) => {
                          const clean = sanitizeLine(ln).trim();
                          return clean ? <Text key={idx} style={{ fontSize: 8.5, color: '#666', marginBottom: 4 }}>• {clean}</Text> : null;
                        })}
                        {p.rolesResponsibilities && (
                          <View style={{ marginTop: 6 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Roles & Responsibilities</Text>
                            {htmlToText(p.rolesResponsibilities).split(/\n|\r\n/).map((ln, idx) => {
                              const clean = sanitizeLine(ln).trim();
                              return clean ? <Text key={idx} style={{ fontSize: 8.5, color: '#666', marginBottom: 4 }}>• {clean}</Text> : null;
                            })}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

            {/* References / Certifications */}
            {certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.rightSectionLabel}>REFERENCES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                  {certifications.filter((c: any) => c.enabled && c.certificateTitle).map((c: any, i: number) => (
                    <View key={i} style={{ width: '48%' }}>
                      <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#222', marginBottom: 3 }}>{c.certificateTitle}</Text>
                      <Text style={{ fontSize: 8, color: '#666' }}>{c.certificateIssuingOrganization || 'Organization'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Template10PDF;
