const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos estáticos da pasta raiz
app.use(express.static('.'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de saúde para Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor funcionando' });
});

// Porta do Railway ou 3000 local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
});