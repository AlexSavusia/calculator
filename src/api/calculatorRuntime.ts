// src/api/calculatorRuntime.ts
import type {
    CalculatorConfig,
    Dictionary,
    DictionaryItem,
    DictionarySchema,
    DictionaryRow,
    Program,
} from "./types";
import { getDictionaries, getDictionaryRows, getPrograms, getProgram } from "./index";

// Важно: положи skeleton в /public и fetch'и, либо импортом (если у тебя Vite и включён resolveJsonModule)
async function loadSkeleton(): Promise<CalculatorConfig> {
    const res = await fetch("/data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load /data.json: ${res.status}`);
    return res.json();
}

function mapRowsToItems(schema: DictionarySchema, rows: DictionaryRow[]): DictionaryItem[] {
    const codeFieldId = schema.schema.find((x) => x.name === "code")?.id ?? schema.schema[0]?.id;
    const nameFieldId = schema.schema.find((x) => x.name === "name")?.id ?? schema.schema[1]?.id;

    return rows.map((r) => {
        const code = codeFieldId ? String((r.data as any)[codeFieldId]?.value ?? "").trim() : r.id;
        const label = nameFieldId ? String((r.data as any)[nameFieldId]?.value ?? code) : code;
        return { rowId: r.id, code, label };
    });
}

async function loadAllRows(dictId: string, pageSize = 200): Promise<DictionaryRow[]> {
    let page = 1;
    let out: DictionaryRow[] = [];
    while (true) {
        const rs = await getDictionaryRows({ page, size: pageSize }, dictId);
        out = out.concat(rs.data);
        if (page * rs.size >= rs.total) break;
        page += 1;
    }
    return out;
}

function applyProgramAllowedRows(cfg: CalculatorConfig, program: Program): CalculatorConfig {
    const map = new Map(program.fields.map((f) => [f.code, f]));
    const next = structuredClone(cfg) as CalculatorConfig;

    const left = next.layout.columns.find((c: any) => c.id === "left") as any;
    for (const section of left?.sections ?? []) {
        for (const field of section.fields ?? []) {
            const backend = (field as any).backend;
            if (!backend?.fieldCode) continue;

            const pf: any = map.get(backend.fieldCode);
            if (pf?.type === "DICT_INPUT" && Array.isArray(pf.allowedRows) && pf.allowedRows.length) {
                field.constraints = { ...(field.constraints ?? {}), allowedRowIds: pf.allowedRows };
            }
        }
    }

    return next;
}

export async function buildCalculatorConfigFromApi(): Promise<CalculatorConfig> {
    const skeleton = await loadSkeleton();

    // 1) programs (типы расчёта)
    const programsRs = await getPrograms({ page: 1, size: 50 });
    const programs = programsRs.data;
    const defaultProgramId = programs[0]?.id;

    // 2) dictionary schemas list
    const dictSchemasRs = await getDictionaries({ page: 1, size: 300 });
    const dictSchemas = new Map(dictSchemasRs.data.map((d) => [d.id, d]));

    // 3) replace dictionaries.items for BACKEND_DICTIONARY sources
    const dictionaries: Dictionary[] = [];

    for (const dict of skeleton.dictionaries) {
        const src: any = (dict as any).source;
        if (src?.type === "BACKEND_DICTIONARY") {
            const dictId = String(src.dictId);
            const schema = dictSchemas.get(dictId);
            if (!schema) {
                // если схемы нет — оставим как есть, но лучше логнуть
                dictionaries.push(dict);
                continue;
            }

            const rows = await loadAllRows(dictId);
            dictionaries.push({
                ...dict,
                items: mapRowsToItems(schema, rows),
            });
        } else {
            dictionaries.push(dict);
        }
    }

    // 4) calc_type = programs
    const calcType = dictionaries.find((d) => d.id === "calc_type");
    const programItems: DictionaryItem[] = programs.map((p) => ({ code: p.id, label: p.name }));
    if (calcType) calcType.items = programItems;

    // 5) подтянем выбранный program, чтобы применить allowedRows (если есть)
    let cfg: CalculatorConfig = {
        ...skeleton,
        dictionaries,
        defaults: {
            ...(skeleton.defaults ?? {}),
            form: {
                ...(skeleton.defaults?.form ?? {}),
                programId: (skeleton.defaults?.form as any)?.programId ?? defaultProgramId,
            },
        },
    };

    const selectedProgramId = (cfg.defaults?.form as any)?.programId ?? defaultProgramId;
    if (selectedProgramId) {
        const prog = await getProgram(String(selectedProgramId));
        cfg = applyProgramAllowedRows(cfg, prog);

        // обновим backendModel.program (чтобы связь была консистентной)
        (cfg as any).backendModel = (cfg as any).backendModel ?? {};
        (cfg as any).backendModel.program = {
            id: prog.id,
            programTemplateId: prog.programTemplateId,
            name: prog.name,
        };
    }

    return cfg;
}
