/// Datas de inicio e fim de cada semestre letivo.
///
/// Os JSONs do CAGR trazem apenas dia da semana e horario — nao ha nenhuma data
/// nas turmas. A exportacao para calendario precisa de um intervalo para repetir
/// as aulas, entao mantemos aqui uma tabela do calendario academico da UFSC,
/// sempre editavel pelo usuario na hora de exportar.

export interface SemesterRange {
    /// Formato `YYYY-MM-DD`, igual ao aceito por `<input type="date">`.
    inicio: string;
    fim: string;
}

/// Datas do calendario academico da UFSC. Atualize conforme as resolucoes saem;
/// semestres ausentes caem na estimativa de `estimateSemesterRange`.
const CALENDARIO_ACADEMICO: Record<string, SemesterRange> = {
    "20251": { inicio: "2025-03-10", fim: "2025-07-12" },
    "20252": { inicio: "2025-08-04", fim: "2025-12-06" },
    "20261": { inicio: "2026-03-09", fim: "2026-07-11" },
    "20262": { inicio: "2026-08-03", fim: "2026-12-05" },
};

/// Estimativa para semestres fora da tabela: aproxima o padrao historico da
/// UFSC (inicio em marco / agosto, fim em julho / dezembro).
function estimateSemesterRange(semester: string): SemesterRange {
    const year = Number(semester.slice(0, 4));
    const half = semester.slice(4);

    if (!Number.isFinite(year)) {
        const now = new Date();
        const iso = now.toISOString().slice(0, 10);
        return { inicio: iso, fim: iso };
    }

    return half === "1"
        ? { inicio: `${year}-03-10`, fim: `${year}-07-10` }
        : { inicio: `${year}-08-05`, fim: `${year}-12-10` };
}

export function getSemesterRange(semester: string): SemesterRange {
    return CALENDARIO_ACADEMICO[semester] ?? estimateSemesterRange(semester);
}

/// Verdadeiro quando o intervalo veio da tabela oficial, e nao de uma estimativa.
export function isKnownSemester(semester: string): boolean {
    return semester in CALENDARIO_ACADEMICO;
}

/// Intervalo que cobre todos os semestres do plano — um plano pode misturar
/// semestres, ainda que raramente.
export function getRangeForSemesters(semesters: readonly string[]): SemesterRange {
    const ranges = semesters.map(getSemesterRange);
    if (ranges.length === 0) return estimateSemesterRange("");

    return {
        inicio: ranges.reduce((min, range) => (range.inicio < min ? range.inicio : min), ranges[0].inicio),
        fim: ranges.reduce((max, range) => (range.fim > max ? range.fim : max), ranges[0].fim),
    };
}
