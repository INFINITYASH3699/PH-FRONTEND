import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  showCustomInput?: boolean;
  presetColors?: string[];
}

const defaultPresetColors = [
  '#000000', // Black
  '#ffffff', // White
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
];

export function ColorPicker({
  value,
  onChange,
  className,
  showCustomInput = true,
  presetColors = defaultPresetColors,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  // Handle custom color input change
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  // Handle custom color input blur
  const handleCustomColorBlur = () => {
    if (customColor !== value) {
      onChange(customColor);
    }
  };

  // Handle preset color selection
  const handlePresetSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Preset Colors Grid */}
      <div className="grid grid-cols-6 gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "w-6 h-6 rounded-full border border-gray-300 cursor-pointer transition-transform",
              value === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"
            )}
            style={{ backgroundColor: color }}
            onClick={() => handlePresetSelect(color)}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      {showCustomInput && (
        <div className="flex gap-2 items-center">
          <div
            className="w-8 h-8 rounded-md border border-gray-300"
            style={{ backgroundColor: customColor }}
          />
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            onBlur={handleCustomColorBlur}
            placeholder="#hex or color name"
            className="flex-1 px-2 py-1 text-sm border rounded"
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onChange(e.target.value);
            }}
            className="w-8 h-8 p-0 border-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
