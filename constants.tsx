
import React from 'react';

export const TOPICS = [
  { id: 'All', label: 'All Research', icon: <i className="fas fa-globe"></i> },
  { id: 'Momentum', label: 'Momentum', icon: <i className="fas fa-chart-line"></i> },
  { id: 'Crypto', label: 'Crypto', icon: <i className="fas fa-bitcoin-sign"></i> },
  { id: 'ML', label: 'Machine Learning', icon: <i className="fas fa-brain"></i> },
  { id: 'HFT', label: 'HFT & Liquidity', icon: <i className="fas fa-bolt"></i> },
  { id: 'Risk', label: 'Risk Mgmt', icon: <i className="fas fa-shield-halved"></i> },
  { id: 'FixedIncome', label: 'Fixed Income', icon: <i className="fas fa-file-invoice-dollar"></i> },
];

export const DATA_SOURCES = [
  { id: 'arXiv', label: 'arXiv (q-fin)' },
  { id: 'SSRN', label: 'SSRN' },
  { id: 'NBER', label: 'NBER' },
  { id: 'JF', label: 'J. Finance' },
  { id: 'JFE', label: 'J. Fin. Econ' },
  { id: 'RFS', label: 'Rev. Fin. Studies' },
  { id: 'CFA', label: 'CFA Institute' },
  { id: 'BIS', label: 'BIS' },
  { id: 'Fed', label: 'Fed Reserve' },
];

export const DATE_PRESETS = [
  { id: 'Week', label: 'Last Week' },
  { id: 'Month', label: 'Last Month' },
  { id: 'Quarter', label: 'Last Quarter' },
  { id: 'Year', label: 'Last Year' },
  { id: 'Custom', label: 'Custom Range' },
];

export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', icon: <i className="fas fa-fire"></i> },
  { id: 'newest', label: 'Newest', icon: <i className="fas fa-sort-amount-down"></i> },
  { id: 'oldest', label: 'Oldest', icon: <i className="fas fa-sort-amount-up"></i> },
];

// Initialize with empty array since we are now fetching real data
export const MOCK_PAPERS = [];
