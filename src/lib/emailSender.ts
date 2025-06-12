import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { scrapWeWorkRemotely } from './puppeteer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function formatarEmailHTML(vagas: any[]) {
  const vagaCards = vagas.map(vaga => `
    <div style="border:1px solid #ddd;padding:16px;margin-bottom:20px;border-radius:8px;">
      <h2 style="margin:0;color:#2b2b2b;">${vaga.titulo}</h2>
      <h3 style="margin:4px 0;color:#444;">${vaga.empresa}</h3>
      <p><strong>Tags:</strong> ${vaga.tags.join(', ')}</p>
      <p><a href="${vaga.link}" target="_blank" style="color:#1a73e8;">Ver vaga</a></p>
      <p style="margin-top:12px;"><strong>Insight para se candidatar:</strong></p>
      <div style="background:#f7f7f7;padding:12px;border-left:4px solid #1a73e8;border-radius:4px;">
        <pre style="white-space:pre-wrap;font-family:Arial;font-size:14px;">${vaga.insight}</pre>
      </div>
    </div>
  `).join('\n');

  return `
    <div style="font-family:Arial, sans-serif;">
      <h1 style="color:#1a73e8;">🎯 Vagas recomendadas com insights personalizados</h1>
      ${vagaCards}
      <footer style="margin-top:40px;font-size:12px;color:#888;">
        Enviado automaticamente pelo seu sistema de scraping + IA 🤖
      </footer>
    </div>
  `;
}

export async function enviarEmailComVagas() {
  const vagas = await scrapWeWorkRemotely();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: '📬 Vagas de emprego com insights personalizados',
    html: formatarEmailHTML(vagas)
  };

  await transporter.sendMail(mailOptions);
  console.log('✅ Email enviado com sucesso!');
}

enviarEmailComVagas().catch(console.error);
