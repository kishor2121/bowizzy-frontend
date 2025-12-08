import React, { useState, useEffect, useRef } from "react";
import type { SkillsLinksDetails, Skill } from "src/types/resume";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSection,
  ToggleSwitch,
} from "@/pages/(ResumeBuilder)/components/ui";
import { X, Save, RotateCcw } from "lucide-react";
import RichTextEditor from "@/pages/(ResumeBuilder)/components/ui/RichTextEditor";
import {
  updateSkillDetails,
  saveSkillsDetails,
  deleteSkill,
  updateLinkDetails,
  saveLinksDetails,
  deleteLink,
  getTechnicalSummary,
  saveTechnicalSummary,
  updateTechnicalSummary,
} from "@/services/skillsLinksService";

interface SkillsLinksFormProps {
  data: SkillsLinksDetails;
  onChange: (data: SkillsLinksDetails) => void;
  userId: string;
  token: string;
  technicalSummaryId?: number | null;
}

const skillLevels = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
];

export const SkillsLinksForm: React.FC<SkillsLinksFormProps> = ({
  data,
  onChange,
  userId,
  token,
  technicalSummaryId: initialTechnicalSummaryId,
}) => {
  const [skillsCollapsed, setSkillsCollapsed] = useState(false);
  const [linksCollapsed, setLinksCollapsed] = useState(false);
  const [technicalSummaryCollapsed, setTechnicalSummaryCollapsed] =
    useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // State for tracking changes and feedback
  const [skillChanges, setSkillChanges] = useState<Record<string, string[]>>(
    {}
  );
  const [linkChanges, setLinkChanges] = useState<boolean>(false);
  const [technicalSummaryChanges, setTechnicalSummaryChanges] =
    useState<boolean>(false);
  const [skillFeedback, setSkillFeedback] = useState<Record<string, string>>(
    {}
  );
  const [linkFeedback, setLinkFeedback] = useState<string>("");
  const [technicalSummaryFeedback, setTechnicalSummaryFeedback] =
    useState<string>("");

  // Refs for tracking initial data
  const initialSkillsRef = useRef<Record<string, Skill>>({});
  const initialLinksRef = useRef(data.links);
  const initialTechnicalSummaryRef = useRef(data.technicalSummary);
  const deletedSkillIds = useRef<number[]>([]);
  const deletedLinkIds = useRef<string[]>([]);
  const [technicalSummaryId, setTechnicalSummaryId] = useState<number | null>(
    initialTechnicalSummaryId || null
  );

  useEffect(() => {
    if (initialTechnicalSummaryId !== undefined) {
      setTechnicalSummaryId(initialTechnicalSummaryId);
    }
  }, [initialTechnicalSummaryId]);

  // Initialize refs on mount
  useEffect(() => {
    data.skills.forEach((s) => {
      initialSkillsRef.current[s.id] = { ...s };
    });
    initialLinksRef.current = { ...data.links };
    initialTechnicalSummaryRef.current = data.technicalSummary;
  }, []);

  // Check Skill changes
  useEffect(() => {
    const changes: Record<string, string[]> = {};
    data.skills.forEach((current) => {
      const initial = initialSkillsRef.current[current.id];
      const changedFields: string[] = [];

      if (current.skillName !== (initial?.skillName || ""))
        changedFields.push("skillName");
      if (current.skillLevel !== (initial?.skillLevel || ""))
        changedFields.push("skillLevel");

      if (changedFields.length > 0) {
        changes[current.id] = changedFields;
      } else if (!current.skill_id && current.skillName) {
        changes[current.id] = ["new"];
      }
    });
    setSkillChanges(changes);
  }, [data.skills]);

  // Check Link changes
  useEffect(() => {
    const initial = initialLinksRef.current;
    const current = data.links;

    const hasChanged =
      current.linkedinProfile !== (initial.linkedinProfile || "") ||
      current.githubProfile !== (initial.githubProfile || "") ||
      current.portfolioUrl !== (initial.portfolioUrl || "") ||
      current.portfolioDescription !== (initial.portfolioDescription || "") ||
      current.publicationUrl !== (initial.publicationUrl || "") ||
      current.publicationDescription !== (initial.publicationDescription || "");

    setLinkChanges(hasChanged);
  }, [data.links]);

  // Check Technical Summary changes
  useEffect(() => {
    const hasChanged =
      data.technicalSummary !== initialTechnicalSummaryRef.current;
    setTechnicalSummaryChanges(hasChanged);
  }, [data.technicalSummary]);

  const validateSkillName = (value: string) => {
    if (value && !/^[a-zA-Z0-9\s.+#-]+$/.test(value)) {
      return "Invalid characters in skill name";
    }
    if (value && (!/[a-zA-Z]/.test(value) || !/\d/.test(value))) {
      return "Skill must include both letters and numbers";
    }
    return "";
  };

  const validateUrl = (value: string, type: string) => {
    if (!value) return "";

    const urlPattern =
      /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)([\w\-\.,@?^=%&:/~\+#]*[\w\-@?^=%&/~\+#])?$/i;

    if (!urlPattern.test(value)) {
      return `Invalid ${type} URL format`;
    }

    if (
      type === "LinkedIn" &&
      value &&
      !value.toLowerCase().includes("linkedin.com")
    )
      return "Please enter a valid LinkedIn URL";

    if (
      type === "GitHub" &&
      value &&
      !value.toLowerCase().includes("github.com")
    )
      return "Please enter a valid GitHub URL";

    if (
      type === "Portfolio" &&
      value &&
      !value.toLowerCase().includes("portfolio")
    )
      return "Please enter a valid Portfolio URL";

    return "";
  };

  // Handler for saving all skills
  const handleSaveAllSkills = async () => {
    const changesToSave = Object.keys(skillChanges);
    if (changesToSave.length === 0) {
      setSkillFeedback({ ["all"]: "No changes to save." });
      setTimeout(() => setSkillFeedback({}), 3000);
      return;
    }

    const updatePromises = [];
    const createPayloads = [];
    let successCount = 0;
    let failCount = 0;

    for (const skill of data.skills) {
      const changes = skillChanges[skill.id];
      const isNew = !skill.skill_id;
      const index = data.skills.indexOf(skill);

      if (!changes && !isNew) continue;
      if (isNew && !skill.skillName) continue;
      if (errors[`skill-${skill.id}-skillName`]) {
        failCount++;
        continue;
      }

      if (isNew) {
        createPayloads.push({
          skill_name: skill.skillName,
          skill_level: skill.skillLevel,
        });
      } else {
        const minimalPayload: Record<string, any> = {};
        if (changes) {
          changes.forEach((field) => {
            if (field === "skillName")
              minimalPayload.skill_name = skill.skillName;
            if (field === "skillLevel")
              minimalPayload.skill_level = skill.skillLevel;
          });
        }
        updatePromises.push(
          updateSkillDetails(userId, token, skill.skill_id!, minimalPayload)
            .then(() => {
              successCount++;
              initialSkillsRef.current[skill.id] = { ...skill };
            })
            .catch(() => failCount++)
        );
      }
    }

    // Execute updates
    await Promise.all(updatePromises);

    // Execute creates
    if (createPayloads.length > 0) {
      try {
        const response = await saveSkillsDetails(userId, token, createPayloads);
        if (response && Array.isArray(response)) {
          const updatedSkills = [...data.skills];
          response.forEach((newSkill, idx) => {
            const skillIndex = updatedSkills.findIndex(
              (s) => s.skillName === newSkill.skill_name && !s.skill_id
            );
            if (skillIndex !== -1) {
              updatedSkills[skillIndex] = {
                ...updatedSkills[skillIndex],
                skill_id: newSkill.skill_id,
              };
              initialSkillsRef.current[updatedSkills[skillIndex].id] =
                updatedSkills[skillIndex];
              successCount++;
            }
          });
          onChange({ ...data, skills: updatedSkills });
        }
      } catch {
        failCount += createPayloads.length;
      }
    }

    const finalMessage =
      failCount === 0
        ? "All skills updated successfully!"
        : "Skills update failed for some entries.";

    setSkillChanges({});
    setSkillFeedback({ ["all"]: finalMessage });
    setTimeout(() => setSkillFeedback({}), 3000);
  };

  // Handler for resetting all skills
  const handleResetAllSkills = () => {
    const initialValues = Object.values(initialSkillsRef.current);
    if (initialValues.length > 0) {
      onChange({ ...data, skills: initialValues.map((s) => ({ ...s })) });
    }
    setSkillChanges({});
    setSkillFeedback({});
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("skill-")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Handler for saving all links
  const handleSaveAllLinks = async () => {
    if (!linkChanges) {
      setLinkFeedback("No changes to save.");
      setTimeout(() => setLinkFeedback(""), 3000);
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const promises = [];
    const link = data.links;

    const fieldsToSync = [
      {
        field: "linkedinProfile",
        dbId: "link_id_linkedin",
        apiType: "linkedin",
      },
      { field: "githubProfile", dbId: "link_id_github", apiType: "github" },
      {
        field: "portfolioUrl",
        dbId: "link_id_portfolio",
        apiType: "portfolio",
        descField: "portfolioDescription",
      },
      {
        field: "publicationUrl",
        dbId: "link_id_publication",
        apiType: "publication",
        descField: "publicationDescription",
      },
    ];

    for (const { field, dbId, apiType, descField } of fieldsToSync) {
      const url = link[field as keyof typeof link] as string;
      const dbIdValue = link[dbId as keyof typeof link];
      const description = descField
        ? (link[descField as keyof typeof link] as string)
        : null;

      if (errors[`link-${field}`]) {
        failCount++;
        continue;
      }

      if (url) {
        const payload = {
          url,
          link_type: apiType,
          description: description || null,
        };
        if (dbIdValue) {
          // PUT (Update)
          promises.push(
            updateLinkDetails(userId, token, dbIdValue as string, payload)
              .then(() => {
                successCount++;
                initialLinksRef.current = { ...link };
              })
              .catch(() => failCount++)
          );
        } else {
          // POST (Create)
          promises.push(
            saveLinksDetails(userId, token, [payload])
              .then((response) => {
                const newLinkId = response?.[0]?.link_id;
                if (newLinkId) {
                  const updatedLinks = {
                    ...link,
                    [dbId]: newLinkId.toString(),
                  };
                  onChange({ ...data, links: updatedLinks });
                  initialLinksRef.current = updatedLinks;
                  successCount++;
                }
              })
              .catch(() => failCount++)
          );
        }
      } else if (!url && dbIdValue) {
        // DELETE
        promises.push(
          deleteLink(userId, token, dbIdValue as string)
            .then(() => {
              const updatedLinks = {
                ...link,
                [dbId]: undefined,
                [field]: "",
              };
              if (descField) {
                (updatedLinks as any)[descField] = "";
              }
              onChange({ ...data, links: updatedLinks });
              deletedLinkIds.current.push(dbIdValue as string);
              successCount++;
            })
            .catch(() => failCount++)
        );
      }
    }

    await Promise.all(promises);

    const finalMessage =
      failCount === 0
        ? "All links updated successfully!"
        : "Link update failed for some entries.";

    setLinkChanges(false);
    setLinkFeedback(finalMessage);
    setTimeout(() => setLinkFeedback(""), 3000);
  };

  // Handler for resetting all links
  const handleResetAllLinks = () => {
    const initial = initialLinksRef.current;
    onChange({
      ...data,
      links: { ...initial },
    });
    setLinkChanges(false);
    setLinkFeedback("");
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("link-")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Handler for saving technical summary
  const handleSaveTechnicalSummary = async () => {
    if (!technicalSummaryChanges) {
      setTechnicalSummaryFeedback("No changes to save.");
      setTimeout(() => setTechnicalSummaryFeedback(""), 3000);
      return;
    }

    try {
      if (technicalSummaryId) {
        // Update existing
        await updateTechnicalSummary(
          userId,
          token,
          technicalSummaryId,
          data.technicalSummary
        );
      } else {
        // Create new
        const response = await saveTechnicalSummary(
          userId,
          token,
          data.technicalSummary
        );
        if (response && response.summary_id) {
          setTechnicalSummaryId(response.summary_id);
        }
      }

      initialTechnicalSummaryRef.current = data.technicalSummary;
      setTechnicalSummaryChanges(false);
      setTechnicalSummaryFeedback("Technical summary saved successfully!");
      setTimeout(() => setTechnicalSummaryFeedback(""), 3000);
    } catch (error) {
      console.error("Error saving technical summary:", error);
      setTechnicalSummaryFeedback("Failed to save technical summary.");
      setTimeout(() => setTechnicalSummaryFeedback(""), 3000);
    }
  };

  // Handler for resetting technical summary
  const handleResetTechnicalSummary = () => {
    onChange({
      ...data,
      technicalSummary: initialTechnicalSummaryRef.current,
    });
    setTechnicalSummaryChanges(false);
    setTechnicalSummaryFeedback("");
  };

  const updateSkill = (id: string, field: string, value: string | boolean) => {
    onChange({
      ...data,
      skills: data.skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    });

    if (field === "skillName") {
      const error = validateSkillName(value as string);
      setErrors((prev) => ({ ...prev, [`skill-${id}-skillName`]: error }));
    }
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      skillName: "",
      skillLevel: "",
      enabled: true,
    };
    onChange({
      ...data,
      skills: [...data.skills, newSkill],
    });
  };

  const removeSkill = async (id: string) => {
    const skill = data.skills.find((s) => s.id === id);
    if (!skill || data.skills.length <= 1) return;

    if (skill.skill_id) {
      try {
        await deleteSkill(userId, token, skill.skill_id);
        deletedSkillIds.current.push(skill.skill_id);
        setSkillFeedback((prev) => ({
          ...prev,
          [id]: "Deleted successfully!",
        }));
        setTimeout(
          () =>
            setSkillFeedback((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            }),
          3000
        );
      } catch (error) {
        console.error("Error deleting skill:", error);
        setSkillFeedback((prev) => ({ ...prev, [id]: "Failed to delete." }));
        setTimeout(
          () =>
            setSkillFeedback((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            }),
          3000
        );
        return;
      }
    }

    onChange({
      ...data,
      skills: data.skills.filter((skill) => skill.id !== id),
    });
    delete initialSkillsRef.current[id];
    setSkillChanges((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`skill-${id}-skillName`];
      return newErrors;
    });
  };

  const updateLink = (field: string, value: string | boolean) => {
    onChange({
      ...data,
      links: { ...data.links, [field]: value },
    });

    if (typeof value === "string") {
      if (field === "linkedinProfile")
        setErrors((prev) => ({
          ...prev,
          [`link-linkedinProfile`]: validateUrl(value, "LinkedIn"),
        }));
      if (field === "githubProfile")
        setErrors((prev) => ({
          ...prev,
          [`link-githubProfile`]: validateUrl(value, "GitHub"),
        }));
      if (field === "portfolioUrl")
        setErrors((prev) => ({
          ...prev,
          [`link-portfolioUrl`]: validateUrl(value, "Portfolio"),
        }));
      if (field === "publicationUrl")
        setErrors((prev) => ({
          ...prev,
          [`link-publicationUrl`]: validateUrl(value, "Publication"),
        }));
    }
  };

  const hasSkillChanges = Object.keys(skillChanges).length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/*  SKILLS SECTION */}
      <FormSection
        title="Skills"
        required
        showToggle={false}
        showActions={true}
        isCollapsed={skillsCollapsed}
        onCollapseToggle={() => setSkillsCollapsed(!skillsCollapsed)}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          {skillFeedback["all"] && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                skillFeedback["all"].includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {skillFeedback["all"]}
            </span>
          )}
          {hasSkillChanges && (
            <button
              type="button"
              onClick={handleSaveAllSkills}
              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
              title="Save all skill changes"
            >
              <Save
                className="w-3 h-3 text-green-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleResetAllSkills}
            className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            title="Reset to saved values"
          >
            <RotateCcw
              className="w-3 h-3 text-gray-600 cursor-pointer"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {data.skills.map((skill, index) => (
          <div key={skill.id} className={`${index > 0 ? "mt-4" : ""}`}>
            {skillFeedback[skill.id] && (
              <p
                className={`mb-2 text-xs px-2 py-1 rounded-full ${
                  skillFeedback[skill.id].includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {skillFeedback[skill.id]}
              </p>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <FormInput
                  label="Skill"
                  placeholder="Enter Skill Name..."
                  value={skill.skillName}
                  onChange={(v) => updateSkill(skill.id, "skillName", v)}
                  error={errors[`skill-${skill.id}-skillName`]}
                />
              </div>

              <div className="flex-1">
                <FormSelect
                  label="Skill Level"
                  placeholder="Select Skill level"
                  value={skill.skillLevel}
                  onChange={(v) => updateSkill(skill.id, "skillLevel", v)}
                  options={skillLevels}
                />
              </div>

              {data.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors mb-1"
                >
                  <X size={18} />
                </button>
              )}

              <div className="mb-1">
                <ToggleSwitch
                  enabled={skill.enabled}
                  onChange={(v) => updateSkill(skill.id, "enabled", v)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4">
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm"
          >
            <span className="text-lg">+</span> Add Skill
          </button>
        </div>
      </FormSection>

      {/* LINKS SECTION */}
      <FormSection
        title="Links"
        showToggle={true}
        enabled={data.linksEnabled}
        onToggle={(enabled) => onChange({ ...data, linksEnabled: enabled })}
        showActions={true}
        isCollapsed={linksCollapsed}
        onCollapseToggle={() => setLinksCollapsed(!linksCollapsed)}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          {linkFeedback && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                linkFeedback.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {linkFeedback}
            </span>
          )}
          {linkChanges && (
            <button
              type="button"
              onClick={handleSaveAllLinks}
              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
              title="Save all link changes"
            >
              <Save
                className="w-3 h-3 text-green-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleResetAllLinks}
            className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            title="Reset to saved values"
          >
            <RotateCcw
              className="w-3 h-3 text-gray-600 cursor-pointer"
              strokeWidth={2.5}
            />
          </button>
        </div>

        <div className="space-y-4">
          {/* LinkedIn */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FormInput
                label="LinkedIn Profile"
                placeholder="Enter LinkedIn profile link..."
                value={data.links.linkedinProfile}
                onChange={(v) => updateLink("linkedinProfile", v)}
                error={errors[`link-linkedinProfile`]}
              />
            </div>
            <div className="mt-5">
              <ToggleSwitch
                enabled={data.links.linkedinEnabled}
                onChange={(v) => updateLink("linkedinEnabled", v)}
              />
            </div>
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FormInput
                label="GitHub Profile"
                placeholder="Enter Github profile link..."
                value={data.links.githubProfile}
                onChange={(v) => updateLink("githubProfile", v)}
                error={errors[`link-githubProfile`]}
              />
            </div>
            <div className="mt-5">
              <ToggleSwitch
                enabled={data.links.githubEnabled}
                onChange={(v) => updateLink("githubEnabled", v)}
              />
            </div>
          </div>

          {/* Portfolio */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FormInput
                label="Portfolio URL"
                placeholder="Enter Portfolio URL..."
                value={data.links.portfolioUrl}
                onChange={(v) => updateLink("portfolioUrl", v)}
                error={errors[`link-portfolioUrl`]}
              />
            </div>
            <div className="mt-5">
              <ToggleSwitch
                enabled={data.links.portfolioEnabled}
                onChange={(v) => updateLink("portfolioEnabled", v)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="font-medium">Portfolio Description</label>
            <RichTextEditor
              placeholder="Provide Portfolio Description..."
              value={data.links.portfolioDescription}
              onChange={(v) => updateLink("portfolioDescription", v)}
              rows={3}
            />
          </div>

          {/* Publication */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FormInput
                label="Publication URL"
                placeholder="Enter Publication URL..."
                value={data.links.publicationUrl}
                onChange={(v) => updateLink("publicationUrl", v)}
                error={errors[`link-publicationUrl`]}
              />
            </div>
            <div className="mt-5">
              <ToggleSwitch
                enabled={data.links.publicationEnabled}
                onChange={(v) => updateLink("publicationEnabled", v)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="font-medium">Publication Description</label>
            <RichTextEditor
              placeholder="Provide Publication Description..."
              value={data.links.publicationDescription}
              onChange={(v) => updateLink("publicationDescription", v)}
              rows={3}
            />
          </div>
        </div>
      </FormSection>

      {/* TECHNICAL SUMMARY */}
      <FormSection
        title="Technical Summary"
        showToggle={true}
        enabled={data.technicalSummaryEnabled}
        onToggle={(enabled) =>
          onChange({ ...data, technicalSummaryEnabled: enabled })
        }
        showActions={true}
        isCollapsed={technicalSummaryCollapsed}
        onCollapseToggle={() =>
          setTechnicalSummaryCollapsed(!technicalSummaryCollapsed)
        }
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          {technicalSummaryFeedback && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                technicalSummaryFeedback.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {technicalSummaryFeedback}
            </span>
          )}
          {technicalSummaryChanges && (
            <button
              type="button"
              onClick={handleSaveTechnicalSummary}
              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
              title="Save technical summary"
            >
              <Save
                className="w-3 h-3 text-green-600 cursor-pointer"
                strokeWidth={2.5}
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleResetTechnicalSummary}
            className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
            title="Reset to saved value"
          >
            <RotateCcw
              className="w-3 h-3 text-gray-600 cursor-pointer"
              strokeWidth={2.5}
            />
          </button>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label className="font-medium">Technical Summary</label>
          <RichTextEditor
            placeholder="Provide Career Objective"
            value={data.technicalSummary}
            onChange={(v) => onChange({ ...data, technicalSummary: v })}
            rows={5}
          />
        </div>
      </FormSection>
    </div>
  );
};

export default SkillsLinksForm;
