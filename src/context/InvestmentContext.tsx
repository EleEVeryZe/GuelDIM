import { createItemContext } from "./ItemContext";
import { ReactNode } from "react";
import { Investment } from "@/domain/entities/Investment";
import { InvestmentUseCase } from "@/domain/usecases/InvestmentUseCase";
import { GoogleDriveInvestmentRepository } from "@/adapters/drive/GoogleDriveInvestmentRepository";

export const {
  ItemProvider: InvestmentProvider,
  useItem: useInvestment,
} = createItemContext<Investment, InvestmentUseCase>();


export const InvestmentContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <InvestmentProvider
    createUseCase={async () => {
      return new InvestmentUseCase(await GoogleDriveInvestmentRepository.getInstance());
    }}
  >
    {children}
  </InvestmentProvider>
);