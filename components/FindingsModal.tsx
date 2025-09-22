
import React from 'react';

interface FindingsModalProps {
  findings: string[];
  onClose: () => void;
  onDraft: () => void;
}

const FindingsModal: React.FC<FindingsModalProps> = ({ findings, onClose, onDraft }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Image Analysis Findings</h2>
          <p className="text-slate-400 mt-1">Review the AI-generated findings below before drafting the report.</p>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          <ul className="space-y-4">
            {findings.map((finding, index) => (
              <li key={index} className="bg-slate-700 p-4 rounded-md">
                <p className="text-slate-300">{finding}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={onDraft}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Draft Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindingsModal;
