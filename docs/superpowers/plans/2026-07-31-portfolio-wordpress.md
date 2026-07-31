# Portfólio no WordPress — plano de implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> superpowers:subagent-driven-development (recomendado) ou
> superpowers:executing-plans para implementar tarefa a tarefa. Os passos usam
> caixas (`- [ ]`) para acompanhamento.

**Objetivo:** publicar em
`https://carloslopes.programandosolucoes.com.br/` um portfólio dos 12
projetos técnicos do usuário, com descrição, stack, imagens e link HTTP para
o repositório privado que o painel Git nega a quem não tem credencial.

**Arquitetura:** `cv/mestre.json` continua fonte única de fatos e ganha
campos exclusivos do portfólio. `ferramentas/gerar-portfolio.js` lê o mestre
e escreve fragmentos HTML em `portfolio/build/`.
`ferramentas/publicar-wp.sh` envia esses fragmentos e as imagens para o
WordPress por WP-CLI sobre SSH, de forma idempotente.

**Stack:** Node.js ≥18 (CommonJS, sem dependências), `node --test`, WP-CLI,
SSH, Playwright (só na captura de imagens, fora do caminho de geração).

**Spec:** `docs/superpowers/specs/2026-07-31-portfolio-wordpress-design.md`

## Restrições globais

- **Sem `npm install`.** Gerar e publicar rodam com `node` puro após um clone
  limpo. Só a captura de imagens pode depender do Playwright, e ela é passo
  manual e ocasional.
- **CommonJS** (`require`/`module.exports`), como todo o resto de
  `ferramentas/`.
- **Comentários, mensagens e conteúdo em português do Brasil.**
- **Commit direto na branch `main`**, sem branch de feature (regra deste
  repositório, ver `docs/DIARIO.md`).
- **Sem `Co-Authored-By` nem menção a ferramenta de IA** nas mensagens de
  commit.
- **Nada de escrita em produção sem OK explícito do usuário no momento.** Vale
  para o WordPress e para o painel Git.
- **Playwright sempre headless**, e fechar o browser ao terminar.
- Todo comando executado em servidor remoto é registrado em `docs/DIARIO.md`.
- Arquivos gerados em `portfolio/build/` **nunca são editados à mão**.
- Todo projeto precisa de pelo menos uma das áreas `frontend` ou `backend`;
  `infra` e `ia` são rótulos adicionais.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `cv/mestre.json` | *(modificar)* fonte única; `projetos` vai de 7 para 12 e ganha campos de portfólio |
| `portfolio/config.json` | *(criar)* textos fixos, URL base do painel Git, ordem dos índices |
| `ferramentas/lib/portfolio.js` | *(criar)* validação do schema e seleção de projetos por área |
| `ferramentas/lib/portfolio.test.js` | *(criar)* testes do acima |
| `ferramentas/lib/render-portfolio.js` | *(criar)* HTML dos índices e das páginas de projeto |
| `ferramentas/lib/render-portfolio.test.js` | *(criar)* testes do acima |
| `ferramentas/gerar-portfolio.js` | *(criar)* CLI que escreve `portfolio/build/` |
| `ferramentas/capturar-prints.js` | *(criar)* captura com Playwright, uso manual |
| `ferramentas/publicar-wp.sh` | *(criar)* backup, mídia, páginas, menu, cache |
| `portfolio/img/` | *(criar)* imagens versionadas |
| `portfolio/build/` | *(gerado)* 14 fragmentos HTML |
| `package.json` | *(modificar)* scripts `portfolio` e `publicar` |

---

### Task 1: Schema do portfólio e seleção por área

**Arquivos:**
- Criar: `ferramentas/lib/portfolio.js`
- Criar: `ferramentas/lib/portfolio.test.js`

**Interfaces:**
- Consome: nada de tarefas anteriores.
- Produz:
  - `validarProjetos(projetos)` → lança `Error` com mensagem em pt-BR na
    primeira violação; retorna `projetos` intacto quando tudo passa.
  - `projetosDaArea(projetos, area)` → array filtrado, ordem preservada.
  - `AREAS_PRINCIPAIS` → `['frontend', 'backend']`.
  - `AREAS_VALIDAS` → `['frontend', 'backend', 'infra', 'ia']`.

- [ ] **Passo 1: escrever o teste que falha**

```js
// ferramentas/lib/portfolio.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { validarProjetos, projetosDaArea, AREAS_PRINCIPAIS } = require('./portfolio');

function projetoValido(extra = {}) {
  return {
    id: 'painel-git',
    nome: 'Plataforma Própria de Hospedagem Git',
    periodo: '08/2025 - atual',
    areas: ['backend', 'frontend'],
    resumo: 'Alternativa self-hosted a GitHub, em PHP puro.',
    problema: 'Repositórios privados custavam caro.',
    arquitetura: 'Smart HTTP e WebDAV implementados do zero.',
    resultado: '32 repositórios em produção.',
    stack: ['PHP 8.2', 'WebDAV'],
    duracao: '9-11 meses',
    repo: 'painel-git.git',
    imagens: [{ arquivo: 'painel-git-01-repos.png', legenda: 'Lista de repositórios' }],
    ...extra,
  };
}

test('aceita um projeto completo', () => {
  const projetos = [projetoValido()];
  assert.strictEqual(validarProjetos(projetos), projetos);
});

test('aceita repo nulo (projeto sem repositório publicável)', () => {
  assert.doesNotThrow(() => validarProjetos([projetoValido({ repo: null })]));
});

test('recusa projeto sem area principal', () => {
  assert.throws(
    () => validarProjetos([projetoValido({ areas: ['infra'] })]),
    /painel-git.*frontend.*backend/s,
  );
});

test('recusa area desconhecida', () => {
  assert.throws(
    () => validarProjetos([projetoValido({ areas: ['backend', 'blockchain'] })]),
    /blockchain/,
  );
});

test('recusa campo obrigatorio ausente', () => {
  const semResumo = projetoValido();
  delete semResumo.resumo;
  assert.throws(() => validarProjetos([semResumo]), /resumo/);
});

test('recusa projeto sem imagem', () => {
  assert.throws(() => validarProjetos([projetoValido({ imagens: [] })]), /imagem/);
});

test('recusa id repetido', () => {
  assert.throws(
    () => validarProjetos([projetoValido(), projetoValido()]),
    /repetido/,
  );
});

test('filtra por area preservando a ordem', () => {
  const a = projetoValido({ id: 'a', areas: ['backend'] });
  const b = projetoValido({ id: 'b', areas: ['frontend', 'backend'] });
  const c = projetoValido({ id: 'c', areas: ['frontend'] });
  assert.deepStrictEqual(projetosDaArea([a, b, c], 'backend').map(p => p.id), ['a', 'b']);
  assert.deepStrictEqual(projetosDaArea([a, b, c], 'frontend').map(p => p.id), ['b', 'c']);
});

test('as areas principais sao exatamente frontend e backend', () => {
  assert.deepStrictEqual(AREAS_PRINCIPAIS, ['frontend', 'backend']);
});
```

- [ ] **Passo 2: rodar o teste e confirmar que falha**

Rodar: `node --test ferramentas/lib/portfolio.test.js`
Esperado: FALHA com `Cannot find module './portfolio'`.

- [ ] **Passo 3: implementar o mínimo**

```js
// ferramentas/lib/portfolio.js
/**
 * portfolio.js — regras do portfólio publicado no WordPress.
 *
 * Valida os campos que só o portfólio usa (os CVs ignoram) e separa os
 * projetos por área. Os fatos continuam vindo de `cv/mestre.json`.
 */

const AREAS_PRINCIPAIS = ['frontend', 'backend'];
const AREAS_VALIDAS = [...AREAS_PRINCIPAIS, 'infra', 'ia'];

// `repo` fica de fora: null é legítimo (EvoluAI é código do cliente, pfSense
// é fork público). A ausência da chave, porém, é esquecimento.
const CAMPOS_TEXTO = ['id', 'nome', 'periodo', 'resumo', 'problema', 'arquitetura', 'resultado', 'duracao'];

function validarProjetos(projetos) {
  if (!Array.isArray(projetos) || projetos.length === 0) {
    throw new Error('A lista de projetos está vazia.');
  }

  const vistos = new Set();

  for (const projeto of projetos) {
    const id = projeto.id || '(sem id)';

    for (const campo of CAMPOS_TEXTO) {
      if (typeof projeto[campo] !== 'string' || projeto[campo].trim() === '') {
        throw new Error(`Projeto "${id}": campo "${campo}" ausente ou vazio.`);
      }
    }

    if (vistos.has(projeto.id)) {
      throw new Error(`Projeto "${id}": id repetido.`);
    }
    vistos.add(projeto.id);

    if (!('repo' in projeto)) {
      throw new Error(`Projeto "${id}": falta a chave "repo" (use null quando não houver repositório publicável).`);
    }

    if (!Array.isArray(projeto.areas) || projeto.areas.length === 0) {
      throw new Error(`Projeto "${id}": "areas" precisa ser uma lista não vazia.`);
    }
    for (const area of projeto.areas) {
      if (!AREAS_VALIDAS.includes(area)) {
        throw new Error(`Projeto "${id}": área desconhecida "${area}". Válidas: ${AREAS_VALIDAS.join(', ')}.`);
      }
    }
    if (!projeto.areas.some(a => AREAS_PRINCIPAIS.includes(a))) {
      throw new Error(`Projeto "${id}": precisa de pelo menos uma área principal (frontend ou backend), senão não aparece em índice nenhum.`);
    }

    if (!Array.isArray(projeto.stack) || projeto.stack.length === 0) {
      throw new Error(`Projeto "${id}": "stack" precisa ter pelo menos um item.`);
    }

    if (!Array.isArray(projeto.imagens) || projeto.imagens.length === 0) {
      throw new Error(`Projeto "${id}": precisa de pelo menos uma imagem.`);
    }
    for (const imagem of projeto.imagens) {
      if (!imagem || typeof imagem.arquivo !== 'string' || typeof imagem.legenda !== 'string') {
        throw new Error(`Projeto "${id}": cada imagem precisa de "arquivo" e "legenda".`);
      }
    }
  }

  return projetos;
}

function projetosDaArea(projetos, area) {
  return projetos.filter(p => Array.isArray(p.areas) && p.areas.includes(area));
}

module.exports = { validarProjetos, projetosDaArea, AREAS_PRINCIPAIS, AREAS_VALIDAS };
```

- [ ] **Passo 4: rodar os testes e confirmar que passam**

Rodar: `node --test ferramentas/lib/portfolio.test.js`
Esperado: `pass 8`, `fail 0`.

- [ ] **Passo 5: commitar**

```bash
git add ferramentas/lib/portfolio.js ferramentas/lib/portfolio.test.js
git commit -m "feat: validação e seleção por área dos projetos do portfólio"
```

---

### Task 2: Estender o mestre.json para os 12 projetos

**Arquivos:**
- Modificar: `cv/mestre.json` (chave `projetos`)
- Criar: `ferramentas/lib/mestre-portfolio.test.js`

**Interfaces:**
- Consome: `validarProjetos` da Task 1.
- Produz: `mestre.projetos` com 12 entradas válidas, na ordem da tabela da
  spec. Os `id` são consumidos pelas Tasks 3, 4, 5 e 6:
  `discador`, `omnichannel`, `pedagio`, `analise-audio`, `sipproxy`, `rpa`,
  `painel-git`, `evoluai`, `email-cleanup`, `asterisk-lab`,
  `vitalpbx-whatsapp`, `pfsense-api`.

**Fonte do conteúdo:** `docs/CV_ESTRATEGIA.md`, seções "Os 7 projetos
freelance consolidados" (linhas ~196-207), "Inventário técnico dos demais
projetos" (~365-600) e "Projetos secundários" (~601-620). **Não inventar
fatos**: número de commits, duração e stack saem de lá.

- [ ] **Passo 1: escrever o teste que falha**

```js
// ferramentas/lib/mestre-portfolio.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { validarProjetos, projetosDaArea } = require('./portfolio');

const mestre = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'cv', 'mestre.json'), 'utf8'),
);

test('o mestre tem os 12 projetos do portfólio', () => {
  assert.strictEqual(mestre.projetos.length, 12);
});

test('todos os projetos do mestre passam na validação', () => {
  assert.doesNotThrow(() => validarProjetos(mestre.projetos));
});

test('os dois índices têm projetos', () => {
  assert.ok(projetosDaArea(mestre.projetos, 'frontend').length > 0);
  assert.ok(projetosDaArea(mestre.projetos, 'backend').length > 0);
});

test('EvoluAI não expõe repositório (código do cliente)', () => {
  assert.strictEqual(mestre.projetos.find(p => p.id === 'evoluai').repo, null);
});

test('pfSense não expõe repositório privado (fork público de terceiros)', () => {
  assert.strictEqual(mestre.projetos.find(p => p.id === 'pfsense-api').repo, null);
});

test('os bullets dos 7 projetos originais continuam intactos', () => {
  for (const id of ['discador', 'omnichannel', 'pedagio', 'analise-audio', 'sipproxy', 'rpa', 'painel-git']) {
    const projeto = mestre.projetos.find(p => p.id === id);
    assert.ok(projeto, `projeto ${id} sumiu do mestre`);
    assert.ok(Array.isArray(projeto.bullets?.base) && projeto.bullets.base.length > 0,
      `projeto ${id} perdeu os bullets que os CVs consomem`);
  }
});
```

- [ ] **Passo 2: rodar e confirmar que falha**

Rodar: `node --test ferramentas/lib/mestre-portfolio.test.js`
Esperado: FALHA — hoje são 7 projetos e nenhum tem os campos novos.

- [ ] **Passo 3: acrescentar os campos aos 7 projetos existentes**

Para cada um dos 7, acrescentar `areas`, `resumo`, `problema`,
`arquitetura`, `resultado`, `stack`, `duracao`, `repo` e `imagens` **sem
tocar em `bullets`**. Exemplo completo, para `painel-git`:

```jsonc
{
  "id": "painel-git",
  "nome": "Plataforma Própria de Hospedagem Git",
  "contexto": "projeto próprio/freelance",
  "periodo": "08/2025 - atual",
  "bullets": { /* INTACTO — é o que os 9 CVs consomem */ },

  "areas": ["backend", "frontend", "infra"],
  "resumo": "Alternativa self-hosted a GitHub e GitLab, escrita em PHP puro, sem nenhuma dependência de runtime.",
  "problema": "Hospedar repositórios privados custa por usuário e por repositório, e um plano de hospedagem compartilhada não dá acesso root ao Apache para instalar GitLab ou Gitea.",
  "arquitetura": "O protocolo Git Smart HTTP (upload-pack e receive-pack) é implementado como proxy CGI em PHP, o que dispensa root e funciona em LiteSpeed. O servidor WebDAV (RFC 4918) foi escrito do zero, com mutex FIFO por caminho para as operações concorrentes. A autenticação aceita Basic e um desafio criptográfico assinado com chave SSH; o CI/CD dispara por webhook assinado em HMAC-SHA256, com validação anti-SSRF e credenciais cifradas em AES-256-GCM.",
  "resultado": "32 repositórios privados em produção, com clone por HTTP e por SSH, painel web de administração, gerenciador WebDAV e pipeline de deploy.",
  "stack": ["PHP 8.2", "Git Smart HTTP", "WebDAV RFC 4918", "AES-256-GCM", "HMAC-SHA256", "gitolite", "PHPUnit"],
  "duracao": "9-11 meses",
  "repo": "painel-git.git",
  "imagens": []
}
```

`imagens` fica `[]` neste passo e é preenchido nas Tasks 5, 6 e 7 — o teste
de validação só passa ao final da Task 7. Para não deixar a suíte vermelha
no meio do caminho, **este passo escreve `imagens` com o arquivo previsto**,
mesmo que o PNG ainda não exista:

```jsonc
"imagens": [{ "arquivo": "painel-git-01-repos.png", "legenda": "Lista de repositórios no painel de administração" }]
```

A Task 4 verifica que o arquivo existe em disco; até lá, o nome é um
contrato entre este passo e a captura.

- [ ] **Passo 4: acrescentar os 5 projetos novos**

Mesma estrutura, com `bullets: { "base": [...] }` para que possam entrar em
CVs futuros. Valores obrigatórios já decididos:

| `id` | `areas` | `repo` |
|---|---|---|
| `evoluai` | `["frontend", "backend", "ia"]` | `null` |
| `email-cleanup` | `["backend", "ia"]` | `"email_cleanup_bot.git"` |
| `asterisk-lab` | `["backend", "infra"]` | `"asterisk-media-server-lab.git"` |
| `vitalpbx-whatsapp` | `["backend", "infra"]` | `"vitalpbx-whatsapp-calling.git"` |
| `pfsense-api` | `["backend", "infra"]` | `null` |

Dois deles têm texto obrigatório, decidido na spec:

- `evoluai.resultado` termina com: *"O código-fonte é proprietário do
  cliente e por isso não está disponível."*
- `pfsense-api.resultado` termina com: *"A correção é pública: o projeto é
  open source sob Apache 2.0 e a contribuição está no fork."* — e este
  projeto ganha o campo extra `patch`, com o diff exibido na página:

```jsonc
"patch": {
  "commit": "550f8750",
  "titulo": "Fix false conflict when creating DHCP static mapping inside primary pool",
  "upstream": "https://github.com/pfrest/pfSense-pkg-RESTAPI",
  "arquivos": 4,
  "linhas": 94
}
```

- [ ] **Passo 5: rodar os testes**

Rodar: `node --test ferramentas/lib/`
Esperado: `pass` em tudo, inclusive nos testes antigos de CV — os campos
novos não podem quebrar `montar-cv`.

- [ ] **Passo 6: confirmar que os 9 CVs continuam gerando igual**

```bash
node ferramentas/gerar-cv.js && git diff --stat cv/
```
Esperado: **nenhuma alteração em `cv/<perfil>/`**. Se algum CV mudou, um
campo novo vazou para o renderizador do currículo — corrigir antes de seguir.

- [ ] **Passo 7: commitar**

```bash
git add cv/mestre.json ferramentas/lib/mestre-portfolio.test.js
git commit -m "feat: 12 projetos do portfólio no mestre.json

Os 7 existentes ganham campos exclusivos do portfólio, sem tocar nos
bullets que os 9 CVs consomem, e entram os 5 secundários."
```

---

### Task 3: Renderizador HTML

**Arquivos:**
- Criar: `portfolio/config.json`
- Criar: `ferramentas/lib/render-portfolio.js`
- Criar: `ferramentas/lib/render-portfolio.test.js`

**Interfaces:**
- Consome: `projetosDaArea` da Task 1; `mestre.projetos` e `mestre.pessoal`
  da Task 2.
- Produz:
  - `renderIndice(projetos, area, config)` → string HTML do índice.
  - `renderProjeto(projeto, pessoal, config)` → string HTML da página.
  - `escapar(texto)` → HTML-escape.

O HTML é **fragmento**, para um bloco `core/html` do Gutenberg: sem `<html>`,
`<head>` ou `<body>`. Todo CSS é embutido e prefixado com `.pf-`, porque o
tema Newsup já traz o seu.

- [ ] **Passo 1: criar o config**

```json
{
  "gitBase": "https://git.programandosolucoes.com.br/git/repos",
  "prefixoSlug": "portfolio-",
  "baseImagens": "https://carloslopes.programandosolucoes.com.br/wp-content/uploads/portfolio",
  "indices": [
    { "area": "frontend", "slug": "portfolio-frontend", "titulo": "Portfólio — Frontend",
      "chamada": "Interfaces que eu projetei e construí: painéis de operação, editores visuais e aplicações de tempo real." },
    { "area": "backend", "slug": "portfolio-backend", "titulo": "Portfólio — Backend",
      "chamada": "Sistemas que rodam por baixo: telefonia, processamento de sinais, integrações e infraestrutura." }
  ],
  "avisoRepo": "Código-fonte privado. As credenciais de leitura são liberadas sob solicitação — me chame para conversar sobre o projeto.",
  "avisoSemRepo": "Código-fonte não disponível."
}
```

- [ ] **Passo 2: escrever o teste que falha**

```js
// ferramentas/lib/render-portfolio.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { renderIndice, renderProjeto, escapar } = require('./render-portfolio');

const config = {
  gitBase: 'https://git.exemplo.com/git/repos',
  prefixoSlug: 'portfolio-',
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
  // tem que casar com o post_name que o publicador cria: portfolio-<id>
  assert.match(html, /href="\/portfolio-painel-git"/);
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
```

- [ ] **Passo 3: rodar e confirmar que falha**

Rodar: `node --test ferramentas/lib/render-portfolio.test.js`
Esperado: FALHA com `Cannot find module './render-portfolio'`.

- [ ] **Passo 4: implementar**

```js
// ferramentas/lib/render-portfolio.js
/**
 * render-portfolio.js — HTML do portfólio publicado no WordPress.
 *
 * A saída é FRAGMENTO, não documento: entra num bloco core/html do Gutenberg
 * e o tema Newsup fornece cabeçalho, rodapé e a moldura. Por isso todo CSS
 * daqui é prefixado com `.pf-`, para não disputar com o CSS do tema.
 */

const CSS = `
<style>
.pf-wrap{max-width:1100px;margin:0 auto;font-size:16px;line-height:1.65}
.pf-chamada{font-size:1.15rem;opacity:.85;margin:0 0 2rem}
.pf-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
.pf-card{border:1px solid rgba(128,128,128,.3);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;transition:transform .15s ease,box-shadow .15s ease}
.pf-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.12)}
.pf-card img{width:100%;height:180px;object-fit:cover;display:block;background:rgba(128,128,128,.12)}
.pf-card-corpo{padding:1rem 1.1rem 1.2rem;display:flex;flex-direction:column;gap:.6rem;flex:1}
.pf-card h3{margin:0;font-size:1.05rem;line-height:1.35}
.pf-card p{margin:0;font-size:.92rem;opacity:.85;flex:1}
.pf-chips{display:flex;flex-wrap:wrap;gap:.35rem}
.pf-chip{font-size:.75rem;padding:.18rem .55rem;border-radius:999px;border:1px solid rgba(128,128,128,.35);opacity:.9}
.pf-meta{font-size:.8rem;opacity:.7}
.pf-cadeado{font-size:.8rem;opacity:.75}
.pf-hero{margin:0 0 1.5rem}
.pf-hero h1{margin:0 0 .4rem;line-height:1.2}
.pf-secao{margin:2rem 0}
.pf-secao h2{font-size:1.15rem;margin:0 0 .6rem;text-transform:uppercase;letter-spacing:.06em;opacity:.75}
.pf-galeria{display:grid;gap:1.2rem;margin:2rem 0}
.pf-galeria figure{margin:0}
.pf-galeria img{width:100%;border:1px solid rgba(128,128,128,.3);border-radius:8px;display:block}
.pf-galeria figcaption{font-size:.85rem;opacity:.75;margin-top:.4rem}
.pf-repo{border:1px solid rgba(128,128,128,.35);border-left-width:4px;border-radius:8px;padding:1rem 1.2rem;margin:2rem 0}
.pf-repo h2{margin:0 0 .5rem;font-size:1rem;text-transform:uppercase;letter-spacing:.06em}
.pf-repo pre{background:rgba(128,128,128,.12);padding:.7rem .9rem;border-radius:6px;overflow-x:auto;margin:.6rem 0;font-size:.85rem}
.pf-contato{margin:2rem 0;padding-top:1.2rem;border-top:1px solid rgba(128,128,128,.3);font-size:.95rem}
.pf-voltar{display:inline-block;margin-bottom:1rem;font-size:.9rem}
@media (max-width:600px){.pf-card img{height:150px}}
</style>`.trim();

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function chips(itens) {
  return `<div class="pf-chips">${itens.map(i => `<span class="pf-chip">${escapar(i)}</span>`).join('')}</div>`;
}

// As imagens vão para uma pasta FIXA em wp-content/uploads/portfolio/, não
// para a biblioteca de mídia. Assim a URL é determinística e o HTML gerado já
// nasce correto — sem precisar mapear id de anexo para URL depois do upload.
function urlImagem(arquivo, config) {
  return config.baseImagens.replace(/\/+$/, '') + '/' + arquivo;
}

// O slug tem que ser o MESMO que o publicador usa como post_name, senão o
// card aponta para uma página que não existe.
function slugProjeto(id, config) {
  return '/' + config.prefixoSlug + id;
}

function renderIndice(projetos, area, config) {
  const indice = config.indices.find(i => i.area === area);
  const cards = projetos.map(p => {
    const capa = p.imagens[0];
    const url = escapar(slugProjeto(p.id, config));
    return `
    <article class="pf-card">
      <a href="${url}">
        <img src="${escapar(urlImagem(capa.arquivo, config))}" alt="${escapar(capa.legenda)}" loading="lazy">
      </a>
      <div class="pf-card-corpo">
        <h3><a href="${url}">${escapar(p.nome)}</a></h3>
        <p>${escapar(p.resumo)}</p>
        ${chips(p.stack.slice(0, 4))}
        <div class="pf-meta">${escapar(p.periodo)} · ${escapar(p.duracao)}</div>
        ${p.repo ? '<div class="pf-cadeado">🔒 repositório privado</div>' : ''}
      </div>
    </article>`;
  }).join('\n');

  return `${CSS}
<div class="pf-wrap">
  <p class="pf-chamada">${escapar(indice.chamada)}</p>
  <div class="pf-grade">
${cards}
  </div>
</div>`;
}

function renderProjeto(projeto, pessoal, config) {
  const galeria = projeto.imagens.map(img => `
    <figure>
      <img src="${escapar(urlImagem(img.arquivo, config))}" alt="${escapar(img.legenda)}" loading="lazy">
      <figcaption>${escapar(img.legenda)}</figcaption>
    </figure>`).join('\n');

  const blocoRepo = projeto.repo
    ? `<div class="pf-repo">
    <h2>🔒 Código-fonte</h2>
    <pre><code>git clone ${escapar(config.gitBase)}/${escapar(projeto.repo)}</code></pre>
    <p>${escapar(config.avisoRepo)}</p>
  </div>`
    : `<div class="pf-repo">
    <h2>Código-fonte</h2>
    <p>${escapar(config.avisoSemRepo)}</p>
  </div>`;

  const blocoPatch = projeto.patch
    ? `<div class="pf-repo">
    <h2>A contribuição</h2>
    <p><code>${escapar(projeto.patch.commit)}</code> — ${escapar(projeto.patch.titulo)}</p>
    <p>${escapar(String(projeto.patch.arquivos))} arquivos, ${escapar(String(projeto.patch.linhas))} linhas, com o teste do projeto ajustado junto.</p>
    <p>Projeto original: <a href="${escapar(projeto.patch.upstream)}" rel="noopener">${escapar(projeto.patch.upstream)}</a></p>
  </div>`
    : '';

  const voltar = projeto.areas.includes('frontend') ? 'portfolio-frontend' : 'portfolio-backend';

  return `${CSS}
<div class="pf-wrap">
  <a class="pf-voltar" href="/${escapar(voltar)}">← voltar ao portfólio</a>

  <header class="pf-hero">
    <p class="pf-meta">${escapar(projeto.periodo)} · ${escapar(projeto.duracao)}</p>
    <p>${escapar(projeto.resumo)}</p>
    ${chips(projeto.stack)}
  </header>

  <section class="pf-secao">
    <h2>O problema</h2>
    <p>${escapar(projeto.problema)}</p>
  </section>

  <section class="pf-secao">
    <h2>A arquitetura</h2>
    <p>${escapar(projeto.arquitetura)}</p>
  </section>

  <section class="pf-secao">
    <h2>O resultado</h2>
    <p>${escapar(projeto.resultado)}</p>
  </section>

  <div class="pf-galeria">
${galeria}
  </div>

  ${blocoRepo}
  ${blocoPatch}

  <div class="pf-contato">
    <strong>${escapar(pessoal.nome)}</strong> — ${escapar(pessoal.email)} · ${escapar(pessoal.telefone)}
  </div>
</div>`;
}

module.exports = { renderIndice, renderProjeto, escapar };
```

- [ ] **Passo 5: rodar os testes**

Rodar: `node --test ferramentas/lib/render-portfolio.test.js`
Esperado: `pass 9`, `fail 0`.

- [ ] **Passo 6: commitar**

```bash
git add portfolio/config.json ferramentas/lib/render-portfolio.js ferramentas/lib/render-portfolio.test.js
git commit -m "feat: renderizador HTML do portfólio"
```

---

### Task 4: CLI gerar-portfolio.js

**Arquivos:**
- Criar: `ferramentas/gerar-portfolio.js`
- Modificar: `package.json` (scripts)
- Criar: `.gitignore` — acrescentar nada; `portfolio/build/` é versionado,
  como `cv/<perfil>/` já é.

**Interfaces:**
- Consome: Tasks 1, 2 e 3.
- Produz: `portfolio/build/portfolio-frontend.html`,
  `portfolio/build/portfolio-backend.html` e
  `portfolio/build/portfolio-<id>.html` (12). Nomes de arquivo iguais aos
  slugs usados pela Task 8.

- [ ] **Passo 1: implementar**

```js
// ferramentas/gerar-portfolio.js
/**
 * gerar-portfolio.js — gera os fragmentos HTML do portfólio.
 *
 * Lê `cv/mestre.json` e `portfolio/config.json` e escreve
 * `portfolio/build/*.html`: dois índices (frontend e backend) e uma página
 * por projeto.
 *
 * NENHUM arquivo em `portfolio/build/` deve ser editado à mão: são derivados
 * e a próxima execução sobrescreve. Para mudar o conteúdo, mude o mestre.
 *
 * Uso: node ferramentas/gerar-portfolio.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { validarProjetos, projetosDaArea } = require('./lib/portfolio');
const { renderIndice, renderProjeto } = require('./lib/render-portfolio');

const RAIZ = path.join(__dirname, '..');
const DIR_PORTFOLIO = path.join(RAIZ, 'portfolio');
const DIR_BUILD = path.join(DIR_PORTFOLIO, 'build');
const DIR_IMG = path.join(DIR_PORTFOLIO, 'img');

function lerJson(caminho) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (err) {
    console.error(`[gerar-portfolio] Não consegui ler ${path.relative(RAIZ, caminho)}: ${err.message}`);
    process.exit(1);
  }
}

function main() {
  const mestre = lerJson(path.join(RAIZ, 'cv', 'mestre.json'));
  const config = lerJson(path.join(DIR_PORTFOLIO, 'config.json'));

  try {
    validarProjetos(mestre.projetos);
  } catch (err) {
    console.error(`[gerar-portfolio] ${err.message}`);
    process.exit(1);
  }

  // Uma imagem declarada e ausente vira card quebrado no ar. Falha aqui.
  const faltando = [];
  for (const projeto of mestre.projetos) {
    for (const img of projeto.imagens) {
      if (!fs.existsSync(path.join(DIR_IMG, img.arquivo))) {
        faltando.push(`${projeto.id}: ${img.arquivo}`);
      }
    }
  }
  if (faltando.length > 0) {
    console.error(`[gerar-portfolio] Imagens declaradas no mestre que não existem em portfolio/img/:\n  ${faltando.join('\n  ')}`);
    process.exit(1);
  }

  fs.mkdirSync(DIR_BUILD, { recursive: true });

  // O publicador precisa do título de cada página, e título não cabe no nome
  // do arquivo (acento, espaço, travessão). Sai daqui, num manifesto.
  const paginas = [];

  for (const indice of config.indices) {
    const projetos = projetosDaArea(mestre.projetos, indice.area);
    const destino = path.join(DIR_BUILD, `${indice.slug}.html`);
    fs.writeFileSync(destino, renderIndice(projetos, indice.area, config));
    paginas.push({ slug: indice.slug, titulo: indice.titulo, arquivo: `${indice.slug}.html` });
    console.log(`[gerar-portfolio] ${indice.slug.padEnd(20)} ${String(projetos.length).padStart(2)} projetos`);
  }

  for (const projeto of mestre.projetos) {
    const slug = `portfolio-${projeto.id}`;
    fs.writeFileSync(path.join(DIR_BUILD, `${slug}.html`), renderProjeto(projeto, mestre.pessoal, config));
    paginas.push({ slug, titulo: projeto.nome, arquivo: `${slug}.html` });
  }

  fs.writeFileSync(path.join(DIR_BUILD, 'paginas.json'), JSON.stringify(paginas, null, 2) + '\n');

  console.log(`\n[gerar-portfolio] ${paginas.length} página(s) em portfolio/build/ (+ paginas.json).`);
}

main();
```

- [ ] **Passo 2: acrescentar os scripts ao package.json**

```json
"portfolio": "node ferramentas/gerar-portfolio.js",
"publicar": "bash ferramentas/publicar-wp.sh"
```

- [ ] **Passo 3: rodar e confirmar a falha esperada**

Rodar: `node ferramentas/gerar-portfolio.js`
Esperado: FALHA listando as imagens ausentes — nenhuma foi capturada ainda.
Isso confirma que a checagem funciona.

- [ ] **Passo 4: commitar**

```bash
git add ferramentas/gerar-portfolio.js package.json
git commit -m "feat: CLI que gera os fragmentos HTML do portfólio"
```

---

### Task 5: Captura da faixa A — o que já está no ar

**Arquivos:**
- Criar: `ferramentas/capturar-prints.js`
- Criar: `portfolio/img/*.png`

**Interfaces:**
- Consome: os nomes de arquivo declarados em `mestre.projetos[].imagens`.
- Produz: PNGs em `portfolio/img/` com exatamente esses nomes.

**Alvos:**

| Projeto | URL | Observação |
|---|---|---|
| `painel-git` | `https://git.programandosolucoes.com.br/git/` | exige login do usuário |
| `analise-audio` | harness `post-linkedin-analisador` (tenant fictício, PBX mockado) | **usar este**, não o ambiente com dados reais |
| `discador` | painel no LXC 604, porta 5000 | via `ssh lxc604` |

- [ ] **Passo 1: escrever o capturador**

```js
// ferramentas/capturar-prints.js
/**
 * capturar-prints.js — captura as telas do portfólio com Playwright.
 *
 * Fora do contrato "roda sem npm install": este é o único arquivo do repo
 * que depende do Playwright, e é de uso manual e ocasional. As imagens ficam
 * versionadas em portfolio/img/, então gerar e publicar não precisam dele.
 *
 * Uso: node ferramentas/capturar-prints.js --alvo=painel-git
 */

const path = require('node:path');

const DIR_IMG = path.join(__dirname, '..', 'portfolio', 'img');
const VIEWPORT = { width: 1440, height: 900 };

// Cada alvo: para onde ir, o que esperar carregar e como nomear o arquivo.
// Os nomes de arquivo são contrato com `mestre.projetos[].imagens`.
const ALVOS = {
  'painel-git': {
    url: 'https://git.programandosolucoes.com.br/git/',
    telas: [
      { arquivo: 'painel-git-01-repos.png', esperar: 'text=Repositórios' },
      { arquivo: 'painel-git-02-webdav.png', esperar: 'text=WebDAV' },
    ],
  },
  'analise-audio': {
    url: 'http://localhost:8000',
    telas: [
      { arquivo: 'analise-audio-01-relatorio.png', esperar: 'text=Relatório' },
      { arquivo: 'analise-audio-02-espectro.png', esperar: 'canvas' },
    ],
  },
  discador: {
    url: 'http://localhost:5000',
    telas: [
      { arquivo: 'discador-01-painel.png', esperar: 'text=Campanhas' },
      { arquivo: 'discador-02-proxmox.png', esperar: 'text=Proxmox' },
    ],
  },
};

async function main() {
  const arg = process.argv.find(a => a.startsWith('--alvo='));
  const alvo = arg && ALVOS[arg.split('=')[1]];
  if (!alvo) {
    console.error(`[capturar-prints] Use --alvo=<${Object.keys(ALVOS).join('|')}>`);
    process.exit(1);
  }

  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto(alvo.url, { waitUntil: 'networkidle' });
    for (const tela of alvo.telas) {
      if (tela.esperar) await page.waitForSelector(tela.esperar, { timeout: 15000 });
      await page.screenshot({ path: path.join(DIR_IMG, tela.arquivo), fullPage: false });
      console.log(`[capturar-prints] ${tela.arquivo}`);
    }
  } finally {
    await browser.close(); // sempre fechar: janela aberta atrapalha o usuário
  }
}

main();
```

- [ ] **Passo 2: capturar o painel Git**

O painel exige login. Capturar com o Playwright MCP em modo headless, com o
usuário fazendo o login, ou reaproveitar sessão autenticada. **Não pedir
senha ao usuário nem gravá-la em arquivo.**

- [ ] **Passo 3: capturar o analisador de chamadas pelo harness de demonstração**

```bash
cd /home/carlos/ide/post-linkedin-analisador && docker compose up -d
```
Aguardar subir, capturar as telas, e ao final `docker compose down`.
**Este harness existe justamente para isso**: tenant fictício e PBX mockado,
sem áudio de cliente real.

- [ ] **Passo 4: capturar o painel do discador**

```bash
ssh lxc604 'systemctl is-active painel-discador'
```
Se ativo, capturar por túnel SSH. Se não, subir local com Docker.

- [ ] **Passo 5: commitar as imagens**

```bash
git add ferramentas/capturar-prints.js portfolio/img/
git commit -m "feat: prints dos projetos que já estão no ar"
```

---

### Task 6: Captura da faixa B — subir em Docker

**Arquivos:**
- Modificar: `ferramentas/capturar-prints.js` (acrescentar alvos)
- Criar: `portfolio/img/*.png`

**Alvos, um por vez.** Depois de cada um: capturar, derrubar o ambiente,
commitar. **Se um projeto não subir em 30 minutos, parar e usar diagrama**
(Task 7) — o site pode ir ao ar sem ele, o publicador é idempotente.

| Projeto | Como subir | O que capturar |
|---|---|---|
| `omnichannel` | `docker compose up` no `conversio` (Laravel) | caixa de entrada, painel de automação |
| `omnichannel` | `zib`: servidor de desenvolvimento Vite | interface React 18 |
| `evoluai` | `evoluaiv2-merge`, ambiente de desenvolvimento | análise de interação, painel de integrações |
| `discador` | `ivr-flow-designer` | editor visual de fluxo de IVR |
| `rpa` | painel web do `vagas-automation-suite` | ciclo em execução |
| `pedagio` | `slt`: `uvicorn` e abrir `/docs` | Swagger UI da API |
| `sipproxy` | `docker compose` do `sipproxy-fusionpbx` | painel Flask |

- [ ] **Passo 1: para cada alvo — subir, capturar, derrubar, commitar**

```bash
# padrão para cada projeto
cd <projeto> && docker compose up -d
node ferramentas/capturar-prints.js --alvo=<id>
cd <projeto> && docker compose down
git add portfolio/img/ && git commit -m "feat: prints do <projeto>"
```

- [ ] **Passo 2: registrar o que não subiu**

Anotar em `docs/DIARIO.md` qual projeto não subiu e por quê. Isso vira
entrada da Task 7.

---

### Task 7: Faixa C — diagramas e capturas de terminal

**Arquivos:**
- Criar: `portfolio/img/*.svg` ou `*.png`

Para os projetos que não têm tela e para os que não subiram na Task 6:

| Projeto | Substituto |
|---|---|
| `vitalpbx-whatsapp` | diagrama: Meta Graph API → Asterisk/VitalPBX, DTLS-SRTP |
| `asterisk-lab` | diagrama do laboratório + saída do SIPp |
| `email-cleanup` | captura do terminal em modo autônomo, **com endereços mascarados** |
| `pfsense-api` | print do diff do patch, com realce de sintaxe |
| `discador` (motor) | diagrama do motor de discagem |

- [ ] **Passo 1: gerar os diagramas**

Usar a skill `archify` para os diagramas de arquitetura, exportando SVG com
o mesmo par de cores em todos, para o portfólio ficar coeso.

- [ ] **Passo 2: mascarar dados pessoais nas capturas de terminal**

Endereço de e-mail, telefone e nome de terceiro **não vão ao ar**. Substituir
por dado fictício antes de capturar.

- [ ] **Passo 3: rodar o gerador — agora tem que passar**

Rodar: `node ferramentas/gerar-portfolio.js`
Esperado: `14 arquivo(s) em portfolio/build/.`, sem erro de imagem ausente.

- [ ] **Passo 4: commitar**

```bash
git add portfolio/img/ portfolio/build/
git commit -m "feat: diagramas dos projetos sem interface e build do portfólio"
```

---

### Task 8: Publicador WP-CLI

**Arquivos:**
- Criar: `ferramentas/publicar-wp.sh`

**Interfaces:**
- Consome: `portfolio/build/*.html` e `portfolio/img/*` das Tasks 4-7.
- Produz: 14 páginas no WordPress e o menu `Portfólio > Frontend / Backend`.

**Contrato de idempotência:** as páginas são casadas por `post_name` (slug).
Rodar duas vezes seguidas atualiza, não duplica.

- [ ] **Passo 1: escrever o script**

```bash
#!/usr/bin/env bash
# publicar-wp.sh — publica o portfólio no WordPress via WP-CLI sobre SSH.
#
# Idempotente: casa as páginas pelo slug, então rodar de novo atualiza em vez
# de duplicar. Faz backup antes de qualquer escrita.
#
# Uso: bash ferramentas/publicar-wp.sh [--dry-run]

set -euo pipefail

SSH_ALVO="u560021660@git.programandosolucoes.com.br"
SSH_PORTA=65002
WP_PATH="~/domains/carloslopes.programandosolucoes.com.br/public_html"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$RAIZ/portfolio/build"
IMG="$RAIZ/portfolio/img"
DRY_RUN=""
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN="1"

wp_remoto() {
  # shellcheck disable=SC2029
  ssh -p "$SSH_PORTA" "$SSH_ALVO" "cd $WP_PATH && wp $*"
}

echo "==> Passo 0: backup antes de qualquer escrita"
wp_remoto "export --dir=/tmp --filename_format='portfolio-backup-{n}.xml' --post_type=page"

echo "==> Passo 1: enviar imagens para a pasta fixa de uploads"
# Pasta FIXA, não biblioteca de mídia: a URL fica determinística e o HTML
# gerado já nasce com o src certo, sem mapear id de anexo depois.
DESTINO_IMG="$WP_PATH/wp-content/uploads/portfolio"
ssh -p "$SSH_PORTA" "$SSH_ALVO" "mkdir -p $DESTINO_IMG"
if [[ -z "$DRY_RUN" ]]; then
  scp -P "$SSH_PORTA" "$IMG"/* "$SSH_ALVO:$DESTINO_IMG/"
fi

echo "==> Passo 2: publicar as páginas"
# Título vem de paginas.json (o gerador escreve): nome de arquivo não
# comporta acento, espaço nem travessão.
total="$(node -e "console.log(require('$BUILD/paginas.json').length)")"
for i in $(seq 0 $((total - 1))); do
  slug="$(node -e "console.log(require('$BUILD/paginas.json')[$i].slug)")"
  titulo="$(node -e "console.log(require('$BUILD/paginas.json')[$i].titulo)")"
  arquivo="$BUILD/$(node -e "console.log(require('$BUILD/paginas.json')[$i].arquivo)")"

  if [[ -n "$DRY_RUN" ]]; then
    echo "  [dry-run] $slug — $titulo"
    continue
  fi

  scp -P "$SSH_PORTA" "$arquivo" "$SSH_ALVO:/tmp/pagina.html"
  existente="$(wp_remoto "post list --post_type=page --name=$slug --field=ID --format=ids")"

  if [[ -n "$existente" ]]; then
    wp_remoto "post update $existente /tmp/pagina.html --post_title='$titulo'"
    echo "  atualizada: $slug (ID $existente)"
  else
    wp_remoto "post create /tmp/pagina.html --post_type=page --post_status=publish --post_name=$slug --post_title='$titulo' --porcelain"
    echo "  criada: $slug"
  fi
done

echo "==> Passo 3: menu"
echo "  (executado manualmente na primeira vez — ver o plano)"

echo "==> Passo 4: limpar cache"
wp_remoto "litespeed-purge all" || echo "  (LiteSpeed não respondeu; siga)"

echo "==> Pronto."
```

- [ ] **Passo 2: rodar em modo seco**

Rodar: `bash ferramentas/publicar-wp.sh --dry-run`
Esperado: lista os 14 slugs, **sem escrever nada** no site.

- [ ] **Passo 2b: conferir que o acesso de convidado está desligado**

Requisito da spec. Um repositório marcado público com convidado ativo
entregaria o fonte sem senha, e o portfólio inteiro aponta para esses links.

```bash
ssh -p 65002 u560021660@git.programandosolucoes.com.br \
  'grep -o "\"guest_enabled\":[^,}]*" ~/domains/git.programandosolucoes.com.br/public_html/git/_private/config.json'
```
Esperado: `false`, ou a chave ausente. Se vier `true`, conferir quais
repositórios estão marcados públicos antes de seguir.

- [ ] **Passo 3: pedir o OK explícito do usuário**

Escrita em produção. Parar aqui e perguntar. **Não seguir com autorização
dada antes desta etapa.**

- [ ] **Passo 4: publicar**

Rodar: `bash ferramentas/publicar-wp.sh`
Esperado: 14 páginas criadas.

- [ ] **Passo 5: criar o menu**

```bash
ssh -p 65002 u560021660@git.programandosolucoes.com.br \
  "cd ~/domains/carloslopes.programandosolucoes.com.br/public_html && \
   wp menu item add-custom <menu> 'Portfólio' '#' --porcelain && \
   wp menu item add-post <menu> <id-frontend> --parent-id=<id-portfolio> && \
   wp menu item add-post <menu> <id-backend> --parent-id=<id-portfolio>"
```
Descobrir `<menu>` com `wp menu list`.

- [ ] **Passo 6: registrar os comandos no diário e commitar**

```bash
git add ferramentas/publicar-wp.sh docs/DIARIO.md
git commit -m "feat: publicador do portfólio no WordPress via WP-CLI"
```

---

### Task 9: Verificação no ar

**Arquivos:** nenhum novo; registra o resultado em `docs/DIARIO.md`.

- [ ] **Passo 1: navegar pelas páginas publicadas**

Abrir `https://carloslopes.programandosolucoes.com.br/portfolio-frontend` e
`/portfolio-backend` com Playwright headless. Conferir: os cards aparecem, as
imagens carregam (nenhum 404), o menu mostra `Portfólio` com os dois filhos.

- [ ] **Passo 2: conferir uma página de projeto**

Abrir a de `painel-git`. Conferir: problema, arquitetura, resultado, chips de
stack, galeria e o bloco do repositório com o comando de clone.

- [ ] **Passo 3: provar que o portão nega**

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://git.programandosolucoes.com.br/git/repos/painel-git.git/info/refs?service=git-upload-pack"
```
Esperado: `401`.

- [ ] **Passo 4: provar que o portão deixa passar (pelo usuário)**

O usuário roda, num terminal dele, com a credencial dele:
```bash
git clone https://git.programandosolucoes.com.br/git/repos/asterisk-media-server-lab.git /tmp/teste-clone
```
Esperado: clone concluído. **Não posso executar este passo** — exige a senha,
que eu não tenho e não devo pedir.

- [ ] **Passo 5: provar a idempotência**

Rodar `bash ferramentas/publicar-wp.sh` de novo e conferir com
`wp post list --post_type=page --format=count` que o número de páginas **não
mudou**.

- [ ] **Passo 6: registrar e commitar**

```bash
git add docs/DIARIO.md
git commit -m "docs: verificação do portfólio publicado"
```
