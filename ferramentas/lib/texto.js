/**
 * texto.js — casamento de termo técnico dentro de um texto.
 *
 * Extraído de `core/filtro-area.js` do `vagas-automation-suite`: lá a função
 * mora ao lado do filtro de área por IA, e importar aquele módulo arrastaria
 * junto a cadeia de provedores de IA e as chaves de API. Aqui a função é
 * copiada isolada — é regex pura, sem dependência nenhuma — para que este
 * repositório rode com `node` puro logo após o clone.
 */

/**
 * Verifica se `termo` aparece em `textoLower` como palavra inteira.
 *
 * A fronteira NÃO é `\b` porque os termos contêm pontuação significativa
 * (`node.js`, `c#`, `ci/cd`, `.net`) — `\b` quebraria neles. Em vez disso
 * exige que o caractere antes e depois não seja letra nem número (Unicode),
 * o que preserva acento em português e ainda evita casar "go" dentro de
 * "google" ou "java" dentro de "javascript".
 *
 * @param {string} termo Termo do vocabulário, já em minúsculas.
 * @param {string} textoLower Texto onde procurar, já em minúsculas.
 * @returns {boolean}
 */
function termoBateNoTexto(termo, textoLower) {
  const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}])${escapado}([^\\p{L}\\p{N}]|$)`, 'u');
  return regex.test(textoLower);
}

module.exports = { termoBateNoTexto };
