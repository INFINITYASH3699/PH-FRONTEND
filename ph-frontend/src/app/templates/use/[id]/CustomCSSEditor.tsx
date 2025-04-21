import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CustomCSSEditorProps {
  css: string;
  onChange: (css: string) => void;
}

export default function CustomCSSEditor({ css, onChange }: CustomCSSEditorProps) {
  const [cssValue, setCssValue] = useState(css || '');
  const [isApplied, setIsApplied] = useState(true);

  // Update internal state when props change
  useEffect(() => {
    setCssValue(css || '');
    setIsApplied(true);
  }, [css]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCssValue(e.target.value);
    setIsApplied(false);
  };

  // Apply the CSS changes
  const handleApply = () => {
    onChange(cssValue);
    setIsApplied(true);
  };

  // Example CSS snippets that users can insert
  const cssSnippets = [
    {
      name: 'Custom Link Color',
      code: `/* Change link color */
a {
  color: #6366f1;
  transition: color 0.2s;
}
a:hover {
  color: #4f46e5;
}`
    },
    {
      name: 'Custom Heading Styles',
      code: `/* Custom heading styles */
h1, h2, h3 {
  font-weight: 700;
  letter-spacing: -0.025em;
}
h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}`
    },
    {
      name: 'Animated Section',
      code: `/* Add animation to sections */
.section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s, transform 0.6s;
}
.section.visible {
  opacity: 1;
  transform: translateY(0);
}`
    },
    {
      name: 'Custom Button Style',
      code: `/* Custom button style */
.custom-button {
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}`
    }
  ];

  // Insert a CSS snippet
  const insertSnippet = (snippet: string) => {
    const newValue = cssValue ? `${cssValue}\n\n${snippet}` : snippet;
    setCssValue(newValue);
    setIsApplied(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <Label htmlFor="custom-css">Custom CSS</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Add custom CSS to personalize your portfolio beyond the theme options
          </p>
        </div>
        <Button
          size="sm"
          variant={isApplied ? "outline" : "default"}
          onClick={handleApply}
          disabled={isApplied}
        >
          {isApplied ? "Applied" : "Apply CSS"}
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted px-3 py-2 text-xs font-mono border-b flex justify-between items-center">
          <span>style.css</span>
          <span className="text-muted-foreground">{cssValue.length} bytes</span>
        </div>
        <textarea
          id="custom-css"
          value={cssValue}
          onChange={handleTextChange}
          className="font-mono text-sm w-full p-3 min-h-[250px] bg-black text-green-400 focus:outline-none focus:ring-0 focus:border-0"
          placeholder="/* Add your custom CSS here */

/* Example:
.header-section {
  background: linear-gradient(to right, #6366f1, #818cf8);
}
*/"
        />
      </div>

      <div className="space-y-2">
        <Label>Quick Snippets</Label>
        <div className="grid grid-cols-2 gap-2">
          {cssSnippets.map((snippet, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto py-2 justify-start text-left"
              onClick={() => insertSnippet(snippet.code)}
            >
              <span className="truncate">{snippet.name}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Click any snippet to add it to your custom CSS
        </p>
      </div>

      <div className="bg-muted/50 rounded-md p-3">
        <h4 className="text-sm font-medium mb-2">CSS Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Use custom CSS to override the default styles of your template</li>
          <li>Changes apply to your portfolio only and won't affect other templates</li>
          <li>Click "Apply CSS" to see your changes in the preview</li>
          <li>Be careful with selectors to avoid unwanted style changes</li>
        </ul>
      </div>
    </div>
  );
}
