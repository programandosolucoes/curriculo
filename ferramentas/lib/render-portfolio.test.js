const { test } = require('node:test');
const assert = require('node:assert');
const { renderIndice, renderProjeto, escapar } = require('./render-portfolio');

const config = {
  gitBase: 'https://git.exemplo.com/git/repos',
  prefixoSlug: 'portfolio-',
  basePagina: '/index.php/',
  baseImagens: 'https://exemplo.com/wp-content/uploads/portfolio',
  indices: [{ area: 'frontend', slug: 'portfolio-frontend', titulo: 'Portfólio — Frontend', chamada: 'Interfaces.' }],
  avisoRepo: 'Código-fonte privado.',
  avisoSemRepo: 'Código-fonte não disponível.',
};

const pessoal = { nome: 'Carlos Alberto', email: 'carlos@exemplo.com', telefone: '+55 11 2615-2880', links: ['linkedin.com/in/x'] };

const projeto = {
  id: 'painel-git',
  nome: 'Plataforma Própria de Hospedagem Git',
  periodo: '08/2025 - atual',
  areas: ['backend', 'frontend'],
  resumo: 'Alternativa self-hosted a GitHub.',
  problema: 'Repositório privado custa caro.',
  arquitetura: 'Smart HTTP em PHP.',
  resultado: '32 repositórios em produção.',
  stack: ['PHP 8.2', 'WebDAV'],
  duracao: '9-11 meses',
  repo: 'painel-git.git',
  imagens: [{ arquivo: 'painel-git-01-repos.png', legenda: 'Lista de repositórios' }],
};

test('o índice lista o projeto e aponta para o slug real da página', () => {
  const html = renderIndice([projeto], 'frontend', config);
  assert.match(html, /Plataforma Própria de Hospedagem Git/);
  // tem que casar com o post_name E com a estrutura de permalinks do site
  assert.match(html, /href="\/index\.php\/portfolio-painel-git\//);
  assert.match(html, /Alternativa self-hosted a GitHub\./);
});

test('a imagem aponta para a pasta fixa de uploads, não para caminho local', () => {
  const html = renderIndice([projeto], 'frontend', config);
  assert.match(html, /https:\/\/exemplo\.com\/wp-content\/uploads\/portfolio\/painel-git-01-repos\.png/);
});

test('o índice usa a chamada da área', () => {
  assert.match(renderIndice([projeto], 'frontend', config), /Interfaces\./);
});

test('o índice não vaza HTML sem escape', () => {
  const perigoso = { ...projeto, nome: '<script>alert(1)</script>' };
  const html = renderIndice([perigoso], 'frontend', config);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
});

test('a página mostra problema, arquitetura, resultado e stack', () => {
  const html = renderProjeto(projeto, pessoal, config);
  assert.match(html, /Repositório privado custa caro\./);
  assert.match(html, /Smart HTTP em PHP\./);
  assert.match(html, /32 repositórios em produção\./);
  assert.match(html, /PHP 8\.2/);
  assert.match(html, /WebDAV/);
});

test('a página monta o comando de clone com a URL do painel', () => {
  const html = renderProjeto(projeto, pessoal, config);
  assert.match(html, /git clone https:\/\/git\.exemplo\.com\/git\/repos\/painel-git\.git/);
  assert.match(html, /Código-fonte privado\./);
});

test('projeto sem repo não mostra comando de clone', () => {
  const html = renderProjeto({ ...projeto, repo: null }, pessoal, config);
  assert.doesNotMatch(html, /git clone/);
  assert.match(html, /Código-fonte não disponível\./);
});

test('a página inclui a imagem com legenda', () => {
  const html = renderProjeto(projeto, pessoal, config);
  assert.match(html, /painel-git-01-repos\.png/);
  assert.match(html, /Lista de repositórios/);
});

test('a página mostra o patch quando existe', () => {
  const comPatch = {
    ...projeto,
    repo: null,
    patch: { commit: '550f8750', titulo: 'Fix false conflict', upstream: 'https://github.com/pfrest/pfSense-pkg-RESTAPI', arquivos: 4, linhas: 94 },
  };
  const html = renderProjeto(comPatch, pessoal, config);
  assert.match(html, /550f8750/);
  assert.match(html, /github\.com\/pfrest/);
  assert.match(html, /94/);
});

test('escapar cobre os cinco caracteres perigosos', () => {
  assert.strictEqual(escapar(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');
});
