import React, { createContext, ReactNode, useContext } from "react";
import { GoogleDriveRegistroRepository } from "../adapters/drive/GoogleDriveRegistroRepository";
import { RegistroUseCase } from "../domain/usecases/RegistroUseCase";

const registroUseCase = new RegistroUseCase(new GoogleDriveRegistroRepository());

interface RegistroContextValue {
  useCase: RegistroUseCase;
}

const RegistroContext = createContext<RegistroContextValue>({ useCase: registroUseCase });

export const RegistroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <RegistroContext.Provider value={{ useCase: registroUseCase }}>{children}</RegistroContext.Provider>;
};

export const useRegistro = (): RegistroContextValue => {
  return useContext(RegistroContext);
};
