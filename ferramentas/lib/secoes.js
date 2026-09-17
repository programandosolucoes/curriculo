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

/**
 * Títulos nos outros idiomas. Mesma regra: convencionais, porque é pelo texto
 * do cabeçalho que o ATS do país de destino acha a seção.
 */
const TITULOS_POR_IDIOMA = {
  pt: TITULOS_SECAO,
  en: {
    resumo: 'PROFESSIONAL SUMMARY',
    conquistas: 'KEY ACHIEVEMENTS',
    competencias: 'SKILLS',
    experiencia: 'PROFESSIONAL EXPERIENCE',
    projetos: 'PROJECTS',
    formacao: 'EDUCATION',
    certificacoes: 'CERTIFICATIONS AND TRAINING',
    idiomas: 'LANGUAGES',
  },
  it: {
    resumo: 'PROFILO PROFESSIONALE',
    conquistas: 'RISULTATI PRINCIPALI',
    competencias: 'COMPETENZE',
    experiencia: 'ESPERIENZA PROFESSIONALE',
    projetos: 'PROGETTI',
    formacao: 'ISTRUZIONE E FORMAZIONE',
    certificacoes: 'CERTIFICAZIONI E CORSI',
    idiomas: 'LINGUE',
  },
};

/** Como se escreve o fim de um período em curso ("atual" no mestre). */
const PALAVRA_ATUAL = { pt: 'atual', en: 'Present', it: 'presente' };

/** `MM/AAAA`, `MM/AAAA - MM/AAAA` ou `MM/AAAA - atual`. */
const PADRAO_DATA = /^(0[1-9]|1[0-2])\/\d{4}( - ((0[1-9]|1[0-2])\/\d{4}|atual))?$/;

module.exports = { TITULOS_SECAO, TITULOS_POR_IDIOMA, PALAVRA_ATUAL, PADRAO_DATA };
