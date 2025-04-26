import React from 'react';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface ExperienceSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    experiences?: Array<{
      role: string;
      company: string;
      location?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      achievements?: string[];
    }>;
    variant?: 'timeline' | 'cards' | 'compact';
    showLocation?: boolean;
    showAchievements?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'cards' : 'timeline');

  // Ensure we have experiences array - handle both experiences and items formats
  let experiences = data.experiences || [];

  // If no experiences but we have items, use those instead (common alternative format)
  if ((!experiences || experiences.length === 0) && data.items && data.items.length > 0) {
    console.log("Using items as experiences in ExperienceSection:", data.items);
    experiences = data.items;
  }

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle experience update
  const handleExperienceUpdate = (index: number, field: string, value: string | boolean) => {
    if (onUpdate && editable) {
      const newExperiences = [...experiences];

      if (!newExperiences[index]) {
        newExperiences[index] = {
          role: '',
          company: '',
          startDate: new Date().toISOString().split('T')[0],
        };
      }

      // If updating to current job, clear the end date
      if (field === 'current' && value === true) {
        newExperiences[index] = {
          ...newExperiences[index],
          current: true,
          endDate: undefined
        };
      } else if (field === 'current' && value === false) {
        newExperiences[index] = {
          ...newExperiences[index],
          current: false,
          endDate: new Date().toISOString().split('T')[0]
        };
      } else {
        newExperiences[index] = {
          ...newExperiences[index],
          [field]: value
        };
      }

      onUpdate({
        ...data,
        experiences: newExperiences
      });
    }
  };

  // Handle adding an achievement to an experience
  const handleAddAchievement = (experienceIndex: number) => {
    if (onUpdate && editable) {
      const newExperiences = [...experiences];
      const experience = { ...newExperiences[experienceIndex] };
      const achievements = [...(experience.achievements || [])];

      achievements.push('New achievement');
      experience.achievements = achievements;
      newExperiences[experienceIndex] = experience;

      onUpdate({
        ...data,
        experiences: newExperiences
      });
    }
  };

  // Handle updating an achievement
  const handleUpdateAchievement = (experienceIndex: number, achievementIndex: number, value: string) => {
    if (onUpdate && editable) {
      const newExperiences = [...experiences];
      const experience = { ...newExperiences[experienceIndex] };
      const achievements = [...(experience.achievements || [])];

      achievements[achievementIndex] = value;
      experience.achievements = achievements;
      newExperiences[experienceIndex] = experience;

      onUpdate({
        ...data,
        experiences: newExperiences
      });
    }
  };

  // Handle removing an achievement
  const handleRemoveAchievement = (experienceIndex: number, achievementIndex: number) => {
    if (onUpdate && editable) {
      const newExperiences = [...experiences];
      const experience = { ...newExperiences[experienceIndex] };
      const achievements = [...(experience.achievements || [])];

      achievements.splice(achievementIndex, 1);
      experience.achievements = achievements;
      newExperiences[experienceIndex] = experience;

      onUpdate({
        ...data,
        experiences: newExperiences
      });
    }
  };

  // Handle adding a new experience
  const handleAddExperience = () => {
    if (onUpdate && editable) {
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);

      const newExperiences = [
        ...experiences,
        {
          role: 'New Position',
          company: 'Company Name',
          location: 'Location',
          startDate: startDate.toISOString().split('T')[0],
          endDate: currentDate.toISOString().split('T')[0],
          description: 'Describe your responsibilities and accomplishments in this role.',
          achievements: ['Achievement 1', 'Achievement 2']
        }
      ];

      onUpdate({
        ...data,
        experiences: newExperiences
      });
    }
  };

  // Handle removing an experience
  const handleRemoveExperience = (index: number) => {
    if (onUpdate && editable) {
      const newExperiences = [...experiences];
      newExperiences.splice(index, 1);

      onUpdate({
        ...data,
        experiences: newExperiences
      });
    }
  };

  // Format date string for display
  const formatDate = (dateString?: string, current?: boolean) => {
    if (current) return 'Present';
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  // Render timeline layout
  const renderTimelineLayout = () => {
    return (
      <div className="space-y-8">
        {experiences.map((experience, index) => (
          <div key={index} className="relative pl-8 pb-8 border-l border-muted last:border-0">
            {/* Circle marker on timeline */}
            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>

            {/* Date range */}
            <div className="text-sm text-muted-foreground mb-2">
              <EditableText
                value={formatDate(experience.startDate)}
                onChange={(value) => handleExperienceUpdate(index, 'startDate', value)}
                editable={editable}
                className="inline"
              />
              {' — '}
              {experience.current ? (
                <span>Present</span>
              ) : (
                <EditableText
                  value={formatDate(experience.endDate)}
                  onChange={(value) => handleExperienceUpdate(index, 'endDate', value)}
                  editable={editable}
                  className="inline"
                />
              )}
              {editable && (
                <label className="ml-4 inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={experience.current || false}
                    onChange={(e) => handleExperienceUpdate(index, 'current', e.target.checked)}
                    className="mr-1 h-3 w-3"
                  />
                  <span className="text-xs">Current</span>
                </label>
              )}
            </div>

            {/* Position & Company */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <div>
                <EditableText
                  value={experience.role}
                  onChange={(value) => handleExperienceUpdate(index, 'role', value)}
                  editable={editable}
                  className="font-bold text-lg"
                />
                <span className="mx-1">at</span>
                <EditableText
                  value={experience.company}
                  onChange={(value) => handleExperienceUpdate(index, 'company', value)}
                  editable={editable}
                  className="font-medium"
                />
              </div>

              {editable && (
                <button
                  className="text-red-500 p-1 rounded hover:bg-red-50 mt-2 md:mt-0"
                  onClick={() => handleRemoveExperience(index)}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Location (optional) */}
            {data.showLocation !== false && experience.location && (
              <div className="text-sm text-muted-foreground mb-3">
                <EditableText
                  value={experience.location}
                  onChange={(value) => handleExperienceUpdate(index, 'location', value)}
                  editable={editable}
                  className=""
                />
              </div>
            )}

            {/* Description */}
            <EditableText
              value={experience.description || ''}
              onChange={(value) => handleExperienceUpdate(index, 'description', value)}
              editable={editable}
              multiline
              className="text-muted-foreground mb-4"
            />

            {/* Achievements (optional) */}
            {data.showAchievements !== false && (experience.achievements?.length || editable) && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Key Achievements:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {experience.achievements?.map((achievement, achievementIndex) => (
                    <li key={achievementIndex} className="relative group">
                      <EditableText
                        value={achievement}
                        onChange={(value) => handleUpdateAchievement(index, achievementIndex, value)}
                        editable={editable}
                        className="text-muted-foreground"
                      />
                      {editable && (
                        <button
                          className="absolute top-0 right-0 text-red-500 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveAchievement(index, achievementIndex)}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                  {editable && (
                    <li>
                      <button
                        className="text-primary hover:underline text-sm"
                        onClick={() => handleAddAchievement(index)}
                      >
                        + Add Achievement
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}

        {editable && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleAddExperience}
              className="w-full md:w-auto"
            >
              + Add Experience
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render cards layout
  const renderCardsLayout = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiences.map((experience, index) => (
          <div key={index} className="border rounded-lg p-6 relative">
            {editable && (
              <button
                className="absolute top-2 right-2 text-red-500 font-bold p-1 rounded hover:bg-red-50"
                onClick={() => handleRemoveExperience(index)}
              >
                ✕
              </button>
            )}

            <div className="text-sm text-muted-foreground mb-2">
              <EditableText
                value={formatDate(experience.startDate)}
                onChange={(value) => handleExperienceUpdate(index, 'startDate', value)}
                editable={editable}
                className="inline"
              />
              {' — '}
              {experience.current ? (
                <span>Present</span>
              ) : (
                <EditableText
                  value={formatDate(experience.endDate)}
                  onChange={(value) => handleExperienceUpdate(index, 'endDate', value)}
                  editable={editable}
                  className="inline"
                />
              )}
              {editable && (
                <label className="ml-4 inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={experience.current || false}
                    onChange={(e) => handleExperienceUpdate(index, 'current', e.target.checked)}
                    className="mr-1 h-3 w-3"
                  />
                  <span className="text-xs">Current</span>
                </label>
              )}
            </div>

            <EditableText
              value={experience.role}
              onChange={(value) => handleExperienceUpdate(index, 'role', value)}
              editable={editable}
              className="font-bold text-lg mb-1"
            />

            <EditableText
              value={experience.company}
              onChange={(value) => handleExperienceUpdate(index, 'company', value)}
              editable={editable}
              className="font-medium mb-2"
            />

            {data.showLocation !== false && (
              <div className="text-sm text-muted-foreground mb-3">
                <EditableText
                  value={experience.location || 'Location'}
                  onChange={(value) => handleExperienceUpdate(index, 'location', value)}
                  editable={editable}
                  className=""
                />
              </div>
            )}

            <EditableText
              value={experience.description || ''}
              onChange={(value) => handleExperienceUpdate(index, 'description', value)}
              editable={editable}
              multiline
              className="text-muted-foreground text-sm mb-3"
            />

            {data.showAchievements !== false && (experience.achievements?.length || editable) && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Key Achievements:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {experience.achievements?.map((achievement, achievementIndex) => (
                    <li key={achievementIndex} className="relative group">
                      <EditableText
                        value={achievement}
                        onChange={(value) => handleUpdateAchievement(index, achievementIndex, value)}
                        editable={editable}
                        className="text-muted-foreground"
                      />
                      {editable && (
                        <button
                          className="absolute top-0 right-0 text-red-500 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveAchievement(index, achievementIndex)}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                  {editable && (
                    <li>
                      <button
                        className="text-primary hover:underline text-sm"
                        onClick={() => handleAddAchievement(index)}
                      >
                        + Add Achievement
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}

        {editable && (
          <div className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20"
            onClick={handleAddExperience}
          >
            <span className="text-muted-foreground">+ Add Experience</span>
          </div>
        )}
      </div>
    );
  };

  // Render compact layout
  const renderCompactLayout = () => {
    return (
      <div className="space-y-4">
        {experiences.map((experience, index) => (
          <div key={index} className="border-b pb-4 last:border-0 relative">
            {editable && (
              <button
                className="absolute top-0 right-0 text-red-500 font-bold p-1 rounded hover:bg-red-50"
                onClick={() => handleRemoveExperience(index)}
              >
                ✕
              </button>
            )}

            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <div>
                <EditableText
                  value={experience.role}
                  onChange={(value) => handleExperienceUpdate(index, 'role', value)}
                  editable={editable}
                  className="font-bold"
                />
                <span className="mx-1">at</span>
                <EditableText
                  value={experience.company}
                  onChange={(value) => handleExperienceUpdate(index, 'company', value)}
                  editable={editable}
                  className="font-medium"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <EditableText
                  value={formatDate(experience.startDate)}
                  onChange={(value) => handleExperienceUpdate(index, 'startDate', value)}
                  editable={editable}
                  className="inline"
                />
                {' — '}
                {experience.current ? (
                  <span>Present</span>
                ) : (
                  <EditableText
                    value={formatDate(experience.endDate)}
                    onChange={(value) => handleExperienceUpdate(index, 'endDate', value)}
                    editable={editable}
                    className="inline"
                  />
                )}
                {editable && (
                  <label className="ml-2 inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={experience.current || false}
                      onChange={(e) => handleExperienceUpdate(index, 'current', e.target.checked)}
                      className="mr-1 h-3 w-3"
                    />
                    <span className="text-xs">Current</span>
                  </label>
                )}
              </div>
            </div>

            {data.showLocation !== false && experience.location && (
              <div className="text-sm text-muted-foreground mb-2">
                <EditableText
                  value={experience.location}
                  onChange={(value) => handleExperienceUpdate(index, 'location', value)}
                  editable={editable}
                  className=""
                />
              </div>
            )}

            <EditableText
              value={experience.description || ''}
              onChange={(value) => handleExperienceUpdate(index, 'description', value)}
              editable={editable}
              multiline
              className="text-muted-foreground text-sm"
            />
          </div>
        ))}

        {editable && (
          <div className="mt-4">
            <button
              className="text-primary hover:underline"
              onClick={handleAddExperience}
            >
              + Add Experience
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render the experience section based on variant
  const renderExperiences = () => {
    switch (variant) {
      case 'cards':
        return renderCardsLayout();
      case 'compact':
        return renderCompactLayout();
      case 'timeline':
      default:
        return renderTimelineLayout();
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="experience"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10">
          <EditableText
            value={data.title || 'Work Experience'}
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

        {renderExperiences()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Experience Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="timeline">Timeline</option>
            <option value="cards">Cards</option>
            <option value="compact">Compact</option>
          </select>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showLocation"
              checked={data.showLocation !== false}
              onChange={(e) => onUpdate?.({ ...data, showLocation: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showLocation" className="text-xs">Show Location</label>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showAchievements"
              checked={data.showAchievements !== false}
              onChange={(e) => onUpdate?.({ ...data, showAchievements: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showAchievements" className="text-xs">Show Achievements</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExperienceSection;
