// src/App.tsx
import { gapi } from "gapi-script";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./components/MainPage";
import LandingPage from "./components/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import { RegistroProvider } from "./context/RegistroContext";


const App: React.FC = () => {
  

  return (
    <BrowserRouter>
      <AuthProvider>
        <RegistroProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<MainPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RegistroProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
