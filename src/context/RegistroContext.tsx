import React, { createContext, ReactNode, useContext } from "react";
import { GoogleDriveRegistroRepository } from "../adapters/drive/GoogleDriveRegistroRepository";
import { RegistroUseCase } from "../domain/usecases/RegistroUseCase";
import { LocalRegistroRepository } from "../adapters/drive/LocalRegistroRepository";

let registroUseCase: RegistroUseCase;
if (import.meta.env.VITE_USE_CLOUD_STORAGE === 'true')
  registroUseCase = new RegistroUseCase(new GoogleDriveRegistroRepository());
else
  registroUseCase = new RegistroUseCase(LocalRegistroRepository.getInstance());

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
