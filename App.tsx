
import React, { useState, useRef, useCallback } from 'react';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import FindingsModal from './components/FindingsModal';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import * as geminiService from './services/geminiService';

type LoadingState = {
  title: string;
  message: string;
} | null;

const App: React.FC = () => {
  const [editorContent, setEditorContent] = useState<string>('<h2>Findings</h2><p>Lungs are clear. No pleural effusion or pneumothorax. The cardiomediastinal silhouette is within normal limits. Osseous structures are unremarkable.</p>');
  const [loadingState, setLoadingState] = useState<LoadingState>(null);
  const [modalData, setModalData] = useState<{ findings: string[] } | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSaveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  };
  
  const restoreSelectionAndInsert = (text: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
      document.execCommand('insertText', false, text);
    } else {
      // Fallback: append to end
      const p = document.createElement('p');
      p.textContent = text;
      editorRef.current.appendChild(p);
    }
  };

  const handleGenerateImpression = async () => {
    if (!editorRef.current) return;
    setLoadingState({ title: 'Generating Impression', message: 'AI is analyzing the findings to create a summary...' });
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      const findingsText = tempDiv.textContent || '';
      
      const impression = await geminiService.generateImpression(findingsText);
      
      const newContent = `${editorContent}<h2>Impression</h2><p>${impression}</p>`;
      setEditorContent(newContent);
    } catch (error) {
      console.error('Error generating impression:', error);
      alert('Failed to generate impression. Please check the console for details.');
    } finally {
      setLoadingState(null);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      setLoadingState({ title: 'Transcribing Audio', message: 'Processing audio to text. Please wait...' });
      try {
        const audioData = await stopRecording();
        if (audioData) {
          const transcribedText = await geminiService.transcribeAudio(audioData.base64, audioData.mimeType);
          restoreSelectionAndInsert(transcribedText + ' ');
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
        alert('Failed to transcribe audio. Please check the console for details.');
      } finally {
        setLoadingState(null);
      }
    } else {
      handleSaveSelection();
      startRecording();
    }
  };

  const handleAddImages = async (files: FileList) => {
    if (files.length === 0) return;
    setLoadingState({ title: 'Analyzing Images', message: `Processing ${files.length} image(s) for key findings...` });
    try {
      const analysisPromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            try {
              const finding = await geminiService.analyzeImage(base64, file.type);
              resolve(finding);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const findings = await Promise.all(analysisPromises);
      setModalData({ findings });

    } catch (error) {
      console.error('Error analyzing images:', error);
      alert('Failed to analyze images. Please check the console for details.');
    } finally {
      setLoadingState(null);
    }
  };
  
  const handleDraftReport = useCallback(async () => {
    if (!modalData) return;
    setModalData(null);
    setLoadingState({ title: 'Drafting Report', message: 'AI is creating a full report from the image findings...' });
    try {
        const fullFindingsText = modalData.findings.join('\n');
        const report = await geminiService.draftReportFromFindings(fullFindingsText);
        setEditorContent(report.replace(/\n/g, '<br/>'));
    } catch (error) {
        console.error('Error drafting report:', error);
        alert('Failed to draft report. Please check the console for details.');
    } finally {
        setLoadingState(null);
    }
  }, [modalData]);

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 flex flex-col items-center justify-center p-4 font-sans">
      {loadingState && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold mt-6">{loadingState.title}</h2>
          <p className="text-slate-300 mt-2">{loadingState.message}</p>
        </div>
      )}
      {modalData && (
        <FindingsModal 
          findings={modalData.findings}
          onClose={() => setModalData(null)}
          onDraft={handleDraftReport}
        />
      )}
      <div className="w-full max-w-4xl h-[90vh] bg-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-700">
        <header className="p-4 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">AI Radiology Reporter</h1>
        </header>
        <Toolbar
          onGenerateImpression={handleGenerateImpression}
          onToggleRecording={handleToggleRecording}
          onAddImages={handleAddImages}
          isRecording={isRecording}
          editorRef={editorRef}
          onSelectionChange={handleSaveSelection}
        />
        <div className="flex-grow p-1 overflow-y-auto">
          <Editor
            ref={editorRef}
            content={editorContent}
            onChange={handleEditorChange}
            onSelectionChange={handleSaveSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
