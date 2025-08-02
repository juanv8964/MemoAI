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
  const content = messages.join('\n\n');
  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
