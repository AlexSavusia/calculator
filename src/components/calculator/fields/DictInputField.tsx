import { Controller, useFormContext } from "react-hook-form";
import type { DictionaryRow, DictionarySchema, DictionaryEntryValue } from "../../../api/types";

function getValueAsString(v: DictionaryEntryValue | undefined): string | null {
    if (!v) return null;
    if (v.type === "COMMON") return String(v.value);
    return null;
}

function pickRowValue(row: DictionaryRow, entry: { id?: string; name: string }) {
    if (entry.id) {
        const v = getValueAsString(row.data[entry.id]);
        if (v) return v;
    }
    const v2 = getValueAsString(row.data[entry.name]);
    if (v2) return v2;
    return null;
}

function getRowLabel(row: DictionaryRow, schema?: DictionarySchema) {
    if (!schema?.schema?.length) return row.id;

    const entries = schema.schema;

    const preferred = entries.find((f) => {
        const n = f.name.toLowerCase();
        return n.includes("name") || n.includes("наим") || n.includes("назв") || n.includes("програм");
    });

    if (preferred) {
        const val = pickRowValue(row, preferred);
        if (val) return val;
    }

    for (const f of entries) {
        const val = pickRowValue(row, f);
        if (val) return val;
    }

    return row.id;
}

function getRowCode(row: DictionaryRow, schema?: DictionarySchema): string | null {
    if (!schema?.schema?.length) return null;

    const codeEntry = schema.schema.find((f) => {
        const n = f.name.toLowerCase();
        return n === "code" || n.includes("код") || n.includes("code");
    });

    if (!codeEntry) return null;

    const code = pickRowValue(row, codeEntry);
    return code ? String(code) : null;
}

type Props = {
    name: string; // field.code (в программе)
    label: string; // field.name
    schema?: DictionarySchema;
    rows: DictionaryRow[];
    disabled?: boolean;
};

export function DictInputField({ name, label, schema, rows, disabled }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                return (
                    <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 600 }}>{label}</div>

                        <select
                            value={(field.value as string) ?? ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            disabled={disabled}
                            style={{ height: 40, borderRadius: 8, border: "1px solid #ddd", padding: "0 12px" }}
                        >
                            <option value="">—</option>

                            {rows.map((r) => {
                                const code = getRowCode(r, schema);
                                const optionValue = code ?? r.id; // fallback если code не найден
                                const optionLabel = getRowLabel(r, schema);

                                return (
                                    <option key={r.id} value={optionValue}>
                                        {optionLabel}
                                    </option>
                                );
                            })}
                        </select>

                        {fieldState.error?.message ? (
                            <div style={{ color: "crimson", fontSize: 12 }}>{fieldState.error.message}</div>
                        ) : null}
                    </div>
                );
            }}
        />
    );
}
