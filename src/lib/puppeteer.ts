import puppeteer from 'puppeteer';
import { obterInsightDaVaga } from './groqAI';

export async function scrapWeWorkRemotely() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://weworkremotely.com/remote-jobs', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.jobs');

  const vagas = await page.$$eval('.jobs section ul li:not(.view-all)', (items) =>
    items.map((el) => {
      const linkEl = el.querySelector('a');
      const link = linkEl ? `https://weworkremotely.com${linkEl.getAttribute('href')}` : '';
      const empresa = el.querySelector('.company')?.textContent?.trim() ?? '';
      const titulo = el.querySelector('.title')?.textContent?.trim() ?? '';
      const tags = Array.from(el.querySelectorAll('.region.company')).map((tag) =>
        tag.textContent?.trim() ?? ''
      );
      return { titulo, empresa, link, tags, descricao: '', insight: '' };
    })
  );

  for (const vaga of vagas.slice(0, 5)) {
    try {
      await page.goto(vaga.link, { waitUntil: 'domcontentloaded' });
      const descricao = await page.$eval('.listing-container', (el) => el.textContent?.trim() ?? '');
      vaga.descricao = descricao;
      vaga.insight = await obterInsightDaVaga(vaga);
    } catch (error) {
      console.error(`Erro ao acessar ${vaga.link}:`, error);
    }
  }

  await browser.close();
  return vagas;
}
