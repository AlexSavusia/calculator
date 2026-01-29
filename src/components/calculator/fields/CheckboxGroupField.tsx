// src/components/calculator/fields/CheckboxGroupField.tsx
import { Controller, useFormContext } from "react-hook-form";

type Opt = { id: string; name: string };

export function CheckboxGroupField({ name, label, options }: { name: string; label: string; options: Opt[] }) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={[]}
            render={({ field }) => {
                const arr = Array.isArray(field.value) ? (field.value as string[]) : [];
                const set = new Set(arr);

                function toggle(id: string) {
                    const next = new Set(set);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    field.onChange(Array.from(next));
                }

                return (
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            {options.map((o) => (
                                <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input type="checkbox" checked={set.has(o.id)} onChange={() => toggle(o.id)} />
                                    <span>{o.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            }}
        />
    );
}
