/**
 * parser-cv.js — Extrai do currículo em texto a estrutura que um ATS tentaria
 * reconstruir: contato, seções, empregos com cargo/empresa/período, formação.
 *
 * Por que isso importa: o ATS descarta antes de pontuar. Se ele não consegue
 * achar o e-mail, separar as seções ou entender as datas, o currículo cai na
 * triagem sem nunca ser comparado com a vaga. Por isso este módulo relata com
 * o mesmo destaque o que CONSEGUIU e o que NÃO conseguiu extrair — a lista de
 * `problemas` é a parte acionável.
 *
 * Lógica pura: recebe texto, devolve objeto. Sem disco, sem rede.
 */

const { TITULOS_POR_IDIOMA, PALAVRA_ATUAL } = require('./secoes');

// O currículo pode estar em qualquer idioma que o gerador produz.
const IDIOMAS = Object.values(TITULOS_POR_IDIOMA);
const TITULOS_CANONICOS = new Set(IDIOMAS.flatMap(t => Object.values(t)));
const TITULOS_EXPERIENCIA = new Set(IDIOMAS.map(t => t.experiencia));
const TITULOS_FORMACAO = new Set(IDIOMAS.map(t => t.formacao));
const ATUAL = Object.values(PALAVRA_ATUAL).join('|');

// Uma linha de emprego tem cargo, empresa e período separados por barra.
// É o formato que o render-txt produz e o que um ATS reconhece.
const LINHA_EMPREGO = new RegExp(
  `^(.+?)\\s\\|\\s(.+?)\\s\\|\\s(\\d{2}\\/\\d{4}(?:\\s-\\s(?:\\d{2}\\/\\d{4}|${ATUAL}))?)(?:\\s\\|\\s(.+))?$`,
);
const PERIODO = new RegExp(`^(\\d{2})\\/(\\d{4})(?:\\s-\\s(?:(\\d{2})\\/(\\d{4})|${ATUAL}))?$`);

/** Linhas da primeira seção cujo título está no conjunto (um por idioma). */
function linhasDaSecao(secoes, titulos) {
  const titulo = [...secoes.keys()].find(t => titulos.has(t));
  return titulo ? secoes.get(titulo) : [];
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const TELEFONE = /\+?\d{2}[\s-]?\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}/;

/** Converte "MM/AAAA" em número comparável (AAAA*12 + MM). */
function paraMeses(mes, ano) {
  return Number(ano) * 12 + Number(mes);
}

/**
 * Tempo total de experiência em anos, pela UNIÃO dos períodos.
 *
 * Somar as durações daria número inflado para quem atua em paralelo — que é o
 * caso de quem trabalha como PJ em vários contratos ao mesmo tempo. Um
 * recrutador conta desde o primeiro emprego, não a soma dos contratos.
 */
function anosDeExperiencia(empregos, mesAtual) {
  const intervalos = empregos
    .map(e => e.intervalo)
    .filter(Boolean)
    .sort((a, b) => a.inicio - b.inicio);
  if (intervalos.length === 0) return null;

  let total = 0;
  let inicio = intervalos[0].inicio;
  let fim = intervalos[0].fim ?? mesAtual;
  for (const atual of intervalos.slice(1)) {
    const fimAtual = atual.fim ?? mesAtual;
    if (atual.inicio > fim) {
      total += fim - inicio;
      inicio = atual.inicio;
      fim = fimAtual;
    } else if (fimAtual > fim) {
      fim = fimAtual;
    }
  }
  total += fim - inicio;
  return Math.round((total / 12) * 10) / 10;
}

function interpretarPeriodo(texto) {
  const m = PERIODO.exec(texto);
  if (!m) return null;
  const inicio = paraMeses(m[1], m[2]);
  const fim = m[3] ? paraMeses(m[3], m[4]) : null; // null = "atual"
  return { inicio, fim };
}

/**
 * @param {string} texto conteúdo de um `cv.txt`
 * @param {{mesAtual?: number}} [opcoes] mês de referência para "atual",
 *   no formato AAAA*12+MM. Injetável para o teste não depender do calendário.
 * @returns {object} estrutura extraída + lista de problemas
 */
function parsearCv(texto, opcoes = {}) {
  const linhas = String(texto).split('\n');
  const mesAtual = opcoes.mesAtual ?? paraMeses(
    String(new Date().getMonth() + 1).padStart(2, '0'),
    String(new Date().getFullYear()),
  );

  const problemas = [];

  // ── Contato: o ATS procura nas primeiras linhas ────────────────────────
  const cabecalho = linhas.slice(0, 6).join('\n');
  const contato = {
    nome: (linhas[0] || '').trim() || null,
    cargo: (linhas[1] || '').trim() || null,
    email: (EMAIL.exec(cabecalho) || [null])[0],
    telefone: (TELEFONE.exec(cabecalho) || [null])[0],
  };
  if (!contato.nome) problemas.push('não encontrou o nome na primeira linha');
  if (!contato.email) problemas.push('não encontrou e-mail no cabeçalho');
  if (!contato.telefone) problemas.push('não encontrou telefone no cabeçalho');

  // ── Seções: agrupa as linhas sob cada título canônico ──────────────────
  const secoes = new Map();
  const desconhecidas = [];
  let atual = null;
  for (const linha of linhas) {
    const t = linha.trim();
    if (!t) continue;
    if (TITULOS_CANONICOS.has(t)) {
      atual = t;
      secoes.set(atual, []);
      continue;
    }
    // Linha em caixa alta e curta que não é título conhecido: o ATS não sabe
    // o que fazer com ela e pode perder a seção inteira.
    // Precisa de letra: "02/2026 - 07/2026" sozinha numa linha (cabeçalho de
    // projeto quebrado no PDF) também "está em caixa alta", e não é título.
    if (t === t.toUpperCase() && /\p{L}/u.test(t) && t.length > 3 && t.length < 40 && !/[|:]/.test(t) && !/^-/.test(t)) {
      if (!TITULOS_CANONICOS.has(t) && t !== contato.nome) desconhecidas.push(t);
    }
    if (atual) secoes.get(atual).push(t);
  }
  for (const t of desconhecidas) {
    problemas.push(`título de seção não reconhecido: "${t}"`);
  }
  if (![...secoes.keys()].some(t => TITULOS_EXPERIENCIA.has(t))) {
    problemas.push('não encontrou a seção de experiência profissional');
  }

  // ── Empregos ────────────────────────────────────────────────────────────
  const empregos = [];
  for (const linha of linhasDaSecao(secoes, TITULOS_EXPERIENCIA)) {
    const m = LINHA_EMPREGO.exec(linha);
    if (!m) continue;
    const intervalo = interpretarPeriodo(m[3]);
    if (!intervalo) {
      problemas.push(`período ilegível em "${m[1]} | ${m[2]}": "${m[3]}"`);
    }
    empregos.push({ cargo: m[1], empresa: m[2], periodo: m[3], local: m[4] || null, intervalo });
  }
  if (empregos.length === 0) {
    problemas.push('não conseguiu extrair nenhum emprego com cargo, empresa e período');
  }

  const formacao = linhasDaSecao(secoes, TITULOS_FORMACAO)
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2));
  if (formacao.length === 0) problemas.push('não encontrou formação acadêmica');

  return {
    contato,
    secoes: [...secoes.keys()],
    empregos,
    formacao,
    anosExperiencia: anosDeExperiencia(empregos, mesAtual),
    problemas,
    // Um currículo que o ATS não consegue estruturar é descartado antes de
    // qualquer comparação com a vaga.
    legivel: problemas.length === 0,
  };
}

module.exports = { parsearCv, anosDeExperiencia, paraMeses };
