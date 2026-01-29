import { Controller, useFormContext } from "react-hook-form";
import type { DictionaryItem, FieldConfig } from "../../../api/types";

type Props = {
    field: Extract<FieldConfig, { type: "segmented" }>;
    items: DictionaryItem[];
    hideLabel?: boolean;
};

export default function SegmentedField({ field, items, hideLabel }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={field.id}
            render={({ field: rhf }) => {
                const value = String(rhf.value ?? "");

                return (
                    <div>
                        {!hideLabel ? (
                            <div style={{ marginBottom: 8, fontWeight: 600 }}>{field.label}</div>
                        ) : null}

                        <div
                            style={{
                                display: "grid",
                                gridAutoFlow: "column",
                                gridAutoColumns: "1fr",
                                gap: 8,
                                padding: 6,
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                            }}
                        >
                            {items.map((it) => {
                                const active = it.code === value;

                                return (
                                    <button
                                        key={it.code}
                                        type="button"
                                        onClick={() => rhf.onChange(it.code)}
                                        style={{
                                            padding: "10px 12px",
                                            borderRadius: 10,
                                            border: active ? "1px solid #2563eb" : "1px solid transparent",
                                            background: active ? "rgba(37,99,235,0.08)" : "transparent",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {it.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            }}
        />
    );
}
