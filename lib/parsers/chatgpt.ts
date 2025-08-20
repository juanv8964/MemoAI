import * as cheerio from 'cheerio';
import type { Conversation } from '@/types/conversation';
/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
const css = `background-color: #343541;
float:left;
clear: both;
border-radius: 8px;
color: #ECECF1;
padding: 12px 16px;
margin: 8px 0;
max-width: 80%;`;
const css1 = `background-color: #343541;
float:right;
clear: both;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 16px;
margin: 8px 0;
max-width: 80%;`

export async function parseChatGPT(html: string): Promise<Conversation> {
  const $ = cheerio.load(html);

  const user = $('article[data-turn^="user"]').text()
  const answer = $('article[data-turn^="assistant"]').text()
  const content = `<div style = "${css1}">${user}</div>
  <div style = "${css}">${answer}</div>`;

  return {
    model: 'ChatGPT',
    content,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: html.length
  };
}
