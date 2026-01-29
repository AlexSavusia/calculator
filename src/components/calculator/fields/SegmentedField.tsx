// src/components/calculator/fields/SegmentedField.tsx
import { Controller, useFormContext } from "react-hook-form";

type Opt = { id: string; name: string };

export function SegmentedField({ name, label, options }: { name: string; label: string; options: Opt[] }) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={options[0]?.id}
            render={({ field }) => (
                <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
                        {options.map((o) => {
                            const active = field.value === o.id;
                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => field.onChange(o.id)}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        border: "none",
                                        background: active ? "#e9f2ff" : "white",
                                        color: active ? "#0b5bd3" : "#222",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    {o.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        />
    );
}
