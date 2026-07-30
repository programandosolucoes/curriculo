# Comparativo dos nove perfis — 2026-07-30

Mede cada currículo focado contra **o alvo dele**, e compara com o currículo
genérico medido **nas mesmas vagas**. É a única comparação honesta: comparar
com percentuais obtidos sobre outro conjunto de vagas não diria nada.

- **Fonte:** `dados/vagas-coletadas.json` (1.129 vagas, 30 categorias)
- **Vocabulário:** `ferramentas/lib/termos-mercado.js` (379 termos)
- **Reproduzir:** `node ferramentas/aderencia.js --perfil=<id>`

## Resultado

| Perfil | Vagas no alvo | CV genérico | CV focado | Ganho |
|---|---|---|---|---|
| `qa` | 21 | 42% | **56%** | **+14 pp** |
| `rpa` | 46 | 46% | **59%** | **+13 pp** |
| `frontend` | 22 | 56% | **62%** | **+6 pp** |
| `dev` | 62 | 50% | **53%** | **+3 pp** |
| `ia` | 15 | 52% | **53%** | +1 pp |
| `dados` | 32 | 64% | 64% | 0 |
| `seguranca` | 33 | 27% | 27% | 0 |
| `devops` | 53 | 47% | 46% | **−1 pp** |
| `voip` | **0** | — | — | alvo não coletado |

## O que esses números dizem, e o que não dizem

### A métrica favorece currículo longo, por construção

A aderência é *proporção dos termos que a vaga pede e o currículo cobre*. O
currículo genérico contém **216 termos** do vocabulário; um focado contém cerca
de **140**, porque inclui menos seções de propósito.

Quanto mais termos, mais cobertura — independente de fazerem sentido para a
vaga. Então o currículo focado só ganha quando o reenquadramento **acrescenta
vocabulário que aquelas vagas realmente pedem**, o bastante para compensar o
que foi cortado.

É exatamente o que se vê:

- **`qa` e `rpa` ganham muito** (+14 e +13) porque o reenquadramento foi o mais
  agressivo. O termo "automação de processos", pedido em 10 das 15 vagas de
  RPA, simplesmente não existia no currículo genérico.
- **`frontend` e `dev` ganham** (+6 e +3): há vocabulário próprio a acrescentar.
- **`dados`, `seguranca` e `devops` empatam ou perdem 1 ponto.** Não é falha do
  perfil: é que o currículo genérico **já dizia** o que essas vagas pedem.
  Focar não tinha o que acrescentar, e tinha o que cortar.

### Ajuste aplicado no meio da medição

A primeira medição deu `devops` −7 pp e `seguranca` −2 pp. Diagnosticando o que
o currículo focado perdia e as vagas pediam:

| Perfil | Termos perdidos que as vagas pedem |
|---|---|
| `devops` | power bi (6 vagas), microsserviços (3), gitlab (2), react (2), rpa (2) |
| `seguranca` | alta disponibilidade (1 vaga) |
| `dados` | nenhum |

Dois termos verdadeiros estavam faltando dos grupos de competência —
"microsserviços" (feito na 55PBX) e "alta disponibilidade" (99,99% de uptime) —
e foram acrescentados ao mestre. Os perfis `devops` e `seguranca` passaram a
incluir também os grupos de dados e qualidade, que descrevem experiência real.

Resultado: `devops` foi de −7 para −1, `seguranca` de −2 para 0.

**Não fui além disso de propósito.** Continuar ajustando seria otimizar para a
métrica em vez de para quem lê. `gitlab`, por exemplo, é pedido em 2 vagas e
não está no currículo — mas o histórico é Bitbucket e Jenkins, e escrever
GitLab para ganhar 2 pontos seria mentira barata.

### O `seguranca` tem um recado

27% é a menor aderência de todas, e **não muda com redação**. As vagas de
Segurança da Informação pedem LGPD, ISO 27001 e SIEM — que não aparecem em
nenhum dos 30 repositórios nem no histórico profissional. É lacuna de
conteúdo, não de currículo. Um CV focado não resolve; estudo resolve.

### O `voip` não é mensurável

Nenhuma das 1.129 vagas cita Asterisk, VoIP, SIP, PABX ou Kamailio, porque
telecom não está entre as 30 categorias coletadas. A ferramenta encerra com
aviso e código 2 em vez de imprimir 0% — são conclusões opostas, e confundi-las
seria o pior erro possível para a área mais forte do histórico.

O currículo `voip` está gerado e é utilizável. Só não é ajustável por medição
até que haja coleta de telecom.

## Conclusão prática

**Onde o currículo focado vale a pena por ATS:** `qa`, `rpa`, `frontend`, `dev`.
O reenquadramento acrescenta vocabulário que essas vagas pedem.

**Onde vale por outro motivo:** `dados`, `devops`, `seguranca`. O ganho de
palavra-chave é nulo, mas o currículo focado ainda é melhor para o **humano**
que lê depois do filtro — conta uma história coerente com a vaga em vez de
listar dez anos de tudo. A métrica não mede isso.

**Onde não resolve:** `seguranca`, enquanto faltarem LGPD, ISO 27001 e SIEM.

**Sobre o perfil padrão:** `dev` está marcado, por ter o maior alvo (62 vagas).
Se o critério for aderência, `dados` (64%) e `frontend` (62%) pontuam mais, mas
sobre alvos menores. Decisão em aberto.
