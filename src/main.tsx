import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import "admin-lte/dist/css/adminlte.min.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>,
)
