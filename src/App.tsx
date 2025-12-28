import { Routes, Route, Navigate } from "react-router-dom";
import  RegisterPage  from "./pages/RegisterPage";
import { ThankYouPage } from "./pages/ThankYouPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/gracias" element={<ThankYouPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
