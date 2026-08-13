# Próximas frentes

O que está enfileirado, com o suficiente para retomar sem reconstruir o
raciocínio. Frentes concluídas saem daqui e viram entrada no [DIARIO.md](DIARIO.md).

---

## ~~1. Simulador de ATS~~ — CONCLUÍDO

Construído em `ferramentas/simular-ats.js`. Ver a seção 13 do
[DIARIO.md](DIARIO.md#13-simulador-de-ats), inclusive os dois defeitos que ele
encontrou: o currículo antigo era ilegível para um ATS, e o recorte por perfil
estava destruindo anos de carreira.

---

## 2. Coletar vagas de telecom e VoIP

Sem isso o perfil `voip` é gerado e **não medido** — nenhuma das 1.129 vagas
cita Asterisk, VoIP, SIP, PABX ou Kamailio, porque telecom não está entre as 30
categorias coletadas.

Enquanto não houver coleta, a tabela de aderência por categoria fica enviesada
contra a área mais forte do histórico. É pré-requisito para qualquer decisão de
carreira baseada nesses números.

O coletor vive no `vagas-automation-suite` (`core/categorias-mercado.js`).

---

## 3. Regerar o `cv.pdf`

O PDF é o que vai anexado nas candidaturas e ainda é a versão de 25/07,
anterior a todo o trabalho. Cada `cv/<perfil>/cv.html` tem botão de exportação;
são nove cliques, ou uma execução com navegador headless mediante autorização.

Decidir também o destino de `cv/cv.txt`, `cv/cv.pdf` e `cv/cv-2026-07.html`,
que são da estrutura antiga e convivem com a nova — quem clonar o repositório
fica em dúvida sobre qual é o currículo válido.

---

## 4. Confirmar o perfil padrão

`dev` está marcado como `padrao: true`, e é o que vai para o `cv.txt` dos bots.
A escolha foi por volume de vagas (62), mas `dados` (64%) e `ia` (60%) têm
aderência maior. Revisar depois da medição comparativa.

---

## 5. Corrigir o remoto do `vagas-automation-suite`

O remoto usa sintaxe scp (`user@host:path`), que não aceita porta e tenta a 22,
enquanto o servidor atende na 65002. `git push origin` falha ali.

```bash
git remote set-url origin ssh://u560021660@git.programandosolucoes.com.br:65002/home/u560021660/domains/git.programandosolucoes.com.br/public_html/git/repos/vagas-automation-suite.git
```

Não executado por ser configuração do usuário.

---

## 6. Confirmar code review nos empregos formais

Os bullets de `elev` (11 desenvolvedores supervisionados) e `tw-solutions`
(referência técnica de CI/CD no Bitbucket) são o lugar natural para um bullet de
**code review**, termo pedido em 3 vagas dos perfis dev e frontend.

Não foi escrito porque não há registro de que a prática fosse formal nesses
times — o CV hoje se apoia só na evidência verificável da `painel-git`, onde o
fluxo de PR foi construído por ele. **Basta o usuário confirmar** para os dois
bullets entrarem.

Contexto em [PESQUISA_PROMPTS_MOTION_E_QUALIDADE.md](PESQUISA_PROMPTS_MOTION_E_QUALIDADE.md).

---

## 7. Competências que exigem fazer o trabalho antes de escrever

Do levantamento de 2026-08-13, os itens que **não** entraram no CV porque
seriam competência declarada sem lastro. Cada um vira bullet legítimo assim que
o trabalho existir, em ordem de retorno:

1. **OpenTelemetry + Grafana/Prometheus** — maior retorno e o laboratório já
   existe. A chamada que atravessa painel → motor de discagem → Asterisk →
   webhook é um trace distribuído de manual. Hoje o CV só tem observabilidade
   de infra (Zabbix), nada de aplicação. Grafana é lacuna em 2 vagas; Datadog e
   New Relic não aparecem em nenhuma — não gastar com eles.
2. **Mutation testing** (Stryker no motor de RPA, `mutmut` nos projetos Python)
   — 716 testes já prontos, é só medir. Converte "tenho muitos testes"
   (não verificável) em "minha suíte pega X% dos defeitos injetados".
3. **Fitness function de arquitetura** (ArchUnitTS, `eslint-plugin-boundaries`
   ou `pytest-archon`) — o caso ideal já existe: os 5 drivers de WhatsApp atrás
   de `WhatsAppDriverInterface` no `conversio`. Um teste que quebra o build se a
   aplicação importar um driver concreto é a versão executável do padrão
   Strategy que o CV já declara.
4. **Acessibilidade (WCAG, a11y, `prefers-reduced-motion`)** — o buraco mais
   visível: o perfil `frontend` se apresenta como sênior e tem zero menção a
   acessibilidade. É o único item onde a alegação é checável e falharia. Tem
   base legal no Brasil (LBI 13.146/2015, eMAG).
5. **Biome ou ESLint+Prettier no lado JS/TS** — há lint e tipagem estática em
   Python e Laravel, e nada em React/TS.
6. **Conventional Commits + commitlint** — cobre "versionamento" com mais
   profundidade e dá para **impor no servidor** pela `painel-git`, o que quase
   ninguém pode dizer em entrevista.
