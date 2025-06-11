import express from 'express';
// import cors from 'cors';
import { scrapRemoteOK } from './lib/puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(cors());

app.get('/vagas', async (req, res) => {
  try {
    const vagas = await scrapRemoteOK();
    res.json(vagas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar vagas', detalhes: error });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
