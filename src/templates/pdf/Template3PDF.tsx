import React from 'react';
import DOMPurify from 'dompurify';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
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
    // replaced with an Svg polygon for a diagonal effect (see render)
    width: '100%',
    height: 150,
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
    // use explicit border props for react-pdf
    borderWidth: 6,
    borderColor: '#ffffff',
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
  contactIconBox: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#5B8FB9',
    marginRight: 7,
    marginTop: 2,
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
  sectionIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#5B8FB9',
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
  sidebarIconImg: {
    width: 12,
    height: 12,
    marginRight: 8,
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
  contactIconImg: {
    width: 10,
    height: 10,
    marginRight: 7,
    marginTop: 2,
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

  // NOTE: we render icons directly with Svg/Path (ICON_PATHS) so we don't
  // depend on external fonts or emoji. This makes PDF rendering reliable
  // across viewers and matches the preview visuals.

  const htmlToPlainText = (html?: string) => {
    if (!html) return '';
    const sanitized = DOMPurify.sanitize(html || '');
    const withBreaks = sanitized.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n');
    try {
      if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = withBreaks;
        return (tmp.textContent || tmp.innerText || '').trim();
      }
    } catch (e) {
      return withBreaks.replace(/<[^>]+>/g, '').trim();
    }
    return withBreaks.replace(/<[^>]+>/g, '').trim();
  };

  // Inline SVG path data for icons (use react-pdf Svg/Path so icons render reliably in PDFs)
  const ICON_PATHS: Record<string, string> = {
    phone: 'M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 3.5A1 1 0 013 2.5H6.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.01l-2.2 2.2z',
    mail: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z',
    user: 'M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.33 0-8 2.17-8 4v2h16v-2c0-1.83-3.67-4-8-4z',
    skills: 'M12 2a2 2 0 012 2v2.07a6 6 0 012.77 1.6l1.46-1.46A2 2 0 0120.5 8L19 9.5a6 6 0 011.6 2.77H22a2 2 0 012 2v1a2 2 0 01-2 2h-1.07a6 6 0 01-1.6 2.77l1.46 1.46a2 2 0 01-1.06 3.5 2 2 0 01-1.46-.59L16.5 20a6 6 0 01-2.77 1.6V24a2 2 0 01-2 2 2 2 0 01-2-2v-2.07a6 6 0 01-2.77-1.6L5.5 21.46A2 2 0 014.44 18a2 2 0 01.59-1.46L7 16.5a6 6 0 01-1.6-2.77H4a2 2 0 01-2-2v-1a2 2 0 012-2h1.07a6 6 0 011.6-2.77L4.21 5.5A2 2 0 015.27 2a2 2 0 012.92.59L8.5 5a6 6 0 012.77-1.6V4a2 2 0 012-2z',
    edu: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM12 13L3 8l9-5 9 5-9 5z',
    briefcase: 'M20 6h-3V4a2 2 0 00-2-2h-6a2 2 0 00-2 2v2H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zM9 4h6v2H9V4z',
    project: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z',
    tech: 'M20 8h-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2H4v2h16V8zM4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6H4z',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Sidebar with Diagonal Background */}
        <View style={styles.leftSidebarContainer}>
            {/* Diagonal + white circular mask are drawn in a single SVG so the
                white circle sits ABOVE the diagonal and the profile image can
                be rendered on top cleanly (prevents overlap issues). */}
            {/* SVG coordinate system: viewBox 0..300 x 0..150 -> matches px heights */}
            <Svg viewBox="0 0 300 150" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 150 }} preserveAspectRatio="none">
              {/* Blue diagonal */}
              <Path d="M0 0 L225 0 L300 150 L0 150 Z" fill="#5B8FB9" />
              {/* White circular mask (drawn after the diagonal so it overlays it) */}
              <Path d="M150 100 m -76,0 a 76,76 0 1,0 152,0 a 76,76 0 1,0 -152,0" fill="#ffffff" />
            </Svg>
          
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
                  <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.sidebarIconImg}>
                    <Path d={ICON_PATHS.phone} fill="#5B8FB9" />
                  </Svg>
                  <Text style={styles.sidebarTitle}>Contact</Text>
                </View>
              <View style={[styles.sidebarContent, styles.sidebarDivider]}>
                <View style={styles.contactItem}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" style={styles.contactIconImg}>
                    <Path d={ICON_PATHS.phone} fill="#5B8FB9" />
                  </Svg>
                  <Text>{personal.mobileNumber || '09632587410'}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" style={styles.contactIconImg}>
                    <Path d={ICON_PATHS.mail} fill="#5B8FB9" />
                  </Svg>
                  <Text>{personal.email || 'nishanth@gmail.com'}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" style={styles.contactIconImg}>
                    <Path d={ICON_PATHS.location} fill="#5B8FB9" />
                  </Svg>
                  <Text>{personal.city || 'Bengaluru'}</Text>
                </View>
              </View>
            </View>

            {/* About Me */}
            {personal.aboutCareerObjective && (
              <View style={styles.sidebarSection}>
                <View style={styles.sidebarSectionHeader}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.sidebarIconImg}>
                    <Path d={ICON_PATHS.user} fill="#5B8FB9" />
                  </Svg>
                  <Text style={styles.sidebarTitle}>About Me</Text>
                </View>
                <View style={[styles.sidebarContent, styles.sidebarDivider]}>
                  <Text style={styles.aboutText}>{htmlToPlainText(personal.aboutCareerObjective)}</Text>
                </View>
              </View>
            )}

            {/* Skills */}
            {skillsLinks.skills.length > 0 && skillsLinks.skills.some(s => s.enabled && s.skillName) && (
              <View style={styles.sidebarSection}>
                <View style={styles.sidebarSectionHeader}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.sidebarIconImg}>
                    <Path d={ICON_PATHS.skills} fill="#5B8FB9" />
                  </Svg>
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
                <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                  <Path d={ICON_PATHS.edu} fill="#5B8FB9" />
                </Svg>
                <Text style={styles.contentTitle}>Education</Text>
              </View>
              
              <View style={{ position: 'relative', paddingLeft: 20 }}>
                {/* Vertical Line */}
                <View style={{
                  position: 'absolute',
                  left: 3.5,
                  top: 5,
                  bottom: 20,
                  width: 2,
                  backgroundColor: '#5B8FB9'
                }} />
                
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

                {/* Pre-University (show consistent label and same order as display) */}
                {education.preUniversityEnabled && education.preUniversity.instituteName && (
                  <View style={styles.itemContainer}>
                    <View style={styles.itemWithBullet}>
                      <View style={styles.blueBullet} />
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Pre University</Text>
                        <Text style={styles.itemSubtitle}>{education.preUniversity.instituteName}</Text>
                        <Text style={styles.itemDate}>{education.preUniversity.yearOfPassing}</Text>
                      </View>
                    </View>
                  </View>
                )}

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
              </View>
            </View>
          )}

          {/* Experience */}
          {experience.workExperiences.length > 0 && experience.workExperiences.some(exp => exp.enabled) && (
              <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                  <Path d={ICON_PATHS.briefcase} fill="#5B8FB9" />
                </Svg>
                <Text style={styles.contentTitle}>Experience</Text>
              </View>
              
              <View style={{ position: 'relative', paddingLeft: 20 }}>
                {/* Vertical Line */}
                <View style={{
                  position: 'absolute',
                  left: 3.5,
                  top: 5,
                  bottom: 20,
                  width: 2,
                  backgroundColor: '#5B8FB9'
                }} />
                
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
                          <Text style={styles.itemDescription}>{htmlToPlainText(exp.description)}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && projects.some(p => p.enabled && p.projectTitle) && (
              <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                  <Path d={ICON_PATHS.project} fill="#5B8FB9" />
                </Svg>
                <Text style={styles.contentTitle}>Projects</Text>
              </View>
              
              <View style={{ position: 'relative', paddingLeft: 20 }}>
                {/* Vertical Line */}
                <View style={{
                  position: 'absolute',
                  left: 3.5,
                  top: 5,
                  bottom: 20,
                  width: 2,
                  backgroundColor: '#5B8FB9'
                }} />
                
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
                          <Text style={styles.itemDescription}>{htmlToPlainText(project.description)}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Technical Summary */}
          {skillsLinks.technicalSummaryEnabled && skillsLinks.technicalSummary && (
            <View style={styles.contentSection}>
              <View style={styles.contentSectionHeader}>
                <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                  <Path d={ICON_PATHS.tech} fill="#5B8FB9" />
                </Svg>
                <Text style={styles.contentTitle}>Technical Summary</Text>
              </View>
              <Text style={{ fontSize: 9, color: '#666666', lineHeight: 1.6, textAlign: 'justify' }}>
                {htmlToPlainText(skillsLinks.technicalSummary)}
              </Text>
            </View>
          )}


        </View>
      </Page>
    </Document>
  );
};

export default Template3PDF;