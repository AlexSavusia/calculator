// src/components/calculator/utils/days360.ts
// US (NASD) метод DAYS360, чаще всего в Excel именно он по умолчанию
export function days360(start: Date, end: Date): number {
    let sd = start.getDate();
    let sm = start.getMonth() + 1;
    let sy = start.getFullYear();

    let ed = end.getDate();
    let em = end.getMonth() + 1;
    let ey = end.getFullYear();

    // если start день = 31 -> 30
    if (sd === 31) sd = 30;

    // если end день = 31 и start день (после правки) = 30 -> end = 30
    if (ed === 31 && sd === 30) ed = 30;

    return (ey - sy) * 360 + (em - sm) * 30 + (ed - sd);
}

export function calcAge360(birthISO: string, today = new Date()): number {
    if (!birthISO) return 0;
    const birth = new Date(birthISO);
    const d = days360(birth, today);
    return Math.floor(d / 360);
}
