import puppeteer from 'puppeteer';
import { obterInsightDaVaga } from './groqAI';

export async function scrapRemoteOK() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://remoteok.com', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-offset="2"]');

  const vagas = await page.$$eval('tr.job', (rows) => {
    return rows.map((el) => {
      const titulo = el.querySelector('h2')?.textContent?.trim() ?? '';
      const empresa = el.querySelector('.companyLink h3')?.textContent?.trim() ?? '';
      const linkRelativo = el.getAttribute('data-href') ?? '';
      const link = `https://remoteok.com${linkRelativo}`;
      const tags = Array.from(el.querySelectorAll('.tags .tag')).map((tag) =>
        tag.textContent?.trim() ?? ''
      );
      return { titulo, empresa, link, tags, descricao: '', insight: '' };
    });
  });

  for (const vaga of vagas.slice(0, 5)) {
    try {
      await page.goto(vaga.link, { waitUntil: 'domcontentloaded' });
      const descricao = await page.$eval('div.description', (el) => el.textContent?.trim() ?? '');
      vaga.descricao = descricao;
      vaga.insight = await obterInsightDaVaga(vaga);
    } catch (error) {
      console.error(`Erro ao acessar ${vaga.link}:`, error);
    }
  }

  await browser.close();
  return vagas;
}
