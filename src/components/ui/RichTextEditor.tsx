import React, { useRef, useState } from "react";
import { Bold, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  rows = 6,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [, setActiveAction] = useState<string | null>(null);

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newValue =
      beforeText + before + selectedText + after + afterText;
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleBold = () => {
    setActiveAction("bold");
    insertFormatting("**", "**");
  };

  const handleBulletPoint = () => {
    setActiveAction("bullet");
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);

    // Add bullet point at the beginning of the line
    const lastNewline = beforeText.lastIndexOf("\n");
    const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
    const textBefore = value.substring(0, insertPos);
    const textAfter = value.substring(insertPos);

    const newValue = textBefore + "• " + textAfter;
    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        const newPos = insertPos + 2;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleNumberedList = () => {
    setActiveAction("number");
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);

    // Count existing numbered items in the text
    const matches = value.match(/^\d+\.\s/gm) || [];
    const nextNumber = matches.length + 1;

    // Add numbered item at the beginning of the line
    const lastNewline = beforeText.lastIndexOf("\n");
    const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
    const textBefore = value.substring(0, insertPos);
    const textAfter = value.substring(insertPos);

    const newValue = textBefore + `${nextNumber}. ` + textAfter;
    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        const newPos = insertPos + `${nextNumber}. `.length;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        <button
          type="button"
          onClick={handleBold}
          title="Make selected text bold (wrap with **)"
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
        >
          <Bold size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={handleBulletPoint}
          title="Add bullet point"
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
        >
          <List size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={handleNumberedList}
          title="Add numbered list item"
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
        >
          <ListOrdered size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 sm:py-2.5 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm resize-none"
      />
    </div>
  );
}
