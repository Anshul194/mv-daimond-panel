import React, { useState } from 'react';
import { Bold, Italic, Underline, List, Link, Image } from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
}

type FormatKey = 'bold' | 'italic' | 'underline';

const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange, placeholder, required = false }) => {
  const [activeFormats, setActiveFormats] = useState<Record<FormatKey, boolean>>({
    bold: false,
    italic: false,
    underline: false
  });

  const toggleFormat = (format: FormatKey) => {
    setActiveFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          toggleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          toggleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          toggleFormat('underline');
          break;
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => toggleFormat('bold')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              activeFormats.bold ? 'bg-gray-200' : ''
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('italic')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              activeFormats.italic ? 'bg-gray-200' : ''
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('underline')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              activeFormats.underline ? 'bg-gray-200' : ''
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200 transition-colors"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200 transition-colors"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>
        <textarea
          rows={8}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-4 border-none outline-none resize-none focus:ring-0"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;