// src/components/calculator/buildPayload.ts
import type { CalculatorFormValues } from "./types";
import { calcAge360 } from "./utils/days360";

const CONST_ARGS = {
    beta_add: "0.15",
    iMax: "480",
    mortality_coeff: "0.30",
    uw_life: "1,5234375",
    has_ousv_zv: "0",
    b17: "0.018",
    exp_fix: "2518",
    aqc_exp_fix: "1529",
} as const;

function toStr(x: unknown): string {
    if (x === null || x === undefined) return "";
    return String(x);
}

function toNumStr(x: unknown): string {
    if (x === null || x === undefined || x === "") return "";
    const n = typeof x === "number" ? x : Number(String(x).replace(",", "."));
    return Number.isFinite(n) ? String(n) : "";
}

function genderToMF(x: unknown): "M" | "F" | "" {
    const v = toStr(x).toLowerCase();
    if (v === "male" || v === "m") return "M";
    if (v === "female" || v === "f") return "F";
    return "";
}

function boolStr(x: unknown) {
    return String(Boolean(x));
}

export function buildPayload(values: CalculatorFormValues) {

    return {
        args: {
            payment_order: toStr(values.periodichnost_uplaty_vznosov),
            payment_period: toNumStr(values.srok_uplaty_vznosov_let),
            product_type: toStr(values.programma),
            term: toNumStr(values.srok_deystviya_polisa_let),

            ...CONST_ARGS,

            age: String(calcAge360(toStr(values.strahovatel_birth))),
            gender: genderToMF(values.pol_strahovatelya),
            mode: toStr(values.tip_rascheta),
            ins_sum: toNumStr(values.strahovaya_summa),

            ex_death_flag: boolStr(values.ex_death_flag),
            ex_death_sum: toNumStr(values.ex_death_sum),

            ex_body_flag: boolStr(values.ex_body_flag),
            ex_body_sum: toNumStr(values.ex_body_sum),

            ex_trauma_2_flag: boolStr(values.ex_trauma_2_flag),
            ex_trauma_2_sum: toNumStr(values.ex_trauma_2_sum),

            ex_trauma_3_flag: boolStr(values.ex_trauma_3_flag),
            ex_trauma_3_sum: toNumStr(values.ex_trauma_3_sum),

        },
    };
}
