
import React from 'react';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">News Desk</h2>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Live</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Latest updates and features from the QuantScan research team.
          </p>
          
          <div className="space-y-4">
            {/* Announcement 1 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">Feature</span>
                    <span className="text-[10px] text-slate-400">v1.1.0</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">New Quant Finance Category</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    We've added a dedicated "Quant Finance" topic. This is now the default view, filtering specifically for empirical asset pricing and quantitative strategy papers.
                </p>
            </div>

             {/* Announcement 2 */}
             <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">Data</span>
                    <span className="text-[10px] text-slate-400">Sources</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Expanded Source Coverage</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our scanner now connects directly to the arXiv (q-fin) API and aggregates working papers from the BIS and Federal Reserve via OpenAlex.
                </p>
            </div>
          </div>
        </div>
        
        <button 
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Close Updates
          </button>
      </div>
    </div>
  );
};

export default NewsModal;
