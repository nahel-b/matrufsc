import { describe, test } from "node:test";
import assert from "node:assert";
import { buildIcs } from "~/lib/ics";
import type { Plano } from "~/context/plano/Plano.store";

function makePlano(overrides: {
    aulas: { dia_semana: number; horarios: number[]; sala: string }[];
    professores?: string[];
    nome?: string;
}): Plano {
    return [
        {
            materia: {
                id: "INE5408",
                nome: overrides.nome ?? "Estruturas de Dados",
                campus: "FLO",
                semester: "20261",
                turmas: [],
                selected: true,
            },
            turma: {
                id: "04208",
                carga_horaria: 72,
                vagas_ofertadas: 40,
                vagas_ocupadas: 30,
                aulas: overrides.aulas,
                professores: overrides.professores ?? ["Fulano de Tal"],
                selected: true,
            },
        },
    ];
}

const RANGE = { inicio: "2026-03-09", fim: "2026-07-11", calendarName: "MatrUFSC 2026.1" };

/// Desdobra as linhas (RFC 5545) para facilitar as asserções.
function unfold(ics: string) {
    return ics.replace(/\r\n /g, "").split("\r\n");
}

describe("buildIcs", () => {
    test("gera um evento semanal no primeiro dia correspondente do semestre", () => {
        // 2026-03-09 é uma segunda-feira; dia_semana 3 = terça => 2026-03-10.
        const ics = buildIcs(makePlano({ aulas: [{ dia_semana: 3, horarios: [0, 1, 2], sala: "CTC-CTC101" }] }), RANGE);
        const linhas = unfold(ics);

        assert.ok(linhas.includes("DTSTART;TZID=America/Sao_Paulo:20260310T073000"));
        assert.ok(linhas.includes("DTEND;TZID=America/Sao_Paulo:20260310T100000"));
        assert.ok(linhas.includes("RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20260712T025959Z"));
        assert.ok(linhas.includes("LOCATION:CTC-CTC101"));
        assert.ok(linhas.includes("SUMMARY:INE5408 - Estruturas de Dados (04208)"));
        assert.ok(linhas.includes("DESCRIPTION:Professores: Fulano de Tal"));
    });

    test("mantém o dia da semana quando o semestre começa nele", () => {
        // dia_semana 2 = segunda, igual ao início do semestre.
        const ics = buildIcs(makePlano({ aulas: [{ dia_semana: 2, horarios: [0], sala: "A" }] }), RANGE);

        assert.ok(unfold(ics).includes("DTSTART;TZID=America/Sao_Paulo:20260309T073000"));
    });

    test("quebra o evento na fronteira entre turnos", () => {
        // Índices 3, 4, 5: 10:10–11:50 (manhã) e 13:30–14:20 (tarde).
        const ics = buildIcs(makePlano({ aulas: [{ dia_semana: 2, horarios: [3, 4, 5], sala: "A" }] }), RANGE);
        const linhas = unfold(ics);

        assert.strictEqual(linhas.filter((linha) => linha === "BEGIN:VEVENT").length, 2);
        assert.ok(linhas.includes("DTSTART;TZID=America/Sao_Paulo:20260309T101000"));
        assert.ok(linhas.includes("DTEND;TZID=America/Sao_Paulo:20260309T115000"));
        assert.ok(linhas.includes("DTSTART;TZID=America/Sao_Paulo:20260309T133000"));
        assert.ok(linhas.includes("DTEND;TZID=America/Sao_Paulo:20260309T142000"));
    });

    test("escapa vírgulas e dobra linhas longas em 75 octetos", () => {
        const ics = buildIcs(
            makePlano({
                aulas: [{ dia_semana: 2, horarios: [0], sala: "A" }],
                professores: ["Ana Paula Gonçalves", "Bernardo Sá Nogueira", "Carla Antônia Ferrão"],
            }),
            RANGE,
        );

        const encoder = new TextEncoder();
        for (const linha of ics.split("\r\n")) {
            assert.ok(encoder.encode(linha).length <= 75, `linha longa demais: ${linha}`);
        }

        assert.ok(
            unfold(ics).includes(
                "DESCRIPTION:Professores: Ana Paula Gonçalves\\, Bernardo Sá Nogueira\\, Carla Antônia Ferrão",
            ),
        );
    });

    test("emite um calendário válido e vazio quando nada cabe no intervalo", () => {
        // Sábado (7), num intervalo de uma única segunda-feira.
        const ics = buildIcs(makePlano({ aulas: [{ dia_semana: 7, horarios: [0], sala: "A" }] }), {
            ...RANGE,
            inicio: "2026-03-09",
            fim: "2026-03-10",
        });

        assert.ok(!ics.includes("BEGIN:VEVENT"));
        assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
        assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
    });

    test("rejeita datas inválidas ou invertidas", () => {
        const plano = makePlano({ aulas: [{ dia_semana: 2, horarios: [0], sala: "A" }] });

        assert.throws(() => buildIcs(plano, { ...RANGE, inicio: "09/03/2026" }));
        assert.throws(() => buildIcs(plano, { ...RANGE, inicio: "2026-07-11", fim: "2026-03-09" }));
    });
});
