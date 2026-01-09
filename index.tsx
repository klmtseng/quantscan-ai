
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './components/Header';
import PaperCard from './components/PaperCard';
import ContactModal from './components/ContactModal';
import { ResearchPaper, ResearchTopic, DateFilterPreset, DateRange, SortOption } from './types';
import { TOPICS, MOCK_PAPERS, DATE_PRESETS } from './constants';

const App: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>(MOCK_PAPERS);
  const [activeTopic, setActiveTopic] = useState<ResearchTopic>('All');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('Month');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#020617'; // slate-950
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const filteredAndSortedPapers = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (datePreset === 'Custom') {
      startDate = new Date(customRange.start);
    } else {
      startDate = new Date();
      if (datePreset === 'Week') startDate.setDate(now.getDate() - 7);
      else if (datePreset === 'Month') startDate.setMonth(now.getMonth() - 1);
      else if (datePreset === 'Quarter') startDate.setMonth(now.getMonth() - 3);
      else if (datePreset === 'Year') startDate.setFullYear(now.getFullYear() - 1);
    }

    const endDate = datePreset === 'Custom' ? new Date(customRange.end) : now;

    // 1. Filter
    const filtered = MOCK_PAPERS.filter(paper => {
      const paperDate = new Date(paper.date);
      const matchesDate = paperDate >= startDate && paperDate <= endDate;
      const matchesTopic = activeTopic === 'All' || paper.tags.includes(activeTopic);
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        paper.title.toLowerCase().includes(searchLower) || 
        paper.abstract.toLowerCase().includes(searchLower);

      return matchesDate && matchesTopic && matchesSearch;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'relevance') {
        return b.relevanceScore - a.relevanceScore;
      }
      return 0;
    });
  }, [activeTopic, datePreset, customRange, searchTerm, sortBy]);

  const performScan = async () => {
    setIsScanning(true);
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setPapers(filteredAndSortedPapers);
    setIsScanning(false);
  };

  useEffect(() => {
    performScan();
  }, [activeTopic, datePreset, customRange, searchTerm, sortBy]);

  const handleDateSortToggle = () => {
    if (sortBy === 'newest') {
      setSortBy('oldest');
    } else {
      setSortBy('newest');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">
      <Header 
        onScan={performScan} 
        isScanning={isScanning} 
        theme={theme} 
        toggleTheme={toggleTheme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col gap-8 mb-10">
          {/* Main Controls Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-6 w-full lg:w-3/4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Research Categories</h2>
                <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit shadow-sm">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveTopic(topic.id as ResearchTopic)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${activeTopic === topic.id 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className={activeTopic === topic.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'}>
                        {topic.icon}
                      </span>
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Publication Date</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      {DATE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setDatePreset(preset.id as DateFilterPreset)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${datePreset === preset.id 
                              ? 'bg-slate-900 dark:bg-blue-600 text-white' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {datePreset === 'Custom' && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <input 
                          type="date" 
                          value={customRange.start}
                          onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200"
                        />
                        <span className="text-slate-400 text-xs">to</span>
                        <input 
                          type="date" 
                          value={customRange.end}
                          onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Sort By</h3>
                  <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit overflow-hidden">
                    {/* Relevance Button */}
                    <button
                      onClick={() => setSortBy('relevance')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${sortBy === 'relevance' 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                      <i className="fas fa-fire"></i>
                      Relevance
                    </button>

                    {/* Unified Date Toggle Button */}
                    <button
                      onClick={handleDateSortToggle}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${(sortBy === 'newest' || sortBy === 'oldest') 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                      {sortBy === 'oldest' ? (
                        <i className="fas fa-sort-amount-up"></i>
                      ) : (
                        <i className="fas fa-sort-amount-down"></i>
                      )}
                      Date {sortBy === 'oldest' ? '(Oldest First)' : '(Newest First)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm self-start lg:self-auto ml-auto">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Database</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Local Archive</p>
              </div>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold tracking-tight">Active Filter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        {isScanning ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse shadow-sm">
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-1"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
                <div className="flex gap-2 mb-6">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-16"></div>
                </div>
                <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isScanning && papers.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl shadow-inner">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700">
              <i className="fas fa-calendar-xmark text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Papers Match Filters</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
              {searchTerm ? `No results found for "${searchTerm}".` : "Try adjusting your filters to find research."}
            </p>
            <button 
              onClick={() => {
                setDatePreset('Year');
                setActiveTopic('All');
                setSearchTerm('');
                setSortBy('relevance');
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 dark:bg-black text-slate-500 py-12 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                <i className="fas fa-microchip"></i>
              </div>
              <span className="text-lg font-bold text-white">QuantScan</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Research Hub</a>
              <button 
                onClick={() => setIsContactOpen(true)}
                className="hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-lg border border-white/10"
              >
                Contact Me
              </button>
            </div>
            <p className="text-xs">
              © {new Date().getFullYear()} Global Quantitative Finance Research Hub.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-[10px] uppercase tracking-widest leading-loose">
              Supporting Open Science & Quantitative Asset Pricing globally. <br/>
              A platform for Momentum and Crypto researchers.
            </p>
          </div>
        </div>
      </footer>

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        email="aaron.jsfund@gmail.com"
      />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
