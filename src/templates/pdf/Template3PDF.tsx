import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Left Sidebar with diagonal blue background effect
  leftSidebarContainer: {
    width: '35%',
    backgroundColor: '#E8E8E8',
    position: 'relative',
  },
  diagonalBlue: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '150px',
    backgroundColor: '#5B8FB9',
  },
  leftSidebarContent: {
    position: 'relative',
    zIndex: 1,
    padding: '45px 30px',
  },
  profilePhotoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 35,
    overflow: 'hidden',
    border: '6px solid #ffffff',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  nameSection: {
    textAlign: 'center',
    marginBottom: 40,
  },
  firstName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#5B8FB9',
    marginBottom: 0,
  },
  lastName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#5B8FB9',
    marginBottom: 0,
  },
  jobTitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 10,
  },
  sidebarSection: {
    marginBottom: 28,
  },
  sidebarSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sidebarIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  sidebarTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
    color: '#4a4a4a',
  },
  sidebarDivider: {
    borderTopWidth: 1,
    borderTopColor: '#d0d0d0',
    marginTop: 0,
    paddingTop: 12,
  },
  sidebarContent: {
    paddingLeft: 0,
    fontSize: 9,
    lineHeight: 1.5,
    color: '#4a4a4a',
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 9,
    alignItems: 'flex-start',
  },
  contactIcon: {
    marginRight: 7,
    fontSize: 10,
    minWidth: 14,
    color: '#5B8FB9',
  },
  skillItem: {
    flexDirection: 'row',
    marginBottom: 7,
    alignItems: 'flex-start',
  },
  skillBullet: {
    marginRight: 7,
  },
  aboutText: {
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  // Right Content (White)
  rightContent: {
    width: '65%',
    backgroundColor: '#ffffff',
    color: '#555555',
    padding: '45px 40px 45px 35px',
  },
  contentSection: {
    marginBottom: 30,
  },
  contentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  contentIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  contentTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
    color: '#4a4a4a',
  },
  itemContainer: {
    marginBottom: 18,
    marginLeft: 0,
  },
  itemWithBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  blueBullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#5B8FB9',
    marginTop: 4,
    marginRight: 10,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 3,
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#777777',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  itemDate: {
    fontSize: 9,
    color: '#999999',
    marginBottom: 0,
  },
  itemDescription: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.6,
    marginTop: 9,
    textAlign: 'justify',
  },
  itemResult: {
    fontSize: 9,
    color: '#666666',
    marginTop: 5,
  },
  // References Section
  referencesGrid: {
    flexDirection: 'row',
    gap: 22,
    marginLeft: 0,
  },
  referenceItem: {
    flex: 1,
  },
  referenceName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 3,
  },
  referenceTitle: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  referenceContact: {
    fontSize: 8,
    color: '#999999',
    marginBottom: 2,
  },
});

interface Template3PDFProps {
  data: ResumeData;
}

export const Template3PDF: React.FC<Template3PDFProps> = ({ data }) => {
  const { personal, education, experience, projects, skillsLinks, certifications } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Sidebar with Diagonal Background */}
        <View style={styles.leftSidebarContainer}>
          {/* Diagonal Blue Background - Note: PDF doesn't support CSS gradients, 
              so we use a solid color block. For true diagonal effect, 
              you'd need to use SVG or image overlay */}
          <View style={styles.diagonalBlue} />
          
          {/* Sidebar Content */}
          <View style={styles.leftSidebarContent}>
            {/* Profile Photo */}
            <View style={styles.profilePhotoContainer}>
              {personal.profilePhotoUrl ? (
                <Image src={personal.profilePhotoUrl} style={styles.profilePhoto} />
              ) : (
                <View style={{ width: '100%', height: '100%', backgroundColor: '#e0e0e0' }} />
              )}
            </View>

            {/* Name */}
            <View style={styles.nameSection}>
              <Text style={styles.firstName}>{personal.firstName}</Text>
              <Text style={styles.lastName}>{personal.lastName}</Text>
              <Text style={styles.jobTitle}>{experience.jobRole || 'Backend Developer'}</Text>
            </View>

            {/* Contact */}
            <View style={styles.sidebarSection}>
              <View style={styles.sidebarSectionHeader}>
                <Text style={styles.sidebarIcon}>📞</Text>
                <Text style={styles.sidebarTitle}>Contact</Text>
              </View>
              <View style={[styles.sidebarContent, styles.sidebarDivider]}>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📞</Text>
                  <Text>{personal.mobileNumber || '09632587410'}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>@</Text>
                  <Text>{personal.email || 'nishanth@gmail.com'}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📍</Text>
                  <Text>{personal.city || 'Bengaluru'}</Text>
                </View>
              </View>
            </View>

            {/* About Me */}
            {personal.aboutCareerObjective && (
              <View style={styles.sidebarSection}>
                <View style={styles.sidebarSectionHeader}>
                  <Text style={styles.sidebarIcon}>👤</Text>
                  <Text style={styles.sidebarTitle}>About Me</Text>
                </View>
                <View style={[styles.sidebarContent, styles.sidebarDivider]}>
                  <Text style={styles.aboutText}>{personal.aboutCareerObjective}</Text>
                </View>
              </View>
            )}

            {/* Skills */}
            {skillsLinks.skills.length > 0 && skillsLinks.skills.some(s => s.enabled && s.skillName) && (
              <View style={styles.sidebarSection}>
                <View style={styles.sidebarSectionHeader}>
                  <Text style={styles.sidebarIcon}>🧩</Text>
                  <Text style={styles.sidebarTitle}>Skills</Text>
                </View>
                <View style={[styles.sidebarContent, styles.sidebarDivider]}>
                  {skillsLinks.skills.filter(s => s.enabled && s.skillName).map((skill, idx) => (
                    <View key={idx} style={styles.skillItem}>
                      <Text style={styles.skillBullet}>•</Text>
                      <Text>{skill.skillName}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Right Content - White */}
        <View style={styles.rightContent}>
          {/* Education */}
          {education.higherEducationEnabled && education.higherEducation.length > 0 && (
            <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Text style={styles.contentIcon}>🎓</Text>
                <Text style={styles.contentTitle}>Education</Text>
              </View>
              
              {/* Higher Education */}
              {education.higherEducation.map((edu, idx) => (
                <View key={idx} style={styles.itemContainer}>
                  <View style={styles.itemWithBullet}>
                    <View style={styles.blueBullet} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>
                        {edu.degree || 'Bachelor of Business Management'}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        {edu.instituteName || 'Borcelle University'}
                      </Text>
                      <Text style={styles.itemDate}>
                        {edu.startYear} - {edu.currentlyPursuing ? 'Present' : edu.endYear}
                      </Text>
                      {edu.resultFormat && edu.result && (
                        <Text style={styles.itemResult}>
                          {edu.resultFormat}: {edu.result}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              {/* SSLC */}
              {education.sslcEnabled && education.sslc.instituteName && (
                <View style={styles.itemContainer}>
                  <View style={styles.itemWithBullet}>
                    <View style={styles.blueBullet} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>SSLC</Text>
                      <Text style={styles.itemSubtitle}>{education.sslc.instituteName}</Text>
                      <Text style={styles.itemDate}>{education.sslc.yearOfPassing}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Pre-University */}
              {education.preUniversityEnabled && education.preUniversity.instituteName && (
                <View style={styles.itemContainer}>
                  <View style={styles.itemWithBullet}>
                    <View style={styles.blueBullet} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{education.preUniversity.subjectStream}</Text>
                      <Text style={styles.itemSubtitle}>{education.preUniversity.instituteName}</Text>
                      <Text style={styles.itemDate}>{education.preUniversity.yearOfPassing}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Experience */}
          {experience.workExperiences.length > 0 && experience.workExperiences.some(exp => exp.enabled) && (
            <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Text style={styles.contentIcon}>💼</Text>
                <Text style={styles.contentTitle}>Experience</Text>
              </View>
              {experience.workExperiences.filter(exp => exp.enabled).map((exp, idx) => (
                <View key={idx} style={styles.itemContainer}>
                  <View style={styles.itemWithBullet}>
                    <View style={styles.blueBullet} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{exp.jobTitle}</Text>
                      <Text style={styles.itemSubtitle}>{exp.companyName}</Text>
                      <Text style={styles.itemDate}>
                        {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                      </Text>
                      {exp.description && (
                        <Text style={styles.itemDescription}>{exp.description}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
            <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Text style={styles.contentIcon}>📁</Text>
                <Text style={styles.contentTitle}>Projects</Text>
              </View>
              {projects.filter(p => p.enabled && p.projectTitle).map((project, idx) => (
                <View key={idx} style={styles.itemContainer}>
                  <View style={styles.itemWithBullet}>
                    <View style={styles.blueBullet} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{project.projectTitle}</Text>
                      <Text style={styles.itemDate}>
                        {project.startDate} - {project.currentlyWorking ? 'Present' : project.endDate}
                      </Text>
                      {project.description && (
                        <Text style={styles.itemDescription}>{project.description}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Technical Summary */}
          {skillsLinks.technicalSummaryEnabled && skillsLinks.technicalSummary && (
            <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Text style={styles.contentIcon}>💻</Text>
                <Text style={styles.contentTitle}>Technical Summary</Text>
              </View>
              <Text style={{ fontSize: 9, color: '#666666', lineHeight: 1.6, textAlign: 'justify' }}>
                {skillsLinks.technicalSummary}
              </Text>
            </View>
          )}

          {/* References */}
          <View style={styles.contentSection}>
            <View style={styles.contentSectionHeader}>
              <Text style={styles.contentIcon}>📋</Text>
              <Text style={styles.contentTitle}>References</Text>
            </View>
            <View style={styles.referencesGrid}>
              <View style={styles.referenceItem}>
                <Text style={styles.referenceName}>Harumi Kobayashi</Text>
                <Text style={styles.referenceTitle}>Wardiere Inc. / CEO</Text>
                <Text style={styles.referenceContact}>Phone: 123-456-7890</Text>
                <Text style={styles.referenceContact}>Email: hello@reallygreatsite.com</Text>
              </View>
              <View style={styles.referenceItem}>
                <Text style={styles.referenceName}>Bailey Dupont</Text>
                <Text style={styles.referenceTitle}>Wardiere Inc. / CEO</Text>
                <Text style={styles.referenceContact}>Phone: 123-456-7890</Text>
                <Text style={styles.referenceContact}>Email: hello@reallygreatsite.com</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Template3PDF;