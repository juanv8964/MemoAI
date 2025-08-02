import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const content = $('div.markdown.prose').text().trim();
  return {
    model: 'ChatGPT',
    content: content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
