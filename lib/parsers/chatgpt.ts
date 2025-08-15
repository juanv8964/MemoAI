import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 * Keeps readable formatting (paragraphs, lists, headings) without Turndown.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const articles = $('article[data-testid^="conversation-turn"]').toArray();

  const turns = articles
    .map((el) => {
      const $article = $(el);
      const $content = $article.find('.markdown, .prose').first().clone();

      $content.find('img, svg, button, [role="img"], a:has(img)').remove();

      const text = $content.text().replace(/\n{3,}/g, '\n\n').trim();
      if (!text) return null;
      if (/is this conversation helpful/i.test(text)) return null;

      const turn = $article.attr('data-turn'); // 'user' or 'assistant'
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
