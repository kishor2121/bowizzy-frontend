import React from "react";
import DOMPurify from 'dompurify';
import { Document, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
	page: {
		paddingTop: 42,
		paddingBottom: 42,
		paddingLeft: 40,
		paddingRight: 40,
		fontSize: 10,
		fontFamily: "Helvetica",
		backgroundColor: "#ffffff",
	},
	header: {
		borderBottomWidth: 1,
		borderBottomColor: "#cccccc",
		paddingBottom: 15,
		marginBottom: 20,
	},
	name: {
		fontSize: 28,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		letterSpacing: 2,
	},
	twoColumn: {
		flexDirection: "row",
		gap: 25,
	},
	leftColumn: {
		width: "33%",
	},
	rightColumn: {
		width: "63%",
	},
	sectionTitle: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		letterSpacing: 0.8,
		marginBottom: 10,
		marginTop: 5,
	},
	section: {
		marginBottom: 18,
	},
	contactItem: {
		fontSize: 8.5,
		color: "#666666",
		marginBottom: 6,
		flexDirection: "row",
		alignItems: "flex-start",
	},
	contactIcon: {
		marginRight: 5,
		fontSize: 9,
	},
	educationItem: {
		marginBottom: 12,
	},
	educationTitle: {
		fontSize: 9.5,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		marginBottom: 2,
	},
	educationSubtitle: {
		fontSize: 8.5,
		color: "#666666",
		marginBottom: 2,
	},
	educationDate: {
		fontSize: 7.5,
		color: "#999999",
	},
	skillItem: {
		fontSize: 8.5,
		color: "#666666",
		marginBottom: 4,
		flexDirection: "row",
		alignItems: "flex-start",
	},
	skillArrow: {
		marginRight: 5,
		fontSize: 8,
	},
	certTitle: {
		fontSize: 8.5,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		marginBottom: 2,
	},
	certDate: {
		fontSize: 7.5,
		color: "#666666",
	},
	certProvider: {
		fontSize: 8,
		color: "#718096",
		paddingLeft: 10,
	},
	certDescription: {
		fontSize: 8,
		color: "#4a5568",
		paddingLeft: 10,
	},
	aboutText: {
		fontSize: 8.5,
		color: "#666666",
		lineHeight: 1.5,
		textAlign: "justify",
	},
	workItem: {
		marginBottom: 12,
	},
	workTitle: {
		fontSize: 9.5,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		marginBottom: 2,
	},
	workCompany: {
		fontSize: 8.5,
		color: "#666666",
		fontStyle: "italic",
		marginBottom: 2,
	},
	workDescription: {
		fontSize: 8,
		color: "#666666",
		lineHeight: 1.5,
		marginTop: 5,
		textAlign: "justify",
	},
	projectItem: {
		marginBottom: 12,
	},
	projectTitle: {
		fontSize: 9.5,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		marginBottom: 2,
	},
	projectDate: {
		fontSize: 7.5,
		color: "#666666",
		marginBottom: 2,
	},
	projectDescription: {
		fontSize: 8,
		color: "#666666",
		lineHeight: 1.5,
		marginTop: 3,
		textAlign: "justify",
	},
	projectRolesResponsibilities: {
		fontSize: 8,
		color: "#666666",
		lineHeight: 1.5,
		marginTop: 3,
		textAlign: "justify",
	},
	projectSubHeading: {
		fontSize: 8.5,
		fontFamily: "Helvetica-Bold",
		color: "#333333",
		marginBottom: 2,
		marginTop: 5,
	},
});

interface Template2PDFProps {
	data: ResumeData;
}

export const Template2PDF: React.FC<Template2PDFProps> = ({ data }) => {
	const {
		personal,
		education,
		experience,
		projects,
		skillsLinks,
		certifications,
	} = data;

	const getYear = (s?: string) => (s ? s.split('-')[0] : '');

	const htmlToPlainText = (html?: string) => {
		if (!html) return '';
		const sanitized = DOMPurify.sanitize(html || '');
		const withBreaks = sanitized.replace(/<br\s*\/?/gi, '\n').replace(/<\/p>|<\/li>/gi, '\n');
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

	const ICON_PATHS: Record<string, string> = {
		phone: 'M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 3.5A1 1 0 013 2.5H6.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.01l-2.2 2.2z',
		mail: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
		location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z',
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.name}>
					{(personal.firstName || '').toUpperCase()} {(personal.middleName || '').toUpperCase()} {(personal.lastName || '').toUpperCase()}
					</Text>
				</View>

				<View style={styles.twoColumn}>
					<View style={styles.leftColumn}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>CONTACT</Text>
							<View style={styles.contactItem}>
								<Svg width={10} height={10} viewBox="0 0 24 24" style={styles.contactIcon}>
							<Path d={ICON_PATHS.phone} fill="#666666" />
						</Svg>
						<Text>{personal.mobileNumber}</Text>
							</View>
							<View style={styles.contactItem}>
								<Svg width={10} height={10} viewBox="0 0 24 24" style={styles.contactIcon}>
							<Path d={ICON_PATHS.location} fill="#666666" />
						</Svg>
						<Text>{personal.address}</Text>
							</View>
							<View style={styles.contactItem}>
								<Svg width={10} height={10} viewBox="0 0 24 24" style={styles.contactIcon}>
							<Path d={ICON_PATHS.mail} fill="#666666" />
						</Svg>
						<Text>{personal.email}</Text>
							</View>
							{skillsLinks.links.portfolioEnabled &&
								skillsLinks.links.portfolioUrl && (
									<View style={styles.contactItem}>
										<Text>{skillsLinks.links.portfolioUrl}</Text>
									</View>
								)}
						</View>

						{(education.higherEducationEnabled ||
							education.preUniversityEnabled ||
							education.sslcEnabled) && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>EDUCATION</Text>
								{education.higherEducationEnabled &&
									education.higherEducation.length > 0 &&
									education.higherEducation.map((edu, idx) => (
										<View key={idx} style={styles.educationItem}>
											<Text style={styles.educationTitle}>
												{edu.instituteName?.toUpperCase()}
											</Text>
											<Text style={styles.educationSubtitle}>
												{edu.degree}
											</Text>
											<Text style={styles.educationDate}>
												{getYear(edu.startYear)} - {getYear(edu.endYear) || "2018"}
											</Text>
										</View>
									))}
								{education.preUniversityEnabled &&
									education.preUniversity.instituteName && (
										<View style={styles.educationItem}>
											<Text style={styles.educationTitle}>
												{education.preUniversity.instituteName.toUpperCase()}
											</Text>
											<Text style={styles.educationSubtitle}>
												Pre University  - {education.preUniversity.boardType}
											</Text>
											<Text style={styles.educationDate}>
												{getYear(education.preUniversity.yearOfPassing)}
											</Text>
										</View>
									)}
								{education.sslcEnabled && education.sslc.instituteName && (
									<View style={styles.educationItem}>
										<Text style={styles.educationTitle}>
											{education.sslc.instituteName.toUpperCase()}
										</Text>
										<Text style={styles.educationSubtitle}>
											SSLC - {education.sslc.boardType}
										</Text>
										<Text style={styles.educationDate}>
											{getYear(education.sslc.yearOfPassing)}
										</Text>
									</View>
								)}
							</View>
						)}

						{skillsLinks.skills.length > 0 && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>SKILLS</Text>
								{skillsLinks.skills
									.filter((s) => s.enabled && s.skillName)
									.map((skill, idx) => (
										<View key={idx} style={styles.skillItem}>
											<Svg width={12} height={14} viewBox="0 0 24 24" style={{ marginRight: 8 }}>
												<Path d="M3 12 H11" stroke="#666666" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
										<Path d="M11 7 L18 12 L11 17 Z" fill="#666666" />
											</Svg>
											<Text>{skill.skillName}</Text>
										</View>
									))}
							</View>
						)}

						{certifications.length > 0 &&
							certifications.some((c) => c.enabled && c.certificateTitle) && (
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>CERTIFICATION</Text>
									{certifications
										.filter((c) => c.enabled && c.certificateTitle)
										.map((cert, idx) => (
											<View key={idx} style={styles.educationItem}>
												<Text style={styles.certTitle}>
													{cert.certificateTitle.toUpperCase()}
												</Text>
												<Text style={styles.certDate}>
													{cert.date} - {cert.providedBy}
												</Text>
												{cert.description &&
													cert.description.trim() !== "" && (
														<Text style={styles.certDescription}>
															{cert.description}
														</Text>
													)}
											</View>
										))}
								</View>
							)}
					</View>

					<View style={styles.rightColumn}>
						{personal.aboutCareerObjective && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>ABOUT ME</Text>
								<Text style={styles.aboutText}>
									{htmlToPlainText(personal.aboutCareerObjective)}
								</Text>
							</View>
						)}

						{experience.workExperiences.length > 0 && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
								{experience.workExperiences
									.filter((exp) => exp.enabled)
									.map((exp, idx) => (
										<View key={idx} style={styles.workItem}>
											<Text style={styles.workTitle}>
												{exp.jobTitle.toUpperCase()}
											</Text>
											<Text style={styles.workCompany}>
												{exp.companyName} ({exp.startDate} -{" "}
												{exp.currentlyWorking ? "Present" : exp.endDate})
											</Text>
											{exp.description && (
												<Text style={styles.workDescription}>
													{htmlToPlainText(exp.description)}
												</Text>
											)}
										</View>
									))}
							</View>
						)}

						{projects.length > 0 &&
							projects.some((p) => p.enabled && p.projectTitle) && (
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>PROJECTS</Text>
									{projects
										.filter((p) => p.enabled && p.projectTitle)
										.map((project, idx) => (
											<View key={idx} style={styles.projectItem}>
												<Text style={styles.projectTitle}>
													{project.projectTitle}
												</Text>
												<Text style={styles.projectDate}>
													{project.startDate} -{" "}
													{project.currentlyWorking
														? "Present"
														: project.endDate}
												</Text>
												{project.description && (
													<View>
														<Text style={styles.projectSubHeading}>
															Description:
														</Text>
														<Text style={styles.projectDescription}>
															{htmlToPlainText(project.description)}
														</Text>
													</View>
												)}
												{project.rolesResponsibilities && (
													<View>
														<Text style={styles.projectSubHeading}>
															Roles & Responsibilities:
														</Text>
														<Text style={styles.projectDescription}>
															{htmlToPlainText(project.rolesResponsibilities)}
														</Text>
													</View>
												)}
											</View>
										))}
								</View>
							)}
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default Template2PDF;