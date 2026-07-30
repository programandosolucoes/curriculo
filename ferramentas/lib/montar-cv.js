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
    const detalhados = selecionarPorId(
      mestre.experiencia, receita.incluir_experiencia, 'incluir_experiencia', receita.id,
    ).map(e => ({
      empresa: e.empresa, cargo: e.cargo, periodo: e.periodo, local: e.local,
      compacto: false,
      bullets: resolverBullets(e, receita.id),
    }));

    // Empregos compactos entram só com cargo, empresa e período, sem bullets.
    //
    // Existem para preservar a CRONOLOGIA. Um currículo focado que apaga os
    // empregos antigos perde anos de carreira aos olhos do sistema: medido na
    // prática, o perfil de frontend caía de 12 para 4,7 anos e seria cortado
    // por qualquer filtro de "10+ anos". A história completa fica; o foco
    // acontece nos bullets, não em apagar emprego.
    const compactos = selecionarPorId(
      mestre.experiencia, receita.incluir_experiencia_compacta, 'incluir_experiencia_compacta', receita.id,
    ).map(e => ({
      empresa: e.empresa, cargo: e.cargo, periodo: e.periodo, local: e.local,
      compacto: true,
      bullets: [],
    }));

    return { itens: [...detalhados, ...compactos] };
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

  // O mesmo emprego nas duas listas sairia duplicado no currículo.
  const repetidos = (receita.incluir_experiencia || [])
    .filter(id => (receita.incluir_experiencia_compacta || []).includes(id));
  if (repetidos.length) {
    throw new Error(
      `Perfil "${receita.id}": ${repetidos.join(', ')} aparece(m) em incluir_experiencia ` +
      `E em incluir_experiencia_compacta — sairia duplicado.`,
    );
  }

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
