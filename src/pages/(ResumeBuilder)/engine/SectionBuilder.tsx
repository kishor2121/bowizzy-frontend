import React from 'react';

/**
 * Utility function to split long text into chunks
 */
export const splitText = (text?: string, chunkSize = 400): string[] => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let cur = '';
  
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > chunkSize) {
      if (cur.trim()) chunks.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
};

/**
 * Utility function to format month-year dates
 */
export const formatMonthYear = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
};

/**
 * Base Section Component Props
 * Extended by specific section components
 */
interface BaseSectionProps {
  styles?: {
    heading?: React.CSSProperties;
    subHeading?: React.CSSProperties;
    text?: React.CSSProperties;
    container?: React.CSSProperties;
  };
}

/**
 * Section Heading Component
 */
export const SectionHeading: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <h3
    style={{
      fontSize: '0.875rem',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
      color: 'rgb(17, 24, 39)',
      ...style,
    }}
  >
    {children}
  </h3>
);

/**
 * Section Heading with Border (for right column)
 */
export const SectionHeadingBordered: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <h3
    style={{
      fontSize: '1rem',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
      color: 'rgb(17, 24, 39)',
      borderBottom: '1px solid rgb(209, 213, 219)',
      paddingBottom: '0.25rem',
      ...style,
    }}
  >
    {children}
  </h3>
);

/**
 * Contact Section Component
 */
interface ContactSectionProps extends BaseSectionProps {
  address?: string;
  email?: string;
  phone?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  address,
  email,
  phone,
  styles,
}) => {
  if (!address && !email && !phone) return null;

  return (
    <div style={styles?.container}>
      <SectionHeading style={styles?.heading}>Contact</SectionHeading>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'rgb(55, 65, 81)',
          ...styles?.text,
        }}
      >
        {address && (
          <p style={{ lineHeight: '1.5', wordBreak: 'break-word' }}>
            {address}
          </p>
        )}
        {email && (
          <p style={{ lineHeight: '1.5', wordBreak: 'break-word' }}>{email}</p>
        )}
        {phone && <p>{phone}</p>}
      </div>
    </div>
  );
};

/**
 * Skills Section Component
 */
interface SkillsSectionProps extends BaseSectionProps {
  skills: Array<{ skillName: string; skillLevel?: string; enabled?: boolean }>;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  styles,
}) => {
  const enabledSkills = skills.filter(s => s.enabled !== false && s.skillName.trim());
  
  if (enabledSkills.length === 0) return null;

  return (
    <div style={styles?.container}>
      <SectionHeading style={styles?.heading}>Skills</SectionHeading>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}
      >
        {enabledSkills.map((skill, idx) => (
          <div
            key={idx}
            style={{
              fontSize: '0.75rem',
              color: 'rgb(55, 65, 81)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              ...styles?.text,
            }}
          >
            <span>{skill.skillName}</span>
            {skill.skillLevel && (
              <span
                style={{
                  fontSize: '10px',
                  color: 'rgb(107, 114, 128)',
                }}
              >
                {skill.skillLevel}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Languages Section Component
 */
interface LanguagesSectionProps extends BaseSectionProps {
  languages: string[];
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  styles,
}) => {
  if (!languages || languages.length === 0) return null;

  return (
    <div style={styles?.container}>
      <SectionHeading style={styles?.heading}>Languages</SectionHeading>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}
      >
        {languages.map((lang, idx) => (
          <div
            key={idx}
            style={{
              fontSize: '0.75rem',
              color: 'rgb(55, 65, 81)',
              ...styles?.text,
            }}
          >
            {lang}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * About Me Section Component
 */
interface AboutSectionProps extends BaseSectionProps {
  content: string;
  showHeading?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  content,
  showHeading = true,
  styles,
}) => {
  if (!content) return null;

  return (
    <div style={styles?.container}>
      {showHeading && <SectionHeading style={styles?.heading}>About Me</SectionHeading>}
      <p
        style={{
          fontSize: '0.75rem',
          color: 'rgb(55, 65, 81)',
          lineHeight: '1.5',
          ...styles?.text,
        }}
      >
        {content}
      </p>
    </div>
  );
};

/**
 * Links Section Component
 */
interface LinksSectionProps extends BaseSectionProps {
  links: {
    linkedinEnabled?: boolean;
    linkedinProfile?: string;
    githubEnabled?: boolean;
    githubProfile?: string;
    portfolioEnabled?: boolean;
    portfolioUrl?: string;
    portfolioDescription?: string;
  };
}

export const LinksSection: React.FC<LinksSectionProps> = ({ links, styles }) => {
  const hasLinks =
    (links.linkedinEnabled && links.linkedinProfile) ||
    (links.githubEnabled && links.githubProfile) ||
    (links.portfolioEnabled && links.portfolioUrl);

  if (!hasLinks) return null;

  return (
    <div style={styles?.container}>
      <SectionHeading style={styles?.heading}>Links</SectionHeading>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'rgb(55, 65, 81)',
        }}
      >
        {links.linkedinEnabled && links.linkedinProfile && (
          <div>
            <p style={{ fontWeight: '600', color: 'rgb(31, 41, 55)' }}>
              LinkedIn
            </p>
            <p style={{ wordBreak: 'break-word', color: 'rgb(37, 99, 235)' }}>
              {links.linkedinProfile}
            </p>
          </div>
        )}
        {links.githubEnabled && links.githubProfile && (
          <div>
            <p style={{ fontWeight: '600', color: 'rgb(31, 41, 55)' }}>
              GitHub
            </p>
            <p style={{ wordBreak: 'break-word', color: 'rgb(37, 99, 235)' }}>
              {links.githubProfile}
            </p>
          </div>
        )}
        {links.portfolioEnabled && links.portfolioUrl && (
          <div>
            <p style={{ fontWeight: '600', color: 'rgb(31, 41, 55)' }}>
              Portfolio
            </p>
            <p style={{ wordBreak: 'break-word', color: 'rgb(37, 99, 235)' }}>
              {links.portfolioUrl}
            </p>
            {links.portfolioDescription && (
              <p style={{ marginTop: '0.25rem', color: 'rgb(75, 85, 99)' }}>
                {links.portfolioDescription}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Header Section Component (Name + Job Title)
 */
interface HeaderSectionProps extends BaseSectionProps {
  fullName: string;
  jobTitle?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  fullName,
  jobTitle,
  styles,
}) => {
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  return (
    <div style={styles?.container}>
      <h1
        style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: 'rgb(17, 24, 39)',
          lineHeight: '1.25',
          ...styles?.heading,
        }}
      >
        {firstName}
        {lastName && (
          <>
            <br />
            {lastName}
          </>
        )}
      </h1>
      {jobTitle && (
        <p
          style={{
            fontSize: '1rem',
            color: 'rgb(55, 65, 81)',
            marginTop: '0.25rem',
            ...styles?.text,
          }}
        >
          {jobTitle}
        </p>
      )}
    </div>
  );
};

/**
 * Date Range Display Component
 */
export const DateRange: React.FC<{
  startDate?: string;
  endDate?: string;
  currentlyActive?: boolean;
  style?: React.CSSProperties;
}> = ({ startDate, endDate, currentlyActive, style }) => {
  if (!startDate && !endDate && !currentlyActive) return null;

  return (
    <span
      style={{
        fontSize: '0.75rem',
        color: 'rgb(75, 85, 99)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {startDate && formatMonthYear(startDate)} -{' '}
      {currentlyActive ? 'Present' : endDate ? formatMonthYear(endDate) : ''}
    </span>
  );
};