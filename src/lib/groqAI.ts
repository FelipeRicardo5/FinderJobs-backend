import dotenv from 'dotenv';
dotenv.config();

export async function obterInsightDaVaga(vaga: {
    titulo: string;
    empresa: string;
    descricao: string;
    tags: string[];
}) {
    const prompt = `
Você é um assistente de carreira. Abaixo está uma vaga de emprego. Gere um resumo útil para o candidato com os seguintes itens:
1. Perfil ideal do candidato
2. Pontos-chave da vaga
3. Sugestões para se destacar ao aplicar

Título: ${vaga.titulo}
Empresa: ${vaga.empresa}
Tags: ${vaga.tags.join(', ')}
Descrição: ${vaga.descricao}
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL,
            messages: [
                { role: 'system', content: 'Você é um assistente de carreira.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Erro da Groq API:', data);
        throw new Error('Erro ao gerar insight com Groq');
    }

    return data.choices?.[0]?.message?.content ?? '';
}
