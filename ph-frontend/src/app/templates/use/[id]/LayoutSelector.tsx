'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface LayoutConfig {
  id: string;
  name: string;
  previewImage?: string;
  structure: {
    sections: string[];
    gridSystem: string;
    spacing?: Record<string, number>;
  };
}

interface LayoutSelectorProps {
  layouts: LayoutConfig[];
  activeLayoutId?: string;
  onChange: (layoutId: string) => void;
}

export default function LayoutSelector({
  layouts,
  activeLayoutId,
  onChange
}: LayoutSelectorProps) {
  // Default to first layout if none selected
  const selectedLayoutId = activeLayoutId || (layouts.length > 0 ? layouts[0].id : '');

  // Find the selected layout object
  const selectedLayout = layouts.find(layout => layout.id === selectedLayoutId);

  if (!layouts || layouts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No layout options available for this template.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedLayoutId}
        onValueChange={onChange}
        className="space-y-3"
      >
        {layouts.map((layout) => (
          <div key={layout.id} className="flex items-start space-x-3">
            <RadioGroupItem value={layout.id} id={`layout-${layout.id}`} className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor={`layout-${layout.id}`}
                className="flex flex-col cursor-pointer"
              >
                <span className="font-medium">{layout.name}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {layout.structure.gridSystem === 'sidebar-main'
                    ? 'Sidebar navigation with content area'
                    : 'Standard full-width content flow'}
                </span>

                {selectedLayoutId === layout.id && (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-md border overflow-hidden">
                      <div className="bg-muted/40 px-3 py-2 text-xs font-medium border-b">
                        Layout Preview
                      </div>
                      <div className="p-3">
                        {layout.structure.gridSystem === 'sidebar-main' ? (
                          <div className="flex gap-2 h-24">
                            <div className="w-1/4 bg-muted/70 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                              Sidebar
                            </div>
                            <div className="flex-1 bg-muted/30 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                              Main Content
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-7 bg-muted/30 rounded-md flex items-center justify-center text-xs text-muted-foreground"
                              >
                                Section {i}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium mb-2">Included Sections:</h4>
                      <div className="flex flex-wrap gap-1">
                        {layout.structure.sections.map((section) => (
                          <span
                            key={section}
                            className="text-xs bg-muted px-2 py-1 rounded-md capitalize"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>

      <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
        <p className="font-medium mb-1">Layout Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The sidebar layout works best for professional portfolios with clear navigation</li>
          <li>Standard layouts are flexible and work well for visual portfolios</li>
          <li>Changing layouts will not affect your content, only how it's arranged</li>
        </ul>
      </div>
    </div>
  );
}
