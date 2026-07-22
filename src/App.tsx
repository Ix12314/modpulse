import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import ModDetail from "@/pages/ModDetail";

// HashRouter is used so client-side routing works on GitHub Pages without
// server-side rewrite rules (no 404 on refresh / deep links).
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mod/:id" element={<ModDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
