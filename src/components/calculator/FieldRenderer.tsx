// src/components/calculator/FieldRenderer.tsx
import type { CalculatorConfig, FieldConfig } from "../../api/types";
import SegmentedField from "./fields/SegmentedField";
import SliderField from "./fields/SliderField";
import SelectField from "./fields/SelectField";
import DateField from "./fields/DateField";
import CheckboxField from "./fields/CheckboxField";
import CheckboxGroupField from "./fields/CheckboxGroupField";
import { getDictItems } from "./utils";

type Props = {
    config: CalculatorConfig;
    field: FieldConfig;
    hideLabel?: boolean;
};

export default function FieldRenderer({ config, field, hideLabel }: Props) {
    const allowedRowIds = (field.constraints as any)?.allowedRowIds as string[] | undefined;
    const items = getDictItems(config, field.dictionaryId, allowedRowIds);

    switch (field.type) {
        case "segmented":
            return <SegmentedField field={field} items={items} hideLabel={hideLabel} />;
        case "slider":
            return <SliderField field={field} hideLabel={hideLabel} />;
        case "select":
            return <SelectField field={field} items={items} hideLabel={hideLabel} />;
        case "date":
            return <DateField field={field} hideLabel={hideLabel} />;
        case "checkbox":
            return <CheckboxField field={field} hideLabel={hideLabel} />;
        case "checkbox_group":
            return <CheckboxGroupField field={field} items={items} hideLabel={hideLabel} />;
        default:
            return null;
    }
}
