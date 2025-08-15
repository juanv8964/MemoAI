import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
import TurndownService from 'turndown';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
const turndownservice = new TurndownService();
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const conversations = $('article[data-testid^="conversation-turn"]')
  .map((_, el) =>{
  const rawHTML = $(el).html() || '';
   return turndownservice.turndown(rawHTML);
  })
  .get();
  const content = conversations.join('\n\n---\n\n');
  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
