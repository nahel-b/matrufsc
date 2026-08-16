# MatrUFSC

MatrUFSC é um planejador de matrícula para cursos de graduação na UFSC. Monte e simule combinações de matérias e turmas para planejar sua matrícula.

Este fork está publicado em [nahel-b.github.io/matrufsc](https://nahel-b.github.io/matrufsc/); o projeto original fica em [matrufsc.github.io](https://matrufsc.github.io/).

## Exportar para o calendário

Com uma combinação montada, use **Salvar → Exportar calendário** para baixar um arquivo `.ics` com as aulas repetidas semanalmente até o fim do semestre, incluindo sala e professores. O arquivo é importável no Google Agenda, no Calendário do iPhone e em qualquer app compatível.

As datas de início e fim do semestre não vêm do CAGR: elas saem da tabela em [`semesterDates.ts`](matrufsc/src/lib/semesterDates.ts) e podem ser ajustadas na hora de exportar. Feriados e recessos não são removidos.

## Guias

- [Contribuindo](CONTRIBUTING.md)

## Reconhecimentos

Esse projeto foi fortemente baseado no [caravelahc/capim](https://github.com/caravelahc/capim) e, em sua essência, consiste em uma repaginação visual e estrutural do mesmo. Fica aqui o reconhecimento pela qualidade do trabalho original.

_Este projeto não possui vínculo oficial com a UFSC_
