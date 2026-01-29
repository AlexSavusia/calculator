// src/components/calculator/fields/SelectField.tsx
import { Controller, useFormContext } from "react-hook-form";
import type { DictionaryItem, FieldConfig } from "../../../api/types";

type Props = {
    field: Extract<FieldConfig, { type: "select" }>;
    items: DictionaryItem[];
    hideLabel?: boolean;
};

export default function SelectField({ field, items, hideLabel }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={field.id}
            render={({ field: rhf }) => {
                const placeholder = (field.ui as any)?.placeholder ?? "Выберите";
                return (
                    <div>
                        {!hideLabel ? (
                            <div style={{ marginBottom: 8, fontWeight: 600 }}>{field.label}</div>
                        ) : null}

                        <select
                            value={String(rhf.value ?? "")}
                            onChange={(e) => rhf.onChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                background: "white"
                            }}
                        >
                            <option value="" disabled>
                                {placeholder}
                            </option>
                            {items.map((it) => (
                                <option key={it.code} value={it.code}>
                                    {it.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }}
        />
    );
}
