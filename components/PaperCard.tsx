
import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import ReadAbstractModal from './ReadAbstractModal';

interface PaperCardProps {
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

const PaperCard: React.FC<PaperCardProps> = ({ paper }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all duration-300 group flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getSourceColor(paper.source)}`}>
              {paper.source}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              Relevance: {paper.relevanceScore}%
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-600 text-xs mono whitespace-nowrap ml-2">{paper.date}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 leading-tight cursor-pointer" onClick={() => setIsModalOpen(true)}>
          {paper.title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
          By <span className="font-medium text-slate-700 dark:text-slate-200">{paper.authors.join(', ')}</span>
        </p>

        <p 
          className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          {paper.abstract}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {paper.tags.map(tag => (
            <span key={tag} className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 gap-2 transition-colors"
          >
            <i className="fas fa-eye"></i> Quick View
          </button>

          <a 
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 gap-2 transition-colors"
          >
            Full Report <i className="fas fa-external-link-alt text-xs"></i>
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
