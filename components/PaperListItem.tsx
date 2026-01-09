
import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import ReadAbstractModal from './ReadAbstractModal';

interface PaperListItemProps {
  paper: ResearchPaper;
}

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

const PaperListItem: React.FC<PaperListItemProps> = ({ paper }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200 group flex flex-col md:flex-row md:items-center gap-4">
        
        {/* Left: Source & Date */}
        <div className="flex items-center gap-3 w-full md:w-48 shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getSourceColor(paper.source)}`}>
            {paper.source}
          </span>
          <span className="text-slate-400 dark:text-slate-600 text-xs mono whitespace-nowrap">
            {paper.date}
          </span>
        </div>

        {/* Middle: Content */}
        <div className="flex-grow min-w-0 mr-4">
          <h3 
            className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {paper.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {paper.authors.join(', ')}
            </p>
            {paper.tags.slice(0, 2).map(tag => (
              <span key={tag} className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-1.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0 w-full md:w-auto justify-end">
            <span className="text-[10px] font-bold text-green-600 dark:text-green-500 mr-2 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                {paper.relevanceScore}%
            </span>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                title="Quick View"
            >
                <i className="fas fa-eye"></i>
            </button>
            <a 
                href={paper.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                title="Full Paper"
            >
                <i className="fas fa-external-link-alt"></i>
            </a>
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
