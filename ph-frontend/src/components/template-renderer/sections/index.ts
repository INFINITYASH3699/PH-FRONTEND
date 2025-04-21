import HeaderSection from './HeaderSection';
import AboutSection from './AboutSection';

// Import all section components
// We now have HeaderSection and AboutSection implemented, the rest are placeholders
// In a real implementation, you would create and import all these components

// Placeholder component factory function
const createPlaceholderSection = (sectionName: string) => {
  const PlaceholderSection = (props: any) => {
    return (
      <div className="border rounded-lg p-6 bg-muted/30">
        <h2 className="text-xl font-semibold mb-4 capitalize">{sectionName} Section</h2>
        <p className="text-muted-foreground mb-4">
          This is a placeholder for the {sectionName} section component.
          {props.editable && 'You can edit this section when implemented.'}
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

// Define section components
const ProjectsSection = createPlaceholderSection('projects');
const SkillsSection = createPlaceholderSection('skills');
const ExperienceSection = createPlaceholderSection('experience');
const EducationSection = createPlaceholderSection('education');
const ContactSection = createPlaceholderSection('contact');
const GallerySection = createPlaceholderSection('gallery');
const ServicesSection = createPlaceholderSection('services');
const TestimonialsSection = createPlaceholderSection('testimonials');
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
  ServicesSection,
  TestimonialsSection,
  WorkSection,
  ClientsSection
};
