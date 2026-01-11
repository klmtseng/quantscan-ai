
export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  date: string; // ISO format YYYY-MM-DD
  source: string;
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
  | 'QuantFinance'
  | 'Momentum' 
  | 'Crypto' 
  | 'ML' 
  | 'HFT' 
  | 'Risk' 
  | 'FixedIncome'
  | 'InternationalTax'
  | 'TransferPricing'
  | 'ValueChain'
  | 'Transformation';

export type DateFilterPreset = 'Week' | 'Month' | 'Quarter' | 'Year' | 'Custom';

export type SortOption = 'relevance' | 'newest' | 'oldest';

export interface DateRange {
  start: string;
  end: string;
}
