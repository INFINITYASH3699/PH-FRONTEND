import React from 'react';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface EducationSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    education?: Array<{
      degree: string;
      institution: string;
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

const EducationSection: React.FC<EducationSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'cards' : 'timeline');

  // Ensure we have education array
  const education = data.education || [];

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle education item update
  const handleEducationUpdate = (index: number, field: string, value: string | boolean) => {
    if (onUpdate && editable) {
      const newEducation = [...education];

      if (!newEducation[index]) {
        newEducation[index] = {
          degree: '',
          institution: '',
          startDate: new Date().toISOString().split('T')[0],
        };
      }

      // If updating to current education, clear the end date
      if (field === 'current' && value === true) {
        newEducation[index] = {
          ...newEducation[index],
          current: true,
          endDate: undefined
        };
      } else if (field === 'current' && value === false) {
        newEducation[index] = {
          ...newEducation[index],
          current: false,
          endDate: new Date().toISOString().split('T')[0]
        };
      } else {
        newEducation[index] = {
          ...newEducation[index],
          [field]: value
        };
      }

      onUpdate({
        ...data,
        education: newEducation
      });
    }
  };

  // Handle adding an achievement
  const handleAddAchievement = (educationIndex: number) => {
    if (onUpdate && editable) {
      const newEducation = [...education];
      const educationItem = { ...newEducation[educationIndex] };
      const achievements = [...(educationItem.achievements || [])];

      achievements.push('New achievement');
      educationItem.achievements = achievements;
      newEducation[educationIndex] = educationItem;

      onUpdate({
        ...data,
        education: newEducation
      });
    }
  };

  // Handle updating an achievement
  const handleUpdateAchievement = (educationIndex: number, achievementIndex: number, value: string) => {
    if (onUpdate && editable) {
      const newEducation = [...education];
      const educationItem = { ...newEducation[educationIndex] };
      const achievements = [...(educationItem.achievements || [])];

      achievements[achievementIndex] = value;
      educationItem.achievements = achievements;
      newEducation[educationIndex] = educationItem;

      onUpdate({
        ...data,
        education: newEducation
      });
    }
  };

  // Handle removing an achievement
  const handleRemoveAchievement = (educationIndex: number, achievementIndex: number) => {
    if (onUpdate && editable) {
      const newEducation = [...education];
      const educationItem = { ...newEducation[educationIndex] };
      const achievements = [...(educationItem.achievements || [])];

      achievements.splice(achievementIndex, 1);
      educationItem.achievements = achievements;
      newEducation[educationIndex] = educationItem;

      onUpdate({
        ...data,
        education: newEducation
      });
    }
  };

  // Handle adding a new education item
  const handleAddEducation = () => {
    if (onUpdate && editable) {
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 3);

      const newEducation = [
        ...education,
        {
          degree: 'Bachelor of Science',
          institution: 'University Name',
          location: 'City, Country',
          startDate: startDate.toISOString().split('T')[0],
          endDate: currentDate.toISOString().split('T')[0],
          description: 'Relevant coursework, thesis, or other details about your education.',
          achievements: ['Academic achievement 1', 'Academic achievement 2']
        }
      ];

      onUpdate({
        ...data,
        education: newEducation
      });
    }
  };

  // Handle removing an education item
  const handleRemoveEducation = (index: number) => {
    if (onUpdate && editable) {
      const newEducation = [...education];
      newEducation.splice(index, 1);

      onUpdate({
        ...data,
        education: newEducation
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
        {education.map((item, index) => (
          <div key={index} className="relative pl-8 pb-8 border-l border-muted last:border-0">
            {/* Circle marker on timeline */}
            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>

            {/* Date range */}
            <div className="text-sm text-muted-foreground mb-2">
              <EditableText
                value={formatDate(item.startDate)}
                onChange={(value) => handleEducationUpdate(index, 'startDate', value)}
                editable={editable}
                className="inline"
              />
              {' — '}
              {item.current ? (
                <span>Present</span>
              ) : (
                <EditableText
                  value={formatDate(item.endDate)}
                  onChange={(value) => handleEducationUpdate(index, 'endDate', value)}
                  editable={editable}
                  className="inline"
                />
              )}
              {editable && (
                <label className="ml-4 inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={item.current || false}
                    onChange={(e) => handleEducationUpdate(index, 'current', e.target.checked)}
                    className="mr-1 h-3 w-3"
                  />
                  <span className="text-xs">Current</span>
                </label>
              )}
            </div>

            {/* Degree & Institution */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <div>
                <EditableText
                  value={item.degree}
                  onChange={(value) => handleEducationUpdate(index, 'degree', value)}
                  editable={editable}
                  className="font-bold text-lg"
                />
                <span className="mx-1">at</span>
                <EditableText
                  value={item.institution}
                  onChange={(value) => handleEducationUpdate(index, 'institution', value)}
                  editable={editable}
                  className="font-medium"
                />
              </div>

              {editable && (
                <button
                  className="text-red-500 p-1 rounded hover:bg-red-50 mt-2 md:mt-0"
                  onClick={() => handleRemoveEducation(index)}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Location (optional) */}
            {data.showLocation !== false && item.location && (
              <div className="text-sm text-muted-foreground mb-3">
                <EditableText
                  value={item.location}
                  onChange={(value) => handleEducationUpdate(index, 'location', value)}
                  editable={editable}
                  className=""
                />
              </div>
            )}

            {/* Description */}
            {item.description && (
              <EditableText
                value={item.description}
                onChange={(value) => handleEducationUpdate(index, 'description', value)}
                editable={editable}
                multiline
                className="text-muted-foreground mb-4"
              />
            )}

            {/* Achievements (optional) */}
            {data.showAchievements !== false && (item.achievements?.length || editable) && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Achievements & Activities:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {item.achievements?.map((achievement, achievementIndex) => (
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
              onClick={handleAddEducation}
              className="w-full md:w-auto"
            >
              + Add Education
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
        {education.map((item, index) => (
          <div key={index} className="border rounded-lg p-6 relative">
            {editable && (
              <button
                className="absolute top-2 right-2 text-red-500 font-bold p-1 rounded hover:bg-red-50"
                onClick={() => handleRemoveEducation(index)}
              >
                ✕
              </button>
            )}

            <div className="text-sm text-muted-foreground mb-2">
              <EditableText
                value={formatDate(item.startDate)}
                onChange={(value) => handleEducationUpdate(index, 'startDate', value)}
                editable={editable}
                className="inline"
              />
              {' — '}
              {item.current ? (
                <span>Present</span>
              ) : (
                <EditableText
                  value={formatDate(item.endDate)}
                  onChange={(value) => handleEducationUpdate(index, 'endDate', value)}
                  editable={editable}
                  className="inline"
                />
              )}
              {editable && (
                <label className="ml-4 inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={item.current || false}
                    onChange={(e) => handleEducationUpdate(index, 'current', e.target.checked)}
                    className="mr-1 h-3 w-3"
                  />
                  <span className="text-xs">Current</span>
                </label>
              )}
            </div>

            <EditableText
              value={item.degree}
              onChange={(value) => handleEducationUpdate(index, 'degree', value)}
              editable={editable}
              className="font-bold text-lg mb-1"
            />

            <EditableText
              value={item.institution}
              onChange={(value) => handleEducationUpdate(index, 'institution', value)}
              editable={editable}
              className="font-medium mb-2"
            />

            {data.showLocation !== false && (
              <div className="text-sm text-muted-foreground mb-3">
                <EditableText
                  value={item.location || 'Location'}
                  onChange={(value) => handleEducationUpdate(index, 'location', value)}
                  editable={editable}
                  className=""
                />
              </div>
            )}

            {item.description && (
              <EditableText
                value={item.description}
                onChange={(value) => handleEducationUpdate(index, 'description', value)}
                editable={editable}
                multiline
                className="text-muted-foreground text-sm mb-3"
              />
            )}

            {data.showAchievements !== false && (item.achievements?.length || editable) && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Achievements & Activities:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {item.achievements?.map((achievement, achievementIndex) => (
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
            onClick={handleAddEducation}
          >
            <span className="text-muted-foreground">+ Add Education</span>
          </div>
        )}
      </div>
    );
  };

  // Render compact layout
  const renderCompactLayout = () => {
    return (
      <div className="space-y-4">
        {education.map((item, index) => (
          <div key={index} className="border-b pb-4 last:border-0 relative">
            {editable && (
              <button
                className="absolute top-0 right-0 text-red-500 font-bold p-1 rounded hover:bg-red-50"
                onClick={() => handleRemoveEducation(index)}
              >
                ✕
              </button>
            )}

            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <div>
                <EditableText
                  value={item.degree}
                  onChange={(value) => handleEducationUpdate(index, 'degree', value)}
                  editable={editable}
                  className="font-bold"
                />
                <span className="mx-1">at</span>
                <EditableText
                  value={item.institution}
                  onChange={(value) => handleEducationUpdate(index, 'institution', value)}
                  editable={editable}
                  className="font-medium"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <EditableText
                  value={formatDate(item.startDate)}
                  onChange={(value) => handleEducationUpdate(index, 'startDate', value)}
                  editable={editable}
                  className="inline"
                />
                {' — '}
                {item.current ? (
                  <span>Present</span>
                ) : (
                  <EditableText
                    value={formatDate(item.endDate)}
                    onChange={(value) => handleEducationUpdate(index, 'endDate', value)}
                    editable={editable}
                    className="inline"
                  />
                )}
                {editable && (
                  <label className="ml-2 inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={item.current || false}
                      onChange={(e) => handleEducationUpdate(index, 'current', e.target.checked)}
                      className="mr-1 h-3 w-3"
                    />
                    <span className="text-xs">Current</span>
                  </label>
                )}
              </div>
            </div>

            {data.showLocation !== false && item.location && (
              <div className="text-sm text-muted-foreground mb-2">
                <EditableText
                  value={item.location}
                  onChange={(value) => handleEducationUpdate(index, 'location', value)}
                  editable={editable}
                  className=""
                />
              </div>
            )}

            {item.description && (
              <EditableText
                value={item.description}
                onChange={(value) => handleEducationUpdate(index, 'description', value)}
                editable={editable}
                multiline
                className="text-muted-foreground text-sm"
              />
            )}
          </div>
        ))}

        {editable && (
          <div className="mt-4">
            <button
              className="text-primary hover:underline"
              onClick={handleAddEducation}
            >
              + Add Education
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render the education section based on variant
  const renderEducation = () => {
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
      id="education"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10">
          <EditableText
            value={data.title || 'Education'}
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

        {renderEducation()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Education Style</div>
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

export default EducationSection;
