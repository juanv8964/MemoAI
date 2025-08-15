import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const articles = $('article[data-testid^="conversation-turn"]').toArray();

  const turns = articles
    .map((node) => {
      const $article = $(node);

      const turn = $article.attr('data-turn') || '';
      const speaker = turn === 'user' ? 'You' : 'ChatGPT';

      const $body = $article.find('.markdown, .prose').first();
      let raw = $body.html() || $article.html() || '';

      raw = raw
        .replace(/<br\s*\/?>/gi, '\n')        
        .replace(/<\/p>/gi, '\n\n')           
        .replace(/<li[^>]*>/gi, '- ')         
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/ul>|<\/ol>/gi, '\n')
        .replace(/<h[1-6][^>]*>/gi, '\n\n')   
        .replace(/<\/h[1-6]>/gi, '\n\n');

      const text = cheerio
        .load(raw)('body')
        .text()
        .replace(/\u00A0/g, ' ')      
        .replace(/\r/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')          
        .trim();

      return `${speaker}: ${text}`;
    })
    .filter(Boolean) as string[];

  const content = turns.join('\n\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}