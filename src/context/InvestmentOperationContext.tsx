import { createItemContext } from "./ItemContext";
import { ReactNode } from "react";
import { InvestmentOperation } from "@/domain/entities/Investment";
import { InvestmentOperationUseCase } from "@/domain/usecases/InvestmentOperationUseCase";
import { GoogleDriveInvestmentOperationRepository } from "@/adapters/drive/GoogleDriveInvestmentOperationRepository";

export const {
  ItemProvider: InvestmentOperationProvider,
  useItem: useInvestmentOperation,
} = createItemContext<InvestmentOperation, InvestmentOperationUseCase>();


export const InvestmentOperationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <InvestmentOperationProvider
    createUseCase={async () => {
      return new InvestmentOperationUseCase(await GoogleDriveInvestmentOperationRepository.getInstance());
    }}
  >
    {children}
  </InvestmentOperationProvider>
);