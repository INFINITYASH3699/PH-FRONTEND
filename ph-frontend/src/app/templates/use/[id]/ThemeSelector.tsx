'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface ThemeSelectorProps {
  template: any;
  initialColorScheme: string;
  initialFontPairing: string;
  onSelect?: (colorSchemeId: string, fontPairingId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  template,
  initialColorScheme,
  initialFontPairing,
  onSelect
}) => {
  const [selectedColorScheme, setSelectedColorScheme] = useState(initialColorScheme);
  const [selectedFontPairing, setSelectedFontPairing] = useState(initialFontPairing);

  const colorSchemes = template.themeOptions?.colorSchemes || [];
  const fontPairings = template.themeOptions?.fontPairings || [];

  // Fallback for templates without proper theme options
  const fallbackColorSchemes = [{
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#111827'
    }
  }];

  const fallbackFontPairings = [{
    id: 'default',
    name: 'Default',
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  }];

  const displayColorSchemes = colorSchemes.length > 0 ? colorSchemes : fallbackColorSchemes;
  const displayFontPairings = fontPairings.length > 0 ? fontPairings : fallbackFontPairings;

  const handleColorSchemeSelect = (id: string) => {
    setSelectedColorScheme(id);
    if (onSelect) {
      onSelect(id, selectedFontPairing);
    }
  };

  const handleFontPairingSelect = (id: string) => {
    setSelectedFontPairing(id);
    if (onSelect) {
      onSelect(selectedColorScheme, id);
    }
  };

  return (
    <Tabs defaultValue="colors">
      <TabsList className="mb-4">
        <TabsTrigger value="colors">Color Schemes</TabsTrigger>
        <TabsTrigger value="fonts">Font Pairings</TabsTrigger>
      </TabsList>

      {/* Color Schemes Tab */}
      <TabsContent value="colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayColorSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className={`cursor-pointer transition-all ${selectedColorScheme === scheme.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => handleColorSchemeSelect(scheme.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{scheme.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(scheme.colors).map(([name, color]) => (
                    <div key={name} className="flex flex-col items-center text-xs">
                      <div
                        className="w-8 h-8 rounded-full mb-1 border"
                        style={{ backgroundColor: color as string }}
                      />
                      <span className="capitalize">{name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant={selectedColorScheme === scheme.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleColorSchemeSelect(scheme.id)}
                  >
                    {selectedColorScheme === scheme.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Font Pairings Tab */}
      <TabsContent value="fonts">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayFontPairings.map((pairing) => (
            <Card
              key={pairing.id}
              className={`cursor-pointer transition-all ${selectedFontPairing === pairing.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => handleFontPairingSelect(pairing.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{pairing.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-2">Heading Font:</p>
                    <h3 style={{ fontFamily: pairing.fonts.heading }} className="text-xl font-bold">
                      {pairing.fonts.heading}
                    </h3>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-2">Body Font:</p>
                    <p style={{ fontFamily: pairing.fonts.body }} className="text-base">
                      {pairing.fonts.body}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant={selectedFontPairing === pairing.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFontPairingSelect(pairing.id)}
                  >
                    {selectedFontPairing === pairing.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ThemeSelector;
