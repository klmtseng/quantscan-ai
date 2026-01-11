
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Fuse from 'fuse.js';
import Header from './components/Header';
import PaperCard from './components/PaperCard';
import PaperListItem from './components/PaperListItem';
import ContactModal from './components/ContactModal';
import NewsModal from './components/NewsModal';
// Switched from geminiService to paperService
import { paperService } from './services/paperService';
import { ResearchPaper, ResearchTopic, DateFilterPreset, DateRange, SortOption } from './types';
import { TOPICS, DATE_PRESETS, DATA_SOURCES } from './constants';
import MessageBoard from './components/MessageBoard';

const App: React.FC = () => {
  // Papers state now holds the fetched data
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  // Default to 'QuantFinance' as requested
  const [activeTopic, setActiveTopic] = useState<ResearchTopic>('QuantFinance');
  // Initialize with ALL sources selected so they appear "pressed down" by default
  const [selectedSources, setSelectedSources] = useState<string[]>(DATA_SOURCES.map(s => s.id));
  // Default to 'Month'
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('Month');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isScanning, setIsScanning] = useState(false);
  const [visitCount, setVisitCount] = useState<number>(0);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Simple simulated visitor counter persisting in localStorage
    const stored = localStorage.getItem('quantscan_visits');
    // Start at a "realistic" base number if new user, otherwise increment
    let count = stored ? parseInt(stored) : 10423;
    count++;
    localStorage.setItem('quantscan_visits', count.toString());
    setVisitCount(count);
  }, []);

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTopic, datePreset, selectedSources, customRange, searchTerm, itemsPerPage, sortBy]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };

  const handleTopicChange = (topic: ResearchTopic) => {
    setActiveTopic(topic);
    setSearchTerm(''); // Clear search term when switching topics to allow default topic query
  };

  // Perform the actual API scan
  const performScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    
    try {
      const result = await paperService.scanForPapers(
        activeTopic,
        selectedSources,
        datePreset,
        customRange,
        searchTerm // Pass searchTerm to service for global API search
      );
      
      setPapers(result.papers);
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  // Initial Scan on mount
  useEffect(() => {
    performScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Trigger scan when major "Query" filters change (Topic, Date, Sources)
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    performScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic, datePreset, selectedSources, customRange.start, customRange.end]);


  // Client-side filtering and sorting for search terms and sort order
  // This runs on the *fetched* papers
  const processedPapers = useMemo(() => {
    let results = [...papers];

    // 1. Text Search (Fuzzy)
    // We keep client-side Fuse.js even if we searched via API, 
    // to highlight/rank results effectively.
    if (searchTerm.trim()) {
      const fuse = new Fuse(results, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'abstract', weight: 1 },
          { name: 'authors', weight: 0.5 },
          { name: 'tags', weight: 0.5 },
          { name: 'source', weight: 0.3 }
        ],
        threshold: 0.4, 
        ignoreLocation: true,
        includeScore: true
      });
      
      const fuseResults = fuse.search(searchTerm);
      results = fuseResults.map(result => result.item);
    }

    // 2. Sort
    return results.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'relevance') {
        if (searchTerm.trim()) return 0; // Keep fuse ranking if searching
        return b.relevanceScore - a.relevanceScore;
      }
      return 0;
    });
  }, [papers, searchTerm, sortBy]);

  // Derived Trending Papers: Smart Curator Logic
  const trendingPapers = useMemo(() => {
     // Helper to get papers within N days
     const getPapersWithinDays = (days: number) => {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        const dateStr = dateLimit.toISOString().split('T')[0];
        return papers.filter(p => p.date >= dateStr);
     };

     // 1. Try finding papers from the last 7 days
     let pool = getPapersWithinDays(7);
     let label = "Trending this Week";

     // 2. Fallback: If less than 3 papers, extend to 30 days
     if (pool.length < 3) {
        pool = getPapersWithinDays(30);
        label = "Trending this Month";
     }
     
     // 3. Fallback: If still less than 3, just use all papers
     if (pool.length < 3) {
        pool = [...papers];
        label = "Top Rated";
     }

     // 4. Sort by Impact Score (Relevance + Citation Boost)
     // We weigh citations heavily because they are the user's proxy for "Views/Popularity"
     const sorted = pool.sort((a, b) => {
        const scoreA = a.relevanceScore + ((a.citationCount || 0) * 10);
        const scoreB = b.relevanceScore + ((b.citationCount || 0) * 10);
        return scoreB - scoreA;
     });

     // 5. Select Top 3 with Source Diversity
     // We try to pick the top 3, but if #2 has the same source as #1, we look for a different source if available within the top 10.
     const finalSelection: ResearchPaper[] = [];
     const usedSources = new Set<string>();

     if (sorted.length > 0) {
        finalSelection.push(sorted[0]);
        usedSources.add(sorted[0].source);
     }

     // Attempt to fill spots 2 and 3 with diverse sources
     for (let i = 1; i < sorted.length && finalSelection.length < 3; i++) {
        const p = sorted[i];
        // If source not used, or if we ran out of diverse options (i > 5), just add it
        if (!usedSources.has(p.source) || i > 5) {
           finalSelection.push(p);
           usedSources.add(p.source);
        }
     }

     // Fill remaining spots if diversity check skipped some
     if (finalSelection.length < 3) {
         for (let i = 1; i < sorted.length && finalSelection.length < 3; i++) {
             if (!finalSelection.find(sel => sel.id === sorted[i].id)) {
                 finalSelection.push(sorted[i]);
             }
         }
     }

     return { papers: finalSelection, label };
  }, [papers]);


  // Pagination Logic
  const totalItems = processedPapers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPapers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPapers, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDateSortToggle = () => {
    if (sortBy === 'newest') {
      setSortBy('oldest');
    } else {
      setSortBy('newest');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/90 transition-colors duration-300 flex flex-col font-sans">
      {/* Background Pattern Layer */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          onScan={performScan} 
          onSearch={performScan}
          isScanning={isScanning} 
          theme={theme} 
          toggleTheme={toggleTheme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-8 mb-10">
            {/* Main Controls Section */}
            {/* Removed the split flex row layout (lg:flex-row) to remove the sidebar widget */}
            <div className="flex flex-col gap-6 w-full">
              <div className="space-y-6 w-full">
                
                {/* Research Categories */}
                <div>
                  <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-1">Research Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicChange(topic.id as ResearchTopic)}
                        disabled={isScanning}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm
                          ${activeTopic === topic.id 
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md ring-2 ring-slate-500/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                          } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>{topic.icon}</span>
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Sources */}
                <div>
                  <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-1">Data Sources (Active)</h2>
                  <div className="flex flex-wrap gap-2">
                    {DATA_SOURCES.map((source) => {
                      const isSelected = selectedSources.includes(source.id);
                      return (
                        <button
                          key={source.id}
                          onClick={() => toggleSource(source.id)}
                          disabled={isScanning}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                            ${isSelected 
                              ? 'bg-slate-800 dark:bg-slate-100 border-slate-800 dark:border-slate-100 text-white dark:text-slate-900 shadow-md' 
                              : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900'
                            } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {source.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 pl-1 opacity-70">* Note: Academic journals are aggregated via OpenAlex due to CORS restrictions.</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-8 pt-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-1">Publication Date</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        {DATE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => setDatePreset(preset.id as DateFilterPreset)}
                            disabled={isScanning}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                              ${datePreset === preset.id 
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                              } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium px-3 py-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 outline-none text-slate-700 dark:text-slate-200 shadow-sm"
                          />
                          <span className="text-slate-400 text-xs">to</span>
                          <input 
                            type="date" 
                            value={customRange.end}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium px-3 py-2 rounded-xl focus:ring-2 focus:ring-slate-500/20 outline-none text-slate-700 dark:text-slate-200 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-1">Sort By</h3>
                      <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit overflow-hidden">
                        {/* Relevance Button */}
                        <button
                          onClick={() => setSortBy('relevance')}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${sortBy === 'relevance' 
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                          {sortBy === 'oldest' ? (
                            <i className="fas fa-sort-amount-up"></i>
                          ) : (
                            <i className="fas fa-sort-amount-down"></i>
                          )}
                          Date {sortBy === 'oldest' ? '(Old)' : '(New)'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-1">View</h3>
                      <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit overflow-hidden">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${viewMode === 'grid' 
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          title="Grid View"
                        >
                          <i className="fas fa-th-large"></i>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${viewMode === 'list' 
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          title="List View"
                        >
                          <i className="fas fa-list"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Weekly Highlights Section - Only shows if there are trending papers */}
          {!isScanning && trendingPapers.papers.length > 0 && (
             <div className="mb-10 animate-fade-in">
                <div className="flex items-center gap-3 mb-4 pl-1">
                   <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <i className="fas fa-fire text-orange-600 dark:text-orange-500 text-lg"></i>
                   </div>
                   <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Highlights</h2>
                   <span className="text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-0.5 rounded-md">
                      {trendingPapers.label}
                   </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {trendingPapers.papers.map(paper => (
                      <div key={`trend-${paper.id}`} className="relative bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-900/10 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                         <div className="absolute top-4 right-4 text-orange-500/20 dark:text-orange-500/10 text-6xl font-black -z-10 pointer-events-none">
                            <i className="fas fa-fire"></i>
                         </div>
                         <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-white/80 dark:bg-black/50 px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                                {paper.source}
                             </span>
                             <span className="text-[10px] font-mono text-slate-400">{paper.date}</span>
                         </div>
                         <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2" title={paper.title}>
                            {paper.title}
                         </h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                            {paper.abstract}
                         </p>
                         <div className="flex items-center justify-between mt-auto">
                            <div className="flex -space-x-2">
                               {/* Abstract Avatars icon */}
                               <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-white dark:border-slate-900 text-[10px] text-slate-500">
                                  <i className="fas fa-user"></i>
                               </div>
                            </div>
                            {/* Citation Count Display (Fake Views) */}
                            <div className="flex gap-3">
                              {(paper.citationCount || 0) > 0 && (
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                  <i className="fas fa-quote-right text-[10px]"></i> {paper.citationCount} Cited
                                </span>
                              )}
                              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                 Score: {paper.relevanceScore}
                              </span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* Results Info & Pagination Controls (Top) */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
             <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
               Showing <span className="font-bold text-slate-900 dark:text-white">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> results
             </span>
             
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Show:</span>
               <select 
                 value={itemsPerPage}
                 onChange={(e) => setItemsPerPage(Number(e.target.value))}
                 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200"
               >
                 <option value={10}>10 per page</option>
                 <option value={30}>30 per page</option>
                 <option value={50}>50 per page</option>
                 <option value={100}>100 per page</option>
               </select>
             </div>
          </div>

          {/* Papers Grid/List */}
          {isScanning ? (
            <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}>
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse shadow-sm ${viewMode === 'list' ? 'h-24' : ''}`}>
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                  </div>
                  {viewMode === 'grid' && (
                    <>
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-1"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {paginatedPapers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            ) : (
               <div className="flex flex-col gap-3 animate-fade-in">
                 {paginatedPapers.map((paper) => (
                   <PaperListItem key={paper.id} paper={paper} />
                 ))}
               </div>
            )
          )}

          {/* Pagination Controls (Bottom) */}
          {!isScanning && totalItems > itemsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-12 mb-8">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <i className="fas fa-chevron-left text-xs"></i> Previous
              </button>
              
              <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                 </span>
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isScanning && processedPapers.length === 0 && (
            <div className="text-center py-32 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                <i className="fas fa-search text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Papers Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                {searchTerm 
                  ? `No papers matched "${searchTerm}".` 
                  : "No papers found for this criteria. Try expanding your date range or selecting more sources."}
              </p>
              <button 
                onClick={() => {
                  setDatePreset('Year');
                  handleTopicChange('All');
                  setSelectedSources(DATA_SOURCES.map(d => d.id));
                  setSearchTerm('');
                  setSortBy('relevance');
                }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Message Board Section */}
          <MessageBoard />

        </main>

        <footer className="bg-slate-900 dark:bg-black text-slate-500 py-12 mt-20 transition-colors border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                  <i className="fas fa-microchip"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white leading-none">QuantScan</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">v1.1.0</span>
                </div>
              </div>
              <div className="flex gap-8 text-sm font-medium">
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a>
                <button onClick={() => setIsNewsOpen(true)} className="hover:text-white transition-colors text-left">News</button>
                <button 
                  onClick={() => setIsContactOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact Me
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs">
                    © {new Date().getFullYear()} Global Quantitative Finance Research Hub.
                </p>
                {/* Increased opacity and font weight for better visibility */}
                <p className="text-xs text-slate-400 font-medium mt-1 flex items-center justify-end gap-4">
                    <span>Today: {new Date().toLocaleDateString()}</span>
                    <span className="flex items-center gap-2 bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-800" title="Total Views">
                        <i className="fas fa-eye text-blue-500 dark:text-blue-400"></i> {visitCount.toLocaleString()}
                    </span>
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-[10px] uppercase tracking-widest leading-loose opacity-60">
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
        <NewsModal 
          isOpen={isNewsOpen}
          onClose={() => setIsNewsOpen(false)}
        />
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
