import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const conversation = $('article[data-testid^="conversation-turn"]').toArray();

  const turns = conversation
    .map((el) => {
      const $el = $(el);
      const $content = $el.clone();
      $content.find('img, svg, button, [role="img"], a:has(img)').remove();

      const text = $content.text().replace(/\n{3,}/g, '\n\n').trim();
      if (!text) return null;
      if (/is this conversation helpful/i.test(text)) return null;

      const turn = $el.attr('data-turn');
      const speaker = turn === 'user' ? 'You' : 'ChatGPT';

      return `${speaker}: ${text}`;
    })
    .filter(Boolean) as string[];

  const content = turns.join('\n\n---\n\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
