import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const conversations = $('div.markdown.prose.w-full.break-words')
  .map((_, el) => $(el).text().trim())
  .get();
  const content = conversations.join('\n\n');
  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
