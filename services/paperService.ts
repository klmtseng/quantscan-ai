
import { ResearchPaper } from "../types";

// Helper to calculate a dynamic relevance score
const calculateRelevance = (title: string, abstract: string, date: string, tags: string[]): number => {
  let score = 65; // Base score

  const text = (title + " " + abstract).toLowerCase();
  const titleText = title.toLowerCase();

  // 1. Tag Bonus: More detected tags = higher relevance to our specific domain
  score += (tags.length * 4);

  // 2. Recency Bonus
  try {
    const pubDate = new Date(date);
    const now = new Date();
    const daysOld = (now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24);

    if (daysOld < 7) score += 15;        // Super fresh
    else if (daysOld < 30) score += 10;  // Fresh
    else if (daysOld < 90) score += 5;   // Recent
    else if (daysOld > 365) score -= 5;  // Older than a year
  } catch (e) {
    // Ignore date parsing errors
  }

  // 3. High Value Keywords (Scoring Boost)
  const highValueKeywords = [
    'momentum', 'alpha', 'arbitrage', 'neural network', 'transformer', 
    'liquidity', 'high frequency', 'microstructure', 'portfolio optimization',
    'asset pricing', 'volatility', 'predicting', 'forecasting'
  ];

  highValueKeywords.forEach(k => {
    if (titleText.includes(k)) score += 5; // Title match is strong
    else if (text.includes(k)) score += 2; // Abstract match
  });

  // 4. Abstract Quality (Proxy)
  if (abstract.length > 500) score += 3;
  if (abstract.length < 50) score -= 10; // Penalty for missing/short abstract

  // Clamp score between 60 and 99
  return Math.min(99, Math.max(60, Math.floor(score)));
};

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
  if (text.includes('labor') || text.includes('employment') || text.includes('wage')) tags.add('Labor');

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
    
    // Calculate Score
    const score = calculateRelevance(title, summary, published.split("T")[0], tags);

    return {
      id,
      title,
      authors,
      abstract: summary,
      date: published.split("T")[0],
      source: "arXiv (q-fin)",
      url: link,
      tags: tags,
      relevanceScore: score
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
    
    // Normalize source names
    if (sourceName && sourceName.toLowerCase().includes('ssrn')) sourceName = "SSRN";
    // For Fed/BIS/BLS, often the source is generic "Working Paper", so we prefer the default label if provided and relevant
    if (defaultSourceLabel === "BIS" && !sourceName.toLowerCase().includes('bis')) sourceName = "BIS Working Papers";
    if (defaultSourceLabel === "Federal Reserve" && !sourceName.toLowerCase().includes('federal reserve')) sourceName = "Federal Reserve";
    if (defaultSourceLabel === "BLS" && !sourceName.toLowerCase().includes('labor statistics')) sourceName = "BLS";

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
    
    // Calculate Score
    const score = calculateRelevance(work.title, abstract, work.publication_date, tags);

    return {
      id: work.id,
      title: work.title,
      authors: authors, // Limit to 3 for UI
      abstract: abstract,
      date: work.publication_date || "",
      source: sourceName || "OpenAlex",
      url: work.doi || work.primary_location?.landing_page_url || "",
      tags: tags,
      relevanceScore: score
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
    // We determine the Topic keywords first, then combine with searchTerm if present.
    let baseQuery = "";
    switch(topic) {
        case 'All': baseQuery = ""; break;
        case 'QuantFinance': baseQuery = "quantitative finance empirical asset pricing"; break;
        case 'Momentum': baseQuery = "momentum strategy asset pricing"; break;
        case 'Crypto': baseQuery = "cryptocurrency bitcoin defi"; break;
        case 'ML': baseQuery = "machine learning finance neural networks"; break;
        case 'HFT': baseQuery = "high frequency trading microstructure liquidity"; break;
        case 'Risk': baseQuery = "risk management value at risk volatility"; break;
        case 'FixedIncome': baseQuery = "fixed income yield curve bond market"; break;
        case 'InternationalTax': baseQuery = "international taxation tax avoidance BEPS corporate tax"; break;
        case 'TransferPricing': baseQuery = "transfer pricing multinational enterprises profit shifting"; break;
        case 'ValueChain': baseQuery = "global value chain supply chain finance economic value added"; break;
        case 'Transformation': baseQuery = "digital transformation business model innovation finance automation"; break;
        default: baseQuery = "quantitative finance asset pricing"; break;
    }

    let queryTerm = baseQuery;
    
    if (searchTerm && searchTerm.trim()) {
        const cleanSearch = searchTerm.trim();
        if (baseQuery) {
            // Combine Search Term with Topic (e.g., "Momentum" topic + "Tesla" search -> "Tesla momentum strategy...")
            // We put search term first to prioritize it in relevance
            queryTerm = `${cleanSearch} ${baseQuery}`;
        } else {
            // If topic is All, just use search term
            queryTerm = cleanSearch;
        }
    }

    const promises = [];
    const useAllSources = sources.length === 0;

    // 3. Fetch from arXiv (XML)
    // Only if arXiv is selected or All sources
    if (useAllSources || sources.includes('arXiv')) {
      // ArXiv: If queryTerm is empty, use catch-all. Otherwise construct query.
      // We always append cat:q-fin.* to ensure domain relevance.
      let q = "";
      if (!queryTerm) {
         q = "cat:q-fin.*";
      } else {
         // ArXiv prefers terms joined by +AND+ or similar. 
         // For simple free text mixed with category, "all:term+AND+cat:..." works.
         q = `all:${encodeURIComponent(queryTerm)}+AND+cat:q-fin.*`;
      }
      
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=${q}&sortBy=submittedDate&sortOrder=descending&max_results=30`;
      
      // Use a CORS proxy (corsproxy.io) to bypass browser restrictions
      // allorigins.win can be unstable, so we use corsproxy.io
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(arxivUrl)}`;

      promises.push(
        fetch(proxyUrl)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
          })
          .then(text => parseArxivXML(text))
          .catch(err => {
            console.error("arXiv fetch error", err);
            return [];
          })
      );
    }

    // 4. Fetch from OpenAlex (SSRN Specific)
    if (useAllSources || sources.includes('SSRN')) {
       let filter = `primary_location.source.display_name:ssrn,from_publication_date:${fromDate}`;
       if (queryTerm) {
         filter = `default.search:${encodeURIComponent(queryTerm)},${filter}`;
       }

       const ssrnUrl = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;

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

    // 5. Fetch BIS (Bank for International Settlements)
    if (useAllSources || sources.includes('BIS')) {
       let filter = `institutions.search:Bank%20for%20International%20Settlements,from_publication_date:${fromDate}`;
       if (queryTerm) {
          filter = `default.search:${encodeURIComponent(queryTerm)},${filter}`;
       }
       
       const url = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;
       promises.push(
        fetch(url)
          .then(res => res.json())
          .then(data => parseOpenAlexJSON(data, "BIS"))
          .catch(err => {
            console.error("BIS fetch error", err);
            return [];
          })
       );
    }

    // 6. Fetch Federal Reserve (FED)
    if (useAllSources || sources.includes('FED')) {
       let filter = `institutions.search:Federal%20Reserve,from_publication_date:${fromDate}`;
       if (queryTerm) {
          filter = `default.search:${encodeURIComponent(queryTerm)},${filter}`;
       }

       const url = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;
       promises.push(
        fetch(url)
          .then(res => res.json())
          .then(data => parseOpenAlexJSON(data, "Federal Reserve"))
          .catch(err => {
            console.error("FED fetch error", err);
            return [];
          })
       );
    }

    // 7. Fetch BLS (Bureau of Labor Statistics)
    if (useAllSources || sources.includes('BLS')) {
       let filter = `institutions.search:Bureau%20of%20Labor%20Statistics,from_publication_date:${fromDate}`;
       if (queryTerm) {
          filter = `default.search:${encodeURIComponent(queryTerm)},${filter}`;
       }

       const url = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;
       promises.push(
        fetch(url)
          .then(res => res.json())
          .then(data => parseOpenAlexJSON(data, "BLS"))
          .catch(err => {
            console.error("BLS fetch error", err);
            return [];
          })
       );
    }

    // 8. Fetch from OpenAlex (General Journals)
    if (useAllSources || sources.includes('OpenAlex')) {
       // For general bucket, "All" needs to be bounded to domain to avoid unrelated sciences.
       // If baseQuery is empty (Topic=All) and NO search term, fallback to "finance economics"
       let effectiveQuery = queryTerm;
       if (!effectiveQuery) effectiveQuery = "finance economics";

       const filter = `default.search:${encodeURIComponent(effectiveQuery)},from_publication_date:${fromDate}`;
       
       const openAlexUrl = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;

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

    // 9. Aggregate and Sort
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

    // Client-side date filter (strict)
    // 1. Ensure we don't show papers from "tomorrow"
    const d = new Date();
    // Get YYYY-MM-DD for today in local time
    const todayString = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');

    const dateLimit = new Date(fromDate);
    
    // Ensure we handle invalid dates gracefully
    allPapers = allPapers.filter(p => {
         // Strict future date check
         if (p.date > todayString) return false;
         
         // Standard filter range check
         if (!isNaN(dateLimit.getTime())) {
            const pDate = new Date(p.date);
            return !isNaN(pDate.getTime()) && pDate >= dateLimit;
         }
         return true;
    });

    // Sort by date descending
    allPapers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { papers: allPapers };
  }
}

export const paperService = new PaperService();
