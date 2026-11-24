const { test } = require('node:test');
const assert = require('node:assert');
const { renderHtml } = require('./render-html');

const CV = {
  perfil: 'dev', titulo: 'Desenvolvedor Backend Sênior',
  pessoal: { nome: 'Fulano de Tal', local: 'São Paulo, SP, Brasil',
             telefone: '+55 11 0000-0000', email: 'f@exemplo.com',
             links: ['linkedin.com/in/fulano'] },
  secoes: [
    { tipo: 'resumo', titulo: 'RESUMO PROFISSIONAL', texto: 'Sou uma pessoa <especial> & tal.' },
    { tipo: 'competencias', titulo: 'COMPETÊNCIAS',
      grupos: [{ titulo: 'Backend', itens: ['Node.js', 'Python'] }] },
    { tipo: 'experiencia', titulo: 'EXPERIÊNCIA PROFISSIONAL',
      itens: [{ empresa: 'Empresa Um', cargo: 'Dev Sênior', periodo: '01/2020 - 12/2022',
                local: 'São Paulo', bullets: ['Construí APIs.'] }] },
  ],
};

test('não usa layout de múltiplas colunas', () => {
  const html = renderHtml(CV);
  for (const proibido of ['display:grid', 'display: grid', 'columns:', 'columns :', 'column-count']) {
    assert.ok(!html.includes(proibido), `HTML usa "${proibido}", que quebra parser de ATS`);
  }
});

test('não usa posicionamento que embaralha a ordem de leitura', () => {
  const html = renderHtml(CV);
  for (const proibido of ['position:absolute', 'position: absolute', 'position:fixed', 'float:']) {
    assert.ok(!html.includes(proibido), `HTML usa "${proibido}"`);
  }
});

test('não usa tabela, imagem ou svg', () => {
  const html = renderHtml(CV);
  for (const tag of ['<table', '<img', '<svg']) {
    assert.ok(!html.includes(tag), `HTML contém ${tag}`);
  }
});

test('não injeta texto por CSS', () => {
  assert.ok(!/content\s*:/.test(renderHtml(CV)), 'HTML usa content: em pseudo-elemento');
});

test('escapa caractere especial em vez de quebrar o documento', () => {
  const html = renderHtml(CV);
  assert.ok(html.includes('&lt;especial&gt;'), 'não escapou < >');
  assert.ok(html.includes('&amp;'), 'não escapou &');
});

test('usa cabeçalho de seção como texto real', () => {
  const html = renderHtml(CV);
  assert.match(html, /<h2[^>]*>RESUMO PROFISSIONAL<\/h2>/);
  assert.match(html, /<h2[^>]*>EXPERIÊNCIA PROFISSIONAL<\/h2>/);
});

test('declara o idioma do documento', () => {
  assert.match(renderHtml(CV), /<html lang="pt-BR">/);
});

test('o título da aba identifica o perfil', () => {
  assert.match(renderHtml(CV), /<title>.*Fulano de Tal.*Desenvolvedor Backend Sênior.*<\/title>/);
});

test('oferece botão de exportar para PDF e para Word', () => {
  const html = renderHtml(CV);
  assert.match(html, /id="btn-pdf"/, 'falta o botão de PDF');
  assert.match(html, /id="btn-doc"/, 'falta o botão de Word');
  assert.match(html, /doc\.save\(/, 'o botão de PDF não gera e baixa o arquivo');
  assert.match(html, /\.docx/, 'o botão de Word não gera arquivo .docx');
});

test('o Word (.docx) sai do docx como documento OpenXML nativo', () => {
  const html = renderHtml(CV);
  assert.match(html, /comDocx/, 'falta a chamada da biblioteca docx');
  const local = html.match(/<script src="([^"]*docx[^"]*)"/);
  assert.ok(local, 'falta o carregamento do docx');
  const noDisco = require('node:path').join(__dirname, '..', '..', 'cv', 'perfil', local[1]);
  assert.ok(require('node:fs').existsSync(noDisco), `cópia local do docx ausente: ${noDisco}`);
});

test('o PDF sai do jsPDF como texto, sem depender da impressão do navegador', () => {
  // A impressão do Firefox punha o caminho file:// no topo e quebrava o e-mail
  // na extração (ligadura da fonte). Biblioteca que fotografa a página
  // (html2canvas) geraria imagem, que o ATS não lê.
  const html = renderHtml(CV);
  assert.ok(!/window\.print\(\)/.test(html), 'o botão de PDF voltou a usar a impressão nativa');
  assert.ok(!/html2canvas|html2pdf/.test(html), 'PDF gerado como imagem não é lido pelo ATS');
  const local = html.match(/<script src="([^"]*jspdf[^"]*)"/);
  assert.ok(local, 'falta o carregamento do jsPDF');
  // O HTML gerado mora em cv/<perfil>/, e o caminho é relativo a ele.
  const noDisco = require('node:path').join(__dirname, '..', '..', 'cv', 'perfil', local[1]);
  assert.ok(require('node:fs').existsSync(noDisco), `cópia local do jsPDF ausente: ${noDisco}`);
});

test('a barra de botões some na impressão e não entra no PDF', () => {
  const html = renderHtml(CV);
  // Sem isso, os botões apareceriam impressos no currículo entregue.
  assert.match(html, /@media print[\s\S]*\.barra\s*\{\s*display:\s*none/,
    'a barra de botões não é escondida na impressão');
});

test('o conteúdo do currículo fica isolado num container próprio', () => {
  // A exportação para Word serializa só este container; sem ele, os botões
  // iriam junto para dentro do documento.
  const html = renderHtml(CV);
  assert.match(html, /id="curriculo"/, 'falta o container do currículo');
  const posBarra = html.indexOf('class="barra"');
  const posCurriculo = html.indexOf('id="curriculo"');
  assert.ok(posBarra < posCurriculo, 'a barra deveria vir antes do currículo');
});

test('o nome do arquivo exportado identifica pessoa e perfil', () => {
  assert.match(renderHtml(CV), /CV-Fulano-de-Tal-dev/);
});

test('declara o idioma do documento', () => {
  assert.match(renderHtml(CV), /<html lang="pt-BR">/);
  assert.match(renderHtml({ ...CV, idioma: 'en' }), /<html lang="en">/);
  assert.match(renderHtml({ ...CV, idioma: 'it' }), /<html lang="it">/);
});

test('o PDF não parte um período entre duas linhas', () => {
  const { protegerPeriodos } = require('./render-html');
  const { PALAVRA_ATUAL } = require('./secoes');
  const NBSP = ' ';
  assert.equal(protegerPeriodos('Curso | Escola | 2016 - 2020'), `Curso | Escola | 2016${NBSP}-${NBSP}2020`);
  assert.equal(protegerPeriodos('Dev | X | 01/2020 - 12/2022 | SP'), `Dev | X | 01/2020${NBSP}-${NBSP}12/2022 | SP`);
  for (const palavra of Object.values(PALAVRA_ATUAL)) {
    assert.equal(protegerPeriodos(`2025 - ${palavra}`), `2025${NBSP}-${NBSP}${palavra}`,
      `"${palavra}" não é protegida: atualize protegerPeriodos junto com PALAVRA_ATUAL`);
  }
  // Hífen que não é de período fica como está.
  assert.equal(protegerPeriodos('ESAB - Escola Superior'), 'ESAB - Escola Superior');
});

test('o script embutido usa a proteção de período', () => {
  const html = renderHtml(CV);
  assert.match(html, /var protegerPeriodos = function protegerPeriodos/);
  assert.match(html, /splitTextToSize\(protegerPeriodos\(texto\)/);
});
