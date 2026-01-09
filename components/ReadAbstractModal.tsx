
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
    if (s.includes('arxiv')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30';
    if (s.includes('ssrn')) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30';
    if (s.includes('nber')) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30';
    
    return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-slide-up ring-1 ring-slate-900/5 dark:ring-white/10">
        
        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${getSourceColor(paper.source)}`}>
              {paper.source}
            </span>
             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono">
              {paper.date}
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3 pr-8">
            {paper.title}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
            <i className="fas fa-user-circle"></i>
            <span className="font-medium text-slate-700 dark:text-slate-300">{paper.authors.join(', ')}</span>
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 dark:bg-black/20">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Abstract</h3>
          <div className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-serif sm:font-sans">
            {paper.abstract}
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/50">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {paper.tags.map(tag => (
                <span key={tag} className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-end gap-3 z-10">
           <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm"
          >
            Close
          </button>
          <a 
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2 text-sm transform active:scale-95"
          >
            Read Full Paper <i className="fas fa-external-link-alt text-xs ml-1"></i>
          </a>
        </div>

      </div>
    </div>
  );
};

export default ReadAbstractModal;
