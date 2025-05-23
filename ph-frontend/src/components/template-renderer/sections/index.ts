import HeaderSection from './HeaderSection';
import AboutSection from './AboutSection';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import ContactSection from './ContactSection';
import EducationSection from './EducationSection';
import GallerySection from './GallerySection';
import TestimonialsSection from './TestimonialsSection';
import ServicesSection from './ServicesSection';
import NavbarSection from './NavbarSection';
import FooterSection from './FooterSection';


// Placeholder component factory function
const createPlaceholderSection = (sectionName: string) => {
  const PlaceholderSection = (props: any) => {
    return (
      <div className="border rounded-lg p-6 bg-muted/30">
        <h2 className="text-xl font-semibold mb-4 capitalize">{sectionName} Section</h2>
        <p className="text-muted-foreground mb-4">
          This is a placeholder for the {sectionName} section component.
          {props.editable && ' You can edit this section when implemented.'}
        </p>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(props.data || {}, null, 2)}
        </pre>
      </div>
    );
  };

  PlaceholderSection.displayName = `${sectionName}Section`;
  return PlaceholderSection;
};

// Define remaining placeholder section components
const WorkSection = createPlaceholderSection('work');
const ClientsSection = createPlaceholderSection('clients');

// Export all components
export {
  HeaderSection,
  AboutSection,
  ProjectsSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ContactSection,
  GallerySection,
  TestimonialsSection,
  ServicesSection,
  WorkSection,
  ClientsSection,
  NavbarSection,
  FooterSection
};
