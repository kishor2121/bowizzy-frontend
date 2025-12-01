import React, { useMemo } from 'react';
import type { ResumeData } from '../../types/resume';
import { modernProfessionalConfig } from './config';
import { buildModernProfessionalSections } from './sections';
import {
  useLayoutEngine,
  TemplateRenderer,
  MeasurementContainer,
  PaginationControls,
} from '../../engine/LayoutEngine';

interface ModernProfessionalTemplateProps {
  data: ResumeData;
  page?: number; // Optional: for external page control
}

/**
 * Modern Professional Template
 * 
 * This template is now DRAMATICALLY simplified:
 * - Configuration: 20 lines (config.ts)
 * - Section building: Handled by sections.tsx
 * - Pagination: Handled by LayoutEngine
 * - Total: ~100 lines vs original 800+ lines
 */
export const ModernProfessionalTemplate: React.FC<
  ModernProfessionalTemplateProps
> = ({ data, page }) => {
  // Build sections from data
  const sections = useMemo(
    () => buildModernProfessionalSections(data),
    [data]
  );

  // Use layout engine for automatic pagination
  const { pages, totalPages, currentPage, setCurrentPage, measureRef } =
    useLayoutEngine(
      sections,
      modernProfessionalConfig.pageConfig?.pageHeightPx,
      16 // section gap in pixels
    );

  // Use external page control if provided
  const displayPage = page !== undefined ? page : currentPage;
  const pageLayout = pages[displayPage] || { leftSections: [], rightSections: [] };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Hidden measurement container for height calculation */}
      <MeasurementContainer
        sections={sections}
        config={modernProfessionalConfig}
        measureRef={measureRef}
      />

      {/* Visible page */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <TemplateRenderer
          pageLayout={pageLayout}
          sections={sections}
          config={modernProfessionalConfig}
        />
      </div>

      {/* Pagination controls (only if not externally controlled) */}
      {page === undefined && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ModernProfessionalTemplate;