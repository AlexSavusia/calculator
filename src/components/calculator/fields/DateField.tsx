// src/components/calculator/fields/DateField.tsx
import { Controller, useFormContext } from "react-hook-form";

export function DateField({ name, label }: { name: string; label: string }) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <input
                        type="date"
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        style={{ height: 40, borderRadius: 8, border: "1px solid #ddd", padding: "0 12px" }}
                    />
                </div>
            )}
        />
    );
}
