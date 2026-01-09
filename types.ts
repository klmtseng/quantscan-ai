
export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  date: string; // ISO format YYYY-MM-DD
  source: 'arXiv' | 'SSRN' | 'Journal' | 'Other';
  url: string;
  tags: string[];
  relevanceScore: number;
}

export interface ScannerState {
  isScanning: boolean;
  papers: ResearchPaper[];
  lastScanTime: Date | null;
  error: string | null;
}

export type ResearchTopic = 
  | 'All' 
  | 'Momentum' 
  | 'Crypto' 
  | 'ML' 
  | 'HFT' 
  | 'Risk' 
  | 'FixedIncome';

export type DateFilterPreset = 'Week' | 'Month' | 'Quarter' | 'Year' | 'Custom';

export type SortOption = 'relevance' | 'newest' | 'oldest';

export interface DateRange {
  start: string;
  end: string;
}
