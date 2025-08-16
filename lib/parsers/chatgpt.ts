import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const conversation = $('[data-testid^="conversation-turn"]')
  .map((_, el) => {
    const contentDiv = $(el).find('.whitespace-pre-wrap');
    contentDiv.find('br').replaceWith('\n');
    return contentDiv.text();

  })
  .get();
  const content = conversation.join('\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
