import clsx from "clsx";
import { t } from "~/lib/i18n";

export default function Footer(props: { class?: string }) {
    return (
        <footer class={clsx("flex items-center justify-between", props.class)}>
            <p>
                <span>{t("semVinculoUfsc")}</span>
                <br />
                <span>
                    {t("naoEsquecaMatricula")}{" "}
                    <a class="text-nowrap" target="_blank" href="http://cagr.ufsc.br/" rel="noreferrer">
                        CAGR
                    </a>
                    !
                </span>
            </p>

            <div class="flex gap-7">
                <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdJUFYTgDtF4iT-4-zBEEpW1HiAJ5ipaUl6rr67H6-KQFoKXw/viewform"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t("avaliar")}
                </a>
                <a href="https://github.com/nahel-b/matrufsc" target="_blank" rel="noreferrer">
                    {t("sobre")}
                </a>
            </div>
        </footer>
    );
}
