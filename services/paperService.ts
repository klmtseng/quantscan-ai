
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

// Helper to get raw keywords for a single topic
const getTopicKeywords = (topic: string): string[] => {
    switch(topic) {
        case 'All': return [];
        case 'QuantFinance': return ["quantitative finance", "empirical asset pricing", "asset pricing", "factor investing"];
        case 'Momentum': return ["momentum strategy", "price momentum", "trend following"];
        case 'Crypto': return ["cryptocurrency", "bitcoin", "ethereum", "defi", "blockchain finance"];
        case 'ML': return ["machine learning finance", "neural network finance", "deep learning asset pricing", "financial nlp", "large language model finance"];
        case 'HFT': return ["high frequency trading", "market microstructure", "limit order book", "liquidity provision"];
        case 'Risk': return ["risk management", "value at risk", "portfolio optimization", "tail risk"];
        case 'FixedIncome': return ["fixed income", "yield curve", "corporate bond", "sovereign debt", "treasury"];
        case 'InternationalTax': return ["international taxation", "beps", "corporate tax avoidance", "global tax"];
        case 'TransferPricing': return ["transfer pricing", "profit shifting", "multinational tax"];
        case 'ValueChain': return ["global value chain", "supply chain finance"];
        case 'Transformation': return ["digital transformation finance", "fintech innovation", "financial automation"];
        default: return [];
    }
}

export class PaperService {
  
  async scanForPapers(
    topics: string[], 
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

    // 2. Prepare Search Query Terms (Union Logic)
    // We want (TopicA Keywords) OR (TopicB Keywords)
    
    // First, collect all specific keyword phrases from selected topics
    let topicPhrases: string[] = [];
    if (topics.includes('All')) {
        topicPhrases = []; // Global search, no specific topic limits
    } else {
        // Flatten array of arrays
        topics.forEach(t => {
            topicPhrases = [...topicPhrases, ...getTopicKeywords(t)];
        });
    }

    const cleanSearch = searchTerm ? searchTerm.trim() : "";

    // If we have no topics selected (shouldn't happen due to UI defaults) and no search term, default to "finance"
    if (topicPhrases.length === 0 && !cleanSearch && !topics.includes('All')) {
        topicPhrases = ["quantitative finance"];
    }

    const promises = [];
    const useAllSources = sources.length === 0;

    // 3. Fetch from arXiv (XML)
    if (useAllSources || sources.includes('arXiv')) {
      let q = "cat:q-fin.*";
      
      // Construct ArXiv Query: (all:Topic1 OR all:Topic2) AND all:SearchTerm
      let mainPart = "";
      
      if (topicPhrases.length > 0) {
          // Join topic parts with OR
          // e.g. all:momentum+OR+all:bitcoin
          const joinedTopics = topicPhrases.map(t => `all:"${encodeURIComponent(t)}"`).join('+OR+');
          mainPart = `(${joinedTopics})`;
      }

      if (cleanSearch) {
          const searchPart = `all:${encodeURIComponent(cleanSearch)}`;
          mainPart = mainPart ? `${mainPart}+AND+${searchPart}` : searchPart;
      }

      if (mainPart) {
          q = `${mainPart}+AND+cat:q-fin.*`;
      }

      const arxivUrl = `https://export.arxiv.org/api/query?search_query=${q}&sortBy=submittedDate&sortOrder=descending&max_results=30`;
      
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

    // 4. Fetch from OpenAlex (Generic Handler for SSRN, Journals, BIS, etc)
    // OpenAlex Search Syntax: search=(termA|termB),search=termC (comma is AND, pipe is OR)
    
    let openAlexSearchQuery = "";
    
    // Build Topic OR part: (TopicA|TopicB)
    if (topicPhrases.length > 0) {
        // OpenAlex uses | for OR. 
        // We use quotes around specific multi-word phrases to be precise.
        // e.g. "momentum strategy"|"bitcoin"
        const joined = topicPhrases.map(t => `"${t}"`).join('|'); 
        openAlexSearchQuery = `default.search:${encodeURIComponent(joined)}`;
    }

    // Add explicit Search Term (AND)
    if (cleanSearch) {
        const part = `default.search:${encodeURIComponent(cleanSearch)}`;
        openAlexSearchQuery = openAlexSearchQuery ? `${openAlexSearchQuery},${part}` : part;
    }

    // Helper to push OpenAlex promise
    const fetchOpenAlex = (sourceFilter: string, sourceLabel: string) => {
        let filter = `${sourceFilter},from_publication_date:${fromDate}`;
        if (openAlexSearchQuery) {
            filter = `${openAlexSearchQuery},${filter}`;
        }
        const url = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;
        return fetch(url)
          .then(res => res.json())
          .then(data => parseOpenAlexJSON(data, sourceLabel))
          .catch(err => {
             console.error(`OpenAlex (${sourceLabel}) fetch error`, err);
             return [];
          });
    };

    if (useAllSources || sources.includes('SSRN')) {
       promises.push(fetchOpenAlex('primary_location.source.display_name:ssrn', 'SSRN'));
    }

    if (useAllSources || sources.includes('BIS')) {
       promises.push(fetchOpenAlex('institutions.search:Bank%20for%20International%20Settlements', 'BIS'));
    }

    if (useAllSources || sources.includes('FED')) {
       promises.push(fetchOpenAlex('institutions.search:Federal%20Reserve', 'Federal Reserve'));
    }

    if (useAllSources || sources.includes('BLS')) {
       promises.push(fetchOpenAlex('institutions.search:Bureau%20of%20Labor%20Statistics', 'BLS'));
    }

    if (useAllSources || sources.includes('OpenAlex')) {
       // If no query at all for General Journals, default to "finance" to avoid showing random biology papers
       let effectiveFilter = openAlexSearchQuery;
       if (!effectiveFilter) {
           effectiveFilter = `default.search:finance`;
       }
       
       let filter = `from_publication_date:${fromDate}`;
       if (effectiveFilter) filter = `${effectiveFilter},${filter}`;
       
       const url = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per_page=30`;
       promises.push(
           fetch(url)
           .then(res => res.json())
           .then(data => parseOpenAlexJSON(data, "OpenAlex Journals"))
           .catch(() => [])
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

    // Client-side date filter (strict) for arXiv results which might return older ones despite sort
    const dateLimit = new Date(fromDate);
    
    // Construct local "today" string to avoid UTC timezone issues showing "tomorrow's" papers
    const d = new Date();
    const today = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    
    // Ensure we handle invalid dates gracefully
    if (!isNaN(dateLimit.getTime())) {
       allPapers = allPapers.filter(p => {
         // Exclude future dates (strictly greater than today)
         if (p.date > today) return false;

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
