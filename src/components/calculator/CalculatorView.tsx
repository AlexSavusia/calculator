import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { CalculatorConfig, CalcFormValues, CalcResult } from "../../api/types";
import { calculatePremium, loadCalculatorConfig } from "../../api/calculator";
import FormSection from "./FormSection";
import SummaryPanel from "./fields/summary/SummaryPanel";

export default function CalculatorView() {
    const [config, setConfig] = useState<CalculatorConfig | null>(null);
    const [result, setResult] = useState<CalcResult>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCalculatorConfig()
            .then((cfg) => {
                setConfig(cfg);
                setResult(cfg.defaults?.result ?? {});
            })
            .catch((e) => {
                console.error(e);
                toast.error("Не удалось загрузить конфиг калькулятора");
            });
    }, []);

    const defaultValues = useMemo(() => {
        if (!config) return {};
        // Prefer defaults.form, fallback to field.default
        const fromCfg = config.defaults?.form ?? {};
        const fromFields: Record<string, unknown> = {};

        const left = config.layout.columns.find((c) => c.id === "left") as any;
        for (const s of left?.sections ?? []) {
            for (const f of s.fields ?? []) {
                if (f.default !== undefined) fromFields[f.id] = f.default;
            }
        }

        return { ...fromFields, ...fromCfg };
    }, [config]);

    const methods = useForm<CalcFormValues>({
        defaultValues,
        mode: "onChange"
    });

    // When config arrives, reset the form with computed defaults
    useEffect(() => {
        if (!config) return;
        methods.reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);

    if (!config) {
        return (
            <div style={{ padding: 24 }}>
                <div style={{ opacity: 0.7 }}>Загрузка…</div>
            </div>
        );
    }

    const left = config.layout.columns.find((c) => c.id === "left") as any;
    const right = config.layout.columns.find((c) => c.id === "right") as any;

    async function onCalculate() {
        const values = methods.getValues();
        setLoading(true);

        const tId = toast.loading("Расчёт…");
        try {
            const res = await calculatePremium(config, values);
            setResult(res);
            toast.success("Готово", { id: tId });
        } catch (e) {
            console.error(e);
            toast.error("Ошибка расчёта", { id: tId });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    background: "white",
                    borderRadius: 24,
                    padding: 24,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.10)"
                }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
                    {/* LEFT */}
                    <FormProvider {...methods}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                void onCalculate();
                            }}
                            style={{ display: "grid", gap: 8 }}
                        >
                            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                                {left?.title ?? "Параметры расчёта"}
                            </div>
                            <div style={{ height: 1, background: "#eef2f7", marginBottom: 8 }} />

                            <div style={{ display: "grid", gap: 6 }}>
                                {left.sections.map((s: any) => (
                                    <FormSection key={s.id} config={config} section={s} />
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: "12px 34px",
                                        borderRadius: 12,
                                        border: "1px solid #1d4ed8",
                                        background: "#1d4ed8",
                                        color: "white",
                                        fontWeight: 800,
                                        cursor: loading ? "not-allowed" : "pointer"
                                    }}
                                >
                                    Рассчитать
                                </button>
                            </div>
                        </form>
                    </FormProvider>

                    {/* RIGHT */}
                    <div style={{ alignSelf: "start" }}>
                        <SummaryPanel title={right?.title ?? "Параметры полиса"} cards={right.cards} result={result} />
                    </div>
                </div>
            </div>
        </div>
    );
}
