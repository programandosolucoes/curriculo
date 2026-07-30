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
