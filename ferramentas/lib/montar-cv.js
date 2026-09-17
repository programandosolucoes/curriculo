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

const { TITULOS_POR_IDIOMA, PALAVRA_ATUAL, PADRAO_DATA } = require('./secoes');

/**
 * Qual chave de bullets vale para o perfil: a variante dele, ou a base.
 *
 * Ausência das duas é ERRO, não omissão: um item que some silenciosamente do
 * currículo é pior que um erro de geração, porque ninguém percebe.
 */
function chaveDosBullets(item, perfilId) {
  const bullets = item.bullets || {};
  const chave = bullets[perfilId] ? perfilId : 'base';
  if (!bullets[chave] || bullets[chave].length === 0) {
    throw new Error(
      `Item "${item.id}" não tem bullets para o perfil "${perfilId}" nem "base". ` +
      `Acrescente um dos dois em cv/mestre.json.`,
    );
  }
  return chave;
}

/** Bullets de um item para um perfil: a variante do perfil, ou a base. */
function resolverBullets(item, perfilId) {
  return item.bullets[chaveDosBullets(item, perfilId)];
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

/** Id do currículo gerado: o do perfil, com sufixo quando não é português. */
function idDeSaida(receita, idioma) {
  return idioma === 'pt' ? receita.id : `${receita.id}-${idioma}`;
}

/**
 * Leitor do texto de um currículo, no idioma pedido.
 *
 * Em português devolve o próprio texto do mestre. Nos outros idiomas lê de
 * `cv/mestre.<idioma>.json`, que só traz TEXTO: chaveado pelo id do item do
 * mestre, ou pelo próprio texto em português nas listas sem id (formação,
 * certificações, idiomas). Empresa e período continuam vindo do mestre, e é
 * isso que impede a versão traduzida de divergir nos fatos.
 *
 * Tradução ausente é ERRO, pelo mesmo motivo do bullet ausente: um trecho em
 * português no meio do currículo em inglês é pior que falhar na geração.
 * Texto do mestre alterado depois da tradução também cai aqui — a chave some,
 * ou a quantidade de bullets deixa de bater.
 */
function criarLeitor(idioma, traducao, perfilId) {
  if (!TITULOS_POR_IDIOMA[idioma]) {
    throw new Error(
      `Perfil "${perfilId}": idioma "${idioma}" desconhecido. ` +
      `Válidos: ${Object.keys(TITULOS_POR_IDIOMA).join(', ')}.`,
    );
  }
  const periodo = p => (p === undefined ? p : p.replace(/atual$/, PALAVRA_ATUAL[idioma]));

  if (idioma === 'pt') {
    return {
      texto: (original) => original,
      lista: (caminho, original) => original,
      periodo,
    };
  }

  const arquivo = `cv/mestre.${idioma}.json`;
  if (!traducao) {
    throw new Error(`Perfil "${perfilId}": idioma "${idioma}" pedido sem ${arquivo}.`);
  }
  const buscar = caminho => caminho.reduce((o, chave) => (o == null ? undefined : o[chave]), traducao);
  const falta = caminho => new Error(
    `Perfil "${perfilId}": falta tradução para "${idioma}" em ${arquivo}: ${caminho.join(' → ')}`,
  );

  return {
    // `original` só existe para o português; aqui vale o caminho.
    texto(original, ...caminho) {
      const valor = buscar(caminho);
      if (typeof valor !== 'string' || valor === '') throw falta(caminho);
      return valor;
    },
    lista(caminho, original) {
      const valor = buscar(caminho);
      if (!Array.isArray(valor)) throw falta(caminho);
      if (valor.length !== original.length) {
        throw new Error(
          `Perfil "${perfilId}": ${arquivo}, ${caminho.join(' → ')} tem ${valor.length} ` +
          `itens e o mestre tem ${original.length}. O mestre mudou depois da tradução?`,
        );
      }
      return valor;
    },
    periodo,
  };
}

const MONTADORES = {
  resumo(mestre, receita, t) {
    const texto = (mestre.resumos || {})[receita.id];
    if (!texto) {
      throw new Error(`Falta o resumo do perfil "${receita.id}" em cv/mestre.json (chave "resumos").`);
    }
    return { texto: t.texto(texto, 'resumos', receita.id) };
  },

  conquistas(mestre, receita, t) {
    const itens = selecionarPorId(mestre.conquistas, receita.incluir_conquistas, 'incluir_conquistas', receita.id);
    return { itens: itens.map(c => t.texto(c.texto, 'conquistas', c.id)) };
  },

  competencias(mestre, receita, t) {
    const grupos = (receita.competencias || []).map(chave => {
      const grupo = (mestre.competencias || {})[chave];
      if (!grupo) {
        throw new Error(`Perfil "${receita.id}": grupo de competência "${chave}" não existe em cv/mestre.json.`);
      }
      return {
        titulo: t.texto(grupo.titulo, 'competencias', chave, 'titulo'),
        itens: t.lista(['competencias', chave, 'itens'], grupo.itens),
      };
    });
    return { grupos };
  },

  experiencia(mestre, receita, t) {
    const cabecalho = e => ({
      empresa: e.empresa,
      cargo: t.texto(e.cargo, 'experiencia', e.id, 'cargo'),
      periodo: t.periodo(e.periodo),
      local: e.local && t.texto(e.local, 'experiencia', e.id, 'local'),
    });

    const detalhados = selecionarPorId(
      mestre.experiencia, receita.incluir_experiencia, 'incluir_experiencia', receita.id,
    ).map(e => {
      const chave = chaveDosBullets(e, receita.id);
      return {
        ...cabecalho(e),
        compacto: false,
        bullets: t.lista(['experiencia', e.id, 'bullets', chave], e.bullets[chave]),
      };
    });

    // Empregos compactos entram só com cargo, empresa e período, sem bullets.
    //
    // Existem para preservar a CRONOLOGIA. Um currículo focado que apaga os
    // empregos antigos perde anos de carreira aos olhos do sistema: medido na
    // prática, o perfil de frontend caía de 12 para 4,7 anos e seria cortado
    // por qualquer filtro de "10+ anos". A história completa fica; o foco
    // acontece nos bullets, não em apagar emprego.
    const compactos = selecionarPorId(
      mestre.experiencia, receita.incluir_experiencia_compacta, 'incluir_experiencia_compacta', receita.id,
    ).map(e => ({ ...cabecalho(e), compacto: true, bullets: [] }));

    return { itens: [...detalhados, ...compactos] };
  },

  projetos(mestre, receita, t) {
    const itens = selecionarPorId(mestre.projetos, receita.incluir_projetos, 'incluir_projetos', receita.id);
    return {
      itens: itens.map(p => {
        const chave = chaveDosBullets(p, receita.id);
        return {
          nome: t.texto(p.nome, 'projetos', p.id, 'nome'),
          contexto: p.contexto && t.texto(p.contexto, 'projetos', p.id, 'contexto'),
          periodo: t.periodo(p.periodo),
          bullets: t.lista(['projetos', p.id, 'bullets', chave], p.bullets[chave]),
        };
      }),
    };
  },

  formacao(mestre, receita, t) {
    return {
      itens: (mestre.formacao || []).map(f => ({
        ...f,
        curso: t.texto(f.curso, 'formacao', f.curso),
        periodo: t.periodo(f.periodo),
      })),
    };
  },

  certificacoes(mestre, receita, t) {
    return { itens: (mestre.certificacoes || []).map(c => t.texto(c, 'certificacoes', c)) };
  },

  idiomas(mestre, receita, t) {
    return { itens: (mestre.idiomas || []).map(i => t.texto(i, 'idiomas', i)) };
  },
};

function tituloNoIdioma(receita, idioma) {
  if (idioma === 'pt') return receita.titulo;
  const titulo = (receita.titulos || {})[idioma];
  if (!titulo) {
    throw new Error(`Perfil "${receita.id}": falta "titulos": { "${idioma}": ... } na receita.`);
  }
  return titulo;
}

/**
 * @param {object} mestre conteúdo de `cv/mestre.json`
 * @param {object} receita conteúdo de `perfis/<id>.json`
 * @param {{idioma?: string, traducao?: object}} [opcoes] idioma de saída
 *   (padrão `pt`) e o conteúdo de `cv/mestre.<idioma>.json`
 * @returns {{perfil: string, idioma: string, titulo: string, pessoal: object, secoes: object[]}}
 */
function montarCv(mestre, receita, opcoes = {}) {
  const idioma = opcoes.idioma || 'pt';
  validarReceita(receita);
  const t = criarLeitor(idioma, opcoes.traducao, receita.id);

  // O mesmo emprego nas duas listas sairia duplicado no currículo.
  const repetidos = (receita.incluir_experiencia || [])
    .filter(id => (receita.incluir_experiencia_compacta || []).includes(id));
  if (repetidos.length) {
    throw new Error(
      `Perfil "${receita.id}": ${repetidos.join(', ')} aparece(m) em incluir_experiencia ` +
      `E em incluir_experiencia_compacta — sairia duplicado.`,
    );
  }

  const titulos = TITULOS_POR_IDIOMA[idioma];
  const secoes = (receita.ordem || []).map(tipo => {
    const montador = MONTADORES[tipo];
    if (!montador) {
      throw new Error(
        `Perfil "${receita.id}": seção "${tipo}" desconhecida. ` +
        `Válidas: ${Object.keys(MONTADORES).join(', ')}.`,
      );
    }
    return { tipo, titulo: titulos[tipo], ...montador(mestre, receita, t) };
  });

  const pessoal = { ...mestre.pessoal, local: t.texto(mestre.pessoal.local, 'pessoal', 'local') };

  return {
    perfil: idDeSaida(receita, idioma),
    idioma,
    titulo: tituloNoIdioma(receita, idioma),
    pessoal,
    secoes,
  };
}

module.exports = { montarCv, resolverBullets, validarReceita, idDeSaida };
