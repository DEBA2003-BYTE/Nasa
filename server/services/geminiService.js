const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  constructor() {
    console.log('Initializing Gemini service...');
    
    // Check for API key in environment variables
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('WARNING: GOOGLE_GENAI_API_KEY is not set. Using fallback summaries.');
      this.genAI = null;
      return;
    }
    
    try {
      console.log('Initializing GoogleGenAI...');
      this.genAI = new GoogleGenAI({
        apiKey: apiKey
      });
      console.log('Successfully connected to GoogleGenAI');
    } catch (error) {
      console.error('Failed to initialize GoogleGenAI:', error.message);
      this.genAI = null;
    }
  }

  async generateSummary(title) {
    // Fallback summary if Gemini is not available
    if (!this.genAI) {
      return this.generateFallbackSummary(title);
    }

    try {
      const prompt = `Generate a concise 50-word summary for a scientific paper titled "${title}". 
                     Focus on key findings and significance. Be precise and academic.`;
      
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      return response.text();
    } catch (error) {
      console.error('Error with Gemini API:', error.message);
      // Fall back to the simple summary if API fails
      return this.generateFallbackSummary(title);
    }
  }
  
  generateFallbackSummary(title) {
    // Simple fallback that creates a generic but relevant summary
    const keywords = title.toLowerCase().split(/\s+/);
    const hasSpace = keywords.some(k => ['space', 'nasa', 'microgravity', 'astronaut'].includes(k));
    const hasBio = keywords.some(k => ['cell', 'gene', 'protein', 'biology', 'molecular'].includes(k));
    
    let focus = 'This study';
    if (hasSpace && hasBio) {
      focus = 'This space biology research';
    } else if (hasSpace) {
      focus = 'This space-related study';
    } else if (hasBio) {
      focus = 'This biological research';
    }
    
    return `${focus} titled "${title}" investigates key aspects of its subject matter. ` +
           `The findings contribute to our understanding in this important field of study.`;
  }
}

module.exports = new GeminiService();
