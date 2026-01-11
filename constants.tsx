
import React from 'react';

export const TOPICS = [
  { id: 'All', label: 'All Research', icon: <i className="fas fa-globe"></i> },
  { id: 'QuantFinance', label: 'Quant Finance', icon: <i className="fas fa-calculator"></i> },
  { id: 'PortfolioManagement', label: 'Portfolio Mgmt', icon: <i className="fas fa-chart-pie"></i> },
  { id: 'AssetAllocation', label: 'Asset Allocation', icon: <i className="fas fa-layer-group"></i> },
  { id: 'Macroeconomics', label: 'Macroeconomics', icon: <i className="fas fa-globe-americas"></i> },
  { id: 'Momentum', label: 'Momentum', icon: <i className="fas fa-chart-line"></i> },
  { id: 'Crypto', label: 'Crypto', icon: <i className="fas fa-bitcoin-sign"></i> },
  { id: 'ML', label: 'Machine Learning', icon: <i className="fas fa-brain"></i> },
  { id: 'HFT', label: 'HFT & Liquidity', icon: <i className="fas fa-bolt"></i> },
  { id: 'Risk', label: 'Risk Mgmt', icon: <i className="fas fa-shield-halved"></i> },
  { id: 'FixedIncome', label: 'Fixed Income', icon: <i className="fas fa-file-invoice-dollar"></i> },
  { id: 'InternationalTax', label: 'Intl Tax', icon: <i className="fas fa-earth-americas"></i> },
  { id: 'TransferPricing', label: 'Transfer Pricing', icon: <i className="fas fa-right-left"></i> },
  { id: 'ValueChain', label: 'Value Chain', icon: <i className="fas fa-link"></i> },
  { id: 'Transformation', label: 'Transformation', icon: <i className="fas fa-rocket"></i> },
];

// Updated to reflect sources that have accessible APIs or are aggregated by OpenAlex
export const DATA_SOURCES = [
  { id: 'arXiv', label: 'arXiv (q-fin)' },
  { id: 'SSRN', label: 'SSRN' },
  { id: 'Elsevier', label: 'Elsevier' },
  { id: 'ScienceDirect', label: 'ScienceDirect' },
  { id: 'JBF', label: 'J. Banking & Finance' },
  { id: 'ResearchGate', label: 'ResearchGate (OA)' },
  { id: 'OpenAlex', label: 'OpenAlex (Journals)' },
  { id: 'BIS', label: 'BIS' },
  { id: 'FED', label: 'Fed / FRED' },
  { id: 'BLS', label: 'BLS' },
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

export const MOCK_PAPERS = [];
