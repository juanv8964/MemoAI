import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const question = $('[data-testid^="conversation-turn-1"]')
  .map((_, el) => $(el).text().trim())
  .get();

  const content = question.join('\n');
  console.log(content);


  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
