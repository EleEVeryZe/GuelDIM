// src/App.tsx
import { gapi } from "gapi-script";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./components/MainPage";
import LandingPage from "./components/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import { RegistroProvider } from "./context/RegistroContext";
import {
  API_KEY,
  CLIENT_ID,
  DISCOVERY_DOCS,
  SCOPES,
} from "./services/googleApi";

const App: React.FC = () => {
  const [gapiInitialized, setGapiInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(
          () => {
            console.log("GAPI client initialized.");
            setGapiInitialized(true);
          },
          (error) => {
            console.error("Error initializing GAPI client:", error);
          }
        );
    };

    gapi.load("client:auth2", initClient);
  }, []);

  if (!gapiInitialized) {
    return <div>Loading...</div>;
  }

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
