import { Controller, useFormContext } from "react-hook-form";
import type { FieldConfig } from "../../../api";

type Props = {
    field: Extract<FieldConfig, { type: "checkbox" }>;
    hideLabel?: boolean;
};

export default function CheckboxField({ field, hideLabel }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={field.id}
            render={({ field: rhf }) => (
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={Boolean(rhf.value)}
                        onChange={(e) => rhf.onChange(e.target.checked)}
                        style={{ width: 18, height: 18 }}
                    />
                    {!hideLabel ? <span>{field.label}</span> : null}
                </label>
            )}
        />
    );
}
