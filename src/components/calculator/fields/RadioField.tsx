// src/components/calculator/fields/RadioField.tsx
import { Controller, useFormContext } from "react-hook-form";

type Opt = { id: string; name: string };

export function RadioField({ name, label, options }: { name: string; label: string; options: Opt[] }) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            defaultValue=""
            render={({ field }) => (
                <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div style={{ display: "grid", gap: 6 }}>
                        {options.map((o) => (
                            <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input
                                    type="radio"
                                    name={name}
                                    checked={field.value === o.id}
                                    onChange={() => field.onChange(o.id)}
                                />
                                <span>{o.name}</span>
                            </label>
                        ))}

                        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                                type="radio"
                                name={name}
                                checked={!field.value}
                                onChange={() => field.onChange("")}
                            />
                            <span>Не выбирать</span>
                        </label>
                    </div>
                </div>
            )}
        />
    );
}
