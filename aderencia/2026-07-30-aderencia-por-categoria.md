# Aderência do CV por categoria de vaga — 2026-07-30

Recorte do relatório geral de aderência: em vez de uma média única sobre todas
as vagas, quebra o resultado **por categoria** — o que responde "para qual tipo
de vaga meu CV já está pronto?" em vez de só "quanto do mercado eu cubro?".

- **Fonte:** `dados/vagas-coletadas.json` (1.129 vagas, 30 categorias).
- **CV medido:** `cv/cv.txt`, revisão de 07/2026 (216 termos reconhecidos).
- **Vocabulário:** `ferramentas/lib/termos-mercado.js`, 379 termos.
- **Base de cada linha:** só vagas com campo `requisitos` preenchido — sem isso
  a média não significa nada.
- **Reproduzir:** `node ferramentas/aderencia.js` gera o relatório geral; esta
  quebra por categoria foi calculada com as mesmas funções de `ferramentas/lib`.

## Categorias de TI

| Categoria | Vagas com requisitos | Aderência |
|---|---|---|
| **Analista de Dados** | 32 | **64%** |
| **DevOps** | 22 | **52%** |
| **Desenvolvedor** | 37 | **50%** |
| **Engenheiro de Software** | 25 | **48%** |
| **Analista de Sistemas** | 31 | **43%** |
| **QA** | 21 | **42%** |
| **Segurança da Informação** | 33 | **27%** |
| **Suporte Técnico** | 35 | **18%** |

## Demais categorias (contexto, não são alvo)

| Categoria | Vagas com requisitos | Aderência |
|---|---|---|
| Enfermagem | 9 | 100% |
| Administrativo | 7 | 78% |
| Recursos Humanos | 7 | 50% |
| Engenharia Civil | 9 | 33% |
| Marketing | 5 | 25% |
| Engenharia Mecânica | 10 | 25% |
| Financeiro | 3 | 0% |
| Contabilidade | 10 | 0% |
| Recepcionista | 10 | 0% |
| Vendas | 2 | — |
| Atendimento ao Cliente | 5 | — |
| Logística | 8 | — |
| Produção | 5 | — |
| Manutenção Industrial | 7 | — |
| Almoxarifado | 7 | — |
| Professor | 4 | — |
| Advogado | 7 | — |
| Psicologia | 5 | — |
| Design | 8 | — |
| Arquitetura | 6 | — |
| Motorista | 9 | — |

## Como ler esta tabela sem se enganar

**1. Falta VoIP/telecom — e isso não é sinal de mercado.** Nenhuma das 1.129
vagas cita Asterisk, VoIP, SIP, PABX ou Kamailio, e não existe categoria de
telecom entre as 30 coletadas. A lista de categorias é uma varredura genérica
de mercado (Farmácia, Motorista, Advogado…) com apenas 8 categorias de TI.
Ou seja: **a maior especialidade do CV tem demanda medida igual a zero porque
nunca foi coletada**, não porque o mercado não exista. Otimizar o CV contra
esta tabela, sem corrigir isso, empurraria a carreira para longe da maior
força — de propósito ou por acidente.

**2. Categorias fora de TI produzem número sem sentido.** "Enfermagem 100%"
não quer dizer nada: pouquíssimos termos do vocabulário aparecem naquelas
vagas, e por acaso todos estão no CV. Quando a base de termos reconhecidos é
minúscula, a porcentagem vira ruído. Só as 8 categorias de TI têm massa
suficiente para decisão. Um traço (—) significa que nenhum termo do
vocabulário foi reconhecido nas vagas daquela categoria.

**3. Aderência alta não é o mesmo que empregabilidade.** A métrica compara
palavras do CV com palavras do requisito. Ela mede o quanto o CV **fala a
língua** daquelas vagas — o que importa para triagem por ATS e para a leitura
de 20 segundos do recrutador. Não mede competência, nem senioridade, nem se
você passaria na entrevista técnica.

**4. Suporte Técnico é o caso a observar.** Tem o maior volume de vagas de TI
(35) e a menor aderência (18%). Não é falta de capacidade — é que essas vagas
pedem outro vocabulário (Windows, Office, helpdesk, atendimento ao usuário),
distante do perfil de arquitetura e desenvolvimento.

## O que fazer com isso

- **Antes de decidir foco por estes números**, coletar categorias de
  telecom/VoIP para a tabela ficar honesta.
- Categorias com aderência já alta (Analista de Dados, DevOps) indicam onde um
  CV focado dá retorno rápido — o vocabulário já está lá, falta ordená-lo.
- Categorias com aderência baixa e volume alto (Segurança, Suporte) indicam
  onde um CV focado **não** resolve sozinho: a lacuna é de conteúdo, não de
  redação.
