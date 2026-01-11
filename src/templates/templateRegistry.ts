import Template1Display from './display/Template1Display';
import Template2Display from './display/Template2Display';
import Template3Display from './display/Template3Display';
import Template4Display from './display/Template4Display';
import Template5Display from './display/Template5Display';
import Template6Display from './display/Template6Display';
import Template7Display from './display/Template7Display';
import Template8Display from './display/Template8Display';
import Template9Display from './display/Template9Display';
import Template10Display from './display/Template10Display';
import Template11Display from './display/Template11Display';
import Template12Display from './display/Template12Display';
import Template1PDF from './pdf/Template1PDF';
import Template12PDF from './pdf/Template12PDF';
import Template13Display from './display/Template13Display';
import Template13PDF from './pdf/Template13PDF';
import Template14Display from './display/Template14Display';
import Template14PDF from './pdf/Template14PDF';
import Template15Display from './display/Template15Display';
import Template15PDF from './pdf/Template15PDF';
import Template16Display from './display/Template16Display';
import Template16PDF from './pdf/Template16PDF';
import Template17Display from './display/Template17Display';
import Template17PDF from './pdf/Template17PDF';
import Template2PDF from './pdf/Template2PDF';
import Template3PDF from './pdf/Template3PDF';
import Template4PDF from './pdf/Template4PDF';
import Template5PDF from './pdf/Template5PDF';
import Template6PDF from './pdf/Template6PDF';
import Template7PDF from './pdf/Template7PDF';
import Template8PDF from './pdf/Template8PDF';
import Template9PDF from './pdf/Template9PDF';
import Template10PDF from './pdf/Template10PDF';
import Template11PDF from './pdf/Template11PDF';

export interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  component?: React.ComponentType<any>; 
  displayComponent: React.ComponentType<any>; 
  pdfComponent?: React.ComponentType<any>; 
  pageCount?: number;
  supportsPhoto?: boolean;
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
    supportsPhoto: false,
  },
  {
    id: 'template2',
    name: 'Modern Minimalist',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template2.jpg',
    displayComponent: Template2Display,
    pdfComponent: Template2PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template3',
    name: 'Creative Designer',
    category: 'Creative',
    thumbnail: './resume-templates/thumbnails/template3.jpg',
    displayComponent: Template3Display,
    pdfComponent: Template3PDF,
    pageCount: 1,
    supportsPhoto: true,
  },
  {
    id: 'template4',
    name: 'Two-Column Corporate Resume',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template4.jpg',
    displayComponent: Template4Display,
    pdfComponent: Template4PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template5',
    name: 'Classic Serif Resume',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template5.jpg',
    displayComponent: Template5Display,
    pdfComponent: Template5PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template6',
    name: 'Classic Two-Column',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template6.jpg',
    displayComponent: Template6Display,
    pdfComponent: Template6PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template7',
    name: 'Two-Column Professional',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template7.jpg',
    displayComponent: Template7Display,
    pdfComponent: Template7PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template8',
    name: 'Modern Single Column',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template8.jpg',
    displayComponent: Template8Display,
    pdfComponent: Template8PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template9',
    name: 'Sidebar Professional',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template9.jpg',
    displayComponent: Template9Display,
    pdfComponent: Template9PDF,
    pageCount: 1,
    supportsPhoto: true,
  },
  {
    id: 'template10',
    name: 'Modern Sidebar Dark',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template10.jpg',
    displayComponent: Template10Display,
    pdfComponent: Template10PDF,
    pageCount: 1,
    supportsPhoto: true,
  },  
  {
    id: 'template11',
    name: 'Classic Professional',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template11.jpg',
    displayComponent: Template11Display,
    pdfComponent: Template11PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template12',
    name: 'Classic Professional',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template12.jpg',
    displayComponent: Template12Display,
    pdfComponent: Template12PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
    {
    id: 'template13',
    name: 'Classic Professional',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template13.jpg',
    displayComponent: Template13Display,
    pdfComponent: Template13PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template14',
    name: 'Left Header Classic (Red Accent)',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template14.jpg',
    displayComponent: Template14Display,
    pdfComponent: Template14PDF,
    pageCount: 1,
    supportsPhoto: false,
  },  {
    id: 'template15',
    name: 'Centered Blue Classic',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template15.jpg',
    displayComponent: Template15Display,
    pdfComponent: Template15PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template16',
    name: 'Professional Left Header',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template16.jpg',
    displayComponent: Template16Display,
    pdfComponent: Template16PDF,
    pageCount: 1,
    supportsPhoto: false,
  },
  {
    id: 'template17',
    name: 'Sidebar Minimal Classic',
    category: 'Professional',
    thumbnail: '/resume-templates/thumbnails/template17.jpg',
    displayComponent: Template17Display,
    pdfComponent: Template17PDF,
    pageCount: 1,
    supportsPhoto: false,
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