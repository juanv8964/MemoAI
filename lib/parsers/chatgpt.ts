import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const conversations: string[] = [];
  $('[data-testid^="conversation-turn"]').each((_, el) => {
    const testid = $(el).attr('data-testid') || '';
    const role = testid.includes('-1') || testid.endsWith('-1')
      ? 'I said:'
      : 'ChatGPT said:';

    let raw = $(el).html() || '';

    raw = raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*/gi, '\n\n')
      .replace(/<li[^>]*>\s*/gi, '\n- ')
      .replace(/<\/li>\s*/gi, '\n')
      .replace(/<\/(ul|ol)>\s*/gi, '\n')
      .replace(/<h[1-6][^>]*>\s*/gi, '\n\n')
      .replace(/<\/h[1-6]>\s*/gi, '\n\n');

    let text = cheerio.load(raw).text();
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    if (!text) return;

    conversations.push(`${role}: ${text}`);
  });

  const content = conversations.join('\n\n');

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}