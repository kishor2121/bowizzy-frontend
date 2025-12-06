import React from "react";
import type { ResumeData } from "@/types/resume";

interface Template2DisplayProps {
	data: ResumeData;
	showPageBreaks?: boolean;
}

export const Template2Display: React.FC<Template2DisplayProps> = ({
	data,
	showPageBreaks = false,
}) => {
	const {
		personal,
		education,
		experience,
		projects,
		skillsLinks,
		certifications,
	} = data;

	return (
		<div
			className="w-[210mm] bg-white"
			style={{ minHeight: "297mm", paddingTop: "2px", paddingBottom: "2px" }}
		>
			{/* Header */}
			<div
				className="border-b border-gray-300 pb-4 mb-6"
				style={{ padding: "20mm 20mm 0 20mm", marginTop: "2px" }}
			>
				<h1
					className="text-4xl font-bold text-gray-800 tracking-wider"
					style={{ fontSize: "36px", letterSpacing: "4px" }}
				>
					{personal.firstName.toUpperCase()} {personal.lastName.toUpperCase()}
				</h1>
			</div>

			{/* Two Column Layout */}
			<div className="flex gap-8" style={{ padding: "0 20mm 20mm 20mm" }}>
				{/* Left Column */}
				<div className="w-1/3">
					{/* Contact */}
					<div className="resume-section mb-6">
						<h2
							className="text-sm font-bold text-gray-800 mb-3"
							style={{ fontSize: "13px", letterSpacing: "1px" }}
						>
							CONTACT
						</h2>
						<div
							className="space-y-2 text-gray-600"
							style={{ fontSize: "10px" }}
						>
							<div className="flex items-center gap-2">
								<span>{personal.mobileNumber}</span>
							</div>
							<div className="flex items-center gap-2">
								<span>{personal.address}</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="break-all">
									{personal.email }
								</span>
							</div>
							{skillsLinks.links.portfolioEnabled &&
								skillsLinks.links.portfolioUrl && (
									<div className="flex items-center gap-2">
										<span className="break-all">
											{skillsLinks.links.portfolioUrl}
										</span>
									</div>
								)}
						</div>
					</div>

					{/* Education Section Container (Now includes all levels) */}
					{(education.higherEducationEnabled ||
						education.preUniversityEnabled ||
						education.sslcEnabled) && (
						<div className="resume-section mb-6">
							<h2
								className="text-sm font-bold text-gray-800 mb-3"
								style={{ fontSize: "13px", letterSpacing: "1px" }}
							>
								EDUCATION
							</h2>

							{/* Higher Education */}
							{education.higherEducationEnabled &&
								education.higherEducation.length > 0 &&
								education.higherEducation.map((edu, idx) => (
									<div key={idx} className="education-item mb-4">
										<h3
											className="font-bold text-gray-800"
											style={{ fontSize: "11px" }}
										>
											{edu.instituteName?.toUpperCase() ||
												"BORCELLE UNIVERSITY"}
										</h3>
										<p className="text-gray-600" style={{ fontSize: "10px" }}>
											{edu.degree || "Bachelor of Science in Psychology"}
										</p>
										<p className="text-gray-500" style={{ fontSize: "9px" }}>
											{edu.startYear} - {edu.endYear || "2018"}
										</p>
									</div>
								))}

							{/* Pre-University */}
							{education.preUniversityEnabled &&
								education.preUniversity.instituteName && (
									<div className="education-item" style={{ marginBottom: "14px" }}>
										<h3
											style={{
												fontSize: "11px",
												fontWeight: "bold",
												color: "#2d3748",
												marginBottom: "2px",
											}}
										>
											{education.preUniversity.instituteName}
										</h3>
										<p
											style={{
												fontSize: "10px",
												color: "#4a5568",
												marginBottom: "2px",
											}}
										>
											{education.preUniversity.subjectStream} -{" "}
											{education.preUniversity.boardType}
										</p>
										<p style={{ fontSize: "9px", color: "#718096" }}>
											{education.preUniversity.yearOfPassing}
										</p>
									</div>
								)}

							{/* SSLC */}
							{education.sslcEnabled && education.sslc.instituteName && (
								<div className="education-item" style={{ marginBottom: "14px" }}>
									<h3
										style={{
											fontSize: "11px",
											fontWeight: "bold",
											color: "#2d3748",
											marginBottom: "2px",
										}}
									>
										{education.sslc.instituteName}
									</h3>
									<p
										style={{
											fontSize: "10px",
											color: "#4a5568",
											marginBottom: "2px",
										}}
									>
										SSLC - {education.sslc.boardType}
									</p>
									<p style={{ fontSize: "9px", color: "#718096" }}>
										{education.sslc.yearOfPassing}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Skills */}
					{skillsLinks.skills.length > 0 && (
						<div className="resume-section mb-6">
							<h2
								className="text-sm font-bold text-gray-800 mb-3"
								style={{ fontSize: "13px", letterSpacing: "1px" }}
							>
								SKILLS
							</h2>
							<div className="space-y-1">
								{skillsLinks.skills
									.filter((s) => s.enabled && s.skillName)
									.map((skill, idx) => (
										<div
											key={idx}
											className="skill-item flex items-center gap-2"
										>
											<span
												className="text-gray-800"
												style={{ fontSize: "10px" }}
											>
												➔
											</span>
											<span
												className="text-gray-600"
												style={{ fontSize: "10px" }}
											>
												{skill.skillName}
											</span>
										</div>
									))}
							</div>
						</div>
					)}

					{/* Certification */}
					{certifications.length > 0 &&
						certifications.some((c) => c.enabled && c.certificateTitle) && (
							<div className="resume-section mb-6">
								<h2
									className="text-sm font-bold text-gray-800 mb-3"
									style={{ fontSize: "13px", letterSpacing: "1px" }}
								>
									CERTIFICATION
								</h2>
								{certifications
									.filter((c) => c.enabled && c.certificateTitle)
									.map((cert, idx) => (
										<div key={idx} className="certification-item mb-3">
											<h3
												className="font-bold text-gray-800"
												style={{ fontSize: "10px" }}
											>
												{cert.certificateTitle.toUpperCase()}
											</h3>
											<p className="text-gray-600" style={{ fontSize: "9px" }}>
												{cert.date} - {cert.providedBy}
											</p>
											{cert.description && (
												<p
													className="mt-1 text-gray-600 leading-relaxed text-justify"
													style={{ fontSize: "9px" }}
												>
													{cert.description}
												</p>
											)}
										</div>
									))}
							</div>
						)}
				</div>

				{/* Right Column */}
				<div className="w-2/3">
					{/* About Me */}
					{personal.aboutCareerObjective && (
						<div className="resume-section mb-6">
							<h2
								className="text-sm font-bold text-gray-800 mb-3"
								style={{ fontSize: "13px", letterSpacing: "1px" }}
							>
								ABOUT ME
							</h2>
							<p
								className="text-gray-600 leading-relaxed text-justify"
								style={{ fontSize: "10px" }}
							>
								{personal.aboutCareerObjective}
							</p>
						</div>
					)}

					{/* Work Experience */}
					{experience.workExperiences.length > 0 && (
						<div className="resume-section mb-6">
							<h2
								className="text-sm font-bold text-gray-800 mb-3"
								style={{ fontSize: "13px", letterSpacing: "1px" }}
							>
								WORK EXPERIENCE
							</h2>
							{experience.workExperiences
								.filter((exp) => exp.enabled)
								.map((exp, idx) => (
									<div key={idx} className="work-item mb-4">
										<h3
											className="font-bold text-gray-800"
											style={{ fontSize: "11px" }}
										>
											{exp.jobTitle.toUpperCase()}
										</h3>
										<p
											className="text-gray-600 italic"
											style={{ fontSize: "10px" }}
										>
											{exp.companyName} ({exp.startDate} -{" "}
											{exp.currentlyWorking ? "Present" : exp.endDate})
										</p>
										{exp.description && (
											<p
												className="mt-2 text-gray-600 leading-relaxed text-justify"
												style={{ fontSize: "10px" }}
											>
												{exp.description}
											</p>
										)}
									</div>
								))}
						</div>
					)}

					{/* Projects */}
					{projects.length > 0 &&
						projects.some((p) => p.enabled && p.projectTitle) && (
							<div className="resume-section mb-6">
								<h2
									className="text-sm font-bold text-gray-800 mb-3"
									style={{ fontSize: "13px", letterSpacing: "1px" }}
								>
									PROJECTS
								</h2>
								{projects
									.filter((p) => p.enabled && p.projectTitle)
									.map((project, idx) => (
										<div key={idx} className="project-item mb-4">
											<h3
												className="font-bold text-gray-800"
												style={{ fontSize: "11px" }}
											>
												{project.projectTitle}
											</h3>
											<p className="text-gray-600" style={{ fontSize: "10px" }}>
												{project.startDate} -{" "}
												{project.currentlyWorking ? "Present" : project.endDate}
											</p>
											{project.description && (
												<p
													className="mt-1 text-gray-600 leading-relaxed text-justify"
													style={{ fontSize: "10px" }}
												>
                          <strong>Description:</strong>{" "}
													{project.description}
												</p>
											)}
											{project.rolesResponsibilities && (
												<p
													className="mt-1 text-gray-600 leading-relaxed text-justify"
													style={{ fontSize: "10px" }}
												>
													<strong>Roles &amp; Responsibilities:</strong>{" "}
													{project.rolesResponsibilities}
												</p>
											)}
										</div>
									))}
							</div>
						)}
				</div>
			</div>
		</div>
	);
};

export default Template2Display;