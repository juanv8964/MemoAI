import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const articles = $('article[data-testid^="conversation-turn"]').toArray();

  const turns = articles
    .map((el) => {
      const $el = $(el);
      const $content = $el.clone();

      $content.find('img, svg, button, [role="img"], a:has(img)').remove();
      const $md = $content.find('.markdown, .prose').first();
      const raw = ($md.html() || $content.html() || '').trim();
      const withBreaks = raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>\s*/gi, '\n\n')
        .replace(/<li[^>]*>\s*/gi, '• ')
        .replace(/<\/li>\s*/gi, '\n')
        .replace(/<\/(ul|ol)>\s*/gi, '\n')
        .replace(/<h[1-6][^>]*>\s*/gi, '\n\n')
        .replace(/<\/h[1-6]>\s*/gi, '\n\n');

      const text = cheerio
        .load(withBreaks)
        .text()
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      const role = $el.attr('data-turn') === 'user' ? 'You' : 'ChatGPT';
      return `${role}:\n${text}`;
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
