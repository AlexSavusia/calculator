// src/components/calculator/CalculatorForm.tsx

import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { Program, ProgramDictionaryField } from "../../api/types";
import type { CalculatorFormValues } from "./types";
import { DictInputField } from "./fields/DictInputField";
import { NumberSliderField } from "./fields/NumberSliderField";
import { DateField } from "./fields/DateField";
import { SegmentedField } from "./fields/SegmentedField";
import { CalculatorSummary } from "./CalculatorSummary";
import { useDictionary } from "./hooks/useDictionary";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { runFormula, type FormulaRunResponse } from "../../api";
import { buildPayload } from "./buildPayload";
import { RiskSumField } from "./fields/RiskSumField";

// import { calculateProgram } from "../../api"; // если есть

function isDictField(x: any): x is ProgramDictionaryField {
    return x?.type === "DICT_INPUT";
}

type Props = {
    program: Program;
};

const FORMULA_ID = "019c054f-a78d-726e-94a0-a7c1a6fc58e2";

function extractFormulaErrors(errors: Record<string, unknown> | undefined | null): string[] {
    if (!errors || typeof errors !== "object") return [];

    const out: string[] = [];
    for (const [key, val] of Object.entries(errors)) {
        if (val === null || val === undefined) continue;

        if (typeof val === "string") {
            const msg = val.trim();
            if (msg) out.push(msg);
            continue;
        }

        // если бек прислал массив сообщений
        if (Array.isArray(val)) {
            for (const item of val) {
                if (typeof item === "string" && item.trim()) out.push(item.trim());
            }
            continue;
        }

        // если бек прислал объект/число — покажем как текст
        out.push(`${key}: ${String(val)}`);
    }

    // убрать дубли
    return Array.from(new Set(out));
}



export function CalculatorForm({ program }: Props) {

    const [formulaRes, setFormulaRes] = useState<FormulaRunResponse | null>(null);

    const runFormulaMut = useMutation({
        mutationFn: (payload: unknown) => runFormula(FORMULA_ID, payload),
    });

    const isLoading = runFormulaMut.isPending ?? runFormulaMut.isLoading;

    const methods = useForm<CalculatorFormValues>({
        mode: "onChange",
        defaultValues: {
            strahovaya_summa: 3_500_000,

            ex_death_flag: false,
            ex_death_sum: 450_000,

            ex_body_flag: false,
            ex_body_sum: 1_000_000,

            ex_trauma_2_flag: false,
            ex_trauma_2_sum: 450_000,

            ex_trauma_3_flag: false,
            ex_trauma_3_sum: 450_000,
        },
    });

    // возьмём dict-поля из программы
    const dictFields = program.fields.filter(isDictField);

    async function onSubmit(values: CalculatorFormValues) {
        try {
            const payload = buildPayload(values);
            const res = await runFormulaMut.mutateAsync(payload);

// ✅ если есть errors — показать toast
            const errs = extractFormulaErrors(res.errors as any);
            if (errs.length) {
                toast.error(errs.join("\n")); // можно '\n' чтобы красиво
                // по желанию: НЕ обновлять result при ошибке
                setFormulaRes(res);
                return;
            }

            setFormulaRes(res);
            toast.success("Рассчитано ✅");


            console.log("payload", payload);
            console.log("formula run res", res);

            toast.success("Рассчитано ✅");
        } catch (e: any) {
            toast.error(e?.title ?? e?.message ?? "Ошибка расчёта");
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>
                {/* Левая часть */}
                <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 18 }}>
                    <div style={{ fontWeight: 800, marginBottom: 14 }}>{program.name}</div>

                    <div style={{ display: "grid", gap: 18 }}>
                        <div style={{ fontWeight: 700, opacity: 0.8 }}>Параметры расчета</div>

                        {/* DICT_INPUT: tip_rascheta */}
                        {dictFields.map((f) => (
                            <DictProgramField key={f.code} field={f} />
                        ))}

                        <NumberSliderField
                            name="srok_deystviya_polisa_let"
                            label="Срок действия полиса, лет"
                            min={5}
                            max={35}
                            step={1}
                        />

                        <NumberSliderField
                            name="srok_uplaty_vznosov_let"
                            label="Срок уплаты взносов, лет"
                            min={5}
                            max={35}
                            step={1}
                        />

                        {/* Страховая сумма — по дизайну может быть инпут + слайдер */}
                        <NumberSliderField
                            name="strahovaya_summa"
                            label="Страховая сумма"
                            min={100_000}
                            max={10_000_000}
                            step={100_000}
                        />


                        {/* Застрахованный */}
                        <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ fontWeight: 700 }}>Застрахованный</div>
                            <DateField name="strahovatel_birth" label="Дата рождения" />
                            <SegmentedField
                                name="pol_strahovatelya"
                                label="Пол"
                                options={[
                                    { id: "male", name: "Мужчина" },
                                    { id: "female", name: "Женщина" },
                                ]}
                            />
                        </div>
                        <div style={{ display: "grid", gap: 12 }}>
                            <div style={{ fontWeight: 700 }}>Дополнительные риски</div>

                            <RiskSumField
                                label="Смерть НС"
                                flagName="ex_death_flag"
                                sumName="ex_death_sum"
                                defaultSum={450_000}
                                max={5_000_000}
                                step={50_000}
                            />

                            <RiskSumField
                                label="Тяжкие телесные"
                                flagName="ex_body_flag"
                                sumName="ex_body_sum"
                                defaultSum={1_000_000}
                                max={5_000_000}
                                step={50_000}
                            />

                            <RiskSumField
                                label="Травма 2"
                                flagName="ex_trauma_2_flag"
                                sumName="ex_trauma_2_sum"
                                defaultSum={450_000}
                                max={5_000_000}
                                step={50_000}
                            />

                            <RiskSumField
                                label="Травма 3"
                                flagName="ex_trauma_3_flag"
                                sumName="ex_trauma_3_sum"
                                defaultSum={450_000}
                                max={5_000_000}
                                step={50_000}
                            />
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                height: 44,
                                borderRadius: 10,
                                border: "none",
                                background: isLoading ? "rgba(11,91,211,0.55)" : "#0b5bd3",
                                color: "white",
                                fontWeight: 700,
                                cursor: isLoading ? "not-allowed" : "pointer",
                            }}
                        >
                            {isLoading ? "Расчёт..." : "Рассчитать"}
                        </button>
                    </div>
                </div>

                {/* Правая часть */}
                <CalculatorSummary formulaRes={formulaRes} isLoading={isLoading} />

            </form>
        </FormProvider>
    );
}

function DictProgramField({ field }: { field: ProgramDictionaryField }) {
    const { schema, rows, isLoading } = useDictionary(field.dictId);

    return (
        <DictInputField
            name={field.code}
            label={field.name}
            schema={schema}
            rows={rows}
            disabled={isLoading}
        />
    );
}
