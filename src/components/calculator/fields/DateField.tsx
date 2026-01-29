import { Controller, useFormContext } from "react-hook-form";
import type { FieldConfig } from "../../../api";

type Props = {
    field: Extract<FieldConfig, { type: "date" }>;
    hideLabel?: boolean;
};

export default function DateField({ field, hideLabel }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={field.id}
            render={({ field: rhf }) => (
                <div>
                    {!hideLabel ? (
                        <div style={{ marginBottom: 8, fontWeight: 600 }}>
                            {field.required ? <span style={{ color: "#ef4444" }}>* </span> : null}
                            {field.label}
                        </div>
                    ) : null}

                    <input
                        type="date"
                        value={String(rhf.value ?? "")}
                        onChange={(e) => rhf.onChange(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                        }}
                    />
                </div>
            )}
        />
    );
}
