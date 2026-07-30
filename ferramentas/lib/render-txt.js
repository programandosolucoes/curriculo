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

function lista(itens) {
  return itens.map(item => `- ${limpar(item)}`);
}

const RENDERIZADORES = {
  resumo: secao => [limpar(secao.texto)],

  conquistas: secao => lista(secao.itens),

  competencias: secao => secao.grupos.flatMap(grupo => [
    `${limpar(grupo.titulo)}:`,
    ...lista(grupo.itens),
    '',
  ]).slice(0, -1),

  experiencia: secao => secao.itens.flatMap(item => [
    // Cargo, empresa e período numa linha só e sempre na mesma ordem: é assim
    // que o parser de ATS reconhece o bloco de emprego. Vale igual para o
    // emprego compacto — ele existe justamente para o sistema contar a data.
    `${limpar(item.cargo)} | ${limpar(item.empresa)} | ${limpar(item.periodo)}${item.local ? ` | ${limpar(item.local)}` : ''}`,
    ...lista(item.bullets),
    '',
  ]).slice(0, -1),

  projetos: secao => secao.itens.flatMap(item => [
    `${limpar(item.nome)}${item.contexto ? ` | ${limpar(item.contexto)}` : ''} | ${limpar(item.periodo)}`,
    ...lista(item.bullets),
    '',
  ]).slice(0, -1),

  formacao: secao => lista(
    secao.itens.map(i => [i.curso, i.instituicao, i.periodo].filter(Boolean).join(' | ')),
  ),

  certificacoes: secao => lista(secao.itens),

  idiomas: secao => lista(secao.itens),
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
