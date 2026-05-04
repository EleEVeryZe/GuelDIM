// src/App.tsx
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./components/MainPage";
import LandingPage from "./components/LandingPage";
import { AuthProvider } from "./context/AuthContext";


const App: React.FC = () => {
  

  return (
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<MainPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
