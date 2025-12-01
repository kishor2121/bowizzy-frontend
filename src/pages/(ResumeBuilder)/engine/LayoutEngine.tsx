// engine/LayoutEngine.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ResumeSection, PageLayout, LayoutEngineResult, TemplateConfig } from './types';

/**
 * 
 * This is the heart of the resume builder system.
 * It handles automatic pagination for ALL templates.
 * 
 * How it works:
 * 1. Renders sections in a hidden container
 * 2. Measures their actual heights
 * 3. Splits them into pages based on A4 height (1122px)
 * 4. Returns page layouts for rendering
 */
export const useLayoutEngine = (
  sections: ResumeSection[],
  pageHeightPx: number = 1122, // A4 height at 96dpi
  sectionGapPx: number = 16     // Gap between sections in pixels
): LayoutEngineResult => {
  const [pages, setPages] = useState<PageLayout[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Guard: No sections or no measurement container
    if (!measureRef.current || sections.length === 0) {
      setPages([{ leftSections: [], rightSections: [] }]);
      return;
    }

    // Separate sections by column
    const leftSections = sections.filter(s => s.column === 'left');
    const rightSections = sections.filter(s => s.column === 'right');

    /**
     * Measure the actual rendered height of each section
     */
    const measureSections = (
      sectionList: ResumeSection[], 
      containerIndex: 0 | 1 // 0 for left, 1 for right
    ): { key: string; height: number }[] => {
      const container = measureRef.current?.children[containerIndex];
      if (!container) return [];

      return sectionList.map((section, idx) => {
        const element = container.children[idx] as HTMLElement;
        const height = element?.offsetHeight || 0;
        
        return { key: section.key, height };
      });
    };

    const leftMeasurements = measureSections(leftSections, 0);
    const rightMeasurements = measureSections(rightSections, 1);

    /**
     * Split sections into pages based on height
     * Algorithm: Greedy - keep adding sections until page is full
     */
    const splitToPages = (
      measurements: { key: string; height: number }[]
    ): string[][] => {
      const pageGroups: string[][] = [];
      let currentPageSections: string[] = [];
      let currentHeight = 0;

      measurements.forEach(({ key, height }) => {
        // Add gap to height (except for first item on page)
        const heightWithGap = currentPageSections.length === 0 
          ? height 
          : height + sectionGapPx;
        
        // Check if adding this section would exceed page height
        if (currentHeight + heightWithGap > pageHeightPx && currentPageSections.length > 0) {
          // Page is full - start new page
          pageGroups.push(currentPageSections);
          currentPageSections = [];
          currentHeight = 0;
        }

        // Add section to current page
        currentPageSections.push(key);
        currentHeight += heightWithGap;
      });

      // Add remaining sections to last page
      if (currentPageSections.length > 0) {
        pageGroups.push(currentPageSections);
      }

      return pageGroups.length > 0 ? pageGroups : [[]];
    };

    const leftPages = splitToPages(leftMeasurements);
    const rightPages = splitToPages(rightMeasurements);

    /**
     * Combine left and right pages into page layouts
     * Each page shows whatever sections fit in left and right columns
     */
    const totalPagesCount = Math.max(leftPages.length, rightPages.length);
    const layouts: PageLayout[] = [];

    for (let i = 0; i < totalPagesCount; i++) {
      layouts.push({
        leftSections: leftPages[i] || [],
        rightSections: rightPages[i] || [],
      });
    }

    setPages(layouts);
    
    // Reset to first page when content changes
    setCurrentPage(0);
  }, [sections, pageHeightPx, sectionGapPx]);

  return {
    pages,
    totalPages: pages.length,
    currentPage,
    setCurrentPage,
    measureRef,
  };
};

/**
 * 
 * Generic component that renders a single page based on:
 * - pageLayout: which sections to show
 * - sections: the actual section content
 * - config: visual styling (colors, spacing, etc.)
 */
interface TemplateRendererProps {
  pageLayout: PageLayout;
  sections: ResumeSection[];
  config: TemplateConfig;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  pageLayout,
  sections,
  config,
}) => {
  // Helper to find section by key
  const getSectionByKey = (key: string) => sections.find(s => s.key === key);

  const pageWidth = config.pageConfig?.width || '210mm';
  const pageHeight = config.pageConfig?.height || '297mm';

  return (
    <div
      style={{
        width: pageWidth,
        height: pageHeight,
        backgroundColor: 'white',
        margin: '0 auto',
        boxShadow: '0 0 8px rgba(0,0,0,0.15)',
        display: 'flex',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Left Column */}
      <div
        style={{
          width: config.columns.left.width,
          backgroundColor: config.columns.left.backgroundColor,
          padding: config.columns.left.padding,
          boxSizing: 'border-box',
          height: pageHeight,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1 }}>
          {pageLayout.leftSections.map((key) => {
            const section = getSectionByKey(key);
            return section ? <div key={key}>{section.content}</div> : null;
          })}
        </div>
      </div>

      {/* Right Column */}
      <div
        style={{
          width: config.columns.right.width,
          backgroundColor: config.columns.right.backgroundColor,
          padding: config.columns.right.padding,
          boxSizing: 'border-box',
          height: pageHeight,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1 }}>
          {pageLayout.rightSections.map((key) => {
            const section = getSectionByKey(key);
            return section ? <div key={key}>{section.content}</div> : null;
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * 
 * This component renders all sections in a hidden container
 * so we can measure their heights before pagination.
 * 
 * Why? Because we can't know how tall content will be until
 * the browser renders it. Different text lengths, fonts, etc.
 * all affect the final height.
 */
interface MeasurementContainerProps {
  sections: ResumeSection[];
  config: TemplateConfig;
  measureRef: React.RefObject<HTMLDivElement>;
}

export const MeasurementContainer: React.FC<MeasurementContainerProps> = ({
  sections,
  config,
  measureRef,
}) => {
  const leftSections = sections.filter(s => s.column === 'left');
  const rightSections = sections.filter(s => s.column === 'right');

  const pageWidth = config.pageConfig?.width || '210mm';
  const pageHeight = config.pageConfig?.height || '297mm';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: -9999, // Move off-screen
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={measureRef}
        style={{
          width: pageWidth,
          height: pageHeight,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {/* Left Column Measurement */}
        <div
          style={{
            width: config.columns.left.width,
            padding: config.columns.left.padding,
            backgroundColor: config.columns.left.backgroundColor,
            display: 'flex',
            height: pageHeight,
            flexDirection: 'column',
            gap: config.spacing.sectionGap,
            boxSizing: 'border-box',
          }}
        >
          {leftSections.map((section) => (
            <div key={section.key}>{section.content}</div>
          ))}
        </div>

        {/* Right Column Measurement */}
        <div
          style={{
            width: config.columns.right.width,
            padding: config.columns.right.padding,
            backgroundColor: config.columns.right.backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            gap: config.spacing.sectionGap,
            height: pageHeight,
            boxSizing: 'border-box',
          }}
        >
          {rightSections.map((section) => (
            <div key={section.key}>{section.content}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 
 * UI controls for navigating between pages.
 * Automatically hides if only one page exists.
 */
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Don't show controls if only one page
  if (totalPages <= 1) return null;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        style={{
          padding: '0.5rem 0.75rem',
          backgroundColor: currentPage === 0 ? '#d1d5db' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (currentPage !== 0) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 0) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        ← Prev
      </button>

      {/* Page Number Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: currentPage === i ? '#1f2937' : '#e5e7eb',
              color: currentPage === i ? 'white' : 'rgb(55, 65, 81)',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: currentPage === i ? '700' : '600',
              minWidth: '2.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== i) {
                e.currentTarget.style.backgroundColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== i) {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        style={{
          padding: '0.5rem 0.75rem',
          backgroundColor:
            currentPage === totalPages - 1 ? '#d1d5db' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor:
            currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages - 1) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages - 1) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        Next →
      </button>

      {/* Page Counter */}
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'rgb(55, 65, 81)',
          marginLeft: '0.5rem',
        }}
      >
        Page {currentPage + 1} of {totalPages}
      </span>
    </div>
  );
};



/**
 * Calculate total height needed for sections
 * Useful for debugging pagination issues
 */
export const calculateTotalHeight = (
  sections: ResumeSection[],
  measureRef: React.RefObject<HTMLDivElement>,
  column: 'left' | 'right',
  sectionGapPx: number = 16
): number => {
  if (!measureRef.current) return 0;

  const containerIndex = column === 'left' ? 0 : 1;
  const container = measureRef.current.children[containerIndex];
  if (!container) return 0;

  let totalHeight = 0;
  const filteredSections = sections.filter(s => s.column === column);

  filteredSections.forEach((_, idx) => {
    const element = container.children[idx] as HTMLElement;
    const height = element?.offsetHeight || 0;
    totalHeight += height + (idx > 0 ? sectionGapPx : 0);
  });

  return totalHeight;
};

/**
 * Get sections for a specific page
 * Useful for external pagination control
 */
export const getSectionsForPage = (
  sections: ResumeSection[],
  pageLayout: PageLayout
): { left: ResumeSection[]; right: ResumeSection[] } => {
  const left = pageLayout.leftSections
    .map(key => sections.find(s => s.key === key))
    .filter((s): s is ResumeSection => s !== undefined);

  const right = pageLayout.rightSections
    .map(key => sections.find(s => s.key === key))
    .filter((s): s is ResumeSection => s !== undefined);

  return { left, right };
};


export type {
  TemplateRendererProps,
  MeasurementContainerProps,
  PaginationControlsProps,
};