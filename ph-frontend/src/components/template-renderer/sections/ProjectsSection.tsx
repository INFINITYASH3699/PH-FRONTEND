import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable/EditableText';

interface ProjectSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    projects?: Array<{
      title: string;
      description: string;
      image?: string;
      link?: string;
      tags?: string[];
    }>;
    variant?: 'grid' | 'list' | 'cards' | 'minimal';
    columns?: '2' | '3' | '4';
    showTags?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (text: string, size = 400, bgColor = '6366f1') => {
  return `https://placehold.co/${size}x${size}/${bgColor}/ffffff?text=${encodeURIComponent(text)}`;
};

const ProjectsSection: React.FC<ProjectSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'cards' :
     template.category === 'photographer' ? 'grid' : 'list');

  // Determine columns
  const columns = data.columns || '3';

  // Ensure we have projects array
  const projects = data.projects || [];

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle project update
  const handleProjectUpdate = (index: number, field: string, value: string) => {
    if (onUpdate && editable) {
      const newProjects = [...projects];

      if (!newProjects[index]) {
        newProjects[index] = { title: '', description: '' };
      }

      newProjects[index] = {
        ...newProjects[index],
        [field]: value
      };

      onUpdate({
        ...data,
        projects: newProjects
      });
    }
  };

  // Handle image update for a project
  const handleImageUpdate = (index: number, url: string) => {
    if (onUpdate && editable) {
      const newProjects = [...projects];

      if (!newProjects[index]) {
        newProjects[index] = { title: '', description: '' };
      }

      newProjects[index] = {
        ...newProjects[index],
        image: url
      };

      onUpdate({
        ...data,
        projects: newProjects
      });
    }
  };

  // Handle adding a new project
  const handleAddProject = () => {
    if (onUpdate && editable) {
      const newProjects = [
        ...projects,
        {
          title: 'New Project',
          description: 'Project description goes here',
          image: createPlaceholderImage('Project'),
          tags: ['tag1', 'tag2']
        }
      ];

      onUpdate({
        ...data,
        projects: newProjects
      });
    }
  };

  // Handle removing a project
  const handleRemoveProject = (index: number) => {
    if (onUpdate && editable) {
      const newProjects = [...projects];
      newProjects.splice(index, 1);

      onUpdate({
        ...data,
        projects: newProjects
      });
    }
  };

  // Handle adding a tag to a project
  const handleAddTag = (projectIndex: number) => {
    if (onUpdate && editable) {
      const newProjects = [...projects];
      const project = { ...newProjects[projectIndex] };
      const tags = [...(project.tags || [])];

      const newTag = prompt('Enter new tag:');
      if (newTag) {
        tags.push(newTag);
        project.tags = tags;
        newProjects[projectIndex] = project;

        onUpdate({
          ...data,
          projects: newProjects
        });
      }
    }
  };

  // Handle removing a tag from a project
  const handleRemoveTag = (projectIndex: number, tagIndex: number) => {
    if (onUpdate && editable) {
      const newProjects = [...projects];
      const project = { ...newProjects[projectIndex] };
      const tags = [...(project.tags || [])];

      tags.splice(tagIndex, 1);
      project.tags = tags;
      newProjects[projectIndex] = project;

      onUpdate({
        ...data,
        projects: newProjects
      });
    }
  };

  // Get column class based on columns setting
  const getColumnClass = () => {
    switch (columns) {
      case '2':
        return 'grid-cols-1 md:grid-cols-2';
      case '4':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case '3':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Render projects based on variant
  const renderProjects = () => {
    switch (variant) {
      case 'grid':
        return (
          <div className={`grid ${getColumnClass()} gap-6`}>
            {projects.map((project, index) => (
              <div key={index} className="overflow-hidden rounded-lg bg-muted/30 relative">
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 font-bold p-1 rounded-full hover:bg-red-50"
                    onClick={() => handleRemoveProject(index)}
                  >
                    ✕
                  </button>
                )}
                <div className="relative aspect-[4/3] bg-muted">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {editable && (
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/80 text-xs"
                        onClick={() => {
                          const url = prompt('Enter image URL:', project.image);
                          if (url) handleImageUpdate(index, url);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <EditableText
                    value={project.title}
                    onChange={(value) => handleProjectUpdate(index, 'title', value)}
                    editable={editable}
                    className="font-bold text-lg mb-2"
                  />
                  {data.showTags !== false && project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="inline-flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                          {editable && (
                            <button
                              className="text-red-500 ml-1 text-xs"
                              onClick={() => handleRemoveTag(index, tagIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {editable && (
                        <button
                          className="px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/70"
                          onClick={() => handleAddTag(index)}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}
                  <EditableText
                    value={project.description}
                    onChange={(value) => handleProjectUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground text-sm"
                  />
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {editable && (
              <div
                className="aspect-[4/3] border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddProject}
              >
                <span className="text-muted-foreground">+ Add Project</span>
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-8">
            {projects.map((project, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 relative">
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 font-bold p-1 rounded-full hover:bg-red-50"
                    onClick={() => handleRemoveProject(index)}
                  >
                    ✕
                  </button>
                )}
                {project.image && (
                  <div className="relative w-full md:w-1/3 h-48 rounded-lg bg-muted overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    {editable && (
                      <div className="absolute bottom-2 right-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/80 text-xs"
                          onClick={() => {
                            const url = prompt('Enter image URL:', project.image);
                            if (url) handleImageUpdate(index, url);
                          }}
                        >
                          Change Image
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <EditableText
                    value={project.title}
                    onChange={(value) => handleProjectUpdate(index, 'title', value)}
                    editable={editable}
                    className="font-bold text-xl mb-2"
                  />
                  {data.showTags !== false && project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="inline-flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                          {editable && (
                            <button
                              className="text-red-500 ml-1 text-xs"
                              onClick={() => handleRemoveTag(index, tagIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {editable && (
                        <button
                          className="px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/70"
                          onClick={() => handleAddTag(index)}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}
                  <EditableText
                    value={project.description}
                    onChange={(value) => handleProjectUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground"
                  />
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {editable && (
              <div
                className="p-6 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddProject}
              >
                <span className="text-muted-foreground">+ Add Project</span>
              </div>
            )}
          </div>
        );

      case 'cards':
        return (
          <div className={`grid ${getColumnClass()} gap-6`}>
            {projects.map((project, index) => (
              <div key={index} className="rounded-lg shadow-md overflow-hidden relative">
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 font-bold p-1 rounded-full hover:bg-red-50"
                    onClick={() => handleRemoveProject(index)}
                  >
                    ✕
                  </button>
                )}
                {project.image && (
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    {editable && (
                      <div className="absolute bottom-2 right-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/80 text-xs"
                          onClick={() => {
                            const url = prompt('Enter image URL:', project.image);
                            if (url) handleImageUpdate(index, url);
                          }}
                        >
                          Change Image
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 bg-muted/5">
                  <EditableText
                    value={project.title}
                    onChange={(value) => handleProjectUpdate(index, 'title', value)}
                    editable={editable}
                    className="font-bold text-lg mb-2"
                  />
                  {data.showTags !== false && project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="inline-flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                          {editable && (
                            <button
                              className="text-red-500 ml-1 text-xs"
                              onClick={() => handleRemoveTag(index, tagIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {editable && (
                        <button
                          className="px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/70"
                          onClick={() => handleAddTag(index)}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}
                  <EditableText
                    value={project.description}
                    onChange={(value) => handleProjectUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground text-sm line-clamp-3"
                  />
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {editable && (
              <div
                className="rounded-lg border border-dashed p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 aspect-video"
                onClick={handleAddProject}
              >
                <span className="text-muted-foreground text-lg mb-2">+ Add Project</span>
                <span className="text-muted-foreground text-sm text-center">
                  Click to add a new project
                </span>
              </div>
            )}
          </div>
        );

      case 'minimal':
        return (
          <div className="space-y-8">
            {projects.map((project, index) => (
              <div key={index} className="border-b pb-6 mb-6 last:border-0 relative">
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 font-bold p-1 rounded-full hover:bg-red-50"
                    onClick={() => handleRemoveProject(index)}
                  >
                    ✕
                  </button>
                )}
                <EditableText
                  value={project.title}
                  onChange={(value) => handleProjectUpdate(index, 'title', value)}
                  editable={editable}
                  className="font-bold text-xl mb-2"
                />
                {data.showTags !== false && project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className="inline-flex items-center">
                        <span className="text-sm text-muted-foreground">
                          #{tag}
                        </span>
                        {editable && (
                          <button
                            className="text-red-500 ml-1 text-xs"
                            onClick={() => handleRemoveTag(index, tagIndex)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editable && (
                      <button
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => handleAddTag(index)}
                      >
                        + Add Tag
                      </button>
                    )}
                  </div>
                )}
                <EditableText
                  value={project.description}
                  onChange={(value) => handleProjectUpdate(index, 'description', value)}
                  editable={editable}
                  multiline
                  className="text-muted-foreground text-sm"
                />
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-primary hover:underline"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}
            {editable && (
              <div
                className="p-4 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddProject}
              >
                <span className="text-muted-foreground">+ Add Project</span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="projects"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10">
          <EditableText
            value={data.title || 'Projects'}
            onChange={(value) => handleTextUpdate('title', value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
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

        {renderProjects()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Projects Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="cards">Cards</option>
            <option value="minimal">Minimal</option>
          </select>

          <div className="text-xs font-medium mb-1">Columns</div>
          <select
            value={columns}
            onChange={(e) => onUpdate?.({ ...data, columns: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showTags"
              checked={data.showTags !== false}
              onChange={(e) => onUpdate?.({ ...data, showTags: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showTags" className="text-xs">Show Tags</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectsSection;
