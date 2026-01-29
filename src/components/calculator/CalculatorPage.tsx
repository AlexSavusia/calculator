// src/components/calculator/CalculatorPage.tsx
import { CalculatorForm } from "./CalculatorForm";
import { useProgram } from "./hooks/useProgram";

const PROGRAM_ID = "019c0bb7-e559-72b6-9beb-420443122afa";

export default function CalculatorPage() {
    const q = useProgram(PROGRAM_ID);

    if (q.isLoading) return <div style={{ padding: 24 }}>Загрузка программы…</div>;
    if (q.isError || !q.data) return <div style={{ padding: 24 }}>Ошибка загрузки программы</div>;

    return (
        <div style={{ padding: 24 }}>
            <CalculatorForm program={q.data} />
        </div>
    );
}
