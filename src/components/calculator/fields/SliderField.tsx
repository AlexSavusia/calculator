import { Controller, useFormContext } from "react-hook-form";
import type { FieldConfig } from "../../../api/types";

type Props = {
    field: Extract<FieldConfig, { type: "slider" }>;
    hideLabel?: boolean;
};

export default function SliderField({ field, hideLabel }: Props) {
    const { control } = useFormContext();

    const c = (field.constraints ?? {}) as { min?: number; max?: number; step?: number };
    const min = c.min ?? 0;
    const max = c.max ?? 100;
    const step = c.step ?? 1;

    return (
        <Controller
            control={control}
            name={field.id}
            render={({ field: rhf }) => {
                const valueNum = Number(rhf.value ?? field.default ?? min);

                return (
                    <div>
                        {!hideLabel ? (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div style={{ fontWeight: 600 }}>{field.label}</div>
                                {(field.ui as any)?.showValue ? <div style={{ opacity: 0.8 }}>{valueNum}</div> : null}
                            </div>
                        ) : (field.ui as any)?.showValue ? (
                            // If label is hidden but showValue is enabled, still show the value on the right
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                                <div style={{ opacity: 0.8 }}>{valueNum}</div>
                            </div>
                        ) : null}

                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <input
                                type="range"
                                min={min}
                                max={max}
                                step={step}
                                value={valueNum}
                                onChange={(e) => rhf.onChange(Number(e.target.value))}
                                style={{ width: "100%" }}
                            />

                            {(field.ui as any)?.inputBox ? (
                                <input
                                    value={valueNum}
                                    onChange={(e) => rhf.onChange(Number(e.target.value))}
                                    style={{
                                        width: 90,
                                        padding: "8px 10px",
                                        borderRadius: 10,
                                        border: "1px solid #e5e7eb",
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                );
            }}
        />
    );
}
