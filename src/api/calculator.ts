// src/api/calculator.ts
import type {
    CalculatorConfig,
    CalcFormValues,
    CalcResult,
    Dictionary,
    DictionaryItem,
    DictionaryRow,
    DictionarySchema,
    Program,
    ProgramTemplate,
    ProgramTemplateField,
    ProgramField,
    SectionConfig,
    FieldConfig,
} from "./types";

import { getPrograms, getProgram, getProgramTemplate, getDictionaries, getDictionaryRows } from "./index";

// ------------------------------
// helpers
// ------------------------------
async function loadAllRows(dictId: string, pageSize = 200, signal?: AbortSignal): Promise<DictionaryRow[]> {
    let page = 1;
    const out: DictionaryRow[] = [];

    while (true) {
        const rs = await getDictionaryRows({ page, size: pageSize }, dictId, signal);
        out.push(...rs.data);

        if (page * rs.size >= rs.total) break;
        page += 1;
    }

    return out;
}

function pickCodeNameFieldIds(schema: DictionarySchema): { codeId?: string; nameId?: string } {
    const codeId = schema.schema.find((x) => x.name === "code")?.id ?? schema.schema[0]?.id;
    const nameId = schema.schema.find((x) => x.name === "name")?.id ?? schema.schema[1]?.id;
    return { codeId, nameId };
}

function rowsToItems(schema: DictionarySchema, rows: DictionaryRow[]): DictionaryItem[] {
    const { codeId, nameId } = pickCodeNameFieldIds(schema);

    return rows.map((r) => {
        const code = codeId ? String((r.data as any)[codeId]?.value ?? "").trim() : r.id;
        const label = nameId ? String((r.data as any)[nameId]?.value ?? code).trim() : code;
        return { rowId: r.id, code, label };
    });
}

function fieldIsDictInput(f: ProgramTemplateField | ProgramField): f is any {
    return (f as any).type === "DICT_INPUT";
}

// выбираем: select или checkbox_group
function uiTypeForDictField(fieldCode: string): "select" | "checkbox_group" {
    // риски/сервис часто множественные — делаем группой
    if (fieldCode === "riski_i_ogranicheniya" || fieldCode === "servis") return "checkbox_group";
    return "select";
}

// ------------------------------
// FIXED CORE (always present)
// ------------------------------
function buildCoreSections(): SectionConfig[] {
    const core: SectionConfig[] = [
        {
            id: "core_sliders",
            title: "Параметры расчёта",
            fields: [
                {
                    id: "policyTermYears",
                    type: "slider",
                    label: "Срок действия полиса, лет",
                    required: true,
                    default: 15,
                    constraints: { min: 1, max: 30, step: 1 },
                    ui: { showValue: true },
                } as FieldConfig,
                {
                    id: "paymentTermYears",
                    type: "slider",
                    label: "Срок уплаты взносов, лет",
                    required: true,
                    default: 5,
                    constraints: { min: 1, max: 30, step: 1 },
                    ui: { showValue: true },
                } as FieldConfig,
                {
                    id: "insuranceSum",
                    type: "slider",
                    label: "Страховая сумма",
                    required: true,
                    default: 100,
                    constraints: { min: 10, max: 1000, step: 10 },
                    ui: { showValue: true, inputBox: true },
                } as FieldConfig,
            ],
        },

        {
            id: "insured",
            title: "Застрахованный",
            fields: [
                { id: "insuredBirthDate", type: "date", label: "Дата рождения", required: true } as FieldConfig,
                {
                    id: "insuredGender",
                    type: "segmented",
                    label: "Пол",
                    dictionaryId: "gender",
                    default: "M",
                    required: true,
                    ui: { variant: "pill" },
                } as FieldConfig,
                {
                    id: "isDifferentPersons",
                    type: "checkbox",
                    label: "Застрахованный и Страхователь являются разными лицами",
                    default: false,
                } as FieldConfig,
            ],
        },

        {
            id: "policyholder",
            title: "Страхователь",
            visibility: { when: [{ field: "isDifferentPersons", op: "==", value: true }] },
            fields: [
                { id: "policyholderBirthDate", type: "date", label: "Дата рождения", required: true } as FieldConfig,
                {
                    id: "policyholderGender",
                    type: "segmented",
                    label: "Пол",
                    dictionaryId: "gender",
                    default: "M",
                    required: true,
                    ui: { variant: "pill" },
                } as FieldConfig,
            ],
        },
    ];

    return core;
}

// ------------------------------
// API-driven sections
// ------------------------------
async function buildApiSectionsForProgram(
    program: Program,
    template: ProgramTemplate,
    dictSchemas: Map<string, DictionarySchema>,
    signal?: AbortSignal,
): Promise<{ sections: SectionConfig[]; dictionaries: Dictionary[] }> {
    // 1) берём только DICT_INPUT поля из template (они описывают структуру)
    const dictFields = template.fields.filter(fieldIsDictInput) as any[];

    // 2) грузим словари для каждого dictId
    const dictionaries: Dictionary[] = [];

    for (const f of dictFields) {
        const dictId = String(f.dictId);
        const schema = dictSchemas.get(dictId);
        if (!schema) continue;

        const rows = await loadAllRows(dictId, 200, signal);
        const items = rowsToItems(schema, rows);

        // allowedRows берём из program.fields по code
        const pf = program.fields.find((x: any) => x.code === f.code);
        const allowedRowIds: string[] = Array.isArray((pf as any)?.allowedRows) ? (pf as any).allowedRows : [];

        const filteredItems =
            allowedRowIds.length > 0 ? items.filter((it) => it.rowId && allowedRowIds.includes(it.rowId)) : items;

        // IMPORTANT: dictionaryId в UI делаем = dictId (чтобы просто)
        dictionaries.push({
            id: dictId,
            title: schema.name ?? f.name,
            items: filteredItems,
        });
    }

    // 3) строим секции: по полям template
    const sections: SectionConfig[] = dictFields.map((f: any) => {
        const dictId = String(f.dictId);
        const uiType = uiTypeForDictField(f.code);

        const field: FieldConfig =
            uiType === "checkbox_group"
                ? ({
                    id: f.code,
                    type: "checkbox_group",
                    label: f.name,
                    dictionaryId: dictId,
                    default: [],
                } as FieldConfig)
                : ({
                    id: f.code,
                    type: "select",
                    label: f.name,
                    dictionaryId: dictId,
                    ui: { placeholder: "Выберите" },
                    default: "",
                } as FieldConfig);

        return {
            id: `api_${f.code}`,
            title: f.name,
            fields: [field],
        };
    });

    return { sections, dictionaries };
}

// ------------------------------
// PUBLIC API
// ------------------------------
export async function loadCalculatorConfig(signal?: AbortSignal): Promise<CalculatorConfig> {
    // 1) programs -> calc_type segmented
    const programsRs = await getPrograms({ page: 1, size: 50 }, signal);
    const programs = programsRs.data;

    if (!programs.length) {
        // минимальный конфиг, чтобы UI не умер
        return {
            formId: "insurance-calculator",
            title: "Калькулятор",
            version: 1,
            dictionaries: [
                {
                    id: "gender",
                    title: "Пол",
                    items: [
                        { code: "M", label: "Мужчина" },
                        { code: "F", label: "Женщина" },
                    ],
                },
                { id: "calc_type", title: "Тип расчёта", items: [] },
            ],
            layout: {
                columns: [
                    { id: "left", title: "Параметры расчёта", sections: buildCoreSections(), actions: [{ id: "calculate", type: "button", label: "Рассчитать", style: "primary" }] },
                    { id: "right", title: "Параметры полиса", cards: [] },
                ],
            },
            resultSchema: {},
            defaults: { form: {} },
        };
    }

    const defaultProgram = programs[0];

    // 2) load selected program + template
    const program = await getProgram(defaultProgram.id, signal);
    const template = await getProgramTemplate(program.programTemplateId, signal);

    // 3) dict schemas map
    const dictSchemasRs = await getDictionaries({ page: 1, size: 300 }, signal);
    const dictSchemas = new Map(dictSchemasRs.data.map((d) => [d.id, d]));

    // 4) build api-driven sections + dictionaries
    const { sections: apiSections, dictionaries: apiDictionaries } = await buildApiSectionsForProgram(
        program,
        template,
        dictSchemas,
        signal,
    );

    // 5) base dictionaries
    const dictionaries: Dictionary[] = [
        {
            id: "calc_type",
            title: "Тип расчёта",
            items: programs.map((p) => ({ code: p.id, label: p.name })),
        },
        {
            id: "gender",
            title: "Пол",
            items: [
                { code: "M", label: "Мужчина" },
                { code: "F", label: "Женщина" },
            ],
        },
        ...apiDictionaries,
    ];

    // 6) left sections: program selector + core + api sections
    const leftSections: SectionConfig[] = [
        {
            id: "program_selector",
            title: "Тип расчёта",
            fields: [
                {
                    id: "programId",
                    type: "segmented",
                    label: "Тип расчёта",
                    dictionaryId: "calc_type",
                    default: defaultProgram.id,
                    required: true,
                    ui: { variant: "tabs" },
                } as FieldConfig,
            ],
        },
        ...buildCoreSections(),
        ...apiSections,
    ];

    return {
        formId: "insurance-calculator",
        title: template.name ?? "Калькулятор",
        version: 1,
        dictionaries,
        layout: {
            columns: [
                {
                    id: "left",
                    title: "Параметры расчёта",
                    sections: leftSections,
                    actions: [{ id: "calculate", type: "button", label: "Рассчитать", style: "primary" }],
                },
                {
                    id: "right",
                    title: "Параметры полиса",
                    // можешь сюда позже добавить summary cards (из API расчёта)
                    cards: [],
                },
            ],
        },
        resultSchema: {
            basePremium: { type: "number", format: "money_rub" },
            totalPremium: { type: "number", format: "money_rub" },
            guaranteedYield: { type: "number", format: "percent" },
            load: { type: "number", format: "percent" },
            net: { type: "number", format: "percent" },
        },
        defaults: {
            form: {
                programId: defaultProgram.id,
                policyTermYears: 15,
                paymentTermYears: 5,
                insuranceSum: 100,
                insuredGender: "M",
                isDifferentPersons: false,
                additionalRisks: [],
                serviceOptions: [],
            },
        },
    };
}

/**
 * Пока заглушка.
 * Здесь ты потом дернешь реальный endpoint расчета.
 */
export async function calculatePremium(config: CalculatorConfig, values: CalcFormValues): Promise<CalcResult> {
    await new Promise((r) => setTimeout(r, 250));
    return {
        basePremium: 15670.59,
        totalPremium: 15895.59,
        guaranteedYield: 8.0,
        load: 9.33,
        net: 90.67,
        _debug: { values },
    };
}
