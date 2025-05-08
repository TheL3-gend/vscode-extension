import * as vscode from 'vscode';
import puppeteer from 'puppeteer-core';

export async function getChatGptReply(message: string): Promise<string> {
  const config = vscode.workspace.getConfiguration('chatgptWeb');
  const chromePath = config.get('chromeExecutablePath') as string;
  const userDataDir = config.get('chatgptWeb.chromeProfilePath') as string;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://chat.openai.com/chat', { waitUntil: 'networkidle2' });
  await page.waitForSelector('textarea');
  await page.click('textarea');
  await page.keyboard.type(message);
  await page.keyboard.press('Enter');
  await page.waitForResponse(response =>
    response.url().includes('/backend-api/conversation') && response.status() === 200
  );
  await page.waitForFunction(() => {
    const els = Array.from(document.querySelectorAll('.markdown'));
    if (els.length === 0) return false;
    const last = els[els.length - 1] as HTMLElement;
    return last.innerText.length > 0 && !last.innerText.endsWith('…');
  }, { timeout: 120000 });
  const contents = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.markdown'));
    const last = els[els.length - 1] as HTMLElement;
    return last.innerText;
  });
  await browser.close();
  return contents as string;
}
