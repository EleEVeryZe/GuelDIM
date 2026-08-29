// src/App.tsx
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import EuAmoPdf from "./components/euAmoPdf/euAmoPdf";
import { AuthProvider } from "./context/AuthContext";
import LoginGueldim from "./components/login/loginGueldim";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={
          <AuthProvider>
            <LoginGueldim />
          </AuthProvider>
        } />
        <Route path="/euamopdf" element={<EuAmoPdf />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter >
  );
};

export default App;
