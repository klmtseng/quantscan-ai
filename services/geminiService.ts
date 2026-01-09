
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchPaper } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async scanForPapers(topic: string): Promise<{ papers: ResearchPaper[], sources: any[] }> {
    const prompt = `
      Search for the latest research papers (published in the last 6 months) from arXiv.org, SSRN.com, and financial journals about: ${topic}.
      Focus on Quantitative Finance, Momentum Trading, and Cryptocurrency Asset Pricing.
      
      Extract a list of papers including:
      - Title
      - Authors
      - Brief Abstract (max 2 sentences)
      - Publication Date
      - Source (arXiv, SSRN, etc.)
      - Link to the paper
      - Key Tags
      
      Return the results as a JSON array strictly following this structure:
      {
        "papers": [
          {
            "id": "unique-string",
            "title": "...",
            "authors": ["Author 1", "Author 2"],
            "abstract": "...",
            "date": "YYYY-MM-DD",
            "source": "...",
            "url": "...",
            "tags": ["...", "..."],
            "relevanceScore": 0-100
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
        },
      });

      const text = response.text || '';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Since the model output might contain markdown formatting, we try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            papers: parsed.papers || [],
            sources: groundingChunks
          };
        } catch (e) {
          console.error("Failed to parse JSON from Gemini response", e);
        }
      }

      // Fallback: If no JSON, the app will handle empty/manual mapping if needed
      return { papers: [], sources: groundingChunks };
    } catch (error) {
      console.error("Error scanning papers:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
