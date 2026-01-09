
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

const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const MOCK_PAPERS = [
  {
    id: '1',
    title: "Dynamic Momentum Strategies in Crypto Markets",
    authors: ["John Doe", "Jane Smith"],
    abstract: "This paper explores the cross-sectional momentum effect in liquid cryptocurrencies using high-frequency data from recent weeks.",
    date: getPastDate(2), 
    source: "arXiv" as const,
    url: "https://arxiv.org",
    tags: ["Momentum", "Crypto", "HFT"],
    relevanceScore: 95
  },
  {
    id: '2',
    title: "Time-Series Momentum and Economic Constraints",
    authors: ["Michael Weber", "Linda Chen"],
    abstract: "An investigation into how structural economic constraints impact the effectiveness of trend-following strategies across different asset classes.",
    date: getPastDate(15), 
    source: "SSRN" as const,
    url: "https://ssrn.com",
    tags: ["Momentum", "FixedIncome"],
    relevanceScore: 88
  },
  {
    id: '3',
    title: "Deep Reinforcement Learning for Optimal Execution",
    authors: ["Alan Turing", "John von Neumann"],
    abstract: "A novel approach to minimize implementation shortfall using PPO agents in high-frequency limit order book environments.",
    date: getPastDate(5), 
    source: "arXiv" as const,
    url: "#",
    tags: ["ML", "HFT"],
    relevanceScore: 97
  },
  {
    id: '4',
    title: "Tail Risk Hedging in the Era of Volatility",
    authors: ["Nassim Taleb", "Mark Spitznagel"],
    abstract: "Analyzing the performance of long-volatility convex strategies during market stress events and the impact of tail-risk hedging on Sharpe ratios.",
    date: getPastDate(12), 
    source: "Journal" as const,
    url: "#",
    tags: ["Risk", "Momentum"],
    relevanceScore: 91
  },
  {
    id: '5',
    title: "Yield Curve Modeling with Neural Networks",
    authors: ["Anna Bond", "James Bond"],
    abstract: "Extending the Nelson-Siegel-Svensson model with recurrent neural networks to capture non-linearities in global government bond yield curves.",
    date: getPastDate(25), 
    source: "SSRN" as const,
    url: "#",
    tags: ["FixedIncome", "ML"],
    relevanceScore: 84
  },
  {
    id: '6',
    title: "Stablecoin Stability: A Risk Analysis",
    authors: ["Vitalik Buterin", "Do Kwon"],
    abstract: "Mathematical modeling of de-pegging risks in algorithmic stablecoins under extreme market deleveraging scenarios.",
    date: getPastDate(4), 
    source: "Other" as const,
    url: "#",
    tags: ["Crypto", "Risk"],
    relevanceScore: 89
  }
];
