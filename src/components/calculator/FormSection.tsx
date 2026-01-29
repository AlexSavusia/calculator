// src/components/calculator/FormSection.tsx
import type { CalculatorConfig, SectionConfig } from "../../api/types";
import FieldRenderer from "./FieldRenderer";
import { useWatch } from "react-hook-form";
import { isVisible } from "./utils";

function norm(s?: string) {
    return String(s ?? "").trim().toLowerCase();
}

type Props = {
    config: CalculatorConfig;
    section: SectionConfig;
};

export default function FormSection({ config, section }: Props) {
    const values = useWatch() as Record<string, unknown>;
    const visible = isVisible(section.visibility, values);
    if (!visible) return null;

    const isSingleField = (section.fields?.length ?? 0) === 1;
    const single = isSingleField ? section.fields[0] : null;

    // Hide field label when section title duplicates it (common for generated API sections)
    const hideSingleFieldLabel =
        isSingleField && norm(section.title) && norm(section.title) === norm(single?.label);

    return (
        <div style={{ padding: "14px 0" }}>
            {section.title ? (
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{section.title}</div>
            ) : null}

            <div style={{ display: "grid", gap: 16 }}>
                {section.fields.map((f) => (
                    <FieldRenderer
                        key={f.id}
                        config={config}
                        field={f}
                        // 👇 new prop
                        hideLabel={hideSingleFieldLabel && f.id === single?.id}
                    />
                ))}
            </div>
        </div>
    );
}
