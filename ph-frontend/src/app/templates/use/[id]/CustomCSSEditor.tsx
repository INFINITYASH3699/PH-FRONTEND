'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define custom CSS interface
interface CustomCSSContent {
  styles: string;
}

interface CustomCSSEditorProps {
  content: CustomCSSContent;
  onSave: (content: CustomCSSContent) => void;
  isLoading?: boolean;
}

// Sample CSS snippets for users to add
const cssSnippets = [
  {
    name: 'Gradient Background',
    code: `.section-header {\n  background: linear-gradient(to right, #6366f1, #8b5cf6);\n  color: white;\n  padding: 2rem;\n  border-radius: 8px;\n}`,
  },
  {
    name: 'Animated Button',
    code: `.cta-button {\n  transition: all 0.3s ease;\n  border-radius: 4px;\n}\n\n.cta-button:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 10px 20px rgba(0,0,0,0.1);\n}`,
  },
  {
    name: 'Card Hover Effect',
    code: `.project-card {\n  transition: all 0.3s ease;\n}\n\n.project-card:hover {\n  transform: scale(1.03);\n  box-shadow: 0 10px 20px rgba(0,0,0,0.1);\n}`,
  },
  {
    name: 'Custom Font Sizes',
    code: `h1 {\n  font-size: 3.5rem;\n  font-weight: 700;\n  line-height: 1.2;\n}\n\nh2 {\n  font-size: 2.5rem;\n  font-weight: 600;\n  line-height: 1.3;\n}\n\np {\n  font-size: 1.125rem;\n  line-height: 1.7;\n}`,
  },
];

export default function CustomCSSEditor({ content, onSave, isLoading = false }: CustomCSSEditorProps) {
  const [customCSS, setCustomCSS] = useState<string>(content.styles || '');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  // Handle updating CSS
  const handleCSSChange = (css: string) => {
    setCustomCSS(css);
    onSave({ styles: css });
  };

  // Add a CSS snippet to the editor
  const addSnippet = (snippetCode: string) => {
    const updatedCSS = customCSS ? `${customCSS}\n\n${snippetCode}` : snippetCode;
    handleCSSChange(updatedCSS);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Custom CSS</h3>
        <p className="text-muted-foreground">
          Add custom CSS styles to fine-tune the appearance of your portfolio.
        </p>
      </div>

      {/* Warning message */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
        <h4 className="font-medium">⚠️ Advanced Feature</h4>
        <p className="text-sm mt-1">
          Custom CSS is for users with CSS knowledge. Incorrect CSS may break your portfolio's layout.
          Make sure to test your changes using the preview button.
        </p>
      </div>

      {/* CSS Editor */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Editor</CardTitle>
          <CardDescription>
            Write custom CSS to customize your portfolio beyond the built-in options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="/* Add your custom CSS here */
.my-custom-class {
  color: blue;
  font-weight: bold;
}"
            value={customCSS}
            onChange={(e) => handleCSSChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* CSS Snippets */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Snippets</CardTitle>
          <CardDescription>
            Click on any snippet to add it to your custom CSS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cssSnippets.map((snippet, index) => (
              <div
                key={index}
                className="border rounded-md p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => addSnippet(snippet.code)}
              >
                <h4 className="font-medium text-sm mb-2">{snippet.name}</h4>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CSS Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Usage Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Common CSS Class Names</h4>
            <ul className="space-y-1 text-sm list-disc pl-4">
              <li><code className="text-xs bg-slate-100 p-1 rounded">.portfolio-header</code> - The main header section</li>
              <li><code className="text-xs bg-slate-100 p-1 rounded">.portfolio-section</code> - Each main section</li>
              <li><code className="text-xs bg-slate-100 p-1 rounded">.project-card</code> - Project display cards</li>
              <li><code className="text-xs bg-slate-100 p-1 rounded">.skill-item</code> - Individual skill items</li>
              <li><code className="text-xs bg-slate-100 p-1 rounded">.experience-item</code> - Work experience entries</li>
              <li><code className="text-xs bg-slate-100 p-1 rounded">.contact-form</code> - Contact form container</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Tips for Using Custom CSS</h4>
            <ul className="space-y-1 text-sm list-disc pl-4">
              <li>Use browser developer tools to inspect elements and find class names</li>
              <li>Test your changes with the preview button</li>
              <li>Keep a backup of your CSS before making major changes</li>
              <li>Use <code className="text-xs bg-slate-100 p-1 rounded">!important</code> sparingly</li>
              <li>For complex layouts, consider using media queries for responsive design</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
