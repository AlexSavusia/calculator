// src/components/calculator/fields/NumberSliderField.tsx
import { Controller, useFormContext } from "react-hook-form";

type Props = {
    name: string;
    label: string;
    min: number;
    max: number;
    step?: number;
};

export function NumberSliderField({ name, label, min, max, step = 1 }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={min}
            render={({ field }) => {
                const value = typeof field.value === "number" ? field.value : Number(field.value ?? min);
                return (
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <input
                                type="range"
                                min={min}
                                max={max}
                                step={step}
                                value={value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <div style={{ width: 48, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}</div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
