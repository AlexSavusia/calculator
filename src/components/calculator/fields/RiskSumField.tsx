// src/components/calculator/fields/RiskSumField.tsx
import { Controller, useFormContext, useWatch } from "react-hook-form";

type Props = {
    label: string;
    flagName: string; // ex_death_flag
    sumName: string;  // ex_death_sum
    min?: number;
    max?: number;
    step?: number;
    defaultSum?: number;
};

export function RiskSumField({
                                 label,
                                 flagName,
                                 sumName,
                                 min = 0,
                                 max = 5_000_000,
                                 step = 50_000,
                                 defaultSum = 450_000,
                             }: Props) {
    const { control, setValue } = useFormContext();
    const enabled = useWatch({ control, name: flagName }) as boolean | undefined;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, alignItems: "center" }}>
            <Controller
                control={control}
                name={flagName}
                defaultValue={false}
                render={({ field }) => (
                    <label style={{ display: "flex", alignItems: "center", gap: 10, userSelect: "none" }}>
                        <input
                            type="checkbox"
                            checked={Boolean(field.value)}
                            onChange={(e) => {
                                const next = e.target.checked;
                                field.onChange(next);
                                // если включили и суммы нет — выставим дефолт
                                if (next) {
                                    const current = useWatch({ control, name: sumName }) as any;
                                    const has = typeof current === "number" && Number.isFinite(current) && current > 0;
                                    if (!has) setValue(sumName, defaultSum, { shouldDirty: true, shouldTouch: true });
                                }
                            }}
                        />
                        <span>{label}</span>
                    </label>
                )}
            />

            <Controller
                control={control}
                name={sumName}
                defaultValue={defaultSum}
                render={({ field }) => {
                    const value = typeof field.value === "number" ? field.value : Number(field.value ?? defaultSum);
                    const disabled = !enabled;

                    return (
                        <div style={{ display: "grid", gap: 6, opacity: disabled ? 0.55 : 1 }}>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                                {value.toLocaleString("ru-RU")}{" "}
                            </div>

                            <input
                                type="range"
                                min={min}
                                max={max}
                                step={step}
                                value={Number.isFinite(value) ? value : defaultSum}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                disabled={disabled}
                                style={{ width: "100%" }}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
}
