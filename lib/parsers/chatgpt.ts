import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const conversation = $('[data-testid^="conversation-turn"]')
  .map((_, el) => $(el).text().trim())
  .get();
  const merged = [];
  for (let i = 0; i < Math.max(conversation.length); i++){
    if(conversation[i]) merged.push(conversation[i]);

  }
  const content = merged.join('\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
