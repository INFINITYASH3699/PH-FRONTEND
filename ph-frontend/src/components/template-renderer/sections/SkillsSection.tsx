import React from 'react';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface SkillsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    skills?: Array<{
      name: string;
      level?: number;
      category?: string;
    }>;
    variant?: 'tags' | 'bars' | 'categories' | 'grid';
    showLevels?: boolean;
    categorized?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'categories' :
     template.category === 'developer' ? 'bars' : 'tags');

  // Ensure we have skills array
  const skills = data.skills || [];

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle skill update
  const handleSkillUpdate = (index: number, field: string, value: string | number) => {
    if (onUpdate && editable) {
      const newSkills = [...skills];

      if (!newSkills[index]) {
        newSkills[index] = { name: '' };
      }

      newSkills[index] = {
        ...newSkills[index],
        [field]: value
      };

      onUpdate({
        ...data,
        skills: newSkills
      });
    }
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (onUpdate && editable) {
      const newSkills = [
        ...skills,
        {
          name: 'New Skill',
          level: 75,
          category: 'Other'
        }
      ];

      onUpdate({
        ...data,
        skills: newSkills
      });
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (index: number) => {
    if (onUpdate && editable) {
      const newSkills = [...skills];
      newSkills.splice(index, 1);

      onUpdate({
        ...data,
        skills: newSkills
      });
    }
  };

  // Get unique categories from skills
  const getCategories = () => {
    const categories = new Set<string>();
    skills.forEach(skill => {
      if (skill.category) {
        categories.add(skill.category);
      } else {
        categories.add('Other');
      }
    });
    return Array.from(categories);
  };

  // Render skills in a tags layout
  const renderTagsLayout = () => {
    return (
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="px-4 py-2 bg-muted/40 rounded-full relative flex items-center"
          >
            {editable && (
              <button
                className="absolute -top-2 -right-2 text-red-500 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-50"
                onClick={() => handleRemoveSkill(index)}
              >
                ✕
              </button>
            )}
            <EditableText
              value={skill.name}
              onChange={(value) => handleSkillUpdate(index, 'name', value)}
              editable={editable}
              className="font-medium"
            />
            {data.showLevels && skill.level !== undefined && (
              <span className="ml-2 text-xs text-muted-foreground">{skill.level}%</span>
            )}
          </div>
        ))}
        {editable && (
          <button
            className="px-4 py-2 border border-dashed rounded-full hover:bg-muted/20 text-muted-foreground"
            onClick={handleAddSkill}
          >
            + Add Skill
          </button>
        )}
      </div>
    );
  };

  // Render skills with progress bars
  const renderBarsLayout = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, index) => (
          <div key={index} className="relative">
            {editable && (
              <button
                className="absolute -top-2 -right-2 text-red-500 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-50"
                onClick={() => handleRemoveSkill(index)}
              >
                ✕
              </button>
            )}
            <div className="flex justify-between mb-1.5">
              <EditableText
                value={skill.name}
                onChange={(value) => handleSkillUpdate(index, 'name', value)}
                editable={editable}
                className="font-medium"
              />
              {data.showLevels && skill.level !== undefined && (
                <span className="text-sm text-muted-foreground">{skill.level}%</span>
              )}
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${skill.level || 0}%` }}
              ></div>
            </div>
            {editable && data.showLevels && (
              <input
                type="range"
                min="0"
                max="100"
                value={skill.level || 50}
                onChange={(e) => handleSkillUpdate(index, 'level', parseInt(e.target.value, 10))}
                className="w-full mt-1"
              />
            )}
          </div>
        ))}
        {editable && (
          <div
            className="h-12 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
            onClick={handleAddSkill}
          >
            <span className="text-muted-foreground">+ Add Skill</span>
          </div>
        )}
      </div>
    );
  };

  // Render skills organized by categories
  const renderCategoriesLayout = () => {
    const categories = getCategories();

    return (
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{category}</h3>
            <div className="flex flex-wrap gap-3">
              {skills
                .filter(skill => (skill.category || 'Other') === category)
                .map((skill, index) => {
                  const skillIndex = skills.findIndex(s => s === skill);
                  return (
                    <div
                      key={skillIndex}
                      className="px-4 py-2 bg-muted/40 rounded-full relative flex items-center"
                    >
                      {editable && (
                        <button
                          className="absolute -top-2 -right-2 text-red-500 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-50"
                          onClick={() => handleRemoveSkill(skillIndex)}
                        >
                          ✕
                        </button>
                      )}
                      <EditableText
                        value={skill.name}
                        onChange={(value) => handleSkillUpdate(skillIndex, 'name', value)}
                        editable={editable}
                        className="font-medium"
                      />
                      {editable && (
                        <select
                          value={skill.category || 'Other'}
                          onChange={(e) => handleSkillUpdate(skillIndex, 'category', e.target.value)}
                          className="ml-2 text-xs p-1 border rounded bg-transparent"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="New Category">+ New Category</option>
                        </select>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
        {editable && (
          <div className="mt-4 flex gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddSkill}
            >
              + Add Skill
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newCategory = prompt('Enter new category name:');
                if (newCategory) {
                  const newSkill = {
                    name: 'New Skill',
                    level: 75,
                    category: newCategory
                  };
                  onUpdate?.({
                    ...data,
                    skills: [...skills, newSkill]
                  });
                }
              }}
            >
              + Add Category
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render skills in a grid layout
  const renderGridLayout = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-muted/10 text-center relative"
          >
            {editable && (
              <button
                className="absolute top-2 right-2 text-red-500 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-50"
                onClick={() => handleRemoveSkill(index)}
              >
                ✕
              </button>
            )}
            <EditableText
              value={skill.name}
              onChange={(value) => handleSkillUpdate(index, 'name', value)}
              editable={editable}
              className="font-medium text-lg"
            />
            {data.showLevels && skill.level !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${skill.level || 0}%` }}
                  ></div>
                </div>
                {editable && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.level || 50}
                    onChange={(e) => handleSkillUpdate(index, 'level', parseInt(e.target.value, 10))}
                    className="w-full mt-1"
                  />
                )}
              </div>
            )}
          </div>
        ))}
        {editable && (
          <div
            className="p-4 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20 h-full"
            onClick={handleAddSkill}
          >
            <span className="text-muted-foreground">+ Add Skill</span>
          </div>
        )}
      </div>
    );
  };

  // Render the skills section based on variant
  const renderSkills = () => {
    switch (variant) {
      case 'bars':
        return renderBarsLayout();
      case 'categories':
        return renderCategoriesLayout();
      case 'grid':
        return renderGridLayout();
      case 'tags':
      default:
        return renderTagsLayout();
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="skills"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10">
          <EditableText
            value={data.title || 'Skills'}
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

        {renderSkills()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Skills Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="tags">Tags</option>
            <option value="bars">Progress Bars</option>
            <option value="categories">Categories</option>
            <option value="grid">Grid</option>
          </select>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showLevels"
              checked={data.showLevels !== false}
              onChange={(e) => onUpdate?.({ ...data, showLevels: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showLevels" className="text-xs">Show Levels</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default SkillsSection;
