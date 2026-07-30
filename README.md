# curriculo

Repositório do currículo de Carlos Alberto: a fonte de verdade do CV, o
material de estratégia que sustenta cada afirmação escrita nele, e os
relatórios de aderência às vagas do mercado.

Separado do `vagas-automation-suite` de propósito: lá é **código** de
automação; aqui é **conteúdo de carreira**. O que os dois compartilham é
só o `cv.txt` (ver a nota de sincronia abaixo).

## Estrutura

```
cv/
  cv.txt              fonte de texto do CV — é este arquivo que os bots leem
  cv.pdf              versão em PDF atualmente anexada nas candidaturas
  cv-2026-07.html     revisão de 07/2026 para revisar no navegador e gerar PDF
docs/
  CV_ESTRATEGIA.md    documento vivo: inventário técnico dos projetos, decisões
                      de redação, datas e a base de evidência de cada uma
aderencia/
  AAAA-MM-DD-aderencia-cv.md   relatórios de aderência CV × vagas coletadas
```

## Como usar o `cv-2026-07.html`

Abra direto no navegador (`xdg-open cv/cv-2026-07.html`). Três controles no topo:

- **Destacar inclusões** — vem ligado; o amarelo é o que entrou nesta revisão.
  Desligue para ver como o currículo fica de verdade.
- **Tema** — claro/escuro.
- **Imprimir / PDF** — layout A4, sem destaques e sem a barra. É por aqui que
  se gera o PDF final.

## Nota de sincronia com o `vagas-automation-suite`

O `cv.txt` é **dependência de runtime** dos bots de automação: eles o leem em
`bots/infojobs/cv.txt` e `bots/vagas/cv.txt` para gerar respostas e calcular
aderência. Por isso ele existe nos dois lugares.

**Este repositório é a fonte de verdade.** Ao editar o CV aqui, copie o
arquivo de volta para as duas pastas dos bots — senão a automação continua
usando a versão antiga.

O `aderencia.js` da suite grava novos relatórios em `aderencia/` **lá**;
arquive aqui a cópia dos que valem a pena guardar.

## Estado atual (2026-07-30)

- `cv.txt` ainda é a versão **antiga** (133 linhas) — nada do material novo
  foi colado nele.
- `cv-2026-07.html` é a versão nova proposta, aguardando revisão.
- `CV_ESTRATEGIA.md` está completo: os 7 projetos inventariados a partir do
  código real, com datas fechadas e a base de evidência de cada uma.

Próximo passo: revisar o HTML, aprovar a redação e então converter para
`cv.txt` + regerar o `cv.pdf`.
