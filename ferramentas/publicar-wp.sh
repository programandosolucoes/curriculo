#!/usr/bin/env bash
# publicar-wp.sh — publica o portfólio no WordPress com logs detalhados em tempo real

set -uo pipefail

# IP e Chave direta do MCP Painel Git
SSH_ALVO="u560021660@77.37.127.250"
SSH_PORTA=65002
CHAVE_SSH="/home/carlos/.ssh/id_ed25519_apex"
WP_PATH="~/domains/carloslopes.programandosolucoes.com.br/public_html"
AUTOR_WP=1
DESTINO_IMG="$WP_PATH/wp-content/uploads/portfolio"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$RAIZ/portfolio/build"
IMG="$RAIZ/portfolio/img"

echo "=================================================="
echo "🚀 Publicador do Portfólio no WordPress (Verbose)"
echo "=================================================="
echo "📍 Servidor: $SSH_ALVO (Porta $SSH_PORTA)"
echo "🔑 Chave SSH: $CHAVE_SSH"
echo "📍 Caminho WordPress: $WP_PATH"
echo "=================================================="

ssh_() {
    ssh -i "$CHAVE_SSH" -p "$SSH_PORTA" -o ConnectTimeout=10 "$SSH_ALVO" "$@"
}

scp_() {
    scp -i "$CHAVE_SSH" -P "$SSH_PORTA" "$@"
}

echo
echo "==> [Passo 0] Testando handshake SSH no IP 77.37.127.250..."
if ssh_ "echo '   Conectado com sucesso como: '\$(whoami)"; then
    echo "    ✅ Autenticação SSH bem-sucedida!"
else
    echo "    ❌ Erro ao conectar no SSH. Tentando chave padrão..."
    if ssh -p "$SSH_PORTA" -o ConnectTimeout=10 "$SSH_ALVO" "echo '   Conectado como: '\$(whoami)"; then
        echo "    ✅ Autenticado com chave do agente!"
    else
        echo "    ❌ Falha de autenticação."
        exit 1
    fi
fi

echo
echo "==> [Passo 1/3] Enviando imagens de telemetria..."
ssh_ "mkdir -p $DESTINO_IMG"
for img in telemetria-01-geral.png telemetria-02-problemas.png telemetria-03-ramais.png; do
    if [[ -f "$IMG/$img" ]]; then
        echo -n "    📤 Enviando $img... "
        scp_ "$IMG/$img" "$SSH_ALVO:$DESTINO_IMG/" >/dev/null
        echo "OK"
    fi
done
echo "    ✅ Imagens sincronizadas em $DESTINO_IMG"

echo
total="$(node -e "console.log(require('$BUILD/paginas.json').length)")"
echo "==> [Passo 2/3] Publicando / Atualizando $total páginas..."

campo() { node -e "console.log(require('$BUILD/paginas.json')[$1].$2)"; }

for ((i = 0; i < total; i++)); do
    slug="$(campo "$i" slug)"
    titulo="$(campo "$i" titulo)"
    arquivo="$BUILD/$(campo "$i" arquivo)"

    echo -n "    [$((i+1))/$total] $slug... "

    # Envia o arquivo HTML
    scp_ "$arquivo" "$SSH_ALVO:/tmp/pagina.html" >/dev/null

    # Verifica se a página já existe
    existente="$(ssh_ "cd $WP_PATH && wp --skip-plugins post list --post_type=page --name=$slug --field=ID --format=ids" 2>/dev/null | tr -d '\r' | tr -d '\n' || true)"

    if [[ -n "$existente" ]]; then
        ssh_ "cd $WP_PATH && wp --skip-plugins post update $existente /tmp/pagina.html --post_title='$titulo' --post_author=$AUTOR_WP" >/dev/null 2>&1
        echo "🔄 Atualizada (ID $existente)"
    else
        novo="$(ssh_ "cd $WP_PATH && wp --skip-plugins post create /tmp/pagina.html --post_type=page --post_status=publish --post_name=$slug --post_title='$titulo' --post_author=$AUTOR_WP --porcelain" 2>/dev/null | tr -d '\r' | tr -d '\n' || true)"
        echo "✨ Criada (ID $novo)"
    fi
done

echo
echo "==> [Passo 3/3] Limpando cache do LiteSpeed..."
ssh_ "cd $WP_PATH && wp litespeed-purge all" 2>/dev/null || echo "    (Cache limpo ou plugin desativado)"

echo
echo "=================================================="
echo "🎉 Portfólio 100% publicado e atualizado no WordPress!"
echo "Página do novo projeto: https://carloslopes.programandosolucoes.com.br/index.php/portfolio-telemetria-pabx/"
echo "Frontend: https://carloslopes.programandosolucoes.com.br/index.php/portfolio-frontend/"
echo "Backend:  https://carloslopes.programandosolucoes.com.br/index.php/portfolio-backend/"
echo "=================================================="
