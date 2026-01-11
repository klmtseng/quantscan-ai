
import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import ReadAbstractModal from './ReadAbstractModal';

interface PaperCardProps {
  paper: ResearchPaper;
}

const getSourceColor = (source: string) => {
  const s = source.toLowerCase();
  if (s.includes('arxiv')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50';
  if (s.includes('ssrn')) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
  if (s.includes('nber')) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50';
  if (s.includes('researchgate')) return 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50';
  if (s.includes('jf') || s.includes('jfe') || s.includes('rfs') || s.includes('journal') || s.includes('elsevier') || s.includes('sciencedirect') || s.includes('banking and finance')) 
    return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50';
  if (s.includes('cfa') || s.includes('bis') || s.includes('fed') || s.includes('bls') || s.includes('labor')) 
    return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
  
  return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
};

const PaperCard: React.FC<PaperCardProps> = ({ paper }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1 overflow-hidden"
      >
        {/* Subtle top highlight gradient based on relevance */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Header: Source (Truncated) + Date */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="min-w-0 flex-1">
             <span 
              className={`inline-block max-w-full truncate align-bottom text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${getSourceColor(paper.source)}`}
              title={paper.source}
             >
              {paper.source}
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono shrink-0 pt-0.5 whitespace-nowrap">
            {paper.date}
          </span>
        </div>

        <h3 
          className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3 leading-snug line-clamp-2"
          title={paper.title}
        >
          {paper.title}
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
          <i className="fas fa-user-circle mr-1.5 opacity-70"></i>
          <span className="font-medium text-slate-700 dark:text-slate-300">{paper.authors.join(', ')}</span>
        </p>

        <div className="relative mb-4 flex-grow">
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
            {paper.abstract}
          </p>
          {/* Subtle fade out at bottom of abstract */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none"></div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {paper.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
             <i className="fas fa-bolt text-[10px]"></i> {paper.relevanceScore}% Match
          </div>

          <a 
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-10 uppercase tracking-wide gap-1.5"
          >
            Open Source <i className="fas fa-external-link-alt text-[10px]"></i>
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

export default PaperCard;
