import type { TemplateConfig } from '../../engine/types';

/**
 * Modern Professional Template Configuration
 * ONLY visual styling - NO logic
 */
export const modernProfessionalConfig: TemplateConfig = {
  id: 'modern-professional',
  name: 'Modern Professional',
  
  // Column layout
  columns: {
    left: {
      width: '35%',
      backgroundColor: '#F5E6D3',
      padding: '1.5rem',
    },
    right: {
      width: '65%',
      backgroundColor: 'white',
      padding: '1.5rem',
    },
  },
  
  // Spacing
  spacing: {
    sectionGap: '1rem',
    padding: '1.5rem',
  },
  
  // Typography
  styles: {
    headingFont: 'Baloo 2, system-ui, sans-serif',
    bodyFont: 'Baloo 2, system-ui, sans-serif',
    accentColor: '#3b82f6',
  },
  
  // Page dimensions
  pageConfig: {
    width: '210mm',  // A4 width
    height: '297mm', // A4 height
    pageHeightPx: 1122, // 297mm at 96dpi
  },
};