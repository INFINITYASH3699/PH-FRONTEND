"use client";

import { useEffect, useState } from 'react';

interface SectionDebuggerProps {
  portfolio: any;
  template: any;
  sectionOrder: string[];
}

const SectionDebugger: React.FC<SectionDebuggerProps> = ({ portfolio, template, sectionOrder }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 bg-white shadow-lg p-4 rounded-lg z-50 max-w-xs max-h-[70vh] overflow-auto text-xs">
      <h3 className="font-bold text-sm mb-2">Section Debugger</h3>
      <p className="mb-2">Total sections: {sectionOrder.length}</p>

      <ul className="space-y-2">
        {sectionOrder.map((section, index) => {
          const hasContent = portfolio?.content?.[section] &&
                           Object.keys(portfolio.content[section]).length > 0;

          const sectionEl = document.getElementById(`section-${section}`);
          const isVisible = sectionEl ? isElementVisible(sectionEl) : false;

          return (
            <li key={section} className="flex items-center justify-between">
              <span>
                {index + 1}. {section}
              </span>
              <div className="flex space-x-1">
                <Status label="Content" status={hasContent} />
                <Status label="Visible" status={isVisible} />
                <button
                  className="px-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  onClick={() => scrollToSection(section)}
                >
                  Show
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4">
        <button
          className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 text-xs"
          onClick={() => toggleDebugBorders()}
        >
          Toggle Debug Borders
        </button>
      </div>
    </div>
  );
};

// Helper components and functions
const Status: React.FC<{label: string, status: boolean}> = ({ label, status }) => (
  <span className={`px-1 rounded ${status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {label}
  </span>
);

function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.width > 0 &&
    rect.height > 0 &&
    getComputedStyle(el).display !== 'none'
  );
}

function scrollToSection(section: string): void {
  const el = document.getElementById(`section-${section}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Highlight the section briefly
    el.style.outline = '3px solid red';
    el.style.outlineOffset = '3px';

    setTimeout(() => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }, 2000);
  }
}

function toggleDebugBorders(): void {
  document.querySelectorAll('.section-wrapper').forEach(el => {
    el.classList.toggle('section-debug-highlight');
  });

  // Add the style if it doesn't exist
  if (!document.getElementById('section-debug-style')) {
    const style = document.createElement('style');
    style.id = 'section-debug-style';
    style.textContent = `
      .section-debug-highlight {
        outline: 2px dashed red !important;
        outline-offset: 2px !important;
        position: relative !important;
        min-height: 100px !important;
        margin: 10px 0 !important;
      }

      .section-debug-highlight::before {
        content: attr(id);
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(255,0,0,0.7);
        color: white;
        padding: 2px 5px;
        font-size: 10px;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);
  }
}

export default SectionDebugger;
