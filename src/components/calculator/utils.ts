// src/components/calculator/utils.ts
import type {
    CalculatorConfig,
    Dictionary,
    DictionaryItem,
    Visibility,
    VisibilityRule
} from "../../api/types";

export function getDictionary(config: CalculatorConfig, id?: string): Dictionary | undefined {
    if (!id) return undefined;
    return config.dictionaries.find((d) => d.id === id);
}

export function getDictItems(
    config: CalculatorConfig,
    dictId?: string,
    allowedRowIds?: string[]
): DictionaryItem[] {
    const dict = getDictionary(config, dictId);
    if (!dict) return [];
    if (!allowedRowIds?.length) return dict.items;

    const allowed = new Set(allowedRowIds);
    return dict.items.filter((i) => (i.rowId ? allowed.has(i.rowId) : true));
}

function evalRule(rule: VisibilityRule, values: Record<string, unknown>): boolean {
    const left = values[rule.field];

    switch (rule.op) {
        case "==":
            return left === rule.value;
        case "!=":
            return left !== rule.value;
        case "in":
            return Array.isArray(rule.value) ? rule.value.includes(left) : false;
        case "not_in":
            return Array.isArray(rule.value) ? !rule.value.includes(left) : true;
        default:
            return true;
    }
}

export function isVisible(visibility: Visibility | undefined, values: Record<string, unknown>): boolean {
    if (!visibility?.when?.length) return true;
    return visibility.when.every((r) => evalRule(r, values));
}

export function formatValue(value: unknown, format?: string): string {
    if (value === null || value === undefined) return "—";

    if (format === "money_rub") {
        const n = Number(value);
        if (Number.isNaN(n)) return String(value);
        return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(n);
    }

    if (format === "percent") {
        const n = Number(value);
        if (Number.isNaN(n)) return String(value);
        return `${n.toFixed(2)}%`;
    }

    return String(value);
}

export function getByPath(obj: any, path: string): unknown {
    // Supports "result.totalPremium" style
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}
