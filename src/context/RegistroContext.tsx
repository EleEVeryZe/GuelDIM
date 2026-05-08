import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { GoogleDriveRegistroRepository } from "../adapters/drive/GoogleDriveRegistroRepository";
import { RegistroUseCase } from "../domain/usecases/RegistroUseCase";
import { LocalRegistroRepository } from "../adapters/drive/LocalRegistroRepository";

interface RegistroContextValue {
  useCase: RegistroUseCase | null;
  isLoadingFile?: boolean
}

const RegistroContext = createContext<RegistroContextValue>({ useCase: null });

interface Props {
  children: ReactNode;
  fileId?: string;
}

export const RegistroProvider: React.FC<Props> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [useCase, setUseCase] = useState<RegistroUseCase>();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setLoading(true);
    try {
      if (import.meta.env.VITE_USE_CLOUD_STORAGE === 'true')
        setUseCase(new RegistroUseCase(await GoogleDriveRegistroRepository.getInstance()))
      else
        setUseCase(new RegistroUseCase(LocalRegistroRepository.getInstance()));
    } catch (error) {
      console.error("Error fetching or creating file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistroContext.Provider value={{ useCase, isLoadingFile: loading }}>
      {useCase && children}
    </RegistroContext.Provider>
  );
};

export const useRegistro = () => {
  const context = useContext(RegistroContext);
  if (!context) {
    throw new Error("useRegistro must be used within a RegistroProvider");
  }
  return context;
};