import type { DropdownOption } from "../components/types.ts";
import type { BPLProgram } from "@webrise/bpl-wasm/types";

export const VALUE_TYPE_OPTS: { id: BackendFieldType; name: string }[] = [
    { id: "Text", name: "Текст" },
    { id: "Boolean", name: "Флаг" },
    { id: "Number", name: "Число" },
    { id: "Datetime", name: "Дата и время" },
];

export const FIELD_TYPE_OPTS: { id: ProgramTemplateField["type"]; name: string }[] = [
    { id: "INPUT", name: "Поле ввода" },
    { id: "DICT_INPUT", name: "Выбор из справочника" },
    { id: "FORMULA", name: "Формула" },
];

export const FIELD_TYPE_OPTS_MAP: Record<ProgramTemplateField["type"], string> = Object.fromEntries(
    FIELD_TYPE_OPTS.map((o) => [o.id, o.name]),
) as Record<ProgramTemplateField["type"], string>;

export const VALUE_TYPE_OPTS_MAP: Record<BackendFieldType, string> = Object.fromEntries(
    VALUE_TYPE_OPTS.map((o) => [o.id, o.name]),
) as Record<BackendFieldType, string>;

export type Nullable<T> = T | null;

export type PageableRq = {
    page?: number;
    size?: number;
    search?: string;
};

export type PageableRs<T> = {
    page: number;
    size: number;
    total: number;
    data: T[];
};

export type ApiError = {
    type: string;
    title: string;
    status?: number;
    traceId?: string;
};

export function isApiError(x: unknown): x is ApiError {
    if (x === null || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    return typeof o.type === "string" && typeof o.title === "string";
}

export type BackendFieldType = "Text" | "Number" | "Boolean" | "Datetime" | "DictionaryLink" ;

export type DictionarySchema = {
    id: string;
    name: string;
    description: Nullable<string>;
    schema: DictionarySchemaEntry[];
    groupId: Nullable<string>;
};

export type DictionarySchemaEntry = {
    id?: string;
    name: string;
    fieldType: BackendFieldType;
};

export type CommonDictionaryValue = {
    type: "COMMON";
    value: string | number | boolean;
};

export type DictionaryEntryValue = CommonDictionaryValue | DictionaryLink;

export type DictionaryRow = {
    id: string;
    dictId: string;
    order: number;
    data: Record<string, DictionaryEntryValue>;
};

export type CreateDictionaryRow = Omit<DictionaryRow, "id" | "order">;

export type DictionaryLink = {
    type: "LINK";
    forwardLinks: Record<string, string[]>;
    backwardLinks: string[];
};

export type CreateDictionarySchemaEntry = Omit<DictionarySchemaEntry, "id">;

export type CreateDictionarySchema = Omit<DictionarySchema, "id"> & {
    schema: CreateDictionarySchemaEntry[];
};

export type UpdateDictionarySchema = Partial<Omit<DictionarySchema, "id">>;

export type Group = {
    id: string;
    name: string;
    parentId: Nullable<string>;
};

export type GroupNode = Group & {
    children: GroupNode[];
};

export type CreateGroup = Omit<Group, "id">;

export type UpdateGroup = Partial<Omit<Group, "id">>;

export type Formula = {
    id: string;
    name: string;
    description: Nullable<string>;
    raw: BPLProgram;
    descriptor: Nullable<FormulaDescriptor>;
    groupId: Nullable<string>;
};

export type UpdateFormula = Partial<Omit<Formula, "id" | "descriptor">>;

export type CreateFormula = Omit<Formula, "id" | "descriptor">;

export type FormulaDescriptor = object;

export type ProgramTemplate = {
    id: string;
    name: string;
    description: Nullable<string>;
    fields: ProgramTemplateField[];
};

export type LoadFn<TItem extends DropdownOption> = (rq: PageableRq, signal?: AbortSignal) => Promise<PageableRs<TItem>>;

export type UpdateProgramTemplate = Partial<Omit<ProgramTemplate, "id">>;

export type CreateProgramTemplate = Omit<ProgramTemplate, "id">;

export type ProgramTemplateField = ProgramTemplateFieldInput | ProgramTemplateFieldDictionary | ProgramTemplateFieldFormula;

export type AbstractProgramTemplateField = {
    type: "INPUT" | "DICT_INPUT" | "FORMULA";
    code: string;
    name: string;

    // Backend expects: List<FormulaLink> where FormulaLink.inputs/outputs are List<FormulaLinkEntry>
    constraints?: FormulaLink[];
};

export type ProgramTemplateFieldInput = AbstractProgramTemplateField & {
    type: "INPUT";
    valueType: BackendFieldType;
    editable: boolean;
    required: boolean;
};

export type ProgramTemplateFieldDictionary = AbstractProgramTemplateField & {
    type: "DICT_INPUT";
    dictId: string;
    required: boolean;
};

export type ProgramTemplateFieldFormula = AbstractProgramTemplateField & {
    type: "FORMULA";
    formulaLink: FormulaLink;
};

// ✅ Backend DTO: public record FormulaLinkEntry(String Key, String Value);
export type FormulaLinkEntry = {
    key: string;
    value: string;
};

// ✅ Backend DTO: List<FormulaLinkEntry> Inputs / Outputs + Guid FormulaId
export type FormulaLink = {
    inputs: FormulaLinkEntry[];
    outputs: FormulaLinkEntry[];
    formulaId: string;
};

export type ProgramInputField = ProgramTemplateFieldInput & {
    type: "INPUT";
    value: Nullable<string>;
};

export type ProgramDictionaryField = ProgramTemplateFieldDictionary & {
    type: "DICT_INPUT";
    allowedRows: string[];
};

export type ProgramFormulaField = ProgramTemplateFieldFormula & {
    type: "FORMULA";
};

export type ProgramField = ProgramInputField | ProgramDictionaryField | ProgramFormulaField;

export type Program = {
    id: string;
    name: string;
    description: Nullable<string>;
    programTemplateId: string;
    fields: ProgramField[];
};

export type CreateProgram = Omit<Program, "id">;

export type UpdateProgram = Partial<Omit<Program, "id" | "programTemplateId">>;


export type DictionaryItem = {
    code: string;
    label: string;
    rowId?: string;
    meta?: Record<string, unknown>;
};

export type Dictionary = {
    id: string;
    title: string;
    items: DictionaryItem[];
};

export type VisibilityRule = {
    field: string;
    op: "==" | "!=" | "in" | "not_in";
    value: unknown;
};

export type Visibility = {
    when: VisibilityRule[];
};

export type FieldUI =
    | { variant?: "tabs" | "pill" }
    | { showValue?: boolean; inputBox?: boolean }
    | { placeholder?: string }
    | Record<string, unknown>;

export type FieldConstraints =
    | { min?: number; max?: number; step?: number }
    | { allowedRowIds?: string[] }
    | Record<string, unknown>;

export type BaseField = {
    id: string;
    label: string;
    required?: boolean;
    default?: unknown;
    dictionaryId?: string;
    ui?: FieldUI;
    constraints?: FieldConstraints;
};

export type UiFieldType =
    | "segmented"
    | "select"
    | "slider"
    | "date"
    | "checkbox"
    | "checkbox_group";

export type FieldConfig =
    | (BaseField & { type: "segmented" })
    | (BaseField & { type: "select" })
    | (BaseField & { type: "slider"; constraints?: { min?: number; max?: number; step?: number } })
    | (BaseField & { type: "date" })
    | (BaseField & { type: "checkbox" })
    | (BaseField & { type: "checkbox_group" });

export type SectionConfig = {
    id: string;
    title?: string;
    visibility?: Visibility;
    fields: FieldConfig[];
};

export type ActionConfig = {
    id: string;
    type: "button";
    label: string;
    style?: "primary" | "secondary";
};

export type SummaryItemConfig = {
    id: string;
    label: string;
    valueBinding: string; // e.g. "result.totalPremium"
    format?: "money_rub" | "percent" | string;
};

export type CardConfig = {
    id: string;
    title?: string;
    type: "summary";
    items: SummaryItemConfig[];
};

export type ColumnConfig =
    | {
    id: "left";
    title?: string;
    sections: SectionConfig[];
    actions?: ActionConfig[];
}
    | {
    id: "right";
    title?: string;
    cards: CardConfig[];
};

export type LayoutConfig = {
    columns: ColumnConfig[];
};

export type ResultSchema = Record<string, { type: "number" | "string"; format?: string }>;

export type CalculatorConfig = {
    formId: string;
    title: string;
    version: number;
    dictionaries: Dictionary[];
    layout: LayoutConfig;
    resultSchema: ResultSchema;
    defaults?: {
        form?: Record<string, unknown>;
        result?: Record<string, unknown>;
    };
};

export type CalcResult = Record<string, unknown>;
export type CalcFormValues = Record<string, unknown>;
