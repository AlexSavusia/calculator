import toast from "react-hot-toast";
import type { ApiError } from "../api/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function isApiError(e: unknown): e is ApiError {
    if (!isRecord(e)) return false;

    const hasTitle = typeof e.title === "string" || typeof (e as any).message === "string";
    const hasStatus = typeof e.status === "number" || typeof (e as any).statusCode === "number";

    return hasTitle || hasStatus;
}

function pickStatus(e: unknown): number | undefined {
    if (!isRecord(e)) return undefined;

    // поддержим разные варианты: status, statusCode, response.status (axios)
    const direct =
        typeof e.status === "number"
            ? e.status
            : typeof (e as any).statusCode === "number"
                ? (e as any).statusCode
                : undefined;

    if (direct != null) return direct;

    const resp = (e as any).response;
    if (isRecord(resp) && typeof resp.status === "number") return resp.status;

    return undefined;
}

function pickTitle(e: unknown, fallback: string): string {
    if (typeof e === "string") return e;
    if (e instanceof Error && e.message) return e.message;

    if (isRecord(e)) {
        if (typeof e.title === "string" && e.title.trim()) return e.title.trim();

        const msg = (e as any).message;
        if (typeof msg === "string" && msg.trim()) return msg.trim();

        // axios/fetch-подобные: response.data.title / response.data.message
        const resp = (e as any).response;
        if (isRecord(resp)) {
            const data = (resp as any).data;
            if (isRecord(data)) {
                const dt = (data as any).title;
                if (typeof dt === "string" && dt.trim()) return dt.trim();
                const dm = (data as any).message;
                if (typeof dm === "string" && dm.trim()) return dm.trim();
            }
        }
    }

    return fallback;
}

export function toastApiError(e: unknown, fallback = "Ошибка") {
    const title = pickTitle(e, fallback);
    const status = pickStatus(e);
    toast.error(status ? `${title} (HTTP ${status})` : title);
}

export function toastSuccess(msg: string) {
    toast.success(msg);
}
