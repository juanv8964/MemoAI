import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const conversations = 'article[data-testid^="conversation-turn"] .markdown,' +
    'article[data-testid^="conversation-turn"] .prose';
  const nodes = $(conversations).toArray();
  const removingParts = nodes.map((el) => {
    const $el = $(el);
    const $copy = $el.clone();
    $copy.find('img, svg, button, [role="img"], a:has(img)').remove();
    const text = $copy.text().replace(/\n{3,}/g,  '\n\n').trim();
    const turn = $(el).closest('article').attr('data-turn');
    const speaker = turn === 'user' ? 'You' : 'ChatGPT';
    return `${speaker}:\m${text}`;
  }).filter(Boolean)  as string[];
  const content = removingParts.join('\n\n');
  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
