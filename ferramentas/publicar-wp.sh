#!/usr/bin/env bash
# publicar-wp.sh — publica o portfólio no WordPress via WP-CLI sobre SSH.
#
# Idempotente: casa as páginas pelo slug, então rodar de novo atualiza em vez
# de duplicar. Faz backup antes de qualquer escrita.
#
# Uso: bash ferramentas/publicar-wp.sh [--dry-run]

set -euo pipefail

SSH_ALVO="u560021660@git.programandosolucoes.com.br"
SSH_PORTA=65002
WP_PATH="~/domains/carloslopes.programandosolucoes.com.br/public_html"
# Sem --post_author o WP-CLI grava autor 0 (nenhum), e a página sai sem autor
# no site e na listagem do admin. 1 = carlosalberto4ti, o administrador.
AUTOR_WP=1
DESTINO_IMG="$WP_PATH/wp-content/uploads/portfolio"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$RAIZ/portfolio/build"
IMG="$RAIZ/portfolio/img"
DRY_RUN=""
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN="1"

wp_remoto() {
  # shellcheck disable=SC2029
  ssh -p "$SSH_PORTA" "$SSH_ALVO" "cd $WP_PATH && wp --skip-plugins $*"
}

campo() { node -e "console.log(require('$BUILD/paginas.json')[$1].$2)"; }

if [[ ! -f "$BUILD/paginas.json" ]]; then
  echo "ERRO: $BUILD/paginas.json não existe. Rode antes: npm run portfolio" >&2
  exit 1
fi

total="$(node -e "console.log(require('$BUILD/paginas.json').length)")"
echo "==> $total página(s) a publicar${DRY_RUN:+ (modo seco)}"

if [[ -z "$DRY_RUN" ]]; then
  echo "==> Passo 0: backup das páginas antes de qualquer escrita"
  wp_remoto "export --dir=/tmp --post_type=page" || echo "  (export falhou; siga só se aceitar o risco)"

  echo "==> Passo 1: enviar imagens para a pasta fixa de uploads"
  # Pasta FIXA, não biblioteca de mídia: a URL fica determinística e o HTML
  # gerado já nasce com o src certo, sem mapear id de anexo depois.
  ssh -p "$SSH_PORTA" "$SSH_ALVO" "mkdir -p $DESTINO_IMG"
  scp -q -P "$SSH_PORTA" "$IMG"/* "$SSH_ALVO:$DESTINO_IMG/"
  echo "  $(ls -1 "$IMG" | wc -l) imagem(ns) enviada(s)"
fi

echo "==> Passo 2: publicar as páginas"
for ((i = 0; i < total; i++)); do
  slug="$(campo "$i" slug)"
  titulo="$(campo "$i" titulo)"
  arquivo="$BUILD/$(campo "$i" arquivo)"

  if [[ -n "$DRY_RUN" ]]; then
    echo "  [seco] $slug — $titulo"
    continue
  fi

  scp -q -P "$SSH_PORTA" "$arquivo" "$SSH_ALVO:/tmp/pagina.html"
  existente="$(wp_remoto "post list --post_type=page --name=$slug --field=ID --format=ids" | tr -d '\r')"

  if [[ -n "$existente" ]]; then
    wp_remoto "post update $existente /tmp/pagina.html --post_title='$titulo' --post_author=$AUTOR_WP" > /dev/null
    echo "  atualizada: $slug (ID $existente)"
  else
    novo="$(wp_remoto "post create /tmp/pagina.html --post_type=page --post_status=publish --post_name=$slug --post_title='$titulo' --post_author=$AUTOR_WP --porcelain" | tr -d '\r')"
    echo "  criada: $slug (ID $novo)"
  fi
done

if [[ -z "$DRY_RUN" ]]; then
  echo "==> Passo 3: limpar cache"
  # Sem --skip-plugins aqui, porque este comando É do plugin LiteSpeed.
  # shellcheck disable=SC2029
  ssh -p "$SSH_PORTA" "$SSH_ALVO" "cd $WP_PATH && wp litespeed-purge all" > /dev/null 2>&1 \
    || echo "  (LiteSpeed não respondeu; siga)"
fi

echo "==> Pronto."
echo "    O menu Portfólio > Frontend / Backend é criado à parte, uma única vez."
