import axios, { AxiosError } from "axios";
import {
    type ApiError,
    type CreateFormula,
    type CreateGroup,
    type CreateProgramTemplate,
    type CreateDictionarySchema,
    type DictionarySchema,
    type Formula,
    type Group,
    type GroupNode,
    isApiError,
    type PageableRq,
    type PageableRs,
    type ProgramTemplate,
    type UpdateDictionarySchema,
    type UpdateFormula,
    type UpdateGroup,
    type UpdateProgramTemplate,
    type DictionaryRow,
    type CreateDictionaryRow,
    type CreateProgram,
    type Program,
    // 👇 добавь эти типы в exports types.ts (или убери и оставь any)
    type FormulaLink,
    type FormulaLinkEntry,
    type ProgramTemplateField, type UpdateProgram,
} from "./types.ts";

export const toApiError = (err: unknown): ApiError => {
    if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<unknown>;

        if (!ax.response) {
            return { type: "network error", title: ax.message || "Network error" };
        }

        const status = ax.response.status;
        const data = ax.response.data;

        if (isApiError(data)) return data;

        return { type: "unknown", status, title: ax.message || `HTTP ${status}` };
    }

    if (err instanceof Error) return { type: "unknown", title: err.message };

    return { type: "unknown", title: "Unknown error" };
};

const api = axios.create({ baseURL: "/api" });

api.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(toApiError(err)),
);

function toQueryString<T extends Record<string, unknown>>(obj: T): string {
    const qs = new URLSearchParams(
        Object.entries(obj)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]),
    );

    const s = qs.toString();
    return s ? `?${s}` : "";
}

/**
 * ============================================================
 * FIX: normalize FormulaLink to backend DTO
 * Backend expects:
 *   Inputs: List<FormulaLinkEntry> where FormulaLinkEntry = { Key, Value }
 * JSON should be:
 *   inputs: [{ key: "...", value: "..." }]
 * but UI may still send:
 *   inputs: { "k": "v" }
 * ============================================================
 */

function isRecord(x: unknown): x is Record<string, unknown> {
    return !!x && typeof x === "object" && !Array.isArray(x);
}

function toEntry(it: any): FormulaLinkEntry | null {
    const key = it?.key ?? it?.Key;
    const value = it?.value ?? it?.Value;
    if (key === undefined || key === null || String(key).length === 0) return null;
    return { key: String(key), value: String(value ?? "") };
}

function normalizeEntries(x: unknown): FormulaLinkEntry[] {
    // already array
    if (Array.isArray(x)) {
        return x.map(toEntry).filter(Boolean) as FormulaLinkEntry[];
    }

    // record -> array
    if (isRecord(x)) {
        return Object.entries(x).map(([key, value]) => ({ key, value: String(value ?? "") }));
    }

    return [];
}

function normalizeFormulaLink(link: any): FormulaLink {
    return {
        formulaId: String(link?.formulaId ?? link?.FormulaId ?? ""),
        inputs: normalizeEntries(link?.inputs ?? link?.Inputs),
        outputs: normalizeEntries(link?.outputs ?? link?.Outputs),
    };
}

function normalizeProgramTemplateField(field: any): ProgramTemplateField {
    const base = {
        type: field.type,
        code: field.code,
        name: field.name,
        constraints: Array.isArray(field.constraints) ? field.constraints.map(normalizeFormulaLink) : [],
    };

    if (field.type === "INPUT") {
        return {
            ...base,
            type: "INPUT",
            valueType: field.valueType,
            editable: !!field.editable,
            required: !!field.required,
        } as ProgramTemplateField;
    }

    if (field.type === "DICT_INPUT") {
        return {
            ...base,
            type: "DICT_INPUT",
            dictId: String(field.dictId ?? ""),
            required: !!field.required,
        } as ProgramTemplateField;
    }

    // FORMULA
    return {
        ...base,
        type: "FORMULA",
        // constraints у FORMULA обычно пустой, но если пришло — нормализуем выше
        formulaLink: normalizeFormulaLink(field.formulaLink),
    } as ProgramTemplateField;
}

function normalizeCreateProgramTemplate(rq: CreateProgramTemplate): CreateProgramTemplate {
    return {
        name: String(rq.name ?? "").trim(),
        description: rq.description?.trim() ? rq.description.trim() : null,
        fields: (rq.fields ?? []).map((f: any) => normalizeProgramTemplateField(f)),
    };
}

/**
 * ============================================================
 * API methods
 * ============================================================
 */


export type FormulaRunResponse = {
    result?: Record<string, number>;
    errors?: Record<string, unknown>;
};


export const runFormula = async (
    formulaId: string,
    payload: unknown,
    signal?: AbortSignal,
): Promise<FormulaRunResponse> =>
    (await api.post<FormulaRunResponse>(`/formula/${formulaId}/run`, payload, { signal })).data;


export const getDictionaryRows = async (
    rq: PageableRq,
    dictId: string,
    signal?: AbortSignal,
): Promise<PageableRs<DictionaryRow>> =>
    (
        await api.get<PageableRs<DictionaryRow>>(`/dictionary/${dictId}${toQueryString(rq)}`, {
            signal,
        })
    ).data;

export const addDictionaryRow = async (
    dictId: string,
    rows: CreateDictionaryRow,
    signal?: AbortSignal,
): Promise<DictionaryRow[]> => (await api.put<DictionaryRow[]>(`/dictionary/${dictId}`, rows, { signal })).data;

export const deleteDictionaryRow = async (rowId: string, signal?: AbortSignal): Promise<void> => {
    await api.delete(`/dictionary/${rowId}`, { signal });
};

export const updateDictionaryRow = async (
    rowId: string,
    rq: CreateDictionaryRow,
    signal?: AbortSignal,
): Promise<DictionaryRow> =>
    (
        await api.patch<DictionaryRow>(
            `/dictionary/${rowId}`,
            { schemaId: rq.dictId, data: rq.data },
            { signal },
        )
    ).data;

export const createDictionary = async (
    rq: CreateDictionarySchema,
    signal?: AbortSignal,
): Promise<DictionarySchema> => (await api.put<DictionarySchema>("/dictionary-schema", rq, { signal })).data;

export const getDictionaries = async (
    rq: PageableRq,
    signal?: AbortSignal,
): Promise<PageableRs<DictionarySchema>> =>
    (
        await api.get<PageableRs<DictionarySchema>>(`/dictionary-schema${toQueryString(rq)}`, {
            signal,
        })
    ).data;

export const getDictionary = async (id: string, signal?: AbortSignal): Promise<DictionarySchema> =>
    (await api.get<DictionarySchema>(`/dictionary-schema/${id}`, { signal })).data;

export const updateDictionary = async (
    id: string,
    rq: UpdateDictionarySchema,
    signal?: AbortSignal,
): Promise<DictionarySchema> => (await api.patch<DictionarySchema>(`/dictionary-schema/${id}`, rq, { signal })).data;

export const deleteDictionary = async (id: string, signal?: AbortSignal): Promise<void> =>
    await api.delete(`/dictionary-schema/${id}`, { signal });

export const createDictionaryGroup = async (rq: CreateGroup, signal?: AbortSignal): Promise<Group> =>
    (await api.put<Group>("/dictionary-schema/group", rq, { signal })).data;

export const updateDictionaryGroup = async (id: string, rq: UpdateGroup, signal?: AbortSignal): Promise<Group> =>
    (await api.patch<Group>(`/dictionary-schema/group/${id}`, rq, { signal })).data;

export const deleteDictionaryGroup = async (id: string, signal?: AbortSignal): Promise<void> =>
    await api.delete(`/dictionary-schema/group/${id}`, { signal });

export const getDictionaryGroupTree = async (signal?: AbortSignal): Promise<GroupNode[]> =>
    (await api.get<GroupNode[]>("/dictionary-schema/group", { signal })).data;

export const createFormula = async (rq: CreateFormula, signal?: AbortSignal): Promise<Formula> =>
    (await api.put<Formula>("/formula", rq, { signal })).data;

export const getFormulas = async (rq: PageableRq, signal?: AbortSignal): Promise<PageableRs<Formula>> =>
    (await api.get<PageableRs<Formula>>(`/formula${toQueryString(rq)}`, { signal })).data;

export const getFormula = async (id: string, signal?: AbortSignal): Promise<Formula> =>
    (await api.get<Formula>(`/formula/${id}`, { signal })).data;

export const updateFormula = async (id: string, rq: UpdateFormula, signal?: AbortSignal): Promise<Formula> =>
    (await api.patch<Formula>(`/formula/${id}`, rq, { signal })).data;

export const deleteFormula = async (id: string, signal?: AbortSignal): Promise<void> =>
    await api.delete(`/formula/${id}`, { signal });

export const createFormulaGroup = async (rq: CreateGroup, signal?: AbortSignal): Promise<Group> =>
    (await api.put<GroupNode>(`/formula/group`, rq, { signal })).data;

export const updateFormulaGroup = async (id: string, rq: UpdateGroup, signal?: AbortSignal): Promise<Group> =>
    (await api.patch<GroupNode>(`/formula/group/${id}`, rq, { signal })).data;

export const deleteFormulaGroup = async (id: string, signal?: AbortSignal): Promise<void> =>
    await api.delete(`/formula/group/${id}`, { signal });

export const getFormulaGroupTree = async (signal?: AbortSignal): Promise<GroupNode[]> =>
    (await api.get("/formula/group", { signal })).data;

/**
 * ✅ FIXED: normalize rq before sending to backend
 */
export const createProgramTemplate = async (
    rq: CreateProgramTemplate,
    signal?: AbortSignal,
): Promise<ProgramTemplate> => {
    const normalized = normalizeCreateProgramTemplate(rq);

    // временно включи, чтобы 100% убедиться, что inputs = array
    // console.log("createProgramTemplate payload:", JSON.stringify(normalized, null, 2));

    return (await api.put<ProgramTemplate>("/program-template", normalized, { signal })).data;
};

export const getProgramTemplates = async (
    rq: PageableRq,
    signal?: AbortSignal,
): Promise<PageableRs<ProgramTemplate>> =>
    (
        await api.get<PageableRs<ProgramTemplate>>(`/program-template${toQueryString(rq)}`, {
            signal,
        })
    ).data;

export const updateProgramTemplate = async (
    id: string,
    rq: UpdateProgramTemplate,
    signal?: AbortSignal,
): Promise<ProgramTemplate> =>
    (await api.patch<ProgramTemplate>(`/program-template/${id}`, rq, { signal })).data;

export const deleteProgramTemplate = async (id: string, signal?: AbortSignal): Promise<void> =>
    await api.delete(`/program-template/${id}`, { signal });

export const getProgramTemplate = async (id: string, signal?: AbortSignal): Promise<ProgramTemplate> =>
    (await api.get<ProgramTemplate>(`/program-template/${id}`, { signal })).data;

export const createProgram = async (rq: CreateProgram, signal?: AbortSignal): Promise<Program> =>
    (await api.put<Program>("/program", rq, { signal })).data;

export const updateProgram = async (id: string, rq: UpdateProgram, signal?: AbortSignal): Promise<ProgramTemplate> =>
    (await api.patch<Program>(`/program/${id}`, rq, { signal })).data;

export const deleteProgram = async (id: string, signal?: AbortSignal): Promise<void> =>
    await api.delete(`/program/${id}`, { signal });

export const getProgram = async (id: string, signal?: AbortSignal): Promise<Program> =>
    (await api.get<Program>(`/program/${id}`, { signal })).data;

export const getPrograms = async (rq: PageableRq, signal?: AbortSignal): Promise<PageableRs<Program>> =>
    (await api.get(`/program${toQueryString(rq)}`, { signal })).data;

export const getDictionarySchema = (dictId: string, signal?: AbortSignal): Promise<DictionarySchema> =>
    getDictionary(dictId, signal);

// rows справочника: UI хочет (dictId, rq), а API у тебя (rq, dictId)
export const getDictionaryRowsByDictId = (
    dictId: string,
    rq: PageableRq,
    signal?: AbortSignal,
): Promise<PageableRs<DictionaryRow>> => getDictionaryRows(rq, dictId, signal);

// program by id (если нужно)
export const getProgramById = (id: string, signal?: AbortSignal): Promise<Program> => getProgram(id, signal);