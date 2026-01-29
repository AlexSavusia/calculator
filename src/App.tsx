import { Route, Routes, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";

import MainLayout from "./layout/MainLayout";
import PlainLayout from "./layout/PlainLayout";

import IndexPage from "./pages";
import CalculatorPage from "./pages/calculator";

function App() {
    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: "#fff",
                        color: "#111",
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        backdropFilter: "blur(6px)",
                    },
                }}
            />

            <Routes>
                {/* Страницы с сайдбаром */}
                <Route element={<MainLayout />}>
                    <Route index element={<IndexPage />} />
                    {/* другие обычные страницы сюда */}
                </Route>

                {/* Страницы без сайдбара */}
                <Route element={<PlainLayout />}>
                    <Route path="/calculator" element={<CalculatorPage />} />
                </Route>

                {/* Фоллбек */}
                <Route path="*" element={<Navigate to="/error" replace />} />
            </Routes>
        </>
    );
}

export default App;
