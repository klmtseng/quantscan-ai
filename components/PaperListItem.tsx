
import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import ReadAbstractModal from './ReadAbstractModal';

interface PaperListItemProps {
  paper: ResearchPaper;
}

const getSourceColor = (source: string) => {
  const s = source.toLowerCase();
  if (s.includes('arxiv')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30';
  if (s.includes('ssrn')) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30';
  if (s.includes('nber')) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30';
  if (s.includes('jf') || s.includes('jfe') || s.includes('rfs') || s.includes('journal')) 
    return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30';
  if (s.includes('cfa') || s.includes('bis') || s.includes('fed') || s.includes('bls') || s.includes('labor')) 
    return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30';
  
  return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
};

const PaperListItem: React.FC<PaperListItemProps> = ({ paper }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50"
      >
        {/* Left: Source & Date */}
        {/* Changed layout: Stack vertically on desktop (md:flex-col) to handle long source names gracefully */}
        <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1.5 w-full md:w-40 shrink-0">
          <span 
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md leading-tight line-clamp-2 text-ellipsis overflow-hidden max-w-full ${getSourceColor(paper.source)}`}
            title={paper.source}
          >
            {paper.source}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono whitespace-nowrap pl-0.5">
            {paper.date}
          </span>
        </div>

        {/* Middle: Content */}
        <div className="flex-grow min-w-0 mr-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {paper.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs flex items-center gap-1.5">
              <i className="fas fa-user-circle text-[10px] opacity-70"></i>
              {paper.authors.join(', ')}
            </p>
            <div className="hidden sm:flex items-center gap-1.5">
              {paper.tags.slice(0, 2).map(tag => (
                <span key={tag} className="inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 shrink-0 ml-auto md:ml-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0 w-full md:w-auto justify-end">
            <span className="text-[10px] font-bold text-green-600 dark:text-green-500 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                <i className="fas fa-bolt text-[8px]"></i> {paper.relevanceScore}%
            </span>
            
            <a 
                href={paper.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                title="Full Paper"
            >
                <i className="fas fa-external-link-alt text-sm"></i>
            </a>
            
            <i className="fas fa-chevron-right text-slate-300 dark:text-slate-700 text-xs group-hover:text-blue-500 dark:group-hover:text-blue-500 transition-colors"></i>
        </div>
      </div>

      <ReadAbstractModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        paper={paper} 
      />
    </>
  );
};

export default PaperListItem;
