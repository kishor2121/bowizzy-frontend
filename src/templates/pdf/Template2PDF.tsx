import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.name}>
						{personal.firstName.toUpperCase()} {personal.lastName.toUpperCase()}
					</Text>
				</View>

				<View style={styles.twoColumn}>
					<View style={styles.leftColumn}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>CONTACT</Text>
							<View style={styles.contactItem}>
								<Text>{personal.mobileNumber}</Text>
							</View>
							<View style={styles.contactItem}>
								<Text>{personal.address}</Text>
							</View>
							<View style={styles.contactItem}>
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
												{edu.startYear} - {edu.endYear || "2018"}
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
												{education.preUniversity.subjectStream} -{" "}
												{education.preUniversity.boardType}
											</Text>
											<Text style={styles.educationDate}>
												{education.preUniversity.yearOfPassing}
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
											{education.sslc.yearOfPassing}
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
											<Text style={styles.skillArrow}>➔</Text>
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
									{personal.aboutCareerObjective}
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
													{exp.description}
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
															{project.description}
														</Text>
													</View>
												)}
												{project.rolesResponsibilities && (
													<View>
														<Text style={styles.projectSubHeading}>
															Roles & Responsibilities:
														</Text>
														<Text style={styles.projectDescription}>
															{project.rolesResponsibilities}
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