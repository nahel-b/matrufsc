/// Traducao das strings da interface. Os dados do CAGR (nomes de disciplinas,
/// professores, salas) nunca sao traduzidos — vem do sistema da UFSC como estao.

import { createSignal } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";

export type Locale = "pt" | "fr";

export const LOCALES: { value: Locale; label: string; htmlLang: string }[] = [
    { value: "pt", label: "Português", htmlLang: "pt-BR" },
    { value: "fr", label: "Français", htmlLang: "fr" },
];

const pt = {
    // Cabecalho
    salvar: "Salvar",
    exportarImagem: "Exportar imagem",
    exportando: "Exportando...",
    compartilharLink: "Compartilhar link",
    linkCopiado: "Link copiado",
    erroAoCopiar: "Erro ao copiar",
    idioma: "Idioma",
    // Busca
    pesquisarDisciplina: "Pesquisar disciplina",
    pesquisarDisciplinaAtualizando: "Pesquisar disciplina (atualizando...)",
    carregandoDisciplinas: "Carregando disciplinas...",
    materiaJaAdicionada: "{id} já adicionada ao plano",
    // Tabela de materias
    codigo: "Código",
    materia: "Matéria",
    creditos: "Créditos: {total}",
    conflitoComMateriasAcima: "Conflito com matéria(s) acima na lista",
    moverMateriaParaCima: "Mover matéria para cima",
    moverMateriaParaBaixo: "Mover matéria para baixo",
    removerMateria: "Remover matéria",
    // Tabela de turmas
    turma: "Turma",
    vagas: "Vagas",
    professores: "Professores",
    nenhumaTurmaDisponivel: "Nenhuma turma disponível para esta matéria.",
    vagasOcupadas: "Vagas ocupadas",
    pedidosSemVaga: "Pedidos sem vaga",
    vagasOfertadas: "Vagas ofertadas",
    fecharTurmas: "Fechar lista de turmas",
    // Grade de horarios
    mostrarSalas: "Mostrar salas...",
    dia2: "Segunda",
    dia3: "Terça",
    dia4: "Quarta",
    dia5: "Quinta",
    dia6: "Sexta",
    dia7: "Sábado",
    combinacoes: "combinações",
    // Exportacao de imagem
    erroExportarImagem: "Não foi possível exportar a imagem da combinação atual.",
    // Exportacao de calendario
    exportarCalendario: "Exportar calendário",
    exportarCalendarioBotao: "📅 EXPORTAR PARA O CALENDÁRIO 📆",
    exportarCalendarioDescricao:
        "Gera um arquivo .ics com as aulas da combinação atual, repetidas semanalmente. Importe no Google Agenda, no Calendário do iPhone ou em qualquer app compatível.",
    inicioDoSemestre: "Início do semestre",
    fimDoSemestre: "Fim do semestre",
    datasOficiais: "Datas do calendário acadêmico da UFSC — ajuste se necessário.",
    datasEstimadas: "Datas estimadas: confira o calendário acadêmico da UFSC antes de exportar.",
    feriadosNaoRemovidos: "Feriados e recessos não são removidos.",
    nenhumaCombinacao: "Nenhuma combinação para exportar.",
    erroGerarCalendario: "Não foi possível gerar o calendário.",
    cancelar: "Cancelar",
    baixarIcs: "Baixar .ics",
    // Rodape
    semVinculoUfsc: "Este aplicativo não possui vínculo oficial com a UFSC.",
    naoEsquecaMatricula: "Não se esqueça de fazer sua matrícula no",
    avaliar: "Avaliar",
    sobre: "Sobre",
};

export type TranslationKey = keyof typeof pt;

const fr: Record<TranslationKey, string> = {
    // En-tete
    salvar: "Enregistrer",
    exportarImagem: "Exporter l'image",
    exportando: "Export en cours...",
    compartilharLink: "Partager le lien",
    linkCopiado: "Lien copié",
    erroAoCopiar: "Échec de la copie",
    idioma: "Langue",
    // Recherche
    pesquisarDisciplina: "Rechercher une matière",
    pesquisarDisciplinaAtualizando: "Rechercher une matière (mise à jour...)",
    carregandoDisciplinas: "Chargement des matières...",
    materiaJaAdicionada: "{id} est déjà dans le plan",
    // Tableau des matieres
    codigo: "Code",
    materia: "Matière",
    creditos: "Crédits : {total}",
    conflitoComMateriasAcima: "Conflit avec une ou plusieurs matières plus haut dans la liste",
    moverMateriaParaCima: "Déplacer la matière vers le haut",
    moverMateriaParaBaixo: "Déplacer la matière vers le bas",
    removerMateria: "Retirer la matière",
    // Tableau des groupes
    turma: "Groupe",
    vagas: "Places",
    professores: "Enseignants",
    nenhumaTurmaDisponivel: "Aucun groupe disponible pour cette matière.",
    vagasOcupadas: "Places occupées",
    pedidosSemVaga: "Demandes sans place",
    vagasOfertadas: "Places offertes",
    fecharTurmas: "Fermer la liste des groupes",
    // Grille horaire
    mostrarSalas: "Afficher les salles...",
    dia2: "Lundi",
    dia3: "Mardi",
    dia4: "Mercredi",
    dia5: "Jeudi",
    dia6: "Vendredi",
    dia7: "Samedi",
    combinacoes: "combinaisons",
    // Export image
    erroExportarImagem: "Impossible d'exporter l'image de la combinaison actuelle.",
    // Export calendrier
    exportarCalendario: "Exporter vers le calendrier",
    exportarCalendarioBotao: "📅 EXPORTER VERS LE CALENDRIER 📆",
    exportarCalendarioDescricao:
        "Génère un fichier .ics avec les cours de la combinaison actuelle, répétés chaque semaine. Importable dans Google Agenda, le Calendrier de l'iPhone ou toute autre application compatible.",
    inicioDoSemestre: "Début du semestre",
    fimDoSemestre: "Fin du semestre",
    datasOficiais: "Dates du calendrier académique de l'UFSC — ajustez si besoin.",
    datasEstimadas: "Dates estimées : vérifiez le calendrier académique de l'UFSC avant d'exporter.",
    feriadosNaoRemovidos: "Les jours fériés et les vacances ne sont pas retirés.",
    nenhumaCombinacao: "Aucune combinaison à exporter.",
    erroGerarCalendario: "Impossible de générer le calendrier.",
    cancelar: "Annuler",
    baixarIcs: "Télécharger le .ics",
    // Pied de page
    semVinculoUfsc: "Cette application n'a aucun lien officiel avec l'UFSC.",
    naoEsquecaMatricula: "N'oubliez pas de vous inscrire sur",
    avaliar: "Donner un avis",
    sobre: "À propos",
};

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { pt, fr };

/// Idioma inicial a partir do navegador, usado enquanto o usuario nao escolher
/// um explicitamente. Qualquer variante de frances (fr, fr-FR, fr-CA...) cai no
/// frances; todo o resto fica no portugues, o publico do app.
export function detectLocale(): Locale {
    if (typeof navigator === "undefined") return "pt";

    const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];

    for (const preference of preferences) {
        const base = preference?.toLowerCase().split("-")[0];
        const match = LOCALES.find((entry) => entry.value === base);
        if (match) return match.value;
    }

    return "pt";
}

const [locale, setLocale] = makePersisted(createSignal<Locale>(detectLocale()), { name: "matrufsc:locale" });

export { locale, setLocale };

/// Traduz uma chave, interpolando `{param}` quando houver.
/// Chamada dentro do JSX, reage a `locale()` como qualquer outro sinal.
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
    const template = DICTIONARIES[locale()][key] ?? pt[key];
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = params[name];
        return value === undefined ? match : String(value);
    });
}

export function htmlLangFor(value: Locale): string {
    return LOCALES.find((entry) => entry.value === value)?.htmlLang ?? "pt-BR";
}
