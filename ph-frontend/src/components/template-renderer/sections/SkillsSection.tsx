import React from 'react';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface SkillCategory {
  name: string;
  skills: Array<{
    name: string;
    proficiency?: number;
  }>;
}

interface SkillsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    categories?: SkillCategory[];
    display?: 'bars' | 'tags' | 'categories'; // Display type for rendering skills
    showProficiency?: boolean; // Whether to show proficiency levels
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
  stylePreset?: any; // Style preset
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate,
  stylePreset
}) => {
  // Get display type or use default based on template category
  const display = data.display ||
    (template.category === 'developer' ? 'bars' :
     template.category === 'designer' ? 'categories' : 'tags');

  // Apply style preset
  const borderRadius = stylePreset?.styles?.borderRadius || '0.5rem';
  const boxShadow = stylePreset?.styles?.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.05)';
  const borderWidth = stylePreset?.styles?.borderWidth || '1px';

  // Show proficiency by default for bars, but can be overridden
  const showProficiency = data.showProficiency !== false && display === 'bars';

  // Ensure we have categories
  const categories = data.categories || [];

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle adding a category
  const handleAddCategory = () => {
    if (onUpdate && editable) {
      const newCategories = [
        ...categories,
        {
          name: 'New Category',
          skills: [
            { name: 'New Skill', proficiency: 80 }
          ]
        }
      ];

      onUpdate({
        ...data,
        categories: newCategories
      });
    }
  };

  // Handle updating a category
  const handleCategoryUpdate = (index: number, field: string, value: string) => {
    if (onUpdate && editable) {
      const newCategories = [...categories];

      if (!newCategories[index]) {
        newCategories[index] = { name: '', skills: [] };
      }

      newCategories[index] = {
        ...newCategories[index],
        [field]: value
      };

      onUpdate({
        ...data,
        categories: newCategories
      });
    }
  };

  // Handle removing a category
  const handleRemoveCategory = (index: number) => {
    if (onUpdate && editable) {
      const newCategories = [...categories];
      newCategories.splice(index, 1);

      onUpdate({
        ...data,
        categories: newCategories
      });
    }
  };

  // Handle adding a skill to a category
  const handleAddSkill = (categoryIndex: number) => {
    if (onUpdate && editable) {
      const newCategories = [...categories];
      const category = newCategories[categoryIndex];

      if (!category.skills) {
        category.skills = [];
      }

      category.skills.push({ name: 'New Skill', proficiency: 70 });

      onUpdate({
        ...data,
        categories: newCategories
      });
    }
  };

  // Handle updating a skill
  const handleSkillUpdate = (categoryIndex: number, skillIndex: number, field: string, value: any) => {
    if (onUpdate && editable) {
      const newCategories = [...categories];
      const category = newCategories[categoryIndex];

      if (!category.skills) {
        category.skills = [];
      }

      if (!category.skills[skillIndex]) {
        category.skills[skillIndex] = { name: '' };
      }

      category.skills[skillIndex] = {
        ...category.skills[skillIndex],
        [field]: value
      };

      onUpdate({
        ...data,
        categories: newCategories
      });
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (categoryIndex: number, skillIndex: number) => {
    if (onUpdate && editable) {
      const newCategories = [...categories];
      const category = newCategories[categoryIndex];

      if (!category.skills) {
        return;
      }

      category.skills.splice(skillIndex, 1);

      onUpdate({
        ...data,
        categories: newCategories
      });
    }
  };

  // Handle display type change
  const handleDisplayChange = (newDisplay: 'bars' | 'tags' | 'categories') => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        display: newDisplay
      });
    }
  };

  // Handle toggling proficiency display
  const handleToggleProficiency = () => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        showProficiency: !showProficiency
      });
    }
  };

  // Get color for skill bar based on proficiency
  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 80) return 'bg-green-500';
    if (proficiency >= 60) return 'bg-blue-500';
    if (proficiency >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Render display type selector
  const renderDisplaySelector = () => {
    if (!editable) return null;

    return (
      <div className="mb-6 p-4 bg-muted/20 border rounded-lg">
        <h4 className="text-sm font-medium mb-3">Skills Display</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={display === 'bars' ? 'default' : 'outline'}
            onClick={() => handleDisplayChange('bars')}
          >
            Progress Bars
          </Button>
          <Button
            size="sm"
            variant={display === 'tags' ? 'default' : 'outline'}
            onClick={() => handleDisplayChange('tags')}
          >
            Tags
          </Button>
          <Button
            size="sm"
            variant={display === 'categories' ? 'default' : 'outline'}
            onClick={() => handleDisplayChange('categories')}
          >
            Categories
          </Button>
        </div>

        {display === 'bars' && (
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="showProficiency"
              checked={showProficiency}
              onChange={handleToggleProficiency}
              className="mr-2"
            />
            <label htmlFor="showProficiency" className="text-sm">Show Proficiency Percentage</label>
          </div>
        )}
      </div>
    );
  };

  // Render skills with bars
  const renderSkillsAsBars = () => {
    return (
      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="relative">
            {editable && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 right-0"
                onClick={() => handleRemoveCategory(categoryIndex)}
              >
                Remove
              </Button>
            )}

            <EditableText
              value={category.name || `Category ${categoryIndex + 1}`}
              onChange={(value) => handleCategoryUpdate(categoryIndex, 'name', value)}
              editable={editable}
              className="text-xl font-semibold mb-4"
            />

            <div className="space-y-3">
              {category.skills?.map((skill, skillIndex) => (
                <div key={skillIndex} className="relative">
                  <div className="flex justify-between mb-1">
                    <EditableText
                      value={skill.name || `Skill ${skillIndex + 1}`}
                      onChange={(value) => handleSkillUpdate(categoryIndex, skillIndex, 'name', value)}
                      editable={editable}
                      className="text-sm font-medium"
                    />

                    {showProficiency && (
                      <span className="text-sm text-muted-foreground">{skill.proficiency || 0}%</span>
                    )}

                    {editable && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 absolute -top-1 right-0"
                        onClick={() => handleRemoveSkill(categoryIndex, skillIndex)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>

                  {/* Skill bar */}
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`${getSkillColor(skill.proficiency || 0)} h-2.5 rounded-full`}
                      style={{ width: `${skill.proficiency || 0}%` }}
                    />
                  </div>

                  {editable && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.proficiency || 0}
                      onChange={(e) => handleSkillUpdate(categoryIndex, skillIndex, 'proficiency', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  )}
                </div>
              ))}

              {editable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAddSkill(categoryIndex)}
                >
                  Add Skill
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render skills as tags
  const renderSkillsAsTags = () => {
    return (
      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="relative">
            {editable && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 right-0"
                onClick={() => handleRemoveCategory(categoryIndex)}
              >
                Remove
              </Button>
            )}

            <EditableText
              value={category.name || `Category ${categoryIndex + 1}`}
              onChange={(value) => handleCategoryUpdate(categoryIndex, 'name', value)}
              editable={editable}
              className="text-xl font-semibold mb-4"
            />

            <div className="flex flex-wrap gap-2">
              {category.skills?.map((skill, skillIndex) => (
                <div key={skillIndex} className="group relative">
                  <span
                    className="px-3 py-1.5 rounded-full border bg-muted/30 inline-block"
                    style={{
                      borderRadius: borderRadius,
                      boxShadow: boxShadow,
                      borderWidth: borderWidth,
                    }}
                  >
                    {editable ? (
                      <input
                        type="text"
                        value={skill.name || ''}
                        onChange={(e) => handleSkillUpdate(categoryIndex, skillIndex, 'name', e.target.value)}
                        className="bg-transparent outline-none text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm">{skill.name}</span>
                    )}
                  </span>

                  {editable && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-5 w-5 p-0 absolute -top-2 -right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveSkill(categoryIndex, skillIndex)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}

              {editable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSkill(categoryIndex)}
                >
                  + Add Skill
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render skills by categories in cards
  const renderSkillsByCategories = () => {
    return (
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
        }}
      >
        {categories.map((category, categoryIndex) => (
          <div
            key={categoryIndex}
            className="relative p-4"
            style={{
              borderRadius: borderRadius,
              boxShadow: boxShadow,
              border: `${borderWidth} solid var(--color-secondary, #e5e7eb)`,
            }}
          >
            {editable && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2"
                onClick={() => handleRemoveCategory(categoryIndex)}
              >
                ✕
              </Button>
            )}

            <EditableText
              value={category.name || `Category ${categoryIndex + 1}`}
              onChange={(value) => handleCategoryUpdate(categoryIndex, 'name', value)}
              editable={editable}
              className="text-lg font-semibold mb-3"
            />

            <ul className="space-y-2">
              {category.skills?.map((skill, skillIndex) => (
                <li key={skillIndex} className="relative">
                  <div className="flex items-center justify-between">
                    <EditableText
                      value={skill.name || `Skill ${skillIndex + 1}`}
                      onChange={(value) => handleSkillUpdate(categoryIndex, skillIndex, 'name', value)}
                      editable={editable}
                      className="text-sm"
                    />

                    {editable && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveSkill(categoryIndex, skillIndex)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {editable && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => handleAddSkill(categoryIndex)}
              >
                Add Skill
              </Button>
            )}
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-muted/20"
            style={{
              borderRadius: borderRadius,
              minHeight: '150px'
            }}
            onClick={handleAddCategory}
          >
            <span className="text-muted-foreground">+ Add Category</span>
          </div>
        )}
      </div>
    );
  };

  // Render the appropriate skills display
  const renderSkills = () => {
    if (categories.length === 0) {
      return (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No skills added yet. Add your first skill category to showcase your expertise.
          </p>
          {editable && (
            <Button onClick={handleAddCategory}>
              Add Skill Category
            </Button>
          )}
        </div>
      );
    }

    switch (display) {
      case 'bars':
        return renderSkillsAsBars();
      case 'tags':
        return renderSkillsAsTags();
      case 'categories':
        return renderSkillsByCategories();
      default:
        return renderSkillsAsBars();
    }
  };

  return (
    <section
      className="py-16 w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="skills"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-start mb-8">
          <EditableText
            value={data.title || 'Skills'}
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

        {renderDisplaySelector()}
        {renderSkills()}

        {editable && categories.length > 0 && display !== 'categories' && (
          <div className="mt-8 text-center">
            <Button onClick={handleAddCategory}>
              Add Another Category
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillsSection;
