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

// import { calculateProgram } from "../../api"; // если есть

function isDictField(x: any): x is ProgramDictionaryField {
    return x?.type === "DICT_INPUT";
}

type Props = {
    program: Program;
};

const FORMULA_ID = "019c054f-a78d-726e-94a0-a7c1a6fc58e2";


export function CalculatorForm({ program }: Props) {

    const [formulaRes, setFormulaRes] = useState<FormulaRunResponse | null>(null);

    const runFormulaMut = useMutation({
        mutationFn: (payload: unknown) => runFormula(FORMULA_ID, payload),
    });

    const isLoading = runFormulaMut.isPending ?? runFormulaMut.isLoading;

    const methods = useForm<CalculatorFormValues>({
        mode: "onChange",
        defaultValues: {}, // позже можно проставлять дефолты
    });

    // возьмём dict-поля из программы
    const dictFields = program.fields.filter(isDictField);

    async function onSubmit(values: CalculatorFormValues) {
        try {
            const payload = buildPayload(values);
            const res = await runFormulaMut.mutateAsync(payload);
            setFormulaRes(res);

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
                        <div style={{ display: "grid", gap: 8 }}>
                            <div style={{ fontWeight: 600 }}>Страховая сумма</div>
                            <input
                                type="number"
                                {...methods.register("strahovaya_summa", { valueAsNumber: true })}
                                placeholder="100000"
                                style={{ height: 40, borderRadius: 8, border: "1px solid #ddd", padding: "0 12px" }}
                            />
                        </div>


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
