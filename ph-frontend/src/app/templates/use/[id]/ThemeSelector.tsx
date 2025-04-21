import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ThemeSelectorProps {
  themeOptions: {
    colorSchemes: Array<{
      id: string;
      name: string;
      colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent?: string;
        [key: string]: string | undefined;
      };
    }>;
    fontPairings: Array<{
      id: string;
      name: string;
      fonts: {
        heading: string;
        body: string;
        mono?: string;
        [key: string]: string | undefined;
      };
    }>;
  };
  activeColorSchemeId?: string;
  activeFontPairingId?: string;
  onChange: (colorSchemeId: string, fontPairingId: string) => void;
}

export default function ThemeSelector({
  themeOptions,
  activeColorSchemeId,
  activeFontPairingId,
  onChange
}: ThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>('colors');

  // Default to first options if no active selections
  const colorSchemes = themeOptions?.colorSchemes || [];
  const fontPairings = themeOptions?.fontPairings || [];

  const defaultColorScheme = colorSchemes.length > 0 ? colorSchemes[0].id : '';
  const defaultFontPairing = fontPairings.length > 0 ? fontPairings[0].id : '';

  const [selectedColorScheme, setSelectedColorScheme] = useState<string>(
    activeColorSchemeId || defaultColorScheme
  );
  const [selectedFontPairing, setSelectedFontPairing] = useState<string>(
    activeFontPairingId || defaultFontPairing
  );

  // Handle color scheme selection
  const handleColorSchemeChange = (value: string) => {
    setSelectedColorScheme(value);
    onChange(value, selectedFontPairing);
  };

  // Handle font pairing selection
  const handleFontPairingChange = (value: string) => {
    setSelectedFontPairing(value);
    onChange(selectedColorScheme, value);
  };

  if (!themeOptions || (!colorSchemes.length && !fontPairings.length)) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No theme options available for this template.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="fonts">Fonts</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4 pt-4">
          <RadioGroup
            value={selectedColorScheme}
            onValueChange={handleColorSchemeChange}
            className="space-y-2"
          >
            {colorSchemes.map((scheme) => (
              <div key={scheme.id} className="flex items-start space-x-3">
                <RadioGroupItem value={scheme.id} id={`color-${scheme.id}`} className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor={`color-${scheme.id}`}
                    className="flex items-center cursor-pointer"
                  >
                    <span className="font-medium mr-3">{scheme.name}</span>
                    <div className="flex ml-auto gap-1">
                      {Object.entries(scheme.colors).map(([name, color]) => (
                        <div
                          key={name}
                          className="w-5 h-5 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={`${name}: ${color}`}
                        />
                      ))}
                    </div>
                  </Label>

                  {selectedColorScheme === scheme.id && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {Object.entries(scheme.colors).map(([name, color]) => (
                        <div key={name} className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="capitalize">{name}:</span>
                          <code className="text-xs bg-muted px-1 rounded">{color}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>

          {colorSchemes.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-2">
              No color schemes available.
            </div>
          )}
        </TabsContent>

        <TabsContent value="fonts" className="space-y-4 pt-4">
          <RadioGroup
            value={selectedFontPairing}
            onValueChange={handleFontPairingChange}
            className="space-y-2"
          >
            {fontPairings.map((pairing) => (
              <div key={pairing.id} className="flex items-start space-x-3">
                <RadioGroupItem value={pairing.id} id={`font-${pairing.id}`} className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor={`font-${pairing.id}`}
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">{pairing.name}</span>

                    <div className="mt-2 text-sm space-y-2">
                      <div className="flex gap-2">
                        <span className="text-xs text-muted-foreground w-16">Heading:</span>
                        <span
                          className="text-base font-semibold"
                          style={{ fontFamily: pairing.fonts.heading }}
                        >
                          {pairing.fonts.heading}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-xs text-muted-foreground w-16">Body:</span>
                        <span style={{ fontFamily: pairing.fonts.body }}>
                          {pairing.fonts.body}
                        </span>
                      </div>

                      {pairing.fonts.mono && (
                        <div className="flex gap-2">
                          <span className="text-xs text-muted-foreground w-16">Mono:</span>
                          <span className="font-mono" style={{ fontFamily: pairing.fonts.mono }}>
                            {pairing.fonts.mono}
                          </span>
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>

          {fontPairings.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-2">
              No font pairings available.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
