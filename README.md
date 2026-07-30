# curriculo

Currículo de Carlos Alberto em **nove versões**, uma por área-alvo, geradas a
partir de um único arquivo de conteúdo — e a ferramenta que mede a aderência de
cada uma às vagas reais do mercado.

Separado do `vagas-automation-suite` de propósito: lá é **código** de
automação; aqui é **conteúdo de carreira**.

## Rodando depois do clone

Sem `npm install`, banco, chave de API ou rede. Só Node.js 18+:

```bash
node ferramentas/gerar-cv.js                # gera os 9 currículos (18 arquivos)
node ferramentas/aderencia.js --perfil=dev  # o que o mercado pede e falta no CV
node ferramentas/simular-ats.js --perfil=dev  # quais vagas chamariam, e por quê
node --test 'ferramentas/**/*.test.js'      # 70 testes
```

Para ver um currículo, abra o HTML no navegador:

```bash
xdg-open cv/dev/cv.html
```

Cada HTML tem, no topo, botões de **Baixar PDF** (pela impressão do navegador,
que preserva texto selecionável) e **Baixar Word (.doc)**. Os botões somem na
impressão e não entram no arquivo Word.

## Os nove perfis

| Perfil | Título | Alvo de medição | Aderência |
|---|---|---|---|
| `voip` | Arquiteto de Soluções VoIP Sênior | termo (sem vagas coletadas) | não mensurável |
| `ia` | Engenheiro de Inteligência Artificial (IA) Sênior | termo | 53% |
| `dev` | Desenvolvedor Backend Sênior ⭐ | Desenvolvedor, Eng. de Software | 53% |
| `frontend` | Desenvolvedor Frontend Sênior | termo | 62% |
| `devops` | Engenheiro DevOps / SRE Sênior | DevOps, Analista de Sistemas | 46% |
| `dados` | Engenheiro de Dados / Business Intelligence | Analista de Dados | 64% |
| `seguranca` | Analista de Segurança da Informação Sênior | Segurança da Informação | 27% |
| `qa` | Analista de QA / Automação de Testes Sênior | QA | 56% |
| `rpa` | Especialista em Automação de Processos (RPA) e Integração | termo | 59% |

⭐ = perfil padrão, o que vai para o `cv.txt` dos bots de candidatura.

Comparativo completo, com o que os números dizem e o que não dizem:
[aderencia/2026-07-30-comparativo-perfis.md](aderencia/2026-07-30-comparativo-perfis.md).

## Como editar o currículo

> **Nunca edite `cv/<perfil>/cv.txt` ou `cv.html`.** São gerados, e a próxima
> execução de `gerar-cv.js` sobrescreve.

| O que mudar | Onde |
|---|---|
| Texto, fatos, variantes por perfil | `cv/mestre.json` |
| Título, ordem das seções, o que incluir, alvo | `perfis/<id>.json` |
| Vocabulário de termos de mercado | `ferramentas/lib/termos-mercado.js` |

Depois de editar, rode `node ferramentas/gerar-cv.js`.

### Por que mestre e receita

Os **fatos** — empresa, cargo, período, local — existem **uma vez só**, no
mestre. Não têm variante por perfil, então é impossível duas versões do
currículo se contradizerem em datas. Um teste compara todos os perfis entre si
e falha se divergirem.

O que varia por perfil é a **ênfase**: cada item guarda um `bullets.base` e,
opcionalmente, uma variante por perfil. A receita só seleciona e ordena — não
contém nenhuma frase de currículo.

## Estrutura

```
cv/
  mestre.json          único lugar onde se escreve conteúdo
  <perfil>/cv.txt      gerado — é o que a aderência lê e os bots consomem
  <perfil>/cv.html     gerado — para revisar e exportar PDF/Word
perfis/
  <id>.json            receita: título, ordem, o que incluir, alvo de medição
ferramentas/
  gerar-cv.js          mestre + receitas -> os 18 arquivos
  aderencia.js         mede um currículo contra as vagas
  exportar-snapshot.js regera dados/vagas-coletadas.json
  lib/                 lógica pura, testada
dados/
  vagas-coletadas.json 1.129 vagas reais em 30 categorias
aderencia/             relatórios gerados
docs/
  DIARIO.md            decisões e achados, em ordem — comece por aqui
  PROXIMAS_FRENTES.md  o que está enfileirado
  CV_ESTRATEGIA.md     inventário técnico dos projetos, com evidência
  superpowers/         spec e plano do multi-perfil
```

## O simulador de ATS

`ferramentas/simular-ats.js` responde o que a aderência não responde: **quais
vagas chamariam este currículo, e por que as outras não.**

Simula as duas etapas na ordem em que um ATS faz:

1. **Estrutura** — extrai contato, seções, empregos, datas e tempo de carreira,
   e relata o que não conseguiu ler. Currículo que falha aqui é descartado
   antes de qualquer comparação com a vaga: é assim que candidato bom cai por
   causa de layout.
2. **Palavra-chave** — só então compara os termos exigidos, com limiar
   configurável (`--limiar=0.5`).

A saída de maior valor é o **ranking de termos que mais bloqueiam**: diz quais
poucas lacunas destravariam mais vagas.

```bash
node ferramentas/simular-ats.js --perfil=dev          # contra o alvo do perfil
node ferramentas/simular-ats.js --perfil=dev --todas  # contra as 1.129 vagas
```

Vaga com menos de 3 termos reconhecidos vira *indeterminado*, e as
indeterminadas ficam fora do denominador da taxa de aprovação — contá-las
inventaria reprovação que não houve. O tempo de carreira é contado pela
**união** dos períodos, não pela soma: contratos paralelos não viram o dobro
de experiência.

## A ferramenta de aderência

Cruza os termos técnicos de um `cv.txt` com os requisitos das vagas e responde:

- **aderência média** — quanto do que aquelas vagas pedem já está escrito;
- **lacunas ranqueadas** — os termos mais pedidos que o currículo não menciona.

Sem `--perfil`, mede o currículo genérico contra as 8 categorias de TI.

**Duas regras que a prática impôs.** O casamento de termo usa fronteira de
palavra, nunca substring: buscar `ios` por substring casou 929 vagas, batendo
dentro de "negóc**ios**" e "benefíc**ios**". E alvo sem nenhuma vaga encerra
com aviso, nunca com 0% — "seu currículo não fala a língua do mercado" e "não
há mercado medido aqui" são conclusões opostas.

### Atualizando o snapshot de vagas

```bash
node ferramentas/exportar-snapshot.js
```

Lê o `coleta.db` do `vagas-automation-suite`. Passe outro caminho como
argumento se o repositório estiver em outro lugar.

## Sincronia com os bots de candidatura

Os bots leem o CV em runtime, em `bots/infojobs/cv.txt` e `bots/vagas/cv.txt`
do `vagas-automation-suite`. O `gerar-cv.js` imprime o comando de cópia ao
final; ele não escreve em outro repositório por conta própria.

```bash
cp cv/dev/cv.txt ../vagas-automation-suite/bots/infojobs/cv.txt
cp cv/dev/cv.txt ../vagas-automation-suite/bots/vagas/cv.txt
```

## Pendências

Ver [docs/PROXIMAS_FRENTES.md](docs/PROXIMAS_FRENTES.md). As principais: o
simulador de ATS, coletar vagas de telecom para tornar o perfil `voip`
mensurável, e regerar o `cv.pdf`, que ainda é anterior a todo este trabalho.
