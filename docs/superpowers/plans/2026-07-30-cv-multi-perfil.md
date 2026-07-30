# CV Multi-Perfil — Plano de Implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** Gerar nove versões do currículo — uma por área-alvo — a partir de um único arquivo de conteúdo, em texto e HTML compatíveis com ATS, e medir a aderência de cada uma às vagas do seu alvo.

**Arquitetura:** `cv/mestre.json` guarda todo o conteúdo, com variantes de texto por perfil ao lado de cada item. `perfis/<id>.json` são receitas finas que só selecionam e ordenam. `ferramentas/gerar-cv.js` combina os dois e escreve `cv/<perfil>/cv.txt` e `cv.html`. Nenhum arquivo de saída é editado à mão.

**Tech Stack:** Node.js 22 (stdlib apenas), `node:test`, `node:assert`, JSON.

## Restrições Globais

Valem para todas as tarefas:

- **Zero dependências npm.** O repositório roda após `git clone` sem `npm install`. Nada de YAML, nada de biblioteca de template.
- **Node.js >= 18**, sem API experimental além de `node:sqlite` (usado só no script de snapshot).
- **Comentários e mensagens em português do Brasil.** Nomes de variáveis e funções podem ser em inglês, mas o texto voltado a humano é pt-BR.
- **Nenhum arquivo em `cv/<perfil>/` é editado à mão.** São derivados de `mestre.json` + receita.
- **Fatos existem uma vez só** no mestre: `empresa`, `cargo`, `periodo`, `local`, `formacao`, `certificacoes` não têm variante por perfil.
- **Datas no formato `MM/AAAA - MM/AAAA`** ou `MM/AAAA - atual`, idênticas em todos os perfis.
- **Títulos de seção canônicos**, exatamente estes: `RESUMO PROFISSIONAL`, `PRINCIPAIS CONQUISTAS`, `COMPETÊNCIAS`, `EXPERIÊNCIA PROFISSIONAL`, `PROJETOS`, `FORMAÇÃO ACADÊMICA`, `CERTIFICAÇÕES E TREINAMENTOS`, `IDIOMAS`.
- **HTML à prova de ATS:** coluna única; proibido `display:grid`, `columns:`, `position:absolute`, `float:`, `<table>`, `<img>`, `<svg>`, e `content:` em pseudo-elemento dentro do currículo.
- **Casamento de termo sempre com fronteira de palavra**, nunca substring.
- Rodar `node --test ferramentas/**/*.test.js` deve passar ao fim de cada tarefa.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `cv/mestre.json` | Todo o conteúdo do currículo, com variantes por perfil |
| `perfis/<id>.json` | Receita: título, ordem das seções, o que incluir, alvo de medição |
| `ferramentas/lib/secoes.js` | Títulos canônicos de seção e validação de data |
| `ferramentas/lib/montar-cv.js` | Combina mestre + receita → objeto CV resolvido |
| `ferramentas/lib/render-txt.js` | Objeto CV → texto puro |
| `ferramentas/lib/render-html.js` | Objeto CV → HTML de coluna única |
| `ferramentas/lib/selecionar-vagas.js` | Filtra vagas por categoria ou por termo |
| `ferramentas/gerar-cv.js` | CLI que lê os arquivos e escreve as saídas |
| `ferramentas/aderencia.js` | Ganha `--perfil` |
| `ferramentas/exportar-snapshot.js` | Regera `dados/vagas-coletadas.json` |

---

## Task 1: Snapshot completo de vagas

O snapshot atual foi exportado sem o campo `link`, e por isso todo relatório
gerado mostra `Link: undefined`. Esta tarefa corrige o dado e cria o script que
o regera, para o problema não voltar.

**Files:**
- Create: `ferramentas/exportar-snapshot.js`
- Create: `ferramentas/lib/vagas.test.js`
- Modify: `dados/vagas-coletadas.json` (regerado)

**Interfaces:**
- Consome: `../vagas-automation-suite/coleta.db` (SQLite, tabela `Vaga`)
- Produz: `dados/vagas-coletadas.json` — array de objetos com as chaves
  `link, titulo, categoria, plataforma, empresa, senioridade, descricaoResumo, requisitos`

- [ ] **Passo 1: Escrever o teste que falha**

Criar `ferramentas/lib/vagas.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CAMINHO = path.join(__dirname, '..', '..', 'dados', 'vagas-coletadas.json');
const OBRIGATORIOS = ['link', 'titulo', 'categoria', 'plataforma', 'requisitos'];

test('o snapshot traz todos os campos que o relatório usa', () => {
  const vagas = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));
  assert.ok(vagas.length > 0, 'snapshot vazio');

  // O relatório imprime o link de cada vaga; sem o campo, sai "undefined".
  const comRequisitos = vagas.filter(v => v.requisitos);
  assert.ok(comRequisitos.length > 0, 'nenhuma vaga com requisitos');

  for (const campo of OBRIGATORIOS) {
    const faltando = comRequisitos.filter(v => v[campo] === undefined);
    assert.equal(faltando.length, 0, `${faltando.length} vaga(s) sem o campo "${campo}"`);
  }
});

test('todo link do snapshot é uma URL', () => {
  const vagas = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));
  const invalidos = vagas.filter(v => !/^https?:\/\//.test(v.link || ''));
  assert.equal(invalidos.length, 0, `${invalidos.length} vaga(s) com link inválido`);
});
```

- [ ] **Passo 2: Rodar o teste e confirmar que falha**

```bash
cd /home/carlos/ide/curriculo
node --test ferramentas/lib/vagas.test.js
```

Esperado: FALHA com `1129 vaga(s) sem o campo "link"`.

- [ ] **Passo 3: Escrever o exportador**

Criar `ferramentas/exportar-snapshot.js`:

```js
/**
 * exportar-snapshot.js — Regera `dados/vagas-coletadas.json` a partir do banco
 * do coletor no `vagas-automation-suite`.
 *
 * O snapshot existe para este repositório rodar sozinho: sem ele seria preciso
 * Prisma e o banco da suite. Roda com a stdlib (`node:sqlite`), sem instalar
 * nada.
 *
 * Uso: node ferramentas/exportar-snapshot.js [caminho/para/coleta.db]
 */

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const RAIZ = path.join(__dirname, '..');
const BANCO_PADRAO = path.join(RAIZ, '..', 'vagas-automation-suite', 'coleta.db');
const SAIDA = path.join(RAIZ, 'dados', 'vagas-coletadas.json');

// Campos consumidos pela ferramenta de aderência e pelo relatório. `link` é
// obrigatório: o relatório imprime o endereço de cada vaga.
const CAMPOS = [
  'link', 'titulo', 'categoria', 'plataforma',
  'empresa', 'senioridade', 'descricaoResumo', 'requisitos',
];

function main() {
  const banco = process.argv[2] || BANCO_PADRAO;
  if (!fs.existsSync(banco)) {
    console.error(`[snapshot] Banco não encontrado em ${banco}`);
    console.error('[snapshot] Passe o caminho como argumento se o repositório da suite estiver em outro lugar.');
    process.exit(1);
  }

  const db = new DatabaseSync(banco, { readOnly: true });
  const vagas = db.prepare(`SELECT ${CAMPOS.join(', ')} FROM Vaga WHERE ativa = 1`).all();
  db.close();

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify(vagas, null, 1));

  const categorias = new Set(vagas.map(v => v.categoria));
  console.log(`[snapshot] ${vagas.length} vaga(s) em ${categorias.size} categoria(s) → ${path.relative(RAIZ, SAIDA)}`);
}

main();
```

- [ ] **Passo 4: Regerar o snapshot**

```bash
node ferramentas/exportar-snapshot.js
```

Esperado: `[snapshot] 1129 vaga(s) em 30 categoria(s) → dados/vagas-coletadas.json`

- [ ] **Passo 5: Rodar o teste e confirmar que passa**

```bash
node --test ferramentas/lib/vagas.test.js
```

Esperado: `# pass 2  # fail 0`

- [ ] **Passo 6: Confirmar que o relatório deixou de imprimir undefined**

```bash
node ferramentas/aderencia.js
grep -c "Link: undefined" aderencia/$(date +%Y-%m-%d)-aderencia-cv.md
```

Esperado: `0`

- [ ] **Passo 7: Commit**

```bash
git add ferramentas/exportar-snapshot.js ferramentas/lib/vagas.test.js dados/vagas-coletadas.json aderencia/
git commit -m "Snapshot de vagas passa a incluir o link

O relatório imprime o endereço de cada vaga, mas o snapshot foi exportado sem o
campo link — todo relatório saía com 'Link: undefined'. Acrescenta o campo,
cria o script que regera o snapshot (para o problema não depender de alguém
lembrar a query) e um teste que falha se algum campo consumido pelo relatório
sumir de novo."
```

---

## Task 2: Montagem do CV (mestre + receita)

Coração da implementação: a lógica pura que resolve qual texto entra em cada
perfil. Testável sem tocar em disco.

**Files:**
- Create: `ferramentas/lib/secoes.js`
- Create: `ferramentas/lib/montar-cv.js`
- Create: `ferramentas/lib/montar-cv.test.js`

**Desvio deliberado do spec:** o spec previa "ignora id inexistente com aviso".
Esta implementação **aborta**. Um id que some em silêncio produz um currículo
com um emprego a menos e ninguém percebe até um recrutador perguntar — falhar
alto é mais barato.

**Interfaces:**
- Produz: `montarCv(mestre, receita) -> objetoCv`, `resolverBullets(item, perfilId) -> string[]`, `validarReceita(receita) -> void` (lança `Error`)
- Produz: `TITULOS_SECAO` (mapa `tipo -> título canônico`), `PADRAO_DATA` (RegExp)
- Formato de `objetoCv`:
  ```js
  { perfil: 'dev', titulo: 'Desenvolvedor Backend Sênior',
    pessoal: { nome, local, telefone, email, links: [] },
    secoes: [ { tipo, titulo, ... } ] }
  ```
  Cada seção carrega, conforme o tipo: `texto` (resumo), `grupos` (competências),
  `itens` (demais).

- [ ] **Passo 1: Escrever os títulos canônicos**

Criar `ferramentas/lib/secoes.js`:

```js
/**
 * secoes.js — Vocabulário de seções do currículo.
 *
 * Os títulos são fixos e convencionais de propósito: um ATS mapeia a seção
 * pelo texto do cabeçalho. Título criativo ("Minha jornada") impede o parser
 * de saber que ali começa a experiência profissional.
 */

const TITULOS_SECAO = {
  resumo: 'RESUMO PROFISSIONAL',
  conquistas: 'PRINCIPAIS CONQUISTAS',
  competencias: 'COMPETÊNCIAS',
  experiencia: 'EXPERIÊNCIA PROFISSIONAL',
  projetos: 'PROJETOS',
  formacao: 'FORMAÇÃO ACADÊMICA',
  certificacoes: 'CERTIFICAÇÕES E TREINAMENTOS',
  idiomas: 'IDIOMAS',
};

/** `MM/AAAA`, `MM/AAAA - MM/AAAA` ou `MM/AAAA - atual`. */
const PADRAO_DATA = /^(0[1-9]|1[0-2])\/\d{4}( - ((0[1-9]|1[0-2])\/\d{4}|atual))?$/;

module.exports = { TITULOS_SECAO, PADRAO_DATA };
```

- [ ] **Passo 2: Escrever os testes que falham**

Criar `ferramentas/lib/montar-cv.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { montarCv, resolverBullets, validarReceita } = require('./montar-cv');

const MESTRE = {
  pessoal: { nome: 'Fulano', local: 'São Paulo, SP', telefone: '+55 11 0000-0000',
             email: 'f@exemplo.com', links: ['exemplo.com'] },
  resumos: { dev: 'Resumo de dev.', voip: 'Resumo de voip.' },
  conquistas: [{ id: 'c1', texto: 'Reduzi custo em 30%.' }],
  competencias: {
    back: { titulo: 'Backend', itens: ['Node.js', 'Python'] },
    front: { titulo: 'Frontend', itens: ['React'] },
  },
  experiencia: [
    { id: 'emp1', empresa: 'Empresa Um', cargo: 'Dev Sênior', periodo: '01/2020 - 12/2022',
      local: 'São Paulo', bullets: { base: ['Fiz coisas de telefonia.'], dev: ['Construí APIs.'] } },
    { id: 'emp2', empresa: 'Empresa Dois', cargo: 'Analista', periodo: '01/2023 - atual',
      local: 'Remoto', bullets: { base: ['Operei plataforma.'] } },
  ],
  projetos: [
    { id: 'p1', nome: 'Projeto Um', contexto: 'freelance', periodo: '01/2024 - atual',
      bullets: { base: ['Fiz um projeto.'] } },
  ],
  formacao: [{ curso: 'Bacharelado', instituicao: 'Universidade', periodo: '2016 - 2020' }],
  certificacoes: ['Certificação X'],
  idiomas: ['Português: nativo'],
};

const RECEITA = {
  id: 'dev', titulo: 'Desenvolvedor Backend Sênior', padrao: true,
  ordem: ['resumo', 'competencias', 'experiencia'],
  competencias: ['back'],
  incluir_experiencia: ['emp2', 'emp1'],
  incluir_projetos: ['p1'],
  incluir_conquistas: ['c1'],
  categorias_alvo: ['Desenvolvedor'],
};

test('usa a variante do perfil quando ela existe', () => {
  assert.deepEqual(resolverBullets(MESTRE.experiencia[0], 'dev'), ['Construí APIs.']);
});

test('cai na base quando o perfil não tem variante', () => {
  assert.deepEqual(resolverBullets(MESTRE.experiencia[1], 'dev'), ['Operei plataforma.']);
});

test('item sem variante e sem base aborta apontando item e perfil', () => {
  const quebrado = { id: 'emp3', empresa: 'X', cargo: 'Y', periodo: '01/2020', bullets: { qa: ['só qa'] } };
  assert.throws(() => resolverBullets(quebrado, 'dev'), /emp3.*dev/);
});

test('respeita a ordem das seções declarada na receita', () => {
  const cv = montarCv(MESTRE, RECEITA);
  assert.deepEqual(cv.secoes.map(s => s.tipo), ['resumo', 'competencias', 'experiencia']);
});

test('respeita a ordem do array de inclusão, não a ordem do mestre', () => {
  const cv = montarCv(MESTRE, RECEITA);
  const exp = cv.secoes.find(s => s.tipo === 'experiencia');
  assert.deepEqual(exp.itens.map(i => i.empresa), ['Empresa Dois', 'Empresa Um']);
});

test('usa o título canônico da seção, não o nome do tipo', () => {
  const cv = montarCv(MESTRE, RECEITA);
  assert.equal(cv.secoes.find(s => s.tipo === 'experiencia').titulo, 'EXPERIÊNCIA PROFISSIONAL');
});

test('inclui só os grupos de competência pedidos', () => {
  const cv = montarCv(MESTRE, RECEITA);
  const comp = cv.secoes.find(s => s.tipo === 'competencias');
  assert.deepEqual(comp.grupos.map(g => g.titulo), ['Backend']);
});

test('id inexistente na inclusão aborta em vez de sumir em silêncio', () => {
  const receita = { ...RECEITA, incluir_experiencia: ['emp1', 'nao-existe'] };
  assert.throws(() => montarCv(MESTRE, receita), /nao-existe/);
});

test('perfil sem resumo no mestre aborta', () => {
  const receita = { ...RECEITA, id: 'dados' };
  assert.throws(() => montarCv(MESTRE, receita), /dados/);
});

test('receita com categorias_alvo e filtro_termos juntos é rejeitada', () => {
  assert.throws(
    () => validarReceita({ ...RECEITA, filtro_termos: ['rpa'] }),
    /categorias_alvo.*filtro_termos/,
  );
});

test('receita sem alvo nenhum é rejeitada', () => {
  const { categorias_alvo, ...semAlvo } = RECEITA;
  assert.throws(() => validarReceita(semAlvo), /alvo/);
});

test('datas fora do formato MM/AAAA são rejeitadas', () => {
  const mestre = structuredClone(MESTRE);
  mestre.experiencia[0].periodo = '2020-2022';
  assert.throws(() => montarCv(mestre, RECEITA), /emp1.*2020-2022/);
});
```

- [ ] **Passo 3: Rodar e confirmar que falha**

```bash
node --test ferramentas/lib/montar-cv.test.js
```

Esperado: FALHA com `Cannot find module './montar-cv'`.

- [ ] **Passo 4: Implementar**

Criar `ferramentas/lib/montar-cv.js`:

```js
/**
 * montar-cv.js — Combina o conteúdo (`cv/mestre.json`) com uma receita de
 * perfil (`perfis/<id>.json`) e devolve o currículo já resolvido, pronto para
 * ser renderizado em texto ou HTML.
 *
 * Regra de fronteira do projeto: TODO texto mora no mestre; a receita só
 * seleciona e ordena. É isso que impede as nove versões de divergirem em
 * fatos — empresa, cargo e período existem uma vez só.
 *
 * Lógica pura: não lê nem escreve arquivo, para ser testável sem disco.
 */

const { TITULOS_SECAO, PADRAO_DATA } = require('./secoes');

/**
 * Bullets de um item para um perfil: a variante do perfil, ou a base.
 *
 * Ausência das duas é ERRO, não omissão: um item que some silenciosamente do
 * currículo é pior que um erro de geração, porque ninguém percebe.
 */
function resolverBullets(item, perfilId) {
  const bullets = item.bullets || {};
  const escolhidos = bullets[perfilId] || bullets.base;
  if (!escolhidos || escolhidos.length === 0) {
    throw new Error(
      `Item "${item.id}" não tem bullets para o perfil "${perfilId}" nem "base". ` +
      `Acrescente um dos dois em cv/mestre.json.`,
    );
  }
  return escolhidos;
}

/** Uma receita declara `categorias_alvo` OU `filtro_termos` — nunca os dois, nunca nenhum. */
function validarReceita(receita) {
  const temCategorias = Array.isArray(receita.categorias_alvo) && receita.categorias_alvo.length > 0;
  const temTermos = Array.isArray(receita.filtro_termos) && receita.filtro_termos.length > 0;
  if (temCategorias && temTermos) {
    throw new Error(
      `Perfil "${receita.id}" declara categorias_alvo E filtro_termos. ` +
      `Escolha um: não há como medir contra os dois ao mesmo tempo.`,
    );
  }
  if (!temCategorias && !temTermos) {
    throw new Error(
      `Perfil "${receita.id}" não declara alvo de medição. ` +
      `Acrescente categorias_alvo ou filtro_termos.`,
    );
  }
}

function conferirData(item, periodo) {
  if (periodo !== undefined && !PADRAO_DATA.test(periodo)) {
    throw new Error(
      `Item "${item.id || item.curso}" tem período "${periodo}" fora do formato ` +
      `MM/AAAA, MM/AAAA - MM/AAAA ou MM/AAAA - atual.`,
    );
  }
}

/** Seleciona itens por id, na ORDEM DO ARRAY da receita. */
function selecionarPorId(colecao, ids, nomeSecao, perfilId) {
  const porId = new Map((colecao || []).map(item => [item.id, item]));
  return (ids || []).map(id => {
    const item = porId.get(id);
    if (!item) {
      throw new Error(
        `Perfil "${perfilId}": id "${id}" pedido em ${nomeSecao} não existe em cv/mestre.json.`,
      );
    }
    conferirData(item, item.periodo);
    return item;
  });
}

const MONTADORES = {
  resumo(mestre, receita) {
    const texto = (mestre.resumos || {})[receita.id];
    if (!texto) {
      throw new Error(`Falta o resumo do perfil "${receita.id}" em cv/mestre.json (chave "resumos").`);
    }
    return { texto };
  },

  conquistas(mestre, receita) {
    const itens = selecionarPorId(mestre.conquistas, receita.incluir_conquistas, 'incluir_conquistas', receita.id);
    return { itens: itens.map(c => c.texto) };
  },

  competencias(mestre, receita) {
    const grupos = (receita.competencias || []).map(chave => {
      const grupo = (mestre.competencias || {})[chave];
      if (!grupo) {
        throw new Error(`Perfil "${receita.id}": grupo de competência "${chave}" não existe em cv/mestre.json.`);
      }
      return { titulo: grupo.titulo, itens: grupo.itens };
    });
    return { grupos };
  },

  experiencia(mestre, receita) {
    const itens = selecionarPorId(mestre.experiencia, receita.incluir_experiencia, 'incluir_experiencia', receita.id);
    return {
      itens: itens.map(e => ({
        empresa: e.empresa, cargo: e.cargo, periodo: e.periodo, local: e.local,
        bullets: resolverBullets(e, receita.id),
      })),
    };
  },

  projetos(mestre, receita) {
    const itens = selecionarPorId(mestre.projetos, receita.incluir_projetos, 'incluir_projetos', receita.id);
    return {
      itens: itens.map(p => ({
        nome: p.nome, contexto: p.contexto, periodo: p.periodo,
        bullets: resolverBullets(p, receita.id),
      })),
    };
  },

  formacao(mestre) {
    return { itens: mestre.formacao || [] };
  },

  certificacoes(mestre) {
    return { itens: mestre.certificacoes || [] };
  },

  idiomas(mestre) {
    return { itens: mestre.idiomas || [] };
  },
};

/**
 * @param {object} mestre conteúdo de `cv/mestre.json`
 * @param {object} receita conteúdo de `perfis/<id>.json`
 * @returns {{perfil: string, titulo: string, pessoal: object, secoes: object[]}}
 */
function montarCv(mestre, receita) {
  validarReceita(receita);

  const secoes = (receita.ordem || []).map(tipo => {
    const montador = MONTADORES[tipo];
    if (!montador) {
      throw new Error(
        `Perfil "${receita.id}": seção "${tipo}" desconhecida. ` +
        `Válidas: ${Object.keys(MONTADORES).join(', ')}.`,
      );
    }
    return { tipo, titulo: TITULOS_SECAO[tipo], ...montador(mestre, receita) };
  });

  return { perfil: receita.id, titulo: receita.titulo, pessoal: mestre.pessoal, secoes };
}

module.exports = { montarCv, resolverBullets, validarReceita };
```

- [ ] **Passo 5: Rodar e confirmar que passa**

```bash
node --test ferramentas/lib/montar-cv.test.js
```

Esperado: `# pass 12  # fail 0`

- [ ] **Passo 6: Commit**

```bash
git add ferramentas/lib/secoes.js ferramentas/lib/montar-cv.js ferramentas/lib/montar-cv.test.js
git commit -m "Montagem do CV a partir do mestre e da receita de perfil

Lógica pura que resolve qual texto entra em cada perfil: usa a variante do
perfil quando existe, cai na base quando não. Ausência das duas é erro, nunca
omissão silenciosa — item que some do currículo sem avisar é pior que falha de
geração.

Valida na montagem o que só apareceria como currículo errado depois: id
inexistente na inclusão, seção desconhecida, perfil sem resumo, data fora do
formato MM/AAAA, e receita que declara os dois alvos de medição ou nenhum."
```

---

## Task 3: Renderização em texto

**Files:**
- Create: `ferramentas/lib/render-txt.js`
- Create: `ferramentas/lib/render-txt.test.js`

**Interfaces:**
- Consome: `objetoCv` da Task 2
- Produz: `renderTxt(objetoCv) -> string`

- [ ] **Passo 1: Escrever os testes que falham**

Criar `ferramentas/lib/render-txt.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { renderTxt } = require('./render-txt');

const CV = {
  perfil: 'dev', titulo: 'Desenvolvedor Backend Sênior',
  pessoal: { nome: 'Fulano de Tal', local: 'São Paulo, SP, Brasil',
             telefone: '+55 11 0000-0000', email: 'f@exemplo.com',
             links: ['linkedin.com/in/fulano', 'exemplo.com'] },
  secoes: [
    { tipo: 'resumo', titulo: 'RESUMO PROFISSIONAL', texto: 'Sou uma pessoa.' },
    { tipo: 'competencias', titulo: 'COMPETÊNCIAS',
      grupos: [{ titulo: 'Backend', itens: ['Node.js', 'Python'] }] },
    { tipo: 'experiencia', titulo: 'EXPERIÊNCIA PROFISSIONAL',
      itens: [{ empresa: 'Empresa Um', cargo: 'Dev Sênior', periodo: '01/2020 - 12/2022',
                local: 'São Paulo', bullets: ['Construí APIs.', 'Liderei squad.'] }] },
    { tipo: 'idiomas', titulo: 'IDIOMAS', itens: ['Português: nativo'] },
  ],
};

test('abre com nome e título do perfil', () => {
  const linhas = renderTxt(CV).split('\n');
  assert.equal(linhas[0], 'FULANO DE TAL');
  assert.equal(linhas[1], 'Desenvolvedor Backend Sênior');
});

test('traz os dados de contato no topo', () => {
  const txt = renderTxt(CV);
  assert.match(txt, /\+55 11 0000-0000/);
  assert.match(txt, /f@exemplo\.com/);
  assert.match(txt, /linkedin\.com\/in\/fulano/);
});

test('usa os títulos canônicos de seção', () => {
  const txt = renderTxt(CV);
  for (const titulo of ['RESUMO PROFISSIONAL', 'COMPETÊNCIAS', 'EXPERIÊNCIA PROFISSIONAL', 'IDIOMAS']) {
    assert.ok(txt.includes(titulo), `faltou a seção ${titulo}`);
  }
});

test('cargo, empresa e período ficam na mesma linha identificável', () => {
  const txt = renderTxt(CV);
  assert.match(txt, /Dev Sênior \| Empresa Um \| 01\/2020 - 12\/2022/);
});

test('não usa caractere que atrapalha parser de ATS', () => {
  const txt = renderTxt(CV);
  for (const proibido of ['•', '—', '–', '\t']) {
    assert.ok(!txt.includes(proibido), `texto contém "${proibido}"`);
  }
});

test('termina com quebra de linha', () => {
  assert.ok(renderTxt(CV).endsWith('\n'));
});
```

- [ ] **Passo 2: Rodar e confirmar que falha**

```bash
node --test ferramentas/lib/render-txt.test.js
```

Esperado: FALHA com `Cannot find module './render-txt'`.

- [ ] **Passo 3: Implementar**

Criar `ferramentas/lib/render-txt.js`:

```js
/**
 * render-txt.js — Currículo resolvido → texto puro.
 *
 * O texto é o artefato mais seguro para triagem automatizada (ATS): não há
 * estrutura visual para o parser interpretar errado. Por isso a saída evita
 * bullet tipográfico, travessão e tabulação, que alguns extratores traduzem
 * mal — hífen simples e espaço resolvem.
 */

/** Substitui o que costuma sair corrompido de extrator de texto. */
function limpar(texto) {
  return String(texto)
    .replace(/[—–]/g, '-')
    .replace(/[•·]/g, '-')
    .replace(/\t/g, ' ');
}

const RENDERIZADORES = {
  resumo: secao => [limpar(secao.texto)],

  conquistas: secao => secao.itens.map(item => `- ${limpar(item)}`),

  competencias: secao => secao.grupos.flatMap(grupo => [
    `${limpar(grupo.titulo)}:`,
    ...grupo.itens.map(item => `- ${limpar(item)}`),
    '',
  ]).slice(0, -1),

  experiencia: secao => secao.itens.flatMap(item => [
    // Cargo, empresa e período numa linha só e sempre na mesma ordem: é assim
    // que o parser de ATS reconhece o bloco de emprego.
    `${limpar(item.cargo)} | ${limpar(item.empresa)} | ${limpar(item.periodo)}${item.local ? ` | ${limpar(item.local)}` : ''}`,
    ...item.bullets.map(b => `- ${limpar(b)}`),
    '',
  ]).slice(0, -1),

  projetos: secao => secao.itens.flatMap(item => [
    `${limpar(item.nome)}${item.contexto ? ` | ${limpar(item.contexto)}` : ''} | ${limpar(item.periodo)}`,
    ...item.bullets.map(b => `- ${limpar(b)}`),
    '',
  ]).slice(0, -1),

  formacao: secao => secao.itens.map(
    item => `- ${limpar(item.curso)} | ${limpar(item.instituicao)} | ${limpar(item.periodo)}`,
  ),

  certificacoes: secao => secao.itens.map(item => `- ${limpar(item)}`),

  idiomas: secao => secao.itens.map(item => `- ${limpar(item)}`),
};

/**
 * @param {object} cv objeto devolvido por `montarCv`
 * @returns {string} currículo em texto puro
 */
function renderTxt(cv) {
  const { pessoal } = cv;
  const linhas = [
    limpar(pessoal.nome).toUpperCase(),
    limpar(cv.titulo),
    [pessoal.local, pessoal.telefone, pessoal.email].filter(Boolean).map(limpar).join(' | '),
  ];
  if (pessoal.links && pessoal.links.length) linhas.push(pessoal.links.map(limpar).join(' | '));

  for (const secao of cv.secoes) {
    const renderizador = RENDERIZADORES[secao.tipo];
    if (!renderizador) throw new Error(`Sem renderizador de texto para a seção "${secao.tipo}".`);
    linhas.push('', secao.titulo, ...renderizador(secao));
  }

  return linhas.join('\n') + '\n';
}

module.exports = { renderTxt };
```

- [ ] **Passo 4: Rodar e confirmar que passa**

```bash
node --test ferramentas/lib/render-txt.test.js
```

Esperado: `# pass 6  # fail 0`

- [ ] **Passo 5: Commit**

```bash
git add ferramentas/lib/render-txt.js ferramentas/lib/render-txt.test.js
git commit -m "Renderização do currículo em texto puro

Texto é o formato mais seguro para triagem automatizada: não há estrutura
visual para o parser interpretar errado. A saída troca bullet tipográfico,
travessão e tabulação por hífen e espaço, que alguns extratores corrompem, e
mantém cargo, empresa e período numa linha só e sempre na mesma ordem — é
assim que o ATS reconhece o bloco de emprego."
```

---

## Task 4: Renderização em HTML à prova de ATS

**Files:**
- Create: `ferramentas/lib/render-html.js`
- Create: `ferramentas/lib/render-html.test.js`

**Interfaces:**
- Consome: `objetoCv` da Task 2
- Produz: `renderHtml(objetoCv) -> string` (documento HTML completo)

- [ ] **Passo 1: Escrever os testes que falham**

Criar `ferramentas/lib/render-html.test.js`:

```js
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
```

- [ ] **Passo 2: Rodar e confirmar que falha**

```bash
node --test ferramentas/lib/render-html.test.js
```

Esperado: FALHA com `Cannot find module './render-html'`.

- [ ] **Passo 3: Implementar**

Criar `ferramentas/lib/render-html.js`:

```js
/**
 * render-html.js — Currículo resolvido → HTML de coluna única.
 *
 * O HTML existe para duas coisas: revisar no navegador e gerar o PDF que vai
 * anexado. Como esse PDF passa por triagem automatizada, o layout é
 * deliberadamente pobre:
 *
 *   - uma coluna só, porque o extrator lê na ordem do fluxo e duas colunas
 *     viram frases intercaladas;
 *   - sem tabela, imagem, SVG, cabeçalho/rodapé de página ou posicionamento
 *     absoluto;
 *   - sem texto injetado por CSS (`content:`), que não sai na extração;
 *   - cabeçalho de seção como texto real em <h2>.
 *
 * Bonito é secundário. O que importa é o texto sair inteiro e na ordem certa.
 */

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ESTILO = `
  :root { --tinta: #111; --suave: #444; --linha: #bbb; }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto; max-width: 820px; padding: 32px 28px 64px;
    font-family: Calibri, Carlito, "Segoe UI", Arial, sans-serif;
    font-size: 11pt; line-height: 1.45; color: var(--tinta); background: #fff;
  }
  h1 { font-size: 20pt; margin: 0; letter-spacing: .01em; }
  .cargo { font-size: 12.5pt; color: var(--suave); margin: 2px 0 8px; font-weight: 600; }
  .contato { font-size: 10pt; color: var(--suave); margin: 0; }
  .contato a { color: inherit; }
  h2 {
    font-size: 11.5pt; margin: 22px 0 8px; padding-bottom: 3px;
    border-bottom: 1px solid var(--linha); letter-spacing: .04em;
  }
  h3 { font-size: 11pt; margin: 12px 0 3px; font-weight: 700; }
  p { margin: 0 0 8px; }
  ul { margin: 4px 0 10px; padding-left: 20px; }
  li { margin-bottom: 3px; }
  .grupo-titulo { font-weight: 700; margin: 10px 0 2px; }
  @media print {
    body { max-width: none; padding: 0; font-size: 10.5pt; }
    @page { margin: 14mm; }
    h2, h3, li { break-inside: avoid; }
  }
`;

const RENDERIZADORES = {
  resumo: secao => `<p>${escapar(secao.texto)}</p>`,

  conquistas: secao => lista(secao.itens),

  competencias: secao => secao.grupos.map(grupo =>
    `<p class="grupo-titulo">${escapar(grupo.titulo)}</p>\n${lista(grupo.itens)}`,
  ).join('\n'),

  experiencia: secao => secao.itens.map(item => {
    const cabecalho = [item.cargo, item.empresa, item.periodo, item.local]
      .filter(Boolean).map(escapar).join(' | ');
    return `<h3>${cabecalho}</h3>\n${lista(item.bullets)}`;
  }).join('\n'),

  projetos: secao => secao.itens.map(item => {
    const cabecalho = [item.nome, item.contexto, item.periodo]
      .filter(Boolean).map(escapar).join(' | ');
    return `<h3>${cabecalho}</h3>\n${lista(item.bullets)}`;
  }).join('\n'),

  formacao: secao => lista(
    secao.itens.map(i => [i.curso, i.instituicao, i.periodo].filter(Boolean).join(' | ')),
  ),

  certificacoes: secao => lista(secao.itens),

  idiomas: secao => lista(secao.itens),
};

function lista(itens) {
  return `<ul>\n${itens.map(i => `  <li>${escapar(i)}</li>`).join('\n')}\n</ul>`;
}

/**
 * @param {object} cv objeto devolvido por `montarCv`
 * @returns {string} documento HTML completo
 */
function renderHtml(cv) {
  const { pessoal } = cv;
  const contato = [pessoal.local, pessoal.telefone, pessoal.email].filter(Boolean).map(escapar).join(' | ');
  const links = (pessoal.links || []).map(escapar).join(' | ');

  const corpo = cv.secoes.map(secao => {
    const renderizador = RENDERIZADORES[secao.tipo];
    if (!renderizador) throw new Error(`Sem renderizador de HTML para a seção "${secao.tipo}".`);
    return `<h2>${escapar(secao.titulo)}</h2>\n${renderizador(secao)}`;
  }).join('\n\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(pessoal.nome)} - ${escapar(cv.titulo)}</title>
<style>${ESTILO}</style>
</head>
<body>
<h1>${escapar(pessoal.nome)}</h1>
<p class="cargo">${escapar(cv.titulo)}</p>
<p class="contato">${contato}</p>
${links ? `<p class="contato">${links}</p>` : ''}

${corpo}
</body>
</html>
`;
}

module.exports = { renderHtml };
```

- [ ] **Passo 4: Rodar e confirmar que passa**

```bash
node --test ferramentas/lib/render-html.test.js
```

Esperado: `# pass 8  # fail 0`

- [ ] **Passo 5: Commit**

```bash
git add ferramentas/lib/render-html.js ferramentas/lib/render-html.test.js
git commit -m "Renderização do currículo em HTML de coluna única

O HTML serve para revisar no navegador e gerar o PDF anexado nas candidaturas,
e esse PDF passa por triagem automatizada — então o layout é deliberadamente
pobre. Uma coluna só, porque o extrator lê na ordem do fluxo e duas colunas
viram frases intercaladas. Sem tabela, imagem, SVG, posicionamento absoluto ou
texto injetado por CSS, que não sai na extração.

Os testes verificam a ausência de cada um desses padrões no HTML gerado, então
uma regressão de layout quebra a suíte em vez de aparecer só quando um
recrutador não achar o candidato."
```

---

## Task 5: Conteúdo mestre

Migração do currículo atual para `cv/mestre.json`. A `base` de cada item é a
voz VoIP, porque é assim que o currículo já está escrito — os outros oito
perfis sobrescrevem.

**Files:**
- Create: `cv/mestre.json`
- Create: `ferramentas/lib/mestre.test.js`
- Read: `cv/cv.txt` (fonte do conteúdo a migrar)

**Interfaces:**
- Produz: `cv/mestre.json` conforme o formato da Task 2

- [ ] **Passo 1: Escrever o teste que falha**

Criar `ferramentas/lib/mestre.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { PADRAO_DATA } = require('./secoes');

const MESTRE = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'cv', 'mestre.json'), 'utf8'),
);
const PERFIS = ['voip', 'ia', 'dev', 'frontend', 'devops', 'dados', 'seguranca', 'qa', 'rpa'];

test('tem um resumo para cada um dos nove perfis', () => {
  for (const perfil of PERFIS) {
    assert.ok(MESTRE.resumos[perfil], `falta o resumo do perfil "${perfil}"`);
  }
});

test('todo item de experiência e projeto tem id único', () => {
  for (const chave of ['experiencia', 'projetos', 'conquistas']) {
    const ids = MESTRE[chave].map(i => i.id);
    assert.equal(new Set(ids).size, ids.length, `ids repetidos em ${chave}`);
    assert.ok(ids.every(Boolean), `item sem id em ${chave}`);
  }
});

test('todo item de experiência e projeto tem bullets.base', () => {
  for (const chave of ['experiencia', 'projetos']) {
    for (const item of MESTRE[chave]) {
      assert.ok(
        item.bullets && item.bullets.base && item.bullets.base.length > 0,
        `"${item.id}" em ${chave} não tem bullets.base`,
      );
    }
  }
});

test('todo período está no formato MM/AAAA', () => {
  for (const chave of ['experiencia', 'projetos']) {
    for (const item of MESTRE[chave]) {
      assert.ok(PADRAO_DATA.test(item.periodo), `"${item.id}": período "${item.periodo}" fora do formato`);
    }
  }
});

test('a experiência profissional cobre todos os empregos do CV atual', () => {
  // Guarda contra perder um emprego na migração para o mestre.
  assert.ok(MESTRE.experiencia.length >= 11, `só ${MESTRE.experiencia.length} empregos migrados`);
});

test('os sete projetos do portfólio estão presentes', () => {
  assert.ok(MESTRE.projetos.length >= 7, `só ${MESTRE.projetos.length} projetos migrados`);
});

test('siglas aparecem junto da forma expandida em algum lugar do conteúdo', () => {
  // Regra de ATS com maior retorno: a vaga pode buscar qualquer das duas formas.
  const tudo = JSON.stringify(MESTRE).toLowerCase();
  const pares = [
    ['inteligência artificial', 'ia'],
    ['robotic process automation', 'rpa'],
    ['answering machine detection', 'amd'],
  ];
  for (const [expandido, sigla] of pares) {
    assert.ok(tudo.includes(expandido), `falta a forma expandida de "${sigla}": "${expandido}"`);
  }
});
```

- [ ] **Passo 2: Rodar e confirmar que falha**

```bash
node --test ferramentas/lib/mestre.test.js
```

Esperado: FALHA com `ENOENT ... cv/mestre.json`.

- [ ] **Passo 3: Escrever o mestre**

Criar `cv/mestre.json` migrando o conteúdo de `cv/cv.txt`. Regras da migração:

1. **`bullets.base` recebe o texto atual do `cv.txt`**, sem alteração — é a voz VoIP.
2. **Variantes só onde o ângulo muda de verdade.** Não criar variante que apenas reordena palavras.
3. **Ids em kebab-case** derivados da empresa: `akiva`, `onvox`, `open-new`, `ip-telecom`, `tw-solutions`, `55pbx`, `elev`, `tld`, `sothis`, `ez-security`, `e-prepag`, `all-net`.
4. **Ids de projeto:** `discador`, `omnichannel`, `pedagio`, `analise-audio`, `sipproxy`, `rpa`, `painel-git`.
5. **Ids de conquista:** `onboarding`, `campanha`, `uptime`, `mttd`.
6. **Grupos de competência:** `voip`, `cloud`, `desenvolvimento`, `frontend`, `ia-llm`, `sinais`, `python`, `seguranca`, `dados`.
7. **Datas convertidas** para `MM/AAAA - MM/AAAA`; `- Atual` vira `- atual`.
8. **Formação sem período mensal** (`2016 - 2020`) fica em `formacao`, que não passa por `PADRAO_DATA`.

Esqueleto com um item de cada tipo já preenchido — completar seguindo o mesmo padrão:

```json
{
  "pessoal": {
    "nome": "Carlos Alberto",
    "local": "São Paulo, SP, Brasil",
    "telefone": "+55 11 2615-2880",
    "email": "carlosalberto4ti@gmail.com",
    "links": ["linkedin.com/in/carlosalberto4ti", "programandosolucoes.com.br"]
  },

  "resumos": {
    "voip": "Arquiteto de Soluções e Engenheiro VoIP Sênior com mais de 10 anos de experiência, focado em projetar e implementar sistemas de comunicação em nuvem de alta disponibilidade. Especialista em arquitetar ecossistemas VoIP complexos (Asterisk, Kamailio, OpenSIPS), integrar plataformas de telefonia a sistemas de negócio e desenvolver os componentes que faltam — appliances de roteamento, engines de IVR e APIs de integração.",
    "dev": "Desenvolvedor Backend Sênior com mais de 10 anos construindo sistemas de missão crítica em Node.js, Python e PHP. Projetei APIs REST que processam mais de 1 milhão de eventos diários, liderei squad de 11 desenvolvedores como referência técnica de CI/CD, e mantenho um portfólio de sete plataformas autorais em produção — de discador para call center a análise de áudio por processamento de sinais.",
    "frontend": "Desenvolvedor Frontend Sênior com experiência em React 18, TypeScript e Next.js, construindo desde plataformas SaaS completas com design system próprio até interfaces sem framework nem build. Trabalhei com TailwindCSS, Radix UI, TanStack e Vite, testes end-to-end em Cypress, videochamada WebRTC e segmentação de imagem por IA executando no navegador com TensorFlow.js.",
    "ia": "Engenheiro de Inteligência Artificial (IA) com experiência prática em integrar modelos de linguagem (LLM) a produtos em produção. Construí cadeia de fallback entre cinco provedores sobre dois formatos de API distintos, inferência local em CPU com modelos quantizados para dados que não podem sair da máquina, e avaliação comparativa de modelos neurais com corpus rotulado e critério de licenciamento. Bacharelado em Ciências de Inteligência Artificial em curso.",
    "devops": "Engenheiro DevOps e SRE Sênior com mais de 10 anos em infraestrutura de missão crítica. Reduzi o tempo médio de detecção de falhas em 40% modernizando observabilidade, garanti 99,99% de uptime em operação internacional e mantive disaster recovery para mais de 100 clientes. Trabalho com Kubernetes, Docker, Proxmox, LXC, CI/CD e automação de provisionamento via API.",
    "dados": "Profissional de Dados e Business Intelligence com base sólida em engenharia de sistemas. Construí pipelines processando mais de 1 milhão de eventos diários, dashboards usados por gestores em mais de 25 empresas, e sistemas analíticos que vão de modelagem relacional a processamento digital de sinais. Pós-graduação em Data Warehouse e Business Intelligence e Bacharelado em Ciências de Inteligência Artificial em curso.",
    "seguranca": "Analista de Segurança da Informação Sênior com experiência em proteção de aplicação, criptografia aplicada e resposta a incidentes. Implementei arquitetura WAF com ModSecurity e regras OWASP em ambiente financeiro, reduzi o tempo de resposta a incidentes em mais de 99% com análise automatizada de logs em nível de SOC, e desenvolvi sistemas com criptografia AES, assinatura RSA e isolamento físico de dados entre clientes.",
    "qa": "Especialista em Qualidade e Automação de Testes com base de desenvolvimento sênior. Mantenho suítes automatizadas que somam mais de 850 testes entre os projetos autorais, cobrindo desde lógica pura até integração com API e conformidade de protocolo. Trabalho com pytest, PHPUnit, Cypress, Vitest, teste de carga com Locust e checagem estática de tipos.",
    "rpa": "Especialista em Automação de Processos (RPA) e Integração de Sistemas. Construí um motor de automação de navegador que opera portais web de forma autônoma e não supervisionada, bots de processamento de e-mail com decisão por IA, e chatbots que automatizaram até 25% do volume operacional de atendimento. Integração de API é especialidade recorrente: cinco gateways de mensageria atrás de uma única interface, clientes próprios de seis APIs distintas e mensageria assíncrona."
  },

  "conquistas": [
    { "id": "onboarding", "texto": "Otimização do Onboarding de Clientes: reduzi o tempo de onboarding de novos clientes em 60% com provisionamento zero-touch." },
    { "id": "campanha", "texto": "Eficiência de Campanha Aprimorada: melhorei a eficiência das campanhas em 30% usando Inteligência Artificial (IA) para detecção de caixa postal." },
    { "id": "uptime", "texto": "Garantia de Uptime de Serviço: garanti 99,99% de uptime para serviços críticos no mercado de telefonia italiano." },
    { "id": "mttd", "texto": "Detecção de Falhas Aprimorada: reduzi o Tempo Médio para Detecção (MTTD) de falhas em 40% com novos templates de observabilidade." }
  ],

  "competencias": {
    "voip": {
      "titulo": "VoIP e Telecomunicações",
      "itens": [
        "Arquitetura de Soluções VoIP",
        "Asterisk (dCAA Certified)",
        "Kamailio, OpenSIPS",
        "SBC (Session Border Controller)",
        "Plataformas de Call Center",
        "WebRTC, SIP/TLS, PJSIP",
        "ARI (Asterisk REST Interface), dialplan JSON-driven, DTMF",
        "URA/IVR, CDR, CEL, ODBC realtime (unixODBC)",
        "rtpengine, NAT traversal, FusionPBX, VitalPBX, Issabel",
        "SIPp (teste de conformidade de protocolo SIP)",
        "Codecs G.711, G.729, G.723.1, Opus"
      ]
    },
    "desenvolvimento": {
      "titulo": "Desenvolvimento e Banco de Dados",
      "itens": [
        "JavaScript, TypeScript, Node.js (REST APIs, Drachtio)",
        "Python (FastAPI, Flask, AGI)",
        "PHP, Laravel 12",
        "SQL (MySQL, PostgreSQL, MariaDB, SQLite), PL/pgSQL",
        "Prisma, Drizzle ORM, SQLAlchemy",
        "API REST, JSON-RPC, SOAP/XML, Protobuf, webhook, websocket",
        "JMS/STOMP (ActiveMQ), BullMQ/Redis, mensageria",
        "Metodologias Ágeis (Scrum, Kanban, JIRA)"
      ]
    },
    "frontend": {
      "titulo": "Frontend",
      "itens": [
        "HTML, CSS, JavaScript (ES6+)",
        "React 18, TypeScript, Next.js",
        "TailwindCSS, Radix UI, shadcn/ui",
        "TanStack (Query, Router, Table, Form)",
        "Vite, esbuild, PostCSS",
        "Angular",
        "SPA sem framework, Canvas, design system com tokens de tema",
        "Testes end-to-end com Cypress e Testing Library"
      ]
    },
    "cloud": {
      "titulo": "Cloud e DevOps",
      "itens": [
        "Kubernetes (K8s) e Docker",
        "AWS e GCP",
        "Proxmox, KVM, VMware vSphere, LXC",
        "Infraestrutura como Código (IaC)",
        "CI/CD (Bitbucket, Jenkins), Git",
        "Monitoramento (Zabbix, NOC), observabilidade",
        "systemd, gunicorn, Nginx, Apache",
        "Automação de provisionamento via API do Proxmox VE"
      ]
    },
    "ia-llm": {
      "titulo": "Inteligência Artificial (IA) e LLM",
      "itens": [
        "Integração multi-provedor com fallback em cadeia (OpenRouter, OpenAI, Anthropic, NVIDIA NIM, Groq/Llama 3, Ollama)",
        "Inferência local em CPU para dados sensíveis: LLM quantizado GGUF via llama.cpp, ONNX Runtime",
        "Reconhecimento de fala (ASR) local com faster-whisper",
        "Prompt engineering estruturado: few-shot, saída JSON validada, fallback determinístico",
        "Avaliação comparativa de modelos neurais com corpus rotulado",
        "IA generativa, agentes de IA, MCP (Model Context Protocol), RAG",
        "Engenharia assistida por IA com metodologia spec-driven"
      ]
    },
    "sinais": {
      "titulo": "Processamento de Sinais e Áudio",
      "itens": [
        "Processamento Digital de Sinais (DSP) em Python e NumPy",
        "FFT e features espectrais (flatness, flux, centroide)",
        "E-model ITU-T G.107 (R-factor para MOS), P.862.1, P.835",
        "Detecção de perda de pacote, clipping, dead-air, one-way, SNR, jitter",
        "ffmpeg e ffprobe"
      ]
    },
    "python": {
      "titulo": "Ecossistema Python",
      "itens": [
        "NumPy, Pandas, Flask, FastAPI, requests, SQLAlchemy",
        "cryptography, protobuf, ONNX Runtime, PyTorch/TorchAudio",
        "Concorrência: threading, jobs assíncronos, asyncio",
        "pytest, mypy, black, flake8, PyInstaller"
      ]
    },
    "seguranca": {
      "titulo": "Segurança Aplicada",
      "itens": [
        "WAF (ModSecurity, OWASP), pfSense, OpenVPN",
        "Análise de logs em nível de SOC, Fail2ban",
        "Criptografia AES-128/256 (CBC, ECB, CFB, OFB, CTR), AES-256-GCM",
        "RSA-2048, HMAC-SHA256, PBKDF2, assinatura digital",
        "OAuth2, JWT, TLS/SSL, autenticação por desafio com chave SSH",
        "Multi-tenancy com isolamento físico de dados, RBAC",
        "Proteção contra SSRF, CSRF, XSS, SQL Injection; rate limiting"
      ]
    },
    "dados": {
      "titulo": "Dados e Business Intelligence",
      "itens": [
        "SQL avançado, modelagem relacional, tuning de PostgreSQL",
        "Power BI, dashboards e relatórios operacionais",
        "Pipelines de mais de 1 milhão de eventos diários",
        "Pandas, NumPy, análise estatística",
        "Data Warehouse e Business Intelligence (pós-graduação em curso)"
      ]
    },
    "qa": {
      "titulo": "Qualidade e Testes",
      "itens": [
        "pytest, PHPUnit, Vitest, node:test, Testing Library",
        "Testes end-to-end com Cypress",
        "Teste de carga com Locust",
        "Teste de conformidade de protocolo com SIPp",
        "Checagem estática de tipos com mypy e TypeScript",
        "Cobertura de testes, mock de HTTP, geração de dados sintéticos"
      ]
    }
  },

  "experiencia": [
    {
      "id": "akiva",
      "empresa": "Akiva Software",
      "cargo": "Engenheiro VoIP",
      "periodo": "09/2025 - 11/2025",
      "local": "São Paulo, Brasil",
      "bullets": {
        "base": [
          "Resolvi incidentes críticos de suporte (N3) e gerenciei dois sistemas distintos de classificação de chamadas: o módulo proprietário Asterisk da Akiva e o classificador Flow da Khomp.",
          "Implantei e configurei novos fluxos de call center de ponta a ponta, desde filas de atendimento até discadores automáticos.",
          "Otimizei o processo de deploy da aplicação, desenvolvendo scripts de autoinstalação do codec G.729 e modernizando o sistema operacional de telefonia subjacente.",
          "Melhorei o desempenho do classificador Khomp gerenciando atualizações de licenças e implantando novos servidores dedicados para escalar o recurso."
        ],
        "devops": [
          "Otimizei o processo de deploy da aplicação desenvolvendo scripts de autoinstalação de dependências e modernizando o sistema operacional base.",
          "Escalei capacidade de um serviço de classificação implantando e configurando novos servidores dedicados.",
          "Atuei em suporte N3, depurando incidentes críticos de arquitetura e performance em produção."
        ],
        "qa": [
          "Gerenciei e comparei dois sistemas distintos de classificação de chamadas, avaliando acurácia e comportamento de cada um em produção.",
          "Atuei em suporte N3, reproduzindo e isolando defeitos críticos de arquitetura e performance."
        ]
      }
    }
  ],

  "projetos": [
    {
      "id": "rpa",
      "nome": "Motor de Automação Autônoma de Interação Web (RPA)",
      "contexto": "projeto próprio",
      "periodo": "06/2026 - atual",
      "bullets": {
        "base": [
          "Projetei um motor genérico de Automação de Processos (RPA) em Node.js e Puppeteer que opera portais web de forma autônoma e não supervisionada: adaptadores por site sobre um núcleo compartilhado, motor de regras próprio, preenchimento de formulários dinâmicos, detecção de página e de estado de sessão com re-login automático, controle de ritmo por ação e trava de concorrência entre execuções.",
          "Implementei camada de decisão por Inteligência Artificial (IA) com cadeia de fallback entre provedores sobre dois formatos de API distintos, degradando para regra determinística quando todos falham.",
          "Persistência em Prisma/SQLite, painel web de operação e evidência auditável por captura de tela a cada etapa. Suíte de 716 testes automatizados."
        ]
      }
    }
  ],

  "formacao": [
    { "curso": "Pós-Graduação em Data Warehouse e Business Intelligence", "instituicao": "UniBF Centro Universitário", "periodo": "2025 - atual" },
    { "curso": "Bacharelado em Ciências de Inteligência Artificial", "instituicao": "UniBF Centro Universitário", "periodo": "2025 - atual" },
    { "curso": "Pós-Graduação (Especialização) em Banco de Dados", "instituicao": "Faculdade Play", "periodo": "2020 - 2024" },
    { "curso": "Bacharelado em Sistemas de Informação", "instituicao": "ESAB - Escola Superior Aberta do Brasil", "periodo": "2016 - 2020" },
    { "curso": "Gestão da Tecnologia da Informação", "instituicao": "Faculdade Sumaré", "periodo": "2009 - 2012" }
  ],

  "certificacoes": [
    "Digium Certified Asterisk Administrator (dCAA) - Sangoma University (2019)",
    "Asterisk Certified Essentials (ACE) - Sangoma University (2021)",
    "FreePBX Certified Essentials - Sangoma University (2022)",
    "LPIC-1 - Linux Professional Institute (2016)",
    "Red Hat Certified System Administrator (RHCSA) (2022)",
    "VoIP e Telefonia: Asterisk SCF (Advanced), OpenSIPS, Issabel PBX, Elastix, FusionPBX, SIP Foundations",
    "Linux e DevOps: LPIC-2, LPIC-3, DevOps Foundation, Docker, Zabbix, Bacula, Nagios",
    "Cloud e Infraestrutura: OpenStack Infrastructure, AWS Foundations, Mikrotik",
    "Segurança e Redes: Penetration Testing (4Linux), pfSense, ModSecurity, Linux Security, Squid Proxy",
    "Desenvolvimento e Banco de Dados: PHP Full Stack Developer, MySQL Tuning, Apache, Nginx, DNS Bind 9"
  ],

  "idiomas": [
    "Português: nativo / fluente",
    "Italiano: fluente (proficiência profissional)",
    "Espanhol: avançado",
    "Inglês: intermediário (foco em leitura técnica)"
  ]
}
```

Completar `experiencia` com os 11 empregos restantes e `projetos` com os 6
restantes. O `base` de cada um é **o texto atual do `cv/cv.txt`, copiado sem
alteração** — está tudo lá, seção `EXPERIÊNCIA PROFISSIONAL` e `PROJETOS
FREELANCE / PORTFÓLIO TÉCNICO`.

Variantes só onde o ângulo realmente muda. Esta tabela diz quais escrever, para
não sobrar dúvida nem trabalho desnecessário:

| Item | Variantes a escrever | Ângulo de cada uma |
|---|---|---|
| `akiva` | `devops`, `qa` | deploy e escala; comparação de dois classificadores |
| `onvox` | `dev`, `devops`, `ia`, `dados` | solução Python; IaaS com K8s; IA de caixa postal; billing |
| `open-new` | `devops`, `seguranca`, `qa` | observabilidade e DR; análise de incidente; reprodução de defeito N3 |
| `ip-telecom` | `devops` | uptime 99,99% e provisionamento padronizado |
| `tw-solutions` | `dev`, `devops`, `dados`, `rpa`, `qa` | APIs REST 1M eventos; cluster horizontal; pipeline de eventos; integração; liderança de squad e CI/CD |
| `55pbx` | `dev`, `rpa`, `ia` | microsserviços Node; appliance de roteamento e integração Teams; URA com TTS/STT e ASR |
| `elev` | `dev`, `frontend`, `dados`, `qa`, `rpa` | backend completo; frontend Angular; integração Power BI; liderança técnica de 11 devs |
| `tld` | `dados`, `frontend`, `ia`, `rpa` | BI e dashboards em 25 empresas; chatbot de voz |
| `sothis` | `devops`, `dev`, `rpa`, `qa` | nuvem e 400 servidores; chatbot Asterisk/Node |
| `ez-security` | `seguranca`, `devops`, `rpa` | monitoramento de aplicação de segurança e ticket automático |
| `e-prepag` | `seguranca`, `devops` | WAF/OWASP, SOC com Fail2ban, plano de DR |
| `all-net` | *(nenhuma — só `base`)* | suporte N3, sem ângulo específico |

Para os projetos, `base` já serve a quase todos; escreva variante apenas em:

| Projeto | Variantes | Ângulo |
|---|---|---|
| `analise-audio` | `ia`, `dados`, `qa`, `dev` | IA local e avaliação de modelos; DSP e métricas; 121 testes; Flask multi-tenant |
| `omnichannel` | `dev`, `frontend`, `rpa`, `ia`, `qa` | Laravel e Strategy; React 18/TS e WebRTC; 5 integrações; jobs de IA; 23 suítes |
| `rpa` | `dev`, `qa`, `ia` | Node/Puppeteer e Prisma; 716 testes; cadeia multi-provedor |
| `discador` | `dev`, `devops`, `dados`, `frontend` | Flask e engine de IVR; LXC/Docker e Proxmox; 17 tabelas; editor React |
| `painel-git` | `seguranca`, `devops`, `dev` | AES/HMAC/desafio SSH; CI/CD; WebDAV do zero |
| `sipproxy` | `devops`, `qa` | containerização e migrations; 13 cenários SIPp |
| `pedagio` | `seguranca`, `dev` | AES/RSA e normas ISO; FastAPI e três serializadores |

- [ ] **Passo 4: Rodar e confirmar que passa**

```bash
node --test ferramentas/lib/mestre.test.js
```

Esperado: `# pass 7  # fail 0`

- [ ] **Passo 5: Commit**

```bash
git add cv/mestre.json ferramentas/lib/mestre.test.js
git commit -m "Conteúdo do currículo migrado para o mestre

Todo o texto passa a viver em cv/mestre.json, com os fatos escritos uma vez só
e as variantes de redação ao lado do item que descrevem. A base de cada item é
a voz VoIP, porque é assim que o currículo já estava escrito — os outros oito
perfis sobrescrevem.

Os testes guardam contra o que dá errado numa migração: emprego perdido no
caminho, id repetido, item sem bullets.base, data fora do formato, e a regra de
ATS de escrever a sigla junto da forma expandida."
```

---

## Task 6: As nove receitas de perfil

**Files:**
- Create: `perfis/voip.json`, `perfis/ia.json`, `perfis/dev.json`, `perfis/frontend.json`, `perfis/devops.json`, `perfis/dados.json`, `perfis/seguranca.json`, `perfis/qa.json`, `perfis/rpa.json`
- Create: `ferramentas/lib/perfis.test.js`

**Interfaces:**
- Consome: `montarCv` e `validarReceita` da Task 2, `cv/mestre.json` da Task 5
- Produz: nove receitas conforme o formato da Task 2

- [ ] **Passo 1: Escrever o teste que falha**

Criar `ferramentas/lib/perfis.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { montarCv, validarReceita } = require('./montar-cv');

const RAIZ = path.join(__dirname, '..', '..');
const MESTRE = JSON.parse(fs.readFileSync(path.join(RAIZ, 'cv', 'mestre.json'), 'utf8'));
const IDS = ['voip', 'ia', 'dev', 'frontend', 'devops', 'dados', 'seguranca', 'qa', 'rpa'];

function lerReceita(id) {
  return JSON.parse(fs.readFileSync(path.join(RAIZ, 'perfis', `${id}.json`), 'utf8'));
}

test('as nove receitas existem e são válidas', () => {
  for (const id of IDS) {
    const receita = lerReceita(id);
    assert.equal(receita.id, id, `perfis/${id}.json declara id "${receita.id}"`);
    assert.ok(receita.titulo, `perfis/${id}.json sem título`);
    validarReceita(receita);
  }
});

test('exatamente um perfil é o padrão', () => {
  const padroes = IDS.filter(id => lerReceita(id).padrao === true);
  assert.equal(padroes.length, 1, `perfis marcados como padrão: ${padroes.join(', ') || 'nenhum'}`);
});

test('toda receita monta sem erro contra o mestre', () => {
  for (const id of IDS) {
    assert.doesNotThrow(() => montarCv(MESTRE, lerReceita(id)), `perfil "${id}" não monta`);
  }
});

test('os fatos são idênticos entre todos os perfis', () => {
  // O motivo de existir um mestre: duas versões que se contradizem em datas
  // parecem pior que um currículo genérico.
  const fatosPorPerfil = IDS.map(id => {
    const cv = montarCv(MESTRE, lerReceita(id));
    const exp = cv.secoes.find(s => s.tipo === 'experiencia');
    const mapa = new Map();
    for (const item of (exp ? exp.itens : [])) {
      mapa.set(item.empresa, `${item.cargo}|${item.periodo}|${item.local}`);
    }
    return { id, mapa };
  });

  const referencia = new Map();
  for (const { mapa } of fatosPorPerfil) {
    for (const [empresa, fatos] of mapa) {
      if (!referencia.has(empresa)) referencia.set(empresa, fatos);
    }
  }
  for (const { id, mapa } of fatosPorPerfil) {
    for (const [empresa, fatos] of mapa) {
      assert.equal(fatos, referencia.get(empresa),
        `perfil "${id}" diverge nos fatos de "${empresa}"`);
    }
  }
});

test('todo perfil inclui pelo menos três empregos e um projeto', () => {
  for (const id of IDS) {
    const receita = lerReceita(id);
    assert.ok((receita.incluir_experiencia || []).length >= 3, `perfil "${id}" com poucos empregos`);
    assert.ok((receita.incluir_projetos || []).length >= 1, `perfil "${id}" sem projetos`);
  }
});
```

- [ ] **Passo 2: Rodar e confirmar que falha**

```bash
node --test ferramentas/lib/perfis.test.js
```

Esperado: FALHA com `ENOENT ... perfis/voip.json`.

- [ ] **Passo 3: Escrever as nove receitas**

`perfis/voip.json` — a base do mestre, sem sobrescrita:

```json
{
  "id": "voip",
  "titulo": "Arquiteto de Soluções VoIP Sênior",
  "padrao": false,
  "ordem": ["resumo", "conquistas", "competencias", "experiencia", "projetos", "formacao", "certificacoes", "idiomas"],
  "competencias": ["voip", "cloud", "desenvolvimento", "seguranca"],
  "incluir_conquistas": ["onboarding", "campanha", "uptime", "mttd"],
  "incluir_experiencia": ["akiva", "onvox", "open-new", "ip-telecom", "tw-solutions", "55pbx", "elev", "tld", "sothis", "ez-security", "e-prepag", "all-net"],
  "incluir_projetos": ["discador", "sipproxy", "analise-audio", "omnichannel", "pedagio"],
  "filtro_termos": ["voip", "asterisk", "kamailio", "opensips", "sip", "pabx", "pbx", "telefonia", "telecom", "call center", "ura", "freeswitch"]
}
```

`perfis/dev.json` — projetos antes da experiência, porque o portfólio é o
argumento mais forte para desenvolvimento:

```json
{
  "id": "dev",
  "titulo": "Desenvolvedor Backend Sênior",
  "padrao": true,
  "ordem": ["resumo", "competencias", "projetos", "experiencia", "formacao", "certificacoes", "idiomas"],
  "competencias": ["desenvolvimento", "frontend", "python", "ia-llm", "cloud", "qa"],
  "incluir_conquistas": [],
  "incluir_experiencia": ["tw-solutions", "elev", "55pbx", "tld", "onvox", "akiva", "sothis"],
  "incluir_projetos": ["omnichannel", "rpa", "discador", "analise-audio", "pedagio", "painel-git"],
  "categorias_alvo": ["Desenvolvedor", "Engenheiro de Software"]
}
```

`perfis/frontend.json`:

```json
{
  "id": "frontend",
  "titulo": "Desenvolvedor Frontend Sênior",
  "padrao": false,
  "ordem": ["resumo", "competencias", "projetos", "experiencia", "formacao", "certificacoes", "idiomas"],
  "competencias": ["frontend", "desenvolvimento", "qa", "cloud"],
  "incluir_conquistas": [],
  "incluir_experiencia": ["elev", "tw-solutions", "55pbx", "tld"],
  "incluir_projetos": ["omnichannel", "discador", "analise-audio", "painel-git"],
  "filtro_termos": ["front-end", "frontend", "react", "angular", "vue", "javascript", "typescript", "css", "html", "next.js", "tailwind", "ui", "ux"]
}
```

`perfis/ia.json`:

```json
{
  "id": "ia",
  "titulo": "Engenheiro de Inteligência Artificial (IA) Sênior",
  "padrao": false,
  "ordem": ["resumo", "conquistas", "competencias", "projetos", "experiencia", "formacao", "certificacoes", "idiomas"],
  "competencias": ["ia-llm", "python", "sinais", "desenvolvimento", "dados"],
  "incluir_conquistas": ["campanha"],
  "incluir_experiencia": ["onvox", "tw-solutions", "55pbx", "elev", "tld"],
  "incluir_projetos": ["analise-audio", "rpa", "omnichannel", "discador"],
  "filtro_termos": ["inteligência artificial", "ia generativa", "machine learning", "llm", "deep learning", "redes neurais", "data science", "nlp", "agentes de ia", "rag", "prompt"]
}
```

`perfis/devops.json` — experiência antes de projetos, porque o histórico
corporativo de SRE é o argumento mais forte:

```json
{
  "id": "devops",
  "titulo": "Engenheiro DevOps / SRE Sênior",
  "padrao": false,
  "ordem": ["resumo", "conquistas", "competencias", "experiencia", "projetos", "formacao", "certificacoes", "idiomas"],
  "competencias": ["cloud", "seguranca", "python", "desenvolvimento"],
  "incluir_conquistas": ["mttd", "uptime", "onboarding"],
  "incluir_experiencia": ["open-new", "onvox", "ip-telecom", "tw-solutions", "sothis", "e-prepag", "ez-security", "all-net"],
  "incluir_projetos": ["discador", "sipproxy", "painel-git", "analise-audio"],
  "categorias_alvo": ["DevOps", "Analista de Sistemas"]
}
```

`perfis/dados.json`:

```json
{
  "id": "dados",
  "titulo": "Engenheiro de Dados / Business Intelligence",
  "padrao": false,
  "ordem": ["resumo", "competencias", "experiencia", "projetos", "formacao", "certificacoes", "idiomas"],
  "competencias": ["dados", "python", "ia-llm", "desenvolvimento", "cloud"],
  "incluir_conquistas": [],
  "incluir_experiencia": ["tld", "elev", "tw-solutions", "onvox", "open-new"],
  "incluir_projetos": ["analise-audio", "discador", "omnichannel", "rpa"],
  "categorias_alvo": ["Analista de Dados"]
}
```

`perfis/seguranca.json`:

```json
{
  "id": "seguranca",
  "titulo": "Analista de Segurança da Informação Sênior",
  "padrao": false,
  "ordem": ["resumo", "conquistas", "competencias", "experiencia", "projetos", "formacao", "certificacoes", "idiomas"],
  "competencias": ["seguranca", "cloud", "desenvolvimento", "python"],
  "incluir_conquistas": ["mttd", "uptime"],
  "incluir_experiencia": ["e-prepag", "ez-security", "open-new", "sothis", "tw-solutions", "all-net"],
  "incluir_projetos": ["painel-git", "pedagio", "sipproxy", "analise-audio"],
  "categorias_alvo": ["Segurança da Informação"]
}
```

`perfis/qa.json`:

```json
{
  "id": "qa",
  "titulo": "Analista de QA / Automação de Testes Sênior",
  "padrao": false,
  "ordem": ["resumo", "competencias", "projetos", "experiencia", "formacao", "certificacoes", "idiomas"],
  "competencias": ["qa", "desenvolvimento", "python", "cloud"],
  "incluir_conquistas": [],
  "incluir_experiencia": ["akiva", "open-new", "tw-solutions", "elev", "sothis"],
  "incluir_projetos": ["rpa", "analise-audio", "sipproxy", "discador"],
  "categorias_alvo": ["QA"]
}
```

`perfis/rpa.json` — o resumo e os bullets precisam nomear "automação de
processos" explicitamente, que é o termo pedido em 10 das 15 vagas do alvo:

```json
{
  "id": "rpa",
  "titulo": "Especialista em Automação de Processos (RPA) e Integração",
  "padrao": false,
  "ordem": ["resumo", "conquistas", "competencias", "projetos", "experiencia", "formacao", "certificacoes", "idiomas"],
  "competencias": ["desenvolvimento", "python", "ia-llm", "qa", "cloud"],
  "incluir_conquistas": ["campanha"],
  "incluir_experiencia": ["tw-solutions", "55pbx", "elev", "tld", "sothis", "ez-security"],
  "incluir_projetos": ["rpa", "omnichannel", "discador", "analise-audio"],
  "filtro_termos": ["rpa", "uipath", "power automate", "blue prism", "automation anywhere", "robotic process", "automação de processos", "automação"]
}
```

- [ ] **Passo 4: Rodar e confirmar que passa**

```bash
node --test ferramentas/lib/perfis.test.js
```

Esperado: `# pass 5  # fail 0`

- [ ] **Passo 5: Commit**

```bash
git add perfis/ ferramentas/lib/perfis.test.js
git commit -m "As nove receitas de perfil

Cada receita só seleciona e ordena: título, ordem das seções, quais itens
entram e contra o que medir. Nenhuma frase de currículo — o texto todo mora no
mestre.

A ordem das seções muda por perfil de propósito: dev, frontend, IA, QA e RPA
abrem com projetos, porque o portfólio autoral é o argumento mais forte nessas
áreas; VoIP, DevOps e segurança abrem com experiência, porque ali o histórico
corporativo pesa mais.

Um teste compara os fatos de todos os perfis entre si e falha se cargo, período
ou local divergirem para a mesma empresa — que é o risco real de manter nove
versões e o motivo de existir um mestre."
```

---

## Task 7: Gerador

**Files:**
- Create: `ferramentas/gerar-cv.js`
- Modify: `package.json` (script `gerar`)

**Interfaces:**
- Consome: `montarCv` (Task 2), `renderTxt` (Task 3), `renderHtml` (Task 4), `cv/mestre.json` (Task 5), `perfis/*.json` (Task 6)
- Produz: `cv/<perfil>/cv.txt` e `cv/<perfil>/cv.html` para os nove perfis

- [ ] **Passo 1: Implementar o gerador**

Criar `ferramentas/gerar-cv.js`:

```js
/**
 * gerar-cv.js — Gera os currículos de todos os perfis.
 *
 * Combina `cv/mestre.json` com cada receita em `perfis/*.json` e escreve
 * `cv/<perfil>/cv.txt` e `cv/<perfil>/cv.html`.
 *
 * NENHUM arquivo em `cv/<perfil>/` deve ser editado à mão: são derivados e a
 * próxima execução sobrescreve. Para mudar o currículo, mude o mestre.
 *
 * Uso: node ferramentas/gerar-cv.js [--perfil=dev]
 */

const fs = require('node:fs');
const path = require('node:path');
const { montarCv } = require('./lib/montar-cv');
const { renderTxt } = require('./lib/render-txt');
const { renderHtml } = require('./lib/render-html');

const RAIZ = path.join(__dirname, '..');
const DIR_PERFIS = path.join(RAIZ, 'perfis');
const DIR_CV = path.join(RAIZ, 'cv');

function lerJson(caminho) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (err) {
    console.error(`[gerar-cv] Não consegui ler ${path.relative(RAIZ, caminho)}: ${err.message}`);
    process.exit(1);
  }
}

function argumentoPerfil() {
  const arg = process.argv.find(a => a.startsWith('--perfil='));
  return arg ? arg.split('=')[1] : null;
}

function main() {
  const mestre = lerJson(path.join(DIR_CV, 'mestre.json'));

  const filtro = argumentoPerfil();
  const arquivos = fs.readdirSync(DIR_PERFIS).filter(f => f.endsWith('.json'));
  const receitas = arquivos
    .map(f => lerJson(path.join(DIR_PERFIS, f)))
    .filter(r => !filtro || r.id === filtro);

  if (receitas.length === 0) {
    console.error(`[gerar-cv] Nenhum perfil${filtro ? ` com id "${filtro}"` : ''} encontrado em perfis/.`);
    process.exit(1);
  }

  // Exatamente um perfil vai para os bots de candidatura; dois padrões
  // significaria escolher em silêncio, e zero deixaria os bots com CV velho.
  if (!filtro) {
    const padroes = receitas.filter(r => r.padrao === true).map(r => r.id);
    if (padroes.length !== 1) {
      console.error(`[gerar-cv] Deve haver exatamente um perfil com "padrao": true. Encontrados: ${padroes.join(', ') || 'nenhum'}`);
      process.exit(1);
    }
  }

  let padraoGerado = null;
  for (const receita of receitas) {
    let cv;
    try {
      cv = montarCv(mestre, receita);
    } catch (err) {
      console.error(`[gerar-cv] Perfil "${receita.id}": ${err.message}`);
      process.exit(1);
    }

    const destino = path.join(DIR_CV, receita.id);
    fs.mkdirSync(destino, { recursive: true });
    fs.writeFileSync(path.join(destino, 'cv.txt'), renderTxt(cv));
    fs.writeFileSync(path.join(destino, 'cv.html'), renderHtml(cv));

    const secoes = cv.secoes.length;
    console.log(`[gerar-cv] ${receita.id.padEnd(10)} ${secoes} seções  →  cv/${receita.id}/`);
    if (receita.padrao) padraoGerado = receita.id;
  }

  console.log(`\n[gerar-cv] ${receitas.length} perfil(is), ${receitas.length * 2} arquivo(s).`);

  if (padraoGerado) {
    console.log(`\nPerfil padrão: ${padraoGerado}. Para sincronizar com os bots de candidatura:`);
    console.log(`  cp cv/${padraoGerado}/cv.txt ../vagas-automation-suite/bots/infojobs/cv.txt`);
    console.log(`  cp cv/${padraoGerado}/cv.txt ../vagas-automation-suite/bots/vagas/cv.txt`);
  }
}

main();
```

- [ ] **Passo 2: Rodar o gerador**

```bash
cd /home/carlos/ide/curriculo
node ferramentas/gerar-cv.js
```

Esperado: nove linhas de perfil e `[gerar-cv] 9 perfil(is), 18 arquivo(s).`

- [ ] **Passo 3: Conferir uma saída à mão**

```bash
head -20 cv/dev/cv.txt
```

Esperado: nome em caixa alta, título `Desenvolvedor Backend Sênior`, contato, e `RESUMO PROFISSIONAL`.

- [ ] **Passo 4: Acrescentar o script ao package.json**

Em `package.json`, dentro de `"scripts"`:

```json
    "gerar": "node ferramentas/gerar-cv.js",
```

- [ ] **Passo 5: Rodar a suíte inteira**

```bash
node --test 'ferramentas/**/*.test.js'
```

Esperado: `# fail 0`

- [ ] **Passo 6: Commit**

```bash
git add ferramentas/gerar-cv.js package.json cv/
git commit -m "Gerador dos currículos de todos os perfis

Combina o mestre com cada receita e escreve cv/<perfil>/cv.txt e cv.html. Os
arquivos gerados são derivados e a próxima execução sobrescreve — para mudar o
currículo, muda-se o mestre.

Aborta se não houver exatamente um perfil marcado como padrão: dois seria
escolher em silêncio qual vai para os bots de candidatura, zero deixaria os
bots com a versão velha. Ao final imprime o comando de cópia, sem escrever em
outro repositório por conta própria."
```

---

## Task 8: Aderência por perfil

**Files:**
- Create: `ferramentas/lib/selecionar-vagas.js`
- Create: `ferramentas/lib/selecionar-vagas.test.js`
- Modify: `ferramentas/aderencia.js`

**Interfaces:**
- Consome: `termoBateNoTexto` de `lib/texto.js`, receitas da Task 6
- Produz: `selecionarVagas(vagas, receita) -> {vagas: object[], descricaoAlvo: string}`

- [ ] **Passo 1: Escrever os testes que falham**

Criar `ferramentas/lib/selecionar-vagas.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { selecionarVagas } = require('./selecionar-vagas');

const VAGAS = [
  { titulo: 'Dev Node', categoria: 'Desenvolvedor', requisitos: 'Node.js e React' },
  { titulo: 'SRE', categoria: 'DevOps', requisitos: 'Kubernetes' },
  { titulo: 'Analista RPA', categoria: 'Analista de Sistemas', requisitos: 'Automação de processos com UiPath' },
  { titulo: 'Contador', categoria: 'Contabilidade', requisitos: 'Negócios e benefícios' },
  { titulo: 'Sem requisito', categoria: 'Desenvolvedor', requisitos: '' },
];

test('seleciona por categoria quando a receita usa categorias_alvo', () => {
  const { vagas } = selecionarVagas(VAGAS, { id: 'dev', categorias_alvo: ['Desenvolvedor'] });
  assert.equal(vagas.length, 1);
  assert.equal(vagas[0].titulo, 'Dev Node');
});

test('descarta vaga sem requisitos, que não dá para medir', () => {
  const { vagas } = selecionarVagas(VAGAS, { id: 'dev', categorias_alvo: ['Desenvolvedor'] });
  assert.ok(!vagas.some(v => v.titulo === 'Sem requisito'));
});

test('seleciona por termo quando a receita usa filtro_termos', () => {
  const { vagas } = selecionarVagas(VAGAS, { id: 'rpa', filtro_termos: ['uipath', 'rpa'] });
  assert.equal(vagas.length, 1);
  assert.equal(vagas[0].titulo, 'Analista RPA');
});

test('o filtro por termo usa fronteira de palavra, nunca substring', () => {
  // "ios" por substring casa dentro de "negócios" e "benefícios" — medido na
  // prática, isso inflou um alvo de 6 para 929 vagas.
  const { vagas } = selecionarVagas(VAGAS, { id: 'mobile', filtro_termos: ['ios'] });
  assert.equal(vagas.length, 0, 'casou substring dentro de outra palavra');
});

test('descreve o alvo de forma legível', () => {
  const porCategoria = selecionarVagas(VAGAS, { id: 'dev', categorias_alvo: ['Desenvolvedor', 'QA'] });
  assert.match(porCategoria.descricaoAlvo, /Desenvolvedor, QA/);

  const porTermo = selecionarVagas(VAGAS, { id: 'rpa', filtro_termos: ['uipath'] });
  assert.match(porTermo.descricaoAlvo, /termo/i);
});
```

- [ ] **Passo 2: Rodar e confirmar que falha**

```bash
node --test ferramentas/lib/selecionar-vagas.test.js
```

Esperado: FALHA com `Cannot find module './selecionar-vagas'`.

- [ ] **Passo 3: Implementar**

Criar `ferramentas/lib/selecionar-vagas.js`:

```js
/**
 * selecionar-vagas.js — Escolhe quais vagas medir para um perfil.
 *
 * Duas formas, mutuamente exclusivas (validadas em montar-cv.js):
 *   - `categorias_alvo`: a área é uma das categorias coletadas;
 *   - `filtro_termos`: a área não é categoria (IA, RPA, frontend, VoIP) e a
 *     seleção é por termo no texto da vaga.
 *
 * O casamento de termo usa FRONTEIRA DE PALAVRA, nunca substring. Medido na
 * prática: buscar "ios" por substring casou 929 vagas, batendo dentro de
 * "negócios", "benefícios" e "relatórios" — número que parece dado e não é.
 */

const { termoBateNoTexto } = require('./texto');

/** Texto onde procurar os termos de um perfil. */
function textoDaVaga(vaga) {
  return `${vaga.titulo || ''} ${vaga.requisitos || ''} ${vaga.descricaoResumo || ''}`.toLowerCase();
}

/**
 * @param {object[]} vagas snapshot completo
 * @param {object} receita perfil com `categorias_alvo` ou `filtro_termos`
 * @returns {{vagas: object[], descricaoAlvo: string}}
 */
function selecionarVagas(vagas, receita) {
  // Vaga sem requisitos não tem o que medir: incluí-la só distorce a média.
  const comRequisitos = vagas.filter(v => v.requisitos);

  if (receita.categorias_alvo && receita.categorias_alvo.length) {
    return {
      vagas: comRequisitos.filter(v => receita.categorias_alvo.includes(v.categoria)),
      descricaoAlvo: `categorias: ${receita.categorias_alvo.join(', ')}`,
    };
  }

  const termos = receita.filtro_termos || [];
  return {
    vagas: comRequisitos.filter(vaga => {
      const texto = textoDaVaga(vaga);
      return termos.some(termo => termoBateNoTexto(termo.toLowerCase(), texto));
    }),
    descricaoAlvo: `termo em: ${termos.join(', ')}`,
  };
}

module.exports = { selecionarVagas };
```

- [ ] **Passo 4: Rodar e confirmar que passa**

```bash
node --test ferramentas/lib/selecionar-vagas.test.js
```

Esperado: `# pass 5  # fail 0`

- [ ] **Passo 5: Acrescentar `--perfil` ao aderencia.js**

Substituir o conteúdo de `ferramentas/aderencia.js` por:

```js
/**
 * aderencia.js — Compara um currículo deste repositório com as vagas do
 * mercado já coletadas, e responde duas perguntas: "quais vagas batem melhor
 * com o que eu tenho?" e, principalmente, "o que o mercado pede que ainda não
 * está no meu currículo?".
 *
 * AUTOCONTIDO: as vagas vêm de um snapshot JSON commitado, e os módulos usados
 * são regex e vocabulário puro. Clonou, roda — sem npm install, banco, chave de
 * API ou rede. Requer Node.js 18+.
 *
 *   node ferramentas/aderencia.js                # currículo genérico
 *   node ferramentas/aderencia.js --perfil=dev   # um perfil, contra o alvo dele
 */

const fs = require('node:fs');
const path = require('node:path');
const {
  termosNoTexto, avaliarVaga, montarRankingTermos,
  calcularAderenciaMedia, montarRelatorioMarkdown,
} = require('./lib/aderencia');
const { selecionarVagas } = require('./lib/selecionar-vagas');

const RAIZ = path.join(__dirname, '..');
const CAMINHO_VAGAS = path.join(RAIZ, 'dados', 'vagas-coletadas.json');
const DIR_SAIDA = path.join(RAIZ, 'aderencia');

const CATEGORIAS_GENERICAS = [
  'Desenvolvedor', 'DevOps', 'Suporte Técnico', 'Segurança da Informação',
  'Analista de Sistemas', 'Engenheiro de Software', 'QA', 'Analista de Dados',
];

function lerObrigatorio(caminho, oQueE) {
  try {
    return fs.readFileSync(caminho, 'utf8');
  } catch {
    console.error(`[Aderência] ${oQueE} não encontrado em ${path.relative(RAIZ, caminho)} — abortando.`);
    process.exit(1);
  }
}

function argumentoPerfil() {
  const arg = process.argv.find(a => a.startsWith('--perfil='));
  return arg ? arg.split('=')[1] : null;
}

/** Resolve de onde ler o CV e quais vagas medir, com ou sem perfil. */
function resolverAlvo(perfilId, vagas) {
  if (!perfilId) {
    return {
      caminhoCv: path.join(RAIZ, 'cv', 'cv.txt'),
      rotulo: 'genérico',
      ...selecionarVagas(vagas, { id: 'generico', categorias_alvo: CATEGORIAS_GENERICAS }),
    };
  }
  const caminhoReceita = path.join(RAIZ, 'perfis', `${perfilId}.json`);
  const receita = JSON.parse(lerObrigatorio(caminhoReceita, `Perfil "${perfilId}"`));
  return {
    caminhoCv: path.join(RAIZ, 'cv', perfilId, 'cv.txt'),
    rotulo: perfilId,
    ...selecionarVagas(vagas, receita),
  };
}

function main() {
  const perfilId = argumentoPerfil();
  const vagas = JSON.parse(lerObrigatorio(CAMINHO_VAGAS, 'Snapshot de vagas'));
  const alvo = resolverAlvo(perfilId, vagas);

  const cvText = lerObrigatorio(alvo.caminhoCv, `CV do perfil "${alvo.rotulo}"`);
  const cvTermos = termosNoTexto(cvText);

  // "Nenhuma vaga no alvo" NÃO é 0% de aderência: uma coisa é o currículo não
  // falar a língua do mercado, outra é não haver mercado medido. Imprimir 0%
  // aqui produziria a conclusão oposta à verdadeira.
  if (alvo.vagas.length === 0) {
    console.error(`[Aderência] Perfil "${alvo.rotulo}": nenhuma vaga no alvo (${alvo.descricaoAlvo}).`);
    console.error('[Aderência] Isso NÃO significa aderência zero — significa que o alvo não foi coletado.');
    console.error('[Aderência] Nenhum relatório gravado. Colete vagas dessa área antes de medir.');
    process.exit(2);
  }

  console.log(`[Aderência] Perfil "${alvo.rotulo}" — ${alvo.vagas.length} vaga(s) no alvo (${alvo.descricaoAlvo}).\n`);

  const avaliacoes = alvo.vagas.map(vaga => avaliarVaga(vaga, cvTermos));
  const rankingTermos = montarRankingTermos(avaliacoes, cvTermos);
  const aderenciaMedia = calcularAderenciaMedia(avaliacoes);

  console.log(`Termos do vocabulário encontrados no CV: ${cvTermos.length}`);
  console.log(`Aderência média: ${aderenciaMedia !== null ? aderenciaMedia + '%' : 'não calculável'}\n`);
  console.log('Top termos pedidos pelo mercado que NÃO estão neste CV:');
  const lacunas = rankingTermos.filter(t => !t.noCv).slice(0, 10);
  if (lacunas.length === 0) console.log('  (nenhuma lacuna)');
  else lacunas.forEach(t => console.log(`  - ${t.termo} (${t.vagas} vaga(s))`));

  const dataHoje = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(DIR_SAIDA, { recursive: true });
  const nome = perfilId ? `${dataHoje}-aderencia-${perfilId}.md` : `${dataHoje}-aderencia-cv.md`;
  const arquivoSaida = path.join(DIR_SAIDA, nome);
  fs.writeFileSync(arquivoSaida, montarRelatorioMarkdown(avaliacoes, rankingTermos, dataHoje));
  console.log(`\n[Aderência] Relatório salvo em ${path.relative(RAIZ, arquivoSaida)}`);
}

main();
```

- [ ] **Passo 6: Verificar os três comportamentos**

```bash
node ferramentas/aderencia.js --perfil=dev
node ferramentas/aderencia.js --perfil=voip; echo "código de saída: $?"
node ferramentas/aderencia.js
```

Esperado: `dev` imprime percentual e grava relatório; `voip` imprime o aviso de
alvo não coletado e sai com código `2`, sem gravar; sem argumento, comportamento
genérico preservado.

- [ ] **Passo 7: Commit**

```bash
git add ferramentas/lib/selecionar-vagas.js ferramentas/lib/selecionar-vagas.test.js ferramentas/aderencia.js aderencia/
git commit -m "Aderência por perfil, com fronteira de palavra e alvo vazio tratado

A ferramenta ganha --perfil: lê o CV daquele perfil e seleciona as vagas pelo
alvo declarado na receita, por categoria ou por termo. Sem argumento, o
comportamento genérico é preservado.

Duas regras que a medição obrigou:

O filtro por termo casa com fronteira de palavra, nunca substring — buscar
'ios' por substring casou 929 vagas ao bater dentro de 'negócios' e
'benefícios', número que parece dado e não é.

Alvo sem nenhuma vaga encerra com aviso e código 2, sem gravar relatório e sem
imprimir percentual. Uma coisa é o currículo não falar a língua do mercado,
outra é não haver mercado medido — e hoje o perfil voip é exatamente o segundo
caso, com zero vagas de telecom coletadas."
```

---

## Task 9: Medição dos nove perfis e documentação

**Files:**
- Create: `aderencia/2026-07-30-comparativo-perfis.md`
- Modify: `README.md`

**Interfaces:**
- Consome: tudo das tarefas anteriores

- [ ] **Passo 1: Medir os oito perfis mensuráveis**

```bash
cd /home/carlos/ide/curriculo
for p in ia dev frontend devops dados seguranca qa rpa; do
  echo "===== $p ====="
  node ferramentas/aderencia.js --perfil=$p 2>&1 | grep -E "vaga\(s\) no alvo|Aderência média"
done
node ferramentas/aderencia.js --perfil=voip; echo "voip saiu com $?"
```

Anotar cada percentual. `voip` deve sair com código 2.

- [ ] **Passo 2: Escrever o comparativo**

Criar `aderencia/2026-07-30-comparativo-perfis.md` com uma tabela de
`perfil | vagas no alvo | linha de base (CV genérico) | perfil focado | ganho`,
usando as linhas de base do spec:

| Perfil | Linha de base |
|---|---|
| ia | 60% |
| dev | 50% / 48% |
| frontend | 56% |
| devops | 52% / 43% |
| dados | 64% |
| seguranca | 27% |
| qa | 42% |
| rpa | 38% |
| voip | não mensurável |

Incluir, por escrito, quais perfis **não** superaram a linha de base e a
hipótese do porquê — um perfil que piora é informação, não fracasso a esconder.

- [ ] **Passo 3: Atualizar o README**

Substituir a seção "Estrutura" e acrescentar uma seção de uso:

```markdown
## Rodando depois do clone

Sem `npm install`, banco, chave de API ou rede. Só Node.js 18+:

```bash
node ferramentas/gerar-cv.js            # gera os 9 currículos
node ferramentas/aderencia.js --perfil=dev   # mede um perfil
node --test 'ferramentas/**/*.test.js'  # roda os testes
```

## Os nove perfis

| Perfil | Título | Alvo de medição |
|---|---|---|
| `voip` | Arquiteto de Soluções VoIP Sênior | termo (sem vagas coletadas) |
| `ia` | Engenheiro de Inteligência Artificial (IA) Sênior | termo |
| `dev` | Desenvolvedor Backend Sênior | Desenvolvedor, Eng. de Software |
| `frontend` | Desenvolvedor Frontend Sênior | termo |
| `devops` | Engenheiro DevOps / SRE Sênior | DevOps, Analista de Sistemas |
| `dados` | Engenheiro de Dados / Business Intelligence | Analista de Dados |
| `seguranca` | Analista de Segurança da Informação Sênior | Segurança da Informação |
| `qa` | Analista de QA / Automação de Testes Sênior | QA |
| `rpa` | Especialista em Automação de Processos (RPA) e Integração | termo |

## Como editar o currículo

**Nunca edite `cv/<perfil>/cv.txt` ou `cv.html`** — são gerados e a próxima
execução sobrescreve.

- Texto, fatos e variantes por perfil: `cv/mestre.json`
- Título, ordem das seções e o que incluir: `perfis/<id>.json`
- Vocabulário de termos de mercado: `ferramentas/lib/termos-mercado.js`

Depois de editar, rode `node ferramentas/gerar-cv.js`.
```

- [ ] **Passo 4: Rodar a suíte completa e um clone limpo**

```bash
node --test 'ferramentas/**/*.test.js'
rm -rf /tmp/teste-clone && git clone -q . /tmp/teste-clone
cd /tmp/teste-clone && node ferramentas/gerar-cv.js && node --test 'ferramentas/**/*.test.js'
cd /home/carlos/ide/curriculo && rm -rf /tmp/teste-clone
```

Esperado: `# fail 0` nos dois, e 18 arquivos gerados no clone.

- [ ] **Passo 5: Commit e push**

```bash
git add README.md aderencia/
git commit -m "Comparativo dos nove perfis e documentação de uso

Mede cada perfil contra o alvo dele e compara com a linha de base do currículo
genérico nas mesmas vagas. Registra também os perfis que não superaram a linha
de base e a hipótese do porquê — perfil que piora é informação sobre onde a
lacuna é de conteúdo e não de redação.

O README passa a dizer, em primeiro lugar, o que não fazer: os arquivos em
cv/<perfil>/ são gerados e editá-los à mão é trabalho perdido na próxima
execução."
git push origin master
```

---

## Verificação final

- [ ] `node ferramentas/gerar-cv.js` produz 18 arquivos sem edição manual
- [ ] `node --test 'ferramentas/**/*.test.js'` passa inteiro
- [ ] Fatos idênticos entre os nove perfis (teste da Task 6)
- [ ] Nenhum `cv/<perfil>/cv.html` contém grid, coluna, tabela, imagem ou SVG
- [ ] `--perfil=voip` avisa alvo não coletado e sai com código 2, sem gravar
- [ ] Clone limpo roda sem `npm install`
- [ ] Cada perfil mensurável comparado com sua linha de base, com o resultado
      escrito — inclusive os que pioraram

## Fora deste plano

- Gerar PDF automaticamente (feito no navegador, pelo botão de impressão)
- Coletar vagas de telecom/VoIP para tornar o perfil `voip` mensurável
- Trocar o CV por candidatura nos bots
- Criar contas nas plataformas
