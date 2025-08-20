import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
const css = `background-color: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.05);
color: rgb(236, 236, 241);
padding: 12px 16px;
border-radius: 8px;`;

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const question = $('article[data-turn^="user"]').text()
  const answer = $('article[data-turn^="assistant"]').text()
  const content = `<div style = "${css}">${question}</div>
  <div style = "${css}">${answer}</div>`;

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length
  };
}
