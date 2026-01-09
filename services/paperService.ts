
import { ResearchPaper } from "../types";

// Helper to generate smart tags based on content
const generateTags = (title: string, abstract: string): string[] => {
  const text = (title + " " + abstract).toLowerCase();
  const tags = new Set<string>();

  // Asset Classes & Markets
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ether') || text.includes('blockchain') || text.includes('defi')) tags.add('Crypto');
  if (text.includes('equity') || text.includes('stock') || text.includes('equities')) tags.add('Equities');
  if (text.includes('bond') || text.includes('fixed income') || text.includes('treasur') || text.includes('yield curve')) tags.add('Fixed Income');
  if (text.includes('option') || text.includes('derivative') || text.includes('volatility') || text.includes('implied vol') || text.includes('hedging')) tags.add('Derivatives');
  if (text.includes('fx') || text.includes('currency') || text.includes('exchange rate')) tags.add('FX');
  if (text.includes('commodit')) tags.add('Commodities');
  if (text.includes('etf')) tags.add('ETF');

  // Strategies & Concepts
  if (text.includes('momentum') || text.includes('trend')) tags.add('Momentum');
  if (text.includes('reversal') || text.includes('mean reversion')) tags.add('Reversal');
  if (text.includes('arbitrage')) tags.add('Arbitrage');
  if (text.includes('value') && (text.includes('growth') || text.includes('investing'))) tags.add('Value');
  if (text.includes('carry')) tags.add('Carry');
  
  // Methodology & Technology
  if (text.includes('machine learning') || text.includes('neural network') || text.includes('deep learning') || text.includes('reinforcement learning') || text.includes('lstm') || text.includes('transformer')) tags.add('ML/AI');
  if (text.includes('nlp') || text.includes('sentiment') || text.includes('textual') || text.includes('llm') || text.includes('language model')) tags.add('NLP');
  if (text.includes('high frequency') || text.includes('hft') || text.includes('microstructure') || text.includes('order book') || text.includes('limit order')) tags.add('HFT');
  if (text.includes('statistical') || text.includes('econometric')) tags.add('Stats');

  // Core Topics
  if (text.includes('risk') || text.includes('drawdown') || text.includes('var') || text.includes('shortfall')) tags.add('Risk Mgmt');
  if (text.includes('portfolio') || text.includes('allocation') || text.includes('optimization')) tags.add('Portfolio');
  if (text.includes('liquidity') && !tags.has('HFT')) tags.add('Liquidity');
  if (text.includes('factor') || text.includes('alpha') || text.includes('asset pricing') || text.includes('beta')) tags.add('Asset Pricing');
  if (text.includes('macro') || text.includes('inflation') || text.includes('monetary') || text.includes('gdp')) tags.add('Macro');
  if (text.includes('esg') || text.includes('sustainable') || text.includes('climate')) tags.add('ESG');

  // Tax & Corporate (Specific to user requirements seen in topics)
  if (text.includes('tax') || text.includes('beps')) tags.add('Tax');
  if (text.includes('transfer pricing')) tags.add('Transfer Pricing');
  if (text.includes('supply chain') || text.includes('value chain')) tags.add('Value Chain');

  // Default fallback if really nothing matches
  if (tags.size === 0) {
    if (text.includes('quant')) tags.add('Quant');
    else tags.add('Finance');
  }

  return Array.from(tags);
};

// Helper to parse XML from arXiv
const parseArxivXML = (text: string): ResearchPaper[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");
  const entries = xmlDoc.getElementsByTagName("entry");
  
  return Array.from(entries).map((entry) => {
    const id = entry.getElementsByTagName("id")[0]?.textContent || Math.random().toString();
    const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\n/g, " ").trim() || "No Title";
    const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\n/g, " ").trim() || "Abstract not available.";
    const published = entry.getElementsByTagName("published")[0]?.textContent || "";
    const authors = Array.from(entry.getElementsByTagName("author")).map(
      (a) => a.getElementsByTagName("name")[0]?.textContent || ""
    );
    const link = entry.getElementsByTagName("id")[0]?.textContent || ""; // arXiv ID url is usually the ID

    const tags = generateTags(title, summary);
    if (tags.length === 0) tags.push("Pre-print");

    return {
      id,
      title,
      authors,
      abstract: summary,
      date: published.split("T")[0],
      source: "arXiv (q-fin)",
      url: link,
      tags: tags,
      relevanceScore: 100
    };
  });
};

// Helper to map OpenAlex results with strict filtering
const parseOpenAlexJSON = (data: any, defaultSourceLabel: string): ResearchPaper[] => {
  if (!data.results) return [];

  // Filter out "Ads" and non-paper content
  const validResults = data.results.filter((work: any) => {
    // 1. Must be a valid content type
    const validTypes = ['article', 'preprint', 'report', 'dissertation'];
    if (!validTypes.includes(work.type)) return false;

    // 2. Must have a title
    if (!work.title) return false;
    const titleLower = work.title.toLowerCase();

    // 3. Filter out common "Junk" / "Front Matter" titles
    const junkTerms = [
      'front matter', 'back matter', 'issue information', 'table of contents', 
      'editorial board', 'masthead', 'cover image', 'index to', 'author index'
    ];
    if (junkTerms.some(term => titleLower.includes(term))) return false;

    return true;
  });

  return validResults.map((work: any) => {
    let sourceName = work.primary_location?.source?.display_name || defaultSourceLabel;
    
    // Normalize SSRN name
    if (sourceName && sourceName.toLowerCase().includes('ssrn')) {
      sourceName = "SSRN";
    }

    // Handle missing authors
    const authors = work.authorships && work.authorships.length > 0
      ? work.authorships.map((a: any) => a.author.display_name).slice(0, 3)
      : ["Unknown Author"];

    // Handle missing abstract
    const abstract = work.abstract_inverted_index
      ? createAbstractFromInvertedIndex(work.abstract_inverted_index)
      : "Abstract preview not available via API. Please click 'Full Report' to view details at the source.";

    const tags = generateTags(work.title, abstract);
    if (tags.length === 0) tags.push("Research");

    return {
      id: work.id,
      title: work.title,
      authors: authors, // Limit to 3 for UI
      abstract: abstract,
      date: work.publication_date || "",
      source: sourceName || "OpenAlex",
      url: work.doi || work.primary_location?.landing_page_url || "",
      tags: tags,
      relevanceScore: 90
    };
  });
};

// OpenAlex stores abstracts as inverted indexes to save space. We reconstruct it.
const createAbstractFromInvertedIndex = (invertedIndex: any) => {
  if (!invertedIndex) return "";
  const words: string[] = [];
  Object.keys(invertedIndex).forEach((word) => {
    invertedIndex[word].forEach((position: number) => {
      words[position] = word;
    });
  });
  return words.join(" ");
};

export class PaperService {
  
  async scanForPapers(
    topic: string, 
    sources: string[], 
    datePreset: string, 
    customRange?: { start: string, end: string },
    searchTerm?: string
  ): Promise<{ papers: ResearchPaper[] }> {

    // 1. Calculate Date Filter (YYYY-MM-DD)
    let fromDate = "";
    
    if (datePreset === 'Week') {
      const d = new Date(); d.setDate(d.getDate() - 7); fromDate = d.toISOString().split('T')[0];
    } else if (datePreset === 'Month') {
      const d = new Date(); d.setDate(d.getDate() - 30); fromDate = d.toISOString().split('T')[0];
    } else if (datePreset === 'Quarter') {
      const d = new Date(); d.setDate(d.getDate() - 90); fromDate = d.toISOString().split('T')[0];
    } else if (datePreset === 'Year') {
      const d = new Date(); d.setFullYear(d.getFullYear() - 1); fromDate = d.toISOString().split('T')[0];
    } else if (datePreset === 'Custom' && customRange) {
      fromDate = customRange.start;
    } else {
      // Default to 1 year if All/Unknown
      const d = new Date(); d.setFullYear(d.getFullYear() - 1); fromDate = d.toISOString().split('T')[0];
    }

    // 2. Prepare Search Queries
    // If searchTerm is present, it overrides the Topic preset.
    let queryTerm = "";
    if (searchTerm && searchTerm.trim()) {
      queryTerm = searchTerm.trim();
    } else {
      switch(topic) {
        case 'Momentum': queryTerm = "momentum strategy asset pricing"; break;
        case 'Crypto': queryTerm = "cryptocurrency bitcoin defi"; break;
        case 'ML': queryTerm = "machine learning finance neural networks"; break;
        case 'HFT': queryTerm = "high frequency trading microstructure liquidity"; break;
        case 'Risk': queryTerm = "risk management value at risk volatility"; break;
        case 'FixedIncome': queryTerm = "fixed income yield curve bond market"; break;
        case 'InternationalTax': queryTerm = "international taxation tax avoidance BEPS corporate tax"; break;
        case 'TransferPricing': queryTerm = "transfer pricing multinational enterprises profit shifting"; break;
        case 'ValueChain': queryTerm = "global value chain supply chain finance economic value added"; break;
        case 'Transformation': queryTerm = "digital transformation business model innovation finance automation"; break;
        default: queryTerm = "quantitative finance asset pricing"; break;
      }
    }

    const promises = [];
    const useAllSources = sources.length === 0;

    // 3. Fetch from arXiv (XML)
    // Only if arXiv is selected or All sources
    if (useAllSources || sources.includes('arXiv')) {
      // Increased max_results to 30 to better handle date filtering
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(queryTerm)}+AND+cat:q-fin.*&sortBy=submittedDate&sortOrder=descending&max_results=30`;
      
      promises.push(
        fetch(arxivUrl)
          .then(res => res.text())
          .then(text => parseArxivXML(text))
          .catch(err => {
            console.error("arXiv fetch error", err);
            return [];
          })
      );
    }

    // 4. Fetch from OpenAlex (SSRN Specific)
    // Use OpenAlex to proxy SSRN searches since SSRN has no public CORS API.
    // Query specifically for "SSRN" in the venue name.
    if (useAllSources || sources.includes('SSRN')) {
       // Filter by primary_location.source.display_name:SSRN
       // Increased per_page to 30
       const ssrnUrl = `https://api.openalex.org/works?filter=default.search:${encodeURIComponent(queryTerm)},primary_location.source.display_name:ssrn,from_publication_date:${fromDate}&sort=publication_date:desc&per_page=30`;

       promises.push(
        fetch(ssrnUrl)
          .then(res => res.json())
          .then(data => parseOpenAlexJSON(data, "SSRN"))
          .catch(err => {
             console.error("OpenAlex (SSRN) fetch error", err);
             return [];
          })
       );
    }

    // 5. Fetch from OpenAlex (General Journals)
    // Exclude SSRN to avoid duplicates if possible, or just accept them.
    // Ideally we filter out SSRN here if we fetched it above, but keeping it simple is fine as we dedup later.
    if (useAllSources || sources.includes('OpenAlex')) {
       // Increased per_page to 30
       const openAlexUrl = `https://api.openalex.org/works?filter=default.search:${encodeURIComponent(queryTerm)},from_publication_date:${fromDate}&sort=publication_date:desc&per_page=30`;

       promises.push(
        fetch(openAlexUrl)
          .then(res => res.json())
          .then(data => parseOpenAlexJSON(data, "OpenAlex Journals"))
          .catch(err => {
             console.error("OpenAlex (General) fetch error", err);
             return [];
          })
       );
    }

    // 6. Aggregate and Sort
    const results = await Promise.all(promises);
    let allPapers = results.flat();

    // Remove duplicates based on title similarity
    const seen = new Set();
    allPapers = allPapers.filter(p => {
      // Normalize title for key: lowercase, alphanumeric only
      const key = p.title.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Client-side date filter (strict) for arXiv results which might return older ones despite sort
    const dateLimit = new Date(fromDate);
    
    // Ensure we handle invalid dates gracefully
    if (!isNaN(dateLimit.getTime())) {
       allPapers = allPapers.filter(p => {
         const pDate = new Date(p.date);
         return !isNaN(pDate.getTime()) && pDate >= dateLimit;
       });
    }

    // Sort by date descending
    allPapers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { papers: allPapers };
  }
}

export const paperService = new PaperService();
