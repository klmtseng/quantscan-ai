
// This service has been deprecated and the Gemini API dependency removed.
// The application now uses direct API calls to arXiv and OpenAlex via paperService.ts.

export class GeminiService {
  async scanForPapers() {
    console.warn("GeminiService is deprecated. Use paperService instead.");
    return { papers: [] };
  }
}

export const geminiService = new GeminiService();
