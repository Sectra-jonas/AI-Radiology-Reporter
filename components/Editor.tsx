
import React, { forwardRef, useLayoutEffect, useRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: () => void;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(({ content, onChange, onSelectionChange }, ref) => {
  const contentRef = useRef(content);
  
  useLayoutEffect(() => {
    contentRef.current = content;
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    if (contentRef.current !== newContent) {
      contentRef.current = newContent;
      onChange(newContent);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      onKeyUp={onSelectionChange}
      onMouseUp={onSelectionChange}
      dangerouslySetInnerHTML={{ __html: content }}
      className="h-full w-full p-6 bg-slate-800 text-slate-300 focus:outline-none leading-relaxed prose prose-invert prose-p:my-2 prose-h2:my-4 max-w-none"
    />
  );
});

Editor.displayName = 'Editor';

export default Editor;
