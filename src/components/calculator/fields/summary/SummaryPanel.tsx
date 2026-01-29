// src/components/calculator/fields/summary/SummaryPanel.tsx
import type { CardConfig } from "../../../../api/types";
import SummaryCard from "./SummaryCard";

type Props = {
    title?: string;
    cards: CardConfig[];
    result: Record<string, unknown>;
};

export default function SummaryPanel({ title, cards, result }: Props) {
    return (
        <div style={{ display: "grid", gap: 14 }}>
            {title ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
                    <div style={{ opacity: 0.5 }}>⌃</div>
                </div>
            ) : null}

            {cards.map((c) => (
                <SummaryCard key={c.id} card={c} context={{ result }} />
            ))}
        </div>
    );
}
