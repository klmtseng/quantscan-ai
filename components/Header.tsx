
import React from 'react';

interface HeaderProps {
  onScan: () => void;
  onSearch: () => void;
  isScanning: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onScan,
  onSearch,
  isScanning, 
  theme, 
  toggleTheme, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30">
            <i className="fas fa-microchip text-xl"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">QuantScan</h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 leading-none mt-1">Research Hub</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-lg mx-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-400 group-focus-within:text-blue-500 transition-colors text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search reports, authors, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 border border-transparent dark:border-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
          </button>
          
          <button 
            onClick={onSearch} // Search now triggers scan
            disabled={isScanning}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg
              ${isScanning 
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed border dark:border-slate-800 shadow-none' 
                : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-95 hover:shadow-blue-500/20 dark:hover:shadow-blue-900/40'
              }`}
          >
            {isScanning ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-sync-alt"></i>
                <span className="hidden md:inline">Update Feed</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
