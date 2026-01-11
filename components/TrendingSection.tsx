
import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import ReadAbstractModal from './ReadAbstractModal';

interface TrendingSectionProps {
  papers: ResearchPaper[];
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ papers }) => {
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);

  if (!papers || papers.length === 0) return null;

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
           <i className="fas fa-fire"></i>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Trending Research</h2>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Top Rated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {papers.map((paper, index) => (
          <div 
            key={paper.id}
            onClick={() => setSelectedPaper(paper)}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
          >
            {/* Rank Indicator */}
            <div className="absolute top-0 right-0 p-3">
              <span className="text-4xl font-black text-slate-100 dark:text-slate-800/50 leading-none group-hover:text-blue-50 dark:group-hover:text-blue-900/20 transition-colors">
                #{index + 1}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex gap-2 mb-2">
                 <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                   {paper.source}
                 </span>
                 <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                   <i className="fas fa-bolt text-[8px]"></i> {paper.relevanceScore}%
                 </span>
               </div>
               
               <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                 {paper.title}
               </h3>
               
               <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                 {paper.abstract}
               </p>
               
               <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                 <span className="text-[10px] text-slate-400 font-mono">{paper.date}</span>
                 <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wide">
                   Read Abstract <i className="fas fa-arrow-right ml-1"></i>
                 </span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPaper && (
        <ReadAbstractModal 
          isOpen={!!selectedPaper} 
          onClose={() => setSelectedPaper(null)} 
          paper={selectedPaper} 
        />
      )}
    </div>
  );
};

export default TrendingSection;
