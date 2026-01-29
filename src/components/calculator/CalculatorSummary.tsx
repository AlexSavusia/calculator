// src/components/calculator/CalculatorSummary.tsx
import { useWatch, useFormContext } from "react-hook-form";
import { buildPayload } from "./buildPayload";

export function CalculatorSummary() {
    const { control } = useFormContext();
    const values = useWatch({ control });

    const premiumMain = 1560;
    const premiumTotal = 1585;

    // ✅ safe build (чтобы не падало, если данных ещё нет)
    let payload: any = null;
    try {
        payload = buildPayload(values as any);
    } catch {
        payload = null;
    }

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>Параметры полиса</div>
                    <div style={{ opacity: 0.6 }}>⌃</div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Премия по основной программе</span>
                        <b>{premiumMain.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ opacity: 0.7 }}>Общая премия</span>
                        <b>{premiumTotal.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</b>
                    </div>
                </div>
            </div>

            <details style={{ opacity: 0.85 }}>
                <summary>debug</summary>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {/*        <div>*/}
            {/*            <div style={{ fontWeight: 700, marginBottom: 6 }}>form values</div>*/}
            {/*            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>*/}
            {/*  {JSON.stringify(values, null, 2)}*/}
            {/*</pre>*/}
            {/*        </div>*/}

                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>payload (args)</div>
                        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
                    </div>
                </div>
            </details>
        </div>
    );
}
