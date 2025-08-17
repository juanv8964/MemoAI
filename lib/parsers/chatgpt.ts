import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const question = $('article[data-turn^="user"]').first().text().trim();
  const answer = $('article[data-turn^="assistant"]').first().text().trim();
  const content = `${question}\n\n${answer}`;

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length
  };
}
