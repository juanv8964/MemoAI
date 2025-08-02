import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const messages = $('div.markdown, div.propose, div.prose-invert')
  .map((_, el) => $(el).text().trim())
  .get();
  return {
    model: 'ChatGPT',
    content: html,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
