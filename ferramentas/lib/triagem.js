/**
 * triagem.js — Simula a triagem de um currículo por um ATS, vaga a vaga.
 *
 * Diferente de `lib/aderencia.js`, que responde "quanto do mercado meu
 * currículo cobre" em média, aqui a pergunta é outra: **esta vaga específica
 * me chamaria, e se não, por quê?**
 *
 * O ATS trabalha em duas etapas, nessa ordem:
 *
 *   1. ESTRUTURA — extrai contato, seções, empregos e datas. Falhou aqui, o
 *      currículo é descartado sem nunca ser comparado com a vaga. É por isso
 *      que layout de duas colunas e cabeçalho criativo derrubam candidato bom.
 *   2. PALAVRA-CHAVE — só então compara os termos exigidos com os do
 *      currículo, e corta abaixo de um limiar.
 *
 * A saída mais útil não é o percentual: é o MOTIVO. "Reprovado: faltam azure,
 * sql server" é acionável; "43% de aderência" não é.
 *
 * Lógica pura: recebe objetos, devolve objetos. Sem disco, sem rede.
 */

/** Corte de palavra-chave. Triagens reais costumam ficar nessa faixa. */
const LIMIAR_PADRAO = 0.6;

/** Vaga com pouquíssimos termos reconhecidos não sustenta veredito. */
const MINIMO_TERMOS_VAGA = 3;

const VEREDITOS = {
  APROVADO: 'aprovado',
  REPROVADO_ESTRUTURA: 'reprovado_estrutura',
  REPROVADO_PALAVRAS: 'reprovado_palavras',
  INDETERMINADO: 'indeterminado',
};

/**
 * @param {object} cvParseado saída de `parsearCv`
 * @param {string[]} cvTermos termos do vocabulário achados no currículo
 * @param {object} vaga com `titulo` e `requisitos`
 * @param {(texto: string) => string[]} extrairTermos normalmente `termosNoTexto`
 * @param {{limiar?: number}} [opcoes]
 * @returns {{veredito: string, motivo: string, cobertura: number|null,
 *            exigidos: string[], cobertos: string[], faltantes: string[]}}
 */
function triar(cvParseado, cvTermos, vaga, extrairTermos, opcoes = {}) {
  const limiar = opcoes.limiar ?? LIMIAR_PADRAO;

  // Etapa 1: estrutura. O ATS descarta aqui, antes de olhar a vaga.
  if (!cvParseado.legivel) {
    return {
      veredito: VEREDITOS.REPROVADO_ESTRUTURA,
      motivo: `o currículo não pôde ser lido pelo sistema: ${cvParseado.problemas.join('; ')}`,
      cobertura: null,
      exigidos: [], cobertos: [], faltantes: [],
    };
  }

  // Etapa 2: palavras-chave da vaga.
  const exigidos = extrairTermos(`${vaga.titulo || ''} ${vaga.requisitos || ''}`);

  if (exigidos.length < MINIMO_TERMOS_VAGA) {
    return {
      veredito: VEREDITOS.INDETERMINADO,
      motivo: `a vaga menciona só ${exigidos.length} termo(s) do vocabulário — poucos para um veredito honesto`,
      cobertura: null,
      exigidos, cobertos: [], faltantes: [],
    };
  }

  const cobertos = exigidos.filter(t => cvTermos.includes(t));
  const faltantes = exigidos.filter(t => !cvTermos.includes(t));
  const cobertura = cobertos.length / exigidos.length;

  if (cobertura >= limiar) {
    return {
      veredito: VEREDITOS.APROVADO,
      motivo: `cobre ${cobertos.length} dos ${exigidos.length} termos exigidos`,
      cobertura, exigidos, cobertos, faltantes,
    };
  }

  return {
    veredito: VEREDITOS.REPROVADO_PALAVRAS,
    motivo: `faltam ${faltantes.length} de ${exigidos.length} termos exigidos: ${faltantes.slice(0, 6).join(', ')}`,
    cobertura, exigidos, cobertos, faltantes,
  };
}

/**
 * Consolida os vereditos e mostra o que mais derruba o currículo.
 *
 * O ranking de bloqueadores é a saída de maior valor prático: diz quais
 * poucos termos, se resolvidos, destravariam mais vagas.
 */
function consolidar(resultados) {
  const porVeredito = {};
  for (const v of Object.values(VEREDITOS)) porVeredito[v] = 0;
  const bloqueadores = new Map();

  for (const r of resultados) {
    porVeredito[r.veredito] += 1;
    if (r.veredito !== VEREDITOS.REPROVADO_PALAVRAS) continue;
    for (const termo of r.faltantes) {
      bloqueadores.set(termo, (bloqueadores.get(termo) || 0) + 1);
    }
  }

  const avaliadas = porVeredito[VEREDITOS.APROVADO] + porVeredito[VEREDITOS.REPROVADO_PALAVRAS];
  return {
    total: resultados.length,
    avaliadas,
    ...porVeredito,
    // Percentual só sobre as que foram de fato avaliadas: incluir as
    // indeterminadas no denominador inventaria reprovação que não houve.
    taxaAprovacao: avaliadas > 0
      ? Math.round((100 * porVeredito[VEREDITOS.APROVADO]) / avaliadas)
      : null,
    bloqueadores: [...bloqueadores.entries()]
      .map(([termo, vagas]) => ({ termo, vagas }))
      .sort((a, b) => b.vagas - a.vagas),
  };
}

module.exports = { triar, consolidar, VEREDITOS, LIMIAR_PADRAO, MINIMO_TERMOS_VAGA };
