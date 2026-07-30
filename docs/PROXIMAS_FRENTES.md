# Próximas frentes

O que está enfileirado, com o suficiente para retomar sem reconstruir o
raciocínio. Frentes concluídas saem daqui e viram entrada no [DIARIO.md](DIARIO.md).

---

## 1. Simulador de ATS

**Pedido pelo usuário duas vezes.** Prioridade da fila.

### O que já existe e por que não basta

`ferramentas/aderencia.js` mede **sobreposição de palavras-chave** entre o
currículo e um conjunto de vagas. É útil para responder "o que o mercado pede
que não está escrito no meu CV", e foi o que orientou os nove perfis.

Mas não é o que um ATS faz. O ATS de verdade:

1. **Extrai** o texto do PDF ou DOC e tenta reconstruir a estrutura — nome,
   contato, seções, empregos, datas, formação.
2. **Descarta** currículos onde essa extração falha, antes de qualquer
   pontuação. Layout de duas colunas, texto em imagem e cabeçalho de seção
   criativo derrubam aqui.
3. **Pontua** contra uma vaga específica, não contra o mercado inteiro.
4. **Filtra** por critério eliminatório: anos de experiência, formação, palavra
   obrigatória.

A ferramenta atual só faz o passo 3, e de forma agregada.

### O que o simulador precisa entregar

- **Parser de currículo**: recebe o `cv.txt` de um perfil e devolve a estrutura
  que um ATS extrairia — contato, seções reconhecidas, lista de empregos com
  cargo/empresa/período, formação. Relatar o que **não** conseguiu extrair é
  tão importante quanto o que conseguiu.
- **Extração de palavras-chave por vaga**: dado o texto de uma vaga, separar o
  que é requisito obrigatório do que é desejável. As vagas coletadas trazem o
  campo `requisitos`; vale investigar se dá para distinguir os dois.
- **Pontuação vaga a vaga**, não agregada: para cada uma das 1.129 vagas, dizer
  se este currículo passaria da triagem e por quê.
- **Motivo da reprovação**: a saída mais valiosa. "Reprovado: a vaga exige
  Azure em requisito obrigatório" é acionável; "45% de aderência" não é.
- **Ranking inverso**: quais vagas do banco este currículo passaria, ordenadas
  por probabilidade. Isso transforma o simulador em ferramenta de busca.

### Restrições herdadas

- Zero dependências npm: precisa rodar após o clone com `node` puro.
- Casamento de termo sempre com fronteira de palavra, nunca substring — ver o
  caso do `ios` no [DIARIO.md](DIARIO.md#um-defeito-de-ferramenta-que-a-medição-expôs).
- "Nenhuma vaga no alvo" nunca deve ser reportado como 0%.

### Perguntas em aberto

- Testar contra o `cv.txt` (texto puro) ou simular a extração a partir do PDF?
  Extrair de PDF exigiria dependência; a alternativa honesta é testar o `.txt`
  e verificar as regras de layout separadamente, sobre o HTML.
- Quantos anos de experiência o simulador infere, e a partir de quê? O CV tem
  as datas, mas somar períodos sobrepostos (o usuário é PJ e atua em paralelo)
  daria número inflado.

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
