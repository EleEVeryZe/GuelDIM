import { Registro } from "@/interfaces/interfaces";
import { createItemContext } from "./ItemContext";
import { RegistroUseCase } from "@/domain/usecases/RegistroUseCase";
import { GoogleDriveRegistroRepository } from "@/adapters/drive/GoogleDriveRegistroRepository";
import { ReactNode } from "react";

export const {
  ItemProvider: RegistroProvider,
  useItem: useRegistro,
} = createItemContext<Registro, RegistroUseCase>();


export const RegistroContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RegistroProvider
    createUseCase={async () => {
      return new RegistroUseCase(await GoogleDriveRegistroRepository.getInstance());
    }}
  >
    {children}
  </RegistroProvider>
);