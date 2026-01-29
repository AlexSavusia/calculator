
export const VALUE_TYPE_OPTS: { id: FieldType; name: string }[] = [
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

export const VALUE_TYPE_OPTS_MAP: Record<FieldType, string> = Object.fromEntries(
    VALUE_TYPE_OPTS.map((o) => [o.id, o.name]),
) as Record<FieldType, string>;

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

export type FieldType = "Text" | "Number" | "Boolean" | "Datetime" | "DictionaryLink" ;

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
    fieldType: FieldType;
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
    raw: null;
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
    valueType: FieldType;
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