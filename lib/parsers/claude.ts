import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a Claude share page into a structured Conversation.
 */
export async function parseClaude(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  
  return {
    model: 'Claude',
    content: html,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
