const ADM_EMAIL = 'joaopaulobarbosafernandesmonte@gmail.com';
const ADM_SENHA = 'Jujuba_881';
let usuarioLogado = null;
let produtosGerados = [];
let pdfBlobUrl = null;
let currentPdfProdutoId = null;

window.addEventListener('load', () => {
    iniciarDados();
    verificarLogin();
    carregarContas();
});

function iniciarDados() {
    const admin = JSON.parse(localStorage.getItem('adminCreds')) || null;
    if (!admin) {
        localStorage.setItem('adminCreds', JSON.stringify({ email: ADM_EMAIL, senha: ADM_SENHA }));
    }

    const contas = JSON.parse(localStorage.getItem('contas')) || {};
    contas.hotmart = contas.hotmart || { conectado: false, apiKey: '' };
    contas.kiwify = contas.kiwify || { conectado: false, apiKey: '' };
    contas.monetizze = contas.monetizze || { conectado: false, apiKey: '' };
    contas.eduzz = contas.eduzz || { conectado: false, apiKey: '' };
    localStorage.setItem('contas', JSON.stringify(contas));
}

function login() {
    const email = document.getElementById('emailInput').value.trim();
    const senha = document.getElementById('passwordInput').value.trim();

    if (!email || !senha) {
        mostrarNotificacao('⚠️ Preencha email e senha', true);
        return;
    }

    const admin = JSON.parse(localStorage.getItem('adminCreds')) || { email: ADM_EMAIL, senha: ADM_SENHA };
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioValido = (email === admin.email && senha === admin.senha) || usuarios.find(u => u.email === email && u.senha === senha);

    if (usuarioValido) {
        usuarioLogado = email;
        localStorage.setItem('usuarioLogado', email);
        mostrarDashboard();
        mostrarNotificacao('✅ Bem-vindo!');
    } else {
        mostrarNotificacao('❌ Email ou senha inválidos', true);
    }
}

function verificarLogin() {
    usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        mostrarDashboard();
    }
}

function mostrarDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'flex';
    document.getElementById('userDisplay').textContent = `👤 ${usuarioLogado}`;

    if (usuarioLogado === ADM_EMAIL) {
        document.getElementById('acessoAdmBtn').style.display = 'block';
        document.getElementById('adminChangeSection').style.display = 'block';
    } else {
        document.getElementById('acessoAdmBtn').style.display = 'none';
        document.getElementById('adminChangeSection').style.display = 'none';
    }

    switchTab('fabrica');
    atualizarHistorico();
    atualizarUsuariosAdm();
    atualizarContasStatus();
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    usuarioLogado = null;
    document.getElementById('appScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }

    if (tabName === 'historico') atualizarHistorico();
    if (tabName === 'gestao-contas') {
        carregarContas();
        atualizarContasStatus();
    }
    if (tabName === 'acesso-adm') atualizarUsuariosAdm();
}

function gerarProdutos() {
    const nomes = [
        'Curso Python Avançado', 'Masterclass de Marketing Digital', 'Trilha Full Stack',
        'Método de Produção em Massa', 'AMA Mentoria Exclusiva', 'Ebook SEO Completo',
        'Certificação Cloud AWS', 'Bootcamp DevOps', 'Mini Curso de IA/ChatGPT',
        'Guia Completo de Branding', 'Curso de Fotografia', 'Template Shopify Premium'
    ];

    const descricoes = [
        'Aprenda as técnicas mais avançadas de programação Python com projetos reais',
        'Estratégias comprovadas para gerar tráfego e converter vendas online',
        'Do frontend ao backend, domina todas as tecnologias web modernas',
        'Sistema completo para automatizar e escalar seu negócio',
        'Sessões 1 a 1 com especialistas do mercado',
        'Guia passo a passo para ranking no Google em 90 dias',
        'Certificação reconhecida internacionalmente em computação em nuvem',
        'Ferramentas e práticas para DevOps profissional',
        'Aproveite o boom da IA e crie produtos viáveis',
        'Identidade visual que vende e diferencia sua marca',
        'De amador a profissional em 30 dias',
        'Loja virtual pronta para vender'
    ];

    const grid = document.getElementById('produtosGrid');
    grid.innerHTML = '';
    produtosGerados = [];

    for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * nomes.length);
        const preco = (Math.random() * 95 + 5).toFixed(2);
        const id = Date.now() + i;

        const produto = criarInfoprodutoDetalhado(id, nomes[idx], descricoes[idx], preco);
        produtosGerados.push(produto);

        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <h3>${produto.nome}</h3>
            <div class="produto-senha-box">
                <span>Senha:</span>
                <strong>${produto.accessKey}</strong>
            </div>
            <p>${produto.descricao}</p>
            <div class="produto-preco">R$ ${produto.preco}</div>
            <div class="produto-actions">
                <button class="btn-open-pdf" onclick="abrirPdf(${id})">📄 PDF</button>
                <button class="btn-anunciar" onclick="anunciarProduto(${id})">📢 Anunciar</button>
                <button class="btn-secondary" onclick="salvarProduto(${id})">💾 Salvar</button>
                <a href="#" class="btn-link" onclick="abrirConteudoDigital(${id})">📚 Conteúdo</a>
            </div>
        `;
        grid.appendChild(card);
    }
}

function criarInfoprodutoDetalhado(id, nome, descricao, preco) {
    const accessKey = generateAccessKey(nome, id);
    const moduloBase = nome.toLowerCase().includes('python') ? 'Python' :
        nome.toLowerCase().includes('marketing') ? 'Marketing Digital' :
        nome.toLowerCase().includes('full stack') ? 'Full Stack' :
        nome.toLowerCase().includes('devops') ? 'DevOps' :
        nome.toLowerCase().includes('ia') ? 'Inteligência Artificial' :
        nome.toLowerCase().includes('seo') ? 'SEO' :
        nome.toLowerCase().includes('branding') ? 'Branding' :
        nome.toLowerCase().includes('fotografia') ? 'Fotografia' :
        'Negócios Digitais';

    const modulos = [
        {
            titulo: 'Módulo 1: Fundamentos e propósito',
            descricao: `Compreenda os principais conceitos de ${moduloBase} e o objetivo deste curso.`,
            exercicio: `Liste 3 situações em que ${moduloBase} pode transformar resultados reais.`,
            exemplo: `Exemplo prático: criar um primeiro projeto de ${moduloBase}.`
        },
        {
            titulo: 'Módulo 2: Aplicação prática',
            descricao: `O passo a passo para montar sua primeira entrega de ${moduloBase}.`,
            exercicio: `Crie um plano de aula ou conteúdo com 3 tópicos principais deste tema.`,
            exemplo: `Exemplo de produto: estrutura de aula, página de vendas e área de membros.`
        },
        {
            titulo: 'Módulo 3: Exercícios e resultados',
            descricao: `Aprenda com exercícios focados em conversão, retenção e escalabilidade.`,
            exercicio: `Desenvolva um mini projeto prático com 2 tarefas principais.`,
            exemplo: `Exemplo de sucesso: vendas, criação de comunidade e entrega do conteúdo.`
        },
        {
            titulo: 'Módulo 4: Produção de conteúdo e edição',
            descricao: `Como estruturar vídeos, textos e imagens para vender no Hotmart e Kiwify.`,
            exercicio: `Crie o roteiro de uma aula piloto com abertura, conteúdo e CTA.`,
            exemplo: `Exemplo: roteiro de aula com introdução, explicação e chamada para ação.`
        }
    ];

    return {
        id,
        nome,
        descricao,
        preco,
        data: new Date().toLocaleString('pt-BR'),
        accessKey,
        digitalContent: {
            titulo: `Conteúdo completo de ${nome}`,
            descricao: `Curso completo com teoria, exemplos, exercícios e orientação de aplicação para ${nome}.`,
            modulos,
            beneficios: [
                'Aprenda rapidamente a criar e vender um infoproduto',
                'Domine o passo a passo do lançamento do curso',
                'Pratique com exercícios reais e exemplos de aula',
                'Use este conteúdo para publicar na Hotmart e Kiwify'
            ],
            imagem: `Imagem ilustrativa de ${nome}`
        }
    };
}

function generateAccessKey(nome, id) {
    const prefix = nome.split(' ')[0].toUpperCase().slice(0, 4);
    return `KEY-${prefix}-${String(id).slice(-4)}`;
}

function salvarProduto(id) {
    const produto = produtosGerados.find(p => p.id === id);
    if (!produto) {
        mostrarNotificacao('❌ Infoproduto não encontrado', true);
        return;
    }

    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    if (historico.find(p => p.id === id)) {
        mostrarNotificacao('⚠️ Infoproduto já existe no histórico', true);
        return;
    }

    historico.push({ ...produto, data: new Date().toLocaleString('pt-BR') });
    localStorage.setItem('historico', JSON.stringify(historico));
    atualizarHistorico();
    mostrarNotificacao('✅ Infoproduto salvo no histórico');
}

function abrirPdf(id) {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    let produto = produtosGerados.find(p => p.id === id) || historico.find(p => p.id === id);

    if (!produto) {
        mostrarNotificacao('❌ Infoproduto não encontrado', true);
        return;
    }

    if (!produto.accessKey) {
        produto.accessKey = generateAccessKey(produto.nome, produto.id);
    }

    currentPdfProdutoId = id;
    document.getElementById('btnAbrirConteudoDigital').style.display = 'inline-flex';

    if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
    }

    pdfBlobUrl = URL.createObjectURL(gerarPdfBlob(produto));
    document.getElementById('pdfViewer').src = pdfBlobUrl;
    document.getElementById('pdfModal').classList.add('show');
}

function fecharPdf() {
    document.getElementById('pdfViewer').src = '';
    if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        pdfBlobUrl = null;
    }
    document.getElementById('pdfModal').classList.remove('show');
}

function escapePdfText(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\r/g, '')
        .replace(/\n/g, '\\n');
}

function gerarPdfBlob(produto) {
    const data = produto.data || new Date().toLocaleString('pt-BR');
    const title = `Curso sobre ${produto.nome}`;
    const preco = `Preço sugerido: R$ ${produto.preco}`;
    const chaveAcesso = produto.accessKey || generateAccessKey(produto.nome, produto.id);
    const digital = produto.digitalContent || {};

    const paginas = [
        [
            `${title}`,
            `Descrição: ${produto.descricao}`,
            `${preco}`,
            `Data de criação: ${data}`,
            '',
            'Este é um curso completo sobre o tema, com teoria aprofundada, exemplos práticos, exercícios aplicáveis e orientações passo a passo.',
            'O conteúdo inclui vídeos explicativos, materiais de apoio, exercícios interativos e suporte para dúvidas.',
            'Ao final do curso, você terá habilidades práticas para aplicar o conhecimento no mundo real.',
            '',
            'Imagem ilustrativa: Representação visual do tema principal do curso, mostrando aplicações práticas e benefícios.'
        ],
        [
            'Módulo 1: Fundamentos e Conceitos Básicos',
            `${digital.modulos ? digital.modulos[0].titulo : 'Introdução aos Fundamentos'}`,
            `${digital.modulos ? digital.modulos[0].descricao : 'Compreenda os princípios fundamentais do tema.'}`,
            '',
            'Tópicos abordados:',
            '- Definição e importância do tema',
            '- Histórico e evolução',
            '- Conceitos chave e terminologia',
            '- Aplicações práticas no mercado atual',
            '',
            `Exercício: ${digital.modulos ? digital.modulos[0].exercicio : 'Liste 5 conceitos fundamentais e explique cada um.'}`,
            `Exemplo: ${digital.modulos ? digital.modulos[0].exemplo : 'Estudo de caso real de aplicação bem-sucedida.'}`,
            '',
            'Imagem: Diagrama explicativo dos conceitos básicos com exemplos visuais.'
        ],
        [
            'Módulo 2: Aplicação Prática e Estratégias',
            `${digital.modulos ? digital.modulos[1].titulo : 'Aplicação Prática'}`,
            `${digital.modulos ? digital.modulos[1].descricao : 'Como aplicar os conhecimentos na prática.'}`,
            '',
            'Conteúdo detalhado:',
            '- Metodologias e abordagens comprovadas',
            '- Ferramentas e recursos necessários',
            '- Planejamento e execução passo a passo',
            '- Casos de sucesso e lições aprendidas',
            '',
            `Exercício: ${digital.modulos ? digital.modulos[1].exercicio : 'Desenvolva um plano de ação com 3 etapas principais.'}`,
            `Exemplo: ${digital.modulos ? digital.modulos[1].exemplo : 'Demonstração prática com ferramentas reais.'}`,
            '',
            'Imagem: Fluxograma do processo de aplicação prática com checkpoints.'
        ],
        [
            'Módulo 3: Exercícios Avançados e Otimização',
            `${digital.modulos ? digital.modulos[2].titulo : 'Exercícios e Otimização'}`,
            `${digital.modulos ? digital.modulos[2].descricao : 'Aprofundamento com exercícios desafiadores.'}`,
            '',
            'Atividades incluídas:',
            '- Exercícios de fixação dos conceitos',
            '- Projetos práticos completos',
            '- Análise de cenários complexos',
            '- Otimização e melhorias de performance',
            '',
            `Exercício: ${digital.modulos ? digital.modulos[2].exercicio : 'Execute um projeto completo aplicando todos os conceitos.'}`,
            `Exemplo: ${digital.modulos ? digital.modulos[2].exemplo : 'Análise comparativa de diferentes abordagens.'}`,
            '',
            'Imagem: Gráficos de resultados e métricas de sucesso dos exercícios.'
        ],
        [
            'Módulo 4: Produção de Conteúdo e Publicação',
            `${digital.modulos ? digital.modulos[3].titulo : 'Produção e Publicação'}`,
            `${digital.modulos ? digital.modulos[3].descricao : 'Como criar e publicar seu próprio conteúdo.'}`,
            '',
            'Orientações completas:',
            '- Planejamento de conteúdo e roteiro',
            '- Técnicas de produção e edição',
            '- Estratégias de marketing e divulgação',
            '- Plataformas de publicação (Hotmart, Kiwify)',
            '',
            `Exercício: ${digital.modulos ? digital.modulos[3].exercicio : 'Crie um plano completo de produção de conteúdo.'}`,
            `Exemplo: ${digital.modulos ? digital.modulos[3].exemplo : 'Exemplo de produto final publicado.'}`,
            '',
            'Imagem: Timeline de produção com marcos e entregáveis.'
        ],
        [
            'Recursos Adicionais e Suporte',
            'Materiais complementares incluídos:',
            '- Templates e planilhas editáveis',
            '- Lista de ferramentas recomendadas',
            '- Comunidade de alunos para networking',
            '- Suporte técnico e mentorias',
            '',
            'Benefícios do curso:',
            `${digital.beneficios ? digital.beneficios.map(b => `- ${b}`).join('\\n') : '- Aprendizado acelerado\\n- Aplicação prática\\n- Suporte contínuo'}`,
            '',
            'Próximos passos após o curso:',
            '- Implementação dos conhecimentos adquiridos',
            '- Construção de portfólio',
            '- Networking e oportunidades de negócio',
            '',
            'Imagem: Recursos visuais e materiais de apoio disponíveis.'
        ],
        [
            'Informações de Acesso ao Conteúdo Digital',
            'Para acessar o conteúdo completo digital do curso:',
            '1. Visite a página de conteúdo digital no site',
            '2. Insira a senha de acesso fornecida',
            '3. Tenha acesso imediato a todos os materiais',
            '',
            'A senha de acesso garante:',
            '- Vídeos em alta definição',
            '- Materiais de apoio atualizados',
            '- Exercícios interativos',
            '- Suporte da comunidade',
            '',
            `Senha de Acesso: ${chaveAcesso}`,
            '',
            'IMPORTANTE: Guarde esta senha em local seguro. Ela é única para este produto.',
            '',
            'Imagem: Interface de acesso ao conteúdo digital com senha inserida.'
        ]
    ];

    const pageStreams = paginas.map((lines, pageIndex) => {
        let stream = 'BT\n/F1 16 Tf\n50 780 Td\n';
        lines.forEach((line, index) => {
            if (index > 0) {
                stream += '0 -18 Td\n';
            }
            stream += `(${escapePdfText(line)}) Tj\n`;
        });
        stream += 'ET\n';

        if (pageIndex === 0) {
            stream += 'q\n0.9 0.92 0.95 rg\n50 520 240 120 re f\n0 0 0 RG\n50 520 240 120 re S\nQ\n';
            stream += 'BT\n/F1 10 Tf\n60 590 Td\n(' + escapePdfText('Imagem ilustrativa do tema') + ') Tj\nET\n';
        }

        return stream;
    });

    let pdf = '%PDF-1.3\n';
    const offsets = [];

    const appendObj = content => {
        offsets.push(pdf.length);
        pdf += content;
    };

    appendObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    appendObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R 6 0 R 7 0 R 8 0 R 9 0 R] /Count 7 >>\nendobj\n');
    appendObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 11 0 R >>\nendobj\n');
    appendObj('4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 12 0 R >>\nendobj\n');
    appendObj('5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 13 0 R >>\nendobj\n');
    appendObj('6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 14 0 R >>\nendobj\n');
    appendObj('7 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 15 0 R >>\nendobj\n');
    appendObj('8 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 16 0 R >>\nendobj\n');
    appendObj('9 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 10 0 R >> >> /Contents 17 0 R >>\nendobj\n');
    appendObj('10 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

    pageStreams.forEach((stream, index) => {
        const length = new TextEncoder().encode(stream).length;
        appendObj(`${11 + index} 0 obj\n<< /Length ${length} >>\nstream\n${stream}endstream\nendobj\n`);
    });

    const xrefOffset = pdf.length;
    pdf += 'xref\n0 18\n0000000000 65535 f \n';
    offsets.forEach(offset => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer << /Size 18 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
}

async function anunciarProduto(id) {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    let produto = produtosGerados.find(p => p.id === id) || historico.find(p => p.id === id);

    if (!produto) {
        mostrarNotificacao('❌ Infoproduto não encontrado', true);
        return;
    }

    const contas = JSON.parse(localStorage.getItem('contas')) || { hotmart: {}, kiwify: {}, monetizze: {}, eduzz: {} };
    const plataformasConfiguradas = Object.entries(contas).filter(([, conta]) => conta && conta.conectado && conta.apiKey);

    if (plataformasConfiguradas.length === 0) {
        mostrarNotificacao('⚠️ Conecte pelo menos uma plataforma antes de anunciar', true);
        return;
    }

    if (!produto.accessKey) {
        produto.accessKey = generateAccessKey(produto.nome, produto.id);
    }

    try {
        const response = await fetch('/api/anunciar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ produto, contas })
        });

        const result = await response.json();
        if (!response.ok) {
            const detail = result.message || result.error || JSON.stringify(result);
            throw new Error(detail || 'Erro ao anunciar produto');
        }

        const plataformasSucesso = result.results.filter(r => r.success).map(r => r.plataforma);
        const plataformasFalha = result.results.filter(r => !r.success).map(r => `${r.plataforma}: ${r.error || 'erro desconhecido'}`);

        const postagens = JSON.parse(localStorage.getItem('postagens')) || [];
        const dataCriacao = new Date().toLocaleString('pt-BR');

        const postagem = {
            produtoId: produto.id,
            nome: produto.nome,
            descricao: produto.descricao,
            preco: produto.preco,
            plataforma: plataformasSucesso.join(', '),
            conta: plataformasSucesso.length > 0 ? plataformasSucesso.join(', ') : 'Nenhuma',
            configuracao: contas.kiwifyConfig || null,
            data: dataCriacao,
            accessKey: produto.accessKey,
            digitalContent: produto.digitalContent || null,
            resultados: result.results
        };

        postagens.push(postagem);
        localStorage.setItem('postagens', JSON.stringify(postagens));
        atualizarContasStatus();

        if (plataformasFalha.length > 0) {
            mostrarNotificacao(`⚠️ Algumas integrações falharam: ${plataformasFalha.join(' | ')}`, true);
        } else {
            mostrarNotificacao(`✅ Produto anunciado em: ${plataformasSucesso.join(', ')}`);
        }
    } catch (error) {
        mostrarNotificacao(`❌ ${error.message}`, true);
    }
}

function maskApiKey(apiKey) {
    if (!apiKey) return '';
    if (apiKey.length <= 10) return apiKey;
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

function mostrarConteudoDigital(id) {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    let produto = produtosGerados.find(p => p.id === id) || historico.find(p => p.id === id);

    if (!produto) {
        mostrarNotificacao('❌ Infoproduto não encontrado', true);
        return;
    }

    if (!produto.accessKey) {
        produto.accessKey = generateAccessKey(produto.nome, produto.id);
    }

    switchTab('conteudo-digital');
    atualizarDigitalAccess(produto);
    renderDigitalContent(produto);
}

function abrirConteudoDigital(id) {
    const produtoId = id || currentPdfProdutoId;
    mostrarConteudoDigital(produtoId);
    document.getElementById('pdfModal').classList.remove('show');
}

function atualizarDigitalAccess(produto) {
    const acesso = JSON.parse(localStorage.getItem('digitalAccess')) || {};
    const granted = acesso[produto.id];
    const digitalAccess = document.getElementById('digitalAccess');
    const container = document.getElementById('digitalContentContainer');

    if (granted) {
        digitalAccess.innerHTML = `<div class="digital-unlocked">🔓 Acesso liberado para <strong>${produto.nome}</strong></div>`;
        return;
    }

    if (!produto.accessKey) {
        produto.accessKey = generateAccessKey(produto.nome, produto.id);
    }

    container.innerHTML = '';
    digitalAccess.innerHTML = `
        <div class="digital-access-form">
            <p>Informe a senha do produto para liberar o conteúdo digital. A senha está disponível no PDF gerado.</p>
            <input type="text" id="digitalAccessKeyInput" placeholder="Senha do produto" class="input-field">
            <button class="btn-primary" onclick="validarAcessoDigital(${produto.id})">🔓 Liberar acesso</button>
        </div>
    `;
}

function validarAcessoDigital(id) {
    const chave = document.getElementById('digitalAccessKeyInput')?.value.trim();
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    let produto = produtosGerados.find(p => p.id === id) || historico.find(p => p.id === id);

    if (!produto) {
        mostrarNotificacao('❌ Infoproduto não encontrado', true);
        return;
    }

    if (!chave) {
        mostrarNotificacao('⚠️ Digite a chave de acesso', true);
        return;
    }

    if (chave !== produto.accessKey) {
        mostrarNotificacao('❌ Chave inválida', true);
        return;
    }

    const acesso = JSON.parse(localStorage.getItem('digitalAccess')) || {};
    acesso[id] = true;
    localStorage.setItem('digitalAccess', JSON.stringify(acesso));
    mostrarNotificacao('✅ Acesso digital liberado');
    atualizarDigitalAccess(produto);
    renderDigitalContent(produto);
}

function renderDigitalContent(produto) {
    if (!produto.accessKey) {
        produto.accessKey = generateAccessKey(produto.nome, produto.id);
    }

    const acesso = JSON.parse(localStorage.getItem('digitalAccess')) || {};
    const granted = acesso[produto.id];
    const container = document.getElementById('digitalContentContainer');

    if (!granted) {
        container.innerHTML = '';
        return;
    }

    const content = produto.digitalContent || {};
    const modulos = (content.modulos || []).map(mod => `
        <div class="digital-card">
            <h4>${mod.titulo}</h4>
            <p>${mod.descricao}</p>
            <p><strong>Exercício:</strong> ${mod.exercicio}</p>
            <p><strong>Exemplo:</strong> ${mod.exemplo}</p>
        </div>
    `).join('');

    const beneficios = (content.beneficios || []).map(item => `<li>${item}</li>`).join('');

    container.innerHTML = `
        <div class="digital-hero">
            <h3>${content.titulo || produto.nome}</h3>
            <p>${content.descricao || produto.descricao}</p>
            <div class="digital-image">${content.imagem || 'Imagem ilustrativa do tema'}</div>
        </div>
        <div class="digital-section">
            <h4>O que você vai aprender</h4>
            <ul>${beneficios}</ul>
        </div>
        <div class="digital-section">
            <h4>Aulas e Exercícios</h4>
            ${modulos}
        </div>
        <div class="digital-section">
            <h4>Como acessar na Hotmart / Kiwify</h4>
            <p>Este conteúdo digital representa a área de membros do produto publicado. O acesso ao curso é protegido pela senha, e o conteúdo só é liberado após validá-la aqui.</p>
        </div>
        <div class="digital-section">
            <h4>Senha de Acesso</h4>
            <div class="senha-box"><span>Senha:</span> <strong>${produto.accessKey}</strong></div>
            <p style="color:#808080;font-size:0.9em;">Guarde esta senha em local seguro. Ela é necessária para acessar o conteúdo digital.</p>
        </div>
    `;
}

function atualizarHistorico() {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    const lista = document.getElementById('historicoList');

    if (historico.length === 0) {
        lista.innerHTML = '<div style="color:#808080;text-align:center;padding:40px;">Nenhum infoproduto salvo</div>';
        return;
    }

    lista.innerHTML = historico.map(p => `
        <div class="historico-item">
            <h4>${p.nome}</h4>
            <p>${p.descricao}</p>
            <strong>R$ ${p.preco}</strong>
            <small>📅 ${p.data}</small>
            <div class="historico-actions">
                <button class="btn-open-pdf" onclick="abrirPdf(${p.id})">📄 PDF</button>
                <button class="btn-primary" onclick="mostrarConteudoDigital(${p.id})">📚 Conteúdo</button>
                <button class="btn-anunciar" onclick="anunciarProduto(${p.id})">📢 Anunciar</button>
                <button class="btn-remove" onclick="removerProduto(${p.id})">🗑️ Remover</button>
            </div>
        </div>
    `).join('');
}

function removerProduto(id) {
    let historico = JSON.parse(localStorage.getItem('historico')) || [];
    historico = historico.filter(p => p.id !== id);
    localStorage.setItem('historico', JSON.stringify(historico));
    atualizarHistorico();
    mostrarNotificacao('✅ Infoproduto removido');
}

function limparHistorico() {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('historico');
        atualizarHistorico();
        mostrarNotificacao('✅ Histórico limpo');
    }
}

function salvarConta(plataforma) {
    const contas = JSON.parse(localStorage.getItem('contas')) || { hotmart: {}, kiwify: {}, monetizze: {}, eduzz: {} };
    const apiKeyInput = document.getElementById(`${plataforma}ApiKey`);
    const apiKey = apiKeyInput?.value.trim();

    if (!apiKey) {
        mostrarNotificacao(`⚠️ Preencha a API Key da ${plataforma.charAt(0).toUpperCase() + plataforma.slice(1)}`, true);
        return;
    }

    contas[plataforma] = { conectado: true, apiKey };
    localStorage.setItem('contas', JSON.stringify(contas));
    carregarContas();
    atualizarContasStatus();
    mostrarNotificacao(`✅ API Key da ${plataforma.charAt(0).toUpperCase() + plataforma.slice(1)} salva`);
}

function carregarContas() {
    const contas = JSON.parse(localStorage.getItem('contas')) || { hotmart: {}, kiwify: {}, monetizze: {}, eduzz: {} };

    if (contas.hotmart) {
        document.getElementById('hotmartApiKey').value = contas.hotmart.apiKey || '';
    }
    if (contas.kiwify) {
        document.getElementById('kiwifyApiKey').value = contas.kiwify.apiKey || '';
    }
    if (contas.monetizze) {
        document.getElementById('monetizzeApiKey').value = contas.monetizze.apiKey || '';
    }
    if (contas.eduzz) {
        document.getElementById('eduzzApiKey').value = contas.eduzz.apiKey || '';
    }
}

function salvarConfiguracaoKiwify() {
    const contas = JSON.parse(localStorage.getItem('contas')) || { hotmart: {}, kiwify: {}, kiwifyConfig: {} };
    const tipoPagamento = document.getElementById('tipoPagamentoConfig').value;
    const entregaConteudo = document.getElementById('entregaConteudoConfig').value;
    const areaMembros = document.getElementById('areaMembrosConfig').value;
    const nomeAreaMembros = document.getElementById('nomeAreaMembrosConfig').value.trim();

    contas.kiwifyConfig = { tipoPagamento, entregaConteudo, areaMembros, nomeAreaMembros };
    localStorage.setItem('contas', JSON.stringify(contas));
    mostrarNotificacao('✅ Configurações Kiwify salvas');
    atualizarContasStatus();
}

function atualizarContasStatus() {
    const contas = JSON.parse(localStorage.getItem('contas')) || { hotmart: {}, kiwify: {}, monetizze: {}, eduzz: {}, kiwifyConfig: {} };
    const postagens = JSON.parse(localStorage.getItem('postagens')) || [];
    const status = document.getElementById('contasStatus');

    let html = '<h3>Status das Contas</h3>';

    if (contas.hotmart && contas.hotmart.conectado) {
        html += `<div class="conta-ativa">✅ Hotmart conectado • ${maskApiKey(contas.hotmart.apiKey)}</div>`;
    } else {
        html += '<div class="conta-inativa">⚠️ Hotmart não conectado</div>';
    }

    if (contas.kiwify && contas.kiwify.conectado) {
        html += `<div class="conta-ativa">✅ Kiwify conectado • ${maskApiKey(contas.kiwify.apiKey)}</div>`;
    } else {
        html += '<div class="conta-inativa">⚠️ Kiwify não conectado</div>';
    }

    if (contas.monetizze && contas.monetizze.conectado) {
        html += `<div class="conta-ativa">✅ Monetizze conectado • ${maskApiKey(contas.monetizze.apiKey)}</div>`;
    } else {
        html += '<div class="conta-inativa">⚠️ Monetizze não conectado</div>';
    }

    if (contas.eduzz && contas.eduzz.conectado) {
        html += `<div class="conta-ativa">✅ Eduzz conectado • ${maskApiKey(contas.eduzz.apiKey)}</div>`;
    } else {
        html += '<div class="conta-inativa">⚠️ Eduzz não conectado</div>';
    }

    html += `<div class="conta-ativa">📊 Total de produtos criados automaticamente: ${postagens.length}</div>`;

    if (postagens.length > 0) {
        html += '<div class="conta-ativa" style="margin-top:15px;"><strong>Últimas criações:</strong></div>';
        const ultimas = postagens.slice(-3).reverse();
        ultimas.forEach(item => {
            html += `<div class="plataforma-card"><strong>${item.nome}</strong><small>${item.plataforma} • ${item.data}</small>`;
            if (item.configuracao) {
                html += `<small>${item.configuracao.tipoPagamento} • ${item.configuracao.entregaConteudo} • ${item.configuracao.areaMembros}`;
                if (item.configuracao.nomeAreaMembros) {
                    html += ` • ${item.configuracao.nomeAreaMembros}`;
                }
                html += `</small>`;
            }
            html += `</div>`;
        });
    }

    status.innerHTML = html;
}

function adicionarUsuario() {
    if (usuarioLogado !== ADM_EMAIL) {
        mostrarNotificacao('❌ Acesso negado', true);
        return;
    }

    const email = document.getElementById('novoEmailInput').value.trim();
    const senha = document.getElementById('novaSenhaInput').value.trim();
    const limite = document.getElementById('novoLimiteProdutos').value;

    if (!email || !senha) {
        mostrarNotificacao('⚠️ Preencha email e senha', true);
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.find(u => u.email === email)) {
        mostrarNotificacao('⚠️ Usuário já existe', true);
        return;
    }

    usuarios.push({ email, senha, limite });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    document.getElementById('novoEmailInput').value = '';
    document.getElementById('novaSenhaInput').value = '';
    document.getElementById('novoLimiteProdutos').value = '100';
    atualizarUsuariosAdm();
    mostrarNotificacao('✅ Usuário adicionado');
}

function trocarSenhaAtual() {
    const atual = document.getElementById('senhaAtualInput').value.trim();
    const novo = document.getElementById('novaSenhaUsuarioInput').value.trim();

    if (!atual || !novo) {
        mostrarNotificacao('⚠️ Preencha a senha atual e a nova senha', true);
        return;
    }

    if (usuarioLogado === ADM_EMAIL) {
        const admin = JSON.parse(localStorage.getItem('adminCreds')) || { email: ADM_EMAIL, senha: ADM_SENHA };
        if (atual !== admin.senha) {
            mostrarNotificacao('❌ Senha atual inválida', true);
            return;
        }
        admin.senha = novo;
        localStorage.setItem('adminCreds', JSON.stringify(admin));
        mostrarNotificacao('✅ Senha ADM alterada');
        document.getElementById('senhaAtualInput').value = '';
        document.getElementById('novaSenhaUsuarioInput').value = '';
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === usuarioLogado);

    if (!usuario || usuario.senha !== atual) {
        mostrarNotificacao('❌ Senha atual inválida', true);
        return;
    }

    usuario.senha = novo;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    mostrarNotificacao('✅ Senha alterada com sucesso');
    document.getElementById('senhaAtualInput').value = '';
    document.getElementById('novaSenhaUsuarioInput').value = '';
}

function trocarSenhaUsuario() {
    if (usuarioLogado !== ADM_EMAIL) {
        mostrarNotificacao('❌ Acesso negado', true);
        return;
    }

    const email = document.getElementById('emailTrocaSenhaAdm').value.trim();
    const novaSenha = document.getElementById('senhaTrocaAdm').value.trim();

    if (!email || !novaSenha) {
        mostrarNotificacao('⚠️ Preencha email e a nova senha', true);
        return;
    }

    if (email === ADM_EMAIL) {
        const admin = JSON.parse(localStorage.getItem('adminCreds')) || { email: ADM_EMAIL, senha: ADM_SENHA };
        admin.senha = novaSenha;
        localStorage.setItem('adminCreds', JSON.stringify(admin));
        mostrarNotificacao('✅ Senha ADM atualizada');
        document.getElementById('emailTrocaSenhaAdm').value = '';
        document.getElementById('senhaTrocaAdm').value = '';
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
        mostrarNotificacao('❌ Usuário não encontrado', true);
        return;
    }

    usuario.senha = novaSenha;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    atualizarUsuariosAdm();
    mostrarNotificacao('✅ Senha do usuário atualizada');
    document.getElementById('emailTrocaSenhaAdm').value = '';
    document.getElementById('senhaTrocaAdm').value = '';
}

function excluirUsuario(email) {
    if (usuarioLogado !== ADM_EMAIL) {
        mostrarNotificacao('❌ Acesso negado', true);
        return;
    }

    if (confirm(`Tem certeza que deseja excluir ${email}?`)) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios = usuarios.filter(u => u.email !== email);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        atualizarUsuariosAdm();
        mostrarNotificacao('✅ Usuário removido');
    }
}

function atualizarUsuariosAdm() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const lista = document.getElementById('usuariosListaAdm');

    if (usuarios.length === 0) {
        lista.innerHTML = '<p style="color:#808080;">Nenhum usuário adicionado</p>';
        return;
    }

    lista.innerHTML = usuarios.map(u => `
        <div class="usuario-item">
            <span>${u.email}</span>
            <button class="btn-excluir" onclick="excluirUsuario('${u.email}')">✕ Excluir</button>
        </div>
    `).join('');
}

function mostrarNotificacao(msg, erro = false) {
    const notif = document.getElementById('notification');
    notif.textContent = msg;
    notif.className = `notification show ${erro ? 'error' : ''}`;

    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}
