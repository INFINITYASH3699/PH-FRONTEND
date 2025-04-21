import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  editable = false,
  className = '',
  placeholder = 'Click to edit',
  multiline = false,
  maxLength,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Update local state when prop value changes
  useEffect(() => {
    setEditedValue(value || '');
  }, [value]);

  const handleClick = () => {
    if (editable && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedValue !== value) {
      onChange(editedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      setIsEditing(false);
      onChange(editedValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedValue(value || '');
      setIsEditing(false);
    }
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // If not editable or not in edit mode, just render the text
  if (!editable || !isEditing) {
    return (
      <div
        className={cn(
          'relative group',
          editable && 'hover:cursor-text hover:ring-2 hover:ring-indigo-300 hover:ring-opacity-50 rounded px-1 -mx-1',
          className
        )}
        onClick={handleClick}
      >
        {value || (editable ? <span className="opacity-50">{placeholder}</span> : '')}
        {editable && (
          <div className="absolute -top-4 -right-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Edit
          </div>
        )}
      </div>
    );
  }

  // Render appropriate input based on multiline prop
  return multiline ? (
    <textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      value={editedValue}
      onChange={(e) => setEditedValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        'block w-full bg-transparent border-0 ring-2 ring-indigo-500 rounded px-1 py-0.5 focus:outline-none resize-none',
        className
      )}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={3}
      style={{
        // Preserve font styling from parent element
        font: 'inherit',
        // Calculate minimum height
        minHeight: '4em'
      }}
    />
  ) : (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={editedValue}
      onChange={(e) => setEditedValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        'block w-full bg-transparent border-0 ring-2 ring-indigo-500 rounded px-1 py-0.5 focus:outline-none',
        className
      )}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        // Preserve font styling from parent element
        font: 'inherit'
      }}
    />
  );
};
