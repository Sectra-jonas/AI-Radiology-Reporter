
import React, { useRef } from 'react';
import { BoldIcon, ItalicIcon, ListOrderedIcon, ListUnorderedIcon, MicIcon, MicOffIcon, ImageIcon, SparklesIcon } from './Icons';

interface ToolbarProps {
  onGenerateImpression: () => void;
  onToggleRecording: () => void;
  onAddImages: (files: FileList) => void;
  isRecording: boolean;
  editorRef: React.RefObject<HTMLDivElement>;
  onSelectionChange: () => void;
}

const IconButton: React.FC<{ onClick?: () => void; children: React.ReactNode; active?: boolean; className?: string }> = ({ onClick, children, active, className = '' }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
    className={`p-2 rounded hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-slate-700'} ${className}`}
  >
    {children}
  </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ onGenerateImpression, onToggleRecording, onAddImages, isRecording, editorRef, onSelectionChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFormat = (command: string) => {
    if (editorRef.current) {
        editorRef.current.focus();
        onSelectionChange();
        document.execCommand(command, false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onAddImages(event.target.files);
    }
  };

  return (
    <div className="p-2 bg-slate-900 border-b border-slate-700 flex items-center space-x-2 flex-wrap">
      <div className="flex items-center space-x-1">
        <IconButton onClick={() => applyFormat('bold')}><BoldIcon /></IconButton>
        <IconButton onClick={() => applyFormat('italic')}><ItalicIcon /></IconButton>
        <IconButton onClick={() => applyFormat('insertUnorderedList')}><ListUnorderedIcon /></IconButton>
        <IconButton onClick={() => applyFormat('insertOrderedList')}><ListOrderedIcon /></IconButton>
      </div>

      <div className="w-px h-6 bg-slate-600 mx-2"></div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onGenerateImpression}
          className="flex items-center space-x-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-white font-medium text-sm"
        >
          <SparklesIcon />
          <span>Impression</span>
        </button>
        <button
          onClick={onToggleRecording}
          className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors text-white font-medium text-sm ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-slate-700 hover:bg-slate-600 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
        >
          {isRecording ? <MicOffIcon /> : <MicIcon />}
          <span>{isRecording ? 'Stop' : 'Dictate'}</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white font-medium text-sm"
        >
          <ImageIcon />
          <span>Add Images</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/png, image/jpeg"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Toolbar;
