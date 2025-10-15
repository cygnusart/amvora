// IMPROVED Mock AI Service
export async function summarizeNote(content: string): Promise<string> {
  if (!content.trim()) return 'No content to summarize.';
  
  // Better mock that actually summarizes
  const words = content.split(' ');
  if (words.length <= 20) {
    return `Summary: ${content}`;
  }
  
  // Create a simple summary by taking key sentences
  const sentences = content.split('.');
  const summary = sentences.slice(0, 2).join('. ') + '.';
  
  return `🤖 ${summary} [AI Summary]`;
}

export async function generateTags(content: string): Promise<string[]> {
  if (!content.trim()) return [];
  
  const tags = new Set(['ai-tagged', 'amvora']);
  
  // Content-based tagging
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('project') || contentLower.includes('plan')) tags.add('project');
  if (contentLower.includes('meeting') || contentLower.includes('discuss')) tags.add('meeting');
  if (contentLower.includes('idea') || contentLower.includes('creative')) tags.add('ideas');
  if (contentLower.includes('work') || contentLower.includes('job')) tags.add('work');
  if (contentLower.includes('personal') || contentLower.includes('life')) tags.add('personal');
  if (contentLower.includes('tech') || contentLower.includes('code')) tags.add('technology');
  if (contentLower.includes('study') || contentLower.includes('learn')) tags.add('learning');
  
  return Array.from(tags);
}