import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);
  const messages = $('div.markdown.prose.dark\\:prose-invert.w-full.break-words.dark.markdown-new-styling')
  .map((_, el) => $(el).text().trim())
  .get();
  const content = messages.join('\n\n');
  console.log(messages);
  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length,
  };
}
