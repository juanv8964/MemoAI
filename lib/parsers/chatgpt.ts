import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 * Keeps readable formatting (paragraphs, lists, headings) without Turndown.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const nodes = $(
    'article[data-testid^="conversation-turn"], article[data-testid="conversation-turn"]'
  ).toArray();

  const parts = nodes
    .map((el) => {
      const $el = $(el);

      const roleAttr = ($el.attr('data-turn') || ($el.data('turn') as string) || '').toString();
      const speaker = /user/i.test(roleAttr) ? 'You' : 'ChatGPT';

      const $body = speaker === 'You' ? $el.find('.whitespace-pre-wrap, [data-message-author-role="user"]').first()
      : $el.find('.markdown, .prose').first();
      const $copy = ($body.length ? $body : $el).clone();

      $copy
        .find('img, svg, button, [role="img"], a:has(img)')
        .remove()
        .end()
        .find('[aria-live], [data-testid="conversation-action"], [data-testid="feedback"], footer')
        .remove();

      let htmlChunk = $copy.html() || '';

      htmlChunk = htmlChunk
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<li[^>]*>/gi, '- ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/ul>|<\/ol>/gi, '\n')
        .replace(/<h[1-6][^>]*>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n');

      const text = cheerio
        .load(htmlChunk)
        .text()
        .replace(/\u00A0/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!text || /is this conversation helpful/i.test(text)) return null;

      return `${speaker}: ${text}`;
    })
    .filter(Boolean) as string[];

  const content = parts.join('\n\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
