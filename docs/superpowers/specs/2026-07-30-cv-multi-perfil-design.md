# CV multi-perfil — desenho

**Data:** 2026-07-30
**Repositório:** `curriculo`
**Estado:** desenho aprovado, aguardando plano de implementação

## Problema

O currículo hoje é único e genérico. Ele tenta atender de arquitetura VoIP a
análise de dados na mesma página, o que dilui a densidade de palavra-chave para
qualquer vaga específica — e tanto o ATS quanto a leitura de 20 segundos do
recrutador premiam o CV que conta uma história clara para o cargo.

A medição confirma: contra as 1.129 vagas coletadas, o CV genérico marca 45% de
aderência média, variando de 64% (Analista de Dados) a 18% (Suporte Técnico).

## Objetivo

Produzir **oito versões do currículo**, uma por área-alvo, com os **mesmos
fatos** e **ênfase diferente**: sete para apoiar uma migração de área (IA,
desenvolvimento, DevOps, dados, segurança, QA e RPA) e uma para continuar
concorrendo na área de origem (VoIP), que segue sendo a mais forte do
histórico.

Sucesso é medível: cada perfil deve pontuar, no seu alvo de medição, mais do
que o CV genérico pontua no mesmo alvo.

## Decisões tomadas

Registradas com quem decidiu, porque mudam o resultado:

| Decisão | Escolha | Quem |
|---|---|---|
| Objetivo dos perfis | **Migrar de área de verdade**, não só pegar vagas vizinhas | usuário |
| Áreas-alvo | **Oito**: VoIP, IA, desenvolvimento, DevOps, dados, segurança, QA e RPA | usuário |
| Tratamento do histórico VoIP | **Reenquadrar na língua da área-alvo** — mesmos empregos e fatos, descritos pelo ângulo que interessa | usuário |
| Arquitetura | **Mestre + receita por perfil** | usuário (contra a recomendação de fonte de dados única) |
| Formato dos dados | **JSON** | imposto por restrição técnica (ver abaixo) |

### Por que JSON e não YAML

O repositório precisa rodar logo após o clone, sem `npm install`. O Node não
traz parser de YAML embutido e adicionar um quebraria essa garantia. JSON é
lido pela stdlib.

### Como o "mestre + receita" evita virar dois CVs

O risco levantado na escolha da arquitetura: se o texto é reescrito por perfil,
a receita cresce até ser um currículo inteiro, e passam a existir dois lugares
onde se escreve — que é exatamente o que produz divergência de fatos.

A solução é uma regra de fronteira: **todo texto mora no mestre; a receita só
seleciona e ordena**. As variantes por perfil ficam ao lado do item que
descrevem, não em arquivo separado. A receita fica com ~20 linhas e nenhuma
frase de currículo.

## Arquitetura

```
cv/
  mestre.json              único lugar onde se escreve conteúdo
  voip/       cv.txt  cv.html
  ia/         cv.txt  cv.html
  dev/        cv.txt  cv.html
  devops/     cv.txt  cv.html
  dados/      cv.txt  cv.html
  seguranca/  cv.txt  cv.html
  qa/         cv.txt  cv.html
  rpa/        cv.txt  cv.html
perfis/
  voip.json  ia.json  dev.json  devops.json
  dados.json  seguranca.json  qa.json  rpa.json
ferramentas/
  gerar-cv.js              mestre + receita -> txt e html
  aderencia.js             ganha --perfil
  lib/
    montar-cv.js           lógica pura (testável sem disco)
    render-txt.js
    render-html.js
```

`node ferramentas/gerar-cv.js` regenera os 16 artefatos de saída. **Nenhum
arquivo em `cv/<perfil>/` é editado à mão** — são derivados.

### Fluxo

```
mestre.json ──┐
              ├──> montar-cv(mestre, receita) ──> objeto CV resolvido ──┬──> render-txt  ──> cv.txt
perfis/X.json ┘                                                        └──> render-html ──> cv.html
                                                                                  │
                                            aderencia.js --perfil=X <─────────────┘
                                            mede cv/X/cv.txt contra o alvo de X
                                            (categorias_alvo ou filtro_termos)
```

## Formato dos dados

### `cv/mestre.json`

```json
{
  "pessoal": {
    "nome": "Carlos Alberto",
    "local": "São Paulo, SP, Brasil",
    "telefone": "+55 11 2615-2880",
    "email": "carlosalberto4ti@gmail.com",
    "links": ["linkedin.com/in/carlosalberto4ti", "programandosolucoes.com.br"]
  },

  "resumos": {
    "dev": "…", "devops": "…", "dados": "…",
    "seguranca": "…", "qa": "…", "rpa": "…",
    "voip": "…", "ia": "…"
  },

  "conquistas": [
    { "id": "onboarding", "texto": "Reduzi o tempo de onboarding…" }
  ],

  "competencias": {
    "desenvolvimento": { "titulo": "Desenvolvimento & Banco de Dados",
                         "itens": ["Node.js (REST APIs, Drachtio)", "…"] },
    "cloud":           { "titulo": "Cloud & DevOps", "itens": ["…"] },
    "voip":            { "titulo": "VoIP & Telecom", "itens": ["…"] },
    "ia-llm":          { "titulo": "IA & LLM", "itens": ["…"] },
    "sinais":          { "titulo": "Processamento de Sinais & Áudio", "itens": ["…"] },
    "python":          { "titulo": "Ecossistema Python", "itens": ["…"] },
    "seguranca":       { "titulo": "Segurança Aplicada", "itens": ["…"] }
  },

  "experiencia": [
    {
      "id": "tw-solutions",
      "empresa": "TW-Solutions Telecomunicações",
      "cargo": "Analista de Desenvolvimento Sênior",
      "periodo": "06/2022 - 08/2024",
      "local": "São Paulo, Brasil",
      "bullets": {
        "base":   ["Arquitetei PBX clusterizado multi-tenant…"],
        "dev":    ["Projetei e integrei APIs RESTful (Node.js) processando +1 milhão de eventos de chamadas diários.",
                   "Liderei o esquadrão de desenvolvimento em Scrum, atuando como referência técnica de CI/CD."],
        "devops": ["Arquitetei solução clusterizada multi-tenant com escalabilidade horizontal e load balancing."],
        "dados":  ["Modelei o pipeline de +1 milhão de eventos diários consumidos por relatórios operacionais."]
      }
    }
  ],

  "projetos":     [ { "id": "discador", "nome": "…", "contexto": "…",
                      "periodo": "01/2025 - 07/2026", "bullets": { "base": ["…"], "dev": ["…"] } } ],
  "formacao":     [ { "curso": "…", "instituicao": "…", "periodo": "…" } ],
  "certificacoes":[ "…" ],
  "idiomas":      [ "…" ],
  "interesses":   [ "…" ]
}
```

**Regra de resolução de bullets:** para o perfil `X`, usa `bullets.X` se existir;
senão `bullets.base`. Um item sem `base` e sem entrada para `X` é erro de
geração, não omissão silenciosa — o gerador aborta dizendo qual item e qual
perfil, para que nada suma por esquecimento.

**Fatos aparecem uma vez só.** `empresa`, `cargo`, `periodo`, `local`,
`formacao`, `certificacoes` não têm variante por perfil. É por construção que
as versões não podem se contradizer.

### `perfis/<id>.json`

```json
{
  "id": "dev",
  "titulo": "Desenvolvedor Backend Sênior",
  "padrao": true,
  "ordem": ["resumo", "competencias", "projetos", "experiencia",
            "formacao", "certificacoes", "idiomas"],
  "competencias": ["desenvolvimento", "ia-llm", "python", "seguranca"],
  "incluir_experiencia": ["tw-solutions", "elev", "55pbx", "tld", "akiva", "onvox"],
  "incluir_projetos": ["rpa", "omnichannel", "discador", "analise-audio"],
  "incluir_conquistas": ["custo-telefonia", "receita-zendesk"],
  "categorias_alvo": ["Desenvolvedor", "Engenheiro de Software"]
}
```

- `ordem` — quais seções e em que sequência. Um perfil de dev abre com
  projetos; um de DevOps abre com experiência.
- `incluir_*` — quais itens entram e **em que ordem** (a ordem do array é a
  ordem na página).
- `padrao` — exatamente um perfil marca `true`; é o que vai para os bots.
- `categorias_alvo` — contra quais categorias medir a aderência.

**`filtro_termos` (alternativa a `categorias_alvo`):** quando a área não é uma
categoria coletada, o perfil seleciona as vagas por termo no texto:

```json
{ "id": "rpa",
  "titulo": "Desenvolvedor de Automação (RPA)",
  "filtro_termos": ["rpa", "uipath", "power automate", "blue prism",
                    "automation anywhere", "robotic process",
                    "automação de processos"] }
```

Um perfil declara `categorias_alvo` **ou** `filtro_termos`, nunca os dois — o
gerador rejeita a receita que traga ambos ou nenhum, porque nesse caso não há
como saber contra o que medir.

## Os oito perfis

| Perfil | Título | Alvo de medição | Vagas | Linha de base |
|---|---|---|---|---|
| `voip` | Arquiteto de Soluções VoIP Sênior | *filtro por termo* | **0** | **impossível hoje** |
| `ia` | Engenheiro de IA / LLM Sênior | *filtro por termo* | 36 | **60%** |
| `dev` | Desenvolvedor Backend Sênior | Desenvolvedor, Eng. de Software | 62 | 50% / 48% |
| `devops` | Engenheiro DevOps / SRE Sênior | DevOps, Analista de Sistemas | 53 | 52% / 43% |
| `dados` | Engenheiro de Dados / BI | Analista de Dados | 32 | 64% |
| `seguranca` | Analista de Segurança Sênior | Segurança da Informação | 33 | 27% |
| `qa` | Analista de QA / Automação de Testes | QA | 21 | 42% |
| `rpa` | Desenvolvedor de Automação (RPA) | *filtro por termo* | 15 | a medir |

Esses percentuais são a linha de base contra a qual cada perfil será comparado.

QA sai das categorias-alvo de `dev` ao virar perfil próprio, para que as duas
medições não se sobreponham.

### O perfil `voip` — conteúdo e a base do mestre

Composição pedida pelo usuário: **desenvolvimento, telecom e integrações**. É o
perfil que reúne os três eixos que o histórico já sustenta sem nenhum
reenquadramento — arquitetura de PBX e SBC, desenvolvimento de appliances e
APIs sobre telefonia, e integração entre plataformas (Teams, gateways de
WhatsApp, Yeastar, NextQualify, brokers).

Isso produz uma propriedade útil para a implementação: **o `bullets.base` do
mestre é a voz VoIP**, porque é assim que o currículo atual já está escrito.
Os outros sete perfis é que sobrescrevem. Migrar o conteúdo para o mestre vira
basicamente copiar o CV de hoje para `base` e depois escrever as variantes —
não há retrabalho de tradução para a área de origem.

### Medir o `voip` é impossível com o dataset atual

Nenhuma das 1.129 vagas coletadas cita Asterisk, VoIP, SIP, PABX ou Kamailio, e
não existe categoria de telecom entre as 30 coletadas. O `filtro_termos` do
perfil `voip` casaria **zero vagas**.

Isso obriga uma regra explícita na ferramenta: **"nenhuma vaga no alvo" não é
0% de aderência.** São conclusões opostas — uma diz "seu CV não fala a língua
do mercado", a outra diz "não há mercado medido aqui". Confundir as duas
produziria exatamente a leitura errada que este documento tenta evitar em
relação ao VoIP.

Quando o alvo não casa nenhuma vaga, `aderencia.js` deve **encerrar com aviso
explicando que o alvo não foi coletado**, sem gravar relatório e sem imprimir
percentual algum.

Enquanto não houver coleta de telecom, o perfil `voip` é gerado e utilizável
como currículo — só não é otimizável por medição. O que é aceitável: ele
descreve a área onde o usuário tem 10+ anos e não precisa de ajuste fino por
palavra-chave para ser competitivo.

### O perfil `ia` — o mais promissor da medição

**36 vagas** citam IA/ML e o CV atual já marca **60%** nelas — a segunda maior
aderência medida, acima de `dev` (50%) e `devops` (52%). Distribuição: 13 em
Analista de Dados, 11 em Desenvolvedor, 3 em Engenheiro de Software, e o resto
espalhado — por isso é medido por `filtro_termos` e não por categoria.

São vagas sênior reais, não menções de passagem: *"Engenheiro de Inteligência
Artificial Sênior (Martech / AI Agents)"*, *"Engenheiro de Desenvolvimento de
Produtos de IA"*, *"Agentes IA e Arquitetura Distribuída"*, *"Desenvolvedor IA
- Pleno"*.

O que orienta a redação deste perfil: **o mercado aqui pede IA genérica e
agentes, não framework específico.**

| Termo | Vagas |
|---|---|
| inteligência artificial | 12 |
| machine learning | 2 |
| IA generativa | 2 |
| LLM | 2 |
| TensorFlow / PyTorch / OpenAI / LangChain / NLP | 0 |

Ninguém pede TensorFlow ou LangChain; pedem quem saiba construir produto e
agente com IA. Isso favorece exatamente o que o histórico sustenta —
orquestração multi-provedor com fallback, inferência local em CPU, prompt
engineering estruturado com saída validada, avaliação comparativa de modelos e
MCP — em vez de credencial acadêmica de ML.

Reforço de formação: **Bacharelado em Ciências de Inteligência Artificial** em
curso, que ancora o perfil sem depender de certificação de framework.

### O caso especial do RPA

RPA **não é uma das 30 categorias coletadas**. As 15 vagas que citam o assunto
estão espalhadas por cinco categorias (5 Desenvolvedor, 4 Analista de Sistemas,
3 Segurança, 2 DevOps, 1 QA) e não são vagas de RPA — são vagas de outra coisa
que mencionam automação de passagem.

Por isso o perfil `rpa` é medido por **filtro de termo** sobre o texto das
vagas, não por categoria (ver `filtro_termos` no formato da receita).

Medição das ferramentas que o mercado de RPA de fato contrata, no dataset:

| Ferramenta | Vagas |
|---|---|
| UiPath | 0 |
| Blue Prism | 0 |
| Automation Anywhere | 0 |
| Power Automate | 2 |
| Selenium | 4 |
| Puppeteer (o usado no projeto próprio) | 0 |

A experiência de automação do usuário é Puppeteer artesanal; o mercado de RPA
contrata plataforma proprietária. **É lacuna de ferramenta, não de redação** —
um CV focado não resolve sozinho, do mesmo modo que Azure ou SQL Server não se
resolvem escrevendo melhor. O perfil `rpa` é construído a pedido do usuário,
com essa limitação registrada; se a medição confirmar aderência baixa, a
conclusão a tirar é sobre estudar UiPath, não sobre reescrever o currículo.

## Medição

`node ferramentas/aderencia.js --perfil=dev`:

1. lê `cv/dev/cv.txt` em vez de `cv/cv.txt`;
2. seleciona as vagas por `categorias_alvo` **ou** `filtro_termos` da receita,
   em vez da lista fixa de oito categorias;
3. grava o relatório em `aderencia/AAAA-MM-DD-aderencia-dev.md`.

Sem `--perfil`, o comportamento atual é preservado (CV genérico, oito
categorias de TI).

O laço de trabalho passa a ser: gerar, medir, ajustar o mestre, medir de novo —
com número em vez de opinião.

## Saídas

- **`cv.txt`** — texto puro, é o que a ferramenta de aderência lê e o que os
  bots consomem.
- **`cv.html`** — reaproveita o layout de `cv/cv-2026-07.html` (tema
  claro/escuro, CSS de impressão A4), **sem** o botão "Destacar inclusões", que
  era um recurso de revisão pontual.
- **PDF** — gerado pelo navegador a partir do HTML. Fora do escopo automatizar.

São 16 artefatos no total: oito perfis × (`cv.txt` + `cv.html`).

## Sincronia com os bots

O perfil marcado `padrao: true` é copiado para `bots/infojobs/cv.txt` e
`bots/vagas/cv.txt` do `vagas-automation-suite`. O gerador imprime o comando de
cópia ao final; não escreve em outro repositório por conta própria.

## Testes

Lógica pura em `ferramentas/lib/`, testada com o runner nativo do Node
(`node --test`), sem disco nem rede:

- resolução de bullet usa a variante do perfil quando existe;
- resolução cai em `base` quando não existe variante;
- item sem variante e sem `base` aborta com mensagem apontando item e perfil;
- `ordem` respeitada na montagem;
- receita com `categorias_alvo` e `filtro_termos` juntos é rejeitada;
- receita sem nenhum dos dois é rejeitada;
- alvo que casa zero vagas produz aviso de "alvo não coletado", nunca 0%;
- `incluir_*` respeita a ordem do array e ignora id inexistente com aviso;
- fatos (empresa, cargo, período) idênticos entre dois perfis quaisquer;
- exatamente um perfil com `padrao: true`.

## Fora de escopo

- Gerar PDF automaticamente.
- Coletar vagas de telecom/VoIP. **Continua fora do escopo deste trabalho, mas
  deixou de ser opcional:** sem essa coleta o perfil `voip` é gerado e não
  medido, e a tabela de aderência segue enviesada contra a área mais forte do
  histórico. É a próxima frente natural depois desta.
- Trocar o CV por candidatura nos bots — depende de confirmar se InfoJobs e
  Vagas.com.br aceitam anexo diferente por vaga, o que nunca foi verificado.
- Reescrever a ferramenta de aderência; ela só ganha o argumento `--perfil`.

## Riscos e ressalvas

**O dataset não tem VoIP.** Nenhuma das 1.129 vagas cita Asterisk, VoIP, SIP,
PABX ou Kamailio, e não há categoria de telecom entre as 30 coletadas — a lista
é uma varredura genérica de mercado com apenas 8 categorias de TI. A maior
especialidade do currículo aparece com demanda zero **por falta de coleta**.
Otimizar cegamente contra esta medição empurra a carreira para longe da maior
força. A decisão de migrar de área foi tomada pelo usuário com esse dado à
vista, mas a ressalva fica registrada — e ganhou consequência prática: o perfil
`voip` existe e não pode ser medido até que a coleta cubra telecom.

**Aderência não é empregabilidade.** A métrica compara palavras do CV com
palavras do requisito. Mede se o currículo fala a língua da vaga — não mede
competência, senioridade nem desempenho em entrevista.

**Reenquadrar não é inventar.** Descrever a mesma entrega por outro ângulo é
legítimo; atribuir-se responsabilidade que não existiu não é. Cada bullet de
perfil precisa ser defensável em entrevista sobre aquele emprego.

**O `cv.pdf` atual está desatualizado** em relação ao `cv.txt` — pendência
anterior a este trabalho, que se multiplica por oito aqui.

## Critério de sucesso

1. `node ferramentas/gerar-cv.js` produz os 16 artefatos sem edição manual.
2. Os testes de consistência passam — em particular, fatos idênticos entre
   perfis.
3. Cada perfil pontua, no seu alvo de medição, **mais** que a linha de base da
   tabela de perfis. Duas exceções conhecidas e aceitas:
   - `rpa` não tem linha de base e pode não superar nada — é lacuna de
     ferramenta (UiPath), não de redação;
   - `voip` não é mensurável enquanto não houver coleta de telecom; entrega-se
     gerado, com o aviso de alvo não coletado.
4. O repositório continua rodando após um clone limpo, sem `npm install`.
