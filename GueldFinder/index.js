const http = require('http');
const { chromium } = require('playwright');
const cheerio = require('cheerio');
const { readFile, writeFile } = require('fs/promises');
const DeepSeekAdapter = require('./AI');

// ==========================================
// CONFIGURAÇÕES PRINCIPAIS E FILTROS
// ==========================================
const PORT = 3001;
const PRECO_MAXIMO = 10000;
const PRECO_MINIMO = 300; // Evita pegar acessórios baratos de R$50, R$100
const TOTAL_PAGINAS = 15; // <--- Aumente aqui as páginas à vontade!

const suffix = '?sf=1&f=p&o=';
const BASE_URL = 'https://www.olx.com.br/informatica/notebooks/notebook/estado-mg/belo-horizonte-e-regiao' + suffix;

// Palavras que se aparecerem no título, o anúncio é REJEITADO na hora
const PALAVRAS_BLOQUEADAS = [
    'defeito', 'sucata', 'peças', 'pecas', 'quebrado', 'não liga', 'nao liga',
    'carregador', 'bateria', 'carcaça', 'carcaca', 'tela note', 'teclado notebook',
    'core 2 duo', 'dual core', 'atom', 'antigo'
];

// Opcional: Palavras que DEVEM existir no título (deixe vazio [] se quiser aceitar qualquer um)
const PALAVRAS_PERMITIDAS = [];

// ==========================================

const anunciosVistos = new Map();

async function process() {
    console.log(`[${new Date().toLocaleTimeString()}] Inicializando o coletor...`);

    const anunciosSalvos = await readData('todos.json');
    const bucketJaClassificados = await readData('ai_class.json');
    const jaClassificados = [];
    if (anunciosSalvos && Array.isArray(anunciosSalvos)) {
        anunciosSalvos.forEach(an => {
            jaClassificados.push(an.id);
            anunciosVistos.set(String(an.id), an);
        });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        for (let i = 0; i < TOTAL_PAGINAS; i++) {
            const urlAlvo = `${BASE_URL}${i}`;
            await buscarOportunidades(page, urlAlvo, anunciosSalvos);
        }

        const todosOsAnuncios = Array.from(anunciosVistos.values()).filter(an => an.interessado);
        const apenasItensNovos = todosOsAnuncios.filter(an => !jaClassificados.includes(an.id));

        await writeData(todosOsAnuncios, 'todos.json');

        if (apenasItensNovos.length > 0) {
            console.log(`[${new Date().toLocaleTimeString()}] Enviando ${apenasItensNovos.length} novos itens filtrados para a IA.`);
            await writeData([
                ...await categorizarEAvaliar(apenasItensNovos),
                ...bucketJaClassificados
            ]);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Nenhuma novidade válida encontrada para a IA.`);
        }

    } catch (error) {
        console.error('Erro crítico no fluxo principal:', error);
    } finally {
        await browser.close();
        console.log(`[${new Date().toLocaleTimeString()}] Processo finalizado.`);
    }
}

async function listarIguais(idIgual) {
    const todos = await readData('todos.json');
    const item = todos.filter(({ id }) => id == idIgual);
    return todos.filter(({ marca }) => marca == item.marca);
}

async function categorizarEAvaliar(lista) {
    const dadosSimplificados = lista.map(item => ({
        id: item.id,
        titulo: item.titulo,
        descricaoDetalhada: item.descricaoDetalhada,
        preco: parseInt(item.precoLimpo2, 10) || item.precoLimpo // Garante que vai um número inteiro limpo
    }));

    const dadosCSV = converterParaCSV(dadosSimplificados);

    // Mudamos o prompt para focar em REGRAS RÍGIDAS de negócio
    const prompt = `
Você é um especialista em hardware de computadores e analista de mercado de notebooks usados no Brasil.

### REGRA CRÍTICA DE FILTRO:
- Você deve analisar a lista abaixo e selecionar APENAS os notebooks cujo preço seja ESTRITAMENTE MENOR OU IGUAL A R$ 2000.
- Se o preço listado for maior que 2000 (Ex: 2100, 2900, 3500), DESCARTE O ITEM IMEDIATAMENTE. Não inclua no retorno sob nenhuma hipótese.
- Retorne no máximo as 10 melhores oportunidades que respeitem o limite de preço acima.

### INSTRUÇÕES DE ANÁLISE:
1. **Inferência de Hardware**: Extraia da coluna "titulo" as especificações: Marca, Modelo, Geração do Processador, RAM e SSD (se houver).
2. **Definição de Categoria**:
   - **basico**: Processadores antigos (Intel até 8ª geração / AMD Ryzen série 3000 ou inferior), pouca RAM (4GB-8GB).
   - **intermediario**: Processadores modernos (Intel 10ª geração+ / AMD Ryzen série 4000+), bom desempenho diário, 8GB-16GB RAM.
3. **Cálculo da Oferta Ideal**: Estime um valor competitivo de contraproposta (geralmente entre 10% a 20% abaixo do preço anunciado).

### DADOS DOS ANÚNCIOS (CSV - Delimitador ';'):
${dadosCSV}

Retorne ESTRITAMENTE um array JSON com os itens selecionados (máximo 10). 
Não adicione nenhuma saudação, texto explicativo, markdown de bloco de código (\`\`\`json) ou caracteres adicionais. Apenas o JSON válido seguindo a estrutura abaixo:

[
  {
    "id": "String - ID do produto",
    "marca": "String - Ex: Samsung, Dell, Lenovo",
    "modelo": "String - Modelo identificado ou 'Não especificado'",
    "categoria": "String - estritamente um dos três valores: 'basico', 'intermediario' ou 'gamer'",
    "ofertaIdeal": "String ou Número - Valor minimo sugerido para barganha (Ex: '1500')",
    "justificativa": "String justificando o motivo de valer a pena até R$2000"
  }
]
`;

    const responseIA = await DeepSeekAdapter.generateResponse(prompt);
    const classificadosIA = JSON.parse(responseIA.content.trim());

    const resultadoFinal = classificadosIA.map(itemIA => {
        const itemOriginal = lista.find(orig => orig.id === itemIA.id);
        return {
            ...itemOriginal,
            ...itemIA,
        };
    });

    return resultadoFinal;
}

function converterParaCSV(listaOriginal) {
    // Cabeçalho alterado para deixar claro que o preço é numérico
    const cabecalho = "id;titulo;descricao;preco_num\n";

    const linhas = listaOriginal.map(item => {
        const id = item.id;
        const descricao = item.descricao;
        const titulo = item.titulo.replace(/;/g, ' '); // Evita quebras acidentais no CSV se o título tiver ';'
        const preco = item.preco; // Já vem tratado como número puro (Ex: 2900)

        return `${id};"${titulo}";"${descricao}";${preco}`;
    }).join("\n");

    return cabecalho + linhas;
}

async function buscarOportunidades(page, url) {
    console.log(`\n[${new Date().toLocaleTimeString()}] Varrendo: ${url}`);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);

        const html = await page.content();
        const $ = cheerio.load(html);
        const itens = $('section[class*="AdCard_wrapper"], div[class*="AdCard_media"]').parent().toArray();

        if (itens.length === 0) {
            console.log('⚠️ Nenhum anúncio encontrado nesta página.');
            return;
        }

        for (const element of itens) {
            const titulo = $(element).find('.olx-adcard__title').text().trim();
            let precoBruto = $(element).find('.olx-adcard__price').text().trim();

            const regexPreco = /R\$\s*\d{1,3}(\.\d{3})*(,\d{2})?/;
            const match = precoBruto.match(regexPreco);

            const precoLimpo2 = match ? match[0].replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.') : precoBruto;
            const titulo2 = $(element).find('h2').text().trim();
            let link = $(element).find('a').attr('href');
            const precoTexto = $(element).find('span:contains("R$")').first().text().trim();

            if (!titulo || !link || !precoTexto) continue;

            try {
                link = new URL(link, 'https://www.olx.com.br').href;
            } catch (error) {
                continue;
            }

            const precoLimpo = parseInt(precoTexto.replace(/[^\d]/g, ''), 10);
            const idAnuncio = link.split('-').pop();

            // --- APLICAÇÃO DOS NOVOS FILTROS TEXTUAIS E DE PREÇO MINIMO ---
            const tituloMinusculo = titulo.toLowerCase();

            if (precoLimpo < PRECO_MINIMO) continue;

            const contemBloqueada = PALAVRAS_BLOQUEADAS.some(palavra => tituloMinusculo.includes(palavra));
            if (contemBloqueada) continue;

            if (PALAVRAS_PERMITIDAS.length > 0) {
                const contemPermitida = PALAVRAS_PERMITIDAS.some(palavra => tituloMinusculo.includes(palavra));
                if (!contemPermitida) continue;
            }
            // -------------------------------------------------------------

            if (!anunciosVistos.has(idAnuncio)) {
                if (precoLimpo <= PRECO_MAXIMO || precoLimpo2 <= PRECO_MAXIMO) {
                    const detalhes = await buscarDetalhesDoAnuncio(page.context(), link);

                    if (detalhes.sucesso)
                        anunciosVistos.set(idAnuncio, {
                            id: idAnuncio,
                            dtVarredura: new Date().toISOString(),
                            titulo,
                            link,
                            precoBruto,
                            precoLimpo,
                            descricaoDetalhada: detalhes.descricao,
                            vendedor: detalhes.vendedor,
                            localizacao: detalhes.localizacao,
                            imagens: detalhes.imagens,
                            propriedades: detalhes.propriedades,
                            interessado: true
                        });

                    console.log('--------------------------------------------------');
                    console.log(`🔥 OPORTUNIDADE ENCONTRADA!`);
                    console.log(`💻 Produto: ${titulo}`);
                    console.log(`💰 Preço: R$ ${precoLimpo}`);
                    console.log(`🧾 Descrição extraída: ${detalhes.descricao ? detalhes.descricao.slice(0, 120) + (detalhes.descricao.length > 120 ? '...' : '') : 'não disponível'}`);
                    console.log('--------------------------------------------------');
                }
            }
        }

    } catch (error) {
        console.error(`Erro ao processar a URL: ${error.message}`);
    }
}

async function buscarDetalhesDoAnuncio(context, link) {
    const detailPage = await context.newPage();

    // Otimização: Bloquear recursos visuais para carregar muito mais rápido
    await detailPage.route('**/*.{png,jpg,jpeg,gif,webp,css,woff,woff2}', route => route.abort());

    try {
        // 'domcontentloaded' basta, pois os dados estruturados já vêm no HTML inicial
        await detailPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 45000 });

        const html = await detailPage.content();
        const $ = cheerio.load(html);

        // 🎯 A mágica acontece aqui: pegamos o JSON interno da OLX
        const jsonString = $('#initial-data').attr('data-json');

        if (!jsonString) {
            throw new Error('Não foi possível encontrar o bloco de dados nativo do anúncio.');
        }

        const dataNativa = JSON.parse(jsonString);
        const adData = dataNativa.ad || {};

        // Mapeamento completo e limpo de tudo o que é útil
        return {
            sucesso: true,
            id: adData.adId || null,
            titulo: adData.subject || '',
            descricao: adData.body || '',
            preco: adData.priceValue || null,
            categoria: adData.categoryName || '',
            dataPublicacao: adData.listTime || null,

            // Dados de Localização
            localizacao: {
                estado: adData.location?.uf || null,
                municipio: adData.location?.municipality || null,
                bairro: adData.location?.neighbourhood || null,
                cep: adData.location?.zipcode || null,
                regiao: adData.location?.region || null
            },

            // Dados do Vendedor
            vendedor: {
                nome: adData.user?.name || null,
                contaProfissional: adData.professionalAd || false,
                chatAtivo: adData.chatEnabled || false
            },

            // Características específicas (Ex: Marca, Memória, Condição, etc.)
            propriedades: adData.properties || [],

            // Lista de URLs das imagens em tamanho original
            imagens: adData.images?.map(img => img.original) || [],

            link: link
        };

    } catch (error) {
        console.warn(`⚠️ Erro ao extrair dados do anúncio ${link}: ${error.message}`);
        return {
            sucesso: false,
            erro: error.message,
            link: link
        };
    } finally {
        await detailPage.close();
    }
}

let nameFile = getName();

async function writeData(content, nameOfFile) {
    let nomeASerUsado = nameOfFile ? nameOfFile : nameFile;
    try {
        await writeFile(nomeASerUsado, JSON.stringify(content, null, 2), 'utf8');
        console.log(`📦 Dados salvos em '${nomeASerUsado}'.`);
        return true;
    } catch (err) {
        console.error('Erro ao escrever arquivo:', err);
        return false;
    }
}

async function readData(nameOfFile) {
    try {
        let nomeASerUsado = nameOfFile ? nameOfFile : nameFile;
        const data = await readFile(nomeASerUsado, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        return [];
    }
}

function start() {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

function getName() {
    return 'ia_class.json';
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/download' || req.url === '/data') {
        try {
            const data = await readFile(nameFile, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Arquivo não encontrado.' }));
        }
    } else if (req.url === '/todos' || req.url === '/todos.json') {
        try {
            const data = await readFile('todos.json', 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'todos.json não encontrado.' }));
        }
    } else if (req.url === '/update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const parsedContent = JSON.parse(body);
                await writeData(parsedContent);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'OK' }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'corrupt body' }));
            }
        });
    } else if (req.url === '/trigger' && req.method === 'POST') {
        try {
            await process();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Sucesso' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro interno' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

//process();
start();