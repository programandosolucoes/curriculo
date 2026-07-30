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
