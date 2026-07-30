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
