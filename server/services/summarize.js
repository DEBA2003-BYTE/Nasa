/**
 * Basic text summarization service
 * TODO: Enhance with LLM-based summarization
 */
function generateSummary(title, text) {
  if (!text) {
    return `Summary of "${title}": This paper discusses space biology research. No detailed abstract available.`;
  }
  
  // Simple extractive summarization - take first 2 sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  return sentences.slice(0, 2).join('. ') + '.';
}

module.exports = {
  generateSummary
};