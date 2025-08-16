import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const questions = $('[data-testid^="conversation-turn-1"]')
  .map((_, el) => $(el).text().trim())
  .get();
  const answers = $('[data-testid^="conversation-turn-2"]')
  .map((_, el) => $(el).text().trim())
  .get();
  const merged = [];
  for (let i = 0; i < Math.max(questions.length, answers.length); i++){
    if(questions[i]) merged.push(questions[i]);
    if(answers[i]) merged.push(answers[i]);

  }
  const content = merged.join('\n\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
