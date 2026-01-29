import { Controller, useFormContext } from "react-hook-form";
import type { DictionaryItem, FieldConfig } from "../../../api/types";

type Props = {
    field: Extract<FieldConfig, { type: "checkbox_group" }>;
    items: DictionaryItem[];
    hideLabel?: boolean;
};

export default function CheckboxGroupField({ field, items, hideLabel }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={field.id}
            render={({ field: rhf }) => {
                const valueArr = Array.isArray(rhf.value) ? rhf.value.map(String) : [];
                const set = new Set(valueArr);

                function toggle(code: string) {
                    const next = new Set(set);
                    if (next.has(code)) next.delete(code);
                    else next.add(code);
                    rhf.onChange(Array.from(next));
                }

                return (
                    <div>
                        {!hideLabel ? (
                            <div style={{ marginBottom: 10, fontWeight: 600 }}>{field.label}</div>
                        ) : null}

                        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                            {items.map((it) => {
                                const checked = set.has(it.code);

                                return (
                                    <label key={it.code} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggle(it.code)}
                                            style={{ width: 18, height: 18 }}
                                        />
                                        <span style={{ fontSize: 13 }}>{it.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            }}
        />
    );
}
