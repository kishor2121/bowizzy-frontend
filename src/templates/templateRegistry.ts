import ModernProfessionalTemplate from './ModernProfessionalTemplate';

export interface TemplateInfo {
  id: string;
  name: string;
  thumbnailUrl: string;
  component: React.ComponentType<any>;
  category: string;
  description?: string;
}

export const TEMPLATE_REGISTRY: TemplateInfo[] = [
  {
    id: 'modern-professional',
    name: 'Professional',
    thumbnailUrl: '/resume-templates/thumbnails/modern-professional.png',
    component: ModernProfessionalTemplate,
    category: 'Professional',
    description: 'A clean two-column layout perfect for marketing and business professionals'
  },
  { 
    id: 'twopage',
    name: 'Professional',
    thumbnailUrl: '/resume-templates/thumbnails/modern-professional.png',
    component: ModernProfessionalTemplate,
    category: 'Professional',
    description: 'A clean two-column layout perfect for marketing and business professionals'

  },
];

export const getTemplateById = (id: string): TemplateInfo | undefined => {
  return TEMPLATE_REGISTRY.find(template => template.id === id);
};

export const getAllTemplates = (): TemplateInfo[] => {
  return TEMPLATE_REGISTRY;
};

export const getTemplatesByCategory = (category: string): TemplateInfo[] => {
  return TEMPLATE_REGISTRY.filter(template => template.category === category);
};