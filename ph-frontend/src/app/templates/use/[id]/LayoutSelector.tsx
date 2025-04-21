'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LayoutSelectorProps {
  template: any;
  initialLayout: string;
  onSelect?: (layoutId: string) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  template,
  initialLayout,
  onSelect
}) => {
  const [selectedLayout, setSelectedLayout] = useState(initialLayout);

  const layouts = template.layouts || [];

  // Create a default layout if none exists
  const defaultLayout = {
    id: 'default',
    name: 'Standard Layout',
    structure: {
      sections: template.defaultStructure?.layout?.sections || [
        'header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'
      ],
      gridSystem: '12-column'
    }
  };

  // Use the layouts from the template or fall back to the default
  const displayLayouts = layouts.length > 0 ? layouts : [defaultLayout];

  const handleLayoutSelect = (id: string) => {
    setSelectedLayout(id);
    if (onSelect) {
      onSelect(id);
    }
  };

  // Generate a placeholder image URL for layouts without a preview image
  const createPlaceholderImage = (layoutName: string, sections: string[]) => {
    // Create SVG-based placeholder with layout sections visualization
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='30' font-family='Arial' font-size='14' text-anchor='middle' fill='%236366f1'%3E${encodeURIComponent(layoutName)}%3C/text%3E%3Crect x='40' y='45' width='220' height='20' fill='%23d1d5db'/%3E%3Ctext x='150' y='60' font-family='Arial' font-size='10' text-anchor='middle' fill='%23374151'%3EHeader%3C/text%3E${sections.map((section, index) => {
      // Skip header as it's already shown
      if (section === 'header') return '';

      const y = 75 + index * 25;
      const height = section === 'projects' || section === 'gallery' ? 30 : 20;

      return `%3Crect x='40' y='${y}' width='220' height='${height}' fill='%23${index % 2 === 0 ? 'e5e7eb' : 'd1d5db'}'/%3E%3Ctext x='150' y='${y + 15}' font-family='Arial' font-size='10' text-anchor='middle' fill='%23374151'%3E${section.charAt(0).toUpperCase() + section.slice(1)}%3C/text%3E`;
    }).join('')}%3C/svg%3E`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayLayouts.map((layout) => (
          <Card
            key={layout.id}
            className={`cursor-pointer transition-all ${selectedLayout === layout.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            onClick={() => handleLayoutSelect(layout.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{layout.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                {layout.previewImage ? (
                  <Image
                    src={layout.previewImage}
                    alt={layout.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={createPlaceholderImage(layout.name, layout.structure.sections)}
                      alt={layout.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-1 mb-2">
                  {layout.structure.sections.map((section: string) => (
                    <span
                      key={section}
                      className="text-xs px-2 py-1 bg-muted rounded-md capitalize"
                    >
                      {section}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Grid: {layout.structure.gridSystem}
                  </span>
                  <Button
                    variant={selectedLayout === layout.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLayoutSelect(layout.id)}
                  >
                    {selectedLayout === layout.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/40 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Layout Structure</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The selected layout determines which sections are included in your portfolio and how they're arranged.
          Each layout is optimized for a specific type of portfolio.
        </p>

        {/* Show sections in the selected layout */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase text-muted-foreground">Sections in selected layout:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {displayLayouts.find(l => l.id === selectedLayout)?.structure.sections.map((section: string) => (
              <div key={section} className="px-3 py-2 bg-background border rounded-md flex items-center justify-between">
                <span className="capitalize">{section}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelector;
