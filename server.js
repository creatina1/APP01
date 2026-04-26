const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/anunciar', async (req, res) => {
    const { produto, contas, kiwifyOptions } = req.body;

    console.log('POST /api/anunciar body:', {
        produto,
        contas: { ...contas, kiwify: { apiKey: contas?.kiwify?.apiKey ? '*****' : '' } },
        kiwifyOptions
    });

    if (!produto || !contas) {
        return res.status(400).json({ success: false, message: 'Dados inválidos para anúncio' });
    }

    const resultados = [];
    let tentativaRealizada = false;

    if (contas.kiwify?.apiKey) {
        tentativaRealizada = true;
        try {
            const kiwifyResult = await criarProdutoKiwify(produto, contas.kiwify.apiKey, kiwifyOptions);
            resultados.push({ plataforma: 'Kiwify', success: true, details: kiwifyResult });
        } catch (error) {
            resultados.push({ plataforma: 'Kiwify', success: false, error: error.message });
        }
    }

    if (contas.hotmart?.apiKey) {
        tentativaRealizada = true;
        resultados.push({ plataforma: 'Hotmart', success: false, error: 'Integração Hotmart não implementada ainda' });
    }

    if (contas.monetizze?.apiKey) {
        tentativaRealizada = true;
        resultados.push({ plataforma: 'Monetizze', success: false, error: 'Integração Monetizze não implementada ainda' });
    }

    if (contas.eduzz?.apiKey) {
        tentativaRealizada = true;
        resultados.push({ plataforma: 'Eduzz', success: false, error: 'Integração Eduzz não implementada ainda' });
    }

    if (!tentativaRealizada) {
        return res.status(400).json({ success: false, message: 'Nenhuma plataforma configurada para anúncio' });
    }

    const sucesso = resultados.some(item => item.success);
    const statusCode = sucesso ? 200 : 400;
    const mensagem = !sucesso
        ? resultados.filter(item => !item.success).map(item => `${item.plataforma}: ${item.error}`).join(' | ')
        : null;

    return res.status(statusCode).json({ success: sucesso, results: resultados, message: mensagem });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor funcionando' });
});

async function criarProdutoKiwify(produto, apiKey, options = {}) {
    // Converter preço para centavos
    const precoEmCentavos = Math.round(Number(String(produto.preco).replace(',', '.')) * 100);
    const pageUrl = options.pageUrl || 'https://exemplo.com/vendas';
    const paymentType = options.paymentType || 'único';
    const deliveryType = options.deliveryType || 'kiwify';
    const membershipArea = options.membershipArea || 'Nova área de membros';

    const kiwifyPayload = {
        name: produto.nome,
        title: produto.nome,
        description: produto.descricao,
        price: precoEmCentavos,
        currency: 'BRL',
        category: 'Internet Marketing',
        page_url: pageUrl,
        payment_type: paymentType,
        delivery_type: deliveryType,
        membership_area: membershipArea
    };

    console.log('Kiwify payload:', kiwifyPayload);
    console.log('Kiwify API key presente:', !!apiKey);

    const response = await fetch('https://api.kiwify.com.br/v1/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kiwifyPayload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Kiwify error response:', data);
        const detalhe = data.message || data.error || (data.errors && data.errors[0] && data.errors[0].message) || JSON.stringify(data);
        throw new Error(detalhe || 'Falha ao criar produto na Kiwify');
    }

    return data;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
});