export const DIAS_SEMANA = [1, 2, 3, 4, 5, 6, 7];

export const HORAS = [
    "0730",
    "0820",
    "0910",
    "1010",
    "1100",
    "1330",
    "1420",
    "1510",
    "1620",
    "1710",
    "1830",
    "1920",
    "2020",
    "2110",
];

/// Horario de termino de cada indice de `HORAS`. Usado na exportacao para
/// calendario, onde um evento precisa de um fim explicito.
export const HORAS_FIM = [
    "0820",
    "0910",
    "1000",
    "1100",
    "1150",
    "1420",
    "1510",
    "1600",
    "1710",
    "1800",
    "1920",
    "2010",
    "2110",
    "2200",
];

/// Indices de `HORAS` que iniciam um turno (manha, tarde, noite). Aulas nunca
/// atravessam essas fronteiras, entao a exportacao quebra o evento nelas.
export const INICIOS_DE_TURNO = [0, 5, 10];

export const COLORS = [
    "lightblue",
    // "lightcoral",
    "lightcyan",
    "lightgoldenrodyellow",
    "lightgray",
    "lightgreen",
    "lightpink",
    "lightsalmon",
    "lightseagreen",
    "lightskyblue",
    // "lightslategray",
    "lightsteelblue",
    "lightyellow",
];
