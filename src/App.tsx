import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import LeaderPanelPage from "./pages/LeaderPanelPage";

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* Si alguien entra a "/" (con o sin query), mándalo a /registrodrc conservando los parámetros */}
      <Route
        path="/"
        element={<Navigate to={`/registrodrc${location.search}`} replace />}
      />

      {/* Formulario público REAL */}
      <Route path="/registrodrc" element={<RegisterPage />} />

      {/* Página de gracias */}
      <Route path="/gracias" element={<ThankYouPage />} />

      {/* Panel de líder */}
      <Route path="/leader/panel" element={<LeaderPanelPage />} />

      {/* Cualquier otra cosa → al formulario (sin params) */}
      <Route path="*" element={<Navigate to="/registrodrc" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
