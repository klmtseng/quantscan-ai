
import React from 'react';
import { ResearchPaper } from '../types';

interface ReadAbstractModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: ResearchPaper;
}

const ReadAbstractModal: React.FC<ReadAbstractModalProps> = ({ isOpen, onClose, paper }) => {
  if (!isOpen) return null;

  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('arxiv')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    if (s.includes('ssrn')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (s.includes('nber')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (s.includes('jf') || s.includes('jfe') || s.includes('rfs') || s.includes('journal')) 
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    if (s.includes('cfa') || s.includes('bis') || s.includes('fed')) 
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>

          <div className="flex gap-2 mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getSourceColor(paper.source)}`}>
              {paper.source}
            </span>
             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {paper.date}
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2 pr-8">
            {paper.title}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            By <span className="font-medium text-slate-700 dark:text-slate-200">{paper.authors.join(', ')}</span>
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Abstract</h3>
          <div className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
            {paper.abstract}
          </div>
          
          <div className="mt-8 flex flex-wrap gap-2">
            {paper.tags.map(tag => (
              <span key={tag} className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
           <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            Close
          </button>
          <a 
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm"
          >
            Read Full Paper <i className="fas fa-external-link-alt text-xs"></i>
          </a>
        </div>

      </div>
    </div>
  );
};

export default ReadAbstractModal;
