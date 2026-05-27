import { ItemBaseUseCase } from "./ItemBaseUseCase";
import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { InvestmentOperation } from "../entities/Investment";

export class InvestmentOperationUseCase extends ItemBaseUseCase<InvestmentOperation> {
  constructor(readonly repository: ItemBaseRepository<InvestmentOperation>) {
    super(repository, null);
  }

  updateAllIdComum(idCommon: string, newValue: InvestmentOperation): Promise<void> {
    throw new Error("Method not implemented.");
  }
}