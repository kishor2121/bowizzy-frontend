import React from 'react';

/**
 * Represents a single content section in the resume
 */
export interface ResumeSection {
  key: string;
  type: 'header' | 'contact' | 'about' | 'education' | 'experience' | 
        'skills' | 'projects' | 'certifications' | 'languages' | 
        'links' | 'technical' | 'publications' | 'personal';
  content: React.ReactNode;
  column: 'left' | 'right';
  priority?: number;
  breakable?: boolean; // Can split across pages
}

/**
 * Page layout structure - which sections appear on which page
 */
export interface PageLayout {
  leftSections: string[];   // Section keys for left column
  rightSections: string[];  // Section keys for right column
}

/**
 * Template visual configuration
 */
export interface TemplateConfig {
  id: string;
  name: string;
  
  // Column configuration
  columns: {
    left: {
      width: string;        // e.g., "35%"
      backgroundColor: string;
      padding: string;
    };
    right: {
      width: string;
      backgroundColor: string;
      padding: string;
    };
  };
  
  // Spacing configuration
  spacing: {
    sectionGap: string;     // Gap between sections
    padding: string;        // Page padding
  };
  
  // Typography and colors
  styles: {
    headingFont?: string;
    bodyFont?: string;
    accentColor?: string;
  };
  
  // Page configuration
  pageConfig?: {
    width: string;          // e.g., "210mm" for A4
    height: string;         // e.g., "297mm" for A4
    pageHeightPx: number;   // Height in pixels for calculations
  };
}

/**
 * Hook return type for useLayoutEngine
 */
export interface LayoutEngineResult {
  pages: PageLayout[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  measureRef: React.RefObject<HTMLDivElement>;
}

/**
 * Section builder function type
 */
export type SectionBuilderFunction = (data: any) => ResumeSection | ResumeSection[] | null;