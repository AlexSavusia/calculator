import { useWatch, useFormContext } from "react-hook-form";
import { buildPayload } from "./buildPayload";
import type { FormulaRunResponse } from "../../api";

type Props = {
    formulaRes?: FormulaRunResponse | null;
    isLoading?: boolean;
};

function toPercent(x: unknown, digits = 2): string {
    if (typeof x !== "number" || !Number.isFinite(x)) return "—";
    return (x * 100).toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + "%";
}

export function CalculatorSummary({ formulaRes, isLoading }: Props) {
    const { control } = useFormContext();
    const values = useWatch({ control });

    // payload для debug (то что реально уйдет на бэк)
    let payload: any = null;
    try {
        payload = buildPayload(values as any);
    } catch {
        payload = null;
    }


    const premiumMain = formulaRes?.result?.Premium_main;
    const totalSum = formulaRes?.result?.Premium_all;
    const beta = formulaRes?.result?.beta;
    const invBeta = formulaRes?.result?.inv_beta;

// если гарантированная норма доходности будет в args — достаём:
    const garantIncome = payload?.args?.garant_income_percent;


    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, background: "#fafafa", maxHeight: 400, overflowY: "auto",}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                        Параметры полиса
                        {isLoading ? (
                            <span
                                style={{
                                    fontSize: 12,
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: "rgba(11,91,211,0.10)",
                                    color: "#0b5bd3",
                                    fontWeight: 700,
                                }}
                            >
                Расчёт...
              </span>
                        ) : null}
                    </div>

                    <div style={{ opacity: 0.6 }}>⌃</div>
                </div>

                <div style={{ display: "grid", gap: 6, opacity: isLoading ? 0.6 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Премия по основной программе</span>
                        <b>
                            {typeof premiumMain === "number"
                                ? premiumMain.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : "—"}
                        </b>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Общая премия</span>
                        <b>
                            {typeof totalSum === "number"
                                ? totalSum.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : "—"}
                        </b>
                    </div>
                </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Гарантированная норма доходности</span>
                        <b>
                            {typeof garantIncome === "number"
                                ? (garantIncome * 100).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%"
                                : typeof garantIncome === "string" && garantIncome !== ""
                                    ? (Number(String(garantIncome).replace(",", ".")) * 100).toLocaleString("ru-RU", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }) + "%"
                                    : "—"}
                        </b>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Нагрузка</span>
                        <b>{toPercent(beta)}</b>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Нетто</span>
                        <b>{toPercent(invBeta)}</b>
                    </div>
                </div>
            </div>


            <details style={{ opacity: 0.85 }}>
                <summary>debug</summary>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>payload (args)</div>
                        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(payload, null, 2)}</pre>
                    </div>

                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>formula/run response</div>
                        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(formulaRes, null, 2)}</pre>
                    </div>

                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>form values</div>
                        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(values, null, 2)}</pre>
                    </div>
                </div>
            </details>
        </div>
    );
}
