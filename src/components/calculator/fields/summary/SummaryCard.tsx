// src/components/calculator/fields/summary/SummaryCard.tsx
import type { CardConfig } from "../../../../api/types";
import { formatValue, getByPath } from "../../utils";

type Props = {
    card: CardConfig;
    context: Record<string, unknown>; // e.g. { result }
};

export default function SummaryCard({ card, context }: Props) {
    return (
        <div
            style={{
                padding: 16,
                borderRadius: 16,
                border: "1px solid #eef2f7",
                background: "white"
            }}
        >
            {card.title ? <div style={{ fontWeight: 800, marginBottom: 10 }}>{card.title}</div> : null}

            <div style={{ display: "grid", gap: 10 }}>
                {card.items.map((it) => {
                    const raw = getByPath(context, it.valueBinding);
                    const value = formatValue(raw, it.format);
                    return (
                        <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ opacity: 0.75 }}>{it.label}</div>
                            <div style={{ fontWeight: 800 }}>{value}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
