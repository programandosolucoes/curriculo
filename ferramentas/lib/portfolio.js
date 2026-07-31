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
