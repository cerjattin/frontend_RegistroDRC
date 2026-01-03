import { Routes, Route, Navigate } from "react-router-dom";
import  RegisterPage  from "./pages/RegisterPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import LeaderPanelPage from "./pages/LeaderPanelPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/registro" replace />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/gracias" element={<ThankYouPage />} />
      <Route path="/leader/panel" element={<LeaderPanelPage />} /> {/* 👈 nuevo */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
