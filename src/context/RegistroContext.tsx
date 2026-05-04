import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { GoogleDriveRegistroRepository } from "../adapters/drive/GoogleDriveRegistroRepository";
import { RegistroUseCase } from "../domain/usecases/RegistroUseCase";

interface RegistroContextValue {
  useCase: RegistroUseCase | null;
}

const RegistroContext = createContext<RegistroContextValue>({ useCase: null });

interface Props {
  children: ReactNode;
  fileId?: string; 
}

export const RegistroProvider: React.FC<Props> = ({ children, fileId }) => {
  const useCase = useMemo(() => {
    if (!fileId) return null;
    
    const repository = new GoogleDriveRegistroRepository(fileId);
    return new RegistroUseCase(repository);
  }, [fileId]);

  return (
    <RegistroContext.Provider value={{ useCase }}>
      {children}
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