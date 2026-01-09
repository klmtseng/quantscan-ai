
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchPaper } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async scanForPapers(
    topic: string, 
    sources: string[], 
    datePreset: string, 
    customRange?: { start: string, end: string }
  ): Promise<{ papers: ResearchPaper[] }> {
    
    // Construct a readable date range string for the prompt
    let timeFrame = "recent (last 6 months)";
    const now = new Date();
    
    if (datePreset === 'Week') timeFrame = "the last 7 days";
    else if (datePreset === 'Month') timeFrame = "the last 30 days";
    else if (datePreset === 'Quarter') timeFrame = "the last 3 months";
    else if (datePreset === 'Year') timeFrame = "the last 12 months";
    else if (datePreset === 'Custom' && customRange) timeFrame = `between ${customRange.start} and ${customRange.end}`;

    // Filter source list string
    const sourceList = sources.length > 0 ? sources.join(", ") : "arXiv, SSRN, NBER, and major finance journals";

    const prompt = `
      Task: Search for real, existing research papers published in ${timeFrame}.
      Topic: ${topic === 'All' ? 'Quantitative Finance, Asset Pricing, or Market Microstructure' : topic}.
      Target Sources: ${sourceList}.

      Strict Requirements:
      1. ONLY return real papers that actually exist. Do not hallucinate titles.
      2. The "url" field MUST be a valid, clickable link to the paper (Abstract page, PDF, or SSRN/arXiv page). Use Google Search results to find the correct URL.
      3. If a paper is found but no URL is available, exclude it.
      4. Format the output as a JSON object containing an array of papers.

      Return the results strictly following this JSON schema:
      {
        "papers": [
          {
            "id": "generate-a-unique-id",
            "title": "Exact Title of the Paper",
            "authors": ["Author Name"],
            "abstract": "Detailed abstract of the paper.",
            "date": "YYYY-MM-DD",
            "source": "Source Name (e.g. arXiv, SSRN, JF)",
            "url": "https://valid-url-to-paper...",
            "tags": ["Tag1", "Tag2"],
            "relevanceScore": 85
          }
        ]
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json'
        },
      });

      const text = response.text || '';
      
      // Clean up potential markdown formatting if strict JSON mode misses (though responseMimeType helps)
      let cleanText = text;
      if (text.startsWith('```json')) {
        cleanText = text.replace(/```json\n|\n```/g, '');
      } else if (text.startsWith('```')) {
         cleanText = text.replace(/```\n|\n```/g, '');
      }

      try {
        const parsed = JSON.parse(cleanText);
        let papers: ResearchPaper[] = parsed.papers || [];
        
        // Post-processing to ensure basic validity
        papers = papers.filter(p => p.title && p.url && p.url.startsWith('http'));

        return { papers };
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        return { papers: [] };
      }
    } catch (error) {
      console.error("Error scanning papers:", error);
      return { papers: [] };
    }
  }
}

export const geminiService = new GeminiService();
