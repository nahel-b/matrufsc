import { createMemo, createSignal, Show } from "solid-js";
import { usePlano } from "~/context/plano/Plano.store";
import { buildIcs, downloadIcs } from "~/lib/ics";
import { getRangeForSemesters, isKnownSemester } from "~/lib/semesterDates";
import { t } from "~/lib/i18n";

function formatSemester(semester: string) {
    if (semester.length !== 5) return semester;
    return `${semester.slice(0, 4)}.${semester.slice(4)}`;
}

/// Botao (bem berrante, a pedido) que abre o dialogo de exportacao para
/// calendario. Fica direto na pagina, nao escondido atras do menu "Salvar".
export default function CalendarExport(props: { class?: string }) {
    const { currentPlano } = usePlano();

    let dialogRef: HTMLDialogElement | undefined;

    const semesters = createMemo(() => [...new Set((currentPlano() ?? []).map(({ materia }) => materia.semester))]);
    const defaultRange = createMemo(() => getRangeForSemesters(semesters()));
    const estimated = createMemo(() => semesters().some((semester) => !isKnownSemester(semester)));

    const [inicio, setInicio] = createSignal("");
    const [fim, setFim] = createSignal("");
    const [erro, setErro] = createSignal<string | null>(null);

    const openDialog = () => {
        const range = defaultRange();
        setInicio(range.inicio);
        setFim(range.fim);
        setErro(null);
        dialogRef?.showModal();
    };

    const handleExport = (event: SubmitEvent) => {
        event.preventDefault();

        const plano = currentPlano();
        if (!plano || plano.length === 0) {
            setErro(t("nenhumaCombinacao"));
            return;
        }

        const semestres = semesters();
        const calendarName = `MatrUFSC ${semestres.map(formatSemester).join(" / ")}`;

        try {
            const content = buildIcs(plano, { inicio: inicio(), fim: fim(), calendarName });
            downloadIcs(content, `MatrUFSC_${semestres.join("_") || "plano"}.ics`);
            dialogRef?.close();
        } catch (error) {
            console.error("Error exporting calendar:", error);
            setErro(error instanceof Error ? error.message : t("erroGerarCalendario"));
        }
    };
    
    return (
        <div class={props.class? props.class.concat(" flex justify-center") : "flex justify-center"}>
            <button
                type="button"
                class="botao-berrante flex justify-center cursor-pointer rounded-xl px-6 py-4 text-center text-2lg font-black tracking-wider uppercase"
                onClick={openDialog}
            >
                {t("exportarCalendarioBotao")}
            </button>

            <dialog
                ref={dialogRef}
                class="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-sm border border-neutral-400 bg-white p-6 shadow-lg backdrop:bg-black/30"
                onClick={(event) => {
                    if (event.target === dialogRef) dialogRef?.close();
                }}
            >
                <form class="flex flex-col gap-4" onSubmit={handleExport}>
                    <div>
                        <h5>{t("exportarCalendario")}</h5>
                        <p class="mt-1 text-sm text-neutral-600">{t("exportarCalendarioDescricao")}</p>
                    </div>

                    <div class="flex gap-4">
                        <label class="flex flex-1 flex-col gap-1 text-sm">
                            {t("inicioDoSemestre")}
                            <input
                                type="date"
                                required
                                class="rounded-sm border border-neutral-400 bg-white px-2 py-1"
                                value={inicio()}
                                onInput={(e) => setInicio(e.currentTarget.value)}
                            />
                        </label>
                        <label class="flex flex-1 flex-col gap-1 text-sm">
                            {t("fimDoSemestre")}
                            <input
                                type="date"
                                required
                                min={inicio()}
                                class="rounded-sm border border-neutral-400 bg-white px-2 py-1"
                                value={fim()}
                                onInput={(e) => setFim(e.currentTarget.value)}
                            />
                        </label>
                    </div>

                    <p class="text-sm text-neutral-600">
                        <Show when={estimated()} fallback={t("datasOficiais")}>
                            {t("datasEstimadas")}
                        </Show>{" "}
                        {t("feriadosNaoRemovidos")}
                    </p>

                    <Show when={erro()}>{(mensagem) => <p class="text-sm text-red-600">{mensagem()}</p>}</Show>

                    <div class="flex justify-end gap-6">
                        <button type="button" class="link cursor-pointer" onClick={() => dialogRef?.close()}>
                            {t("cancelar")}
                        </button>
                        <button type="submit" class="link cursor-pointer">
                            {t("baixarIcs")}
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
}
