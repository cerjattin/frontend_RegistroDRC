import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import LeaderPanelPage from "./pages/LeaderPanelPage";

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* Redirige "/" a "/registro" y conserva los parámetros si alguien usa "/" */}
      <Route
        path="/"
        element={<Navigate to={`/registro${location.search}`} replace />}
      />

      {/* Formulario público */}
      <Route path="/registro" element={<RegisterPage />} />

      {/* Gracias */}
      <Route path="/gracias" element={<ThankYouPage />} />

      {/* Panel de líder */}
      <Route path="/leader/panel" element={<LeaderPanelPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/registro" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
