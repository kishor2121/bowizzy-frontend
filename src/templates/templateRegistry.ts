import Template1Display from './display/Template1Display';
import Template2Display from './display/Template2Display';
import Template3Display from './display/Template3Display';
import Template4Display from './display/Template4Display';
import Template5Display from './display/Template5Display';
import Template6Display from './display/Template6Display';
import Template1PDF from './pdf/Template1PDF';
import Template2PDF from './pdf/Template2PDF';
import Template3PDF from './pdf/Template3PDF';
import Template4PDF from './pdf/Template4PDF';
import Template5PDF from './pdf/Template5PDF';
import Template6PDF from './pdf/Template6PDF';

export interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  component?: React.ComponentType<any>; 
  displayComponent: React.ComponentType<any>; 
  pdfComponent?: React.ComponentType<any>; 
  pageCount?: number;
}

// Template Registry
const TEMPLATE_REGISTRY: TemplateInfo[] = [
  {
    id: 'template1',
    name: 'Executive Professional',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template1.jpg',
    component: Template1Display,
    displayComponent: Template1Display,
    pdfComponent: Template1PDF,
    pageCount: 1,
  },
  {
    id: 'template2',
    name: 'Modern Minimalist',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template2.jpg',
    displayComponent: Template2Display,
    pdfComponent: Template2PDF,
    pageCount: 1,
  },
  {
    id: 'template3',
    name: 'Creative Designer',
    category: 'Creative',
    thumbnail: './resume-templates/thumbnails/template3.jpg',
    displayComponent: Template3Display,
    pdfComponent: Template3PDF,
    pageCount: 1,
  },
  {
    id: 'template4',
    name: 'Two-Column Corporate Resume',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template4.jpg',
    displayComponent: Template4Display,
    pdfComponent: Template4PDF,
    pageCount: 1,
  },
  {
    id: 'template5',
    name: 'Classic Serif Resume',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template5.jpg',
    displayComponent: Template5Display,
    pdfComponent: Template5PDF,
    pageCount: 1,
  },
  {
    id: 'template6',
    name: 'Classic Two-Column',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template6.jpg',
    displayComponent: Template6Display,
    pdfComponent: Template6PDF,
    pageCount: 1,
  },
  // Add more templates here...
];

export const getTemplateById = (id: string): TemplateInfo | undefined => {
  return TEMPLATE_REGISTRY.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateInfo[] => {
  return TEMPLATE_REGISTRY.filter(template => template.category === category);
};

export const getAllTemplates = (): TemplateInfo[] => {
  return TEMPLATE_REGISTRY;
};

export default TEMPLATE_REGISTRY;