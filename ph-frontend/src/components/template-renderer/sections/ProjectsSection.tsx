import React from 'react';
import Image from 'next/image';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface ProjectItemProps {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags?: string[];
}

interface ProjectsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    items?: ProjectItemProps[];
    layout?: 'grid' | 'list' | 'featured'; // Layout variant
    columns?: number; // Number of columns for grid layout
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
  stylePreset?: any; // New prop for style preset
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (text: string, size = 300, bgColor = '6366f1') => {
  return `https://placehold.co/${size}x${size}/${bgColor}/ffffff?text=${encodeURIComponent(text)}`;
};

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate,
  stylePreset
}) => {
  // Get layout settings or use default
  const layout = data.layout || 'grid';
  const columns = data.columns || 3;

  // Apply style preset
  const borderRadius = stylePreset?.styles?.borderRadius || '0.5rem';
  const boxShadow = stylePreset?.styles?.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.05)';
  const borderWidth = stylePreset?.styles?.borderWidth || '1px';

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle project item updates
  const handleProjectUpdate = (index: number, field: string, value: any) => {
    if (onUpdate && editable) {
      const newItems = [...(data.items || [])];

      if (!newItems[index]) {
        newItems[index] = {
          title: '',
          description: '',
          imageUrl: '',
          projectUrl: '',
          githubUrl: '',
          tags: []
        };
      }

      newItems[index] = {
        ...newItems[index],
        [field]: value
      };

      onUpdate({
        ...data,
        items: newItems
      });
    }
  };

  // Handle adding a new project
  const handleAddProject = () => {
    if (onUpdate && editable) {
      const newItems = [
        ...(data.items || []),
        {
          title: 'New Project',
          description: 'Project description goes here',
          imageUrl: '',
          projectUrl: '',
          githubUrl: '',
          tags: ['tag1', 'tag2']
        }
      ];

      onUpdate({
        ...data,
        items: newItems
      });
    }
  };

  // Handle removing a project
  const handleRemoveProject = (index: number) => {
    if (onUpdate && editable) {
      const newItems = [...(data.items || [])];
      newItems.splice(index, 1);

      onUpdate({
        ...data,
        items: newItems
      });
    }
  };

  // Handle layout change
  const handleLayoutChange = (newLayout: 'grid' | 'list' | 'featured') => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        layout: newLayout
      });
    }
  };

  // Handle columns change
  const handleColumnsChange = (newColumns: number) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        columns: newColumns
      });
    }
  };

  // Render project item based on layout
  const renderProjectItem = (project: ProjectItemProps, index: number, isFeatured = false) => {
    const projectImage = project.imageUrl || createPlaceholderImage(
      project.title || 'Project',
      isFeatured ? 600 : 300
    );

    // Grid/Featured item
    if (layout !== 'list') {
      return (
        <div
          key={project.id || index}
          className={`group overflow-hidden transition-all duration-300 ${
            isFeatured
              ? 'col-span-full mb-8'
              : ''
          }`}
          style={{
            borderRadius,
            boxShadow,
            border: `${borderWidth} solid var(--color-secondary, #e5e7eb)`,
          }}
        >
          <div className={`relative ${isFeatured ? 'aspect-video' : 'aspect-[4/3]'} overflow-hidden bg-muted`}>
            {projectImage && (
              <Image
                src={projectImage}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}

            {editable && (
              <div className="absolute bottom-2 right-2 z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/80 text-xs"
                  onClick={() => {
                    const url = prompt('Enter image URL:', project.imageUrl);
                    if (url !== null) handleProjectUpdate(index, 'imageUrl', url);
                  }}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>

          <div className="p-4">
            <EditableText
              value={project.title || 'Project Title'}
              onChange={(value) => handleProjectUpdate(index, 'title', value)}
              editable={editable}
              className="text-xl font-bold mb-2"
            />

            <EditableText
              value={project.description || 'Project description'}
              onChange={(value) => handleProjectUpdate(index, 'description', value)}
              editable={editable}
              multiline
              className="text-muted-foreground mb-4"
            />

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 bg-muted rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  View Project
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  View Code
                </a>
              )}

              {editable && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleRemoveProject(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // List item
    return (
      <div
        key={project.id || index}
        className="flex flex-col md:flex-row gap-4 mb-6 p-4 transition-all duration-300"
        style={{
          borderRadius,
          boxShadow,
          border: `${borderWidth} solid var(--color-secondary, #e5e7eb)`,
        }}
      >
        <div className="w-full md:w-1/4 relative aspect-video md:aspect-square overflow-hidden bg-muted rounded-md">
          {projectImage && (
            <Image
              src={projectImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          )}

          {editable && (
            <div className="absolute bottom-2 right-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/80 text-xs"
                onClick={() => {
                  const url = prompt('Enter image URL:', project.imageUrl);
                  if (url !== null) handleProjectUpdate(index, 'imageUrl', url);
                }}
              >
                Change Image
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <EditableText
            value={project.title || 'Project Title'}
            onChange={(value) => handleProjectUpdate(index, 'title', value)}
            editable={editable}
            className="text-xl font-bold mb-2"
          />

          <EditableText
            value={project.description || 'Project description'}
            onChange={(value) => handleProjectUpdate(index, 'description', value)}
            editable={editable}
            multiline
            className="text-muted-foreground mb-4"
          />

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="px-2 py-1 bg-muted rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Project
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                View Code
              </a>
            )}

            {editable && (
              <Button
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => handleRemoveProject(index)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render layout selector for editable mode
  const renderLayoutSelector = () => {
    if (!editable) return null;

    return (
      <div className="mb-6 p-4 bg-muted/20 border rounded-lg">
        <h4 className="text-sm font-medium mb-3">Project Layout</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={layout === 'grid' ? 'default' : 'outline'}
            onClick={() => handleLayoutChange('grid')}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={layout === 'list' ? 'default' : 'outline'}
            onClick={() => handleLayoutChange('list')}
          >
            List
          </Button>
          <Button
            size="sm"
            variant={layout === 'featured' ? 'default' : 'outline'}
            onClick={() => handleLayoutChange('featured')}
          >
            Featured
          </Button>
        </div>

        {layout === 'grid' && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Grid Columns</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map(col => (
                <Button
                  key={col}
                  size="sm"
                  variant={columns === col ? 'default' : 'outline'}
                  onClick={() => handleColumnsChange(col)}
                >
                  {col}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the appropriate layout
  const renderProjects = () => {
    const projects = data.items || [];

    if (projects.length === 0) {
      return (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No projects added yet. Add your first project to showcase your work.
          </p>
          {editable && (
            <Button onClick={handleAddProject}>
              Add Project
            </Button>
          )}
        </div>
      );
    }

    // Featured layout: first project is featured, rest are in grid
    if (layout === 'featured' && projects.length > 0) {
      return (
        <div className="space-y-8">
          {/* Featured project */}
          {renderProjectItem(projects[0], 0, true)}

          {/* Grid for remaining projects */}
          {projects.length > 1 && (
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`
              }}
            >
              {projects.slice(1).map((project, index) =>
                renderProjectItem(project, index + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    // Grid layout
    if (layout === 'grid') {
      return (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`
          }}
        >
          {projects.map((project, index) =>
            renderProjectItem(project, index)
          )}
        </div>
      );
    }

    // List layout
    return (
      <div className="space-y-6">
        {projects.map((project, index) =>
          renderProjectItem(project, index)
        )}
      </div>
    );
  };

  return (
    <section
      className="py-16 w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="projects"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-start mb-8">
          <EditableText
            value={data.title || 'Projects'}
            onChange={(value) => handleTextUpdate('title', value)}
            editable={editable}
            className="text-3xl font-bold mb-3"
          />

          {data.subtitle && (
            <EditableText
              value={data.subtitle}
              onChange={(value) => handleTextUpdate('subtitle', value)}
              editable={editable}
              className="text-xl text-muted-foreground"
            />
          )}
        </div>

        {renderLayoutSelector()}
        {renderProjects()}

        {editable && data.items && data.items.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={handleAddProject}>
              Add Another Project
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
