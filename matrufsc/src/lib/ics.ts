/// Geracao de um arquivo iCalendar (RFC 5545) a partir de uma combinacao de
/// turmas. O arquivo resultante e importavel no Google Agenda, Apple Calendario
/// e qualquer outro cliente compativel.

import type { Plano } from "~/context/plano/Plano.store";
import { HORAS, HORAS_FIM, INICIOS_DE_TURNO } from "~/context/plano/constants";
import type { SemesterRange } from "~/lib/semesterDates";

const PRODID = "-//MatrUFSC//Planejador de matricula//PT-BR";

/// A UFSC nao observa horario de verao desde 2019, entao um unico componente
/// STANDARD descreve o fuso inteiro.
const TZID = "America/Sao_Paulo";
const VTIMEZONE = [
    "BEGIN:VTIMEZONE",
    `TZID:${TZID}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0300",
    "TZNAME:-03",
    "END:STANDARD",
    "END:VTIMEZONE",
];

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export interface IcsOptions extends SemesterRange {
    /// Nome exibido por clientes que respeitam `X-WR-CALNAME`.
    calendarName: string;
}

/// Quebra os indices de uma aula em blocos contiguos que nao atravessam turnos,
/// para que cada bloco vire um evento com inicio e fim reais.
function blocosContiguos(horarios: readonly number[]): number[][] {
    const ordenados = [...horarios].sort((a, b) => a - b);
    const blocos: number[][] = [];

    for (const horario of ordenados) {
        const atual = blocos[blocos.length - 1];
        const continua = atual && horario === atual[atual.length - 1] + 1 && !INICIOS_DE_TURNO.includes(horario);

        if (continua) atual.push(horario);
        else blocos.push([horario]);
    }

    return blocos;
}

/// `YYYY-MM-DD` -> `Date` ancorado em UTC, para que a aritmetica de dias e o dia
/// da semana nao dependam do fuso de quem esta exportando.
function parseISODate(iso: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return null;

    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 86_400_000);
}

/// Primeira data >= `inicio` que cai no dia da semana pedido.
/// `dia_semana` usa a convencao do CAGR: 1 = domingo, ..., 7 = sabado.
function primeiraOcorrencia(inicio: Date, diaSemana: number): Date {
    const alvo = diaSemana - 1; // para a convencao de `Date.getUTCDay()`
    return addDays(inicio, (alvo - inicio.getUTCDay() + 7) % 7);
}

/// `UNTIL` e obrigatoriamente UTC. 23:59:59 em -03:00 equivale a 02:59:59Z do
/// dia seguinte.
function formatUntil(fim: Date): string {
    return `${formatDate(addDays(fim, 1))}T025959Z`;
}

function formatTimestamp(date: Date): string {
    return `${date.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

/// Escapa os caracteres reservados de um valor de texto (RFC 5545, secao 3.3.11).
function escapeText(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/// Dobra linhas em 75 octetos, medindo em UTF-8 para nao partir acentos —
/// nomes de disciplinas e professores estao cheios deles.
function foldLine(line: string): string {
    const encoder = new TextEncoder();
    if (encoder.encode(line).length <= 75) return line;

    const partes: string[] = [];
    let atual = "";
    let bytes = 0;
    let limite = 75;

    for (const char of line) {
        const tamanho = encoder.encode(char).length;

        if (bytes + tamanho > limite) {
            partes.push(atual);
            atual = "";
            bytes = 1; // o espaco de continuacao conta para o limite da linha
            limite = 75;
        }

        atual += char;
        bytes += tamanho;
    }

    if (atual) partes.push(atual);

    return partes.join("\r\n ");
}

export function buildIcs(plano: Plano, options: IcsOptions): string {
    const inicio = parseISODate(options.inicio);
    const fim = parseISODate(options.fim);

    if (!inicio || !fim) throw new Error("Datas de inicio e fim invalidas.");
    if (fim < inicio) throw new Error("A data de fim precisa ser posterior a data de inicio.");

    const dtstamp = formatTimestamp(new Date());
    const until = formatUntil(fim);

    const linhas: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:${PRODID}`,
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `X-WR-CALNAME:${escapeText(options.calendarName)}`,
        `X-WR-TIMEZONE:${TZID}`,
        ...VTIMEZONE,
    ];

    for (const { materia, turma } of plano) {
        for (const aula of turma.aulas) {
            for (const bloco of blocosContiguos(aula.horarios)) {
                const primeiro = bloco[0];
                const ultimo = bloco[bloco.length - 1];
                const horaInicio = HORAS[primeiro];
                const horaFim = HORAS_FIM[ultimo];
                if (!horaInicio || !horaFim) continue;

                const data = primeiraOcorrencia(inicio, aula.dia_semana);
                if (data > fim) continue; // nenhuma ocorrencia dentro do semestre

                const dataFormatada = formatDate(data);
                const uid = `${materia.id}-${turma.id}-${aula.dia_semana}-${horaInicio}@matrufsc`;

                linhas.push(
                    "BEGIN:VEVENT",
                    `UID:${uid}`,
                    `DTSTAMP:${dtstamp}`,
                    `SUMMARY:${escapeText(`${materia.id} - ${materia.nome} (${turma.id})`)}`,
                    `DTSTART;TZID=${TZID}:${dataFormatada}T${horaInicio}00`,
                    `DTEND;TZID=${TZID}:${dataFormatada}T${horaFim}00`,
                    `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[aula.dia_semana - 1]};UNTIL=${until}`,
                );

                if (aula.sala) linhas.push(`LOCATION:${escapeText(aula.sala)}`);
                if (turma.professores.length > 0) {
                    linhas.push(`DESCRIPTION:${escapeText(`Professores: ${turma.professores.join(", ")}`)}`);
                }

                linhas.push("END:VEVENT");
            }
        }
    }

    linhas.push("END:VCALENDAR");

    return linhas.map(foldLine).join("\r\n") + "\r\n";
}

/// Em telas de toque a folha de compartilhamento do sistema e o unico caminho
/// confiavel: o iOS ignora o atributo `download`, e dentro dos navegadores
/// embutidos em apps (Google, Gmail) o clique nao faz absolutamente nada. No
/// desktop o download classico continua sendo melhor, entao so desviamos aqui.
function shouldUseShareSheet(file: File): boolean {
    if (typeof navigator === "undefined" || !navigator.canShare) return false;
    if (!window.matchMedia?.("(pointer: coarse)").matches) return false;

    return navigator.canShare({ files: [file] });
}

export async function downloadIcs(content: string, fileName: string): Promise<void> {
    const file = new File([content], fileName, { type: "text/calendar" });

    if (shouldUseShareSheet(file)) {
        try {
            await navigator.share({ files: [file], title: fileName });
            return;
        } catch (error) {
            // Usuario fechou a folha de compartilhamento: nao e erro, e desistencia.
            if (error instanceof DOMException && error.name === "AbortError") return;
            // Qualquer outra falha cai no download classico abaixo.
            console.warn("Share sheet unavailable, falling back to download:", error);
        }
    }

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";

    // Alguns navegadores so disparam o download de um link presente no documento.
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revogar no mesmo tick cancela o download antes de ele comecar.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
